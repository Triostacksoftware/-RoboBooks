import { Router } from 'express';
import { authGuard } from '../utils/jwt.js';
import {
  getReconciliations,
  getReconciliation,
  createReconciliation,
  updateReconciliation,
  updateReconciliationItem,
  completeReconciliation,
  getAccountReconciliations,
  autoMatchReconciliation
} from '../controllers/bankReconciliationController.js';

const router = Router();

// Apply authentication to all reconciliation routes
router.use(authGuard);

// Reconciliation CRUD operations
router.get('/', getReconciliations);
router.get('/:id', getReconciliation);
router.post('/', createReconciliation);
router.put('/:id', updateReconciliation);

// Reconciliation specific operations
router.patch('/:id/items/:itemId', updateReconciliationItem);
router.post('/:id/complete', completeReconciliation);
router.post('/:id/auto-match', autoMatchReconciliation);

// Account specific reconciliations
router.get('/account/:accountId', getAccountReconciliations);

export default router;
