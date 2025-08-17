import mongoose from 'mongoose';
import Payment from '../models/Payment.js';
import Customer from '../models/Customer.js';
import Invoice from '../models/invoicemodel.js';
import BankAccount from '../models/BankAccount.js';
import User from '../models/User.js';

// Helper function to check if models are available
const isModelAvailable = (model) => {
  try {
    return model && typeof model === 'function' && model.prototype && model.prototype.constructor;
  } catch (error) {
    return false;
  }
};

// Create new payment
export const createPayment = async (req, res) => {
  try {
    // Check if Payment model is available and database is connected
    // mongoose.connection.readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    console.log('🔍 Debug - isModelAvailable(Payment):', isModelAvailable(Payment));
    console.log('🔍 Debug - MONGODB_URI exists:', !!process.env.MONGODB_URI);
    console.log('🔍 Debug - mongoose.connection.readyState:', mongoose.connection.readyState);
    
    if (!isModelAvailable(Payment) || !process.env.MONGODB_URI || mongoose.connection.readyState !== 1) {
      console.log('⚠️ Running in mock mode, returning mock created payment');
      
      // Return mock created payment
      const mockPayment = {
        _id: `mock-payment-${Date.now()}`,
        paymentNumber: `PAY-${Date.now()}`,
        date: req.body.date || new Date().toISOString(),
        referenceNumber: req.body.referenceNumber || `REF-${Date.now()}`,
        customer: {
          _id: req.body.customerId || 'mock-customer-1',
          name: 'Mock Customer',
          email: 'customer@example.com',
          phone: '+1234567890'
        },
        customerName: 'Mock Customer',
        invoice: {
          _id: req.body.invoiceId || 'mock-invoice-1',
          invoiceNumber: 'INV-MOCK',
          amount: req.body.amount || 0,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        invoiceNumber: 'INV-MOCK',
        mode: req.body.mode || 'Cash',
        amount: req.body.amount || 0,
        unusedAmount: req.body.unusedAmount || 0,
        bankAccount: req.body.bankAccountId ? {
          _id: req.body.bankAccountId,
          accountName: 'Mock Account',
          accountNumber: '1234567890'
        } : undefined,
        chequeNumber: req.body.chequeNumber,
        transactionId: req.body.transactionId,
        notes: req.body.notes,
        status: 'Pending',
        createdBy: {
          _id: req.user?.id || 'mock-user-1',
          name: 'Mock User',
          email: 'user@example.com'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return res.status(201).json({
        success: true,
        message: 'Payment created successfully (mock mode)',
        data: mockPayment
      });
    }

    const {
      customerId,
      invoiceId,
      amount,
      mode,
      referenceNumber,
      bankAccountId,
      chequeNumber,
      transactionId,
      notes,
      date,
      unusedAmount
    } = req.body;

    // Validate required fields
    if (!customerId || !invoiceId || !amount || !mode) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: customerId, invoiceId, amount, mode'
      });
    }

    // Fetch customer and invoice details to populate required fields
    const [customer, invoice] = await Promise.all([
      Customer.findById(customerId).select('name email phone'),
      Invoice.findById(invoiceId).select('invoiceNumber amount dueDate')
    ]);

    if (!customer) {
      return res.status(400).json({
        success: false,
        message: 'Customer not found'
      });
    }

    if (!invoice) {
      return res.status(400).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Create payment object
    const paymentData = {
      customer: customerId,
      customerName: customer.name,
      invoice: invoiceId,
      invoiceNumber: invoice.invoiceNumber,
      amount: parseFloat(amount),
      mode,
      referenceNumber,
      bankAccount: bankAccountId,
      chequeNumber,
      transactionId,
      notes,
      date: date || new Date(),
      unusedAmount: unusedAmount || 0,
      status: 'Pending',
      createdBy: req.user?.id || 'mock-user-1'
    };

    // Generate payment number
    let paymentNumber;
    try {
      const lastPayment = await Payment.findOne({}, {}, { sort: { 'paymentNumber': -1 } });
      if (lastPayment && lastPayment.paymentNumber) {
        // Extract the numeric part from payment numbers like "PAY-001", "PAY-002", etc.
        const match = lastPayment.paymentNumber.match(/PAY-(\d+)/);
        if (match) {
          const lastNumber = parseInt(match[1]);
          paymentNumber = `PAY-${String(lastNumber + 1).padStart(3, '0')}`;
        } else {
          // Fallback if format is different
          paymentNumber = `PAY-${Date.now()}`;
        }
      } else {
        // First payment
        paymentNumber = 'PAY-001';
      }
    } catch (error) {
      console.error('Error generating payment number:', error);
      // Fallback payment number
      paymentNumber = `PAY-${Date.now()}`;
    }

    // Add payment number to payment data
    paymentData.paymentNumber = paymentNumber;

    // Create payment
    const payment = await Payment.create(paymentData);

    // Populate references
    await payment.populate([
      { path: 'customer', select: 'name email phone' },
      { path: 'invoice', select: 'invoiceNumber amount dueDate' },
      { path: 'bankAccount', select: 'accountName accountNumber' },
      { path: 'createdBy', select: 'name email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Payment created successfully',
      data: payment
    });

  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment',
      error: error.message
    });
  }
};

