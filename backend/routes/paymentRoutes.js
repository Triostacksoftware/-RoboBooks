import express from 'express';
import {
  getPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
  searchPayments,
  getPaymentStats,
  updatePaymentStatus,
  processPayment,
  importPayments
} from '../controllers/paymentController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Payment routes
router.get('/', getPayments);
router.get('/stats', getPaymentStats);
router.get('/search', searchPayments);
router.get('/:id', getPaymentById);
router.post('/', createPayment);
router.put('/:id', updatePayment);
router.delete('/:id', deletePayment);
router.patch('/:id/status', updatePaymentStatus);
router.post('/:id/process', processPayment);
router.post('/import', importPayments);

export default router;


