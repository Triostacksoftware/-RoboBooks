import mongoose from "mongoose";

const schema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  email: { 
    type: String, 
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: { 
    type: String,
    trim: true
  },
  address: { 
    type: String,
    trim: true
  },
  commission: { 
    type: Number, 
    default: 0 
  },
  status: { 
    type: String, 
    enum: ["Active", "Inactive"], 
    default: "Active" 
  },
  notes: { 
    type: String,
    trim: true
  },
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update the updatedAt field before saving
schema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Index for better query performance
schema.index({ name: 1 });
schema.index({ email: 1 });
schema.index({ status: 1 });
schema.index({ createdAt: -1 });

const Salesperson = mongoose.model("Salesperson", schema);

export default Salesperson;


