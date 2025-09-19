import axios from 'axios';

const EXCHANGE_RATE_API_BASE = 'https://api.exchangerate-api.com/v4/latest';

/**
 * Fetch real-time exchange rate from ExchangeRate.host API
 * @param {string} fromCurrency - Source currency code (e.g., 'USD')
 * @param {string} toCurrency - Target currency code (e.g., 'INR')
 * @returns {Promise<Object>} Exchange rate data
 */
export const fetchRealTimeRate = async (fromCurrency, toCurrency) => {
  try {
    console.log(`🔄 Fetching real-time rate: ${fromCurrency} → ${toCurrency}`);
    
    // Use exchangerate-api.com which is free and doesn't require API key
    const response = await axios.get(`${EXCHANGE_RATE_API_BASE}/${fromCurrency.toUpperCase()}`, {
      timeout: 10000 // 10 second timeout
    });

    if (response.data && response.data.rates) {
      const targetRate = response.data.rates[toCurrency.toUpperCase()];
      
      if (targetRate) {
        const rateData = {
          fromCurrency: fromCurrency.toUpperCase(),
          toCurrency: toCurrency.toUpperCase(),
          rate: targetRate,
          date: new Date(),
          source: 'REAL_TIME_API',
          isActive: true,
          notes: `Real-time rate from exchangerate-api.com`
        };

        console.log(`✅ Real-time rate fetched: ${fromCurrency} → ${toCurrency} = ${rateData.rate}`);
        return {
          success: true,
          data: rateData
        };
      } else {
        console.error(`❌ Target currency ${toCurrency} not found in response`);
        return {
          success: false,
          error: `Currency ${toCurrency} not supported`
        };
      }
    } else {
      console.error('❌ Invalid API response', response.data);
      return {
        success: false,
        error: 'Invalid API response'
      };
    }
  } catch (error) {
    console.error(`❌ Error fetching real-time rate ${fromCurrency} → ${toCurrency}:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Fetch multiple exchange rates in batch
 * @param {Array} currencyPairs - Array of {from, to} currency pairs
 * @returns {Promise<Array>} Array of exchange rate data
 */
export const fetchMultipleRates = async (currencyPairs) => {
  try {
    console.log(`🔄 Fetching ${currencyPairs.length} real-time rates...`);
    
    const promises = currencyPairs.map(pair => 
      fetchRealTimeRate(pair.from, pair.to)
    );

    const results = await Promise.allSettled(promises);
    
    const successfulRates = [];
    const failedRates = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.success) {
        successfulRates.push(result.value.data);
      } else {
        const pair = currencyPairs[index];
        failedRates.push({
          pair: `${pair.from} → ${pair.to}`,
          error: result.status === 'rejected' ? result.reason.message : result.value.error
        });
      }
    });

    console.log(`✅ Successfully fetched ${successfulRates.length}/${currencyPairs.length} rates`);
    if (failedRates.length > 0) {
      console.log(`❌ Failed to fetch ${failedRates.length} rates:`, failedRates);
    }

    return {
      success: successfulRates.length > 0,
      data: successfulRates,
      errors: failedRates
    };
  } catch (error) {
    console.error('❌ Error in batch rate fetching:', error.message);
    return {
      success: false,
      error: error.message,
      data: [],
      errors: []
    };
  }
};

/**
 * Get supported currencies from the API
 * @returns {Promise<Array>} List of supported currency codes
 */
export const getSupportedCurrencies = async () => {
  try {
    console.log('🔄 Fetching supported currencies...');
    
    // Get currencies from USD base (most common)
    const response = await axios.get(`${EXCHANGE_RATE_API_BASE}/USD`, {
      timeout: 10000
    });

    if (response.data && response.data.rates) {
      const currencies = Object.keys(response.data.rates);
      currencies.push('USD'); // Add USD as it's the base currency
      console.log(`✅ Found ${currencies.length} supported currencies`);
      return {
        success: true,
        data: currencies.sort()
      };
    } else {
      return {
        success: false,
        error: 'Failed to fetch supported currencies'
      };
    }
  } catch (error) {
    console.error('❌ Error fetching supported currencies:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Fetch historical exchange rate
 * @param {string} fromCurrency - Source currency
 * @param {string} toCurrency - Target currency
 * @param {Date} date - Historical date
 * @returns {Promise<Object>} Historical rate data
 */
export const fetchHistoricalRate = async (fromCurrency, toCurrency, date) => {
  try {
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
    console.log(`🔄 Fetching historical rate: ${fromCurrency} → ${toCurrency} on ${dateStr}`);
    
    // For now, we'll use the current rate as historical data is not available in the free API
    // In a production environment, you might want to use a paid API for historical data
    const currentRateResult = await fetchRealTimeRate(fromCurrency, toCurrency);
    
    if (currentRateResult.success) {
      const rateData = {
        ...currentRateResult.data,
        date: date,
        source: 'HISTORICAL_API',
        notes: `Historical rate (using current rate) for ${dateStr}`
      };

      console.log(`✅ Historical rate fetched: ${fromCurrency} → ${toCurrency} = ${rateData.rate} on ${dateStr}`);
      return {
        success: true,
        data: rateData
      };
    } else {
      return {
        success: false,
        error: currentRateResult.error
      };
    }
  } catch (error) {
    console.error(`❌ Error fetching historical rate ${fromCurrency} → ${toCurrency}:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
};
