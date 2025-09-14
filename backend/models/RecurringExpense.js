import mongoose from "mongoose";

const recurringExpenseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
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
    enum: ["daily", "weekly", "monthly", "yearly"]
  },
  start_date: {
    type: Date,
    required: true
  },
  end_date: {
    type: Date,
    default: null
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  vendor: {
    type: String,
    trim: true
  },
  account: {
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
recurringExpenseSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

export default mongoose.model("RecurringExpense", recurringExpenseSchema);
