import UserPreferences from '../models/UserPreferences.js';
import User from '../models/User.js';
import Organization from '../models/Organization.js';

// Get preferences for a specific module
export const getPreferences = async (req, res) => {
  try {
    const { module } = req.params;
    const userId = req.user.id;
    const organizationId = req.user.organizationId;

    // Validate module
    const validModules = [
      'general', 'sales', 'purchases', 'organization', 'users', 'reports', 
      'payments', 'setup', 'customization', 'expenses', 'bills', 'payments-made', 
      'purchase-orders', 'vendor-credits', 'vendors', 'recurring-bills', 
      'recurring-expenses', 'recurring-invoices', 'invoices', 'estimates',
      'quotes', 'sales-orders', 'delivery-challans', 'credit-notes',
      'debit-notes', 'banking', 'accountant', 'time-tracking', 'documents'
    ];

    if (!validModules.includes(module)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid module specified'
      });
    }

    let preferences = await UserPreferences.findOne({
      userId,
      organizationId,
      module
    });

    // If no preferences exist, create default ones
    if (!preferences) {
      preferences = await createDefaultPreferences(userId, organizationId, module);
    }

    res.json({
      success: true,
      data: preferences
    });
  } catch (error) {
    console.error('Error getting preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get preferences',
      error: error.message
    });
  }
};

// Update preferences for a specific module
export const updatePreferences = async (req, res) => {
  try {
    const { module } = req.params;
    const userId = req.user.id;
    const organizationId = req.user.organizationId;
    const updates = req.body;

    // Validate module
    const validModules = [
      'general', 'sales', 'purchases', 'organization', 'users', 'reports', 
      'payments', 'setup', 'customization', 'expenses', 'bills', 'payments-made', 
      'purchase-orders', 'vendor-credits', 'vendors', 'recurring-bills', 
      'recurring-expenses', 'recurring-invoices', 'invoices', 'estimates',
      'quotes', 'sales-orders', 'delivery-challans', 'credit-notes',
      'debit-notes', 'banking', 'accountant', 'time-tracking', 'documents'
    ];

    if (!validModules.includes(module)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid module specified'
      });
    }

    // Find existing preferences or create new ones
    let preferences = await UserPreferences.findOne({
      userId,
      organizationId,
      module
    });

    if (preferences) {
      // Update existing preferences
      Object.keys(updates).forEach(key => {
        if (updates[key] !== undefined) {
          preferences.preferences[key] = updates[key];
        }
      });
      
      await preferences.save();
    } else {
      // Create new preferences with provided updates
      const defaultPrefs = getDefaultPreferences(module);
      const mergedPrefs = { ...defaultPrefs, ...updates };
      
      preferences = new UserPreferences({
        userId,
        organizationId,
        module,
        preferences: mergedPrefs
      });
      
      await preferences.save();
    }

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: preferences
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences',
      error: error.message
    });
  }
};

// Reset preferences to defaults
export const resetPreferences = async (req, res) => {
  try {
    const { module } = req.params;
    const userId = req.user.id;
    const organizationId = req.user.organizationId;

    // Validate module
    const validModules = [
      'general', 'sales', 'purchases', 'organization', 'users', 'reports', 
      'payments', 'setup', 'customization', 'expenses', 'bills', 'payments-made', 
      'purchase-orders', 'vendor-credits', 'vendors', 'recurring-bills', 
      'recurring-expenses', 'recurring-invoices', 'invoices', 'estimates',
      'quotes', 'sales-orders', 'delivery-challans', 'credit-notes',
      'debit-notes', 'banking', 'accountant', 'time-tracking', 'documents'
    ];

    if (!validModules.includes(module)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid module specified'
      });
    }

    // Delete existing preferences
    await UserPreferences.findOneAndDelete({
      userId,
      organizationId,
      module
    });

    // Create default preferences
    const defaultPreferences = await createDefaultPreferences(userId, organizationId, module);

    res.json({
      success: true,
      message: 'Preferences reset to defaults successfully',
      data: defaultPreferences
    });
  } catch (error) {
    console.error('Error resetting preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset preferences',
      error: error.message
    });
  }
};

// Get all preferences for a user
export const getAllPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const organizationId = req.user.organizationId;

    const preferences = await UserPreferences.find({
      userId,
      organizationId
    }).populate('userId', 'name email').populate('organizationId', 'name');

    res.json({
      success: true,
      data: preferences
    });
  } catch (error) {
    console.error('Error getting all preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get preferences',
      error: error.message
    });
  }
};

