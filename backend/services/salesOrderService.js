import SalesOrder from "../models/salesOrderModel.js";
import Customer from "../models/Customer.js";
import { calculateGST, calculateTotal } from "./gstservice.js";
import { canTransition } from "../utils/statusUtils.js";
import { logAction } from "./auditTrailservice.js";

export async function createSalesOrder(data) {
  try {
    // Validate customer exists
    const customer = await Customer.findById(data.customerId);
    if (!customer) {
      throw new Error("Customer not found");
    }

    // Generate sales order number if not provided
    if (!data.salesOrderNumber) {
      const lastSalesOrder = await SalesOrder.findOne().sort({
        salesOrderNumber: -1,
      });
      const lastNumber = lastSalesOrder
        ? parseInt(lastSalesOrder.salesOrderNumber.split("-")[1])
        : 0;
      data.salesOrderNumber = `SO-${String(lastNumber + 1).padStart(6, "0")}`;
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
      parseFloat(data.shippingCost || 0) +
      parseFloat(data.adjustment || 0) +
      parseFloat(data.roundOff || 0);

    // Create sales order with calculated values
    const salesOrderData = {
      ...data,
      subTotal: parseFloat(subTotal.toFixed(2)),
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      taxAmount: parseFloat(taxAmount.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      status: data.status || "Draft",
    };

    const salesOrder = await SalesOrder.create(salesOrderData);

    // Log the action
    logAction({
      user: "system",
      type: "CREATE",
      entity: "SalesOrder",
      entityId: salesOrder._id,
      message: "Sales order created",
    });

    return salesOrder;
  } catch (error) {
    throw new Error(`Failed to create sales order: ${error.message}`);
  }
}

export async function updateSalesOrderStatus(id, status) {
  try {
    const salesOrder = await SalesOrder.findById(id);
    if (!salesOrder) throw new Error("Sales order not found");

    if (!canTransition(salesOrder.status, status)) {
      throw new Error("Invalid status transition");
    }

    salesOrder.status = status;

    // Update status timestamps
    switch (status) {
      case "Sent":
        salesOrder.sentAt = new Date();
        break;
      case "Viewed":
        salesOrder.viewedAt = new Date();
        break;
      case "Confirmed":
        salesOrder.confirmedAt = new Date();
        break;
      case "Shipped":
        salesOrder.shippedAt = new Date();
        break;
      case "Delivered":
        salesOrder.deliveredAt = new Date();
        break;
    }

    await salesOrder.save();

    logAction({
      user: "system",
      type: "UPDATE",
      entity: "SalesOrder",
      entityId: id,
      message: `Status updated to ${status}`,
    });

    return salesOrder;
  } catch (error) {
    throw new Error(`Failed to update sales order status: ${error.message}`);
  }
}

export async function getAllSalesOrders() {
  try {
    const salesOrders = await SalesOrder.find()
      .populate("customerId", "firstName lastName email phone company")
      .sort({ createdAt: -1 });
    return salesOrders;
  } catch (error) {
    throw new Error(`Failed to get sales orders: ${error.message}`);
  }
}

export async function getSalesOrderById(id) {
  try {
    const salesOrder = await SalesOrder.findById(id)
      .populate("customerId", "firstName lastName email phone company address")
      .populate("additionalTaxId");

    if (!salesOrder) {
      throw new Error("Sales order not found");
    }

    return salesOrder;
  } catch (error) {
    throw new Error(`Failed to get sales order: ${error.message}`);
  }
}

export async function updateSalesOrder(id, data) {
  try {
    const salesOrder = await SalesOrder.findById(id);
    if (!salesOrder) {
      throw new Error("Sales order not found");
    }

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
        parseFloat(data.shippingCost || 0) +
        parseFloat(data.adjustment || 0) +
        parseFloat(data.roundOff || 0);

      data.subTotal = parseFloat(subTotal.toFixed(2));
      data.discountAmount = parseFloat(discountAmount.toFixed(2));
      data.taxAmount = parseFloat(taxAmount.toFixed(2));
      data.total = parseFloat(total.toFixed(2));
    }

    const updatedSalesOrder = await SalesOrder.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true }
    ).populate("customerId", "firstName lastName email phone company");

    logAction({
      user: "system",
      type: "UPDATE",
      entity: "SalesOrder",
      entityId: id,
      message: "Sales order updated",
    });

    return updatedSalesOrder;
  } catch (error) {
    throw new Error(`Failed to update sales order: ${error.message}`);
  }
}

export async function deleteSalesOrder(id) {
  try {
    const salesOrder = await SalesOrder.findByIdAndDelete(id);
    if (!salesOrder) {
      throw new Error("Sales order not found");
    }

    logAction({
      user: "system",
      type: "DELETE",
      entity: "SalesOrder",
      entityId: id,
      message: "Sales order deleted",
    });

    return { message: "Sales order deleted successfully" };
  } catch (error) {
    throw new Error(`Failed to delete sales order: ${error.message}`);
  }
}

export async function getNextSalesOrderNumber() {
  try {
    const lastSalesOrder = await SalesOrder.findOne().sort({
      salesOrderNumber: -1,
    });
    const lastNumber = lastSalesOrder
      ? parseInt(lastSalesOrder.salesOrderNumber.split("-")[1])
      : 0;
    const nextNumber = `SO-${String(lastNumber + 1).padStart(6, "0")}`;
    return { nextNumber };
  } catch (error) {
    throw new Error(`Failed to get next sales order number: ${error.message}`);
  }
}

export async function sendSalesOrderEmail(id, emailData) {
  try {
    const salesOrder = await SalesOrder.findById(id).populate(
      "customerId",
      "firstName lastName email"
    );

    if (!salesOrder) {
      throw new Error("Sales order not found");
    }

    // Update status to sent
    salesOrder.status = "Sent";
    salesOrder.sentAt = new Date();
    await salesOrder.save();

    // Here you would implement the actual email sending logic
    // For now, we'll just log the action
    logAction({
      user: "system",
      type: "EMAIL",
      entity: "SalesOrder",
      entityId: id,
      message: `Sales order email sent to ${salesOrder.customerId.email}`,
    });

    return { message: "Sales order email sent successfully" };
  } catch (error) {
    throw new Error(`Failed to send sales order email: ${error.message}`);
  }
}
