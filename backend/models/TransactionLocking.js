import mongoose from 'mongoose';
import { format, parse, isValid, isAfter, isBefore, startOfDay, endOfDay, isSameDay } from 'date-fns';

const transactionLockingSchema = new mongoose.Schema({
  module: {
    type: String,
    required: true,
    enum: ['Sales', 'Purchases', 'Banking', 'Accountant'],
    index: true
  },
  lockDate: {
    type: Date,
    required: function() {
      return this.status !== 'unlocked';
    },
    validate: {
      validator: function(date) {
        // Lock date cannot be in the future using date-fns
        const lockDate = new Date(date);
        const today = new Date();
        
        console.log('🔍 Schema validation - lockDate:', lockDate);
        console.log('🔍 Schema validation - today:', today);
        
        // Use date-fns to compare dates properly
        const isLockDateAfterToday = isAfter(lockDate, today);
        const isLockDateToday = isSameDay(lockDate, today);
        
        console.log('🔍 Schema validation - isLockDateAfterToday:', isLockDateAfterToday);
        console.log('🔍 Schema validation - isLockDateToday:', isLockDateToday);
        
        // Allow today's date but not future dates
        return !isLockDateAfterToday;
      },
      message: 'Lock date cannot be in the future'
    }
  },
  reason: {
    type: String,
    required: function() {
      return this.status !== 'unlocked';
    },
    trim: true,
    maxlength: [500, 'Reason cannot exceed 500 characters']
  },
  status: {
    type: String,
    required: true,
    enum: ['locked', 'partially_unlocked', 'unlocked'],
    default: 'unlocked',
    index: true
  },
  partialUnlockFrom: {
    type: Date,
    required: function() {
      return this.status === 'partially_unlocked';
    },
    validate: {
      validator: function(date) {
        if (this.status === 'partially_unlocked' && this.lockDate) {
          return date <= this.lockDate;
        }
        return true;
      },
      message: 'Partial unlock start date cannot be after lock date'
    }
  },
  partialUnlockTo: {
    type: Date,
    required: function() {
      return this.status === 'partially_unlocked';
    },
    validate: {
      validator: function(date) {
        if (this.status === 'partially_unlocked' && this.partialUnlockFrom) {
          return date >= this.partialUnlockFrom;
        }
        return true;
      },
      message: 'Partial unlock end date must be after or equal to start date'
    }
  },
  partialUnlockReason: {
    type: String,
    required: function() {
      return this.status === 'partially_unlocked';
    },
    trim: true,
    maxlength: [500, 'Partial unlock reason cannot exceed 500 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
transactionLockingSchema.index({ company: 1, module: 1 });
transactionLockingSchema.index({ company: 1, status: 1 });
transactionLockingSchema.index({ createdAt: -1 });

// Virtual for formatted lock date (DD/MM/YYYY)
transactionLockingSchema.virtual('formattedLockDate').get(function() {
  if (!this.lockDate) return null;
  const date = new Date(this.lockDate);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
});

// Virtual for formatted partial unlock dates
transactionLockingSchema.virtual('formattedPartialUnlockFrom').get(function() {
  if (!this.partialUnlockFrom) return null;
  const date = new Date(this.partialUnlockFrom);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
});

transactionLockingSchema.virtual('formattedPartialUnlockTo').get(function() {
  if (!this.partialUnlockTo) return null;
  const date = new Date(this.partialUnlockTo);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
});

// Pre-save middleware to ensure only one active lock per module per company
transactionLockingSchema.pre('save', async function(next) {
  if (this.isNew && this.status !== 'unlocked') {
    // Check if there's already an active lock for this module
    const existingLock = await this.constructor.findOne({
      company: this.company,
      module: this.module,
      status: { $in: ['locked', 'partially_unlocked'] }
    });
    
    if (existingLock) {
      return next(new Error(`Module ${this.module} is already locked`));
    }
  }
  
  // Set lastModifiedBy to createdBy if not explicitly set
  if (!this.lastModifiedBy) {
    this.lastModifiedBy = this.createdBy;
  }
  
  next();
});

// Static method to get current lock status for all modules
transactionLockingSchema.statics.getLockStatus = async function(companyId) {
  console.log('🔍 Model getLockStatus - companyId:', companyId);
  console.log('🔍 Model getLockStatus - companyId type:', typeof companyId);
  
  const locks = await this.find({ 
    company: companyId,
    status: { $in: ['locked', 'partially_unlocked'] }
  });
  
  console.log('🔍 Model getLockStatus - found locks:', locks.length);
  console.log('🔍 Model getLockStatus - locks data:', JSON.stringify(locks, null, 2));
  
  const modules = ['Sales', 'Purchases', 'Banking', 'Accountant'];
  const status = {};
  
  modules.forEach(module => {
    const lock = locks.find(l => l.module === module);
    console.log(`🔍 Model getLockStatus - module ${module}:`, lock ? 'FOUND' : 'NOT FOUND');
    if (lock) {
      console.log(`🔍 Model getLockStatus - ${module} lock details:`, {
        status: lock.status,
        lockDate: lock.formattedLockDate,
        reason: lock.reason
      });
    }
    
    status[module] = lock ? {
      status: lock.status,
      lockDate: lock.formattedLockDate,
      reason: lock.reason,
      partialUnlockFrom: lock.formattedPartialUnlockFrom,
      partialUnlockTo: lock.formattedPartialUnlockTo,
      partialUnlockReason: lock.partialUnlockReason,
      createdAt: lock.createdAt,
      lastModified: lock.updatedAt
    } : {
      status: 'unlocked',
      lockDate: null,
      reason: null,
      partialUnlockFrom: null,
      partialUnlockTo: null,
      partialUnlockReason: null,
      createdAt: null,
      lastModified: null
    };
  });
  
  return status;
};

// Static method to validate lock date using date-fns
transactionLockingSchema.statics.validateLockDate = function(date) {
  const lockDate = new Date(date);
  const today = new Date();
  
  console.log('🔍 Static validation - lockDate:', lockDate);
  console.log('🔍 Static validation - today:', today);
  
  // Use date-fns for proper date comparison
  const isLockDateAfterToday = isAfter(lockDate, today);
  const isLockDateToday = isSameDay(lockDate, today);
  
  console.log('🔍 Static validation - isLockDateAfterToday:', isLockDateAfterToday);
  console.log('🔍 Static validation - isLockDateToday:', isLockDateToday);
  
  if (isLockDateAfterToday) {
    throw new Error('Cannot lock transactions for future dates');
  }
  
  console.log('✅ Static validation passed');
  return true;
};

// Static method to check if a date is within locked period
transactionLockingSchema.statics.isDateLocked = async function(companyId, module, date) {
  const lock = await this.findOne({
    company: companyId,
    module: module,
    status: 'locked',
    lockDate: { $lte: new Date(date) }
  });
  
  if (!lock) return false;
  
  // Check if there's a partial unlock for this date
  if (lock.status === 'partially_unlocked') {
    const checkDate = new Date(date);
    if (lock.partialUnlockFrom && lock.partialUnlockTo) {
      const fromDate = new Date(lock.partialUnlockFrom);
      const toDate = new Date(lock.partialUnlockTo);
      
      if (checkDate >= fromDate && checkDate <= toDate) {
        return false; // Date is within partial unlock period
      }
    }
  }
  
  return true;
};

export default mongoose.model('TransactionLocking', transactionLockingSchema);
