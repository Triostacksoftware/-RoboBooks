import mongoose from "mongoose";

const recurringInvoiceItemSchema = new mongoose.Schema({
  itemId: { type: String },
  details: { type: String, required: true },
  description: { type: String },
  quantity: { type: Number, default: 1.0 },
  unit: { type: String, default: "pcs" },
  rate: { type: Number, default: 0.0 },
  amount: { type: Number, default: 0.0 },
  taxRate: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
});

const schema = new mongoose.Schema(
  {
    // Profile Information
    profileName: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },

    // Recurrence Settings
    frequency: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"],
      required: true,
      default: "monthly",
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    neverExpires: { type: Boolean, default: false },

    // Generation Tracking
    lastGeneratedDate: { type: Date },
    nextGenerationDate: { type: Date },
    generatedInvoices: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Invoice",
      },
    ],
    totalGenerated: { type: Number, default: 0 },

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
    orderNumber: { type: String },
    terms: { type: String, default: "Due on Receipt" },
    salesperson: { type: String },
    subject: { type: String },
    project: { type: String },

    // Items
    items: [recurringInvoiceItemSchema],

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

    // Notes and Terms
    customerNotes: { type: String, default: "Thanks for your business." },
    termsConditions: { type: String },
    internalNotes: { type: String },

    // Files
    files: [
      {
        filename: { type: String },
        originalName: { type: String },
        path: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    // Status and Metadata
    status: {
      type: String,
      enum: ["active", "paused", "completed"],
      default: "active",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
schema.index({ profileName: 1 });
schema.index({ customerId: 1 });
schema.index({ status: 1 });
schema.index({ isActive: 1 });
schema.index({ nextGenerationDate: 1 });

const RecurringInvoice = mongoose.model("RecurringInvoice", schema);
export default RecurringInvoice;


