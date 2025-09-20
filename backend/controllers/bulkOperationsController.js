import CurrencyAdjustment from '../models/CurrencyAdjustment.js';
import CurrencyRate from '../models/CurrencyRate.js';
import JournalEntry from '../models/JournalEntry.js';
import Account from '../models/Account.js';
import { fetchRealTimeRate } from '../services/exchangeRateService.js';

// Bulk create currency adjustments
export const bulkCreateAdjustments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { adjustments, options = {} } = req.body;

    if (!adjustments || !Array.isArray(adjustments) || adjustments.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Adjustments array is required and cannot be empty'
      });
    }

    const results = {
      successful: [],
      failed: [],
      total: adjustments.length
    };

    // Process each adjustment
    for (let i = 0; i < adjustments.length; i++) {
      const adjustmentData = adjustments[i];
      
      try {
        // Validate required fields
        if (!adjustmentData.fromCurrency || !adjustmentData.toCurrency || 
            !adjustmentData.originalAmount || !adjustmentData.exchangeRate) {
          results.failed.push({
            index: i,
            data: adjustmentData,
            error: 'Missing required fields: fromCurrency, toCurrency, originalAmount, exchangeRate'
          });
          continue;
        }

        // Get account if specified
        let account = null;
        if (adjustmentData.accountId) {
          account = await Account.findOne({ _id: adjustmentData.accountId, userId });
          if (!account) {
            results.failed.push({
              index: i,
              data: adjustmentData,
              error: 'Account not found'
            });
            continue;
          }
        }

        // Calculate converted amount
        const convertedAmount = adjustmentData.originalAmount * adjustmentData.exchangeRate;

        // Create adjustment
        const adjustment = new CurrencyAdjustment({
          userId,
          accountId: adjustmentData.accountId || null,
          accountName: account?.name || adjustmentData.accountName || 'Bulk Import',
          fromCurrency: adjustmentData.fromCurrency.toUpperCase(),
          toCurrency: adjustmentData.toCurrency.toUpperCase(),
          originalAmount: adjustmentData.originalAmount,
          convertedAmount: convertedAmount,
          exchangeRate: adjustmentData.exchangeRate,
          description: adjustmentData.description || `Bulk adjustment ${i + 1}`,
          referenceNumber: adjustmentData.referenceNumber || `BULK-${Date.now()}-${i + 1}`,
          status: options.autoApprove ? 'approved' : 'pending',
          createdBy: userId,
          approvedBy: options.autoApprove ? userId : null,
          approvedAt: options.autoApprove ? new Date() : null
        });

        await adjustment.save();

        results.successful.push({
          index: i,
          data: adjustmentData,
          adjustment: adjustment
        });

        // Create journal entry if requested
        if (options.createJournalEntries) {
          try {
            const journalResponse = await fetch(`http://localhost:5000/api/journal-entries/from-adjustment/${adjustment._id}`, {
              method: 'POST',
              headers: {
                'Authorization': req.headers.authorization,
                'Content-Type': 'application/json'
              }
            });
            
            if (journalResponse.ok) {
              console.log(`✅ Journal entry created for adjustment ${adjustment._id}`);
            }
          } catch (journalError) {
            console.error(`❌ Failed to create journal entry for adjustment ${adjustment._id}:`, journalError.message);
          }
        }

      } catch (error) {
        results.failed.push({
          index: i,
          data: adjustmentData,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Bulk operation completed. ${results.successful.length}/${results.total} successful`,
      data: results
    });
  } catch (error) {
    console.error('Error in bulk create adjustments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create bulk adjustments',
      error: error.message
    });
  }
};

// Bulk update exchange rates
export const bulkUpdateRates = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currencyPairs, options = {} } = req.body;

    if (!currencyPairs || !Array.isArray(currencyPairs) || currencyPairs.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Currency pairs array is required and cannot be empty'
      });
    }

    const results = {
      successful: [],
      failed: [],
      total: currencyPairs.length
    };

    // Process each currency pair
    for (let i = 0; i < currencyPairs.length; i++) {
      const pair = currencyPairs[i];
      
      try {
        if (!pair.from || !pair.to) {
          results.failed.push({
            index: i,
            data: pair,
            error: 'Missing required fields: from, to'
          });
          continue;
        }

        // Fetch real-time rate
        const rateResult = await fetchRealTimeRate(pair.from, pair.to);
        
        if (rateResult.success) {
          // Check if rate already exists for today
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);

          const existingRate = await CurrencyRate.findOne({
            userId,
            fromCurrency: pair.from.toUpperCase(),
            toCurrency: pair.to.toUpperCase(),
            date: { $gte: today, $lt: tomorrow }
          });

          if (existingRate) {
            // Update existing rate
            existingRate.rate = rateResult.data.rate;
            existingRate.source = rateResult.data.source;
            existingRate.notes = rateResult.data.notes;
            existingRate.updatedAt = new Date();
            await existingRate.save();

            results.successful.push({
              index: i,
              data: pair,
              rate: existingRate,
              action: 'updated'
            });
          } else {
            // Create new rate
            const newRate = new CurrencyRate({
              ...rateResult.data,
              userId
            });
            await newRate.save();

            results.successful.push({
              index: i,
              data: pair,
              rate: newRate,
              action: 'created'
            });
          }
        } else {
          results.failed.push({
            index: i,
            data: pair,
            error: rateResult.error
          });
        }

      } catch (error) {
        results.failed.push({
          index: i,
          data: pair,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Bulk rate update completed. ${results.successful.length}/${results.total} successful`,
      data: results
    });
  } catch (error) {
    console.error('Error in bulk update rates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update bulk rates',
      error: error.message
    });
  }
};