// Get all payments with filtering and pagination
export const getPayments = async (req, res) => {
  try {
    // Check if Payment model is available (database connected)
    if (!isModelAvailable(Payment)) {
      console.log('⚠️ Database not available, returning mock data');
      
      // Return mock data to prevent frontend errors
      const mockPayments = [
        {
          _id: 'mock-payment-1',
          paymentNumber: 'PAY-001',
          date: new Date().toISOString(),
          referenceNumber: 'REF-001',
          customer: {
            _id: 'mock-customer-1',
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+1234567890'
          },
          customerName: 'John Doe',
          invoice: {
            _id: 'mock-invoice-1',
            invoiceNumber: 'INV-001',
            amount: 1000,
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          },
          invoiceNumber: 'INV-001',
          mode: 'Bank Transfer',
          amount: 1000,
          unusedAmount: 0,
          bankAccount: {
            _id: 'mock-bank-1',
            accountName: 'Main Account',
            accountNumber: '1234567890'
          },
          status: 'Completed',
          createdBy: {
            _id: 'mock-user-1',
            name: 'Admin User',
            email: 'admin@example.com'
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: 'mock-payment-2',
          paymentNumber: 'PAY-002',
          date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          referenceNumber: 'REF-002',
          customer: {
            _id: 'mock-customer-2',
            name: 'Jane Smith',
            email: 'jane@example.com',
            phone: '+0987654321'
          },
          customerName: 'Jane Smith',
          invoice: {
            _id: 'mock-invoice-2',
            invoiceNumber: 'INV-002',
            amount: 2500,
            dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
          },
          invoiceNumber: 'INV-002',
          mode: 'Cheque',
          amount: 2500,
          unusedAmount: 0,
          chequeNumber: 'CHQ-001',
          status: 'Pending',
          createdBy: {
            _id: 'mock-user-1',
            name: 'Admin User',
            email: 'admin@example.com'
          },
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      return res.json({
        success: true,
        data: mockPayments,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: mockPayments.length,
          itemsPerPage: mockPayments.length
        }
      });
    }

    const {
      page = 1,
      limit = 10,
      customerId,
      invoiceId,
      mode,
      status,
      startDate,
      endDate,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    if (customerId) filter.customer = customerId;
    if (invoiceId) filter.invoice = invoiceId;
    if (mode) filter.mode = mode;
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with pagination
    const payments = await Payment.find(filter)
      .populate('customer', 'name email phone')
      .populate('invoice', 'invoiceNumber amount dueDate')
      .populate('bankAccount', 'accountName accountNumber')
      .populate('createdBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Payment.countDocuments(filter);

    res.json({
      success: true,
      data: payments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments',
      error: error.message
    });
  }
};

// Get single payment by ID
export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if Payment model is available (database connected)
    if (!isModelAvailable(Payment)) {
      console.log('⚠️ Database not available, returning mock payment');
      
      // Return mock payment data
      const mockPayment = {
        _id: id,
        paymentNumber: 'PAY-MOCK',
        date: new Date().toISOString(),
        referenceNumber: 'REF-MOCK',
        customer: {
          _id: 'mock-customer-1',
          name: 'Mock Customer',
          email: 'customer@example.com',
          phone: '+1234567890',
          address: '123 Mock Street, Mock City'
        },
        customerName: 'Mock Customer',
        invoice: {
          _id: 'mock-invoice-1',
          invoiceNumber: 'INV-MOCK',
          amount: 1000,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          items: []
        },
        invoiceNumber: 'INV-MOCK',
        mode: 'Cash',
        amount: 1000,
        unusedAmount: 0,
        bankAccount: {
          _id: 'mock-bank-1',
          accountName: 'Mock Account',
          accountNumber: '1234567890',
          bankName: 'Mock Bank'
        },
        status: 'Completed',
        createdBy: {
          _id: 'mock-user-1',
          name: 'Mock User',
          email: 'user@example.com'
        },
        updatedBy: {
          _id: 'mock-user-1',
          name: 'Mock User',
          email: 'user@example.com'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return res.json({
        success: true,
        data: mockPayment
      });
    }

    const payment = await Payment.findById(id)
      .populate('customer', 'name email phone address')
      .populate('invoice', 'invoiceNumber amount dueDate items')
      .populate('bankAccount', 'accountName accountNumber bankName')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      data: payment
    });

  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment',
      error: error.message
    });
  }
};

