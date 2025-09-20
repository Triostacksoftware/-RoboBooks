import UserPreferences from '../models/UserPreferences.js';

// Get user preferences
export const getUserPreferences = async (req, res) => {
  try {
    const userId = req.user.id;

    let preferences = await UserPreferences.findOne({ userId });
    
    // Create default preferences if none exist
    if (!preferences) {
      preferences = new UserPreferences({
        userId,
        baseCurrency: 'USD',
        currencySettings: {
          autoRefresh: true,
          refreshInterval: 10,
          notifications: {
            rateAlerts: true,
            email: false,
            push: true
          },
          displaySettings: {
            dateFormat: 'MM/DD/YYYY',
            numberFormat: 'US',
            timezone: 'UTC'
          }
        },
        dashboardSettings: {
          defaultView: 'rates',
          widgets: [
            { type: 'performance', position: { x: 0, y: 0 }, size: { width: 6, height: 4 }, enabled: true },
            { type: 'exposure', position: { x: 6, y: 0 }, size: { width: 6, height: 4 }, enabled: true },
            { type: 'alerts', position: { x: 0, y: 4 }, size: { width: 4, height: 3 }, enabled: true },
            { type: 'recent_rates', position: { x: 4, y: 4 }, size: { width: 8, height: 3 }, enabled: true }
          ]
        }
      });
      await preferences.save();
    }

    res.json({
      success: true,
      data: preferences
    });
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user preferences',
      error: error.message
    });
  }
};

// Update user preferences
export const updateUserPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    // Validate base currency if provided
    if (updates.baseCurrency) {
      const validCurrencies = [
        'USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY',
        'NZD', 'KRW', 'SGD', 'HKD', 'BRL', 'MXN', 'RUB', 'ZAR', 'TRY',
        'SEK', 'NOK', 'DKK', 'AED', 'THB', 'MYR', 'IDR', 'PHP', 'VND',
        'PLN', 'CZK', 'HUF', 'RON', 'BGN', 'HRK', 'RSD', 'UAH', 'KZT'
      ];
      
      if (!validCurrencies.includes(updates.baseCurrency.toUpperCase())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid base currency'
        });
      }
      updates.baseCurrency = updates.baseCurrency.toUpperCase();
    }

    const preferences = await UserPreferences.findOneAndUpdate(
      { userId },
      { $set: updates },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: preferences
    });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user preferences',
      error: error.message
    });
  }
};

// Reset user preferences to defaults
export const resetUserPreferences = async (req, res) => {
  try {
    const userId = req.user.id;

    await UserPreferences.findOneAndDelete({ userId });

    // Create default preferences
    const defaultPreferences = new UserPreferences({
      userId,
      baseCurrency: 'USD',
      currencySettings: {
        autoRefresh: true,
        refreshInterval: 10,
        notifications: {
          rateAlerts: true,
          email: false,
          push: true
        },
        displaySettings: {
          dateFormat: 'MM/DD/YYYY',
          numberFormat: 'US',
          timezone: 'UTC'
        }
      },
      dashboardSettings: {
        defaultView: 'rates',
        widgets: [
          { type: 'performance', position: { x: 0, y: 0 }, size: { width: 6, height: 4 }, enabled: true },
          { type: 'exposure', position: { x: 6, y: 0 }, size: { width: 6, height: 4 }, enabled: true },
          { type: 'alerts', position: { x: 0, y: 4 }, size: { width: 4, height: 3 }, enabled: true },
          { type: 'recent_rates', position: { x: 4, y: 4 }, size: { width: 8, height: 3 }, enabled: true }
        ]
      }
    });

    await defaultPreferences.save();

    res.json({
      success: true,
      message: 'Preferences reset to defaults',
      data: defaultPreferences
    });
  } catch (error) {
    console.error('Error resetting user preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset user preferences',
      error: error.message
    });
  }
};
