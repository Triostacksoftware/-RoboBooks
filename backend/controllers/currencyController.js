import CurrencyRate from '../models/CurrencyRate.js';
import CurrencyAdjustment from '../models/CurrencyAdjustment.js';
import Account from '../models/Account.js';
import { 
  fetchRealTimeRate, 
  fetchMultipleRates, 
  getSupportedCurrencies,
  fetchHistoricalRate 
} from '../services/exchangeRateService.js';
import { 
  initializeDefaultRatesForUser,
  triggerManualUpdate 
} from '../services/scheduledRatesService.js';

// Get all exchange rates
export const getExchangeRates = async (req, res) => {
  try {
    const { fromCurrency, toCurrency, isActive, date } = req.query;
    const userId = req.user.id;

    let query = { userId };

    if (fromCurrency) query.fromCurrency = fromCurrency.toUpperCase();
    if (toCurrency) query.toCurrency = toCurrency.toUpperCase();
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }

    const rates = await CurrencyRate.find(query)
      .sort({ date: -1, fromCurrency: 1, toCurrency: 1 });

    res.json({
      success: true,
      data: rates
    });
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exchange rates',
      error: error.message
    });
  }
};

// Create new exchange rate
export const createExchangeRate = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fromCurrency, toCurrency, rate, date, source, notes } = req.body;

    // Validate currencies are different
    if (fromCurrency === toCurrency) {
      return res.status(400).json({
        success: false,
        message: 'From and to currencies must be different'
      });
    }

    const exchangeRate = new CurrencyRate({
      fromCurrency: fromCurrency.toUpperCase(),
      toCurrency: toCurrency.toUpperCase(),
      rate,
      date: date || new Date(),
      source: source || 'MANUAL',
      notes,
      userId
    });

    await exchangeRate.save();

    res.status(201).json({
      success: true,
      data: exchangeRate,
      message: 'Exchange rate created successfully'
    });
  } catch (error) {
    console.error('Error creating exchange rate:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Exchange rate for this currency pair and date already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create exchange rate',
      error: error.message
    });
  }
};

// Update exchange rate
export const updateExchangeRate = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    const exchangeRate = await CurrencyRate.findOneAndUpdate(
      { _id: id, userId },
      updates,
      { new: true, runValidators: true }
    );

    if (!exchangeRate) {
      return res.status(404).json({
        success: false,
        message: 'Exchange rate not found'
      });
    }

    res.json({
      success: true,
      data: exchangeRate,
      message: 'Exchange rate updated successfully'
    });
  } catch (error) {
    console.error('Error updating exchange rate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update exchange rate',
      error: error.message
    });
  }
};

// Delete exchange rate
export const deleteExchangeRate = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const exchangeRate = await CurrencyRate.findOneAndDelete({ _id: id, userId });

    if (!exchangeRate) {
      return res.status(404).json({
        success: false,
        message: 'Exchange rate not found'
      });
    }

    res.json({
      success: true,
      message: 'Exchange rate deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting exchange rate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete exchange rate',
      error: error.message
    });
  }
};

// Get all currency adjustments
export const getCurrencyAdjustments = async (req, res) => {
  try {
    const { status, accountId, fromDate, toDate } = req.query;
    const userId = req.user.id;

    let query = { userId };

    if (status) query.status = status;
    if (accountId) query.accountId = accountId;
    if (fromDate || toDate) {
      query.adjustmentDate = {};
      if (fromDate) query.adjustmentDate.$gte = new Date(fromDate);
      if (toDate) query.adjustmentDate.$lte = new Date(toDate);
    }

    const adjustments = await CurrencyAdjustment.find(query)
      .populate('accountId', 'name code')
      .populate('approvedBy', 'firstName lastName')
      .sort({ adjustmentDate: -1 });

    res.json({
      success: true,
      data: adjustments
    });
  } catch (error) {
    console.error('Error fetching currency adjustments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch currency adjustments',
      error: error.message
    });
  }
};

