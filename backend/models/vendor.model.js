import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  gstin: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true 
  },
  companyName: { 
    type: String, 
    default: '' 
  },
  displayName: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    default: '' 
  },
  phone: { 
    type: String, 
    default: '' 
  },
  workPhone: { 
    type: String, 
    default: '' 
  },
  mobile: { 
    type: String, 
    default: '' 
  },
  address: { 
    type: String, 
    default: '' 
  },
  contactInfo: { 
    type: String, 
    default: '' 
  },
  type: { 
    type: String, 
    enum: ['business', 'individual'], 
    default: 'business' 
  },
  salutation: { 
    type: String, 
    default: 'Mr.' 
  },
  firstName: { 
    type: String, 
    default: '' 
  },
  lastName: { 
    type: String, 
    default: '' 
  },
  pan: { 
    type: String, 
    default: '' 
  },
  msmeRegistered: { 
    type: Boolean, 
    default: false 
  },
  currency: { 
    type: String, 
    default: 'INR- Indian Rupee' 
  },
  openingBalance: { 
    type: Number, 
    default: 0 
  },
  paymentTerms: { 
    type: String, 
    default: 'Due on Receipt' 
  },
  tds: { 
    type: String, 
    default: '' 
  },
  enablePortal: { 
    type: Boolean, 
    default: false 
  },
  portalLanguage: { 
    type: String, 
    default: 'English' 
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive'], 
    default: 'active' 
  },
  contactPersons: [{
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    designation: { type: String, default: '' }
  }],
  billingAddress: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    country: { type: String, default: 'India' },
    zipCode: { type: String, default: '' }
  },
  shippingAddress: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    country: { type: String, default: 'India' },
    zipCode: { type: String, default: '' }
  },
  payables: { 
    type: Number, 
    default: 0 
  },
  unusedCredits: { 
    type: Number, 
    default: 0 
  }
}, { timestamps: true });

export default mongoose.model('Vendor', vendorSchema);
