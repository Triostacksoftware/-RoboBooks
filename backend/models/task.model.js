import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  project_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },
  assignedTo: { type: String, required: true },
  estimatedHours: { type: Number, default: 0 },
  actualHours: { type: Number, default: 0 },
  dueDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
schema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Task', schema);


