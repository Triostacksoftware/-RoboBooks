import Payment from '../models/Payment.js';
import mongoose from 'mongoose';

// Get all payments
export const getPayments = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    const { status, vendorId, page = 1, limit = 25, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const query = { organizationId };
    
    if (status) {
      query.status = status;
    }
    
    if (vendorId) {
      query.vendorId = vendorId;
    }
    
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const payments = await Payment.find(query)
      .populate('vendorId', 'name companyName email')
      .populate('createdBy', 'name email')
      .populate('billIds', 'billNumber totalAmount')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Payment.countDocuments(query);

    res.json({
      success: true,
      data: payments,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch payments' });
  }
};

// Get payment by ID
export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organizationId;
    
    const payment = await Payment.findOne({ _id: id, organizationId })
      .populate('vendorId', 'name companyName email address')
      .populate('createdBy', 'name email')
      .populate('billIds', 'billNumber totalAmount status');

    if (!payment) {
      return res.status(404).json({ success: false, error: 'Payment not found' });
    }
    
    res.json({ success: true, data: payment });
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch payment' });
  }
};

// Create new payment
export const createPayment = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    const createdBy = req.user.id;
    const paymentData = req.body;
    
    // Generate payment number
    const paymentCount = await Payment.countDocuments({ organizationId });
    const paymentNumber = `PAY-${new Date().getFullYear()}-${String(paymentCount + 1).padStart(4, '0')}`;
    
    const payment = new Payment({
      ...paymentData,
      paymentNumber,
      organizationId,
      createdBy
    });
    
    await payment.save();
    
    const populatedPayment = await Payment.findById(payment._id)
      .populate('vendorId', 'name companyName email')
      .populate('createdBy', 'name email')
      .populate('billIds', 'billNumber totalAmount');
    
    res.status(201).json({ success: true, data: populatedPayment });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ success: false, error: 'Failed to create payment' });
  }
};

// Update payment
export const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organizationId;
    const updateData = req.body;

    const payment = await Payment.findOneAndUpdate(
      { _id: id, organizationId },
      updateData,
      { new: true }
    ).populate('vendorId', 'name companyName email')
     .populate('createdBy', 'name email')
     .populate('billIds', 'billNumber totalAmount');
    
    if (!payment) {
      return res.status(404).json({ success: false, error: 'Payment not found' });
    }
    
    res.json({ success: true, data: payment });
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ success: false, error: 'Failed to update payment' });
  }
};

// Delete payment
export const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organizationId;
    
    const payment = await Payment.findOneAndDelete({ _id: id, organizationId });
    
    if (!payment) {
      return res.status(404).json({ success: false, error: 'Payment not found' });
    }
    
    res.json({ success: true, message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(500).json({ success: false, error: 'Failed to delete payment' });
  }
};

// Search payments
export const searchPayments = async (req, res) => {
  try {
    const { query } = req.query;
    const organizationId = req.user.organizationId;
    
    const payments = await Payment.find({
      organizationId,
      $or: [
        { paymentNumber: { $regex: query, $options: 'i' } },
        { vendorName: { $regex: query, $options: 'i' } },
        { reference: { $regex: query, $options: 'i' } },
        { notes: { $regex: query, $options: 'i' } }
      ]
    })
    .populate('vendorId', 'name companyName email')
    .populate('createdBy', 'name email')
    .populate('billIds', 'billNumber totalAmount')
    .sort({ createdAt: -1 })
    .limit(20);
    
    res.json({ success: true, data: payments });
  } catch (error) {
    console.error('Error searching payments:', error);
    res.status(500).json({ success: false, error: 'Failed to search payments' });
  }
};

// Get payment statistics
export const getPaymentStats = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    
    const stats = await Payment.aggregate([
      { $match: { organizationId: new mongoose.Types.ObjectId(organizationId) } },
      {
        $group: {
          _id: null,
          totalPayments: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          averagePaymentValue: { $avg: '$amount' },
          pendingPayments: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          completedPayments: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          failedPayments: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
          },
          cancelledPayments: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          totalPendingAmount: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0] }
          }
        }
      }
    ]);

    const result = stats[0] || {
        totalPayments: 0,
        totalAmount: 0,
      averagePaymentValue: 0,
      pendingPayments: 0,
      completedPayments: 0,
      failedPayments: 0,
      cancelledPayments: 0,
      totalPendingAmount: 0
    };
    
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch payment stats' });
  }
};

// Update payment status
export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const organizationId = req.user.organizationId;
    
    const updateData = { status };
    
    if (status === 'completed') {
      updateData.processedAt = new Date();
    }
    
    const payment = await Payment.findOneAndUpdate(
      { _id: id, organizationId },
      updateData,
      { new: true }
    ).populate('vendorId', 'name companyName email')
      .populate('createdBy', 'name email')
     .populate('billIds', 'billNumber totalAmount');
    
    if (!payment) {
      return res.status(404).json({ success: false, error: 'Payment not found' });
    }
    
    res.json({ success: true, data: payment });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ success: false, error: 'Failed to update payment status' });
  }
};

// Process payment
export const processPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organizationId;
    
    const payment = await Payment.findOne({ _id: id, organizationId });
    
    if (!payment) {
      return res.status(404).json({ success: false, error: 'Payment not found' });
    }
    
    if (payment.status !== 'pending') {
      return res.status(400).json({ success: false, error: 'Payment is not pending' });
    }
    
    payment.status = 'completed';
    payment.processedAt = new Date();
    
    await payment.save();
    
    const populatedPayment = await Payment.findById(payment._id)
      .populate('vendorId', 'name companyName email')
      .populate('createdBy', 'name email')
      .populate('billIds', 'billNumber totalAmount');
    
    res.json({ success: true, data: populatedPayment });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ success: false, error: 'Failed to process payment' });
  }
};

// Import payments from CSV
export const importPayments = async (req, res) => {
  try {
    // This would typically use a CSV parsing library like csv-parser
    // For now, return a mock response
      res.json({
        success: true,
      message: 'Payments imported successfully',
      data: []
    });
  } catch (error) {
    console.error('Error importing payments:', error);
    res.status(500).json({ success: false, error: 'Failed to import payments' });
  }
};


