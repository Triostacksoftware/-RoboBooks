// models/BankTransaction.js
import mongoose from 'mongoose';

const bankTransactionSchema = new mongoose.Schema({
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BankAccount',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  payee: {
    type: String,
    trim: true
  },
  referenceNumber: {
    type: String,
    trim: true
  },
  withdrawals: {
    type: Number,
    default: 0
  },
  deposits: {
    type: Number,
    default: 0
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['deposit', 'withdrawal'],
    required: true
  },
  category: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['uncategorized', 'categorized', 'reconciled'],
    default: 'uncategorized'
  },
  isImported: {
    type: Boolean,
    default: true
  },
  importSource: {
    type: String,
    enum: ['manual', 'csv', 'excel', 'pdf', 'ofx', 'qif', 'camt'],
    default: 'manual'
  },
  importBatchId: {
    type: String
  },
  originalData: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Calculate amount based on withdrawals/deposits
bankTransactionSchema.pre('save', function(next) {
  if (this.withdrawals > 0) {
    this.amount = -this.withdrawals;
    this.type = 'withdrawal';
  } else if (this.deposits > 0) {
    this.amount = this.deposits;
    this.type = 'deposit';
  }
  next();
});

// Indexes for efficient querying
bankTransactionSchema.index({ userId: 1, accountId: 1, date: -1 });
bankTransactionSchema.index({ userId: 1, status: 1 });
bankTransactionSchema.index({ importBatchId: 1 });

export default mongoose.model('BankTransaction', bankTransactionSchema);
