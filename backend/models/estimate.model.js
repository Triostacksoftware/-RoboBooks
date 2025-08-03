import mongoose from 'mongoose';

const estimateSchema = new mongoose.Schema({
  customer_id: { type: mongoose.Types.ObjectId, required: true, ref: 'Customer' },
  valid_until: { type: Date,   required: true },
  status:      { type: String, required: true, enum: ['draft','sent','accepted','rejected'] }
}, { timestamps: true });

export default mongoose.model('Estimate', estimateSchema);
