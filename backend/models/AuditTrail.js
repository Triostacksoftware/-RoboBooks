import mongoose from 'mongoose';

const auditTrailSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'create', 'read', 'update', 'delete',
      'approve', 'reject', 'archive', 'restore',
      'export', 'import', 'login', 'logout',
      'upload', 'download', 'view', 'search'
    ]
  },
  entityType: {
    type: String,
    required: true,
    enum: [
      'currency_adjustment', 'currency_rate', 'journal_entry',
      'document', 'account', 'user', 'api_provider',
      'rate_alert', 'user_preferences', 'bulk_operation'
    ]
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  },
  entityName: {
    type: String,
    required: false
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  changes: {
    before: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    },
    after: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    }
  },
  metadata: {
    ipAddress: {
      type: String,
      required: false
    },
    userAgent: {
      type: String,
      required: false
    },
    sessionId: {
      type: String,
      required: false
    },
    requestId: {
      type: String,
      required: false
    },
    duration: {
      type: Number, // milliseconds
      required: false
    },
    status: {
      type: String,
      enum: ['success', 'failure', 'warning'],
      default: 'success'
    },
    errorMessage: {
      type: String,
      required: false
    }
  },
  relatedEntities: [{
    entityType: {
      type: String,
      required: true
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    relationship: {
      type: String,
      required: true
    }
  }],
  tags: [{
    type: String,
    maxlength: 50
  }],
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  isSensitive: {
    type: Boolean,
    default: false
  },
  retentionDate: {
    type: Date,
    required: false
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
auditTrailSchema.index({ userId: 1, createdAt: -1 });
auditTrailSchema.index({ action: 1, entityType: 1 });
auditTrailSchema.index({ entityType: 1, entityId: 1 });
auditTrailSchema.index({ createdAt: -1 });
auditTrailSchema.index({ 'metadata.status': 1 });
auditTrailSchema.index({ severity: 1 });
auditTrailSchema.index({ tags: 1 });

// TTL index for automatic cleanup (optional)
auditTrailSchema.index({ retentionDate: 1 }, { expireAfterSeconds: 0 });

// Virtual for human readable action
auditTrailSchema.virtual('actionDescription').get(function() {
  const actionMap = {
    create: 'Created',
    read: 'Viewed',
    update: 'Updated',
    delete: 'Deleted',
    approve: 'Approved',
    reject: 'Rejected',
    archive: 'Archived',
    restore: 'Restored',
    export: 'Exported',
    import: 'Imported',
    login: 'Logged In',
    logout: 'Logged Out',
    upload: 'Uploaded',
    download: 'Downloaded',
    view: 'Viewed',
    search: 'Searched'
  };
  return actionMap[this.action] || this.action;
});

// Method to create audit entry
auditTrailSchema.statics.createAuditEntry = function(data) {
  const auditEntry = new this({
    userId: data.userId,
    action: data.action,
    entityType: data.entityType,
    entityId: data.entityId,
    entityName: data.entityName,
    description: data.description,
    changes: data.changes || {},
    metadata: {
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      sessionId: data.sessionId,
      requestId: data.requestId,
      duration: data.duration,
      status: data.status || 'success',
      errorMessage: data.errorMessage
    },
    relatedEntities: data.relatedEntities || [],
    tags: data.tags || [],
    severity: data.severity || 'low',
    isSensitive: data.isSensitive || false,
    retentionDate: data.retentionDate
  });

  return auditEntry.save();
};

// Method to get audit trail for entity
auditTrailSchema.statics.getEntityAuditTrail = function(entityType, entityId, userId) {
  return this.find({
    entityType,
    entityId,
    userId
  }).sort({ createdAt: -1 });
};

// Method to get user activity
auditTrailSchema.statics.getUserActivity = function(userId, startDate, endDate) {
  const query = { userId };
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }
  
  return this.find(query).sort({ createdAt: -1 });
};

// Method to get system statistics
auditTrailSchema.statics.getSystemStats = function(startDate, endDate) {
  const matchStage = {};
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalActions: { $sum: 1 },
        uniqueUsers: { $addToSet: '$userId' },
        actionsByType: {
          $push: {
            action: '$action',
            entityType: '$entityType'
          }
        },
        errors: {
          $sum: {
            $cond: [{ $eq: ['$metadata.status', 'failure'] }, 1, 0]
          }
        },
        warnings: {
          $sum: {
            $cond: [{ $eq: ['$metadata.status', 'warning'] }, 1, 0]
          }
        }
      }
    },
    {
      $project: {
        totalActions: 1,
        uniqueUserCount: { $size: '$uniqueUsers' },
        errors: 1,
        warnings: 1,
        successRate: {
          $multiply: [
            {
              $divide: [
                { $subtract: ['$totalActions', { $add: ['$errors', '$warnings'] }] },
                '$totalActions'
              ]
            },
            100
          ]
        }
      }
    }
  ]);
};

const AuditTrail = mongoose.model('AuditTrail', auditTrailSchema);

export default AuditTrail;