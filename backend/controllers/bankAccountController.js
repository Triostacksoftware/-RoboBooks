import BankAccount from '../models/BankAccount.js';
import BankTransaction from '../models/BankTransaction.js';

/**
 * GET /api/bank-accounts
 * Get all bank accounts for the authenticated user
 */
export const getBankAccounts = async (req, res) => {
  try {
    const accounts = await BankAccount.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bank accounts', error: error.message });
  }
};

/**
 * GET /api/bank-accounts/:id
 * Get a specific bank account
 */
export const getBankAccount = async (req, res) => {
  try {
    const account = await BankAccount.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!account) {
      return res.status(404).json({ message: 'Bank account not found' });
    }
    
    res.json(account);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bank account', error: error.message });
  }
};

/**
 * POST /api/bank-accounts
 * Create a new bank account
 */
export const createBankAccount = async (req, res) => {
  try {
    const accountData = {
      ...req.body,
      userId: req.user.id
    };
    
    const account = new BankAccount(accountData);
    await account.save();
    
    res.status(201).json(account);
  } catch (error) {
    res.status(400).json({ message: 'Error creating bank account', error: error.message });
  }
};

/**
 * PUT /api/bank-accounts/:id
 * Update a bank account
 */
export const updateBankAccount = async (req, res) => {
  try {
    const account = await BankAccount.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!account) {
      return res.status(404).json({ message: 'Bank account not found' });
    }
    
    res.json(account);
  } catch (error) {
    res.status(400).json({ message: 'Error updating bank account', error: error.message });
  }
};

/**
 * DELETE /api/bank-accounts/:id
 * Delete a bank account
 */
export const deleteBankAccount = async (req, res) => {
  try {
    const account = await BankAccount.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!account) {
      return res.status(404).json({ message: 'Bank account not found' });
    }
    
    // Also delete associated transactions
    await BankTransaction.deleteMany({ bankAccount: req.params.id });
    
    res.json({ message: 'Bank account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting bank account', error: error.message });
  }
};

/**
 * PATCH /api/bank-accounts/:id/sync
 * Sync a bank account (update balance and last sync time)
 */
export const syncBankAccount = async (req, res) => {
  try {
    const account = await BankAccount.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!account) {
      return res.status(404).json({ message: 'Bank account not found' });
    }
    
    // Simulate sync process
    account.lastSync = new Date();
    account.status = 'connected';
    
    // Calculate new balance from transactions
    const transactions = await BankTransaction.find({ bankAccount: account._id });
    const balance = transactions.reduce((sum, txn) => {
      if (txn.type === 'deposit' || txn.type === 'income') {
        return sum + txn.amount;
      } else {
        return sum - txn.amount;
      }
    }, 0);
    
    account.balance = balance;
    await account.save();
    
    res.json(account);
  } catch (error) {
    res.status(500).json({ message: 'Error syncing bank account', error: error.message });
  }
};

/**
 * GET /api/bank-accounts/:id/transactions
 * Get transactions for a specific bank account
 */
export const getAccountTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 50, status, category, startDate, endDate } = req.query;
    
    const filter = { bankAccount: req.params.id };
    
    if (status && status !== 'all') filter.status = status;
    if (category && category !== 'all') filter.category = category;
    if (startDate && endDate) {
      filter.txn_date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const transactions = await BankTransaction.find(filter)
      .sort({ txn_date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('account', 'name');
    
    const total = await BankTransaction.countDocuments(filter);
    
    res.json({
      transactions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactions', error: error.message });
  }
};

/**
 * GET /api/bank-accounts/summary
 * Get summary statistics for all bank accounts
 */
export const getBankAccountsSummary = async (req, res) => {
  try {
    const accounts = await BankAccount.find({ userId: req.user.id });
    
    const summary = {
      totalAccounts: accounts.length,
      connectedAccounts: accounts.filter(a => a.status === 'connected').length,
      pendingAccounts: accounts.filter(a => a.status === 'pending').length,
      errorAccounts: accounts.filter(a => a.status === 'error').length,
      totalBalance: accounts.reduce((sum, account) => sum + account.balance, 0),
      accountsByType: {
        checking: accounts.filter(a => a.type === 'checking').length,
        savings: accounts.filter(a => a.type === 'savings').length,
        credit: accounts.filter(a => a.type === 'credit').length,
        loan: accounts.filter(a => a.type === 'loan').length
      }
    };
    
    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching summary', error: error.message });
  }
};
