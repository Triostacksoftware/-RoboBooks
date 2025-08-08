// models/BankTransaction.js
import mongoose from 'mongoose';

const bankTransactionSchema = new mongoose.Schema(
  {
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    bankAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BankAccount',
      required: true,
    },
    type: {
      type: String,
      enum: ['deposit', 'withdrawal', 'income', 'expense'],
      required: true,
    },
    amount: { 
      type: Number, 
      required: true, 
      min: 0 
    },
    currency: { 
      type: String, 
      default: 'USD' 
    },
    txn_date: { 
      type: Date, 
      default: Date.now 
    },
    reference: String,
    reconciled: { 
      type: Boolean, 
      default: false 
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      trim: true,
      default: 'Uncategorized'
    },
    status: {
      type: String,
      enum: ['reconciled', 'pending', 'unreconciled'],
      default: 'unreconciled'
    },
    // Additional fields for better transaction management
    merchant: {
      type: String,
      trim: true
    },
    location: {
      type: String,
      trim: true
    },
    tags: [{
      type: String,
      trim: true
    }],
    // User who owns this transaction
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // External transaction ID from bank
    externalId: {
      type: String,
      trim: true
    },
    // Transaction metadata
    metadata: {
      type: Map,
      of: String
    }
  },
  { timestamps: true },
);

// Indexes for efficient querying
bankTransactionSchema.index({ userId: 1, txn_date: -1 });
bankTransactionSchema.index({ account: 1, reconciled: 1 });
bankTransactionSchema.index({ bankAccount: 1, status: 1 });
bankTransactionSchema.index({ externalId: 1 }, { unique: true, sparse: true });

export default mongoose.model('BankTransaction', bankTransactionSchema);
