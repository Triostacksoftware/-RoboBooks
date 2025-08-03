// routes/bankTransactionRoutes.js
import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';
import {
  listTransactions,
  createTransaction,
  reconcileTransaction,
  deleteTransaction,
} from '../controllers/bankTransactionController.js';

const router = Router();
router.use(authenticate);

// admin & accountant permissions
router.get('/', authorize('admin', 'accountant'), listTransactions);
router.post('/', authorize('admin', 'accountant'), createTransaction);
router.patch('/:id/reconcile', authorize('admin', 'accountant'), reconcileTransaction);
router.delete('/:id', authorize('admin', 'accountant'), deleteTransaction);

export default router;
