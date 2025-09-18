import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  paymentNumber: {
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
  paymentDate: {
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
  paymentMethod: {
    type: String,
    enum: ['cash', 'check', 'bank_transfer', 'credit_card', 'debit_card', 'upi', 'other'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  reference: {
    type: String
  },
  notes: {
    type: String
  },
  billIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bill'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  processedAt: {
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
paymentSchema.index({ organizationId: 1, status: 1 });
paymentSchema.index({ organizationId: 1, vendorId: 1 });
paymentSchema.index({ organizationId: 1, paymentDate: -1 });
paymentSchema.index({ paymentNumber: 1, organizationId: 1 }, { unique: true });

export default mongoose.models.Payment || mongoose.model('Payment', paymentSchema);


