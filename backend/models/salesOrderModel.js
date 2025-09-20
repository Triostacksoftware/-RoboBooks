import mongoose from "mongoose";

const salesOrderItemSchema = new mongoose.Schema({
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

  // Sales Order Details
  salesOrderNumber: { type: String, required: true },
  reference: { type: String },
  orderDate: { type: Date, required: true, default: Date.now },
  deliveryDate: { type: Date, required: true },
  terms: { type: String, default: "Due on Receipt" },
  salesperson: { type: String },
  deliveryMethod: { type: String },
  subject: { type: String },
  project: { type: String }, // Changed to String to handle empty values

  // Items
  items: [salesOrderItemSchema],

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
    default: null,
    validate: {
      validator: function(v) {
        // Allow null, undefined, or valid ObjectId
        return v === null || v === undefined || mongoose.Types.ObjectId.isValid(v);
      },
      message: 'additionalTaxId must be a valid ObjectId or null'
    },
    set: function(v) {
      // Convert empty strings to null
      if (v === "" || v === undefined) {
        return null;
      }
      return v;
    }
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
      filename: { type: String },
      originalName: { type: String },
      path: { type: String },
      size: { type: Number },
      mimetype: { type: String },
    },
  ],

  // Status and Tracking
  status: {
    type: String,
    enum: [
      "Draft",
      "Sent",
      "Viewed",
      "Confirmed",
      "Shipped",
      "Delivered",
      "Cancelled",
    ],
    default: "Draft",
  },
  sentAt: { type: Date },
  viewedAt: { type: Date },
  confirmedAt: { type: Date },
  shippedAt: { type: Date },
  deliveredAt: { type: Date },

  // Shipping Information
  shippingAddress: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
    country: { type: String },
  },
  shippingMethod: { type: String },
  shippingCost: { type: Number, default: 0.0 },
  trackingNumber: { type: String },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update the updatedAt field before saving
schema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});


// Index for better query performance
schema.index({ salesOrderNumber: 1 });
schema.index({ customerId: 1 });
schema.index({ status: 1 });
schema.index({ orderDate: -1 });
schema.index({ createdAt: -1 });

const SalesOrder = mongoose.model("SalesOrder", schema);

export default SalesOrder;


