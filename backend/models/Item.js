import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Goods", "Service"],
      required: true,
      default: "Goods",
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    unit: {
      type: String,
      trim: true,
    },
    hsnCode: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          return this.type === "Goods" ? v.length <= 8 : true;
        },
        message: "HSN code must be 8 digits or less for goods",
      },
    },
    sacCode: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          return this.type === "Service" ? v.length <= 6 : true;
        },
        message: "SAC code must be 6 digits or less for services",
      },
    },
    salesEnabled: {
      type: Boolean,
      default: true,
    },
    purchaseEnabled: {
      type: Boolean,
      default: true,
    },
    sellingPrice: {
      type: Number,
      min: 0,
      validate: {
        validator: function (v) {
          return !this.salesEnabled || v > 0;
        },
        message: "Selling price is required when sales is enabled",
      },
    },
    costPrice: {
      type: Number,
      min: 0,
      validate: {
        validator: function (v) {
          return !this.purchaseEnabled || v > 0;
        },
        message: "Cost price is required when purchase is enabled",
      },
    },
    salesAccount: {
      type: String,
      enum: ["Sales", "Services", "Other Income"],
      default: "Sales",
    },
    purchaseAccount: {
      type: String,
      enum: ["Cost of Goods Sold", "Purchase", "Expenses"],
      default: "Cost of Goods Sold",
    },
    salesDescription: {
      type: String,
      trim: true,
    },
    purchaseDescription: {
      type: String,
      trim: true,
    },
    preferredVendor: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    // GST Options
    intraGST: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
      validate: {
        validator: function (v) {
          return v >= 0 && v <= 100;
        },
        message: "IntraGST rate must be between 0 and 100",
      },
    },
    interGST: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
      validate: {
        validator: function (v) {
          return v >= 0 && v <= 100;
        },
        message: "InterGST rate must be between 0 and 100",
      },
    },
    // Additional fields for inventory tracking
    sku: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    barcode: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    category: {
      type: String,
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    // Physical attributes
    size: {
      type: String,
      trim: true,
    },
    color: {
      type: String,
      trim: true,
    },
    weight: {
      type: Number,
      min: 0,
    },
    dimensions: {
      length: { type: Number, min: 0 },
      width: { type: Number, min: 0 },
      height: { type: Number, min: 0 },
    },
    // Inventory tracking
    currentStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    reorderPoint: {
      type: Number,
      default: 0,
      min: 0,
    },
    // GST/Tax information
    gstRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 18,
    },
    // Status and metadata
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
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

// Indexes for better query performance
itemSchema.index({ name: 1 });
itemSchema.index({ type: 1 });
itemSchema.index({ category: 1 });
itemSchema.index({ isActive: 1 });
itemSchema.index({ sku: 1 });
itemSchema.index({ barcode: 1 });

// Virtual for GST code based on type
itemSchema.virtual("gstCode").get(function () {
  return this.type === "Goods" ? this.hsnCode : this.sacCode;
});

// Pre-save middleware to generate SKU if not provided
itemSchema.pre("save", function (next) {
  if (!this.sku) {
    const prefix = this.type === "Goods" ? "GDS" : "SRV";
    const timestamp = Date.now().toString().slice(-6);
    this.sku = `${prefix}-${timestamp}`;
  }
  next();
});

// Instance method to check if item is low in stock
itemSchema.methods.isLowStock = function () {
  return this.currentStock <= this.reorderPoint;
};

// Static method to find items by type
itemSchema.statics.findByType = function (type) {
  return this.find({ type, isActive: true });
};

// Static method to find low stock items
itemSchema.statics.findLowStock = function () {
  return this.find({
    $expr: { $lte: ["$currentStock", "$reorderPoint"] },
    isActive: true,
  });
};

const Item = mongoose.model("Item", itemSchema);

export default Item;
