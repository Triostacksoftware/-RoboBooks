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
    enum: ['draft', 'issued', 'applied', 'cancelled'],
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

// Pre-save middleware to calculate remaining amount
vendorCreditSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('amount') || this.isModified('appliedAmount')) {
    this.remainingAmount = this.amount - (this.appliedAmount || 0);
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

export default mongoose.models.VendorCredit || mongoose.model('VendorCredit', vendorCreditSchema);


