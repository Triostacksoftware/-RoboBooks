import express from 'express';
import transactionLockingController from '../controllers/transactionLockingController.js';
import auth from '../middleware/auth.js';
import { body, query } from 'express-validator';

const router = express.Router();

// Validation middleware
const validateModule = body('module')
  .isIn(['Sales', 'Purchases', 'Banking', 'Accountant'])
  .withMessage('Module must be one of: Sales, Purchases, Banking, Accountant');

const validateDate = body('lockDate')
  .matches(/^\d{2}\/\d{2}\/\d{4}$/)
  .withMessage('Lock date must be in DD/MM/YYYY format');

const validatePartialDate = body(['fromDate', 'toDate'])
  .matches(/^\d{2}\/\d{2}\/\d{4}$/)
  .withMessage('Date must be in DD/MM/YYYY format');

const validateReason = body('reason')
  .trim()
  .isLength({ min: 1, max: 500 })
  .withMessage('Reason must be between 1 and 500 characters');

const validateQueryDate = query('date')
  .matches(/^\d{2}\/\d{2}\/\d{4}$/)
  .withMessage('Date must be in DD/MM/YYYY format');

const validateQueryModule = query('module')
  .isIn(['Sales', 'Purchases', 'Banking', 'Accountant'])
  .withMessage('Module must be one of: Sales, Purchases, Banking, Accountant');

/**
 * @route   GET /api/transaction-locking/status
 * @desc    Get lock status for all modules
 * @access  Private (Accountant role required)
 */
router.get('/status', auth, transactionLockingController.getLockStatus);

/**
 * @route   POST /api/transaction-locking/lock
 * @desc    Lock a specific module
 * @access  Private (Accountant role required)
 */
router.post('/lock', [
  auth,
  validateModule,
  validateDate,
  validateReason
], transactionLockingController.lockModule);

/**
 * @route   PUT /api/transaction-locking/edit
 * @desc    Edit an existing lock
 * @access  Private (Accountant role required)
 */
router.put('/edit', [
  auth,
  validateModule,
  validateDate,
  validateReason
], transactionLockingController.editLock);

/**
 * @route   PUT /api/transaction-locking/unlock
 * @desc    Unlock a module completely
 * @access  Private (Accountant role required)
 */
router.put('/unlock', [
  auth,
  validateModule,
  validateReason
], transactionLockingController.unlockModule);

/**
 * @route   PUT /api/transaction-locking/unlock-partially
 * @desc    Unlock a module partially for a date range
 * @access  Private (Accountant role required)
 */
router.put('/unlock-partially', [
  auth,
  validateModule,
  validatePartialDate,
  validateReason
], transactionLockingController.unlockPartially);

/**
 * @route   GET /api/transaction-locking/check-date
 * @desc    Check if a specific date is locked for a module
 * @access  Private
 */
router.get('/check-date', [
  auth,
  validateQueryModule,
  validateQueryDate
], transactionLockingController.checkDateLock);

/**
 * @route   POST /api/transaction-locking/lock-all
 * @desc    Lock all modules at once
 * @access  Private (Accountant role required)
 */
router.post('/lock-all', [
  auth,
  validateDate,
  validateReason
], transactionLockingController.lockAllModules);

/**
 * @route   GET /api/transaction-locking/audit-trail
 * @desc    Get audit trail for transaction locking operations
 * @access  Private (Accountant role required)
 */
router.get('/audit-trail', [
  auth,
  query('module').optional().isIn(['Sales', 'Purchases', 'Banking', 'Accountant']),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('page').optional().isInt({ min: 1 })
], transactionLockingController.getAuditTrail);

export default router;
