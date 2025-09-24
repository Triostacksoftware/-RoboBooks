import PurchaseOrder from "../models/purchaseOrder.model.js";
import mongoose from "mongoose";

// Create a new purchase order
export const createPurchaseOrder = async (data) => {
  const purchaseOrder = new PurchaseOrder(data);
  return await purchaseOrder.save();
};

// Get all purchase orders with filtering and pagination
export const getAllPurchaseOrders = async (filters = {}, options = {}) => {
  const {
    page = 1,
    limit = 25,
    sortBy = "date",
    sortOrder = "desc",
    organization,
  } = options;

  const query = { ...filters };
  if (organization) {
    query.organization = organization;
  }

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

  const purchaseOrders = await PurchaseOrder.find(query)
    .populate("vendor", "name email phone address")
    .populate("items.item", "name description")
    .populate("items.account", "name type")
    .populate("items.tax", "name rate")
    .populate("tax.taxId", "name rate")
    .populate("createdBy", "name email")
    .populate("convertedToBill", "billNumber")
    .sort(sort)
    .skip(skip)
    .limit(limit);

  const total = await PurchaseOrder.countDocuments(query);

  return {
    purchaseOrders,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

// Get purchase order by ID
export const getPurchaseOrderById = async (id, organization) => {
  const query = { _id: id };
  if (organization) {
    query.organization = organization;
  }

  return await PurchaseOrder.findOne(query)
    .populate("vendor", "name email phone address")
    .populate("items.item", "name description unit")
    .populate("items.account", "name type")
    .populate("items.tax", "name rate")
    .populate("tax.taxId", "name rate")
    .populate("createdBy", "name email")
    .populate("convertedToBill", "billNumber date");
};

// Update purchase order
export const updatePurchaseOrder = async (id, data, organization) => {
  const query = { _id: id };
  if (organization) {
    query.organization = organization;
  }

  return await PurchaseOrder.findOneAndUpdate(
    query,
    { ...data, updatedAt: new Date() },
    { new: true, runValidators: true }
  )
    .populate("vendor", "name email phone address")
    .populate("items.item", "name description")
    .populate("items.account", "name type")
    .populate("items.tax", "name rate")
    .populate("tax.taxId", "name rate")
    .populate("createdBy", "name email")
    .populate("convertedToBill", "billNumber");
};

// Delete purchase order
export const deletePurchaseOrder = async (id, organization) => {
  const query = { _id: id };
  if (organization) {
    query.organization = organization;
  }

  return await PurchaseOrder.findOneAndDelete(query);
};

// Update purchase order status
export const updatePurchaseOrderStatus = async (id, status, organization) => {
  const query = { _id: id };
  if (organization) {
    query.organization = organization;
  }

  const updateData = { status, updatedAt: new Date() };

  // Set specific timestamps based on status
  switch (status) {
    case "sent":
      updateData.sentAt = new Date();
      break;
    case "acknowledged":
      updateData.acknowledgedAt = new Date();
      break;
    case "received":
      updateData.receivedAt = new Date();
      break;
    case "closed":
      updateData.closedAt = new Date();
      break;
  }

  return await PurchaseOrder.findOneAndUpdate(query, updateData, {
    new: true,
    runValidators: true,
  })
    .populate("vendor", "name email phone address")
    .populate("items.item", "name description")
    .populate("items.account", "name type")
    .populate("items.tax", "name rate")
    .populate("tax.taxId", "name rate")
    .populate("createdBy", "name email")
    .populate("convertedToBill", "billNumber");
};

// Convert purchase order to bill
export const convertToBill = async (id, billId, organization) => {
  const query = { _id: id };
  if (organization) {
    query.organization = organization;
  }

  return await PurchaseOrder.findOneAndUpdate(
    query,
    {
      convertedToBill: billId,
      convertedAt: new Date(),
      status: "closed",
      closedAt: new Date(),
      updatedAt: new Date(),
    },
    { new: true, runValidators: true }
  )
    .populate("vendor", "name email phone address")
    .populate("items.item", "name description")
    .populate("items.account", "name type")
    .populate("items.tax", "name rate")
    .populate("tax.taxId", "name rate")
    .populate("createdBy", "name email")
    .populate("convertedToBill", "billNumber");
};

// Get purchase order statistics
export const getPurchaseOrderStats = async (organization, filters = {}) => {
  const query = { ...filters };
  if (organization) {
    query.organization = organization;
  }

  const stats = await PurchaseOrder.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$totalAmount" },
        totalOrders: { $sum: 1 },
        averageAmount: { $avg: "$totalAmount" },
        draftCount: {
          $sum: { $cond: [{ $eq: ["$status", "draft"] }, 1, 0] },
        },
        sentCount: {
          $sum: { $cond: [{ $eq: ["$status", "sent"] }, 1, 0] },
        },
        receivedCount: {
          $sum: { $cond: [{ $eq: ["$status", "received"] }, 1, 0] },
        },
        closedCount: {
          $sum: { $cond: [{ $eq: ["$status", "closed"] }, 1, 0] },
        },
      },
    },
  ]);

  return (
    stats[0] || {
      totalAmount: 0,
      totalOrders: 0,
      averageAmount: 0,
      draftCount: 0,
      sentCount: 0,
      receivedCount: 0,
      closedCount: 0,
    }
  );
};

// Get purchase orders by vendor
export const getPurchaseOrdersByVendor = async (organization, filters = {}) => {
  const query = { ...filters, vendor: { $exists: true, $ne: null } };
  if (organization) {
    query.organization = organization;
  }

  return await PurchaseOrder.aggregate([
    { $match: query },
    {
      $group: {
        _id: "$vendor",
        totalAmount: { $sum: "$totalAmount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { totalAmount: -1 } },
    { $limit: 10 },
  ]);
};

// Get pending purchase orders (sent but not received)
export const getPendingPurchaseOrders = async (organization) => {
  const query = {
    status: { $in: ["sent", "acknowledged", "partially_received"] },
  };
  if (organization) {
    query.organization = organization;
  }

  return await PurchaseOrder.find(query)
    .populate("vendor", "name email phone address")
    .populate("items.item", "name description")
    .populate("items.account", "name type")
    .sort({ deliveryDate: 1 });
};

// Bulk update purchase orders
export const bulkUpdatePurchaseOrders = async (
  ids,
  updateData,
  organization
) => {
  const query = { _id: { $in: ids } };
  if (organization) {
    query.organization = organization;
  }

  return await PurchaseOrder.updateMany(query, {
    ...updateData,
    updatedAt: new Date(),
  });
};

// Get purchase orders by date range
export const getPurchaseOrdersByDateRange = async (
  startDate,
  endDate,
  organization
) => {
  const query = {
    date: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
  };
  if (organization) {
    query.organization = organization;
  }

  return await PurchaseOrder.find(query)
    .populate("vendor", "name email")
    .populate("items.item", "name")
    .sort({ date: -1 });
};

