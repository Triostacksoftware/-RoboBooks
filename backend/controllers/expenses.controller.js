import * as Svc from "../services/expenses.service.js";
import { upload } from "../middlewares/upload.middleware.js";
import path from "path";
import fs from "fs";

// Create a new expense
export const createExpense = async (req, res, next) => {
  try {
    const expenseData = {
      ...req.body,
      createdBy: req.user.id,
      organization: req.user.organization,
    };

    const expense = await Svc.createExpense(expenseData);
    res.status(201).json({
      success: true,
      message: "Expense created successfully",
      data: expense,
    });
  } catch (err) {
    next(err);
  }
};

// Get all expenses with filtering and pagination
export const listExpenses = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 25,
      sortBy = "date",
      sortOrder = "desc",
      status,
      category,
      vendor,
      customer,
      project,
      startDate,
      endDate,
      search,
    } = req.query;

    const filters = {};

    if (status) filters.status = status;
    if (category) filters.category = category;
    if (vendor) filters.vendor = vendor;
    if (customer) filters.customer = customer;
    if (project) filters.project = project;

    if (startDate || endDate) {
      filters.date = {};
      if (startDate) filters.date.$gte = new Date(startDate);
      if (endDate) filters.date.$lte = new Date(endDate);
    }

    if (search) {
      filters.$or = [
        { notes: { $regex: search, $options: "i" } },
        { invoiceNumber: { $regex: search, $options: "i" } },
        { referenceNumber: { $regex: search, $options: "i" } },
      ];
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder,
      organization: req.user.organization,
    };

    const result = await Svc.getAllExpenses(filters, options);
    res.json({
      success: true,
      data: result.expenses,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
};

// Get expense by ID
export const getExpenseById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const expense = await Svc.getExpenseById(id, req.user.organization);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    res.json({
      success: true,
      data: expense,
    });
  } catch (err) {
    next(err);
  }
};

// Update expense
export const updateExpense = async (req, res, next) => {
  try {
    const { id } = req.params;
    const expense = await Svc.updateExpense(
      id,
      req.body,
      req.user.organization
    );

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    res.json({
      success: true,
      message: "Expense updated successfully",
      data: expense,
    });
  } catch (err) {
    next(err);
  }
};

// Delete expense
export const deleteExpense = async (req, res, next) => {
  try {
    const { id } = req.params;
    const expense = await Svc.deleteExpense(id, req.user.organization);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    res.json({
      success: true,
      message: "Expense deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

// Approve expense
export const approveExpense = async (req, res, next) => {
  try {
    const { id } = req.params;
    const expense = await Svc.approveExpense(
      id,
      req.user.id,
      req.user.organization
    );

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    res.json({
      success: true,
      message: "Expense approved successfully",
      data: expense,
    });
  } catch (err) {
    next(err);
  }
};

// Reject expense
export const rejectExpense = async (req, res, next) => {
  try {
    const { id } = req.params;
    const expense = await Svc.rejectExpense(id, req.user.organization);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    res.json({
      success: true,
      message: "Expense rejected successfully",
      data: expense,
    });
  } catch (err) {
    next(err);
  }
};

// Get expense statistics
export const getExpenseStats = async (req, res, next) => {
  try {
    const { startDate, endDate, category, vendor } = req.query;

    const filters = {};
    if (startDate || endDate) {
      filters.date = {};
      if (startDate) filters.date.$gte = new Date(startDate);
      if (endDate) filters.date.$lte = new Date(endDate);
    }
    if (category) filters.category = category;
    if (vendor) filters.vendor = vendor;

    const stats = await Svc.getExpenseStats(req.user.organization, filters);
    res.json({
      success: true,
      data: stats,
    });
  } catch (err) {
    next(err);
  }
};

// Get expenses by category
export const getExpensesByCategory = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const filters = {};
    if (startDate || endDate) {
      filters.date = {};
      if (startDate) filters.date.$gte = new Date(startDate);
      if (endDate) filters.date.$lte = new Date(endDate);
    }

    const categories = await Svc.getExpensesByCategory(
      req.user.organization,
      filters
    );
    res.json({
      success: true,
      data: categories,
    });
  } catch (err) {
    next(err);
  }
};

// Get expenses by vendor
export const getExpensesByVendor = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const filters = {};
    if (startDate || endDate) {
      filters.date = {};
      if (startDate) filters.date.$gte = new Date(startDate);
      if (endDate) filters.date.$lte = new Date(endDate);
    }

    const vendors = await Svc.getExpensesByVendor(
      req.user.organization,
      filters
    );
    res.json({
      success: true,
      data: vendors,
    });
  } catch (err) {
    next(err);
  }
};

// Bulk update expenses
export const bulkUpdateExpenses = async (req, res, next) => {
  try {
    const { ids, updateData } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Expense IDs are required",
      });
    }

    const result = await Svc.bulkUpdateExpenses(
      ids,
      updateData,
      req.user.organization
    );
    res.json({
      success: true,
      message: `${result.modifiedCount} expenses updated successfully`,
      data: { modifiedCount: result.modifiedCount },
    });
  } catch (err) {
    next(err);
  }
};

// Get recurring expenses
export const getRecurringExpenses = async (req, res, next) => {
  try {
    const expenses = await Svc.getRecurringExpenses(req.user.organization);
    res.json({
      success: true,
      data: expenses,
    });
  } catch (err) {
    next(err);
  }
};

// Upload receipt
export const uploadReceipt = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const receiptData = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
    };

    const expense = await Svc.getExpenseById(id, req.user.organization);
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    expense.receipts.push(receiptData);
    await expense.save();

    res.json({
      success: true,
      message: "Receipt uploaded successfully",
      data: receiptData,
    });
  } catch (err) {
    next(err);
  }
};

// Delete receipt
export const deleteReceipt = async (req, res, next) => {
  try {
    const { id, receiptId } = req.params;

    const expense = await Svc.getExpenseById(id, req.user.organization);
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    const receipt = expense.receipts.id(receiptId);
    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: "Receipt not found",
      });
    }

    // Delete file from filesystem
    const filePath = path.join(process.cwd(), receipt.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    receipt.remove();
    await expense.save();

    res.json({
      success: true,
      message: "Receipt deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};


