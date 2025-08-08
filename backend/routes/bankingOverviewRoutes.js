import { Router } from 'express';
import { authGuard } from '../utils/jwt.js';
import {
  getBankingOverview,
  getCashFlow,
  getAccountAnalytics,
  getSyncStatus
} from '../controllers/bankingOverviewController.js';

const router = Router();

// Apply authentication to all banking overview routes
router.use(authGuard);

// Banking overview and analytics
router.get('/overview', getBankingOverview);
router.get('/cash-flow', getCashFlow);
router.get('/sync-status', getSyncStatus);
router.get('/account-analytics/:accountId', getAccountAnalytics);

export default router;
