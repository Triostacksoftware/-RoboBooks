import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  invoice_id: mongoose.Schema.Types.ObjectId,
  desc: String,
  qty: Number,
  rate: Number,
  tax_pct: Number,
});
export default mongoose.model('InvoiceItem', schema);


