// Banking service for dashboard statistics
import Account from '../models/Account.js';
import BankTransaction from '../models/BankTransaction.js';

const getBankingStats = async () => {
  try {
    const [
      totalAccounts,
      totalBalance,
      pendingTransactions
    ] = await Promise.all([
      Account.countDocuments(),
      Account.aggregate([
        { $group: { _id: null, total: { $sum: '$balance' } } }
      ]),
      BankTransaction.countDocuments({ status: 'pending' })
    ]);

    return {
      totalAccounts,
      totalBalance: totalBalance[0]?.total || 0,
      pendingTransactions
    };
  } catch (error) {
    console.error('Error getting banking stats:', error);
    return {
      totalAccounts: 0,
      totalBalance: 0,
      pendingTransactions: 0
    };
  }
};

export default {
  getBankingStats
};


