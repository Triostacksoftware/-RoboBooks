import Expense from "../models/expense.model.js";
import mongoose from "mongoose";

// Create a new expense
export const createExpense = async (data) => {
  const expense = new Expense(data);
  return await expense.save();
};

// Get all expenses with filtering and pagination
export const getAllExpenses = async (filters = {}, options = {}) => {
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

  const expenses = await Expense.find(query)
    .populate("expenseAccount", "name type")
    .populate("paidThrough", "name type")
    .populate("vendor", "name email")
    .populate("customer", "name email")
    .populate("project", "name")
    .populate("createdBy", "name email")
    .populate("approvedBy", "name email")
    .sort(sort)
    .skip(skip)
    .limit(limit);

  const total = await Expense.countDocuments(query);

  return {
    expenses,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

// Get expense by ID
export const getExpenseById = async (id, organization) => {
  const query = { _id: id };
  if (organization) {
    query.organization = organization;
  }

  return await Expense.findOne(query)
    .populate("expenseAccount", "name type")
    .populate("paidThrough", "name type")
    .populate("vendor", "name email phone address")
    .populate("customer", "name email phone address")
    .populate("project", "name description")
    .populate("createdBy", "name email")
    .populate("approvedBy", "name email");
};

// Update expense
export const updateExpense = async (id, data, organization) => {
  const query = { _id: id };
  if (organization) {
    query.organization = organization;
  }

  return await Expense.findOneAndUpdate(
    query,
    { ...data, updatedAt: new Date() },
    { new: true, runValidators: true }
  )
    .populate("expenseAccount", "name type")
    .populate("paidThrough", "name type")
    .populate("vendor", "name email")
    .populate("customer", "name email")
    .populate("project", "name")
    .populate("createdBy", "name email")
    .populate("approvedBy", "name email");
};

// Delete expense
export const deleteExpense = async (id, organization) => {
  const query = { _id: id };
  if (organization) {
    query.organization = organization;
  }

  return await Expense.findOneAndDelete(query);
};

// Approve expense
export const approveExpense = async (id, approvedBy, organization) => {
  const query = { _id: id };
  if (organization) {
    query.organization = organization;
  }

  return await Expense.findOneAndUpdate(
    query,
    {
      status: "approved",
      approvedBy,
      approvedAt: new Date(),
      updatedAt: new Date(),
    },
    { new: true, runValidators: true }
  )
    .populate("expenseAccount", "name type")
    .populate("paidThrough", "name type")
    .populate("vendor", "name email")
    .populate("customer", "name email")
    .populate("project", "name")
    .populate("createdBy", "name email")
    .populate("approvedBy", "name email");
};

// Reject expense
export const rejectExpense = async (id, organization) => {
  const query = { _id: id };
  if (organization) {
    query.organization = organization;
  }

  return await Expense.findOneAndUpdate(
    query,
    {
      status: "rejected",
      updatedAt: new Date(),
    },
    { new: true, runValidators: true }
  )
    .populate("expenseAccount", "name type")
    .populate("paidThrough", "name type")
    .populate("vendor", "name email")
    .populate("customer", "name email")
    .populate("project", "name")
    .populate("createdBy", "name email")
    .populate("approvedBy", "name email");
};

// Get expense statistics
export const getExpenseStats = async (organization, filters = {}) => {
  const query = { ...filters };
  if (organization) {
    query.organization = organization;
  }

  const stats = await Expense.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$amount" },
        totalTax: { $sum: "$taxAmount" },
        totalExpenses: { $sum: 1 },
        averageAmount: { $avg: "$amount" },
        pendingCount: {
          $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
        },
        approvedCount: {
          $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
        },
        rejectedCount: {
          $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] },
        },
      },
    },
  ]);

  return (
    stats[0] || {
      totalAmount: 0,
      totalTax: 0,
      totalExpenses: 0,
      averageAmount: 0,
      pendingCount: 0,
      approvedCount: 0,
      rejectedCount: 0,
    }
  );
};

// Get expenses by category
export const getExpensesByCategory = async (organization, filters = {}) => {
  const query = { ...filters };
  if (organization) {
    query.organization = organization;
  }

  return await Expense.aggregate([
    { $match: query },
    {
      $group: {
        _id: "$category",
        totalAmount: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { totalAmount: -1 } },
  ]);
};

// Get expenses by vendor
export const getExpensesByVendor = async (organization, filters = {}) => {
  const query = { ...filters, vendor: { $exists: true, $ne: null } };
  if (organization) {
    query.organization = organization;
  }

  return await Expense.aggregate([
    { $match: query },
    {
      $group: {
        _id: "$vendor",
        totalAmount: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { totalAmount: -1 } },
    { $limit: 10 },
  ]);
};

// Bulk update expenses
export const bulkUpdateExpenses = async (ids, updateData, organization) => {
  const query = { _id: { $in: ids } };
  if (organization) {
    query.organization = organization;
  }

  return await Expense.updateMany(query, {
    ...updateData,
    updatedAt: new Date(),
  });
};

// Get recurring expenses
export const getRecurringExpenses = async (organization) => {
  const query = { isRecurring: true };
  if (organization) {
    query.organization = organization;
  }

  return await Expense.find(query)
    .populate("expenseAccount", "name type")
    .populate("paidThrough", "name type")
    .populate("vendor", "name email")
    .populate("customer", "name email")
    .populate("project", "name")
    .sort({ createdAt: -1 });
};
