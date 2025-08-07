import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  project_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  task: { type: String, required: true },
  user: { type: String, required: true },
  date: { type: Date, required: true },
  hours: { type: Number, required: true, min: 0 },
  description: { type: String, default: '' },
  billable: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
schema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('TimeEntry', schema);