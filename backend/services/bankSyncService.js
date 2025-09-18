import BankAccount from '../models/BankAccount.js';
import BankTransaction from '../models/BankTransaction.js';

/**
 * Sync a bank account and update its balance
 */
export const syncBankAccount = async (accountId, userId) => {
  try {
    const account = await BankAccount.findOne({ _id: accountId, userId });
    if (!account) {
      throw new Error('Bank account not found');
    }

    // Get all transactions for this account
    const transactions = await BankTransaction.find({ 
      bankAccount: accountId,
      userId 
    });

    // Calculate new balance
    const balance = transactions.reduce((sum, txn) => {
      if (txn.type === 'deposit' || txn.type === 'income') {
        return sum + txn.amount;
      } else {
        return sum - txn.amount;
      }
    }, 0);

    // Update account balance and sync time
    account.balance = balance;
    account.lastSync = new Date();
    account.status = 'connected';
    account.lastError = null;

    await account.save();

    return account;
  } catch (error) {
    // Update account with error status
    await BankAccount.findByIdAndUpdate(accountId, {
      status: 'error',
      lastError: {
        message: error.message,
        timestamp: new Date()
      }
    });

    throw error;
  }
};

/**
 * Import transactions from external bank API
 * This is a mock implementation - in real scenario, you'd integrate with actual bank APIs
 */
export const importBankTransactions = async (accountId, userId, transactions) => {
  try {
    const account = await BankAccount.findOne({ _id: accountId, userId });
    if (!account) {
      throw new Error('Bank account not found');
    }

    const importedTransactions = [];

    for (const txnData of transactions) {
      // Check if transaction already exists
      const existingTxn = await BankTransaction.findOne({
        externalId: txnData.externalId,
        bankAccount: accountId,
        userId
      });

      if (!existingTxn) {
        // Create new transaction
        const newTxn = new BankTransaction({
          bankAccount: accountId,
          account: account.account, // Link to accounting account
          type: txnData.amount > 0 ? 'deposit' : 'withdrawal',
          amount: Math.abs(txnData.amount),
          description: txnData.description,
          txn_date: new Date(txnData.date),
          reference: txnData.reference,
          externalId: txnData.externalId,
          merchant: txnData.merchant,
          location: txnData.location,
          userId
        });

        await newTxn.save();
        importedTransactions.push(newTxn);
      }
    }

    // Update account balance after import
    await syncBankAccount(accountId, userId);

    return {
      imported: importedTransactions.length,
      transactions: importedTransactions
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Auto-categorize transactions based on merchant names and patterns
 */
export const autoCategorizeTransactions = async (userId) => {
  try {
    const uncategorizedTransactions = await BankTransaction.find({
      userId,
      category: { $in: ['Uncategorized', null, ''] }
    });

    const categorizationRules = {
      'Office Supplies': ['staples', 'office depot', 'amazon office'],
      'Transportation': ['uber', 'lyft', 'taxi', 'gas', 'shell', 'exxon'],
      'Software': ['adobe', 'microsoft', 'google', 'zoom', 'slack'],
      'Client Payments': ['client', 'customer', 'payment received'],
      'Utilities': ['electric', 'water', 'gas', 'internet', 'phone'],
      'Marketing': ['facebook', 'google ads', 'linkedin', 'marketing']
    };

    let categorized = 0;

    for (const txn of uncategorizedTransactions) {
      const description = txn.description.toLowerCase();
      const merchant = (txn.merchant || '').toLowerCase();

      for (const [category, keywords] of Object.entries(categorizationRules)) {
        const matches = keywords.some(keyword => 
          description.includes(keyword) || merchant.includes(keyword)
        );

        if (matches) {
          txn.category = category;
          await txn.save();
          categorized++;
          break;
        }
      }
    }

    return { categorized, total: uncategorizedTransactions.length };
  } catch (error) {
    throw error;
  }
};

/**
 * Get sync status for all user accounts
 */
export const getSyncStatus = async (userId) => {
  try {
    const accounts = await BankAccount.find({ userId });
    
    const status = {
      total: accounts.length,
      connected: accounts.filter(a => a.status === 'connected').length,
      pending: accounts.filter(a => a.status === 'pending').length,
      error: accounts.filter(a => a.status === 'error').length,
      disconnected: accounts.filter(a => a.status === 'disconnected').length,
      accounts: accounts.map(account => ({
        id: account._id,
        name: account.name,
        bank: account.bank,
        status: account.status,
        lastSync: account.lastSync,
        balance: account.balance,
        lastError: account.lastError
      }))
    };

    return status;
  } catch (error) {
    throw error;
  }
};

/**
 * Bulk sync all connected accounts
 */
export const bulkSyncAccounts = async (userId) => {
  try {
    const accounts = await BankAccount.find({ 
      userId, 
      status: { $in: ['connected', 'pending'] } 
    });

    const results = [];

    for (const account of accounts) {
      try {
        const syncedAccount = await syncBankAccount(account._id, userId);
        results.push({
          accountId: account._id,
          accountName: account.name,
          status: 'success',
          balance: syncedAccount.balance,
          lastSync: syncedAccount.lastSync
        });
      } catch (error) {
        results.push({
          accountId: account._id,
          accountName: account.name,
          status: 'error',
          error: error.message
        });
      }
    }

    return results;
  } catch (error) {
    throw error;
  }
};


