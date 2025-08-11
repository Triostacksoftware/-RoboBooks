import express from 'express';
import {
  createPayment,
  getPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
  getPaymentStats,
  getPaymentsByCustomer,
  getPaymentsByInvoice,
  bulkUpdatePayments,
  exportPayments,
  getRealTimeUpdates
} from '../controllers/paymentController.js';
import { authGuard } from '../utils/jwt.js';

const router = express.Router();

// Test endpoints without authentication (temporary for testing)
router.post('/test', createPayment);
router.get('/test', getPayments);
router.get('/test/:id', getPaymentById);
router.put('/test/:id', updatePayment);
router.delete('/test/:id', deletePayment);

// Test authentication endpoint
router.get('/test-auth', authGuard, (req, res) => {
  console.log('🔐 Test auth endpoint hit');
  console.log('🔐 User:', req.user);
  console.log('🔐 Headers:', req.headers);
  console.log('🔐 Cookies:', req.cookies);
  res.json({ 
    success: true, 
    message: 'Authentication working',
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

// Real-time updates endpoint (SSE)
router.get('/real-time', getRealTimeUpdates);

// Apply authentication middleware to all other routes
router.use(authGuard);

// Basic CRUD operations
router.post('/', createPayment);
router.get('/', getPayments);
router.get('/stats', getPaymentStats);
router.get('/:id', getPaymentById);
router.put('/:id', updatePayment);
router.delete('/:id', deletePayment);

// Specialized endpoints
router.get('/customer/:customerId', getPaymentsByCustomer);
router.get('/invoice/:invoiceId', getPaymentsByInvoice);
router.put('/bulk/update', bulkUpdatePayments);
router.get('/export/data', exportPayments);

export default router;
