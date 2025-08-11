import mongoose from 'mongoose';

const estimateItemSchema = new mongoose.Schema({
  itemId: { type: String },
  details: { type: String, required: true },
  description: { type: String },
  quantity: { type: Number, default: 1.0 },
  unit: { type: String, default: "pcs" },
  rate: { type: Number, default: 0.0 },
  amount: { type: Number, default: 0.0 },
  taxMode: { type: String, enum: ["GST", "IGST", "NON_TAXABLE", "NO_GST", "EXPORT"], default: "GST" },
  taxRate: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  cgst: { type: Number, default: 0 },
  sgst: { type: Number, default: 0 },
  igst: { type: Number, default: 0 },
  taxRemark: { type: String },
});

const estimateSchema = new mongoose.Schema({
  // Customer Information
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String },
  customerPhone: { type: String },
  customerAddress: { type: String },

  // Buyer Details
  buyerName: { type: String },
  buyerEmail: { type: String },
  buyerPhone: { type: String },
  buyerGstin: { type: String },
  buyerAddress: { type: String },

  // Seller Details
  sellerName: { type: String },
  sellerEmail: { type: String },
  sellerPhone: { type: String },
  sellerGstin: { type: String },
  sellerAddress: { type: String },

  // Quote Details
  quoteNumber: { type: String, required: true, unique: true },
  quoteDate: { type: Date, required: true, default: Date.now },
  validUntil: { type: Date, required: true },
  subject: { type: String },
  terms: { type: String, default: "Due on Receipt" },

  // Items
  items: [estimateItemSchema],

  // Summary
  subTotal: { type: Number, default: 0.0 },
  discount: { type: Number, default: 0 },
  discountType: { type: String, enum: ["percentage", "amount"], default: "percentage" },
  discountAmount: { type: Number, default: 0.0 },
  taxType: { type: String, default: "GST" },
  taxRate: { type: Number, default: 18 },
  taxAmount: { type: Number, default: 0.0 },
  cgstTotal: { type: Number, default: 0.0 },
  sgstTotal: { type: Number, default: 0.0 },
  igstTotal: { type: Number, default: 0.0 },
  
  // TDS/TCS fields
  additionalTaxType: { type: String, enum: ["TDS", "TCS", null], default: null },
  additionalTaxId: { type: String },
  additionalTaxRate: { type: Number, default: 0 },
  additionalTaxAmount: { type: Number, default: 0.0 },
  
  adjustment: { type: Number, default: 0.0 },
  total: { type: Number, default: 0.0 },
  
  // Additional fields
  customerNotes: { type: String, default: "Thanks for your business." },
  termsConditions: { type: String },
  internalNotes: { type: String },
  files: [{ type: String }],
  currency: { type: String, default: "INR" },
  
  // Address blocks
  billingAddress: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String, default: "India" },
    zipCode: { type: String },
  },
  shippingAddress: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String, default: "India" },
    zipCode: { type: String },
  },
  placeOfSupplyState: { type: String },
  
  // Status
  status: { type: String, required: true, enum: ['draft', 'sent', 'accepted', 'rejected', 'expired'], default: 'draft' }
}, { timestamps: true });

export default mongoose.model('Estimate', estimateSchema);
