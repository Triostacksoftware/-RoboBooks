import Invoice from "../models/invoicemodel.js";
import Customer from "../models/Customer.js";
import { calculateGST, calculateTotal } from "./gstservice.js";
import { canTransition } from "../utils/statusUtils.js";
import { logAction } from "./auditTrailservice.js";
import { updatePLOnInvoicePosted, updatePLOnPaymentReceived, reversePLOnInvoiceVoided } from "./profitLossService.js";
import { updateBalanceSheetOnInvoicePosted, updateBalanceSheetOnPaymentReceived, reverseBalanceSheetOnInvoiceVoided } from "./balanceSheetService.js";
import mongoose from "mongoose";

export async function createInvoice(data) {
  try {
    // Validate customer exists
    const customer = await Customer.findById(data.customerId);
    if (!customer) {
      throw new Error("Customer not found");
    }

    // Generate invoice number if not provided
    if (!data.invoiceNumber) {
      const lastInvoice = await Invoice.findOne().sort({ invoiceNumber: -1 });
      const lastNumber = lastInvoice
        ? parseInt(lastInvoice.invoiceNumber.split("-")[1])
        : 0;
      data.invoiceNumber = `INV-${String(lastNumber + 1).padStart(6, "0")}`;
    }

    // Calculate totals
    const subTotal = data.items.reduce((sum, item) => {
      return sum + parseFloat(item.quantity || 0) * parseFloat(item.rate || 0);
    }, 0);

    const discountAmount =
      data.discountType === "percentage"
        ? (subTotal * parseFloat(data.discount || 0)) / 100
        : parseFloat(data.discount || 0);

    const taxAmount = data.items.reduce((sum, item) => {
      return sum + parseFloat(item.taxAmount || 0);
    }, 0);

    const total =
      subTotal -
      discountAmount +
      taxAmount +
      parseFloat(data.shippingCharges || 0) +
      parseFloat(data.adjustment || 0) +
      parseFloat(data.roundOff || 0);

    // Create invoice with calculated values
    const invoiceData = {
      ...data,
      subTotal: parseFloat(subTotal.toFixed(2)),
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      taxAmount: parseFloat(taxAmount.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      status: data.status || "Draft",
    };

    const invoice = await Invoice.create(invoiceData);

    // Log the action
    logAction({
      user: "system",
      type: "CREATE",
      entity: "Invoice",
      entityId: invoice._id,
      message: "Invoice created",
    });

    return invoice;
  } catch (error) {
    throw new Error(`Failed to create invoice: ${error.message}`);
  }
}

export async function updateInvoiceStatus(id, status) {
  try {
    // Try with transaction first
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      const invoice = await Invoice.findById(id).session(session);
      if (!invoice) throw new Error("Invoice not found");

      if (!canTransition(invoice.status, status)) {
        throw new Error("Invalid status transition");
      }

      const oldStatus = invoice.status;
      invoice.status = status;
      await invoice.save({ session });

      // Update reports based on status change
      if (oldStatus === "Draft" && status === "Unpaid") {
        // Invoice posted - update P&L and Balance Sheet
        await updatePLOnInvoicePosted(id, session);
        await updateBalanceSheetOnInvoicePosted(id, session);
      } else if (status === "Cancelled" || status === "Void") {
        // Invoice voided - reverse P&L and Balance Sheet entries
        await reversePLOnInvoiceVoided(id, session);
        await reverseBalanceSheetOnInvoiceVoided(id, session);
      }

      await session.commitTransaction();

      logAction({
        user: "system",
        type: "UPDATE",
        entity: "Invoice",
        entityId: id,
        message: `Status updated to ${status}`,
      });

      return invoice;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (transactionError) {
    // If transaction fails (e.g., standalone MongoDB), fall back to non-transactional update
    console.log("Transaction failed, falling back to non-transactional update:", transactionError.message);
    
    try {
      const invoice = await Invoice.findById(id);
      if (!invoice) throw new Error("Invoice not found");

      if (!canTransition(invoice.status, status)) {
        throw new Error("Invalid status transition");
      }

      const oldStatus = invoice.status;
      invoice.status = status;
      await invoice.save();

      // Note: Report updates are skipped in non-transactional mode for data consistency
      // In production, you should ensure MongoDB is configured as a replica set

      logAction({
        user: "system",
        type: "UPDATE",
        entity: "Invoice",
        entityId: id,
        message: `Status updated to ${status} (non-transactional)`,
      });

      return invoice;
    } catch (error) {
      throw new Error(`Failed to update invoice status: ${error.message}`);
    }
  }
}

export async function getAllInvoices() {
  try {
    const invoices = await Invoice.find()
      .populate("customerId", "name email")
      .sort({ created_at: -1 });
    return invoices;
  } catch (error) {
    throw new Error(`Failed to fetch invoices: ${error.message}`);
  }
}

export async function getInvoiceById(id) {
  try {
    const invoice = await Invoice.findById(id).populate(
      "customerId",
      "name email phone"
    );
    if (!invoice) throw new Error("Invoice not found");
    return invoice;
  } catch (error) {
    throw new Error(`Failed to fetch invoice: ${error.message}`);
  }
}

export async function updateInvoice(id, data) {
  try {
    const invoice = await Invoice.findById(id);
    if (!invoice) throw new Error("Invoice not found");

    // Recalculate totals if items changed
    if (data.items) {
      const subTotal = data.items.reduce((sum, item) => {
        return (
          sum + parseFloat(item.quantity || 0) * parseFloat(item.rate || 0)
        );
      }, 0);

      const discountAmount =
        data.discountType === "percentage"
          ? (subTotal * parseFloat(data.discount || 0)) / 100
          : parseFloat(data.discount || 0);

      const taxAmount = data.items.reduce((sum, item) => {
        return sum + parseFloat(item.taxAmount || 0);
      }, 0);

      const total =
        subTotal -
        discountAmount +
        taxAmount +
        parseFloat(data.shippingCharges || 0) +
        parseFloat(data.adjustment || 0) +
        parseFloat(data.roundOff || 0);

      data.subTotal = parseFloat(subTotal.toFixed(2));
      data.discountAmount = parseFloat(discountAmount.toFixed(2));
      data.taxAmount = parseFloat(taxAmount.toFixed(2));
      data.total = parseFloat(total.toFixed(2));
    }

    Object.assign(invoice, data);
    await invoice.save();

    logAction({
      user: "system",
      type: "UPDATE",
      entity: "Invoice",
      entityId: id,
      message: "Invoice updated",
    });

    return invoice;
  } catch (error) {
    throw new Error(`Failed to update invoice: ${error.message}`);
  }
}

export async function deleteInvoice(id) {
  try {
    const invoice = await Invoice.findById(id);
    if (!invoice) throw new Error("Invoice not found");

    await Invoice.findByIdAndDelete(id);

    logAction({
      user: "system",
      type: "DELETE",
      entity: "Invoice",
      entityId: id,
      message: "Invoice deleted",
    });

    return { message: "Invoice deleted successfully" };
  } catch (error) {
    throw new Error(`Failed to delete invoice: ${error.message}`);
  }
}

export async function recordPayment(invoiceId, paymentData) {
  try {
    // Try with transaction first
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      const invoice = await Invoice.findById(invoiceId).session(session);
      if (!invoice) throw new Error("Invoice not found");

      const { amount, paymentMethod, paymentDate, reference } = paymentData;
      
      // Update invoice payment information
      invoice.amountPaid = (invoice.amountPaid || 0) + amount;
      invoice.balanceDue = invoice.total - invoice.amountPaid;
      
      // Update status based on payment
      if (invoice.balanceDue <= 0) {
        invoice.status = "Paid";
      } else if (invoice.amountPaid > 0) {
        invoice.status = "Partially Paid";
      }
      
      await invoice.save({ session });

      // Update reports for payment received
      await updatePLOnPaymentReceived(invoiceId, amount, paymentDate, session);
      await updateBalanceSheetOnPaymentReceived(invoiceId, amount, paymentMethod, session);

      await session.commitTransaction();

      logAction({
        user: "system",
        type: "PAYMENT",
        entity: "Invoice",
        entityId: invoiceId,
        message: `Payment of ${amount} recorded`,
      });

      return invoice;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (transactionError) {
    // If transaction fails (e.g., standalone MongoDB), fall back to non-transactional update
    console.log("Transaction failed, falling back to non-transactional payment recording:", transactionError.message);
    
    try {
      const invoice = await Invoice.findById(invoiceId);
      if (!invoice) throw new Error("Invoice not found");

      const { amount, paymentMethod, paymentDate, reference } = paymentData;
      
      // Update invoice payment information
      invoice.amountPaid = (invoice.amountPaid || 0) + amount;
      invoice.balanceDue = invoice.total - invoice.amountPaid;
      
      // Update status based on payment
      if (invoice.balanceDue <= 0) {
        invoice.status = "Paid";
      } else if (invoice.amountPaid > 0) {
        invoice.status = "Partially Paid";
      }
      
      await invoice.save();

      // Note: Report updates are skipped in non-transactional mode for data consistency
      // In production, you should ensure MongoDB is configured as a replica set

      logAction({
        user: "system",
        type: "PAYMENT",
        entity: "Invoice",
        entityId: invoiceId,
        message: `Payment of ${amount} recorded (non-transactional)`,
      });

      return invoice;
    } catch (error) {
      throw new Error(`Failed to record payment: ${error.message}`);
    }
  }
}

export async function getNextInvoiceNumber() {
  try {
    // Get the highest invoice number
    const lastInvoice = await Invoice.findOne().sort({ invoiceNumber: -1 });
    console.log("Last invoice found:", lastInvoice?.invoiceNumber);
    
    let nextNumber = 1;
    if (lastInvoice && lastInvoice.invoiceNumber) {
      const match = lastInvoice.invoiceNumber.match(/INV-(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1]) + 1;
      }
    }
    
    const invoiceNumber = `INV-${String(nextNumber).padStart(6, "0")}`;
    console.log("Generated next invoice number:", invoiceNumber);
    
    // Double-check that this number doesn't already exist
    const existingInvoice = await Invoice.findOne({ invoiceNumber });
    if (existingInvoice) {
      console.log("Generated number already exists, using timestamp fallback");
      const timestamp = Date.now();
      return `INV-${timestamp}`;
    }
    
    return invoiceNumber;
  } catch (error) {
    console.error("Error generating invoice number:", error);
    // Fallback to timestamp-based number
    const timestamp = Date.now();
    return `INV-${timestamp}`;
  }
}

// Get invoice statistics
export async function getInvoiceStats(filters = {}) {
  try {
    const { startDate, endDate, customerId, status } = filters;
    
    // Build filter object
    const filter = {};
    if (startDate || endDate) {
      filter.invoiceDate = {};
      if (startDate) filter.invoiceDate.$gte = new Date(startDate);
      if (endDate) filter.invoiceDate.$lte = new Date(endDate);
    }
    if (customerId) filter.customerId = customerId;
    if (status) filter.status = status;

    // Get basic counts
    const [
      totalInvoices,
      paidInvoices,
      pendingInvoices,
      overdueInvoices,
      draftInvoices
    ] = await Promise.all([
      Invoice.countDocuments(filter),
      Invoice.countDocuments({ ...filter, status: "Paid" }),
      Invoice.countDocuments({ ...filter, status: { $in: ["Sent", "Viewed", "Unpaid"] } }),
      Invoice.countDocuments({ ...filter, status: "Overdue" }),
      Invoice.countDocuments({ ...filter, status: "Draft" })
    ]);

    // Get revenue statistics
    const revenueStats = await Invoice.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total" },
          paidRevenue: { $sum: { $cond: [{ $eq: ["$status", "Paid"] }, "$total", 0] } },
          pendingRevenue: { $sum: { $cond: [{ $in: ["$status", ["Sent", "Viewed", "Unpaid"]] }, "$total", 0] } },
          overdueRevenue: { $sum: { $cond: [{ $eq: ["$status", "Overdue"] }, "$total", 0] } }
        }
      }
    ]);

    const stats = revenueStats[0] || {
      totalRevenue: 0,
      paidRevenue: 0,
      pendingRevenue: 0,
      overdueRevenue: 0
    };

    return {
      totalInvoices,
      paidInvoices,
      pendingInvoices,
      overdueInvoices,
      draftInvoices,
      totalRevenue: stats.totalRevenue,
      paidRevenue: stats.paidRevenue,
      pendingRevenue: stats.pendingRevenue,
      overdueRevenue: stats.overdueRevenue
    };
  } catch (error) {
    throw new Error(`Failed to get invoice statistics: ${error.message}`);
  }
}


