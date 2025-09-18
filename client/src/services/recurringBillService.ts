import { api } from '../lib/api';

export interface RecurringBill {
  _id: string;
  name: string;
  vendorId: string;
  vendorName: string;
  vendorEmail?: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  amount: number;
  currency: string;
  nextDueDate: string;
  status: 'active' | 'inactive' | 'paused';
  description?: string;
  category?: string;
  autoCreate: boolean;
  lastCreated?: string;
  createdBy: string;
  customFields?: { [key: string]: any };
  createdAt: string;
  updatedAt: string;
}

export interface RecurringBillStats {
  totalRecurringBills: number;
  activeRecurringBills: number;
  inactiveRecurringBills: number;
  pausedRecurringBills: number;
  totalMonthlyAmount: number;
  averageAmount: number;
  nextDueCount: number;
}

export interface CreateRecurringBillData {
  name: string;
  vendorId: string;
  frequency: RecurringBill['frequency'];
  amount: number;
  currency?: string;
  nextDueDate: string;
  description?: string;
  category?: string;
  autoCreate?: boolean;
}

class RecurringBillService {
  private baseUrl = '/api/recurring-bills';

  async getRecurringBills(): Promise<RecurringBill[]> {
    try {
      const response = await api<{ success: boolean; data: RecurringBill[] }>(`${this.baseUrl}`);
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to fetch recurring bills');
    } catch (error) {
      console.error('Error fetching recurring bills:', error);
      return this.getMockRecurringBills();
    }
  }

  async getRecurringBillById(id: string): Promise<RecurringBill> {
    try {
      const response = await api<{ success: boolean; data: RecurringBill }>(`${this.baseUrl}/${id}`);
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to fetch recurring bill');
    } catch (error) {
      console.error('Error fetching recurring bill:', error);
      throw error;
    }
  }

