import mongoose from 'mongoose';

const billItemSchema = new mongoose.Schema({
  itemId: {
    type: String,
    required: true
  },
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
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  taxRate: {
    type: Number,
    min: 0,
    max: 100
  },
  taxAmount: {
    type: Number,
    min: 0
  }
});

const billSchema = new mongoose.Schema({
  billNumber: {
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
  vendorAddress: {
    type: String
  },
  billDate: {
    type: Date,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'received', 'overdue', 'paid', 'cancelled'],
    default: 'draft'
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  taxAmount: {
    type: Number,
    required: true,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  notes: {
    type: String
  },
  terms: {
    type: String
  },
  items: [billItemSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receivedAt: {
    type: Date
  },
  paidAt: {
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
billSchema.index({ organizationId: 1, status: 1 });
billSchema.index({ organizationId: 1, vendorId: 1 });
billSchema.index({ organizationId: 1, billDate: -1 });
billSchema.index({ organizationId: 1, dueDate: 1 });
billSchema.index({ billNumber: 1, organizationId: 1 }, { unique: true });

// Virtual for checking if bill is overdue
billSchema.virtual('isOverdue').get(function() {
  return this.status !== 'paid' && this.status !== 'cancelled' && new Date() > this.dueDate;
});

// Pre-save middleware to update status based on due date
billSchema.pre('save', function(next) {
  if (this.isModified('dueDate') || this.isModified('status')) {
    if (this.status !== 'paid' && this.status !== 'cancelled' && new Date() > this.dueDate) {
      this.status = 'overdue';
    }
  }
  next();
});

// Check if model already exists to prevent overwrite error
export default mongoose.models.Bill || mongoose.model('Bill', billSchema);


