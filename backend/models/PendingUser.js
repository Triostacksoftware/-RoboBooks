import { Schema, model } from "mongoose";

const pendingUserSchema = new Schema(
  {
    companyName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    phoneDialCode: { type: String, default: "+91" },
    phoneIso2: { type: String, default: "IN" },
    passwordHash: { type: String, required: true },
    country: { type: String, default: "India" },
    state: { type: String, default: "Uttar Pradesh" },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
    reviewedAt: { type: Date },
    rejectionReason: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

pendingUserSchema.index({ email: 1 }, { unique: true, sparse: true });
pendingUserSchema.index({ phone: 1 }, { unique: true, sparse: true });

export default model("PendingUser", pendingUserSchema);