// Bulk update preferences for multiple modules
export const bulkUpdatePreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const organizationId = req.user.organizationId;
    const { updates } = req.body; // Array of { module, preferences }

    if (!Array.isArray(updates)) {
      return res.status(400).json({
        success: false,
        message: 'Updates must be an array'
      });
    }

    const results = [];

    for (const update of updates) {
      const { module, preferences: modulePreferences } = update;
      
      // Validate module
      const validModules = [
        'general', 'sales', 'purchases', 'organization', 'users', 'reports', 
        'payments', 'setup', 'customization', 'expenses', 'bills', 'payments-made', 
        'purchase-orders', 'vendor-credits', 'vendors', 'recurring-bills', 
        'recurring-expenses', 'recurring-invoices', 'invoices', 'estimates',
        'quotes', 'sales-orders', 'delivery-challans', 'credit-notes',
        'debit-notes', 'banking', 'accountant', 'time-tracking', 'documents'
      ];

      if (!validModules.includes(module)) {
        results.push({
          module,
          success: false,
          message: 'Invalid module specified'
        });
        continue;
      }

      try {
        let userPrefs = await UserPreferences.findOne({
          userId,
          organizationId,
          module
        });

        if (userPrefs) {
          Object.keys(modulePreferences).forEach(key => {
            if (modulePreferences[key] !== undefined) {
              userPrefs.preferences[key] = modulePreferences[key];
            }
          });
          await userPrefs.save();
        } else {
          const defaultPrefs = getDefaultPreferences(module);
          const mergedPrefs = { ...defaultPrefs, ...modulePreferences };
          
          userPrefs = new UserPreferences({
            userId,
            organizationId,
            module,
            preferences: mergedPrefs
          });
          await userPrefs.save();
        }

        results.push({
          module,
          success: true,
          message: 'Preferences updated successfully'
        });
      } catch (error) {
        results.push({
          module,
          success: false,
          message: error.message
        });
      }
    }

    res.json({
      success: true,
      message: 'Bulk update completed',
      data: results
    });
  } catch (error) {
    console.error('Error bulk updating preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk update preferences',
      error: error.message
    });
  }
};

// Helper function to create default preferences
const createDefaultPreferences = async (userId, organizationId, module) => {
  const defaultPrefs = getDefaultPreferences(module);
  
  const preferences = new UserPreferences({
    userId,
    organizationId,
    module,
    preferences: defaultPrefs
  });
  
  await preferences.save();
  return preferences;
};

// Helper function to get default preferences for a module
const getDefaultPreferences = (module) => {
  const baseDefaults = {
    defaultSortBy: 'createdAt',
    defaultSortOrder: 'desc',
    itemsPerPage: 25,
    showFilters: true,
    showEmptyStates: true,
    autoRefresh: false,
    refreshInterval: 5,
    theme: 'light',
    compactMode: false,
    showTooltips: true,
    notifications: {
      email: true,
      browser: true,
      sound: false,
      types: ['reminders', 'updates', 'alerts']
    },
    exportFormat: 'excel',
    includeHeaders: true,
    showColumns: new Map(),
    columnWidths: new Map(),
    columnOrder: [],
    defaultFilters: [],
    savedFilters: [],
    moduleSettings: new Map(),
    advanced: new Map()
  };

  // Module-specific defaults
  const moduleDefaults = {
    bills: {
      ...baseDefaults,
      defaultSortBy: 'createdAt',
      showColumns: new Map([
        ['billNumber', true],
        ['vendorName', true],
        ['billDate', true],
        ['dueDate', true],
        ['status', true],
        ['totalAmount', true],
        ['currency', true],
        ['notes', false],
        ['createdAt', true]
      ]),
      columnWidths: new Map([
        ['billNumber', 120],
        ['vendorName', 200],
        ['billDate', 120],
        ['dueDate', 120],
        ['status', 100],
        ['totalAmount', 120],
        ['currency', 80],
        ['notes', 200],
        ['createdAt', 120]
      ])
    },
    expenses: {
      ...baseDefaults,
      defaultSortBy: 'expenseDate',
      showColumns: new Map([
        ['expenseNumber', true],
        ['vendorName', true],
        ['expenseDate', true],
        ['category', true],
        ['amount', true],
        ['status', true],
        ['paymentMethod', true],
        ['notes', false],
        ['createdAt', true]
      ])
    },
    invoices: {
      ...baseDefaults,
      defaultSortBy: 'invoiceDate',
      showColumns: new Map([
        ['invoiceNumber', true],
        ['customerName', true],
        ['invoiceDate', true],
        ['dueDate', true],
        ['status', true],
        ['totalAmount', true],
        ['currency', true],
        ['notes', false],
        ['createdAt', true]
      ])
    }
  };

  return moduleDefaults[module] || baseDefaults;
};