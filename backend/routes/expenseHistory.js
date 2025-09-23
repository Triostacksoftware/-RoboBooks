import express from 'express';
const router = express.Router();
import ExpenseHistoryController from '../controllers/expenseHistoryController.js';
import { authenticateToken as auth } from '../middleware/auth.js';
import { adminAuthGuard as adminAuth } from '../middleware/adminAuth.js';

// All routes require authentication
router.use(auth);

/**
 * @route   GET /api/expense-history/:expenseId
 * @desc    Get expense history with pagination
 * @access  Private
 */
router.get('/:expenseId', ExpenseHistoryController.getExpenseHistory);

/**
 * @route   GET /api/expense-history/:expenseId/summary
 * @desc    Get activity summary for an expense
 * @access  Private
 */
router.get('/:expenseId/summary', ExpenseHistoryController.getActivitySummary);

/**
 * @route   GET /api/expense-history/:expenseId/stats
 * @desc    Get history statistics for an expense
 * @access  Private
 */
router.get('/:expenseId/stats', ExpenseHistoryController.getHistoryStats);

/**
 * @route   GET /api/expense-history/:expenseId/export
 * @desc    Export expense history
 * @access  Private
 */
router.get('/:expenseId/export', ExpenseHistoryController.exportExpenseHistory);

/**
 * @route   GET /api/expense-history/activity/recent
 * @desc    Get recent activity for the current user
 * @access  Private
 */
router.get('/activity/recent', ExpenseHistoryController.getRecentActivity);

/**
 * @route   GET /api/expense-history/activity/all
 * @desc    Get all expense history (admin only)
 * @access  Private (Admin)
 */
router.get('/activity/all', adminAuth, ExpenseHistoryController.getAllExpenseHistory);

/**
 * @route   GET /api/expense-history/action/:action
 * @desc    Get history by action type
 * @access  Private
 */
router.get('/action/:action', ExpenseHistoryController.getHistoryByAction);

/**
 * @route   GET /api/expense-history/user/:userId/summary
 * @desc    Get user activity summary
 * @access  Private (Admin)
 */
router.get('/user/:userId/summary', adminAuth, ExpenseHistoryController.getUserActivitySummary);

export default router;