// Create new currency adjustment
export const createCurrencyAdjustment = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      accountId,
      fromCurrency,
      toCurrency,
      originalAmount,
      exchangeRate,
      adjustmentDate,
      description,
      adjustmentType
    } = req.body;

    console.log('🔍 Creating currency adjustment:', {
      userId,
      accountId,
      fromCurrency,
      toCurrency,
      originalAmount,
      exchangeRate
    });

    // Handle optional account
    let account = null;
    if (accountId) {
      // First check if account exists at all
      const accountExists = await Account.findById(accountId);
      if (!accountExists) {
        console.log('❌ Account not found with ID:', accountId);
        return res.status(404).json({
          success: false,
          message: 'Account not found'
        });
      }

      console.log('🔍 Found account:', {
        id: accountExists._id,
        name: accountExists.name,
        userId: accountExists.userId,
        requestedUserId: userId
      });

      // Validate account belongs to user
      if (accountExists.userId.toString() !== userId.toString()) {
        console.log('❌ Account does not belong to user:', {
          accountUserId: accountExists.userId.toString(),
          requestUserId: userId.toString()
        });
        return res.status(404).json({
          success: false,
          message: 'Account not found'
        });
      }

      account = accountExists;
    } else {
      console.log('ℹ️ No account selected - creating adjustment without account');
    }

    // Calculate converted amount and adjustment
    const convertedAmount = originalAmount * exchangeRate;
    const amount = Math.abs(convertedAmount - originalAmount);

    const adjustment = new CurrencyAdjustment({
      accountId: accountId || null,
      accountName: account ? account.name : 'No Account Selected',
      fromCurrency: fromCurrency.toUpperCase(),
      toCurrency: toCurrency.toUpperCase(),
      originalAmount,
      convertedAmount,
      exchangeRate,
      adjustmentDate: adjustmentDate || new Date(),
      description,
      adjustmentType,
      amount,
      userId
    });

    await adjustment.save();

    res.status(201).json({
      success: true,
      data: adjustment,
      message: 'Currency adjustment created successfully'
    });
  } catch (error) {
    console.error('Error creating currency adjustment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create currency adjustment',
      error: error.message
    });
  }
};

// Update currency adjustment
export const updateCurrencyAdjustment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const {
      accountId,
      fromCurrency,
      toCurrency,
      originalAmount,
      exchangeRate,
      adjustmentDate,
      description,
      adjustmentType
    } = req.body;

    console.log('🔍 Updating currency adjustment:', {
      id,
      userId,
      accountId,
      fromCurrency,
      toCurrency,
      originalAmount,
      exchangeRate
    });

    // Find the adjustment and verify ownership
    const existingAdjustment = await CurrencyAdjustment.findOne({ _id: id, userId });
    if (!existingAdjustment) {
      console.log('❌ Currency adjustment not found or not owned by user');
      return res.status(404).json({
        success: false,
        message: 'Currency adjustment not found'
      });
    }

    // Only allow editing if status is pending
    if (existingAdjustment.status !== 'pending') {
      console.log('❌ Cannot edit approved/rejected adjustment');
      return res.status(400).json({
        success: false,
        message: 'Cannot edit approved or rejected adjustments'
      });
    }

    // Handle optional account
    let account = null;
    if (accountId) {
      const accountExists = await Account.findById(accountId);
      if (!accountExists) {
        console.log('❌ Account not found with ID:', accountId);
        return res.status(404).json({
          success: false,
          message: 'Account not found'
        });
      }

      // Validate account belongs to user
      if (accountExists.userId.toString() !== userId.toString()) {
        console.log('❌ Account does not belong to user');
        return res.status(404).json({
          success: false,
          message: 'Account not found'
        });
      }

      account = accountExists;
    } else {
      console.log('ℹ️ No account selected - updating adjustment without account');
    }

    // Calculate converted amount and adjustment
    const convertedAmount = originalAmount * exchangeRate;
    const amount = Math.abs(convertedAmount - originalAmount);

    // Update the adjustment
    const updatedAdjustment = await CurrencyAdjustment.findByIdAndUpdate(
      id,
      {
        accountId: accountId || null,
        accountName: account ? account.name : 'No Account Selected',
        fromCurrency: fromCurrency.toUpperCase(),
        toCurrency: toCurrency.toUpperCase(),
        originalAmount,
        convertedAmount,
        exchangeRate,
        adjustmentDate: adjustmentDate || new Date(),
        description,
        adjustmentType,
        amount
      },
      { new: true, runValidators: true }
    );

    console.log('✅ Currency adjustment updated successfully');

    res.json({
      success: true,
      data: updatedAdjustment,
      message: 'Currency adjustment updated successfully'
    });
  } catch (error) {
    console.error('Error updating currency adjustment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update currency adjustment',
      error: error.message
    });
  }
};

