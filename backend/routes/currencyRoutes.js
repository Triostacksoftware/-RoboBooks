import express from 'express';
import {
  getExchangeRates,
  createExchangeRate,
  updateExchangeRate,
  deleteExchangeRate,
  getCurrencyAdjustments,
  createCurrencyAdjustment,
  updateCurrencyAdjustment,
  updateAdjustmentStatus,
  getCurrencyAdjustmentById,
  getCurrencyStats,
  exportCurrencyData,
  importCurrencyData,
  bulkUpdateRates,
  fetchRealTimeExchangeRate,
  fetchMultipleRealTimeRates,
  getSupportedCurrenciesFromAPI,
  fetchHistoricalExchangeRate,
  initializeDefaultRates,
  triggerExchangeRateUpdate
} from '../controllers/currencyController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Exchange Rates Routes
router.get('/rates', getExchangeRates);
router.post('/rates', createExchangeRate);
router.put('/rates/:id', updateExchangeRate);
router.delete('/rates/:id', deleteExchangeRate);

// Currency Adjustments Routes
router.get('/adjustments', getCurrencyAdjustments);
router.post('/adjustments', createCurrencyAdjustment);
router.get('/adjustments/:id', getCurrencyAdjustmentById);
router.put('/adjustments/:id', updateCurrencyAdjustment);
router.patch('/adjustments/:id/status', updateAdjustmentStatus);

// Statistics
router.get('/stats', getCurrencyStats);

// Export/Import
router.get('/export', exportCurrencyData);
router.post('/import', importCurrencyData);

// Bulk operations
router.post('/rates/bulk-update', bulkUpdateRates);

// Real-time exchange rate APIs
router.get('/rates/realtime/:fromCurrency/:toCurrency', fetchRealTimeExchangeRate);
router.post('/rates/realtime/bulk', fetchMultipleRealTimeRates);
router.get('/rates/supported-currencies', getSupportedCurrenciesFromAPI);
router.get('/rates/historical/:fromCurrency/:toCurrency/:date', fetchHistoricalExchangeRate);

// Scheduled exchange rate management
router.post('/rates/initialize-defaults', initializeDefaultRates);
router.post('/rates/trigger-update', triggerExchangeRateUpdate);

export default router;
