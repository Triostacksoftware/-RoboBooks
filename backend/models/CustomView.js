import mongoose from 'mongoose';

const customFilterSchema = new mongoose.Schema({
  field: {
    type: String,
    required: true,
    enum: ['description', 'amount', 'vendor', 'account', 'category', 'reference', 'status', 'billable', 'hasReceipt', 'date']
  },
  operator: {
    type: String,
    required: true,
    enum: ['equals', 'contains', 'startsWith', 'endsWith', 'greaterThan', 'lessThan', 'greaterThanOrEqual', 'lessThanOrEqual', 'notEquals']
  },
  value: {
    type: String,
    required: true
  }
});

const customViewSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  module: {
    type: String,
    required: true,
    enum: ['expenses', 'bills', 'payments', 'purchase-orders', 'vendor-credits', 'vendors', 'recurring-bills', 'recurring-expenses'],
    default: 'expenses'
  },
  filters: [customFilterSchema],
  sortBy: {
    type: String,
    required: true,
    default: 'date'
  },
  sortOrder: {
    type: String,
    enum: ['asc', 'desc'],
    required: true,
    default: 'desc'
  },
  columns: [{
    type: String,
    enum: ['date', 'description', 'amount', 'vendor', 'account', 'category', 'reference', 'status', 'billable', 'hasReceipt']
  }],
  isDefault: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
customViewSchema.index({ organizationId: 1, module: 1, createdBy: 1 });
customViewSchema.index({ organizationId: 1, module: 1, isPublic: 1 });

// Ensure only one default view per module per organization
customViewSchema.index({ organizationId: 1, module: 1, isDefault: 1 }, { 
  unique: true, 
  partialFilterExpression: { isDefault: true } 
});

export default mongoose.model('CustomView', customViewSchema);
