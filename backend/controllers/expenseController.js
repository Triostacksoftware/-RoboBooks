import Expense from '../models/Expense.js';
import { validationResult } from 'express-validator';
import path from 'path';
import fs from 'fs';

// Get all expenses
export const getExpenses = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 25,
      sortBy = 'date',
      sortOrder = 'desc',
      status,
      vendor,
      account,
      billable,
      hasReceipt,
      startDate,
      endDate,
      search
    } = req.query;

    const organizationId = req.user.organization || 'default';

    // Build filter object
    const filters = { isDeleted: false };

    if (status && status !== 'All') {
      filters.status = status.toLowerCase();
    }

    if (vendor) {
      filters.vendor = new RegExp(vendor, 'i');
    }

    if (account) {
      filters.account = new RegExp(account, 'i');
    }

    if (billable !== undefined) {
      filters.billable = billable === 'true';
    }

    if (hasReceipt !== undefined) {
      filters.hasReceipt = hasReceipt === 'true';
    }

    if (startDate && endDate) {
      filters.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (search) {
      filters.$or = [
        { description: new RegExp(search, 'i') },
        { vendor: new RegExp(search, 'i') },
        { account: new RegExp(search, 'i') },
        { reference: new RegExp(search, 'i') }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query
    const expenses = await Expense.find(filters)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('customer', 'name')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Expense.countDocuments(filters);

    res.json({
      success: true,
      data: expenses,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expenses',
      error: error.message
    });
  }
};

// Get expense by ID
export const getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organization || 'default';

    const expense = await Expense.findOne({
      _id: id,
      organization: organizationId,
      isDeleted: false
    })
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('customer', 'name')
      .populate('invoiceId', 'invoiceNumber');

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    res.json({
      success: true,
      data: expense
    });
  } catch (error) {
    console.error('Error fetching expense:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expense',
      error: error.message
    });
  }
};

// Create new expense
export const createExpense = async (req, res) => {
  try {
    console.log('💾 Backend: Creating expense');
    console.log('💾 Backend: Request body:', req.body);
    console.log('💾 Backend: User:', req.user);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Backend: Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const expenseData = {
      ...req.body,
      createdBy: req.user.id,
      organization: req.user.organization
    };

    console.log('💾 Backend: Final expense data:', expenseData);

    const expense = new Expense(expenseData);
    await expense.save();

    console.log('✅ Backend: Expense saved successfully:', expense._id);

    await expense.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      data: expense,
      message: 'Expense created successfully'
    });
  } catch (error) {
    console.error('❌ Backend: Error creating expense:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create expense',
      error: error.message
    });
  }
};

// Update expense
export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organization || 'default';

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const expense = await Expense.findOne({
      _id: id,
      organization: organizationId,
      isDeleted: false
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        expense[key] = req.body[key];
      }
    });

    expense.updatedBy = req.user.id;
    await expense.save();

    await expense.populate('createdBy', 'name email');
    await expense.populate('updatedBy', 'name email');

    res.json({
      success: true,
      data: expense,
      message: 'Expense updated successfully'
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update expense',
      error: error.message
    });
  }
};

// Delete expense (soft delete)
export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organization || 'default';

    const expense = await Expense.findOne({
      _id: id,
      organization: organizationId,
      isDeleted: false
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Soft delete
    expense.isDeleted = true;
    expense.deletedAt = new Date();
    expense.deletedBy = req.user.id;
    await expense.save();

    res.json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete expense',
      error: error.message
    });
  }
};

// Get expense statistics
export const getExpenseStats = async (req, res) => {
  try {
    const organizationId = req.user.organization || 'default';
    const { startDate, endDate } = req.query;

    let filters = {};
    if (startDate && endDate) {
      filters.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const stats = await Expense.getExpenseStats(organizationId, filters);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching expense stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expense statistics',
      error: error.message
    });
  }
};

