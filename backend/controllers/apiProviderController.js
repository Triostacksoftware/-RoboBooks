import ApiProvider from '../models/ApiProvider.js';
import multiProviderService from '../services/multiProviderExchangeRateService.js';

// Get all API providers
export const getApiProviders = async (req, res) => {
  try {
    const providers = await ApiProvider.find().sort({ priority: 1, name: 1 });
    
    res.json({
      success: true,
      data: providers
    });
  } catch (error) {
    console.error('Error fetching API providers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch API providers',
      error: error.message
    });
  }
};

// Get API provider by ID
export const getApiProviderById = async (req, res) => {
  try {
    const providerId = req.params.id;
    const provider = await ApiProvider.findById(providerId);
    
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'API provider not found'
      });
    }
    
    res.json({
      success: true,
      data: provider
    });
  } catch (error) {
    console.error('Error fetching API provider:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch API provider',
      error: error.message
    });
  }
};

// Create new API provider
export const createApiProvider = async (req, res) => {
  try {
    const providerData = req.body;
    
    // Validate required fields
    if (!providerData.name || !providerData.displayName || !providerData.baseUrl) {
      return res.status(400).json({
        success: false,
        message: 'Name, display name, and base URL are required'
      });
    }
    
    // Check if provider with same name already exists
    const existingProvider = await ApiProvider.findOne({ name: providerData.name });
    if (existingProvider) {
      return res.status(400).json({
        success: false,
        message: 'API provider with this name already exists'
      });
    }
    
    const provider = new ApiProvider(providerData);
    await provider.save();
    
    // Reload providers in service
    await multiProviderService.loadProviders();
    
    res.json({
      success: true,
      message: 'API provider created successfully',
      data: provider
    });
  } catch (error) {
    console.error('Error creating API provider:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create API provider',
      error: error.message
    });
  }
};

// Update API provider
export const updateApiProvider = async (req, res) => {
  try {
    const providerId = req.params.id;
    const updates = req.body;
    
    const provider = await ApiProvider.findByIdAndUpdate(
      providerId,
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'API provider not found'
      });
    }
    
    // Reload providers in service
    await multiProviderService.loadProviders();
    
    res.json({
      success: true,
      message: 'API provider updated successfully',
      data: provider
    });
  } catch (error) {
    console.error('Error updating API provider:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update API provider',
      error: error.message
    });
  }
};

// Delete API provider
export const deleteApiProvider = async (req, res) => {
  try {
    const providerId = req.params.id;
    
    const provider = await ApiProvider.findByIdAndDelete(providerId);
    
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'API provider not found'
      });
    }
    
    // Reload providers in service
    await multiProviderService.loadProviders();
    
    res.json({
      success: true,
      message: 'API provider deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting API provider:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete API provider',
      error: error.message
    });
  }
};

// Test API provider
export const testApiProvider = async (req, res) => {
  try {
    const providerId = req.params.id;
    const { fromCurrency = 'USD', toCurrency = 'EUR' } = req.body;
    
    const provider = await ApiProvider.findById(providerId);
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'API provider not found'
      });
    }
    
    const result = await multiProviderService.fetchRateFromProvider(provider, fromCurrency, toCurrency);
    
    res.json({
      success: true,
      data: {
        provider: provider.name,
        testPair: `${fromCurrency}-${toCurrency}`,
        result
      }
    });
  } catch (error) {
    console.error('Error testing API provider:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test API provider',
      error: error.message
    });
  }
};

// Test all providers
export const testAllProviders = async (req, res) => {
  try {
    const { fromCurrency = 'USD', toCurrency = 'EUR' } = req.body;
    
    const results = await multiProviderService.testAllProviders(fromCurrency, toCurrency);
    
    res.json({
      success: true,
      data: {
        testPair: `${fromCurrency}-${toCurrency}`,
        results
      }
    });
  } catch (error) {
    console.error('Error testing all providers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test providers',
      error: error.message
    });
  }
};

// Get provider statistics
export const getProviderStats = async (req, res) => {
  try {
    const stats = await multiProviderService.getProviderStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching provider stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch provider statistics',
      error: error.message
    });
  }
};

