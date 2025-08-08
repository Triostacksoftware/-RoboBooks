import { Router } from 'express';
import { authGuard } from '../utils/jwt.js';
import {
  getBankAccounts,
  getBankAccount,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
  syncBankAccount,
  getAccountTransactions,
  getBankAccountsSummary
} from '../controllers/bankAccountController.js';

const router = Router();

// Apply authentication to all bank account routes
router.use(authGuard);

// Bank account CRUD operations
router.get('/', getBankAccounts);
router.get('/summary', getBankAccountsSummary);
router.get('/:id', getBankAccount);
router.post('/', createBankAccount);
router.put('/:id', updateBankAccount);
router.delete('/:id', deleteBankAccount);

// Bank account specific operations
router.patch('/:id/sync', syncBankAccount);
router.get('/:id/transactions', getAccountTransactions);

export default router;
