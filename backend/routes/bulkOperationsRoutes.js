import express from 'express';
import {
  bulkCreateAdjustments,
  bulkUpdateRates,
  bulkDeleteAdjustments,
  bulkUpdateAdjustmentStatus,
  bulkExportData
} from '../controllers/bulkOperationsController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Bulk operations routes
router.post('/adjustments/create', bulkCreateAdjustments);
router.post('/rates/update', bulkUpdateRates);
router.post('/adjustments/delete', bulkDeleteAdjustments);
router.post('/adjustments/update-status', bulkUpdateAdjustmentStatus);
router.post('/export', bulkExportData);

export default router;
