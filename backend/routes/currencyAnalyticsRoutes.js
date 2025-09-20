import express from 'express';
import {
  getCurrencyPerformance,
  getCurrencyExposure,
  getRateAlerts,
  createRateAlert,
  updateRateAlert,
  deleteRateAlert
} from '../controllers/currencyAnalyticsController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Currency performance analytics
router.get('/performance', getCurrencyPerformance);
router.get('/exposure', getCurrencyExposure);

// Rate alerts
router.get('/alerts', getRateAlerts);
router.post('/alerts', createRateAlert);
router.put('/alerts/:id', updateRateAlert);
router.delete('/alerts/:id', deleteRateAlert);

export default router;
