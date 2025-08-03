import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  gstin:       { type: String, required: true, unique: true, trim: true },
  address:     { type: String, default: '' },
  contactInfo: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model('Vendor', vendorSchema);
