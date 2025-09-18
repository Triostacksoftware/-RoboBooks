import mongoose from "mongoose";

const bulkUpdateItemSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    trim: true
  },
  transactionType: {
    type: String,
    enum: ['invoice', 'credit_note', 'purchase_order', 'expense', 'bill', 'vendor_credit'],
    required: true
  },
  oldAccount: {
    type: String,
    required: true,
    trim: true
  },
  newAccount: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'updated', 'failed'],
    default: 'pending'
  },
  errorMessage: {
    type: String,
    trim: true
  }
});

const bulkUpdateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  filterCriteria: {
    transactionTypes: [{
      type: String,
      enum: ['invoice', 'credit_note', 'purchase_order', 'expense', 'bill', 'vendor_credit']
    }],
    dateFrom: {
      type: Date
    },
    dateTo: {
      type: Date
    },
    accounts: [{
      type: String,
      trim: true
    }],
    amountRange: {
      min: {
        type: Number,
        min: 0
      },
      max: {
        type: Number,
        min: 0
      }
    }
  },
  updateData: {
    oldAccount: {
      type: String,
      required: true,
      trim: true
    },
    newAccount: {
      type: String,
      required: true,
      trim: true
    }
  },
  items: [bulkUpdateItemSchema],
  totalTransactions: {
    type: Number,
    default: 0
  },
  updatedTransactions: {
    type: Number,
    default: 0
  },
  failedTransactions: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'running', 'completed', 'failed', 'cancelled'],
    default: 'draft'
  },
  createdBy: {
    type: String,
    required: true
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
bulkUpdateSchema.index({ name: 1 });
bulkUpdateSchema.index({ status: 1 });
bulkUpdateSchema.index({ createdBy: 1 });
bulkUpdateSchema.index({ createdAt: 1 });

// Pre-save middleware to calculate totals
bulkUpdateSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    this.totalTransactions = this.items.length;
    this.updatedTransactions = this.items.filter(item => item.status === 'updated').length;
    this.failedTransactions = this.items.filter(item => item.status === 'failed').length;
  }
  next();
});

const BulkUpdate = mongoose.model('BulkUpdate', bulkUpdateSchema);

export default BulkUpdate;


