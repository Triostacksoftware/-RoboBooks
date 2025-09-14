export interface RecurringBill {
  _id: string;
  name: string;
  description?: string;
  vendorId: string;
  vendorName: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate?: string;
  nextDueDate: string;
  isActive: boolean;
  totalOccurrences?: number;
  processedOccurrences?: number;
  lastProcessed?: string;
  category: string;
  account: string;
  currency: string;
  terms?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecurringBillData {
  name: string;
  description?: string;
  vendorId: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate?: string;
  isActive?: boolean;
  totalOccurrences?: number;
  category: string;
  account: string;
  currency?: string;
  terms?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const recurringBillService = {
  async getRecurringBills(): Promise<RecurringBill[]> {
    const response = await fetch(`${API_BASE_URL}/api/recurring-bills`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch recurring bills');
    }

    const result = await response.json();
    return result.data || [];
  },

  async getRecurringBillById(id: string): Promise<RecurringBill> {
    const response = await fetch(`${API_BASE_URL}/api/recurring-bills/${id}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch recurring bill');
    }

    const result = await response.json();
    return result.data;
  },

  async createRecurringBill(data: CreateRecurringBillData): Promise<RecurringBill> {
    // Transform camelCase to snake_case for backend
    const transformedData = {
      vendor_id: data.vendorId,
      bill_number: data.name, // Using name as bill_number
      amount: data.amount,
      frequency: data.frequency,
      start_date: data.startDate,
      end_date: data.endDate,
      due_days: 30, // Default value
      description: data.description,
      is_active: data.isActive,
    };

    const response = await fetch(`${API_BASE_URL}/api/recurring-bills`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transformedData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create recurring bill');
    }

    const result = await response.json();
    return result.data;
  },

  async updateRecurringBill(id: string, data: Partial<CreateRecurringBillData>): Promise<RecurringBill> {
    // Transform camelCase to snake_case for backend
    const transformedData: any = {};
    if (data.vendorId !== undefined) transformedData.vendor_id = data.vendorId;
    if (data.name !== undefined) transformedData.bill_number = data.name;
    if (data.amount !== undefined) transformedData.amount = data.amount;
    if (data.frequency !== undefined) transformedData.frequency = data.frequency;
    if (data.startDate !== undefined) transformedData.start_date = data.startDate;
    if (data.endDate !== undefined) transformedData.end_date = data.endDate;
    if (data.description !== undefined) transformedData.description = data.description;
    if (data.isActive !== undefined) transformedData.is_active = data.isActive;

    const response = await fetch(`${API_BASE_URL}/api/recurring-bills/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transformedData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update recurring bill');
    }

    const result = await response.json();
    return result.data;
  },

  async deleteRecurringBill(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/recurring-bills/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete recurring bill');
    }
  },

  async searchRecurringBills(query: string): Promise<RecurringBill[]> {
    const response = await fetch(`${API_BASE_URL}/api/recurring-bills/search?query=${encodeURIComponent(query)}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to search recurring bills');
    }

    const result = await response.json();
    return result.data || [];
  },

  async toggleRecurringBill(id: string, isActive: boolean): Promise<RecurringBill> {
    const response = await fetch(`${API_BASE_URL}/api/recurring-bills/${id}/toggle`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isActive }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to toggle recurring bill');
    }

    const result = await response.json();
    return result.data;
  },
};
