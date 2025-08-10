import BankAccount from '../models/BankAccount.js';
import BankTransaction from '../models/BankTransaction.js';

/**
 * GET /api/banking/overview
 * Get banking overview data including balances, cash flow, and account summaries
 */
export const getBankingOverview = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Get all user's bank accounts
    const accounts = await BankAccount.find({ userId: req.user.id });
    
    // Calculate total balance
    const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
    
    // Get transaction data for cash flow analysis
    const transactionFilter = { userId: req.user.id };
    if (startDate && endDate) {
      transactionFilter.txn_date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const transactions = await BankTransaction.find(transactionFilter);
    
    // Calculate cash flow data
    const income = transactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const netFlow = income - expenses;
    
    // Account status summary
    const accountSummary = {
      total: accounts.length,
      connected: accounts.filter(a => a.status === 'connected').length,
      pending: accounts.filter(a => a.status === 'pending').length,
      disconnected: accounts.filter(a => a.status === 'disconnected').length,
      error: accounts.filter(a => a.status === 'error').length
    };
    
    // Account type breakdown
    const accountsByType = {
      checking: accounts.filter(a => a.type === 'checking').length,
      savings: accounts.filter(a => a.type === 'savings').length,
      credit: accounts.filter(a => a.type === 'credit').length,
      loan: accounts.filter(a => a.type === 'loan').length
    };
    
    // Recent transactions for connected accounts
    const connectedAccounts = accounts.filter(a => a.status === 'connected');
    const recentTransactions = await BankTransaction.find({
      bankAccount: { $in: connectedAccounts.map(a => a._id) },
      userId: req.user.id
    })
    .sort({ txn_date: -1 })
    .limit(10)
    .populate('bankAccount', 'name bank accountNumber');
    
    const overview = {
      totalBalance,
      cashFlow: {
        income,
        expenses,
        netFlow
      },
      accountSummary,
      accountsByType,
      connectedAccounts: connectedAccounts.map(account => ({
        id: account._id,
        name: account.name,
        bank: account.bank,
        accountNumber: account.accountNumber,
        balance: account.balance,
        type: account.type,
        status: account.status,
        lastSync: account.lastSync,
        currency: account.currency
      })),
      recentTransactions: recentTransactions.map(txn => ({
        id: txn._id,
        description: txn.description,
        amount: txn.amount,
        type: txn.type,
        category: txn.category,
        date: txn.txn_date,
        account: txn.bankAccount?.name || 'Unknown',
        status: txn.status,
        reference: txn.reference
      }))
    };
    
    res.json(overview);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching banking overview', error: error.message });
  }
};

/**
 * GET /api/banking/cash-flow
 * Get detailed cash flow analysis
 */
export const getCashFlow = async (req, res) => {
  try {
    const { period = 'month', startDate, endDate } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    // Set date range based on period
    switch (period) {
      case 'week':
        dateFilter = {
          $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          $lte: now
        };
        break;
      case 'month':
        dateFilter = {
          $gte: new Date(now.getFullYear(), now.getMonth(), 1),
          $lte: now
        };
        break;
      case 'quarter':
        const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        dateFilter = {
          $gte: quarterStart,
          $lte: now
        };
        break;
      case 'year':
        dateFilter = {
          $gte: new Date(now.getFullYear(), 0, 1),
          $lte: now
        };
        break;
      case 'custom':
        if (startDate && endDate) {
          dateFilter = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          };
        }
        break;
    }
    
    const transactions = await BankTransaction.find({
      userId: req.user.id,
      txn_date: dateFilter
    }).sort({ txn_date: 1 });
    
    // Group transactions by date
    const dailyData = {};
    transactions.forEach(txn => {
      const date = txn.txn_date.toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = { income: 0, expenses: 0, net: 0 };
      }
      
      if (txn.amount > 0) {
        dailyData[date].income += txn.amount;
      } else {
        dailyData[date].expenses += Math.abs(txn.amount);
      }
      dailyData[date].net += txn.amount;
    });
    
    // Convert to array format
    const cashFlowData = Object.entries(dailyData).map(([date, data]) => ({
      date,
      income: data.income,
      expenses: data.expenses,
      net: data.net
    }));
    
    // Calculate totals
    const totals = cashFlowData.reduce((acc, day) => ({
      income: acc.income + day.income,
      expenses: acc.expenses + day.expenses,
      net: acc.net + day.net
    }), { income: 0, expenses: 0, net: 0 });
    
    res.json({
      period,
      dateRange: {
        start: Object.keys(dailyData).sort()[0],
        end: Object.keys(dailyData).sort().pop()
      },
      totals,
      dailyData: cashFlowData
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cash flow data', error: error.message });
  }
};

/**
 * GET /api/banking/account-analytics/:accountId
 * Get analytics for a specific account
 */
export const getAccountAnalytics = async (req, res) => {
  try {
    const { accountId } = req.params;
    const { period = 'month' } = req.query;
    
    // Verify account belongs to user
    const account = await BankAccount.findOne({ 
      _id: accountId, 
      userId: req.user.id 
    });
    
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }
    
    // Get transactions for the account
    const transactions = await BankTransaction.find({
      bankAccount: accountId,
      userId: req.user.id
    }).sort({ txn_date: -1 });
    
    // Calculate analytics
    const analytics = {
      account: {
        id: account._id,
        name: account.name,
        bank: account.bank,
        type: account.type,
        balance: account.balance,
        status: account.status
      },
      transactionCount: transactions.length,
      totalIncome: transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0),
      totalExpenses: transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0),
      averageTransaction: transactions.length > 0 ? transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / transactions.length : 0,
      byCategory: {},
      byMonth: {},
      recentActivity: transactions.slice(0, 10).map(t => ({
        id: t._id,
        description: t.description,
        amount: t.amount,
        category: t.category,
        date: t.txn_date,
        type: t.type
      }))
    };
    
    // Group by category
    transactions.forEach(t => {
      const category = t.category || 'Uncategorized';
      if (!analytics.byCategory[category]) {
        analytics.byCategory[category] = { count: 0, amount: 0 };
      }
      analytics.byCategory[category].count++;
      analytics.byCategory[category].amount += Math.abs(t.amount);
    });
    
    // Group by month
    transactions.forEach(t => {
      const month = t.txn_date.toISOString().slice(0, 7); // YYYY-MM format
      if (!analytics.byMonth[month]) {
        analytics.byMonth[month] = { income: 0, expenses: 0, net: 0 };
      }
      
      if (t.amount > 0) {
        analytics.byMonth[month].income += t.amount;
      } else {
        analytics.byMonth[month].expenses += Math.abs(t.amount);
      }
      analytics.byMonth[month].net += t.amount;
    });
    
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching account analytics', error: error.message });
  }
};

/**
 * GET /api/banking/sync-status
 * Get sync status for all accounts
 */
export const getSyncStatus = async (req, res) => {
  try {
    const accounts = await BankAccount.find({ userId: req.user.id });
    
    const syncStatus = accounts.map(account => ({
      id: account._id,
      name: account.name,
      bank: account.bank,
      status: account.status,
      lastSync: account.lastSync,
      autoSync: account.autoSync,
      syncFrequency: account.syncFrequency,
      lastError: account.lastError
    }));
    
    res.json(syncStatus);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sync status', error: error.message });
  }
};