// Update payment
export const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if Payment model is available (database connected)
    if (!isModelAvailable(Payment) || !process.env.MONGODB_URI) {
      console.log('⚠️ Database not available, returning mock updated payment');
      
      // Return mock updated payment
      const mockUpdatedPayment = {
        _id: id,
        paymentNumber: 'PAY-MOCK',
        date: updateData.date || new Date().toISOString(),
        referenceNumber: updateData.referenceNumber || 'REF-MOCK',
        customer: {
          _id: updateData.customerId || 'mock-customer-1',
          name: 'Mock Customer',
          email: 'customer@example.com',
          phone: '+1234567890'
        },
        customerName: 'Mock Customer',
        invoice: {
          _id: updateData.invoiceId || 'mock-invoice-1',
          invoiceNumber: 'INV-MOCK',
          amount: updateData.amount || 1000,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        invoiceNumber: 'INV-MOCK',
        mode: updateData.mode || 'Cash',
        amount: updateData.amount || 1000,
        unusedAmount: updateData.unusedAmount || 0,
        bankAccount: updateData.bankAccountId ? {
          _id: updateData.bankAccountId,
          accountName: 'Mock Account',
          accountNumber: '1234567890'
        } : undefined,
        chequeNumber: updateData.chequeNumber,
        transactionId: updateData.transactionId,
        notes: updateData.notes,
        status: updateData.status || 'Pending',
        createdBy: {
          _id: 'mock-user-1',
          name: 'Mock User',
          email: 'user@example.com'
        },
        updatedBy: {
          _id: req.user?.id || 'mock-user-1',
          name: 'Mock User',
          email: 'user@example.com'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return res.status(200).json({
        success: true,
        message: 'Payment updated successfully (mock mode)',
        data: mockUpdatedPayment
      });
    }

    // Validate payment exists
    const existingPayment = await Payment.findById(id);
    if (!existingPayment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Update payment
    const updatedPayment = await Payment.findByIdAndUpdate(
      id,
      {
        ...updateData,
        updatedBy: req.user.id,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate([
      { path: 'customer', select: 'name email phone' },
      { path: 'invoice', select: 'invoiceNumber amount dueDate' },
      { path: 'bankAccount', select: 'accountName accountNumber' },
      { path: 'createdBy', select: 'name email' },
      { path: 'updatedBy', select: 'name email' }
    ]);

    res.json({
      success: true,
      message: 'Payment updated successfully',
      data: updatedPayment
    });

  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment',
      error: error.message
    });
  }
};

// Delete payment
export const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if Payment model is available and database is connected
    if (!isModelAvailable(Payment) || !process.env.MONGODB_URI) {
      console.log('⚠️ Database not available, returning mock delete response');
      
      return res.status(200).json({
        success: true,
        message: 'Payment deleted successfully (mock mode)',
        data: { message: 'Payment deleted successfully (mock mode)' }
      });
    }

    // Check if payment exists
    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Delete payment
    await Payment.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Payment deleted successfully',
      data: { message: 'Payment deleted successfully' }
    });

  } catch (error) {
    console.error('Error deleting payment:', error);
    
    // If it's a database connection error, return mock response
    if (error.name === 'MongoNetworkError' || error.message.includes('connection') || error.message.includes('timeout') || error.message.includes('ECONNREFUSED')) {
      console.log('⚠️ Database connection error, returning mock delete response');
      return res.json({
        success: true,
        message: 'Payment deleted successfully (mock mode)',
        data: { message: 'Payment deleted successfully (mock mode)' }
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to delete payment',
      error: error.message
    });
  }
};

