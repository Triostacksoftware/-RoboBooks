import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  // Basic Information
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  vendor: {
    type: String,
    required: true,
    trim: true
  },
  account: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    trim: true,
    default: 'Other'
  },
  paymentMethod: {
    type: String,
    trim: true,
    default: 'Cash'
  },
  reference: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },

  // Status and Classification
  status: {
    type: String,
    enum: ['unbilled', 'invoiced', 'reimbursed', 'billable', 'non-billable'],
    default: 'unbilled'
  },
  hasReceipt: {
    type: Boolean,
    default: false
  },
  billable: {
    type: Boolean,
    default: false
  },

  // Billable Information
  customer: {
    type: String,
    trim: true
  },
  project: {
    type: String,
    trim: true
  },

  // File Attachments
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Audit Fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },

  // Invoice Reference (if converted to invoice)
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice'
  },

  // Recurring Expense Reference
  recurringExpenseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RecurringExpense'
  },

  // Tax Information
  taxAmount: {
    type: Number,
    default: 0
  },
  taxRate: {
    type: Number,
    default: 0
  },
  taxType: {
    type: String,
    enum: ['GST', 'VAT', 'Sales Tax', 'None'],
    default: 'None'
  },

  // Mileage Information (for travel expenses)
  mileage: {
    distance: Number,
    rate: Number,
    totalAmount: Number
  },

  // Approval Workflow
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  rejectionReason: String,

  // Soft Delete
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
expenseSchema.index({ organization: 1, date: -1 });
expenseSchema.index({ organization: 1, status: 1 });
expenseSchema.index({ organization: 1, vendor: 1 });
expenseSchema.index({ organization: 1, account: 1 });
expenseSchema.index({ organization: 1, billable: 1 });
expenseSchema.index({ organization: 1, createdBy: 1 });
expenseSchema.index({ organization: 1, isDeleted: 1 });

// Virtual for formatted amount
expenseSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(this.amount);
});

// Virtual for expense ID
expenseSchema.virtual('expenseId').get(function() {
  return `EXP-${this._id.toString().slice(-6).toUpperCase()}`;
});

// Pre-save middleware
expenseSchema.pre('save', function(next) {
  // Auto-generate reference if not provided
  if (!this.reference) {
    this.reference = `REF-${Date.now().toString().slice(-6)}`;
  }

  // Calculate tax amount if tax rate is provided
  if (this.taxRate > 0 && this.taxAmount === 0) {
    this.taxAmount = (this.amount * this.taxRate) / 100;
  }

  // Calculate mileage total if mileage is provided
  if (this.mileage && this.mileage.distance && this.mileage.rate) {
    this.mileage.totalAmount = this.mileage.distance * this.mileage.rate;
  }

  next();
});

// Static methods
expenseSchema.statics.getExpenseStats = async function(organizationId, filters = {}) {
  const matchStage = {
    organization: new mongoose.Types.ObjectId(organizationId),
    isDeleted: false,
    ...filters
  };

  const pipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalExpenses: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        unbilledAmount: {
          $sum: {
            $cond: [{ $eq: ['$status', 'unbilled'] }, '$amount', 0]
          }
        },
        billableAmount: {
          $sum: {
            $cond: ['$billable', '$amount', 0]
          }
        },
        nonBillableAmount: {
          $sum: {
            $cond: [{ $not: '$billable' }, '$amount', 0]
          }
        }
      }
    }
  ];

  const result = await this.aggregate(pipeline);
  return result[0] || {
    totalExpenses: 0,
    totalAmount: 0,
    unbilledAmount: 0,
    billableAmount: 0,
    nonBillableAmount: 0
  };
};

expenseSchema.statics.getExpensesByDateRange = async function(organizationId, startDate, endDate) {
  return this.find({
    organization: organizationId,
    date: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    },
    isDeleted: false
  }).sort({ date: -1 });
};

expenseSchema.statics.getExpensesByVendor = async function(organizationId, vendorId) {
  return this.find({
    organization: organizationId,
    vendor: vendorId,
    isDeleted: false
  }).sort({ date: -1 });
};

// Instance methods
expenseSchema.methods.convertToInvoice = async function() {
  if (this.status === 'invoiced') {
    throw new Error('Expense is already converted to invoice');
  }

  if (!this.billable) {
    throw new Error('Only billable expenses can be converted to invoices');
  }

  // Update status
  this.status = 'invoiced';
  await this.save();

  return this;
};

expenseSchema.methods.markAsReimbursed = async function() {
  this.status = 'reimbursed';
  await this.save();
  return this;
};

export default mongoose.model('Expense', expenseSchema);


