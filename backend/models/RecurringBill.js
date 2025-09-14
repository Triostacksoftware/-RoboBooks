import mongoose from "mongoose";

const recurringBillSchema = new mongoose.Schema({
  vendor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  bill_number: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  frequency: {
    type: String,
    required: true,
    enum: ["weekly", "monthly", "quarterly", "yearly"]
  },
  start_date: {
    type: Date,
    required: true
  },
  end_date: {
    type: Date,
    default: null
  },
  due_days: {
    type: Number,
    default: 30,
    min: 1
  },
  description: {
    type: String,
    trim: true
  },
  is_active: {
    type: Boolean,
    default: true
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
recurringBillSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Generate bill number before saving
recurringBillSchema.pre('save', async function(next) {
  if (this.isNew && !this.bill_number) {
    const count = await this.constructor.countDocuments();
    this.bill_number = `RB-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

export default mongoose.model("RecurringBill", recurringBillSchema);