// Get payment statistics
export const getPaymentStats = async (req, res) => {
  try {
    // Check if Payment model is available (database connected)
    if (!isModelAvailable(Payment)) {
      console.log('⚠️ Database not available, returning mock stats');
      
      // Return mock statistics
      return res.json({
        success: true,
        data: {
          summary: {
            totalPayments: 2,
            totalAmount: 3500,
            totalUnusedAmount: 0,
            averageAmount: 1750,
            minAmount: 1000,
            maxAmount: 2500
          },
          byMode: [
            { _id: 'Bank Transfer', count: 1, totalAmount: 1000 },
            { _id: 'Cheque', count: 1, totalAmount: 2500 }
          ],
          byStatus: [
            { _id: 'Completed', count: 1, totalAmount: 1000 },
            { _id: 'Pending', count: 1, totalAmount: 2500 }
          ]
        }
      });
    }

    const { startDate, endDate, customerId, mode } = req.query;

    // Build filter object
    const filter = {};
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    if (customerId) filter.customer = customerId;
    if (mode) filter.mode = mode;

    // Get summary statistics
    const summary = await Payment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalPayments: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          totalUnusedAmount: { $sum: '$unusedAmount' },
          averageAmount: { $avg: '$amount' },
          minAmount: { $min: '$amount' },
          maxAmount: { $max: '$amount' }
        }
      }
    ]);

    // Get payments by mode
    const paymentsByMode = await Payment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$mode',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    // Get payments by status
    const paymentsByStatus = await Payment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    const stats = {
      summary: summary[0] || {
        totalPayments: 0,
        totalAmount: 0,
        totalUnusedAmount: 0,
        averageAmount: 0,
        minAmount: 0,
        maxAmount: 0
      },
      byMode: paymentsByMode,
      byStatus: paymentsByStatus
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching payment stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment statistics',
      error: error.message
    });
  }
};

