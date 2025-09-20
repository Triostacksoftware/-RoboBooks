import CurrencyRate from '../models/CurrencyRate.js';
import CurrencyAdjustment from '../models/CurrencyAdjustment.js';
import RateAlert from '../models/RateAlert.js';

// Get currency performance analytics
export const getCurrencyPerformance = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = '30d', baseCurrency = 'USD' } = req.query;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // Get rates for the period
    const rates = await CurrencyRate.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
      $or: [
        { fromCurrency: baseCurrency },
        { toCurrency: baseCurrency }
      ]
    }).sort({ date: 1 });

    // Process data for analytics
    const currencyPairs = {};
    const dailyRates = {};
    const volatility = {};
    const performance = {};

    rates.forEach(rate => {
      const pair = `${rate.fromCurrency}-${rate.toCurrency}`;
      const date = rate.date.toISOString().split('T')[0];
      
      if (!currencyPairs[pair]) {
        currencyPairs[pair] = [];
      }
      currencyPairs[pair].push({
        date: rate.date,
        rate: rate.rate,
        source: rate.source
      });

      if (!dailyRates[date]) {
        dailyRates[date] = {};
      }
      dailyRates[date][pair] = rate.rate;
    });

    // Calculate analytics for each currency pair
    Object.keys(currencyPairs).forEach(pair => {
      const pairRates = currencyPairs[pair];
      if (pairRates.length < 2) return;

      const rates = pairRates.map(r => r.rate);
      const firstRate = rates[0];
      const lastRate = rates[rates.length - 1];
      
      // Performance calculation
      const totalChange = ((lastRate - firstRate) / firstRate) * 100;
      const avgRate = rates.reduce((a, b) => a + b, 0) / rates.length;
      
      // Volatility calculation (standard deviation)
      const variance = rates.reduce((acc, rate) => acc + Math.pow(rate - avgRate, 2), 0) / rates.length;
      const stdDev = Math.sqrt(variance);
      const volatilityPercent = (stdDev / avgRate) * 100;

      // High and low rates
      const highRate = Math.max(...rates);
      const lowRate = Math.min(...rates);

      performance[pair] = {
        totalChange: parseFloat(totalChange.toFixed(2)),
        avgRate: parseFloat(avgRate.toFixed(4)),
        volatility: parseFloat(volatilityPercent.toFixed(2)),
        highRate: parseFloat(highRate.toFixed(4)),
        lowRate: parseFloat(lowRate.toFixed(4)),
        currentRate: lastRate,
        dataPoints: rates.length,
        trend: totalChange > 0 ? 'up' : totalChange < 0 ? 'down' : 'stable'
      };
    });

    // Get top performing and worst performing currencies
    const sortedPerformance = Object.entries(performance)
      .sort(([,a], [,b]) => b.totalChange - a.totalChange);

    const topPerformers = sortedPerformance.slice(0, 5);
    const worstPerformers = sortedPerformance.slice(-5).reverse();

    // Calculate overall market volatility
    const allVolatilities = Object.values(performance).map(p => p.volatility);
    const avgVolatility = allVolatilities.length > 0 
      ? allVolatilities.reduce((a, b) => a + b, 0) / allVolatilities.length 
      : 0;

    res.json({
      success: true,
      data: {
        period,
        baseCurrency,
        summary: {
          totalPairs: Object.keys(performance).length,
          avgVolatility: parseFloat(avgVolatility.toFixed(2)),
          topPerformer: topPerformers[0] ? {
            pair: topPerformers[0][0],
            change: topPerformers[0][1].totalChange
          } : null,
          worstPerformer: worstPerformers[0] ? {
            pair: worstPerformers[0][0],
            change: worstPerformers[0][1].totalChange
          } : null
        },
        performance,
        topPerformers: topPerformers.map(([pair, data]) => ({ pair, ...data })),
        worstPerformers: worstPerformers.map(([pair, data]) => ({ pair, ...data })),
        dailyRates,
        currencyPairs
      }
    });
  } catch (error) {
    console.error('Error fetching currency performance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch currency performance',
      error: error.message
    });
  }
};

