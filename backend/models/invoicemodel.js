import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  project_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  number: { type: String, required: true },
  date: { type: Date, required: true },
  amount: { type: Number, required: true, min: 0 },
  status: { 
    type: String, 
    enum: ['draft', 'sent', 'paid', 'overdue'],
    default: 'draft'
  },
  dueDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
schema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Invoice', schema);