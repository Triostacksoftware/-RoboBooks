import mongoose from 'mongoose';

const vendorCreditSchema = new mongoose.Schema({
  creditNumber: {
    type: String,
    required: true,
    unique: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  vendorName: {
    type: String,
    required: true
  },
  vendorEmail: {
    type: String
  },
  creditDate: {
    type: Date,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['draft', 'issued', 'applied', 'cancelled', 'refunded'],
    default: 'draft'
  },
  reference: {
    type: String
  },
  reason: {
    type: String,
    required: true
  },
  notes: {
    type: String
  },
  // Line items for detailed credit breakdown
  items: [{
    itemName: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    rate: {
      type: Number,
      required: true,
      min: 0
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    taxRate: {
      type: Number,
      default: 0
    },
    taxAmount: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  // Financial calculations
  subtotal: {
    type: Number,
    default: 0
  },
  taxAmount: {
    type: Number,
    default: 0
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    default: 'fixed'
  },
  discountValue: {
    type: Number,
    default: 0
  },
  appliedToBills: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bill'
  }],
  appliedAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  remainingAmount: {
    type: Number,
    min: 0
  },
  // Refund information
  refundAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  refundDate: {
    type: Date
  },
  refundMethod: {
    type: String,
    enum: ['cash', 'check', 'bank_transfer', 'credit_card', 'debit_card', 'upi', 'other']
  },
  refundReference: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  issuedAt: {
    type: Date
  },
  appliedAt: {
    type: Date
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  customFields: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, { timestamps: true });

// Indexes for efficient queries
vendorCreditSchema.index({ organizationId: 1, status: 1 });
vendorCreditSchema.index({ organizationId: 1, vendorId: 1 });
vendorCreditSchema.index({ organizationId: 1, creditDate: -1 });
vendorCreditSchema.index({ creditNumber: 1, organizationId: 1 }, { unique: true });

// Pre-save middleware to calculate amounts
vendorCreditSchema.pre('save', function(next) {
  // Calculate subtotal from items
  if (this.items && this.items.length > 0) {
    this.subtotal = this.items.reduce((sum, item) => sum + (item.amount || 0), 0);
    this.taxAmount = this.items.reduce((sum, item) => sum + (item.taxAmount || 0), 0);
  }
  
  // Calculate discount
  if (this.discountType === 'percentage' && this.discountValue > 0) {
    this.discountAmount = (this.subtotal * this.discountValue) / 100;
  } else if (this.discountType === 'fixed' && this.discountValue > 0) {
    this.discountAmount = this.discountValue;
  }
  
  // Calculate total amount
  this.amount = this.subtotal + this.taxAmount - this.discountAmount;
  
  // Calculate remaining amount
  if (this.isNew || this.isModified('amount') || this.isModified('appliedAmount') || this.isModified('refundAmount')) {
    this.remainingAmount = this.amount - (this.appliedAmount || 0) - (this.refundAmount || 0);
  }
  
  // Update status based on remaining amount
  if (this.remainingAmount === 0 && this.status === 'issued') {
    if (this.refundAmount > 0) {
      this.status = 'refunded';
    } else {
      this.status = 'applied';
    }
  }
  
  next();
});

// Method to apply credit to bills
vendorCreditSchema.methods.applyToBills = async function(billIds, amount) {
  if (amount > this.remainingAmount) {
    throw new Error('Cannot apply more than remaining credit amount');
  }
  
  if (this.status !== 'issued') {
    throw new Error('Credit must be issued before applying to bills');
  }
  
  this.appliedToBills.push(...billIds);
  this.appliedAmount = (this.appliedAmount || 0) + amount;
  this.remainingAmount = this.amount - this.appliedAmount;
  
  if (this.remainingAmount === 0) {
    this.status = 'applied';
    this.appliedAt = new Date();
  }
  
  return this.save();
};

// Method to check if credit can be applied
vendorCreditSchema.methods.canApply = function(amount) {
  return this.status === 'issued' && this.remainingAmount >= amount;
};

// Method to record refund
vendorCreditSchema.methods.recordRefund = async function(refundData) {
  if (this.status !== 'issued') {
    throw new Error('Credit must be issued before recording refund');
  }
  
  if (refundData.amount > this.remainingAmount) {
    throw new Error('Cannot refund more than remaining credit amount');
  }
  
  this.refundAmount = (this.refundAmount || 0) + refundData.amount;
  this.refundDate = refundData.refundDate || new Date();
  this.refundMethod = refundData.refundMethod;
  this.refundReference = refundData.refundReference;
  
  this.remainingAmount = this.amount - (this.appliedAmount || 0) - this.refundAmount;
  
  if (this.remainingAmount === 0) {
    this.status = 'refunded';
  }
  
  return this.save();
};

export default mongoose.models.VendorCredit || mongoose.model('VendorCredit', vendorCreditSchema);


