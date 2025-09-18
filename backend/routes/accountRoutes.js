import { Router } from 'express';
import { authGuard } from '../utils/jwt.js';
import { authorize } from '../middleware/auth.js';
import {
  listAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount,
} from '../controllers/accountController.js';

const router = Router();

router.use(authGuard);                        // JWT required for all
router.get('/',           authorize('admin','accountant'), listAccounts);
router.get('/:id',        authorize('admin','accountant'), getAccountById);
router.post('/',          authorize('admin'),                createAccount);
router.put('/:id',        authorize('admin'),                updateAccount);
router.delete('/:id',     authorize('admin'),                deleteAccount);

export default router;