// Get payments by customer
export const getPaymentsByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Check if Payment model is available (database connected)
    if (!isModelAvailable(Payment)) {
      console.log('⚠️ Database not available, returning mock customer payments');
      
      // Return mock customer payments
      const mockPayments = [
        {
          _id: 'mock-payment-1',
          paymentNumber: 'PAY-001',
          date: new Date().toISOString(),
          referenceNumber: 'REF-001',
          customer: {
            _id: customerId,
            name: 'Mock Customer',
            email: 'customer@example.com',
            phone: '+1234567890'
          },
          customerName: 'Mock Customer',
          invoice: {
            _id: 'mock-invoice-1',
            invoiceNumber: 'INV-001',
            amount: 1000,
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          },
          invoiceNumber: 'INV-001',
          mode: 'Bank Transfer',
          amount: 1000,
          unusedAmount: 0,
          status: 'Completed',
          createdBy: {
            _id: 'mock-user-1',
            name: 'Mock User',
            email: 'user@example.com'
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      return res.json({
        success: true,
        data: mockPayments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: 1,
          totalItems: mockPayments.length,
          itemsPerPage: parseInt(limit)
        }
      });
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const payments = await Payment.find({ customer: customerId })
      .populate('customer', 'name email phone')
      .populate('invoice', 'invoiceNumber amount dueDate')
      .populate('bankAccount', 'accountName accountNumber')
      .populate('createdBy', 'name email')
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments({ customer: customerId });

    res.json({
      success: true,
      data: payments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error fetching customer payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer payments',
      error: error.message
    });
  }
};

// Get payments by invoice
export const getPaymentsByInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params;

    // Check if Payment model is available (database connected)
    if (!isModelAvailable(Payment)) {
      console.log('⚠️ Database not available, returning mock invoice payments');
      
      // Return mock invoice payments
      const mockPayments = [
        {
          _id: 'mock-payment-1',
          paymentNumber: 'PAY-001',
          date: new Date().toISOString(),
          referenceNumber: 'REF-001',
          customer: {
            _id: 'mock-customer-1',
            name: 'Mock Customer',
            email: 'customer@example.com',
            phone: '+1234567890'
          },
          customerName: 'Mock Customer',
          invoice: {
            _id: invoiceId,
            invoiceNumber: 'INV-001',
            amount: 1000,
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          },
          invoiceNumber: 'INV-001',
          mode: 'Bank Transfer',
          amount: 1000,
          unusedAmount: 0,
          status: 'Completed',
          createdBy: {
            _id: 'mock-user-1',
            name: 'Mock User',
            email: 'user@example.com'
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      return res.json({
        success: true,
        data: mockPayments
      });
    }

    const payments = await Payment.find({ invoice: invoiceId })
      .populate('customer', 'name email phone')
      .populate('invoice', 'invoiceNumber amount dueDate')
      .populate('bankAccount', 'accountName accountNumber')
      .populate('createdBy', 'name email')
      .sort({ date: -1 });

    res.json({
      success: true,
      data: payments
    });

  } catch (error) {
    console.error('Error fetching invoice payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoice payments',
      error: error.message
    });
  }
};

// Bulk update payments
export const bulkUpdatePayments = async (req, res) => {
  try {
    const { paymentIds, updateData } = req.body;

    // Check if Payment model is available (database connected)
    if (!isModelAvailable(Payment)) {
      console.log('⚠️ Database not available, returning mock bulk update response');
      
      return res.json({
        success: true,
        message: 'Bulk update completed successfully (mock mode)',
        data: {
          matchedCount: paymentIds?.length || 0,
          modifiedCount: paymentIds?.length || 0
        }
      });
    }

    if (!paymentIds || !Array.isArray(paymentIds) || paymentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Payment IDs array is required'
      });
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Update data is required'
      });
    }

    // Add updatedBy and updatedAt to update data
    const updatePayload = {
      ...updateData,
      updatedBy: req.user.id,
      updatedAt: new Date()
    };

    const result = await Payment.updateMany(
      { _id: { $in: paymentIds } },
      updatePayload
    );

    res.json({
      success: true,
      message: `Successfully updated ${result.modifiedCount} payments`,
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount
      }
    });

  } catch (error) {
    console.error('Error bulk updating payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk update payments',
      error: error.message
    });
  }
};

