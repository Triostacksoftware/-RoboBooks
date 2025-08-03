// backend/models/RefreshToken.js
import mongoose from 'mongoose';

const refreshTokenSchema = new mongoose.Schema(
  {
    user:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    token:  { type: String, required: true, unique: true },
    expiry: { type: Date,   required: true },
    device_info: String,
  },
  { timestamps: true },
);

export default mongoose.model('RefreshToken', refreshTokenSchema);
