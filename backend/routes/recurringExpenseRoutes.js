import express from 'express';
import {
  getRecurringExpenses,
  getRecurringExpense,
  createRecurringExpense,
  updateRecurringExpense,
  deleteRecurringExpense,
  toggleRecurringExpense,
  getRecurringExpenseStats,
  importRecurringExpenses,
  exportRecurringExpenses,
  bulkDeleteRecurringExpenses,
  bulkUpdateRecurringExpenses
} from '../controllers/recurringExpenseController.js';
import { authenticateToken } from '../middleware/auth.js';
import multer from 'multer';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET /api/recurring-expenses - Get all recurring expenses
router.get('/', getRecurringExpenses);

// GET /api/recurring-expenses/stats - Get recurring expense statistics
router.get('/stats', getRecurringExpenseStats);

// GET /api/recurring-expenses/export - Export recurring expenses
router.get('/export', exportRecurringExpenses);

// GET /api/recurring-expenses/:id - Get single recurring expense
router.get('/:id', getRecurringExpense);

// POST /api/recurring-expenses - Create new recurring expense
router.post('/', createRecurringExpense);

// POST /api/recurring-expenses/import - Import recurring expenses from CSV
router.post('/import', upload.single('file'), importRecurringExpenses);

// POST /api/recurring-expenses/bulk-delete - Bulk delete recurring expenses
router.post('/bulk-delete', bulkDeleteRecurringExpenses);

// POST /api/recurring-expenses/bulk-update - Bulk update recurring expenses
router.post('/bulk-update', bulkUpdateRecurringExpenses);

// PUT /api/recurring-expenses/:id - Update recurring expense
router.put('/:id', updateRecurringExpense);

// PATCH /api/recurring-expenses/:id/toggle - Toggle recurring expense active status
router.patch('/:id/toggle', toggleRecurringExpense);

// DELETE /api/recurring-expenses/:id - Delete recurring expense
router.delete('/:id', deleteRecurringExpense);

export default router;


