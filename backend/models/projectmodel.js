import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  user_id: { type: String, required: true },
  name: { type: String, required: true },
  client: { type: String, required: true },
  description: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['active', 'completed', 'on-hold', 'cancelled'],
    default: 'active'
  },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  budget: { type: Number, default: 0 },
  spent: { type: Number, default: 0 },
  revenue: { type: Number, default: 0 },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  teamMembers: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Update the updatedAt field before saving
schema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Project', schema);