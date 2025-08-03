import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  category: { type: String,  required: true },
  amount:   { type: Number,  required: true },
  date:     { type: Date,    required: true },
  billable: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Expense', expenseSchema);