// Initialize default providers
export const initializeDefaultProviders = async (req, res) => {
  try {
    const defaultProviders = [
      {
        name: 'ExchangeRate-API.com',
        displayName: 'ExchangeRate-API.com',
        baseUrl: 'https://api.exchangerate-api.com/v4/latest',
        isActive: true,
        priority: 1,
        supportedCurrencies: [
          'USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY',
          'NZD', 'KRW', 'SGD', 'HKD', 'BRL', 'MXN', 'RUB', 'ZAR', 'TRY',
          'SEK', 'NOK', 'DKK', 'AED', 'THB', 'MYR', 'IDR', 'PHP', 'VND',
          'PLN', 'CZK', 'HUF', 'RON', 'BGN', 'HRK', 'RSD', 'UAH', 'KZT'
        ],
        endpoints: {
          latest: '/{base}',
          convert: '/convert/{from}/{to}'
        },
        rateLimit: {
          requestsPerMinute: 100,
          requestsPerHour: 1000,
          requestsPerDay: 10000
        },
        timeout: 10000,
        retryAttempts: 3,
        description: 'Free exchange rate API with no API key required',
        website: 'https://exchangerate-api.com'
      },
      {
        name: 'Fixer.io',
        displayName: 'Fixer.io',
        baseUrl: 'http://data.fixer.io/api',
        isActive: false, // Disabled by default as it requires API key
        priority: 2,
        supportedCurrencies: [
          'USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY',
          'NZD', 'KRW', 'SGD', 'HKD', 'BRL', 'MXN', 'RUB', 'ZAR', 'TRY',
          'SEK', 'NOK', 'DKK', 'AED', 'THB', 'MYR', 'IDR', 'PHP', 'VND',
          'PLN', 'CZK', 'HUF', 'RON', 'BGN', 'HRK', 'RSD', 'UAH', 'KZT'
        ],
        endpoints: {
          latest: '/latest?access_key={apiKey}&base={base}',
          historical: '/historical?access_key={apiKey}&date={date}&base={base}'
        },
        rateLimit: {
          requestsPerMinute: 5,
          requestsPerHour: 100,
          requestsPerDay: 1000
        },
        timeout: 15000,
        retryAttempts: 2,
        description: 'Professional exchange rate API with historical data',
        website: 'https://fixer.io'
      },
      {
        name: 'CurrencyLayer',
        displayName: 'CurrencyLayer',
        baseUrl: 'http://api.currencylayer.com',
        isActive: false, // Disabled by default as it requires API key
        priority: 3,
        supportedCurrencies: [
          'USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY',
          'NZD', 'KRW', 'SGD', 'HKD', 'BRL', 'MXN', 'RUB', 'ZAR', 'TRY',
          'SEK', 'NOK', 'DKK', 'AED', 'THB', 'MYR', 'IDR', 'PHP', 'VND',
          'PLN', 'CZK', 'HUF', 'RON', 'BGN', 'HRK', 'RSD', 'UAH', 'KZT'
        ],
        endpoints: {
          latest: '/live?access_key={apiKey}',
          historical: '/historical?access_key={apiKey}&date={date}'
        },
        rateLimit: {
          requestsPerMinute: 10,
          requestsPerHour: 1000,
          requestsPerDay: 10000
        },
        timeout: 12000,
        retryAttempts: 3,
        description: 'Real-time exchange rates with high accuracy',
        website: 'https://currencylayer.com'
      }
    ];

    let createdCount = 0;
    let skippedCount = 0;

    for (const providerData of defaultProviders) {
      const existingProvider = await ApiProvider.findOne({ name: providerData.name });
      if (!existingProvider) {
        const provider = new ApiProvider(providerData);
        await provider.save();
        createdCount++;
      } else {
        skippedCount++;
      }
    }

    // Reload providers in service
    await multiProviderService.loadProviders();

    res.json({
      success: true,
      message: `Default providers initialized. Created: ${createdCount}, Skipped: ${skippedCount}`,
      data: {
        created: createdCount,
        skipped: skippedCount,
        total: defaultProviders.length
      }
    });
  } catch (error) {
    console.error('Error initializing default providers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize default providers',
      error: error.message
    });
  }
};
