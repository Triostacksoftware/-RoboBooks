import AuditTrail from '../models/AuditTrail.js';

/**
 * Log an action to the audit trail
 * @param {Object} params - Audit log parameters
 * @param {string} params.user - User ID
 * @param {string} params.action - Action performed (create, update, delete, etc.)
 * @param {string} params.entity - Entity type (user, document, invoice, etc.)
 * @param {string} params.entityId - Entity ID (optional)
 * @param {string} params.message - Human readable message
 * @param {Object} params.details - Additional details
 * @param {string} params.ipAddress - IP address of the request
 * @param {string} params.userAgent - User agent string
 * @param {string} params.status - Status of the action (success, failure, pending)
 * @param {string} params.errorMessage - Error message if status is failure
 */
export async function logAction({
  user,
  action,
  entity,
  entityId,
  message,
  details = {},
  ipAddress,
  userAgent,
  status = 'success',
  errorMessage
}) {
  try {
    const auditEntry = new AuditTrail({
      user,
      action,
      entity,
      entityId,
      details: {
        message,
        ...details
      },
      ipAddress,
      userAgent,
      status,
      errorMessage
    });

    await auditEntry.save();
    console.log(`🔍 Audit log: ${action} on ${entity} - ${message}`);
    return auditEntry;
  } catch (error) {
    console.error('❌ Failed to log audit trail:', error);
    // Don't throw error as audit logging shouldn't break main functionality
  }
}

/**
 * Get audit trail with filters
 * @param {Object} filters - Filter parameters
 * @param {string} filters.user - Filter by user ID
 * @param {string} filters.entity - Filter by entity type
 * @param {string} filters.action - Filter by action
 * @param {Date} filters.startDate - Start date for filtering
 * @param {Date} filters.endDate - End date for filtering
 * @param {number} filters.page - Page number for pagination
 * @param {number} filters.limit - Number of records per page
 */
export async function getAuditTrail(filters = {}) {
  try {
    const {
      user,
      entity,
      action,
      startDate,
      endDate,
      page = 1,
      limit = 50
    } = filters;

    const query = {};

    if (user) query.user = user;
    if (entity) query.entity = entity;
    if (action) query.action = action;
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [auditTrail, total] = await Promise.all([
      AuditTrail.find(query)
        .populate('user', 'name email')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      AuditTrail.countDocuments(query)
    ]);

    return {
      data: auditTrail,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalRecords: total,
        hasNext: skip + auditTrail.length < total,
        hasPrev: parseInt(page) > 1
      }
    };
  } catch (error) {
    console.error('❌ Failed to get audit trail:', error);
    throw error;
  }
}

/**
 * Get audit trail for a specific entity
 * @param {string} entity - Entity type
 * @param {string} entityId - Entity ID
 * @param {number} page - Page number
 * @param {number} limit - Records per page
 */
export async function getEntityAuditTrail(entity, entityId, page = 1, limit = 50) {
  try {
    const query = { entity, entityId };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [auditTrail, total] = await Promise.all([
      AuditTrail.find(query)
        .populate('user', 'name email')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      AuditTrail.countDocuments(query)
    ]);

    return {
      data: auditTrail,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalRecords: total,
        hasNext: skip + auditTrail.length < total,
        hasPrev: parseInt(page) > 1
      }
    };
  } catch (error) {
    console.error('❌ Failed to get entity audit trail:', error);
    throw error;
  }
}

/**
 * Get user activity summary
 * @param {string} userId - User ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 */
export async function getUserActivitySummary(userId, startDate, endDate) {
  try {
    const query = { user: userId };
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const summary = await AuditTrail.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            action: '$action',
            entity: '$entity'
          },
          count: { $sum: 1 },
          lastActivity: { $max: '$timestamp' }
        }
      },
      {
        $group: {
          _id: '$_id.entity',
          actions: {
            $push: {
              action: '$_id.action',
              count: '$count',
              lastActivity: '$lastActivity'
            }
          },
          totalActions: { $sum: '$count' }
        }
      }
    ]);

    return summary;
  } catch (error) {
    console.error('❌ Failed to get user activity summary:', error);
    throw error;
  }
}


