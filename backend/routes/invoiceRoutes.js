import express from 'express';
import { recordPayment } from '../services/invoiceservice.js';
import auth from '../middleware/auth.js';
import { getInvoiceStats } from '../controllers/invoicecontroller.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// GET /api/invoices/stats - Get invoice statistics
router.get('/stats', getInvoiceStats);

// POST /api/invoices/:id/record-payment
router.post('/:id/record-payment', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, paymentMethod, paymentDate, reference } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Payment amount is required and must be greater than 0'
      });
    }

    const paymentData = {
      amount: parseFloat(amount),
      paymentMethod,
      paymentDate: new Date(paymentDate),
      reference
    };

    const updatedInvoice = await recordPayment(id, paymentData);

    res.json({
      success: true,
      data: updatedInvoice,
      message: 'Payment recorded successfully'
    });
  } catch (error) {
    console.error('Record payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error recording payment',
      error: error.message
    });
  }
});

export default router;


