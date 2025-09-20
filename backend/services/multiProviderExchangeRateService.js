import axios from 'axios';
import ApiProvider from '../models/ApiProvider.js';
import CurrencyRate from '../models/CurrencyRate.js';

class MultiProviderExchangeRateService {
  constructor() {
    this.providers = [];
    this.failedProviders = new Map(); // Track failed providers with timestamps
    this.circuitBreakerTimeout = 5 * 60 * 1000; // 5 minutes
    this.maxConsecutiveFailures = 3; // Max failures before circuit breaker opens
    this.loadProviders();
  }

  // Load active providers from database
  async loadProviders() {
    try {
      this.providers = await ApiProvider.getActiveProviders();
      console.log(`📡 Loaded ${this.providers.length} active exchange rate providers`);
    } catch (error) {
      console.error('Error loading API providers:', error);
    }
  }

  // Check if provider is available (circuit breaker)
  isProviderAvailable(provider) {
    const failureInfo = this.failedProviders.get(provider.name);
    if (!failureInfo) return true;

    const { failures, lastFailure } = failureInfo;
    const timeSinceLastFailure = Date.now() - lastFailure;

    // If too many failures and within timeout period, provider is unavailable
    if (failures >= this.maxConsecutiveFailures && timeSinceLastFailure < this.circuitBreakerTimeout) {
      console.log(`🚫 ${provider.name}: Circuit breaker open (${failures} failures, ${Math.round(timeSinceLastFailure / 1000)}s ago)`);
      return false;
    }

    // Reset failure count if timeout has passed
    if (timeSinceLastFailure >= this.circuitBreakerTimeout) {
      this.failedProviders.delete(provider.name);
      console.log(`🔄 ${provider.name}: Circuit breaker reset after timeout`);
      return true;
    }

    return true;
  }

  // Record provider failure
  recordProviderFailure(provider, error) {
    const failureInfo = this.failedProviders.get(provider.name) || { failures: 0, lastFailure: 0 };
    failureInfo.failures += 1;
    failureInfo.lastFailure = Date.now();
    failureInfo.lastError = error.message;
    this.failedProviders.set(provider.name, failureInfo);
    
    console.log(`⚠️ ${provider.name}: Recorded failure ${failureInfo.failures}/${this.maxConsecutiveFailures}`);
  }

  // Record provider success
  recordProviderSuccess(provider) {
    if (this.failedProviders.has(provider.name)) {
      console.log(`✅ ${provider.name}: Reset failure count after success`);
      this.failedProviders.delete(provider.name);
    }
  }

