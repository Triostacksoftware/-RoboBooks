import mongoose from 'mongoose';

const customFieldSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  module: {
    type: String,
    required: true,
    enum: ['expenses', 'bills', 'payments', 'purchase-orders', 'vendor-credits', 'vendors', 'recurring-bills', 'recurring-expenses']
  },
  fieldName: {
    type: String,
    required: true,
    trim: true
  },
  fieldType: {
    type: String,
    required: true,
    enum: ['text', 'number', 'decimal', 'amount', 'date', 'datetime', 'time', 'email', 'url', 'phone', 'select', 'multiselect', 'boolean', 'textarea', 'currency', 'percentage', 'attachment', 'lookup', 'auto-generate-number', 'checkbox', 'text-box-multi-line']
  },
  fieldLabel: {
    type: String,
    required: true,
    trim: true
  },
  isRequired: {
    type: Boolean,
    default: false
  },
  defaultValue: {
    type: mongoose.Schema.Types.Mixed
  },
  options: [{ type: String }], // For select fields
  helpText: {
    type: String,
    trim: true
  },
  inputFormat: {
    type: String,
    enum: ['', 'numbers', 'alphanumeric-without-spaces', 'alphanumeric-with-spaces', 'alphanumeric-with-hyphens-underscores', 'alphabets-without-spaces', 'alphabets-with-spaces', 'email', 'url', 'phone-number', 'custom']
  },
  dataPrivacy: {
    pii: {
      type: Boolean,
      default: false
    },
    ephi: {
      type: Boolean,
      default: false
    }
  },
  validation: {
    min: Number,
    max: Number,
    pattern: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Create compound index for efficient queries
customFieldSchema.index({ organizationId: 1, module: 1 });
customFieldSchema.index({ organizationId: 1, module: 1, fieldName: 1 }, { unique: true });

export default mongoose.model('CustomField', customFieldSchema);