// Get currency exposure analysis
export const getCurrencyExposure = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all currency adjustments
    const adjustments = await CurrencyAdjustment.find({ userId });

    // Calculate exposure by currency
    const exposure = {};
    const totalExposure = {};

    adjustments.forEach(adj => {
      const fromCurr = adj.fromCurrency;
      const toCurr = adj.toCurrency;
      const amount = adj.originalAmount;

      // Track exposure in original currency
      if (!exposure[fromCurr]) {
        exposure[fromCurr] = { total: 0, adjustments: 0, avgAmount: 0 };
      }
      exposure[fromCurr].total += amount;
      exposure[fromCurr].adjustments += 1;

      // Track converted exposure
      if (!exposure[toCurr]) {
        exposure[toCurr] = { total: 0, adjustments: 0, avgAmount: 0 };
      }
      exposure[toCurr].total += adj.convertedAmount;
      exposure[toCurr].adjustments += 1;
    });

    // Calculate averages and percentages
    Object.keys(exposure).forEach(currency => {
      const exp = exposure[currency];
      exp.avgAmount = exp.total / exp.adjustments;
      exp.percentage = 0; // Will calculate after getting total
    });

    // Calculate total exposure across all currencies
    const grandTotal = Object.values(exposure).reduce((sum, exp) => sum + exp.total, 0);

    // Calculate percentages
    Object.keys(exposure).forEach(currency => {
      exposure[currency].percentage = (exposure[currency].total / grandTotal) * 100;
    });

    // Sort by total exposure
    const sortedExposure = Object.entries(exposure)
      .sort(([,a], [,b]) => b.total - a.total)
      .map(([currency, data]) => ({
        currency,
        ...data,
        total: parseFloat(data.total.toFixed(2)),
        avgAmount: parseFloat(data.avgAmount.toFixed(2)),
        percentage: parseFloat(data.percentage.toFixed(2))
      }));

    res.json({
      success: true,
      data: {
        totalExposure: parseFloat(grandTotal.toFixed(2)),
        currencyExposure: sortedExposure,
        riskLevel: grandTotal > 1000000 ? 'High' : grandTotal > 100000 ? 'Medium' : 'Low',
        diversification: Object.keys(exposure).length
      }
    });
  } catch (error) {
    console.error('Error fetching currency exposure:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch currency exposure',
      error: error.message
    });
  }
};

// Get rate alerts configuration
export const getRateAlerts = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const alerts = await RateAlert.find({ userId }).sort({ createdAt: -1 });
    const activeAlerts = alerts.filter(alert => alert.isActive);
    
    res.json({
      success: true,
      data: {
        alerts,
        totalAlerts: alerts.length,
        activeAlerts: activeAlerts.length
      }
    });
  } catch (error) {
    console.error('Error fetching rate alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rate alerts',
      error: error.message
    });
  }
};

// Create rate alert
export const createRateAlert = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      fromCurrency, 
      toCurrency, 
      targetRate, 
      condition, 
      isActive = true,
      description,
      priority = 'medium',
      notificationSettings = {}
    } = req.body;

    // Validate currencies are different
    if (fromCurrency === toCurrency) {
      return res.status(400).json({
        success: false,
        message: 'From and to currencies must be different'
      });
    }

    // Check if alert already exists for this pair
    const existingAlert = await RateAlert.findOne({
      userId,
      fromCurrency: fromCurrency.toUpperCase(),
      toCurrency: toCurrency.toUpperCase(),
      isActive: true
    });

    if (existingAlert) {
      return res.status(400).json({
        success: false,
        message: 'An active alert already exists for this currency pair'
      });
    }

    const alert = new RateAlert({
      userId,
      fromCurrency: fromCurrency.toUpperCase(),
      toCurrency: toCurrency.toUpperCase(),
      targetRate,
      condition,
      isActive,
      description,
      priority,
      notificationSettings: {
        email: notificationSettings.email || false,
        push: notificationSettings.push !== false,
        inApp: notificationSettings.inApp !== false
      }
    });

    await alert.save();

    res.json({
      success: true,
      message: 'Rate alert created successfully',
      data: alert
    });
  } catch (error) {
    console.error('Error creating rate alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create rate alert',
      error: error.message
    });
  }
};

// Update rate alert
export const updateRateAlert = async (req, res) => {
  try {
    const userId = req.user.id;
    const alertId = req.params.id;
    const updates = req.body;

    const alert = await RateAlert.findOneAndUpdate(
      { _id: alertId, userId },
      { $set: updates },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Rate alert not found'
      });
    }

    res.json({
      success: true,
      message: 'Rate alert updated successfully',
      data: alert
    });
  } catch (error) {
    console.error('Error updating rate alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update rate alert',
      error: error.message
    });
  }
};

// Delete rate alert
export const deleteRateAlert = async (req, res) => {
  try {
    const userId = req.user.id;
    const alertId = req.params.id;

    const alert = await RateAlert.findOneAndDelete({ _id: alertId, userId });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Rate alert not found'
      });
    }

    res.json({
      success: true,
      message: 'Rate alert deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting rate alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete rate alert',
      error: error.message
    });
  }
};
