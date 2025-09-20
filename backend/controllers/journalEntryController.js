import JournalEntry from '../models/JournalEntry.js';
import CurrencyAdjustment from '../models/CurrencyAdjustment.js';
import Account from '../models/Account.js';

// Get all journal entries
export const getJournalEntries = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      page = 1,
      limit = 20,
      status,
      source,
      startDate,
      endDate,
      search
    } = req.query;

    let query = { userId };

    // Apply filters
    if (status) query.status = status;
    if (source) query.source = source;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (search) {
      query.$or = [
        { entryNumber: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { reference: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const totalCount = await JournalEntry.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limitNum);

    const entries = await JournalEntry.find(query)
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      data: entries,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
        limit: limitNum
      }
    });
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch journal entries',
      error: error.message
    });
  }
};

// Get journal entry by ID
export const getJournalEntryById = async (req, res) => {
  try {
    const userId = req.user.id;
    const entryId = req.params.id;

    const entry = await JournalEntry.findOne({ _id: entryId, userId })
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .populate('reversedBy', 'name email')
      .populate('lineItems.accountId', 'name code type');

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found'
      });
    }

    res.json({
      success: true,
      data: entry
    });
  } catch (error) {
    console.error('Error fetching journal entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch journal entry',
      error: error.message
    });
  }
};

// Create journal entry from currency adjustment
export const createJournalEntryFromAdjustment = async (req, res) => {
  try {
    const userId = req.user.id;
    const adjustmentId = req.params.adjustmentId;

    // Get the currency adjustment
    const adjustment = await CurrencyAdjustment.findOne({ _id: adjustmentId, userId });
    if (!adjustment) {
      return res.status(404).json({
        success: false,
        message: 'Currency adjustment not found'
      });
    }

    // Check if journal entry already exists
    const existingEntry = await JournalEntry.findOne({
      source: 'currency_adjustment',
      sourceId: adjustmentId,
      userId
    });

    if (existingEntry) {
      return res.status(400).json({
        success: false,
        message: 'Journal entry already exists for this currency adjustment'
      });
    }

    // Get accounts for the adjustment
    const fromAccount = adjustment.accountId ? await Account.findById(adjustment.accountId) : null;
    const exchangeGainLossAccount = await Account.findOne({
      userId,
      type: 'income',
      name: { $regex: /exchange.*gain.*loss/i }
    });

    if (!exchangeGainLossAccount) {
      return res.status(400).json({
        success: false,
        message: 'Exchange gain/loss account not found. Please create one first.'
      });
    }

    // Calculate amounts
    const originalAmount = adjustment.originalAmount;
    const convertedAmount = adjustment.convertedAmount;
    const exchangeDifference = convertedAmount - originalAmount;

    // Create journal entry
    const journalEntry = new JournalEntry({
      userId,
      description: `Currency adjustment: ${adjustment.fromCurrency} to ${adjustment.toCurrency}`,
      reference: `CA-${adjustment._id.toString().slice(-8)}`,
      source: 'currency_adjustment',
      sourceId: adjustmentId,
      sourceModel: 'CurrencyAdjustment',
      currency: adjustment.toCurrency,
      exchangeRate: adjustment.exchangeRate,
      totalDebit: Math.abs(exchangeDifference),
      totalCredit: Math.abs(exchangeDifference),
      lineItems: [
        // Debit: Exchange gain/loss account (if loss) or Asset account (if gain)
        {
          accountId: exchangeDifference < 0 ? exchangeGainLossAccount._id : (fromAccount?._id || exchangeGainLossAccount._id),
          accountName: exchangeDifference < 0 ? exchangeGainLossAccount.name : (fromAccount?.name || 'Currency Adjustment Account'),
          description: `Exchange ${exchangeDifference < 0 ? 'loss' : 'gain'} on ${adjustment.fromCurrency} to ${adjustment.toCurrency}`,
          debit: Math.abs(exchangeDifference),
          credit: 0,
          currency: adjustment.toCurrency,
          exchangeRate: adjustment.exchangeRate,
          baseAmount: Math.abs(exchangeDifference)
        },
        // Credit: Exchange gain/loss account (if gain) or Asset account (if loss)
        {
          accountId: exchangeDifference > 0 ? exchangeGainLossAccount._id : (fromAccount?._id || exchangeGainLossAccount._id),
          accountName: exchangeDifference > 0 ? exchangeGainLossAccount.name : (fromAccount?.name || 'Currency Adjustment Account'),
          description: `Exchange ${exchangeDifference > 0 ? 'gain' : 'loss'} on ${adjustment.fromCurrency} to ${adjustment.toCurrency}`,
          debit: 0,
          credit: Math.abs(exchangeDifference),
          currency: adjustment.toCurrency,
          exchangeRate: adjustment.exchangeRate,
          baseAmount: Math.abs(exchangeDifference)
        }
      ],
      createdBy: userId,
      status: 'draft'
    });

    // Validate the entry
    const validation = journalEntry.validateEntry();
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid journal entry',
        errors: validation.errors
      });
    }

    await journalEntry.save();

    res.json({
      success: true,
      message: 'Journal entry created successfully',
      data: journalEntry
    });
  } catch (error) {
    console.error('Error creating journal entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create journal entry',
      error: error.message
    });
  }
};

