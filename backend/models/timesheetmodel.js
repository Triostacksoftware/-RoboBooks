import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  project_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project', 
    required: true 
  },
  task: { 
    type: String, 
    required: true 
  },
  user: { 
    type: String, 
    required: true 
  },
  date: { 
    type: Date, 
    required: true 
  },
  hours: { 
    type: Number, 
    required: true, 
    min: 0,
    default: 0
  },
  description: { 
    type: String, 
    default: '' 
  },
  billable: { 
    type: Boolean, 
    default: true 
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed'],
    default: 'pending'
  },
  timerStartedAt: {
    type: Date,
    default: null
  },
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  rate: {
    type: Number,
    min: 0,
    default: 0
  },
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

// Virtual for formatted date
schema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString();
});

// Virtual for total amount (if rate is set)
schema.virtual('totalAmount').get(function() {
  return this.hours * this.rate;
});

// Index for better query performance
schema.index({ user: 1, date: -1 });
schema.index({ project_id: 1, date: -1 });
schema.index({ status: 1 });
schema.index({ billable: 1 });

export default mongoose.model('TimeEntry', schema);