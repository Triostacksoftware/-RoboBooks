import express from 'express';
import {
  getVendorCredits,
  getVendorCreditById,
  createVendorCredit,
  updateVendorCredit,
  deleteVendorCredit,
  searchVendorCredits,
  getVendorCreditStats,
  updateVendorCreditStatus,
  issueVendorCredit,
  applyVendorCredit,
  cancelVendorCredit,
  importVendorCredits
} from '../controllers/vendorCreditController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Vendor credit routes
router.get('/', getVendorCredits);
router.get('/stats', getVendorCreditStats);
router.get('/search', searchVendorCredits);
router.get('/:id', getVendorCreditById);
router.post('/', createVendorCredit);
router.put('/:id', updateVendorCredit);
router.delete('/:id', deleteVendorCredit);
router.patch('/:id/status', updateVendorCreditStatus);
router.post('/:id/issue', issueVendorCredit);
router.post('/:id/apply', applyVendorCredit);
router.post('/:id/cancel', cancelVendorCredit);
router.post('/import', importVendorCredits);

export default router;