// Create manual journal entry
export const createManualJournalEntry = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      description,
      reference,
      currency,
      exchangeRate,
      lineItems,
      notes
    } = req.body;

    // Validate line items
    if (!lineItems || lineItems.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Journal entry must have at least 2 line items'
      });
    }

    // Calculate totals
    const totalDebit = lineItems.reduce((sum, item) => sum + (item.debit || 0), 0);
    const totalCredit = lineItems.reduce((sum, item) => sum + (item.credit || 0), 0);

    // Validate balance
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return res.status(400).json({
        success: false,
        message: 'Journal entry is not balanced (debits must equal credits)'
      });
    }

    // Validate accounts exist
    const accountIds = lineItems.map(item => item.accountId);
    const accounts = await Account.find({ _id: { $in: accountIds }, userId });
    
    if (accounts.length !== accountIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more accounts not found'
      });
    }

    // Create account name mapping
    const accountMap = {};
    accounts.forEach(account => {
      accountMap[account._id.toString()] = account.name;
    });

    // Create journal entry
    const journalEntry = new JournalEntry({
      userId,
      description,
      reference,
      source: 'manual',
      sourceModel: 'ManualEntry',
      currency,
      exchangeRate,
      totalDebit,
      totalCredit,
      lineItems: lineItems.map(item => ({
        ...item,
        accountName: accountMap[item.accountId]
      })),
      notes,
      createdBy: userId,
      status: 'draft'
    });

    // Validate the entry
    const validation = journalEntry.validateEntry();
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid journal entry',
        errors: validation.errors
      });
    }

    await journalEntry.save();

    res.json({
      success: true,
      message: 'Journal entry created successfully',
      data: journalEntry
    });
  } catch (error) {
    console.error('Error creating manual journal entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create journal entry',
      error: error.message
    });
  }
};

// Post journal entry
export const postJournalEntry = async (req, res) => {
  try {
    const userId = req.user.id;
    const entryId = req.params.id;

    const entry = await JournalEntry.findOne({ _id: entryId, userId });
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found'
      });
    }

    if (entry.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Only draft entries can be posted'
      });
    }

    // Validate the entry
    const validation = entry.validateEntry();
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid journal entry',
        errors: validation.errors
      });
    }

    // Update entry status
    entry.status = 'posted';
    entry.approvedBy = userId;
    entry.approvedAt = new Date();
    await entry.save();

    res.json({
      success: true,
      message: 'Journal entry posted successfully',
      data: entry
    });
  } catch (error) {
    console.error('Error posting journal entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to post journal entry',
      error: error.message
    });
  }
};

// Reverse journal entry
export const reverseJournalEntry = async (req, res) => {
  try {
    const userId = req.user.id;
    const entryId = req.params.id;
    const { reason } = req.body;

    const entry = await JournalEntry.findOne({ _id: entryId, userId });
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found'
      });
    }

    if (entry.status !== 'posted') {
      return res.status(400).json({
        success: false,
        message: 'Only posted entries can be reversed'
      });
    }

    // Create reversal entry
    const reversalEntry = new JournalEntry({
      userId,
      entryNumber: `REV-${entry.entryNumber}`,
      description: `Reversal of ${entry.description}`,
      reference: entry.reference,
      source: 'system',
      sourceModel: 'SystemEntry',
      currency: entry.currency,
      exchangeRate: entry.exchangeRate,
      totalDebit: entry.totalCredit, // Swap debits and credits
      totalCredit: entry.totalDebit,
      lineItems: entry.lineItems.map(item => ({
        ...item,
        debit: item.credit, // Swap debits and credits
        credit: item.debit,
        description: `Reversal: ${item.description}`
      })),
      notes: `Reversal of ${entry.entryNumber}. Reason: ${reason || 'No reason provided'}`,
      createdBy: userId,
      status: 'posted',
      approvedBy: userId,
      approvedAt: new Date()
    });

    await reversalEntry.save();

    // Update original entry
    entry.status = 'reversed';
    entry.reversedBy = userId;
    entry.reversedAt = new Date();
    entry.reversalReason = reason;
    await entry.save();

    res.json({
      success: true,
      message: 'Journal entry reversed successfully',
      data: {
        originalEntry: entry,
        reversalEntry
      }
    });
  } catch (error) {
    console.error('Error reversing journal entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reverse journal entry',
      error: error.message
    });
  }
};

// Delete journal entry (only if draft)
export const deleteJournalEntry = async (req, res) => {
  try {
    const userId = req.user.id;
    const entryId = req.params.id;

    const entry = await JournalEntry.findOne({ _id: entryId, userId });
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found'
      });
    }

    if (entry.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Only draft entries can be deleted'
      });
    }

    await JournalEntry.findByIdAndDelete(entryId);

    res.json({
      success: true,
      message: 'Journal entry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete journal entry',
      error: error.message
    });
  }
};
