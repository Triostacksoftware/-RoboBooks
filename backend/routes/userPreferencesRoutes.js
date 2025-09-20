import express from 'express';
import {
  getUserPreferences,
  updateUserPreferences,
  resetUserPreferences
} from '../controllers/userPreferencesController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// User preferences routes
router.get('/', getUserPreferences);
router.put('/', updateUserPreferences);
router.post('/reset', resetUserPreferences);

export default router;
