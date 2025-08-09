import mongoose from "mongoose";

const invoiceItemSchema = new mongoose.Schema({
  itemId: { type: String }, // Changed to String to handle empty values
  details: { type: String, required: true },
  description: { type: String },
  quantity: { type: Number, default: 1.0 },
  unit: { type: String, default: "pcs" },
  rate: { type: Number, default: 0.0 },
  amount: { type: Number, default: 0.0 },
  taxRate: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
});

const schema = new mongoose.Schema({
  // Customer Information
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
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

  // Invoice Details
  invoiceNumber: { type: String, required: true, unique: true },
  orderNumber: { type: String },
  invoiceDate: { type: Date, required: true, default: Date.now },
  terms: { type: String, default: "Due on Receipt" },
  dueDate: { type: Date, required: true },
  salesperson: { type: String },
  subject: { type: String },
  project: { type: String }, // Changed to String to handle empty values

  // Items
  items: [invoiceItemSchema],

  // Summary
  subTotal: { type: Number, default: 0.0 },
  discount: { type: Number, default: 0 },
  discountType: {
    type: String,
    enum: ["percentage", "amount"],
    default: "percentage",
  },
  discountAmount: { type: Number, default: 0.0 },

  // GST Details
  taxAmount: { type: Number, default: 0.0 },
  cgstTotal: { type: Number, default: 0.0 },
  sgstTotal: { type: Number, default: 0.0 },
  igstTotal: { type: Number, default: 0.0 },

  // TDS/TCS Details
  additionalTaxType: {
    type: String,
    enum: ["TDS", "TCS", null],
    default: null,
  },
  additionalTaxId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "additionalTaxType",
  },
  additionalTaxRate: { type: Number, default: 0 },
  additionalTaxAmount: { type: Number, default: 0.0 },

  // Other
  adjustment: { type: Number, default: 0.0 },
  total: { type: Number, default: 0.0 },

  // Payment Information
  paymentTerms: { type: String },
  paymentMethod: { type: String },
  amountPaid: { type: Number, default: 0.0 },
  balanceDue: { type: Number, default: 0.0 },

  // Notes and Terms
  customerNotes: { type: String, default: "Thanks for your business." },
  termsConditions: { type: String },
  internalNotes: { type: String },

  // Files
  files: [
    {
      fileName: String,
      filePath: String,
      fileSize: Number,
      uploadedAt: { type: Date, default: Date.now },
    },
  ],

  // Status and Tracking
  status: {
    type: String,
    enum: [
      "Draft",
      "Sent",
      "Viewed",
      "Unpaid",
      "Paid",
      "Overdue",
      "Partially Paid",
      "Cancelled",
      "Void",
    ],
    default: "Draft",
  },

  // Email tracking
  emailSent: { type: Boolean, default: false },
  emailSentAt: { type: Date },
  lastViewedAt: { type: Date },
  remindersSent: { type: Number, default: 0 },

  // Currency
  currency: { type: String, default: "INR" },
  exchangeRate: { type: Number, default: 1 },

  // Timestamps
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

// Update the updated_at field before saving
schema.pre("save", function (next) {
  this.updated_at = new Date();
  next();
});

export default mongoose.model("Invoice", schema);
