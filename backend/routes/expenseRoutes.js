import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { body, param, query } from 'express-validator';
import * as expenseController from '../controllers/expenseController.js';
import { authenticateToken as auth } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'expense-import-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || path.extname(file.originalname).toLowerCase() === '.csv') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// File upload storage for receipts
const receiptStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/receipts');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'receipt-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const receiptUpload = multer({
  storage: receiptStorage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not supported'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Validation rules
const createExpenseValidation = [
  body('date').isISO8601().withMessage('Valid date is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('amount').isNumeric().withMessage('Valid amount is required'),
  body('vendor').trim().notEmpty().withMessage('Vendor is required'),
  body('account').trim().notEmpty().withMessage('Account is required'),
  body('category').optional().trim(),
  body('paymentMethod').optional().trim(),
  body('reference').optional().trim(),
  body('notes').optional().trim(),
  body('billable').optional().isBoolean(),
  body('customer').optional().trim(),
  body('project').optional().trim(),
  body('hasReceipt').optional().isBoolean(),
  body('taxAmount').optional().isNumeric(),
  body('taxRate').optional().isNumeric(),
  body('taxType').optional().isIn(['GST', 'VAT', 'Sales Tax', 'None'])
];

const updateExpenseValidation = [
  param('id').isMongoId().withMessage('Valid expense ID is required'),
  body('date').optional().isISO8601().withMessage('Valid date is required'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('amount').optional().isNumeric().withMessage('Valid amount is required'),
  body('vendor').optional().trim().notEmpty().withMessage('Vendor cannot be empty'),
  body('account').optional().trim().notEmpty().withMessage('Account cannot be empty'),
  body('category').optional().trim(),
  body('paymentMethod').optional().trim(),
  body('reference').optional().trim(),
  body('notes').optional().trim(),
  body('billable').optional().isBoolean(),
  body('customer').optional().trim(),
  body('project').optional().trim(),
  body('hasReceipt').optional().isBoolean(),
  body('taxAmount').optional().isNumeric(),
  body('taxRate').optional().isNumeric(),
  body('taxType').optional().isIn(['GST', 'VAT', 'Sales Tax', 'None'])
];

const expenseIdValidation = [
  param('id').isMongoId().withMessage('Valid expense ID is required')
];

const queryValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sortBy').optional().isIn(['date', 'amount', 'vendor', 'description', 'createdAt']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
  query('status').optional().isIn(['unbilled', 'invoiced', 'reimbursed', 'billable', 'non-billable', 'All']).withMessage('Invalid status'),
  query('billable').optional().isBoolean().withMessage('Billable must be true or false'),
  query('hasReceipt').optional().isBoolean().withMessage('HasReceipt must be true or false'),
  query('startDate').optional().isISO8601().withMessage('Start date must be valid ISO date'),
  query('endDate').optional().isISO8601().withMessage('End date must be valid ISO date'),
  query('search').optional().trim()
];

// Apply authentication middleware to all routes
router.use(auth);

// GET /api/expenses - Get all expenses with filtering and pagination
router.get('/', queryValidation, expenseController.getExpenses);

// GET /api/expenses/stats - Get expense statistics
router.get('/stats', expenseController.getExpenseStats);

// GET /api/expenses/:id - Get expense by ID
router.get('/:id', expenseIdValidation, expenseController.getExpenseById);

// POST /api/expenses - Create new expense
router.post('/', createExpenseValidation, expenseController.createExpense);

// PUT /api/expenses/:id - Update expense
router.put('/:id', updateExpenseValidation, expenseController.updateExpense);

// DELETE /api/expenses/:id - Delete expense (soft delete)
router.delete('/:id', expenseIdValidation, expenseController.deleteExpense);

// POST /api/expenses/:id/convert-to-invoice - Convert expense to invoice
router.post('/:id/convert-to-invoice', expenseIdValidation, expenseController.convertToInvoice);

// POST /api/expenses/:id/mark-reimbursed - Mark expense as reimbursed
router.post('/:id/mark-reimbursed', expenseIdValidation, expenseController.markAsReimbursed);

// POST /api/expenses/import - Import expenses from CSV
router.post('/import', upload.single('file'), expenseController.importExpenses);

// GET /api/expenses/export - Export expenses to CSV
router.get('/export', queryValidation, expenseController.exportExpenses);

// PUT /api/expenses/bulk-update - Bulk update expenses
router.put('/bulk-update', [
  body('expenseIds').isArray({ min: 1 }).withMessage('Expense IDs array is required'),
  body('expenseIds.*').isMongoId().withMessage('Valid expense ID is required'),
  body('updateData').isObject().withMessage('Update data is required')
], expenseController.bulkUpdateExpenses);

// DELETE /api/expenses/bulk-delete - Bulk delete expenses
router.delete('/bulk-delete', [
  body('expenseIds').isArray({ min: 1 }).withMessage('Expense IDs array is required'),
  body('expenseIds.*').isMongoId().withMessage('Valid expense ID is required')
], expenseController.bulkDeleteExpenses);

// File upload routes
router.post('/upload', receiptUpload.single('file'), expenseController.uploadReceipt);
router.get('/files/:fileId', expenseController.getFile);
router.delete('/files/:fileId', expenseController.deleteFile);

export default router;
