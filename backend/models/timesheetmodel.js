import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  user_id: String,
  task_id: mongoose.Schema.Types.ObjectId,
  hours: Number,
  date_logged: Date,
});
export default mongoose.model('Timesheet', schema);