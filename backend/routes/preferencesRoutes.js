import express from 'express';
import {
  getPreferences,
  updatePreferences,
  resetPreferences,
  getAllPreferences,
  bulkUpdatePreferences
} from '../controllers/preferencesController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get preferences for a specific module
router.get('/:module', getPreferences);

// Update preferences for a specific module
router.put('/:module', updatePreferences);

// Reset preferences to defaults for a specific module
router.delete('/:module', resetPreferences);

// Get all preferences for the authenticated user
router.get('/', getAllPreferences);

// Bulk update preferences for multiple modules
router.put('/', bulkUpdatePreferences);

export default router;


