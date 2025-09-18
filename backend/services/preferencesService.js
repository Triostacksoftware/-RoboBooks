import UserPreferences from '../models/UserPreferences.js';

class PreferencesService {
  // Get preferences for a specific module
  async getPreferences(userId, organizationId, module) {
    try {
      const preferences = await UserPreferences.findOne({
        userId,
        organizationId,
        module
      });

      if (!preferences) {
        // Return default preferences if none exist
        return this.getDefaultPreferences(module);
      }

      return preferences.preferences;
    } catch (error) {
      console.error('Error getting preferences:', error);
      throw new Error('Failed to get preferences');
    }
  }

  // Save preferences for a specific module
  async savePreferences(userId, organizationId, module, preferencesData) {
    try {
      const existingPreferences = await UserPreferences.findOne({
        userId,
        organizationId,
        module
      });

      if (existingPreferences) {
        // Update existing preferences
        Object.keys(preferencesData).forEach(key => {
          if (preferencesData[key] !== undefined) {
            existingPreferences.preferences[key] = preferencesData[key];
          }
        });
        
        await existingPreferences.save();
        return existingPreferences.preferences;
      } else {
        // Create new preferences
        const defaultPrefs = this.getDefaultPreferences(module);
        const mergedPrefs = { ...defaultPrefs, ...preferencesData };
        
        const newPreferences = new UserPreferences({
          userId,
          organizationId,
          module,
          preferences: mergedPrefs
        });
        
        await newPreferences.save();
        return newPreferences.preferences;
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      throw new Error('Failed to save preferences');
    }
  }

  // Reset preferences to defaults
  async resetPreferences(userId, organizationId, module) {
    try {
      // Delete existing preferences
      await UserPreferences.findOneAndDelete({
        userId,
        organizationId,
        module
      });

      // Return default preferences
      return {
        preferences: this.getDefaultPreferences(module)
      };
    } catch (error) {
      console.error('Error resetting preferences:', error);
      throw new Error('Failed to reset preferences');
    }
  }

  // Get all preferences for a user
  async getAllPreferences(userId, organizationId) {
    try {
      const preferences = await UserPreferences.find({
        userId,
        organizationId
      });

      const preferencesMap = {};
      preferences.forEach(pref => {
        preferencesMap[pref.module] = pref.preferences;
      });

      return preferencesMap;
    } catch (error) {
      console.error('Error getting all preferences:', error);
      throw new Error('Failed to get all preferences');
    }
  }

  // Bulk update preferences
  async bulkUpdatePreferences(userId, organizationId, updates) {
    try {
      const results = {};

      for (const [module, preferencesData] of Object.entries(updates)) {
        try {
          const result = await this.savePreferences(userId, organizationId, module, preferencesData);
          results[module] = { success: true, preferences: result };
        } catch (error) {
          results[module] = { success: false, error: error.message };
        }
      }

      return results;
    } catch (error) {
      console.error('Error bulk updating preferences:', error);
      throw new Error('Failed to bulk update preferences');
    }
  }

  // Get default preferences for a module
  getDefaultPreferences(module) {
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
      showColumns: {},
      columnWidths: {},
      columnOrder: [],
      defaultFilters: [],
      savedFilters: [],
      moduleSettings: {},
      advanced: {}
    };

    // Module-specific defaults
    const moduleDefaults = {
      bills: {
        ...baseDefaults,
        defaultSortBy: 'createdAt',
        showColumns: {
          billNumber: true,
          vendorName: true,
          billDate: true,
          dueDate: true,
          status: true,
          totalAmount: true,
          currency: true,
          notes: false,
          createdAt: true
        },
        columnWidths: {
          billNumber: 120,
          vendorName: 200,
          billDate: 120,
          dueDate: 120,
          status: 100,
          totalAmount: 120,
          currency: 80,
          notes: 200,
          createdAt: 120
        }
      },
      expenses: {
        ...baseDefaults,
        defaultSortBy: 'expenseDate',
        showColumns: {
          expenseNumber: true,
          vendorName: true,
          expenseDate: true,
          category: true,
          amount: true,
          status: true,
          paymentMethod: true,
          notes: false,
          createdAt: true
        },
        columnWidths: {
          expenseNumber: 120,
          vendorName: 200,
          expenseDate: 120,
          category: 150,
          amount: 120,
          status: 100,
          paymentMethod: 120,
          notes: 200,
          createdAt: 120
        }
      },
      invoices: {
        ...baseDefaults,
        defaultSortBy: 'invoiceDate',
        showColumns: {
          invoiceNumber: true,
          customerName: true,
          invoiceDate: true,
          dueDate: true,
          status: true,
          totalAmount: true,
          currency: true,
          notes: false,
          createdAt: true
        },
        columnWidths: {
          invoiceNumber: 120,
          customerName: 200,
          invoiceDate: 120,
          dueDate: 120,
          status: 100,
          totalAmount: 120,
          currency: 80,
          notes: 200,
          createdAt: 120
        }
      },
      purchaseOrders: {
        ...baseDefaults,
        defaultSortBy: 'orderDate',
        showColumns: {
          orderNumber: true,
          vendorName: true,
          orderDate: true,
          expectedDate: true,
          status: true,
          totalAmount: true,
          currency: true,
          notes: false,
          createdAt: true
        }
      },
      vendorCredits: {
        ...baseDefaults,
        defaultSortBy: 'creditDate',
        showColumns: {
          creditNumber: true,
          vendorName: true,
          creditDate: true,
          amount: true,
          status: true,
          reason: true,
          notes: false,
          createdAt: true
        }
      },
      vendors: {
        ...baseDefaults,
        defaultSortBy: 'name',
        showColumns: {
          name: true,
          email: true,
          phone: true,
          address: true,
          status: true,
          totalBills: true,
          totalAmount: true,
          lastTransaction: true,
          createdAt: true
        }
      },
      customers: {
        ...baseDefaults,
        defaultSortBy: 'name',
        showColumns: {
          name: true,
          email: true,
          phone: true,
          address: true,
          status: true,
          totalInvoices: true,
          totalAmount: true,
          lastTransaction: true,
          createdAt: true
        }
      },
      items: {
        ...baseDefaults,
        defaultSortBy: 'name',
        showColumns: {
          name: true,
          description: true,
          category: true,
          unitPrice: true,
          stock: true,
          status: true,
          createdAt: true
        }
      },
      general: {
        ...baseDefaults,
        theme: 'light',
        compactMode: false,
        showTooltips: true,
        notifications: {
          email: true,
          browser: true,
          sound: false,
          types: ['reminders', 'updates', 'alerts']
        }
      },
      organization: {
        ...baseDefaults,
        currency: 'USD',
        timezone: 'UTC',
        dateFormat: 'MM/DD/YYYY',
        numberFormat: 'US'
      }
    };

    return moduleDefaults[module] || baseDefaults;
  }

