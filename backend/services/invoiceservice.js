import Invoice from "../models/invoicemodel.js";
import Customer from "../models/Customer.js";
import { calculateGST, calculateTotal } from "./gstservice.js";
import { canTransition } from "../utils/statusUtils.js";
import { logAction } from "./auditTrailservice.js";

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
      const lastNumber = lastInvoice ? parseInt(lastInvoice.invoiceNumber.split('-')[1]) : 0;
      data.invoiceNumber = `INV-${String(lastNumber + 1).padStart(6, '0')}`;
    }

    // Calculate totals
    const subTotal = data.items.reduce((sum, item) => {
      return sum + (parseFloat(item.quantity) * parseFloat(item.rate));
    }, 0);

    const discountAmount = (subTotal * parseFloat(data.discount || 0)) / 100;
    const total = subTotal - discountAmount + parseFloat(data.adjustment || 0);

    // Create invoice with calculated values
    const invoiceData = {
      ...data,
      subTotal: subTotal.toFixed(2),
      discountAmount: discountAmount.toFixed(2),
      total: total.toFixed(2),
      status: 'Draft'
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
    const invoice = await Invoice.findById(id);
    if (!invoice) throw new Error("Invoice not found");
    
    if (!canTransition(invoice.status, status)) {
      throw new Error("Invalid status transition");
    }
    
    invoice.status = status;
    await invoice.save();
    
    logAction({
      user: "system",
      type: "UPDATE",
      entity: "Invoice",
      entityId: id,
      message: `Status updated to ${status}`,
    });
    
    return invoice;
  } catch (error) {
    throw new Error(`Failed to update invoice status: ${error.message}`);
  }
}

export async function getAllInvoices() {
  try {
    const invoices = await Invoice.find()
      .populate('customerId', 'name email')
      .sort({ created_at: -1 });
    return invoices;
  } catch (error) {
    throw new Error(`Failed to fetch invoices: ${error.message}`);
  }
}

export async function getInvoiceById(id) {
  try {
    const invoice = await Invoice.findById(id)
      .populate('customerId', 'name email phone');
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
        return sum + (parseFloat(item.quantity) * parseFloat(item.rate));
      }, 0);

      const discountAmount = (subTotal * parseFloat(data.discount || 0)) / 100;
      const total = subTotal - discountAmount + parseFloat(data.adjustment || 0);

      data.subTotal = subTotal.toFixed(2);
      data.discountAmount = discountAmount.toFixed(2);
      data.total = total.toFixed(2);
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
