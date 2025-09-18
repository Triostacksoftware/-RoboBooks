import mongoose from 'mongoose';

const deliveryChallanItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  itemName: {
    type: String,
    required: true,
    trim: true
  },
  hsn: {
    type: String,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0.01,
    default: 1.0
  },
  uom: {
    type: String,
    required: true,
    trim: true
  },
  rate: {
    type: Number,
    default: 0.0,
    min: 0
  },
  amount: {
    type: Number,
    default: 0.0,
    min: 0
  },
  notes: {
    type: String,
    trim: true
  }
});

const auditEntrySchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: ['Created', 'Opened', 'Delivered', 'Emailed', 'Returned', 'Partially Returned']
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: String
});

const emailLogSchema = new mongoose.Schema({
  to: {
    type: String,
    required: true
  },
  cc: [String],
  subject: String,
  message: String,
  timestamp: {
    type: Date,
    default: Date.now
  },
  messageId: String,
  status: {
    type: String,
    enum: ['sent', 'failed'],
    default: 'sent'
  }
});

const schema = new mongoose.Schema({
  // Organization and Financial Year
  orgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  fy: {
    type: String,
    required: true,
    trim: true
  },
  numberingSeries: {
    type: String,
    default: 'DC'
  },

  // Customer Information
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  customerEmail: {
    type: String,
    trim: true
  },
  customerPhone: {
    type: String,
    trim: true
  },

  // Delivery Challan Details
  challanNo: {
    type: String,
    required: true,
    maxlength: 16,
    trim: true
  },
  challanDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  challanType: {
    type: String,
    required: true,
    enum: ['Job Work', 'Stock Transfer', 'Unknown Qty', 'Parts', 'Other'],
    default: 'Other'
  },
  referenceNo: {
    type: String,
    trim: true
  },
  placeOfSupply: {
    type: String,
    trim: true
  },

  // Shipping Information
  shipTo: {
    name: String,
    address: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  dispatchFrom: {
    name: String,
    address: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },

  // Items
  items: [deliveryChallanItemSchema],

  // Financial Summary
  subTotal: {
    type: Number,
    default: 0.0,
    min: 0
  },
  discount: {
    type: Number,
    default: 0.0,
    min: 0
  },
  discountType: {
    type: String,
    enum: ['percentage', 'amount'],
    default: 'percentage'
  },
  discountAmount: {
    type: Number,
    default: 0.0,
    min: 0
  },
  adjustment: {
    type: Number,
    default: 0.0
  },
  total: {
    type: Number,
    default: 0.0,
    min: 0
  },

  // Status Management
  status: {
    type: String,
    enum: ['Draft', 'Open', 'Delivered', 'Returned', 'Partially Returned'],
    default: 'Draft'
  },
  invoiceStatus: {
    type: String,
    enum: ['Not Invoiced', 'Partially Invoiced', 'Fully Invoiced'],
    default: 'Not Invoiced'
  },

  // Notes and Terms
  notes: {
    type: String,
    trim: true
  },
  terms: {
    type: String,
    trim: true
  },

  // Files and Attachments
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Audit and Email Tracking
  audit: [auditEntrySchema],
  emailLog: [emailLogSchema],

  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for performance and uniqueness
schema.index({ orgId: 1, fy: 1, challanNo: 1 }, { unique: true });
schema.index({ customerId: 1, status: 1 });
schema.index({ status: 1, challanDate: -1 });
schema.index({ createdAt: -1 });

// Pre-save middleware to calculate totals
schema.pre('save', function(next) {
  if (this.isModified('items') || this.isModified('discount') || this.isModified('adjustment')) {
    // Calculate subtotal
    this.subTotal = this.items.reduce((sum, item) => {
      return sum + (item.quantity * item.rate);
    }, 0);

    // Calculate discount amount
    if (this.discountType === 'percentage') {
      this.discountAmount = (this.subTotal * this.discount) / 100;
    } else {
      this.discountAmount = this.discount;
    }

    // Calculate total
    this.total = this.subTotal - this.discountAmount + this.adjustment;
  }
  next();
});

// Pre-save middleware to add audit entry
schema.pre('save', function(next) {
  if (this.isNew) {
    this.audit.push({
      action: 'Created',
      timestamp: new Date()
    });
  }
  next();
});

// Virtual for formatted challan number
schema.virtual('formattedChallanNo').get(function() {
  return `${this.numberingSeries}-${this.challanNo}`;
});

// Virtual for status transitions
schema.virtual('canEdit').get(function() {
  return ['Draft'].includes(this.status);
});

schema.virtual('canDelete').get(function() {
  return ['Draft'].includes(this.status);
});

// Instance methods
schema.methods.canTransitionTo = function(newStatus) {
  const validTransitions = {
    'Draft': ['Open'],
    'Open': ['Delivered', 'Returned', 'Partially Returned'],
    'Delivered': ['Returned', 'Partially Returned'],
    'Returned': [],
    'Partially Returned': []
  };
  
  return validTransitions[this.status]?.includes(newStatus) || false;
};

schema.methods.addAuditEntry = function(action, userId = null, notes = '') {
  this.audit.push({
    action,
    timestamp: new Date(),
    userId,
    notes
  });
};

schema.methods.addEmailLog = function(emailData) {
  this.emailLog.push({
    to: emailData.to,
    cc: emailData.cc || [],
    subject: emailData.subject,
    message: emailData.message,
    messageId: emailData.messageId,
    status: emailData.status || 'sent'
  });
};

// Static methods
schema.statics.getNextChallanNumber = async function(orgId, fy, numberingSeries = 'DC') {
  const lastChallan = await this.findOne({ orgId, fy })
    .sort({ challanNo: -1 })
    .select('challanNo');
  
  if (!lastChallan) {
    return '00001';
  }
  
  const lastNumber = parseInt(lastChallan.challanNo);
  return String(lastNumber + 1).padStart(5, '0');
};

const DeliveryChallan = mongoose.model('DeliveryChallan', schema);

export default DeliveryChallan;


