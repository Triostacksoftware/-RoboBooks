import { Schema, model } from "mongoose";

const providerSchema = new Schema(
  {
    name: {
      type: String,
      enum: ["google", "github", "linkedin", "apple", "azure-ad"],
      required: true,
    },
    providerId: { type: String, required: true },
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    companyName: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    phoneDialCode: { type: String, default: "+91" },
    phoneIso2: { type: String, default: "IN" },
    passwordHash: String,
    country: { type: String, default: "India" },
    state: { type: String, default: "Uttar Pradesh" },
    providers: [providerSchema],
    isActive: { type: Boolean, default: true },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
    approvedAt: { type: Date },
    rejectionReason: { type: String },
    lastLogin: { type: Date },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ phone: 1 }, { unique: true, sparse: true });

export default model("User", userSchema);