// Bulk delete currency adjustments
export const bulkDeleteAdjustments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { adjustmentIds, options = {} } = req.body;

    if (!adjustmentIds || !Array.isArray(adjustmentIds) || adjustmentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Adjustment IDs array is required and cannot be empty'
      });
    }

    const results = {
      successful: [],
      failed: [],
      total: adjustmentIds.length
    };

    // Process each adjustment ID
    for (let i = 0; i < adjustmentIds.length; i++) {
      const adjustmentId = adjustmentIds[i];
      
      try {
        const adjustment = await CurrencyAdjustment.findOne({ _id: adjustmentId, userId });
        
        if (!adjustment) {
          results.failed.push({
            index: i,
            adjustmentId,
            error: 'Adjustment not found'
          });
          continue;
        }

        // Check if adjustment can be deleted
        if (adjustment.status === 'approved' && !options.forceDelete) {
          results.failed.push({
            index: i,
            adjustmentId,
            error: 'Cannot delete approved adjustment without force flag'
          });
          continue;
        }

        // Delete associated journal entries if requested
        if (options.deleteJournalEntries) {
          await JournalEntry.deleteMany({
            source: 'currency_adjustment',
            sourceId: adjustmentId,
            userId
          });
        }

        // Delete the adjustment
        await CurrencyAdjustment.findByIdAndDelete(adjustmentId);

        results.successful.push({
          index: i,
          adjustmentId,
          adjustment
        });

      } catch (error) {
        results.failed.push({
          index: i,
          adjustmentId,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Bulk delete completed. ${results.successful.length}/${results.total} successful`,
      data: results
    });
  } catch (error) {
    console.error('Error in bulk delete adjustments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete bulk adjustments',
      error: error.message
    });
  }
};

// Bulk approve/reject adjustments
export const bulkUpdateAdjustmentStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { adjustmentIds, status, reason } = req.body;

    if (!adjustmentIds || !Array.isArray(adjustmentIds) || adjustmentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Adjustment IDs array is required and cannot be empty'
      });
    }

    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either "approved" or "rejected"'
      });
    }

    const results = {
      successful: [],
      failed: [],
      total: adjustmentIds.length
    };

    // Process each adjustment ID
    for (let i = 0; i < adjustmentIds.length; i++) {
      const adjustmentId = adjustmentIds[i];
      
      try {
        const adjustment = await CurrencyAdjustment.findOne({ _id: adjustmentId, userId });
        
        if (!adjustment) {
          results.failed.push({
            index: i,
            adjustmentId,
            error: 'Adjustment not found'
          });
          continue;
        }

        // Update adjustment status
        adjustment.status = status;
        adjustment.approvedBy = userId;
        adjustment.approvedAt = new Date();
        if (reason) {
          adjustment.notes = (adjustment.notes || '') + `\nBulk ${status}: ${reason}`;
        }
        await adjustment.save();

        results.successful.push({
          index: i,
          adjustmentId,
          adjustment
        });

      } catch (error) {
        results.failed.push({
          index: i,
          adjustmentId,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Bulk status update completed. ${results.successful.length}/${results.total} successful`,
      data: results
    });
  } catch (error) {
    console.error('Error in bulk update adjustment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update bulk adjustment status',
      error: error.message
    });
  }
};

