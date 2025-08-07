import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = new Schema(
  {
    firstName: { 
      type: String, 
      required: true, 
      trim: true 
    },
    lastName: { 
      type: String, 
      required: true, 
      trim: true 
    },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true, 
      trim: true 
    },
    passwordHash: { 
      type: String, 
      required: true 
    },
    role: { 
      type: String, 
      enum: ['super_admin', 'admin', 'moderator'], 
      default: 'admin' 
    },
    permissions: [{
      type: String,
      enum: [
        'manage_users',
        'manage_admins', 
        'view_analytics',
        'manage_content',
        'manage_settings',
        'view_reports',
        'manage_billing'
      ]
    }],
    isActive: { 
      type: Boolean, 
      default: true 
    },
    lastLogin: { 
      type: Date 
    },
    profileImage: { 
      type: String 
    },
    phone: { 
      type: String, 
      trim: true 
    },
    department: { 
      type: String, 
      trim: true 
    },
    createdAt: { 
      type: Date, 
      default: Date.now 
    }
  },
  { timestamps: true }
);

// Index for email
adminSchema.index({ email: 1 }, { unique: true });

// Virtual for full name
adminSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Method to compare password
adminSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Method to hash password
adminSchema.methods.hashPassword = async function(password) {
  this.passwordHash = await bcrypt.hash(password, 12);
};

// Pre-save middleware to hash password if modified
adminSchema.pre('save', async function(next) {
  if (this.isModified('passwordHash')) {
    return next();
  }
  next();
});

export default model("Admin", adminSchema);