  // Fetch rate from a specific provider
  async fetchRateFromProvider(provider, fromCurrency, toCurrency) {
    try {
      const startTime = Date.now();
      
      // Build request configuration
      const config = {
        method: 'GET',
        url: this.buildUrl(provider, fromCurrency, toCurrency),
        timeout: provider.timeout || 10000,
        headers: {
          'User-Agent': 'RoboBooks/1.0',
          ...provider.headers
        }
      };

      // Add API key if required
      if (provider.apiKey) {
        config.headers['Authorization'] = `Bearer ${provider.apiKey}`;
        config.headers['X-API-Key'] = provider.apiKey;
      }

      const response = await axios(config);
      const responseTime = Date.now() - startTime;

      // Parse response based on provider
      const rateData = this.parseResponse(provider, response.data, fromCurrency, toCurrency);
      
      if (rateData) {
        // Update provider statistics
        await provider.updateUsage(true);
        
        // Record success for circuit breaker
        this.recordProviderSuccess(provider);
        
        console.log(`✅ ${provider.name}: ${fromCurrency}→${toCurrency} = ${rateData.rate} (${responseTime}ms)`);
        return {
          success: true,
          data: rateData,
          provider: provider.name,
          responseTime
        };
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error(`❌ ${provider.name} error:`, error.message);
      
      // Record failure for circuit breaker
      this.recordProviderFailure(provider, error);
      
      // Update provider statistics
      await provider.recordError(error);
      
      return {
        success: false,
        error: error.message,
        provider: provider.name
      };
    }
  }

  // Build URL for specific provider
  buildUrl(provider, fromCurrency, toCurrency) {
    let url = provider.baseUrl;
    
    // Replace placeholders in endpoint
    if (provider.endpoints.latest) {
      url += provider.endpoints.latest
        .replace('{from}', fromCurrency)
        .replace('{to}', toCurrency)
        .replace('{base}', fromCurrency)
        .replace('{apiKey}', provider.apiKey || '');
    }
    
    return url;
  }

  // Parse response based on provider configuration
  parseResponse(provider, data, fromCurrency, toCurrency) {
    try {
      const mapping = provider.dataMapping;
      
      // Handle different response formats
      if (provider.name === 'ExchangeRate-API.com') {
        if (data.rates && data.rates[toCurrency]) {
          return {
            fromCurrency: fromCurrency.toUpperCase(),
            toCurrency: toCurrency.toUpperCase(),
            rate: data.rates[toCurrency],
            date: new Date(),
            source: provider.displayName,
            isActive: true,
            notes: `Real-time rate from ${provider.displayName}`
          };
        }
      } else if (provider.name === 'Fixer.io') {
        if (data.success && data.rates && data.rates[toCurrency]) {
          return {
            fromCurrency: fromCurrency.toUpperCase(),
            toCurrency: toCurrency.toUpperCase(),
            rate: data.rates[toCurrency],
            date: new Date(),
            source: provider.displayName,
            isActive: true,
            notes: `Real-time rate from ${provider.displayName}`
          };
        }
      } else if (provider.name === 'CurrencyLayer') {
        if (data.success && data.quotes && data.quotes[`${fromCurrency}${toCurrency}`]) {
          return {
            fromCurrency: fromCurrency.toUpperCase(),
            toCurrency: toCurrency.toUpperCase(),
            rate: data.quotes[`${fromCurrency}${toCurrency}`],
            date: new Date(),
            source: provider.displayName,
            isActive: true,
            notes: `Real-time rate from ${provider.displayName}`
          };
        }
      } else if (provider.name === 'Alpha Vantage') {
        if (data['Realtime Currency Exchange Rate'] && data['Realtime Currency Exchange Rate']['5. Exchange Rate']) {
          return {
            fromCurrency: fromCurrency.toUpperCase(),
            toCurrency: toCurrency.toUpperCase(),
            rate: parseFloat(data['Realtime Currency Exchange Rate']['5. Exchange Rate']),
            date: new Date(),
            source: provider.displayName,
            isActive: true,
            notes: `Real-time rate from ${provider.displayName}`
          };
        }
      }
      
      // Generic parsing using data mapping
      if (mapping.rateField && data[mapping.rateField]) {
        return {
          fromCurrency: fromCurrency.toUpperCase(),
          toCurrency: toCurrency.toUpperCase(),
          rate: parseFloat(data[mapping.rateField]),
          date: new Date(),
          source: provider.displayName,
          isActive: true,
          notes: `Real-time rate from ${provider.displayName}`
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error parsing response:', error);
      return null;
    }
  }

  // Fetch rate with fallback providers
  async fetchRateWithFallback(fromCurrency, toCurrency) {
    // Reload providers to get latest status
    await this.loadProviders();
    
    if (this.providers.length === 0) {
      throw new Error('No active exchange rate providers available');
    }

    const results = [];
    const availableProviders = this.providers.filter(provider => this.isProviderAvailable(provider));
    
    if (availableProviders.length === 0) {
      console.log('🚫 All providers are temporarily unavailable due to circuit breaker');
      // Try to find any provider that might be available after timeout
      const timedOutProviders = this.providers.filter(provider => {
        const failureInfo = this.failedProviders.get(provider.name);
        if (!failureInfo) return true;
        const timeSinceLastFailure = Date.now() - failureInfo.lastFailure;
        return timeSinceLastFailure >= this.circuitBreakerTimeout;
      });
      
      if (timedOutProviders.length > 0) {
        console.log(`🔄 Found ${timedOutProviders.length} providers that may be available after timeout`);
        availableProviders.push(...timedOutProviders);
      } else {
        throw new Error('All providers are temporarily unavailable due to circuit breaker');
      }
    }

    console.log(`🔄 Trying ${availableProviders.length} available providers for ${fromCurrency}→${toCurrency}`);
    
    // Try each available provider in priority order
    for (const provider of availableProviders) {
      // Check if provider supports these currencies
      if (provider.supportedCurrencies && provider.supportedCurrencies.length > 0) {
        if (!provider.supportedCurrencies.includes(fromCurrency) || 
            !provider.supportedCurrencies.includes(toCurrency)) {
          console.log(`⏭️ ${provider.name}: Skipping (unsupported currencies)`);
          continue;
        }
      }

      console.log(`🔄 Attempting ${provider.name}...`);
      const result = await this.fetchRateFromProvider(provider, fromCurrency, toCurrency);
      results.push(result);
      
      if (result.success) {
        console.log(`✅ Success with ${provider.name} - automatic failover working!`);
        return result;
      } else {
        console.log(`❌ ${provider.name} failed: ${result.error}`);
      }
    }

    // If all providers failed, throw error with details
    const errors = results.map(r => `${r.provider}: ${r.error}`).join(', ');
    throw new Error(`All available providers failed: ${errors}`);
  }

  // Fetch multiple rates with fallback
  async fetchMultipleRatesWithFallback(currencyPairs) {
    const results = [];
    
    for (const pair of currencyPairs) {
      try {
        const result = await this.fetchRateWithFallback(pair.from, pair.to);
        results.push({
          ...result,
          pair: `${pair.from}-${pair.to}`
        });
      } catch (error) {
        console.error(`Failed to fetch rate for ${pair.from}-${pair.to}:`, error.message);
        results.push({
          success: false,
          pair: `${pair.from}-${pair.to}`,
          error: error.message
        });
      }
    }
    
    return results;
  }

  // Get provider statistics
  async getProviderStats() {
    await this.loadProviders();
    
    return this.providers.map(provider => {
      const failureInfo = this.failedProviders.get(provider.name);
      const isAvailable = this.isProviderAvailable(provider);
      
      return {
        name: provider.name,
        displayName: provider.displayName,
        isActive: provider.isActive,
        isAvailable: isAvailable,
        priority: provider.priority,
        successRate: provider.successRate,
        totalRequests: provider.totalRequests,
        successfulRequests: provider.successfulRequests,
        failedRequests: provider.failedRequests,
        lastUsed: provider.lastUsed,
        lastError: provider.lastError,
        circuitBreakerStatus: failureInfo ? {
          failures: failureInfo.failures,
          lastFailure: failureInfo.lastFailure,
          lastError: failureInfo.lastError,
          isOpen: failureInfo.failures >= this.maxConsecutiveFailures
        } : null
      };
    });
  }

  // Get health status of all providers
  getProviderHealthStatus() {
    const healthStatus = {
      totalProviders: this.providers.length,
      availableProviders: this.providers.filter(p => this.isProviderAvailable(p)).length,
      failedProviders: this.failedProviders.size,
      circuitBreakerOpen: Array.from(this.failedProviders.values()).filter(
        info => info.failures >= this.maxConsecutiveFailures
      ).length
    };
    
    return healthStatus;
  }

  // Force reset circuit breaker for a provider (for testing/admin use)
  resetProviderCircuitBreaker(providerName) {
    if (this.failedProviders.has(providerName)) {
      this.failedProviders.delete(providerName);
      console.log(`🔄 Manually reset circuit breaker for ${providerName}`);
      return true;
    }
    return false;
  }

  // Test all providers
  async testAllProviders(fromCurrency = 'USD', toCurrency = 'EUR') {
    await this.loadProviders();
    
    const results = [];
    
    for (const provider of this.providers) {
      const result = await this.fetchRateFromProvider(provider, fromCurrency, toCurrency);
      results.push({
        provider: provider.name,
        displayName: provider.displayName,
        ...result
      });
    }
    
    return results;
  }
}

// Create singleton instance
const multiProviderService = new MultiProviderExchangeRateService();

export default multiProviderService;
