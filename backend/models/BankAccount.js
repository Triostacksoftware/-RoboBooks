import mongoose from "mongoose";

const bankAccountSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    accountCode: {
      type: String,
      trim: true,
    },
    currency: {
      type: String,
      required: true,
      default: "INR",
    },
    accountNumber: {
      type: String,
      trim: true,
    },
    bankName: {
      type: String,
      trim: true,
    },
    ifsc: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
    accountType: {
      type: String,
      enum: ["bank", "credit_card"],
      required: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "closed"],
      default: "active",
    },
    lastSync: {
      type: Date,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one primary account per user
bankAccountSchema.pre("save", async function (next) {
  if (this.isPrimary) {
    await this.constructor.updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { isPrimary: false }
    );
  }
  next();
});

export default mongoose.model("BankAccount", bankAccountSchema);
