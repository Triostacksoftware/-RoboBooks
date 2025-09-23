import mongoose from 'mongoose';

const expenseHistorySchema = new mongoose.Schema({
  expenseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expense',
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true,
    enum: ['created', 'updated', 'deleted', 'status_changed', 'amount_changed', 'vendor_changed', 'category_changed', 'payment_method_changed', 'customer_changed', 'project_changed', 'notes_changed', 'billable_changed', 'receipt_uploaded', 'receipt_removed', 'converted_to_invoice', 'cloned']
  },
  description: {
    type: String,
    required: true
  },
  changes: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  previousValues: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  newValues: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  performedByName: {
    type: String,
    required: true
  },
  performedByEmail: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
expenseHistorySchema.index({ expenseId: 1, timestamp: -1 });
expenseHistorySchema.index({ performedBy: 1, timestamp: -1 });
expenseHistorySchema.index({ action: 1, timestamp: -1 });

// Virtual for formatted timestamp
expenseHistorySchema.virtual('formattedTimestamp').get(function() {
  return this.timestamp.toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
});

// Virtual for relative time
expenseHistorySchema.virtual('relativeTime').get(function() {
  const now = new Date();
  const diff = now - this.timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  return this.formattedTimestamp;
});

// Static method to create history entry
expenseHistorySchema.statics.createHistoryEntry = async function(data) {
  try {
    const historyEntry = new this(data);
    await historyEntry.save();
    return historyEntry;
  } catch (error) {
    console.error('Error creating expense history entry:', error);
    throw error;
  }
};

// Static method to get expense history
expenseHistorySchema.statics.getExpenseHistory = async function(expenseId, options = {}) {
  try {
    const {
      page = 1,
      limit = 50,
      sortBy = 'timestamp',
      sortOrder = 'desc',
      action = null
    } = options;

    const query = { expenseId };
    if (action) {
      query.action = action;
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [history, total] = await Promise.all([
      this.find(query)
        .populate('performedBy', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      this.countDocuments(query)
    ]);

    return {
      history,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Error fetching expense history:', error);
    throw error;
  }
};

// Static method to get recent activity
expenseHistorySchema.statics.getRecentActivity = async function(userId, limit = 20) {
  try {
    return await this.find({ performedBy: userId })
      .populate('expenseId', 'description amount date status')
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    throw error;
  }
};

// Static method to get activity summary
expenseHistorySchema.statics.getActivitySummary = async function(expenseId) {
  try {
    const summary = await this.aggregate([
      { $match: { expenseId: mongoose.Types.ObjectId(expenseId) } },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
          lastOccurrence: { $max: '$timestamp' }
        }
      },
      { $sort: { lastOccurrence: -1 } }
    ]);

    return summary;
  } catch (error) {
    console.error('Error fetching activity summary:', error);
    throw error;
  }
};

export default mongoose.model('ExpenseHistory', expenseHistorySchema);
