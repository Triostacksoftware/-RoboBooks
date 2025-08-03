import { Schema, model } from "mongoose";

const providerSchema = new Schema(
  {
    name: {
      type: String,
      enum: ["google", "github", "linkedin", "apple", "azure-ad"],
      required: true,
    },
    providerId: { type: String, required: true }
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, trim: true },            // optional E.164
    passwordHash: String,                           // empty for OAuth-only
    providers: [providerSchema],
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ phone: 1 }, { unique: true, sparse: true });

export default model("User", userSchema);