// Convert expense to invoice
export const convertToInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organization || 'default';

    const expense = await Expense.findOne({
      _id: id,
      organization: organizationId,
      isDeleted: false
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    if (!expense.billable) {
      return res.status(400).json({
        success: false,
        message: 'Only billable expenses can be converted to invoices'
      });
    }

    if (expense.status === 'invoiced') {
      return res.status(400).json({
        success: false,
        message: 'Expense is already converted to invoice'
      });
    }

    // Convert to invoice
    await expense.convertToInvoice();

    res.json({
      success: true,
      data: expense,
      message: 'Expense converted to invoice successfully'
    });
  } catch (error) {
    console.error('Error converting expense to invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to convert expense to invoice',
      error: error.message
    });
  }
};

// Mark expense as reimbursed
export const markAsReimbursed = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organization || 'default';

    const expense = await Expense.findOne({
      _id: id,
      organization: organizationId,
      isDeleted: false
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    await expense.markAsReimbursed();

    res.json({
      success: true,
      data: expense,
      message: 'Expense marked as reimbursed successfully'
    });
  } catch (error) {
    console.error('Error marking expense as reimbursed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark expense as reimbursed',
      error: error.message
    });
  }
};

// Import expenses from CSV
export const importExpenses = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const csv = require('csv-parser');
    const results = [];

    // Parse CSV file
    await new Promise((resolve, reject) => {
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', resolve)
        .on('error', reject);
    });

    // Process and validate data
    const expenses = [];
    const errors = [];

    for (let i = 0; i < results.length; i++) {
      const row = results[i];
      try {
        const expenseData = {
          date: new Date(row.Date),
          description: row.Description,
          amount: parseFloat(row.Amount),
          vendor: row.Vendor,
          account: row.Account,
          category: row.Category || 'Other',
          paymentMethod: row['Payment Method'] || 'Cash',
          reference: row.Reference || `REF-₹{Date.now()}-₹{i}`,
          notes: row.Notes || '',
          billable: row.Billable === 'Yes' || row.Billable === 'true',
          customer: row.Customer || '',
          project: row.Project || '',
          hasReceipt: row['Has Receipt'] === 'Yes' || row['Has Receipt'] === 'true',
          createdBy: req.user.id,
          organization: req.user.organization
        };

        // Validate required fields
        if (!expenseData.description || !expenseData.amount || !expenseData.vendor || !expenseData.account) {
          errors.push(`Row ₹{i + 1}: Missing required fields`);
          continue;
        }

        expenses.push(expenseData);
      } catch (error) {
        errors.push(`Row ₹{i + 1}: ₹{error.message}`);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors found',
        errors
      });
    }

    // Insert expenses
    const createdExpenses = await Expense.insertMany(expenses);

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      data: createdExpenses,
      message: `₹{createdExpenses.length} expenses imported successfully`
    });
  } catch (error) {
    console.error('Error importing expenses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to import expenses',
      error: error.message
    });
  }
};

