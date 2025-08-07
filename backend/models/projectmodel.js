import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    default: '' 
  },
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'on-hold', 'cancelled'],
    default: 'active'
  },
  start_date: {
    type: Date
  },
  end_date: {
    type: Date
  },
  budget: {
    type: Number,
    min: 0
  },
  rate: {
    type: Number,
    min: 0
  },
  manager: {
    type: String
  },
  team_members: [{
    type: String
  }],
  tags: [{
    type: String
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update the updatedAt field before saving
schema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for project duration
schema.virtual('duration').get(function() {
  if (this.start_date && this.end_date) {
    const diffTime = Math.abs(this.end_date - this.start_date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
  return null;
});

// Index for better query performance
schema.index({ name: 1 });
schema.index({ status: 1 });
schema.index({ customer_id: 1 });

export default mongoose.model('Project', schema);