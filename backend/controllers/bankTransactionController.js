// controllers/bankTransactionController.js
import mongoose from 'mongoose';
import BankTransaction from '../models/BankTransaction.js';
import BankAccount from '../models/BankAccount.js';
import { applyTransaction } from '../services/applyTransaction.js';
import {
  applyTransactionToAccount,
  revertTransactionFromAccount,
} from '../services/bankService.js';

/**
 * GET /api/bank-transactions
 * List (optionally filtered) bank transactions.
 */
export const listTransactions = async (req, res) => {
  try {
    const { 
      reconciled, 
      status, 
      category, 
      type, 
      startDate, 
      endDate, 
      page = 1, 
      limit = 50,
      search 
    } = req.query;
    
    const filter = { userId: req.user.id };
    
    if (reconciled !== undefined) filter.reconciled = reconciled === 'true';
    if (status && status !== 'all') filter.status = status;
    if (category && category !== 'all') filter.category = category;
    if (type && type !== 'all') filter.type = type;
    if (startDate && endDate) {
      filter.txn_date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { merchant: { $regex: search, $options: 'i' } }
      ];
    }
    
    const transactions = await BankTransaction.find(filter)
      .populate('account', 'name')
      .populate('bankAccount', 'name bank')
      .sort({ txn_date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await BankTransaction.countDocuments(filter);
    
    // Calculate summary statistics
    const income = transactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    res.json({
      transactions,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit)
      },
      summary: {
        total: transactions.reduce((sum, t) => sum + t.amount, 0),
        income,
        expenses
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactions', error: error.message });
  }
};

/**
 * GET /api/bank-transactions/:id
 * Get a specific transaction
 */
export const getTransaction = async (req, res) => {
  try {
    const transaction = await BankTransaction.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    }).populate('account', 'name').populate('bankAccount', 'name bank');
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transaction', error: error.message });
  }
};

/**
 * POST /api/bank-transactions
 * Create a deposit / withdrawal and update account balance.
 */
export const createTransaction = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const transactionData = {
      ...req.body,
      userId: req.user.id
    };
    
    const [txn] = await BankTransaction.create([transactionData], { session });
    await applyTransaction(txn, session);
    await session.commitTransaction();
    
    const populatedTxn = await BankTransaction.findById(txn._id)
      .populate('account', 'name')
      .populate('bankAccount', 'name bank');
    
    res.status(201).json(populatedTxn);
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ message: err.message });
  } finally {
    session.endSession();
  }
};

/**
 * PUT /api/bank-transactions/:id
 * Update a transaction
 */
export const updateTransaction = async (req, res) => {
  try {
    const transaction = await BankTransaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    ).populate('account', 'name').populate('bankAccount', 'name bank');
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (error) {
    res.status(400).json({ message: 'Error updating transaction', error: error.message });
  }
};

/**
 * PATCH /api/bank-transactions/:id/reconcile
 * Mark one transaction as reconciled.
 */
export const reconcileTransaction = async (req, res) => {
  try {
    const txn = await BankTransaction.findByIdAndUpdate(
      req.params.id,
      { reconciled: true, status: 'reconciled' },
      { new: true },
    ).populate('account', 'name').populate('bankAccount', 'name bank');
    
    if (!txn) return res.status(404).json({ message: 'Transaction not found' });
    res.json(txn);
  } catch (error) {
    res.status(500).json({ message: 'Error reconciling transaction', error: error.message });
  }
};

/**
 * PATCH /api/bank-transactions/:id/categorize
 * Update transaction category
 */
export const categorizeTransaction = async (req, res) => {
  try {
    const { category, tags } = req.body;
    const txn = await BankTransaction.findByIdAndUpdate(
      req.params.id,
      { category, tags },
      { new: true },
    ).populate('account', 'name').populate('bankAccount', 'name bank');
    
    if (!txn) return res.status(404).json({ message: 'Transaction not found' });
    res.json(txn);
  } catch (error) {
    res.status(500).json({ message: 'Error categorizing transaction', error: error.message });
  }
};

export const deleteTransaction = async (req, res) => {
  const { id } = req.params;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const txn = await BankTransaction.findById(id).session(session);
    if (!txn) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Transaction not found' });
    }

    await revertTransactionFromAccount(txn, session); // restore balance
    await txn.deleteOne({ session });                 // delete transaction
    await session.commitTransaction();
    res.status(204).end();
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ message: err.message });
  } finally {
    session.endSession();
  }
};

/**
 * GET /api/bank-transactions/categories
 * Get all transaction categories
 */
export const getTransactionCategories = async (req, res) => {
  try {
    const categories = await BankTransaction.distinct('category', { userId: req.user.id });
    res.json(categories.filter(cat => cat && cat !== 'Uncategorized'));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
};

/**
 * GET /api/bank-transactions/summary
 * Get transaction summary statistics
 */
export const getTransactionSummary = async (req, res) => {
  try {
    const { startDate, endDate, accountId } = req.query;
    
    const filter = { userId: req.user.id };
    if (startDate && endDate) {
      filter.txn_date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (accountId) {
      filter.bankAccount = accountId;
    }
    
    const transactions = await BankTransaction.find(filter);
    
    const summary = {
      totalTransactions: transactions.length,
      totalAmount: transactions.reduce((sum, t) => sum + t.amount, 0),
      income: transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0),
      expenses: transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0),
      reconciled: transactions.filter(t => t.reconciled).length,
      unreconciled: transactions.filter(t => !t.reconciled).length,
      byCategory: {},
      byType: {
        deposit: transactions.filter(t => t.type === 'deposit').length,
        withdrawal: transactions.filter(t => t.type === 'withdrawal').length,
        income: transactions.filter(t => t.type === 'income').length,
        expense: transactions.filter(t => t.type === 'expense').length
      }
    };
    
    // Group by category
    transactions.forEach(t => {
      const category = t.category || 'Uncategorized';
      if (!summary.byCategory[category]) {
        summary.byCategory[category] = { count: 0, amount: 0 };
      }
      summary.byCategory[category].count++;
      summary.byCategory[category].amount += t.amount;
    });
    
    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching summary', error: error.message });
  }
};
