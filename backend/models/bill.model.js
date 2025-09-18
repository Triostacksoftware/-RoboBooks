import mongoose from 'mongoose';

const billSchema = new mongoose.Schema({
  vendor_id: { type: mongoose.Types.ObjectId, required: true, ref: 'Vendor' },
  total:     { type: Number, required: true },
  status:    { type: String, required: true, enum: ['pending','paid','overdue'] },
  due_date:  { type: Date,   required: true }
}, { timestamps: true });

export default mongoose.model('Bill', billSchema);