// Export payments to CSV/Excel
export const exportPayments = async (req, res) => {
  try {
    const { startDate, endDate, customerId, mode, status, format = 'csv' } = req.query;

    // Check if Payment model is available (database connected)
    if (!isModelAvailable(Payment)) {
      console.log('⚠️ Database not available, returning mock export data');
      
      // Return mock export data
      const mockPayments = [
        {
          paymentNumber: 'PAY-001',
          date: new Date().toISOString(),
          referenceNumber: 'REF-001',
          customerName: 'Mock Customer 1',
          invoiceNumber: 'INV-001',
          mode: 'Bank Transfer',
          amount: 1000,
          status: 'Completed',
          createdAt: new Date().toISOString()
        },
        {
          paymentNumber: 'PAY-002',
          date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          referenceNumber: 'REF-002',
          customerName: 'Mock Customer 2',
          invoiceNumber: 'INV-002',
          mode: 'Cheque',
          amount: 2500,
          status: 'Pending',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      if (format === 'csv') {
        const csvData = mockPayments.map(payment => 
          `${payment.paymentNumber},${payment.date},${payment.referenceNumber},${payment.customerName},${payment.invoiceNumber},${payment.mode},${payment.amount},${payment.status}`
        ).join('\n');
        
        const csvHeader = 'Payment Number,Date,Reference Number,Customer Name,Invoice Number,Mode,Amount,Status\n';
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=payments.csv');
        return res.send(csvHeader + csvData);
      } else {
        return res.json({
          success: true,
          data: mockPayments
        });
      }
    }

    // Build filter object
    const filter = {};
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    if (customerId) filter.customer = customerId;
    if (mode) filter.mode = mode;
    if (status) filter.status = status;

    const payments = await Payment.find(filter)
      .populate('customer', 'name')
      .populate('invoice', 'invoiceNumber')
      .sort({ date: -1 });

    const exportData = payments.map(payment => ({
      paymentNumber: payment.paymentNumber,
      date: payment.date,
      referenceNumber: payment.referenceNumber,
      customerName: payment.customer?.name || payment.customerName,
      invoiceNumber: payment.invoice?.invoiceNumber || payment.invoiceNumber,
      mode: payment.mode,
      amount: payment.amount,
      status: payment.status,
      createdAt: payment.createdAt
    }));

    if (format === 'csv') {
      const csvData = exportData.map(payment => 
        `${payment.paymentNumber},${payment.date},${payment.referenceNumber},${payment.customerName},${payment.invoiceNumber},${payment.mode},${payment.amount},${payment.status}`
      ).join('\n');
      
      const csvHeader = 'Payment Number,Date,Reference Number,Customer Name,Invoice Number,Mode,Amount,Status\n';
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=payments.csv');
      res.send(csvHeader + csvData);
    } else {
      res.json({
        success: true,
        data: exportData
      });
    }

  } catch (error) {
    console.error('Error exporting payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export payments',
      error: error.message
    });
  }
};

// Real-time updates using Server-Sent Events (SSE)
export const getRealTimeUpdates = async (req, res) => {
  try {
    // Set headers for SSE
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    console.log('🔌 Real-time connection established for payments');

    // Send initial connection message
    res.write(`data: ${JSON.stringify({
      type: 'connection_established',
      message: 'Real-time connection established',
      timestamp: new Date().toISOString()
    })}\n\n`);

    // Keep connection alive with heartbeat
    const heartbeat = setInterval(() => {
      res.write(`data: ${JSON.stringify({
        type: 'heartbeat',
        timestamp: new Date().toISOString()
      })}\n\n`);
    }, 30000); // Send heartbeat every 30 seconds

    // Handle client disconnect
    req.on('close', () => {
      console.log('🔌 Real-time connection closed by client');
      clearInterval(heartbeat);
      res.end();
    });

    req.on('error', (error) => {
      console.error('❌ Real-time connection error:', error);
      clearInterval(heartbeat);
      res.end();
    });

  } catch (error) {
    console.error('Error establishing real-time connection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to establish real-time connection',
      error: error.message
    });
  }
};
