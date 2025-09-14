import mongoose from "mongoose";

const vendorCreditSchema = new mongoose.Schema({
  vendor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  credit_number: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  credit_date: {
    type: Date,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  reference: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ["pending", "applied", "expired"],
    default: "pending"
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
vendorCreditSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Generate credit number before saving
vendorCreditSchema.pre('save', async function(next) {
  if (this.isNew && !this.credit_number) {
    const count = await this.constructor.countDocuments();
    this.credit_number = `VC-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

export default mongoose.model("VendorCredit", vendorCreditSchema);
