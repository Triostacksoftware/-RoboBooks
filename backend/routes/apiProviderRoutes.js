import express from 'express';
import {
  getApiProviders,
  getApiProviderById,
  createApiProvider,
  updateApiProvider,
  deleteApiProvider,
  testApiProvider,
  testAllProviders,
  getProviderStats,
  initializeDefaultProviders
} from '../controllers/apiProviderController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// API provider routes
router.get('/', getApiProviders);
router.get('/stats', getProviderStats);
router.get('/:id', getApiProviderById);
router.post('/', createApiProvider);
router.put('/:id', updateApiProvider);
router.delete('/:id', deleteApiProvider);
router.post('/:id/test', testApiProvider);
router.post('/test-all', testAllProviders);
router.post('/initialize-defaults', initializeDefaultProviders);

export default router;