// Update currency adjustment status
export const updateAdjustmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { status, rejectionReason } = req.body;

    const updateData = { status };
    
    if (status === 'approved') {
      updateData.approvedBy = userId;
      updateData.approvedAt = new Date();
    } else if (status === 'rejected' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    const adjustment = await CurrencyAdjustment.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!adjustment) {
      return res.status(404).json({
        success: false,
        message: 'Currency adjustment not found'
      });
    }

    res.json({
      success: true,
      data: adjustment,
      message: `Adjustment ${status} successfully`
    });
  } catch (error) {
    console.error('Error updating adjustment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update adjustment status',
      error: error.message
    });
  }
};

// Get currency adjustment by ID
export const getCurrencyAdjustmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const adjustment = await CurrencyAdjustment.findOne({ _id: id, userId })
      .populate('accountId', 'name code')
      .populate('approvedBy', 'firstName lastName');

    if (!adjustment) {
      return res.status(404).json({
        success: false,
        message: 'Currency adjustment not found'
      });
    }

    res.json({
      success: true,
      data: adjustment
    });
  } catch (error) {
    console.error('Error fetching currency adjustment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch currency adjustment',
      error: error.message
    });
  }
};

// Get currency statistics
export const getCurrencyStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const [
      totalRates,
      activeRates,
      totalAdjustments,
      pendingAdjustments,
      approvedAdjustments
    ] = await Promise.all([
      CurrencyRate.countDocuments({ userId }),
      CurrencyRate.countDocuments({ userId, isActive: true }),
      CurrencyAdjustment.countDocuments({ userId }),
      CurrencyAdjustment.countDocuments({ userId, status: 'pending' }),
      CurrencyAdjustment.countDocuments({ userId, status: 'approved' })
    ]);

    res.json({
      success: true,
      data: {
        totalRates,
        activeRates,
        totalAdjustments,
        pendingAdjustments,
        approvedAdjustments
      }
    });
  } catch (error) {
    console.error('Error fetching currency stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch currency statistics',
      error: error.message
    });
  }
};

// Export currency data to Excel
export const exportCurrencyData = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type } = req.query; // 'rates' or 'adjustments'

    if (type === 'rates') {
      const rates = await CurrencyRate.find({ userId }).sort({ date: -1 });
      
      // Convert to CSV format
      const csvHeader = 'From Currency,To Currency,Rate,Date,Source,Status,Notes\n';
      const csvData = rates.map(rate => 
        `${rate.fromCurrency},${rate.toCurrency},${rate.rate},${rate.date.toISOString().split('T')[0]},${rate.source},${rate.isActive ? 'Active' : 'Inactive'},"${rate.notes || ''}"`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=exchange_rates.csv');
      res.send(csvHeader + csvData);
    } else if (type === 'adjustments') {
      const adjustments = await CurrencyAdjustment.find({ userId })
        .populate('accountId', 'name code')
        .sort({ adjustmentDate: -1 });
      
      const csvHeader = 'Reference,Account,From Currency,To Currency,Original Amount,Converted Amount,Exchange Rate,Date,Description,Status,Adjustment Type,Amount\n';
      const csvData = adjustments.map(adj => 
        `${adj.referenceNumber || ''},${adj.accountName},${adj.fromCurrency},${adj.toCurrency},${adj.originalAmount},${adj.convertedAmount},${adj.exchangeRate},${adj.adjustmentDate.toISOString().split('T')[0]},"${adj.description}",${adj.status},${adj.adjustmentType},${adj.amount}`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=currency_adjustments.csv');
      res.send(csvHeader + csvData);
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid export type. Use "rates" or "adjustments"'
      });
    }
  } catch (error) {
    console.error('Error exporting currency data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export currency data',
      error: error.message
    });
  }
};

