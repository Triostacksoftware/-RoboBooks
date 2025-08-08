import mongoose from 'mongoose';

const bankAccountSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    bank: {
      type: String,
      required: true,
      trim: true
    },
    accountNumber: {
      type: String,
      required: true,
      trim: true
    },
    balance: {
      type: Number,
      default: 0
    },
    type: {
      type: String,
      enum: ['checking', 'savings', 'credit', 'loan'],
      required: true
    },
    status: {
      type: String,
      enum: ['connected', 'pending', 'disconnected', 'error'],
      default: 'pending'
    },
    lastSync: {
      type: Date,
      default: Date.now
    },
    currency: {
      type: String,
      default: 'USD'
    },
    accountType: {
      type: String,
      trim: true
    },
    routingNumber: {
      type: String,
      trim: true
    },
    swiftCode: {
      type: String,
      trim: true
    },
    // Connection details for bank integration
    connectionId: {
      type: String,
      trim: true
    },
    institutionId: {
      type: String,
      trim: true
    },
    // Sync settings
    autoSync: {
      type: Boolean,
      default: true
    },
    syncFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'daily'
    },
    // Error tracking
    lastError: {
      message: String,
      timestamp: Date
    },
    // User who owns this account
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

// Indexes for efficient querying
bankAccountSchema.index({ userId: 1, status: 1 });
bankAccountSchema.index({ connectionId: 1 }, { unique: true, sparse: true });

export default mongoose.model('BankAccount', bankAccountSchema);
