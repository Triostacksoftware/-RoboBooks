import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true,
  },
  description: { type: String },
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: true,
  },
  quantity: { type: Number, required: true, min: 0 },
  rate: { type: Number, required: true, min: 0 },
  amount: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0 },
  tax: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tax",
  },
  taxAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true, min: 0 },
});

const schema = new mongoose.Schema({
  // Basic Information
  purchaseOrderNumber: { type: String, required: true, unique: true },
  referenceNumber: { type: String },
  date: { type: Date, required: true, default: Date.now },
  deliveryDate: { type: Date },

  // Vendor Information
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    required: true,
  },

  // Delivery Information
  deliveryAddress: {
    type: {
      type: String,
      enum: ["organization", "customer"],
      default: "organization",
    },
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    zipCode: { type: String },
    phone: { type: String },
    email: { type: String },
  },

  // Shipment and Payment
  shipmentPreference: { type: String },
  paymentTerms: { type: String, default: "Due on Receipt" },

  // Items
  items: [itemSchema],

  // Financial Information
  subTotal: { type: Number, required: true, min: 0 },
  discount: {
    type: {
      type: String,
      enum: ["percentage", "amount"],
      default: "percentage",
    },
    value: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
  },
  tax: {
    type: { type: String, enum: ["TDS", "TCS"], default: "TDS" },
    taxId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tax",
    },
    amount: { type: Number, default: 0 },
  },
  adjustment: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true, min: 0 },

  // Notes and Terms
  customerNotes: { type: String },
  termsAndConditions: { type: String },

  // Status and Workflow
  status: {
    type: String,
    enum: [
      "draft",
      "sent",
      "acknowledged",
      "partially_received",
      "received",
      "closed",
      "cancelled",
    ],
    default: "draft",
  },

  // Attachments
  attachments: [
    {
      filename: { type: String, required: true },
      originalName: { type: String, required: true },
      mimetype: { type: String, required: true },
      size: { type: Number, required: true },
      path: { type: String, required: true },
      uploadedAt: { type: Date, default: Date.now },
    },
  ],

  // Workflow Tracking
  sentAt: { type: Date },
  acknowledgedAt: { type: Date },
  receivedAt: { type: Date },
  closedAt: { type: Date },

  // Conversion Tracking
  convertedToBill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bill",
  },
  convertedAt: { type: Date },

  // User and Organization
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
  },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Indexes for better performance
schema.index({ organization: 1, date: -1 });
schema.index({ organization: 1, status: 1 });
schema.index({ organization: 1, vendor: 1 });
schema.index({ organization: 1, createdBy: 1 });
schema.index({ purchaseOrderNumber: 1 });

// Update the updatedAt field before saving
schema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Generate purchase order number
schema.pre("save", async function (next) {
  if (this.isNew && !this.purchaseOrderNumber) {
    const count = await mongoose.model("PurchaseOrder").countDocuments({
      organization: this.organization,
    });
    this.purchaseOrderNumber = `PO-${String(count + 1).padStart(5, "0")}`;
  }
  next();
});

// Virtual for total items count
schema.virtual("totalItems").get(function () {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Virtual for days until delivery
schema.virtual("daysUntilDelivery").get(function () {
  if (!this.deliveryDate) return null;
  const today = new Date();
  const delivery = new Date(this.deliveryDate);
  const diffTime = delivery - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Ensure virtual fields are serialized
schema.set("toJSON", { virtuals: true });
schema.set("toObject", { virtuals: true });

export default mongoose.model("PurchaseOrder", schema);

