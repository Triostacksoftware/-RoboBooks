import mongoose from "mongoose";

const paymentMadeSchema = new mongoose.Schema({
  vendor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  bill_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bill',
    default: null
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  payment_date: {
    type: Date,
    required: true
  },
  payment_method: {
    type: String,
    required: true,
    enum: ["cash", "check", "bank_transfer", "credit_card", "other"]
  },
  reference_number: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "completed"
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
paymentMadeSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

export default mongoose.model("PaymentMade", paymentMadeSchema);
