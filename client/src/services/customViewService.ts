import { api } from '@/lib/api';

export interface CustomFilter {
  id: string;
  field: string;
  operator: string;
  value: string;
}

export interface CustomView {
  _id?: string;
  name: string;
  description?: string;
  module: string;
  filters: CustomFilter[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  columns: string[];
  isDefault?: boolean;
  isPublic?: boolean;
  createdBy?: string;
  organizationId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApplyCustomViewRequest {
  filters: CustomFilter[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  columns: string[];
  searchTerm?: string;
}

export interface ApplyCustomViewResponse {
  success: boolean;
  data: any[];
  count: number;
}

class CustomViewService {
  private baseUrl = '/api/custom-views';

  // Get all custom views for a module
  async getCustomViews(module: string): Promise<CustomView[]> {
    try {
      const response = await api.get(`${this.baseUrl}/${module}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching custom views:', error);
      throw error;
    }
  }

  // Get a specific custom view
  async getCustomView(module: string, id: string): Promise<CustomView> {
    try {
      const response = await api.get(`${this.baseUrl}/${module}/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching custom view:', error);
      throw error;
    }
  }

  // Create a new custom view
  async createCustomView(module: string, customView: Omit<CustomView, '_id' | 'createdAt' | 'updatedAt'>): Promise<CustomView> {
    try {
      const response = await api.post(`${this.baseUrl}/${module}`, customView);
      return response.data.data;
    } catch (error) {
      console.error('Error creating custom view:', error);
      throw error;
    }
  }

  // Update a custom view
  async updateCustomView(module: string, id: string, customView: Partial<CustomView>): Promise<CustomView> {
    try {
      const response = await api.put(`${this.baseUrl}/${module}/${id}`, customView);
      return response.data.data;
    } catch (error) {
      console.error('Error updating custom view:', error);
      throw error;
    }
  }

  // Delete a custom view
  async deleteCustomView(module: string, id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${module}/${id}`);
    } catch (error) {
      console.error('Error deleting custom view:', error);
      throw error;
    }
  }

  // Apply custom view filters and get data
  async applyCustomView(module: string, request: ApplyCustomViewRequest): Promise<ApplyCustomViewResponse> {
    try {
      const response = await api.post(`${this.baseUrl}/${module}/apply`, request);
      return response.data;
    } catch (error) {
      console.error('Error applying custom view:', error);
      throw error;
    }
  }

  // Get available filter fields for a module
  getAvailableFilterFields(module: string): { value: string; label: string; type: 'text' | 'number' | 'select' | 'date' | 'boolean' }[] {
    const commonFields = [
      { value: 'description', label: 'Description', type: 'text' as const },
      { value: 'amount', label: 'Amount', type: 'number' as const },
      { value: 'vendor', label: 'Vendor', type: 'text' as const },
      { value: 'account', label: 'Account', type: 'text' as const },
      { value: 'category', label: 'Category', type: 'text' as const },
      { value: 'reference', label: 'Reference', type: 'text' as const },
      { value: 'date', label: 'Date', type: 'date' as const }
    ];

    const moduleSpecificFields: Record<string, { value: string; label: string; type: 'text' | 'number' | 'select' | 'date' | 'boolean' }[]> = {
      expenses: [
        { value: 'status', label: 'Status', type: 'select' as const },
        { value: 'billable', label: 'Billable', type: 'boolean' as const },
        { value: 'hasReceipt', label: 'Has Receipt', type: 'boolean' as const }
      ],
      bills: [
        { value: 'status', label: 'Status', type: 'select' as const },
        { value: 'dueDate', label: 'Due Date', type: 'date' as const }
      ],
      payments: [
        { value: 'paymentMethod', label: 'Payment Method', type: 'select' as const },
        { value: 'status', label: 'Status', type: 'select' as const }
      ],
      'purchase-orders': [
        { value: 'status', label: 'Status', type: 'select' as const },
        { value: 'expectedDate', label: 'Expected Date', type: 'date' as const }
      ],
      'vendor-credits': [
        { value: 'status', label: 'Status', type: 'select' as const }
      ],
      vendors: [
        { value: 'status', label: 'Status', type: 'select' as const },
        { value: 'type', label: 'Type', type: 'select' as const }
      ],
      'recurring-bills': [
        { value: 'frequency', label: 'Frequency', type: 'select' as const },
        { value: 'status', label: 'Status', type: 'select' as const }
      ],
      'recurring-expenses': [
        { value: 'frequency', label: 'Frequency', type: 'select' as const },
        { value: 'status', label: 'Status', type: 'select' as const }
      ]
    };

    return [...commonFields, ...(moduleSpecificFields[module] || [])];
  }

  // Get available operators for a field type
  getAvailableOperators(fieldType: 'text' | 'number' | 'select' | 'date' | 'boolean'): { value: string; label: string }[] {
    switch (fieldType) {
      case 'text':
        return [
          { value: 'equals', label: 'Equals' },
          { value: 'contains', label: 'Contains' },
          { value: 'startsWith', label: 'Starts With' },
          { value: 'endsWith', label: 'Ends With' },
          { value: 'notEquals', label: 'Not Equals' }
        ];
      case 'number':
        return [
          { value: 'equals', label: 'Equals' },
          { value: 'greaterThan', label: 'Greater Than' },
          { value: 'lessThan', label: 'Less Than' },
          { value: 'greaterThanOrEqual', label: 'Greater Than or Equal' },
          { value: 'lessThanOrEqual', label: 'Less Than or Equal' },
          { value: 'notEquals', label: 'Not Equals' }
        ];
      case 'select':
      case 'boolean':
        return [
          { value: 'equals', label: 'Equals' },
          { value: 'notEquals', label: 'Not Equals' }
        ];
      case 'date':
        return [
          { value: 'equals', label: 'Equals' },
          { value: 'greaterThan', label: 'After' },
          { value: 'lessThan', label: 'Before' },
          { value: 'greaterThanOrEqual', label: 'On or After' },
          { value: 'lessThanOrEqual', label: 'On or Before' },
          { value: 'notEquals', label: 'Not Equals' }
        ];
      default:
        return [{ value: 'equals', label: 'Equals' }];
    }
  }

  // Get available sort fields for a module
  getAvailableSortFields(module: string): { value: string; label: string }[] {
    const commonFields = [
      { value: 'date', label: 'Date' },
      { value: 'description', label: 'Description' },
      { value: 'amount', label: 'Amount' },
      { value: 'vendor', label: 'Vendor' },
      { value: 'account', label: 'Account' },
      { value: 'category', label: 'Category' },
      { value: 'reference', label: 'Reference' },
      { value: 'createdAt', label: 'Created Date' },
      { value: 'updatedAt', label: 'Updated Date' }
    ];

    const moduleSpecificFields: Record<string, { value: string; label: string }[]> = {
      expenses: [
        { value: 'status', label: 'Status' }
      ],
      bills: [
        { value: 'status', label: 'Status' },
        { value: 'dueDate', label: 'Due Date' }
      ],
      payments: [
        { value: 'paymentMethod', label: 'Payment Method' },
        { value: 'status', label: 'Status' }
      ],
      'purchase-orders': [
        { value: 'status', label: 'Status' },
        { value: 'expectedDate', label: 'Expected Date' }
      ],
      'vendor-credits': [
        { value: 'status', label: 'Status' }
      ],
      vendors: [
        { value: 'status', label: 'Status' },
        { value: 'type', label: 'Type' }
      ],
      'recurring-bills': [
        { value: 'frequency', label: 'Frequency' },
        { value: 'status', label: 'Status' }
      ],
      'recurring-expenses': [
        { value: 'frequency', label: 'Frequency' },
        { value: 'status', label: 'Status' }
      ]
    };

    return [...commonFields, ...(moduleSpecificFields[module] || [])];
  }

  // Get available columns for a module
  getAvailableColumns(module: string): { value: string; label: string }[] {
    const commonColumns = [
      { value: 'date', label: 'Date' },
      { value: 'description', label: 'Description' },
      { value: 'amount', label: 'Amount' },
      { value: 'vendor', label: 'Vendor' },
      { value: 'account', label: 'Account' },
      { value: 'category', label: 'Category' },
      { value: 'reference', label: 'Reference' }
    ];

    const moduleSpecificColumns: Record<string, { value: string; label: string }[]> = {
      expenses: [
        { value: 'status', label: 'Status' },
        { value: 'billable', label: 'Billable' },
        { value: 'hasReceipt', label: 'Has Receipt' }
      ],
      bills: [
        { value: 'status', label: 'Status' },
        { value: 'dueDate', label: 'Due Date' }
      ],
      payments: [
        { value: 'paymentMethod', label: 'Payment Method' },
        { value: 'status', label: 'Status' }
      ],
      'purchase-orders': [
        { value: 'status', label: 'Status' },
        { value: 'expectedDate', label: 'Expected Date' }
      ],
      'vendor-credits': [
        { value: 'status', label: 'Status' }
      ],
      vendors: [
        { value: 'status', label: 'Status' },
        { value: 'type', label: 'Type' }
      ],
      'recurring-bills': [
        { value: 'frequency', label: 'Frequency' },
        { value: 'status', label: 'Status' }
      ],
      'recurring-expenses': [
        { value: 'frequency', label: 'Frequency' },
        { value: 'status', label: 'Status' }
      ]
    };

    return [...commonColumns, ...(moduleSpecificColumns[module] || [])];
  }
}

export const customViewService = new CustomViewService();
