import { api } from '../lib/api';

export interface RecurringExpense {
  _id: string;
  name: string;
  description?: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  category: string;
  vendor?: string;
  nextDue?: string;
  isActive: boolean;
  organizationId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecurringExpenseStats {
  total: number;
  active: number;
  inactive: number;
  totalAmount: number;
  byFrequency: {
    daily: number;
    weekly: number;
    monthly: number;
    quarterly: number;
    yearly: number;
  };
  byCategory: { [key: string]: number };
}

class RecurringExpenseService {
  // Get all recurring expenses
  async getRecurringExpenses(): Promise<RecurringExpense[]> {
    try {
      const response = await api.get('/api/recurring-expenses');
      return response.data;
    } catch (error) {
      console.error('Error fetching recurring expenses:', error);
      throw error;
    }
  }

  // Get recurring expense by ID
  async getRecurringExpense(id: string): Promise<RecurringExpense> {
    try {
      const response = await api.get(`/api/recurring-expenses/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recurring expense:', error);
      throw error;
    }
  }

  // Create new recurring expense
  async createRecurringExpense(expense: Omit<RecurringExpense, '_id' | 'organizationId' | 'createdBy' | 'createdAt' | 'updatedAt'>): Promise<RecurringExpense> {
    try {
      const response = await api.post('/api/recurring-expenses', expense);
      return response.data;
    } catch (error) {
      console.error('Error creating recurring expense:', error);
      throw error;
    }
  }

  // Update recurring expense
  async updateRecurringExpense(id: string, expense: Partial<RecurringExpense>): Promise<RecurringExpense> {
    try {
      const response = await api.put(`/api/recurring-expenses/${id}`, expense);
      return response.data;
    } catch (error) {
      console.error('Error updating recurring expense:', error);
      throw error;
    }
  }

  // Delete recurring expense
  async deleteRecurringExpense(id: string): Promise<void> {
    try {
      await api.delete(`/api/recurring-expenses/${id}`);
    } catch (error) {
      console.error('Error deleting recurring expense:', error);
      throw error;
    }
  }

  // Toggle recurring expense active status
  async toggleRecurringExpense(id: string, isActive: boolean): Promise<RecurringExpense> {
    try {
      const response = await api.patch(`/api/recurring-expenses/${id}/toggle`, { isActive });
      return response.data;
    } catch (error) {
      console.error('Error toggling recurring expense:', error);
      throw error;
    }
  }

  // Get recurring expense statistics
  async getRecurringExpenseStats(): Promise<RecurringExpenseStats> {
    try {
      const response = await api.get('/api/recurring-expenses/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching recurring expense stats:', error);
      throw error;
    }
  }

  // Import recurring expenses from CSV
  async importRecurringExpenses(file: File): Promise<RecurringExpense[]> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/api/recurring-expenses/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error importing recurring expenses:', error);
      throw error;
    }
  }

  // Export recurring expenses to CSV
  async exportRecurringExpenses(): Promise<Blob> {
    try {
      const response = await api.get('/api/recurring-expenses/export', {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting recurring expenses:', error);
      throw error;
    }
  }

  // Convert recurring expenses to CSV format
  convertToCSV(expenses: RecurringExpense[]): string {
    const headers = [
      'Name',
      'Description',
      'Amount',
      'Frequency',
      'Category',
      'Vendor',
      'Next Due',
      'Status',
      'Created At'
    ];

    const rows = expenses.map(expense => [
      expense.name,
      expense.description || '',
      expense.amount.toString(),
      expense.frequency,
      expense.category,
      expense.vendor || '',
      expense.nextDue ? new Date(expense.nextDue).toLocaleDateString() : '',
      expense.isActive ? 'Active' : 'Inactive',
      new Date(expense.createdAt).toLocaleDateString()
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    return csvContent;
  }

  // Download CSV file
  downloadCSV(csvContent: string, filename: string = 'recurring-expenses.csv'): void {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Mock data for development
  getMockRecurringExpenses(): RecurringExpense[] {
    return [
      {
        _id: '1',
        name: 'Office Rent',
        description: 'Monthly office space rental',
        amount: 2500,
        frequency: 'monthly',
        category: 'Rent',
        vendor: 'ABC Properties',
        nextDue: '2024-02-01',
        isActive: true,
        organizationId: 'org1',
        createdBy: 'user1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        _id: '2',
        name: 'Internet Service',
        description: 'Monthly internet subscription',
        amount: 99,
        frequency: 'monthly',
        category: 'Utilities',
        vendor: 'TechCom',
        nextDue: '2024-02-15',
        isActive: true,
        organizationId: 'org1',
        createdBy: 'user1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        _id: '3',
        name: 'Software License',
        description: 'Annual software subscription',
        amount: 1200,
        frequency: 'yearly',
        category: 'Software',
        vendor: 'SoftwareCorp',
        nextDue: '2024-12-31',
        isActive: true,
        organizationId: 'org1',
        createdBy: 'user1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        _id: '4',
        name: 'Cleaning Service',
        description: 'Weekly office cleaning',
        amount: 150,
        frequency: 'weekly',
        category: 'Maintenance',
        vendor: 'CleanPro',
        nextDue: '2024-01-29',
        isActive: false,
        organizationId: 'org1',
        createdBy: 'user1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ];
  }

  // Mock stats for development
  getMockStats(): RecurringExpenseStats {
    return {
      total: 4,
      active: 3,
      inactive: 1,
      totalAmount: 3949,
      byFrequency: {
        daily: 0,
        weekly: 1,
        monthly: 2,
        quarterly: 0,
        yearly: 1
      },
      byCategory: {
        'Rent': 1,
        'Utilities': 1,
        'Software': 1,
        'Maintenance': 1
      }
    };
  }
}

export const recurringExpenseService = new RecurringExpenseService();
