import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  paymentNumber: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  referenceNumber: {
    type: String,
    trim: true,
    default: ''
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  invoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    required: true
  },
  invoiceNumber: {
    type: String,
    required: true,
    trim: true
  },
  mode: {
    type: String,
    required: true,
    enum: ['Cash', 'Bank Transfer', 'Cheque', 'Credit Card', 'UPI', 'Debit Card', 'Online Payment', 'Other'],
    default: 'Cash'
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  unusedAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  bankAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BankAccount'
  },
  chequeNumber: {
    type: String,
    trim: true
  },
  transactionId: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Cancelled'],
    default: 'Completed'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total amount (amount + unused amount)
paymentSchema.virtual('totalAmount').get(function() {
  return this.amount + this.unusedAmount;
});

// Indexes for better query performance
paymentSchema.index({ paymentNumber: 1 });
paymentSchema.index({ customer: 1 });
paymentSchema.index({ invoice: 1 });
paymentSchema.index({ date: -1 });
paymentSchema.index({ mode: 1 });
paymentSchema.index({ status: 1 });

// Pre-save middleware to auto-generate payment number if not provided
paymentSchema.pre('save', async function(next) {
  if (!this.paymentNumber) {
    try {
      const lastPayment = await this.constructor.findOne({}, {}, { sort: { 'paymentNumber': -1 } });
      if (lastPayment && lastPayment.paymentNumber) {
        // Extract the numeric part from payment numbers like "PAY-001", "PAY-002", etc.
        const match = lastPayment.paymentNumber.match(/PAY-(\d+)/);
        if (match) {
          const lastNumber = parseInt(match[1]);
          this.paymentNumber = `PAY-${String(lastNumber + 1).padStart(3, '0')}`;
        } else {
          // Fallback if format is different
          this.paymentNumber = `PAY-${Date.now()}`;
        }
      } else {
        // First payment
        this.paymentNumber = 'PAY-001';
      }
    } catch (error) {
      console.error('Error generating payment number:', error);
      // Fallback payment number
      this.paymentNumber = `PAY-${Date.now()}`;
    }
  }
  next();
});

// Static method to get payment statistics
paymentSchema.statics.getPaymentStats = async function(startDate, endDate) {
  const matchStage = {};
  if (startDate && endDate) {
    matchStage.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  return await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalPayments: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        totalUnusedAmount: { $sum: '$unusedAmount' },
        averageAmount: { $avg: '$amount' }
      }
    }
  ]);
};

// Static method to get payments by customer
paymentSchema.statics.getPaymentsByCustomer = async function(customerId, limit = 10) {
  return await this.find({ customer: customerId })
    .sort({ date: -1 })
    .limit(limit)
    .populate('invoice', 'invoiceNumber amount')
    .populate('bankAccount', 'accountName accountNumber');
};

// Static method to get payments by invoice
paymentSchema.statics.getPaymentsByInvoice = async function(invoiceId) {
  return await this.find({ invoice: invoiceId })
    .sort({ date: -1 })
    .populate('customer', 'name email')
    .populate('bankAccount', 'accountName accountNumber');
};

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
