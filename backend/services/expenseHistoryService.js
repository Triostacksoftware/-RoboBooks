import ExpenseHistory from '../models/ExpenseHistory.js';
import Expense from '../models/Expense.js';

class ExpenseHistoryService {
  /**
   * Create a history entry for an expense action
   */
  static async createHistoryEntry(expenseId, action, data) {
    try {
      const {
        description,
        changes = {},
        previousValues = {},
        newValues = {},
        performedBy,
        performedByName,
        performedByEmail,
        ipAddress,
        userAgent,
        metadata = {}
      } = data;

      const historyEntry = await ExpenseHistory.createHistoryEntry({
        expenseId,
        action,
        description,
        changes,
        previousValues,
        newValues,
        performedBy,
        performedByName,
        performedByEmail,
        ipAddress,
        userAgent,
        metadata
      });

      console.log(`✅ Expense history entry created: ${action} for expense ${expenseId}`);
      return historyEntry;
    } catch (error) {
      console.error('❌ Error creating expense history entry:', error);
      throw error;
    }
  }

  /**
   * Track expense creation
   */
  static async trackExpenseCreation(expense, user, req = null) {
    try {
      const historyData = {
        description: `Expense Created for ₹${expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        newValues: {
          description: expense.description,
          amount: expense.amount,
          date: expense.date,
          vendor: expense.vendor,
          account: expense.account,
          category: expense.category,
          paymentMethod: expense.paymentMethod,
          reference: expense.reference,
          notes: expense.notes,
          status: expense.status,
          billable: expense.billable,
          customer: expense.customer,
          project: expense.project
        },
        performedBy: user._id,
        performedByName: user.name || 'System',
        performedByEmail: user.email,
        ipAddress: req?.ip || req?.connection?.remoteAddress,
        userAgent: req?.get('User-Agent'),
        metadata: {
          source: 'expense_creation',
          originalExpenseId: expense._id
        }
      };

      return await this.createHistoryEntry(expense._id, 'created', historyData);
    } catch (error) {
      console.error('❌ Error tracking expense creation:', error);
      throw error;
    }
  }

  /**
   * Track expense update
   */
  static async trackExpenseUpdate(expenseId, previousExpense, updatedExpense, user, req = null) {
    try {
      const changes = {};
      const previousValues = {};
      const newValues = {};

      // Compare fields and track changes
      const fieldsToTrack = [
        'description', 'amount', 'date', 'vendor', 'account', 'category',
        'paymentMethod', 'reference', 'notes', 'status', 'billable',
        'customer', 'project', 'hasReceipt'
      ];

      fieldsToTrack.forEach(field => {
        if (previousExpense[field] !== updatedExpense[field]) {
          changes[field] = {
            from: previousExpense[field],
            to: updatedExpense[field]
          };
          previousValues[field] = previousExpense[field];
          newValues[field] = updatedExpense[field];
        }
      });

      if (Object.keys(changes).length === 0) {
        console.log('No changes detected for expense update');
        return null;
      }

      // Determine the primary action type
      let action = 'updated';
      if (changes.status) action = 'status_changed';
      else if (changes.amount) action = 'amount_changed';
      else if (changes.vendor) action = 'vendor_changed';
      else if (changes.category) action = 'category_changed';
      else if (changes.paymentMethod) action = 'payment_method_changed';
      else if (changes.customer) action = 'customer_changed';
      else if (changes.project) action = 'project_changed';
      else if (changes.notes) action = 'notes_changed';
      else if (changes.billable !== undefined) action = 'billable_changed';

      const changeDescriptions = Object.keys(changes).map(field => {
        const change = changes[field];
        return `${field}: ${change.from} → ${change.to}`;
      });

      const historyData = {
        description: `Expense Updated: ${changeDescriptions.join(', ')}`,
        changes,
        previousValues,
        newValues,
        performedBy: user._id,
        performedByName: user.name || 'System',
        performedByEmail: user.email,
        ipAddress: req?.ip || req?.connection?.remoteAddress,
        userAgent: req?.get('User-Agent'),
        metadata: {
          source: 'expense_update',
          changeCount: Object.keys(changes).length
        }
      };

      return await this.createHistoryEntry(expenseId, action, historyData);
    } catch (error) {
      console.error('❌ Error tracking expense update:', error);
      throw error;
    }
  }

  /**
   * Track expense deletion
   */
  static async trackExpenseDeletion(expense, user, req = null) {
    try {
      const historyData = {
        description: `Expense Deleted: ${expense.description}`,
        previousValues: {
          description: expense.description,
          amount: expense.amount,
          date: expense.date,
          vendor: expense.vendor,
          account: expense.account,
          category: expense.category,
          paymentMethod: expense.paymentMethod,
          reference: expense.reference,
          notes: expense.notes,
          status: expense.status,
          billable: expense.billable,
          customer: expense.customer,
          project: expense.project
        },
        performedBy: user._id,
        performedByName: user.name || 'System',
        performedByEmail: user.email,
        ipAddress: req?.ip || req?.connection?.remoteAddress,
        userAgent: req?.get('User-Agent'),
        metadata: {
          source: 'expense_deletion',
          deletedAt: new Date()
        }
      };

      return await this.createHistoryEntry(expense._id, 'deleted', historyData);
    } catch (error) {
      console.error('❌ Error tracking expense deletion:', error);
      throw error;
    }
  }

  /**
   * Track expense cloning
   */
  static async trackExpenseCloning(originalExpense, clonedExpense, user, req = null) {
    try {
      const historyData = {
        description: `Expense Cloned from "${originalExpense.description}"`,
        changes: {
          clonedFrom: originalExpense._id,
          clonedTo: clonedExpense._id
        },
        newValues: {
          description: clonedExpense.description,
          amount: clonedExpense.amount,
          date: clonedExpense.date,
          vendor: clonedExpense.vendor,
          account: clonedExpense.account,
          category: clonedExpense.category,
          paymentMethod: clonedExpense.paymentMethod,
          reference: clonedExpense.reference,
          notes: clonedExpense.notes,
          status: clonedExpense.status,
          billable: clonedExpense.billable,
          customer: clonedExpense.customer,
          project: clonedExpense.project
        },
        performedBy: user._id,
        performedByName: user.name || 'System',
        performedByEmail: user.email,
        ipAddress: req?.ip || req?.connection?.remoteAddress,
        userAgent: req?.get('User-Agent'),
        metadata: {
          source: 'expense_cloning',
          originalExpenseId: originalExpense._id,
          clonedExpenseId: clonedExpense._id
        }
      };

      return await this.createHistoryEntry(clonedExpense._id, 'cloned', historyData);
    } catch (error) {
      console.error('❌ Error tracking expense cloning:', error);
      throw error;
    }
  }

  /**
   * Track receipt upload
   */
  static async trackReceiptUpload(expenseId, receiptInfo, user, req = null) {
    try {
      const historyData = {
        description: `Receipt Uploaded: ${receiptInfo.filename}`,
        newValues: {
          hasReceipt: true,
          receiptFilename: receiptInfo.filename,
          receiptPath: receiptInfo.path,
          receiptSize: receiptInfo.size
        },
        performedBy: user._id,
        performedByName: user.name || 'System',
        performedByEmail: user.email,
        ipAddress: req?.ip || req?.connection?.remoteAddress,
        userAgent: req?.get('User-Agent'),
        metadata: {
          source: 'receipt_upload',
          receiptInfo
        }
      };

      return await this.createHistoryEntry(expenseId, 'receipt_uploaded', historyData);
    } catch (error) {
      console.error('❌ Error tracking receipt upload:', error);
      throw error;
    }
  }

  /**
   * Track receipt removal
   */
  static async trackReceiptRemoval(expenseId, receiptInfo, user, req = null) {
    try {
      const historyData = {
        description: `Receipt Removed: ${receiptInfo.filename}`,
        previousValues: {
          hasReceipt: true,
          receiptFilename: receiptInfo.filename,
          receiptPath: receiptInfo.path,
          receiptSize: receiptInfo.size
        },
        newValues: {
          hasReceipt: false
        },
        performedBy: user._id,
        performedByName: user.name || 'System',
        performedByEmail: user.email,
        ipAddress: req?.ip || req?.connection?.remoteAddress,
        userAgent: req?.get('User-Agent'),
        metadata: {
          source: 'receipt_removal',
          removedReceiptInfo: receiptInfo
        }
      };

      return await this.createHistoryEntry(expenseId, 'receipt_removed', historyData);
    } catch (error) {
      console.error('❌ Error tracking receipt removal:', error);
      throw error;
    }
  }

  /**
   * Track invoice conversion
   */
  static async trackInvoiceConversion(expenseId, invoiceInfo, user, req = null) {
    try {
      const historyData = {
        description: `Expense Converted to Invoice: ${invoiceInfo.invoiceNumber}`,
        newValues: {
          convertedToInvoice: true,
          invoiceId: invoiceInfo.invoiceId,
          invoiceNumber: invoiceInfo.invoiceNumber
        },
        performedBy: user._id,
        performedByName: user.name || 'System',
        performedByEmail: user.email,
        ipAddress: req?.ip || req?.connection?.remoteAddress,
        userAgent: req?.get('User-Agent'),
        metadata: {
          source: 'invoice_conversion',
          invoiceInfo
        }
      };

      return await this.createHistoryEntry(expenseId, 'converted_to_invoice', historyData);
    } catch (error) {
      console.error('❌ Error tracking invoice conversion:', error);
      throw error;
    }
  }

  /**
   * Get expense history with pagination
   */
  static async getExpenseHistory(expenseId, options = {}) {
    try {
      return await ExpenseHistory.getExpenseHistory(expenseId, options);
    } catch (error) {
      console.error('❌ Error getting expense history:', error);
      throw error;
    }
  }

  /**
   * Get recent activity for a user
   */
  static async getRecentActivity(userId, limit = 20) {
    try {
      return await ExpenseHistory.getRecentActivity(userId, limit);
    } catch (error) {
      console.error('❌ Error getting recent activity:', error);
      throw error;
    }
  }

  /**
   * Get activity summary for an expense
   */
  static async getActivitySummary(expenseId) {
    try {
      return await ExpenseHistory.getActivitySummary(expenseId);
    } catch (error) {
      console.error('❌ Error getting activity summary:', error);
      throw error;
    }
  }

  /**
   * Get history statistics
   */
  static async getHistoryStats(expenseId) {
    try {
      const stats = await ExpenseHistory.aggregate([
        { $match: { expenseId: mongoose.Types.ObjectId(expenseId) } },
        {
          $group: {
            _id: null,
            totalActions: { $sum: 1 },
            uniqueUsers: { $addToSet: '$performedBy' },
            firstAction: { $min: '$timestamp' },
            lastAction: { $max: '$timestamp' },
            actionsByType: {
              $push: {
                action: '$action',
                timestamp: '$timestamp'
              }
            }
          }
        },
        {
          $project: {
            totalActions: 1,
            uniqueUserCount: { $size: '$uniqueUsers' },
            firstAction: 1,
            lastAction: 1,
            actionsByType: 1
          }
        }
      ]);

      return stats[0] || {
        totalActions: 0,
        uniqueUserCount: 0,
        firstAction: null,
        lastAction: null,
        actionsByType: []
      };
    } catch (error) {
      console.error('❌ Error getting history stats:', error);
      throw error;
    }
  }
}

export default ExpenseHistoryService;
