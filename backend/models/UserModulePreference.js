import mongoose from 'mongoose';

const userModulePreferenceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  moduleName: {
    type: String,
    required: true,
    enum: [
      'home',
      'items', 
      'customers',
      'sales',
      'purchases',
      'banking',
      'time',
      'accountant',
      'reports',
      'documents',
      'vendors',
      'payroll',
      'help-support',
      'configure'
    ]
  },
  isEnabled: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index to ensure unique user-module combinations
userModulePreferenceSchema.index({ userId: 1, moduleName: 1 }, { unique: true });

export default mongoose.model('UserModulePreference', userModulePreferenceSchema);


