import mongoose from 'mongoose';

const recurringExpenseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  frequency: {
    type: String,
    required: true,
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly']
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  vendor: {
    type: String,
    trim: true
  },
  nextDue: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customFields: [{
    fieldId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CustomField'
    },
    value: mongoose.Schema.Types.Mixed
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
recurringExpenseSchema.index({ organizationId: 1, isActive: 1 });
recurringExpenseSchema.index({ organizationId: 1, frequency: 1 });
recurringExpenseSchema.index({ organizationId: 1, category: 1 });
recurringExpenseSchema.index({ organizationId: 1, nextDue: 1 });

// Virtual for formatted amount
recurringExpenseSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(this.amount);
});

// Method to calculate next due date
recurringExpenseSchema.methods.calculateNextDue = function() {
  const now = new Date();
  let nextDue = new Date(this.nextDue || now);

  switch (this.frequency) {
    case 'daily':
      nextDue.setDate(nextDue.getDate() + 1);
      break;
    case 'weekly':
      nextDue.setDate(nextDue.getDate() + 7);
      break;
    case 'monthly':
      nextDue.setMonth(nextDue.getMonth() + 1);
      break;
    case 'quarterly':
      nextDue.setMonth(nextDue.getMonth() + 3);
      break;
    case 'yearly':
      nextDue.setFullYear(nextDue.getFullYear() + 1);
      break;
  }

  return nextDue;
};

// Method to check if recurring expense is overdue
recurringExpenseSchema.methods.isOverdue = function() {
  if (!this.isActive || !this.nextDue) return false;
  return new Date() > this.nextDue;
};

// Static method to get statistics
recurringExpenseSchema.statics.getStats = async function(organizationId) {
  const stats = await this.aggregate([
    { $match: { organizationId: new mongoose.Types.ObjectId(organizationId) } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: { $sum: { $cond: ['$isActive', 1, 0] } },
        inactive: { $sum: { $cond: ['$isActive', 0, 1] } },
        totalAmount: { $sum: '$amount' },
        avgAmount: { $avg: '$amount' }
      }
    }
  ]);

  const frequencyStats = await this.aggregate([
    { $match: { organizationId: new mongoose.Types.ObjectId(organizationId) } },
    {
      $group: {
        _id: '$frequency',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);

  const categoryStats = await this.aggregate([
    { $match: { organizationId: new mongoose.Types.ObjectId(organizationId) } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);

  const result = stats[0] || {
    total: 0,
    active: 0,
    inactive: 0,
    totalAmount: 0,
    avgAmount: 0
  };

  result.byFrequency = frequencyStats.reduce((acc, stat) => {
    acc[stat._id] = stat.count;
    return acc;
  }, {});

  result.byCategory = categoryStats.reduce((acc, stat) => {
    acc[stat._id] = stat.count;
    return acc;
  }, {});

  return result;
};

export default mongoose.model('RecurringExpense', recurringExpenseSchema);


