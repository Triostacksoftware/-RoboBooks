import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  customerType: {
    type: String,
    enum: ['Business', 'Individual'],
    required: true,
    default: 'Business'
  },
  salutation: {
    type: String,
    enum: ['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.'],
    default: 'Mr.'
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  companyName: {
    type: String,
    trim: true
  },
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  workPhone: {
    type: String,
    trim: true
  },
  mobile: {
    type: String,
    trim: true
  },
  pan: {
    type: String,
    trim: true,
    uppercase: true
  },
  currency: {
    type: String,
    default: 'INR',
    enum: ['INR', 'USD', 'EUR', 'GBP']
  },
  openingBalance: {
    type: Number,
    default: 0
  },
  paymentTerms: {
    type: String,
    enum: ['Due on Receipt', 'Net 15', 'Net 30', 'Net 45', 'Net 60'],
    default: 'Due on Receipt'
  },
  portalEnabled: {
    type: Boolean,
    default: false
  },
  portalLanguage: {
    type: String,
    enum: ['English', 'Hindi', 'Spanish', 'French'],
    default: 'English'
  },
  // Address information
  billingAddress: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  // Contact persons
  contactPersons: [{
    name: String,
    email: String,
    phone: String,
    designation: String
  }],
  // Financial information
  receivables: {
    type: Number,
    default: 0
  },
  unusedCredits: {
    type: Number,
    default: 0
  },
  // Status and metadata
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    default: null
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

// Indexes for better query performance
customerSchema.index({ displayName: 1 });
customerSchema.index({ email: 1 });
customerSchema.index({ companyName: 1 });
customerSchema.index({ isActive: 1 });
customerSchema.index({ customerType: 1 });

// Virtual for full name
customerSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for display name
customerSchema.virtual('name').get(function() {
  return this.displayName || this.fullName;
});

// Pre-save middleware to generate display name if not provided
customerSchema.pre('save', function(next) {
  if (!this.displayName) {
    this.displayName = this.customerType === 'Business' 
      ? (this.companyName || this.fullName)
      : this.fullName;
  }
  next();
});

// Instance method to get total balance
customerSchema.methods.getTotalBalance = function() {
  return this.receivables - this.unusedCredits;
};

// Static method to find active customers
customerSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

// Static method to find customers by type
customerSchema.statics.findByType = function(type) {
  return this.find({ customerType: type, isActive: true });
};

const Customer = mongoose.model('Customer', customerSchema);

export default Customer; 