// Bulk export data
export const bulkExportData = async (req, res) => {
  try {
    const userId = req.user.id;
    const { dataType, format = 'json', filters = {} } = req.body;

    if (!dataType || !['adjustments', 'rates', 'journal-entries'].includes(dataType)) {
      return res.status(400).json({
        success: false,
        message: 'Data type must be one of: adjustments, rates, journal-entries'
      });
    }

    let data = [];
    let filename = '';

    switch (dataType) {
      case 'adjustments':
        const adjustmentQuery = { userId };
        if (filters.status) adjustmentQuery.status = filters.status;
        if (filters.fromDate) adjustmentQuery.createdAt = { $gte: new Date(filters.fromDate) };
        if (filters.toDate) adjustmentQuery.createdAt = { ...adjustmentQuery.createdAt, $lte: new Date(filters.toDate) };
        
        data = await CurrencyAdjustment.find(adjustmentQuery)
          .populate('accountId', 'name code')
          .sort({ createdAt: -1 });
        filename = `currency-adjustments-${new Date().toISOString().split('T')[0]}`;
        break;

      case 'rates':
        const rateQuery = { userId };
        if (filters.fromCurrency) rateQuery.fromCurrency = filters.fromCurrency;
        if (filters.toCurrency) rateQuery.toCurrency = filters.toCurrency;
        if (filters.fromDate) rateQuery.date = { $gte: new Date(filters.fromDate) };
        if (filters.toDate) rateQuery.date = { ...rateQuery.date, $lte: new Date(filters.toDate) };
        
        data = await CurrencyRate.find(rateQuery).sort({ date: -1 });
        filename = `exchange-rates-${new Date().toISOString().split('T')[0]}`;
        break;

      case 'journal-entries':
        const journalQuery = { userId };
        if (filters.status) journalQuery.status = filters.status;
        if (filters.source) journalQuery.source = filters.source;
        if (filters.fromDate) journalQuery.date = { $gte: new Date(filters.fromDate) };
        if (filters.toDate) journalQuery.date = { ...journalQuery.date, $lte: new Date(filters.toDate) };
        
        data = await JournalEntry.find(journalQuery)
          .populate('createdBy', 'name email')
          .populate('approvedBy', 'name email')
          .sort({ date: -1 });
        filename = `journal-entries-${new Date().toISOString().split('T')[0]}`;
        break;
    }

    if (format === 'csv') {
      // Convert to CSV format
      const csv = convertToCSV(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      res.send(csv);
    } else {
      // Return JSON
      res.json({
        success: true,
        data: {
          type: dataType,
          count: data.length,
          exportedAt: new Date(),
          data
        }
      });
    }
  } catch (error) {
    console.error('Error in bulk export data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export data',
      error: error.message
    });
  }
};

// Helper function to convert data to CSV
const convertToCSV = (data) => {
  if (!data || data.length === 0) return '';

  const headers = Object.keys(data[0].toObject ? data[0].toObject() : data[0]);
  const csvHeaders = headers.join(',');
  
  const csvRows = data.map(row => {
    const obj = row.toObject ? row.toObject() : row;
    return headers.map(header => {
      const value = obj[header];
      if (value === null || value === undefined) return '';
      if (typeof value === 'object') return JSON.stringify(value);
      return String(value).replace(/"/g, '""');
    }).join(',');
  });

  return [csvHeaders, ...csvRows].join('\n');
};
