import express from 'express';
import {
  getAuditTrail,
  getEntityAuditTrail,
  getUserActivity,
  getSystemStats,
  getRecentActivities,
  getAuditSummary,
  exportAuditTrail
} from '../controllers/auditTrailController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get audit trail with filters
router.get('/', getAuditTrail);

// Get entity-specific audit trail
router.get('/entity/:entityType/:entityId', getEntityAuditTrail);

// Get user activity
router.get('/user-activity', getUserActivity);

// Get system statistics
router.get('/system-stats', getSystemStats);

// Get recent activities
router.get('/recent', getRecentActivities);

// Get audit summary
router.get('/summary', getAuditSummary);

// Export audit trail
router.get('/export', exportAuditTrail);

export default router;