// Import currency data from CSV
export const importCurrencyData = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, data } = req.body; // 'rates' or 'adjustments'

    if (type === 'rates') {
      const importedRates = [];
      
      for (const row of data) {
        const rate = new CurrencyRate({
          fromCurrency: row.fromCurrency?.toUpperCase(),
          toCurrency: row.toCurrency?.toUpperCase(),
          rate: parseFloat(row.rate),
          date: new Date(row.date),
          source: row.source || 'IMPORT',
          isActive: row.status?.toLowerCase() === 'active',
          notes: row.notes,
          userId
        });
        
        try {
          await rate.save();
          importedRates.push(rate);
        } catch (error) {
          if (error.code === 11000) {
            // Duplicate entry, skip
            continue;
          }
          throw error;
        }
      }
      
      res.json({
        success: true,
        message: `Successfully imported ${importedRates.length} exchange rates`,
        data: importedRates
      });
    } else if (type === 'adjustments') {
      const importedAdjustments = [];
      
      for (const row of data) {
        const adjustment = new CurrencyAdjustment({
          accountId: row.accountId,
          accountName: row.accountName,
          fromCurrency: row.fromCurrency?.toUpperCase(),
          toCurrency: row.toCurrency?.toUpperCase(),
          originalAmount: parseFloat(row.originalAmount),
          convertedAmount: parseFloat(row.convertedAmount),
          exchangeRate: parseFloat(row.exchangeRate),
          adjustmentDate: new Date(row.date),
          description: row.description,
          status: row.status?.toLowerCase() || 'pending',
          adjustmentType: row.adjustmentType?.toLowerCase() || 'neutral',
          amount: parseFloat(row.amount),
          userId
        });
        
        await adjustment.save();
        importedAdjustments.push(adjustment);
      }
      
      res.json({
        success: true,
        message: `Successfully imported ${importedAdjustments.length} currency adjustments`,
        data: importedAdjustments
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid import type. Use "rates" or "adjustments"'
      });
    }
  } catch (error) {
    console.error('Error importing currency data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to import currency data',
      error: error.message
    });
  }
};

// Fetch real-time exchange rate from external API
export const fetchRealTimeExchangeRate = async (req, res) => {
  try {
    const { fromCurrency, toCurrency } = req.params;
    const userId = req.user.id;

    if (!fromCurrency || !toCurrency) {
      return res.status(400).json({
        success: false,
        message: 'Both fromCurrency and toCurrency are required'
      });
    }

    console.log(`🔄 Fetching real-time rate for user ${userId}: ${fromCurrency} → ${toCurrency}`);

    const result = await fetchRealTimeRate(fromCurrency, toCurrency);
    
    if (result.success) {
      // Save the real-time rate to database
      const rateData = {
        ...result.data,
        userId: userId
      };

      // Check if rate already exists for today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const existingRate = await CurrencyRate.findOne({
        fromCurrency: rateData.fromCurrency,
        toCurrency: rateData.toCurrency,
        userId: userId,
        date: { $gte: today, $lt: tomorrow }
      });

      let savedRate;
      if (existingRate) {
        // Update existing rate
        savedRate = await CurrencyRate.findByIdAndUpdate(
          existingRate._id,
          { 
            rate: rateData.rate,
            source: rateData.source,
            notes: rateData.notes,
            updatedAt: new Date()
          },
          { new: true }
        );
        console.log(`✅ Updated existing real-time rate: ${savedRate._id}`);
      } else {
        // Create new rate
        savedRate = new CurrencyRate(rateData);
        await savedRate.save();
        console.log(`✅ Created new real-time rate: ${savedRate._id}`);
      }

      res.json({
        success: true,
        data: savedRate,
        message: 'Real-time exchange rate fetched and saved successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to fetch real-time exchange rate',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error fetching real-time exchange rate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch real-time exchange rate',
      error: error.message
    });
  }
};

// Fetch multiple real-time exchange rates
export const fetchMultipleRealTimeRates = async (req, res) => {
  try {
    const { currencyPairs } = req.body;
    const userId = req.user.id;

    if (!currencyPairs || !Array.isArray(currencyPairs) || currencyPairs.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'currencyPairs array is required'
      });
    }

    console.log(`🔄 Fetching ${currencyPairs.length} real-time rates for user ${userId}`);

    const result = await fetchMultipleRates(currencyPairs);
    
    if (result.success) {
      const savedRates = [];
      
      for (const rateData of result.data) {
        // Save each rate to database
        const rateToSave = {
          ...rateData,
          userId: userId
        };

        // Check if rate already exists for today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const existingRate = await CurrencyRate.findOne({
          fromCurrency: rateData.fromCurrency,
          toCurrency: rateData.toCurrency,
          userId: userId,
          date: { $gte: today, $lt: tomorrow }
        });

        let savedRate;
        if (existingRate) {
          // Update existing rate
          savedRate = await CurrencyRate.findByIdAndUpdate(
            existingRate._id,
            { 
              rate: rateData.rate,
              source: rateData.source,
              notes: rateData.notes,
              updatedAt: new Date()
            },
            { new: true }
          );
        } else {
          // Create new rate
          savedRate = new CurrencyRate(rateToSave);
          await savedRate.save();
        }

        savedRates.push(savedRate);
      }

      console.log(`✅ Successfully saved ${savedRates.length} real-time rates`);

      res.json({
        success: true,
        data: savedRates,
        message: `${savedRates.length} real-time exchange rates fetched and saved successfully`,
        errors: result.errors
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to fetch real-time exchange rates',
        error: result.error,
        errors: result.errors
      });
    }
  } catch (error) {
    console.error('Error fetching multiple real-time exchange rates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch real-time exchange rates',
      error: error.message
    });
  }
};

