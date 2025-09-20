import AuditTrail from '../models/AuditTrail.js';

class AuditTrailService {
  // Create audit entry
  static async logAction(data) {
    try {
      const auditEntry = await AuditTrail.createAuditEntry({
        userId: data.userId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        entityName: data.entityName,
        description: data.description,
        changes: data.changes,
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

      console.log(`📝 Audit logged: ${data.action} ${data.entityType} by user ${data.userId}`);
      return auditEntry;
    } catch (error) {
      console.error('Error creating audit entry:', error);
      // Don't throw error to avoid breaking the main operation
      return null;
    }
  }

  // Log currency adjustment actions
  static async logCurrencyAdjustmentAction(userId, action, adjustment, changes = {}, metadata = {}) {
    return this.logAction({
      userId,
      action,
      entityType: 'currency_adjustment',
      entityId: adjustment._id,
      entityName: `Adjustment ${adjustment.referenceNumber || adjustment._id}`,
      description: `${action} currency adjustment: ${adjustment.fromCurrency} to ${adjustment.toCurrency}`,
      changes,
      metadata,
      tags: ['currency', 'adjustment', action],
      severity: action === 'delete' ? 'high' : 'medium'
    });
  }

  // Log currency rate actions
  static async logCurrencyRateAction(userId, action, rate, changes = {}, metadata = {}) {
    return this.logAction({
      userId,
      action,
      entityType: 'currency_rate',
      entityId: rate._id,
      entityName: `Rate ${rate.fromCurrency}-${rate.toCurrency}`,
      description: `${action} exchange rate: ${rate.fromCurrency} to ${rate.toCurrency} = ${rate.rate}`,
      changes,
      metadata,
      tags: ['currency', 'rate', action],
      severity: 'low'
    });
  }

  // Log journal entry actions
  static async logJournalEntryAction(userId, action, entry, changes = {}, metadata = {}) {
    return this.logAction({
      userId,
      action,
      entityType: 'journal_entry',
      entityId: entry._id,
      entityName: `Journal Entry ${entry.entryNumber}`,
      description: `${action} journal entry: ${entry.description}`,
      changes,
      metadata,
      tags: ['accounting', 'journal', action],
      severity: action === 'delete' ? 'high' : 'medium'
    });
  }

  // Log document actions
  static async logDocumentAction(userId, action, document, changes = {}, metadata = {}) {
    return this.logAction({
      userId,
      action,
      entityType: 'document',
      entityId: document._id,
      entityName: document.originalName,
      description: `${action} document: ${document.originalName}`,
      changes,
      metadata,
      tags: ['document', document.category, action],
      severity: action === 'delete' ? 'medium' : 'low'
    });
  }

  // Log API provider actions
  static async logApiProviderAction(userId, action, provider, changes = {}, metadata = {}) {
    return this.logAction({
      userId,
      action,
      entityType: 'api_provider',
      entityId: provider._id,
      entityName: provider.displayName,
      description: `${action} API provider: ${provider.displayName}`,
      changes,
      metadata,
      tags: ['api', 'provider', action],
      severity: 'medium'
    });
  }

  // Log bulk operations
  static async logBulkOperation(userId, operation, entityType, count, metadata = {}) {
    return this.logAction({
      userId,
      action: 'bulk_operation',
      entityType: 'bulk_operation',
      entityName: `${operation} ${count} ${entityType}`,
      description: `Bulk ${operation}: ${count} ${entityType} records`,
      metadata: {
        ...metadata,
        operation,
        entityType,
        count
      },
      tags: ['bulk', operation, entityType],
      severity: 'medium'
    });
  }

  // Log authentication events
  static async logAuthEvent(userId, action, metadata = {}) {
    return this.logAction({
      userId,
      action,
      entityType: 'user',
      entityId: userId,
      entityName: 'User Authentication',
      description: `User ${action}`,
      metadata,
      tags: ['auth', action],
      severity: action === 'login' ? 'low' : 'low'
    });
  }

  // Log system events
  static async logSystemEvent(event, description, metadata = {}) {
    return this.logAction({
      userId: null, // System event
      action: 'system',
      entityType: 'system',
      entityName: event,
      description,
      metadata,
      tags: ['system', event],
      severity: 'low'
    });
  }

  // Get audit trail for specific entity
  static async getEntityAuditTrail(entityType, entityId, userId) {
    try {
      return await AuditTrail.getEntityAuditTrail(entityType, entityId, userId);
    } catch (error) {
      console.error('Error fetching entity audit trail:', error);
      return [];
    }
  }

  // Get user activity
  static async getUserActivity(userId, startDate, endDate) {
    try {
      return await AuditTrail.getUserActivity(userId, startDate, endDate);
    } catch (error) {
      console.error('Error fetching user activity:', error);
      return [];
    }
  }

  // Get system statistics
  static async getSystemStats(startDate, endDate) {
    try {
      const stats = await AuditTrail.getSystemStats(startDate, endDate);
      return stats[0] || {
        totalActions: 0,
        uniqueUserCount: 0,
        errors: 0,
        warnings: 0,
        successRate: 100
      };
    } catch (error) {
      console.error('Error fetching system stats:', error);
      return {
        totalActions: 0,
        uniqueUserCount: 0,
        errors: 0,
        warnings: 0,
        successRate: 100
      };
    }
  }

  // Get recent activities
  static async getRecentActivities(limit = 50) {
    try {
      return await AuditTrail.find({})
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .limit(limit);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      return [];
    }
  }

  // Get audit trail with filters
  static async getAuditTrail(filters = {}) {
    try {
      const {
        userId,
        action,
        entityType,
        startDate,
        endDate,
        severity,
        status,
        page = 1,
        limit = 50
      } = filters;

      let query = {};

      if (userId) query.userId = userId;
      if (action) query.action = action;
      if (entityType) query.entityType = entityType;
      if (severity) query.severity = severity;
      if (status) query['metadata.status'] = status;

      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      const skip = (page - 1) * limit;

      const [auditTrails, totalCount] = await Promise.all([
        AuditTrail.find(query)
          .populate('userId', 'name email')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        AuditTrail.countDocuments(query)
      ]);

      return {
        auditTrails,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page
      };
    } catch (error) {
      console.error('Error fetching audit trail:', error);
      return {
        auditTrails: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: 1
      };
    }
  }

  // Clean up old audit entries
  static async cleanupOldEntries(daysToKeep = 365) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const result = await AuditTrail.deleteMany({
        createdAt: { $lt: cutoffDate },
        severity: { $in: ['low', 'medium'] } // Keep high and critical severity entries
      });

      console.log(`🧹 Cleaned up ${result.deletedCount} old audit entries`);
      return result.deletedCount;
    } catch (error) {
      console.error('Error cleaning up audit entries:', error);
      return 0;
    }
  }
}

// Export individual functions for backward compatibility
export const logAction = AuditTrailService.logAction;
export const getAuditTrail = AuditTrailService.getAuditTrail;
export const getEntityAuditTrail = AuditTrailService.getEntityAuditTrail;
export const getUserActivity = AuditTrailService.getUserActivity;
export const getSystemStats = AuditTrailService.getSystemStats;
export const getRecentActivities = AuditTrailService.getRecentActivities;

export default AuditTrailService;