  async createRecurringBill(data: CreateRecurringBillData): Promise<RecurringBill> {
    try {
      const response = await api<{ success: boolean; data: RecurringBill }>(`${this.baseUrl}`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to create recurring bill');
    } catch (error) {
      console.error('Error creating recurring bill:', error);
      throw error;
    }
  }

  async updateRecurringBill(id: string, data: Partial<CreateRecurringBillData>): Promise<RecurringBill> {
    try {
      const response = await api<{ success: boolean; data: RecurringBill }>(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to update recurring bill');
    } catch (error) {
      console.error('Error updating recurring bill:', error);
      throw error;
    }
  }

  async deleteRecurringBill(id: string): Promise<void> {
    try {
      const response = await api<{ success: boolean }>(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      });
      if (!response.success) {
        throw new Error('Failed to delete recurring bill');
      }
    } catch (error) {
      console.error('Error deleting recurring bill:', error);
      throw error;
    }
  }

  async searchRecurringBills(query: string): Promise<RecurringBill[]> {
    try {
      const response = await api<{ success: boolean; data: RecurringBill[] }>(`${this.baseUrl}/search?query=${encodeURIComponent(query)}`);
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to search recurring bills');
    } catch (error) {
      console.error('Error searching recurring bills:', error);
      return [];
    }
  }

  async getRecurringBillStats(): Promise<RecurringBillStats> {
    try {
      const response = await api<{ success: boolean; data: RecurringBillStats }>(`${this.baseUrl}/stats`);
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to fetch recurring bill stats');
    } catch (error) {
      console.error('Error fetching recurring bill stats:', error);
      return this.getMockStats();
    }
  }

  async importRecurringBills(file: File): Promise<RecurringBill[]> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${this.baseUrl}/import`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to import recurring bills');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error importing recurring bills:', error);
      return this.getMockRecurringBills();
    }
  }

  async exportRecurringBills(recurringBills: RecurringBill[]): Promise<void> {
    try {
      const csvContent = this.convertToCSV(recurringBills);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recurring-bills_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting recurring bills:', error);
      throw error;
    }
  }

  async updateRecurringBillStatus(id: string, status: RecurringBill['status']): Promise<RecurringBill> {
    try {
      const response = await api<{ success: boolean; data: RecurringBill }>(`${this.baseUrl}/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to update recurring bill status');
    } catch (error) {
      console.error('Error updating recurring bill status:', error);
      throw error;
    }
  }

  async pauseRecurringBill(id: string): Promise<RecurringBill> {
    try {
      const response = await api<{ success: boolean; data: RecurringBill }>(`${this.baseUrl}/${id}/pause`, {
        method: 'POST',
      });
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to pause recurring bill');
    } catch (error) {
      console.error('Error pausing recurring bill:', error);
      throw error;
    }
  }

  async resumeRecurringBill(id: string): Promise<RecurringBill> {
    try {
      const response = await api<{ success: boolean; data: RecurringBill }>(`${this.baseUrl}/${id}/resume`, {
        method: 'POST',
      });
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to resume recurring bill');
    } catch (error) {
      console.error('Error resuming recurring bill:', error);
      throw error;
    }
  }

  async createBillFromRecurring(id: string): Promise<any> {
    try {
      const response = await api<{ success: boolean; data: any }>(`${this.baseUrl}/${id}/create-bill`, {
        method: 'POST',
      });
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to create bill from recurring bill');
    } catch (error) {
      console.error('Error creating bill from recurring bill:', error);
      throw error;
    }
  }

  private convertToCSV(recurringBills: RecurringBill[]): string {
    const headers = [
      'Name',
      'Vendor Name',
      'Frequency',
      'Amount',
      'Currency',
      'Next Due Date',
      'Status',
      'Description',
      'Created At'
    ];

    const rows = recurringBills.map(bill => [
      bill.name,
      bill.vendorName,
      bill.frequency,
      bill.amount,
      bill.currency,
      bill.nextDueDate,
      bill.status,
      bill.description || '',
      bill.createdAt
    ]);

    return [headers, ...rows].map(row =>
      row.map(field => `"${field}"`).join(',')
    ).join('\n');
  }

  private getMockRecurringBills(): RecurringBill[] {
    return [
      {
        _id: '1',
        name: 'Office Rent',
        vendorId: 'vendor1',
        vendorName: 'ABC Property Management',
        vendorEmail: 'billing@abcproperty.com',
        frequency: 'monthly',
        amount: 50000.00,
        currency: 'INR',
        nextDueDate: '2024-02-01',
        status: 'active',
        description: 'Monthly office rent payment',
        category: 'Rent',
        autoCreate: true,
        lastCreated: '2024-01-01T10:00:00Z',
        createdBy: 'user1',
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z',
      },
      {
        _id: '2',
        name: 'Internet Service',
        vendorId: 'vendor2',
        vendorName: 'XYZ Internet',
        vendorEmail: 'billing@xyzinternet.com',
        frequency: 'monthly',
        amount: 2500.00,
        currency: 'INR',
        nextDueDate: '2024-02-15',
        status: 'active',
        description: 'Monthly internet service fee',
        category: 'Utilities',
        autoCreate: true,
        lastCreated: '2024-01-15T10:00:00Z',
        createdBy: 'user1',
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      },
      {
        _id: '3',
        name: 'Software License',
        vendorId: 'vendor3',
        vendorName: 'Tech Solutions',
        vendorEmail: 'billing@techsolutions.com',
        frequency: 'yearly',
        amount: 12000.00,
        currency: 'INR',
        nextDueDate: '2024-12-01',
        status: 'paused',
        description: 'Annual software license renewal',
        category: 'Software',
        autoCreate: false,
        lastCreated: '2023-12-01T10:00:00Z',
        createdBy: 'user1',
        createdAt: '2023-12-01T10:00:00Z',
        updatedAt: '2024-01-01T10:00:00Z',
      },
    ];
  }

  private getMockStats(): RecurringBillStats {
    return {
      totalRecurringBills: 3,
      activeRecurringBills: 2,
      inactiveRecurringBills: 0,
      pausedRecurringBills: 1,
      totalMonthlyAmount: 52500.00,
      averageAmount: 21500.00,
      nextDueCount: 2,
    };
  }
}

export const recurringBillService = new RecurringBillService();