// Get supported currencies from external API
export const getSupportedCurrenciesFromAPI = async (req, res) => {
  try {
    console.log('🔄 Fetching supported currencies from external API');

    const result = await getSupportedCurrencies();
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        message: 'Supported currencies fetched successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to fetch supported currencies',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error fetching supported currencies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch supported currencies',
      error: error.message
    });
  }
};

// Fetch historical exchange rate
export const fetchHistoricalExchangeRate = async (req, res) => {
  try {
    const { fromCurrency, toCurrency, date } = req.params;
    const userId = req.user.id;

    if (!fromCurrency || !toCurrency || !date) {
      return res.status(400).json({
        success: false,
        message: 'fromCurrency, toCurrency, and date are required'
      });
    }

    const historicalDate = new Date(date);
    if (isNaN(historicalDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD'
      });
    }

    console.log(`🔄 Fetching historical rate for user ${userId}: ${fromCurrency} → ${toCurrency} on ${date}`);

    const result = await fetchHistoricalRate(fromCurrency, toCurrency, historicalDate);
    
    if (result.success) {
      // Save the historical rate to database
      const rateData = {
        ...result.data,
        userId: userId
      };

      // Check if historical rate already exists
      const existingRate = await CurrencyRate.findOne({
        fromCurrency: rateData.fromCurrency,
        toCurrency: rateData.toCurrency,
        userId: userId,
        date: {
          $gte: new Date(historicalDate.getFullYear(), historicalDate.getMonth(), historicalDate.getDate()),
          $lt: new Date(historicalDate.getFullYear(), historicalDate.getMonth(), historicalDate.getDate() + 1)
        }
      });

      let savedRate;
      if (existingRate) {
        // Update existing rate
        savedRate = await CurrencyRate.findByIdAndUpdate(
          existingRate._id,
          { 
            rate: rateData.rate,
            source: rateData.source,
            notes: rateData.notes,
            updatedAt: new Date()
          },
          { new: true }
        );
        console.log(`✅ Updated existing historical rate: ${savedRate._id}`);
      } else {
        // Create new rate
        savedRate = new CurrencyRate(rateData);
        await savedRate.save();
        console.log(`✅ Created new historical rate: ${savedRate._id}`);
      }

      res.json({
        success: true,
        data: savedRate,
        message: 'Historical exchange rate fetched and saved successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to fetch historical exchange rate',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error fetching historical exchange rate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch historical exchange rate',
      error: error.message
    });
  }
};

// Initialize default exchange rates for current user
export const initializeDefaultRates = async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log(`🔄 Initializing default rates for user: ${userId}`);
    
    await initializeDefaultRatesForUser(userId);
    
    res.json({
      success: true,
      message: 'Default exchange rates initialized successfully'
    });
  } catch (error) {
    console.error('Error initializing default rates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize default rates',
      error: error.message
    });
  }
};

// Manually trigger exchange rate update for all users
export const triggerExchangeRateUpdate = async (req, res) => {
  try {
    console.log('🔄 Manual exchange rate update triggered by user');
    
    await triggerManualUpdate();
    
    res.json({
      success: true,
      message: 'Exchange rates update triggered successfully'
    });
  } catch (error) {
    console.error('Error triggering exchange rate update:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to trigger exchange rate update',
      error: error.message
    });
  }
};

// Bulk update exchange rates
export const bulkUpdateRates = async (req, res) => {
  try {
    const userId = req.user.id;
    const { rates } = req.body;

    const updatedRates = [];
    
    for (const rateData of rates) {
      const rate = await CurrencyRate.findOneAndUpdate(
        { _id: rateData.id, userId },
        {
          rate: rateData.rate,
          isActive: rateData.isActive,
          notes: rateData.notes
        },
        { new: true, runValidators: true }
      );
      
      if (rate) {
        updatedRates.push(rate);
      }
    }

    res.json({
      success: true,
      message: `Successfully updated ${updatedRates.length} exchange rates`,
      data: updatedRates
    });
  } catch (error) {
    console.error('Error bulk updating rates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk update exchange rates',
      error: error.message
    });
  }
};
