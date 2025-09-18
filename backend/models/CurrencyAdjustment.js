import mongoose from 'mongoose';

const currencyAdjustmentSchema = new mongoose.Schema({
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true
  },
  accountName: {
    type: String,
    required: true
  },
  fromCurrency: {
    type: String,
    required: true,
    uppercase: true,
    enum: ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY']
  },
  toCurrency: {
    type: String,
    required: true,
    uppercase: true,
    enum: ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY']
  },
  originalAmount: {
    type: Number,
    required: true
  },
  convertedAmount: {
    type: Number,
    required: true
  },
  exchangeRate: {
    type: Number,
    required: true,
    min: 0
  },
  adjustmentDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  adjustmentType: {
    type: String,
    enum: ['gain', 'loss', 'neutral'],
    required: true
  },
  amount: {
    type: Number,
    required: true // The actual adjustment amount (gain/loss)
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    maxlength: 500
  },
  referenceNumber: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
currencyAdjustmentSchema.index({ userId: 1, status: 1, adjustmentDate: -1 });
currencyAdjustmentSchema.index({ accountId: 1, adjustmentDate: -1 });

// Auto-generate reference number
currencyAdjustmentSchema.pre('save', async function(next) {
  if (!this.referenceNumber) {
    const count = await this.constructor.countDocuments();
    this.referenceNumber = `CA-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

export default mongoose.model('CurrencyAdjustment', currencyAdjustmentSchema);
