import express from 'express';
import {
  getRecurringBills,
  getRecurringBillById,
  createRecurringBill,
  updateRecurringBill,
  deleteRecurringBill,
  searchRecurringBills,
  getRecurringBillStats,
  updateRecurringBillStatus,
  pauseRecurringBill,
  resumeRecurringBill,
  createBillFromRecurring,
  importRecurringBills
} from '../controllers/recurringBillController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Recurring bill routes
router.get('/', getRecurringBills);
router.get('/stats', getRecurringBillStats);
router.get('/search', searchRecurringBills);
router.get('/:id', getRecurringBillById);
router.post('/', createRecurringBill);
router.put('/:id', updateRecurringBill);
router.delete('/:id', deleteRecurringBill);
router.patch('/:id/status', updateRecurringBillStatus);
router.post('/:id/pause', pauseRecurringBill);
router.post('/:id/resume', resumeRecurringBill);
router.post('/:id/create-bill', createBillFromRecurring);
router.post('/import', importRecurringBills);

export default router;


