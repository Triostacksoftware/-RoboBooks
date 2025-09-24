import mongoose from "mongoose";

const schema = new mongoose.Schema({
  // Basic Information
  date: { type: Date, required: true, default: Date.now },
  expenseAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: true,
  },
  amount: { type: Number, required: true, min: 0 },
  paidThrough: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: true,
  },

  // Vendor and Customer Information
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
  },

  // Document Information
  invoiceNumber: { type: String },
  referenceNumber: { type: String },
  notes: { type: String, maxlength: 500 },

  // Tax Information
  taxAmount: { type: Number, default: 0 },
  taxRate: { type: Number, default: 0 },
  isTaxInclusive: { type: Boolean, default: false },

  // Project and Category
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
  },
  category: {
    type: String,
    enum: [
      "travel",
      "meals",
      "supplies",
      "equipment",
      "office",
      "marketing",
      "utilities",
      "rent",
      "insurance",
      "other",
    ],
    default: "other",
  },

  // Status and Approval
  status: {
    type: String,
    enum: ["draft", "pending", "approved", "rejected", "paid"],
    default: "draft",
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  approvedAt: { type: Date },

  // Receipts and Attachments
  receipts: [
    {
      filename: { type: String, required: true },
      originalName: { type: String, required: true },
      mimetype: { type: String, required: true },
      size: { type: Number, required: true },
      path: { type: String, required: true },
      uploadedAt: { type: Date, default: Date.now },
    },
  ],

  // Reporting and Tags
  tags: [{ type: String }],
  reportingTags: [{ type: String }],

  // Mileage (for travel expenses)
  mileage: {
    distance: { type: Number },
    rate: { type: Number },
    totalAmount: { type: Number },
  },

  // Recurring Information
  isRecurring: { type: Boolean, default: false },
  recurringPattern: {
    frequency: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"],
    },
    interval: { type: Number, default: 1 },
    endDate: { type: Date },
  },

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

// Update the updatedAt field before saving
schema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("Expense", schema);
