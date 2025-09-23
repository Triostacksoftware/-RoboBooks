import ExpenseHistoryService from '../services/expenseHistoryService.js';
import Expense from '../models/Expense.js';
import mongoose from 'mongoose';

class ExpenseHistoryController {
  /**
   * Get expense history with pagination
   */
  static async getExpenseHistory(req, res) {
    try {
      const { expenseId } = req.params;
      const {
        page = 1,
        limit = 50,
        sortBy = 'timestamp',
        sortOrder = 'desc',
        action = null
      } = req.query;

      // Validate expense exists
      const expense = await Expense.findById(expenseId);
      if (!expense) {
        return res.status(404).json({
          success: false,
          message: 'Expense not found'
        });
      }

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy,
        sortOrder,
        action
      };

      const result = await ExpenseHistoryService.getExpenseHistory(expenseId, options);

      res.json({
        success: true,
        data: result.history,
        pagination: result.pagination,
        message: 'Expense history retrieved successfully'
      });
    } catch (error) {
      console.error('❌ Error getting expense history:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve expense history',
        error: error.message
      });
    }
  }

  /**
   * Get recent activity for the current user
   */
  static async getRecentActivity(req, res) {
    try {
      const { limit = 20 } = req.query;
      const userId = req.user._id;

      const activity = await ExpenseHistoryService.getRecentActivity(userId, parseInt(limit));

      res.json({
        success: true,
        data: activity,
        message: 'Recent activity retrieved successfully'
      });
    } catch (error) {
      console.error('❌ Error getting recent activity:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve recent activity',
        error: error.message
      });
    }
  }

  /**
   * Get activity summary for an expense
   */
  static async getActivitySummary(req, res) {
    try {
      const { expenseId } = req.params;

      // Validate expense exists
      const expense = await Expense.findById(expenseId);
      if (!expense) {
        return res.status(404).json({
          success: false,
          message: 'Expense not found'
        });
      }

      const summary = await ExpenseHistoryService.getActivitySummary(expenseId);

      res.json({
        success: true,
        data: summary,
        message: 'Activity summary retrieved successfully'
      });
    } catch (error) {
      console.error('❌ Error getting activity summary:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve activity summary',
        error: error.message
      });
    }
  }

  /**
   * Get history statistics for an expense
   */
  static async getHistoryStats(req, res) {
    try {
      const { expenseId } = req.params;

      // Validate expense exists
      const expense = await Expense.findById(expenseId);
      if (!expense) {
        return res.status(404).json({
          success: false,
          message: 'Expense not found'
        });
      }

      const stats = await ExpenseHistoryService.getHistoryStats(expenseId);

      res.json({
        success: true,
        data: stats,
        message: 'History statistics retrieved successfully'
      });
    } catch (error) {
      console.error('❌ Error getting history stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve history statistics',
        error: error.message
      });
    }
  }

  /**
   * Get all expense history for dashboard
   */
  static async getAllExpenseHistory(req, res) {
    try {
      const {
        page = 1,
        limit = 50,
        sortBy = 'timestamp',
        sortOrder = 'desc',
        action = null,
        expenseId = null,
        userId = null,
        dateFrom = null,
        dateTo = null
      } = req.query;

      const { default: ExpenseHistory } = await import('../models/ExpenseHistory.js');
      
      // Build query
      const query = {};
      if (expenseId) query.expenseId = expenseId;
      if (userId) query.performedBy = userId;
      if (action) query.action = action;
      if (dateFrom || dateTo) {
        query.timestamp = {};
        if (dateFrom) query.timestamp.$gte = new Date(dateFrom);
        if (dateTo) query.timestamp.$lte = new Date(dateTo);
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

      const [history, total] = await Promise.all([
        ExpenseHistory.find(query)
          .populate('expenseId', 'description amount date status vendor')
          .populate('performedBy', 'name email')
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        ExpenseHistory.countDocuments(query)
      ]);

      res.json({
        success: true,
        data: history,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        },
        message: 'All expense history retrieved successfully'
      });
    } catch (error) {
      console.error('❌ Error getting all expense history:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve expense history',
        error: error.message
      });
    }
  }

  /**
   * Get history by action type
   */
  static async getHistoryByAction(req, res) {
    try {
      const { action } = req.params;
      const { page = 1, limit = 50 } = req.query;

      const { default: ExpenseHistory } = await import('../models/ExpenseHistory.js');

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [history, total] = await Promise.all([
        ExpenseHistory.find({ action })
          .populate('expenseId', 'description amount date status vendor')
          .populate('performedBy', 'name email')
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        ExpenseHistory.countDocuments({ action })
      ]);

      res.json({
        success: true,
        data: history,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        },
        message: `History for action '${action}' retrieved successfully`
      });
    } catch (error) {
      console.error('❌ Error getting history by action:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve history by action',
        error: error.message
      });
    }
  }

  /**
   * Get user activity summary
   */
  static async getUserActivitySummary(req, res) {
    try {
      const { userId } = req.params;
      const { days = 30 } = req.query;

      const { default: ExpenseHistory } = await import('../models/ExpenseHistory.js');
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - parseInt(days));

      const summary = await ExpenseHistory.aggregate([
        {
          $match: {
            performedBy: mongoose.Types.ObjectId(userId),
            timestamp: { $gte: dateFrom }
          }
        },
        {
          $group: {
            _id: '$action',
            count: { $sum: 1 },
            lastOccurrence: { $max: '$timestamp' }
          }
        },
        { $sort: { count: -1 } }
      ]);

      const totalActions = summary.reduce((sum, item) => sum + item.count, 0);

      res.json({
        success: true,
        data: {
          summary,
          totalActions,
          period: `${days} days`,
          dateFrom,
          dateTo: new Date()
        },
        message: 'User activity summary retrieved successfully'
      });
    } catch (error) {
      console.error('❌ Error getting user activity summary:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve user activity summary',
        error: error.message
      });
    }
  }

  /**
   * Export expense history
   */
  static async exportExpenseHistory(req, res) {
    try {
      const { expenseId } = req.params;
      const { format = 'json' } = req.query;

      // Validate expense exists
      const expense = await Expense.findById(expenseId);
      if (!expense) {
        return res.status(404).json({
          success: false,
          message: 'Expense not found'
        });
      }

      const { default: ExpenseHistory } = await import('../models/ExpenseHistory.js');
      const history = await ExpenseHistory.find({ expenseId })
        .populate('performedBy', 'name email')
        .sort({ timestamp: -1 })
        .lean();

      if (format === 'csv') {
        // Convert to CSV format
        const csvData = history.map(entry => ({
          timestamp: entry.timestamp,
          action: entry.action,
          description: entry.description,
          performedBy: entry.performedBy?.name || 'System',
          performedByEmail: entry.performedBy?.email || '',
          ipAddress: entry.ipAddress || '',
          userAgent: entry.userAgent || ''
        }));

        const { stringify: csv } = await import('csv-stringify');
        const csvString = await new Promise((resolve, reject) => {
          csv.stringify(csvData, { header: true }, (err, output) => {
            if (err) reject(err);
            else resolve(output);
          });
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="expense-${expenseId}-history.csv"`);
        res.send(csvString);
      } else {
        // Return JSON format
        res.json({
          success: true,
          data: {
            expense: {
              id: expense._id,
              description: expense.description,
              amount: expense.amount,
              date: expense.date
            },
            history
          },
          message: 'Expense history exported successfully'
        });
      }
    } catch (error) {
      console.error('❌ Error exporting expense history:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export expense history',
        error: error.message
      });
    }
  }
}

export default ExpenseHistoryController;
