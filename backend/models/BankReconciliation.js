import mongoose from 'mongoose';

const reconciliationItemSchema = new mongoose.Schema(
  {
    bankTransaction: {
      id: String,
      description: {
        type: String,
        required: true
      },
      amount: {
        type: Number,
        required: true
      },
      date: {
        type: Date,
        required: true
      },
      reference: String
    },
    bookTransaction: {
      id: String,
      description: String,
      amount: Number,
      date: Date,
      type: {
        type: String,
        enum: ['invoice', 'expense', 'payment', 'manual']
      }
    },
    status: {
      type: String,
      enum: ['matched', 'unmatched', 'reconciled'],
      default: 'unmatched'
    },
    difference: Number,
    notes: String
  }
);

const bankReconciliationSchema = new mongoose.Schema(
  {
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BankAccount',
      required: true
    },
    accountName: {
      type: String,
      required: true
    },
    bankBalance: {
      type: Number,
      required: true
    },
    bookBalance: {
      type: Number,
      required: true
    },
    difference: {
      type: Number,
      default: 0
    },
    reconciliationDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['draft', 'in_progress', 'completed'],
      default: 'draft'
    },
    items: [reconciliationItemSchema],
    // User who created this reconciliation
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // Period for reconciliation
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    }
  },
  { timestamps: true }
);

// Indexes for efficient querying
bankReconciliationSchema.index({ userId: 1, accountId: 1 });
bankReconciliationSchema.index({ status: 1, reconciliationDate: -1 });

export default mongoose.model('BankReconciliation', bankReconciliationSchema);
