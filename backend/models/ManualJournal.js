import mongoose from "mongoose";

const journalEntrySchema = new mongoose.Schema({
  account: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  contact: {
    type: String,
    trim: true,
  },
  debit: {
    type: Number,
    default: 0,
    min: 0,
  },
  credit: {
    type: Number,
    default: 0,
    min: 0,
  },
  reference: {
    type: String,
    trim: true,
  },
});

const manualJournalSchema = new mongoose.Schema(
  {
    journalNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    journalDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    reference: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    reportingMethod: {
      type: String,
      enum: ["accrual_and_cash", "accrual_only", "cash_only"],
      default: "accrual_and_cash",
    },
    currency: {
      type: String,
      default: "INR",
      trim: true,
    },
    entries: [journalEntrySchema],
    totalDebit: {
      type: Number,
      required: true,
      min: 0,
    },
    totalCredit: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["draft", "posted", "cancelled"],
      default: "draft",
    },
    createdBy: {
      type: String,
      required: true,
    },
    postedBy: {
      type: String,
    },
    postedAt: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
manualJournalSchema.index({ journalNumber: 1 });
manualJournalSchema.index({ journalDate: 1 });
manualJournalSchema.index({ status: 1 });
manualJournalSchema.index({ createdBy: 1 });

// Pre-save middleware to calculate totals
manualJournalSchema.pre("save", function (next) {
  if (this.entries && this.entries.length > 0) {
    this.totalDebit = this.entries.reduce(
      (sum, entry) => sum + (entry.debit || 0),
      0
    );
    this.totalCredit = this.entries.reduce(
      (sum, entry) => sum + (entry.credit || 0),
      0
    );
  }
  next();
});

// Validate that debits equal credits
manualJournalSchema.pre("save", function (next) {
  if (this.totalDebit !== this.totalCredit) {
    return next(new Error("Total debits must equal total credits"));
  }
  next();
});

const ManualJournal = mongoose.model("ManualJournal", manualJournalSchema);

export default ManualJournal;
