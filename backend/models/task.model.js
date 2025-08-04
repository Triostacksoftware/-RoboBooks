import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  project_id: mongoose.Schema.Types.ObjectId,
  title: String,
  assigned_to: String,
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed'] },
});
export default mongoose.model('Task', schema);