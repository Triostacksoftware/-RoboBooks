import mongoose from "mongoose";

const purchaseOrderSchema = new mongoose.Schema({
  vendor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  po_number: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  order_date: {
    type: Date,
    required: true
  },
  expected_delivery_date: {
    type: Date,
    required: true
  },
  items: [{
    item_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unit_price: {
      type: Number,
      required: true,
      min: 0
    },
    total: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  tax_amount: {
    type: Number,
    default: 0,
    min: 0
  },
  total_amount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ["draft", "sent", "received", "cancelled"],
    default: "draft"
  },
  notes: {
    type: String,
    trim: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update the updated_at field before saving
purchaseOrderSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Generate PO number before saving
purchaseOrderSchema.pre('save', async function(next) {
  if (this.isNew && !this.po_number) {
    const count = await this.constructor.countDocuments();
    this.po_number = `PO-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

export default mongoose.model("PurchaseOrder", purchaseOrderSchema);
