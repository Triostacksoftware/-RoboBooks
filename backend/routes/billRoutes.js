import express from 'express';
import {
  getBills,
  getBillById,
  createBill,
  updateBill,
  deleteBill,
  searchBills,
  getBillStats,
  updateBillStatus,
  markBillAsPaid,
  importBills
} from '../controllers/billController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Bill routes
router.get('/', getBills);
router.get('/stats', getBillStats);
router.get('/search', searchBills);
router.get('/:id', getBillById);
router.post('/', createBill);
router.put('/:id', updateBill);
router.delete('/:id', deleteBill);
router.patch('/:id/status', updateBillStatus);
router.post('/:id/pay', markBillAsPaid);
router.post('/import', importBills);

export default router;


