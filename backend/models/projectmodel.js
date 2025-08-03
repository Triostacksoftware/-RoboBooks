import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  user_id: String,
  name: String,
  budget: Number,
  status: { type: String, enum: ['Active', 'Completed', 'On Hold'] },
});
export default mongoose.model('Project', schema);