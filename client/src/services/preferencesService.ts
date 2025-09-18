const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface Preferences {
  defaultSortBy: string;
  defaultSortOrder: 'asc' | 'desc';
  itemsPerPage: number;
  showFilters: boolean;
  showEmptyStates: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  theme: 'light' | 'dark' | 'auto';
  compactMode: boolean;
  showTooltips: boolean;
  notifications: {
    email: boolean;
    browser: boolean;
    sound: boolean;
    types: string[];
  };
  exportFormat: 'excel' | 'csv' | 'pdf';
  includeHeaders: boolean;
  showColumns: Record<string, boolean>;
  columnWidths: Record<string, number>;
  columnOrder: string[];
  defaultFilters: any[];
  savedFilters: Array<{
    name: string;
    filters: any;
    isDefault: boolean;
  }>;
  moduleSettings: Record<string, any>;
  advanced: Record<string, any>;
}

export interface PreferencesResponse {
  success: boolean;
  data?: Preferences;
  message?: string;
  error?: string;
}

class PreferencesService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('token');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Get preferences for a specific module
  async getPreferences(module: string): Promise<Preferences> {
    const response = await this.makeRequest<PreferencesResponse>(`/preferences/${module}`);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to get preferences');
    }
    return response.data;
  }

  // Save/Update preferences for a specific module
  async savePreferences(module: string, preferences: Partial<Preferences>): Promise<Preferences> {
    const response = await this.makeRequest<PreferencesResponse>(`/preferences/${module}`, {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to save preferences');
    }
    return response.data;
  }

  // Reset preferences to defaults for a specific module
  async resetPreferences(module: string): Promise<Preferences> {
    const response = await this.makeRequest<PreferencesResponse>(`/preferences/${module}`, {
      method: 'DELETE',
    });
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to reset preferences');
    }
    return response.data;
  }

  // Get all preferences for the user
  async getAllPreferences(): Promise<Record<string, Preferences>> {
    const response = await this.makeRequest<{
      success: boolean;
      data: Record<string, Preferences>;
      message?: string;
    }>('/preferences');
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to get all preferences');
    }
    return response.data;
  }

  // Bulk update preferences for multiple modules
  async bulkUpdatePreferences(updates: Record<string, Partial<Preferences>>): Promise<Record<string, any>> {
    const response = await this.makeRequest<{
      success: boolean;
      data: Record<string, any>;
      message?: string;
    }>('/preferences', {
      method: 'PUT',
      body: JSON.stringify({ updates }),
    });
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to bulk update preferences');
    }
    return response.data;
  }

  // Get default preferences for a module (client-side fallback)
  getDefaultPreferences(module: string): Preferences {
    const baseDefaults: Preferences = {
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
    const moduleDefaults: Record<string, Partial<Preferences>> = {
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
      }
    };

    return { ...baseDefaults, ...moduleDefaults[module] } as Preferences;
  }

  // Validate preferences data
  validatePreferences(preferences: Partial<Preferences>, module: string): string[] {
    const errors: string[] = [];

    if (preferences.defaultSortBy && typeof preferences.defaultSortBy !== 'string') {
      errors.push('defaultSortBy must be a string');
    }

    if (preferences.defaultSortOrder && !['asc', 'desc'].includes(preferences.defaultSortOrder)) {
      errors.push('defaultSortOrder must be "asc" or "desc"');
    }

    if (preferences.itemsPerPage && (typeof preferences.itemsPerPage !== 'number' || preferences.itemsPerPage < 1)) {
      errors.push('itemsPerPage must be a positive number');
    }

    if (preferences.refreshInterval && (typeof preferences.refreshInterval !== 'number' || preferences.refreshInterval < 1)) {
      errors.push('refreshInterval must be a positive number');
    }

    if (preferences.theme && !['light', 'dark', 'auto'].includes(preferences.theme)) {
      errors.push('theme must be "light", "dark", or "auto"');
    }

    if (preferences.exportFormat && !['excel', 'csv', 'pdf'].includes(preferences.exportFormat)) {
      errors.push('exportFormat must be "excel", "csv", or "pdf"');
    }

    return errors;
  }
}

export const preferencesService = new PreferencesService();