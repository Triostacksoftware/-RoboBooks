import mongoose from "mongoose";

const tcsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  rate: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  natureOfCollection: {
    type: String,
    required: true,
    trim: true,
  },
  section: {
    type: String,
    required: false,
    trim: true,
  },
  status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active",
  },
  isHigherRate: {
    type: Boolean,
    default: false,
  },
  applicableFrom: {
    type: Date,
  },
  applicableTo: {
    type: Date,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
tcsSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Index for faster queries
tcsSchema.index({ status: 1, applicableFrom: 1, applicableTo: 1 });

export default mongoose.model("TCS", tcsSchema);


