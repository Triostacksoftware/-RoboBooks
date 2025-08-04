import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  customer_id: String,
  total: Number,
  status: { type: String, enum: ['Draft', 'Sent', 'Paid', 'Overdue', 'Canceled'], default: 'Draft' },
  due_date: Date,
  gst_data: Object,
  created_at: { type: Date, default: Date.now },
});
export default mongoose.model('Invoice', schema);