  // Validate preferences data
  validatePreferences(preferencesData, module) {
    const errors = [];

    // Validate required fields
    if (preferencesData.defaultSortBy && typeof preferencesData.defaultSortBy !== 'string') {
      errors.push('defaultSortBy must be a string');
    }

    if (preferencesData.defaultSortOrder && !['asc', 'desc'].includes(preferencesData.defaultSortOrder)) {
      errors.push('defaultSortOrder must be "asc" or "desc"');
    }

    if (preferencesData.itemsPerPage && (typeof preferencesData.itemsPerPage !== 'number' || preferencesData.itemsPerPage < 1)) {
      errors.push('itemsPerPage must be a positive number');
    }

    if (preferencesData.refreshInterval && (typeof preferencesData.refreshInterval !== 'number' || preferencesData.refreshInterval < 1)) {
      errors.push('refreshInterval must be a positive number');
    }

    if (preferencesData.theme && !['light', 'dark', 'auto'].includes(preferencesData.theme)) {
      errors.push('theme must be "light", "dark", or "auto"');
    }

    if (preferencesData.exportFormat && !['excel', 'csv', 'pdf'].includes(preferencesData.exportFormat)) {
      errors.push('exportFormat must be "excel", "csv", or "pdf"');
    }

    return errors;
  }
}

export default new PreferencesService();
