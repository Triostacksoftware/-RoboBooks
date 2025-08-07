import mongoose from 'mongoose';

const invoiceItemSchema = new mongoose.Schema({
  details: { type: String, required: true },
  quantity: { type: String, default: '1.00' },
  rate: { type: String, default: '0.00' },
  amount: { type: String, default: '0.00' }
});

const schema = new mongoose.Schema({
  // Customer Information
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  customerName: { type: String, required: true },
  
  // Invoice Details
  invoiceNumber: { type: String, required: true, unique: true },
  orderNumber: { type: String },
  invoiceDate: { type: String, required: true },
  terms: { type: String, default: 'Due on Receipt' },
  dueDate: { type: String, required: true },
  salesperson: { type: String },
  subject: { type: String },
  
  // Items
  items: [invoiceItemSchema],
  
  // Summary
  subTotal: { type: String, default: '0.00' },
  discount: { type: String, default: '0' },
  discountAmount: { type: String, default: '0.00' },
  taxType: { type: String, enum: ['TDS', 'TCS'], default: 'TDS' },
  taxAmount: { type: String, default: '-0.00' },
  adjustment: { type: String, default: '0.00' },
  total: { type: String, default: '0.00' },
  
  // Notes and Terms
  customerNotes: { type: String, default: 'Thanks for your business.' },
  termsConditions: { type: String },
  
  // Files
  files: [{ type: String }],
  
  // Status
  status: { 
    type: String, 
    enum: ['Draft', 'Sent', 'Unpaid', 'Paid', 'Overdue', 'Partially Paid', 'Canceled'], 
    default: 'Draft' 
  },
  
  // Timestamps
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Update the updated_at field before saving
schema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

export default mongoose.model('Invoice', schema);