// Export expenses to CSV
export const exportExpenses = async (req, res) => {
  try {
    const organizationId = req.user.organization || 'default';
    const { startDate, endDate, status, billable } = req.query;

    // Build filter
    const filters = { organization: organizationId, isDeleted: false };

    if (startDate && endDate) {
      filters.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (status && status !== 'All') {
      filters.status = status.toLowerCase();
    }

    if (billable !== undefined) {
      filters.billable = billable === 'true';
    }

    const expenses = await Expense.find(filters)
      .populate('customer', 'name')
      .sort({ date: -1 });

    // Convert to CSV
    const csv = require('csv-writer').createObjectCsvWriter;

    const filename = `expenses_₹{new Date().toISOString().split('T')[0]}.csv`;
    const filepath = path.join(__dirname, '../uploads', filename);

    // Ensure uploads directory exists
    const uploadsDir = path.dirname(filepath);
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const csvWriter = csv({
      path: filepath,
      header: [
        { id: 'date', title: 'Date' },
        { id: 'description', title: 'Description' },
        { id: 'amount', title: 'Amount' },
        { id: 'vendor', title: 'Vendor' },
        { id: 'account', title: 'Account' },
        { id: 'category', title: 'Category' },
        { id: 'paymentMethod', title: 'Payment Method' },
        { id: 'reference', title: 'Reference' },
        { id: 'notes', title: 'Notes' },
        { id: 'billable', title: 'Billable' },
        { id: 'customer', title: 'Customer' },
        { id: 'project', title: 'Project' },
        { id: 'status', title: 'Status' },
        { id: 'hasReceipt', title: 'Has Receipt' }
      ]
    });

    // Format data for CSV
    const csvData = expenses.map(expense => ({
      date: expense.date.toISOString().split('T')[0],
      description: expense.description,
      amount: expense.amount,
      vendor: expense.vendor,
      account: expense.account,
      category: expense.category,
      paymentMethod: expense.paymentMethod,
      reference: expense.reference,
      notes: expense.notes || '',
      billable: expense.billable ? 'Yes' : 'No',
      customer: expense.customer?.name || '',
      project: expense.project || '',
      status: expense.status,
      hasReceipt: expense.hasReceipt ? 'Yes' : 'No'
    }));

    await csvWriter.writeRecords(csvData);

    // Send file
    res.download(filepath, filename, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        res.status(500).json({
          success: false,
          message: 'Failed to download file'
        });
      } else {
        // Clean up file after download
        setTimeout(() => {
          if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
          }
        }, 5000);
      }
    });
  } catch (error) {
    console.error('Error exporting expenses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export expenses',
      error: error.message
    });
  }
};

// Bulk update expenses
export const bulkUpdateExpenses = async (req, res) => {
  try {
    const { expenseIds, updateData } = req.body;
    const organizationId = req.user.organization || 'default';

    if (!expenseIds || !Array.isArray(expenseIds) || expenseIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Expense IDs are required'
      });
    }

    const result = await Expense.updateMany(
      {
        _id: { $in: expenseIds },
        organization: organizationId,
        isDeleted: false
      },
      {
        ...updateData,
        updatedBy: req.user.id
      }
    );

    res.json({
      success: true,
      data: { modifiedCount: result.modifiedCount },
      message: `₹{result.modifiedCount} expenses updated successfully`
    });
  } catch (error) {
    console.error('Error bulk updating expenses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk update expenses',
      error: error.message
    });
  }
};

// Bulk delete expenses
export const bulkDeleteExpenses = async (req, res) => {
  try {
    const { expenseIds } = req.body;
    const organizationId = req.user.organization || 'default';

    if (!expenseIds || !Array.isArray(expenseIds) || expenseIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Expense IDs are required'
      });
    }

    const result = await Expense.updateMany(
      {
        _id: { $in: expenseIds },
        organization: organizationId,
        isDeleted: false
      },
      {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: req.user.id
      }
    );

    res.json({
      success: true,
      data: { modifiedCount: result.modifiedCount },
      message: `₹{result.modifiedCount} expenses deleted successfully`
    });
  } catch (error) {
    console.error('Error bulk deleting expenses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk delete expenses',
      error: error.message
    });
  }
};

// File upload functions
export const uploadReceipt = async (req, res) => {
  try {
    console.log('📁 Upload receipt request received');
    console.log('📁 Request body:', req.body);
    console.log('📁 Request file:', req.file);
    console.log('📁 Request files:', req.files);
    
    if (!req.file) {
      console.log('❌ No file found in request');
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const fileData = {
      fileId: req.file.filename,
      originalName: req.file.originalname,
      fileName: req.file.filename,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedAt: new Date(),
      uploadedBy: req.user.uid,
      organization: req.user.organization || 'default'
    };

    res.json({
      success: true,
      message: 'File uploaded successfully',
      fileId: fileData.fileId,
      fileName: fileData.fileName,
      fileSize: fileData.fileSize,
      mimeType: fileData.mimeType
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload file',
      error: error.message
    });
  }
};

export const getFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const filePath = path.join(__dirname, '../../uploads/receipts', fileId);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    res.sendFile(filePath);
  } catch (error) {
    console.error('Error getting file:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get file',
      error: error.message
    });
  }
};

export const deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const filePath = path.join(__dirname, '../../uploads/receipts', fileId);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file',
      error: error.message
    });
  }
};


