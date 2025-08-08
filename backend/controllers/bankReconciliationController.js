import BankReconciliation from '../models/BankReconciliation.js';
import BankTransaction from '../models/BankTransaction.js';
import BankAccount from '../models/BankAccount.js';

/**
 * GET /api/bank-reconciliations
 * Get all reconciliations for the authenticated user
 */
export const getReconciliations = async (req, res) => {
  try {
    const reconciliations = await BankReconciliation.find({ userId: req.user.id })
      .populate('accountId', 'name bank accountNumber')
      .sort({ createdAt: -1 });
    
    res.json(reconciliations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reconciliations', error: error.message });
  }
};

/**
 * GET /api/bank-reconciliations/:id
 * Get a specific reconciliation
 */
export const getReconciliation = async (req, res) => {
  try {
    const reconciliation = await BankReconciliation.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    }).populate('accountId', 'name bank accountNumber');
    
    if (!reconciliation) {
      return res.status(404).json({ message: 'Reconciliation not found' });
    }
    
    res.json(reconciliation);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reconciliation', error: error.message });
  }
};

/**
 * POST /api/bank-reconciliations
 * Create a new reconciliation
 */
export const createReconciliation = async (req, res) => {
  try {
    const { accountId, startDate, endDate } = req.body;
    
    // Get account details
    const account = await BankAccount.findOne({ _id: accountId, userId: req.user.id });
    if (!account) {
      return res.status(404).json({ message: 'Bank account not found' });
    }
    
    // Get bank transactions for the period
    const bankTransactions = await BankTransaction.find({
      bankAccount: accountId,
      txn_date: { $gte: new Date(startDate), $lte: new Date(endDate) }
    }).sort({ txn_date: 1 });
    
    // Calculate bank balance
    const bankBalance = bankTransactions.reduce((sum, txn) => {
      if (txn.type === 'deposit' || txn.type === 'income') {
        return sum + txn.amount;
      } else {
        return sum - txn.amount;
      }
    }, 0);
    
    // Create reconciliation items
    const items = bankTransactions.map(txn => ({
      bankTransaction: {
        id: txn._id.toString(),
        description: txn.description,
        amount: txn.amount,
        date: txn.txn_date,
        reference: txn.reference
      },
      status: 'unmatched'
    }));
    
    const reconciliationData = {
      accountId,
      accountName: account.name,
      bankBalance,
      bookBalance: account.balance, // This would come from your accounting system
      difference: bankBalance - account.balance,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      items,
      userId: req.user.id
    };
    
    const reconciliation = new BankReconciliation(reconciliationData);
    await reconciliation.save();
    
    res.status(201).json(reconciliation);
  } catch (error) {
    res.status(400).json({ message: 'Error creating reconciliation', error: error.message });
  }
};

/**
 * PUT /api/bank-reconciliations/:id
 * Update a reconciliation
 */
export const updateReconciliation = async (req, res) => {
  try {
    const reconciliation = await BankReconciliation.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!reconciliation) {
      return res.status(404).json({ message: 'Reconciliation not found' });
    }
    
    res.json(reconciliation);
  } catch (error) {
    res.status(400).json({ message: 'Error updating reconciliation', error: error.message });
  }
};

/**
 * PATCH /api/bank-reconciliations/:id/items/:itemId
 * Update a reconciliation item
 */
export const updateReconciliationItem = async (req, res) => {
  try {
    const { id, itemId } = req.params;
    const { status, bookTransaction, notes } = req.body;
    
    const reconciliation = await BankReconciliation.findOne({ 
      _id: id, 
      userId: req.user.id 
    });
    
    if (!reconciliation) {
      return res.status(404).json({ message: 'Reconciliation not found' });
    }
    
    const item = reconciliation.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Reconciliation item not found' });
    }
    
    if (status) item.status = status;
    if (bookTransaction) item.bookTransaction = bookTransaction;
    if (notes) item.notes = notes;
    
    // Calculate difference if both transactions exist
    if (item.bankTransaction && item.bookTransaction) {
      item.difference = item.bankTransaction.amount - item.bookTransaction.amount;
    }
    
    await reconciliation.save();
    
    res.json(reconciliation);
  } catch (error) {
    res.status(400).json({ message: 'Error updating reconciliation item', error: error.message });
  }
};

/**
 * POST /api/bank-reconciliations/:id/complete
 * Complete a reconciliation
 */
export const completeReconciliation = async (req, res) => {
  try {
    const reconciliation = await BankReconciliation.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!reconciliation) {
      return res.status(404).json({ message: 'Reconciliation not found' });
    }
    
    // Check if all items are reconciled
    const unreconciledItems = reconciliation.items.filter(item => item.status === 'unmatched');
    if (unreconciledItems.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot complete reconciliation with unreconciled items',
        unreconciledCount: unreconciledItems.length
      });
    }
    
    reconciliation.status = 'completed';
    await reconciliation.save();
    
    res.json(reconciliation);
  } catch (error) {
    res.status(500).json({ message: 'Error completing reconciliation', error: error.message });
  }
};

/**
 * GET /api/bank-reconciliations/account/:accountId
 * Get reconciliations for a specific account
 */
export const getAccountReconciliations = async (req, res) => {
  try {
    const reconciliations = await BankReconciliation.find({ 
      accountId: req.params.accountId,
      userId: req.user.id 
    }).sort({ createdAt: -1 });
    
    res.json(reconciliations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching account reconciliations', error: error.message });
  }
};

/**
 * POST /api/bank-reconciliations/:id/auto-match
 * Attempt to auto-match reconciliation items
 */
export const autoMatchReconciliation = async (req, res) => {
  try {
    const reconciliation = await BankReconciliation.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!reconciliation) {
      return res.status(404).json({ message: 'Reconciliation not found' });
    }
    
    // Simple auto-matching logic based on amount and date proximity
    const unmatchedItems = reconciliation.items.filter(item => item.status === 'unmatched');
    
    for (const item of unmatchedItems) {
      // Find potential matches based on amount and date
      const potentialMatches = await BankTransaction.find({
        account: reconciliation.accountId,
        amount: item.bankTransaction.amount,
        txn_date: {
          $gte: new Date(item.bankTransaction.date.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days before
          $lte: new Date(item.bankTransaction.date.getTime() + 7 * 24 * 60 * 60 * 1000)  // 7 days after
        }
      });
      
      if (potentialMatches.length === 1) {
        const match = potentialMatches[0];
        item.bookTransaction = {
          id: match._id.toString(),
          description: match.description,
          amount: match.amount,
          date: match.txn_date,
          type: match.type
        };
        item.status = 'matched';
      }
    }
    
    await reconciliation.save();
    
    res.json(reconciliation);
  } catch (error) {
    res.status(500).json({ message: 'Error auto-matching reconciliation', error: error.message });
  }
};
