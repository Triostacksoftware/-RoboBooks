// models/BankTransaction.js
import mongoose from 'mongoose';

const bankTransactionSchema = new mongoose.Schema(
  {
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    type: {
      type: String,
      enum: ['deposit', 'withdrawal'],
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    txn_date: { type: Date, default: Date.now },
    reference: String,
    reconciled: { type: Boolean, default: false },
    description: String,
  },
  { timestamps: true },
);

export default mongoose.model('BankTransaction', bankTransactionSchema);
