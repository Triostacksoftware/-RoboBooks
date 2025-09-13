import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true
  },
  name: { 
    type: String, 
    required: true 
  },
  client: {
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
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  start_date: {
    type: Date
  },
  end_date: {
    type: Date
  },
  budget: {
    type: Number,
    min: 0,
    default: 0
  },
  spent: {
    type: Number,
    min: 0,
    default: 0
  },
  revenue: {
    type: Number,
    min: 0,
    default: 0
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  rate: {
    type: Number,
    min: 0
  },
  manager: {
    type: String
  },
  teamMembers: [{
    type: String
  }],
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
  const startDate = this.startDate || this.start_date;
  const endDate = this.endDate || this.end_date;
  if (startDate && endDate) {
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
  return null;
});

// Index for better query performance
schema.index({ user_id: 1 });
schema.index({ name: 1 });
schema.index({ status: 1 });
schema.index({ customer_id: 1 });

export default mongoose.model('Project', schema);