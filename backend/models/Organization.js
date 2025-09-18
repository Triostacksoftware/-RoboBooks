import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  tier: {
    type: String,
    enum: ['Free', 'Standard', 'Premium', 'Enterprise'],
    default: 'Free'
  },
  active: {
    type: Boolean,
    default: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['admin', 'member', 'viewer'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  settings: {
    currency: {
      type: String,
      default: 'INR'
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata'
    },
    dateFormat: {
      type: String,
      default: 'DD-MM-YYYY'
    }
  },
  subscription: {
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled', 'trial'],
      default: 'trial'
    },
    trialEndsAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    },
    planId: String,
    customerId: String
  }
}, {
  timestamps: true
});

// Index for better query performance
organizationSchema.index({ owner: 1 });
organizationSchema.index({ 'members.user': 1 });
organizationSchema.index({ active: 1 });

export default mongoose.model('Organization', organizationSchema);


