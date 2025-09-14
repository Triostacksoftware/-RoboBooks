export interface RecurringExpense {
  _id: string;
  name: string;
  description?: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate?: string;
  category: string;
  vendor?: string;
  account: string;
  isActive: boolean;
  lastProcessed?: string;
  nextDue?: string;
  totalOccurrences?: number;
  processedOccurrences?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecurringExpenseData {
  name: string;
  description?: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate?: string;
  category: string;
  vendor?: string;
  account: string;
  isActive?: boolean;
  totalOccurrences?: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const recurringExpenseService = {
  async getRecurringExpenses(): Promise<RecurringExpense[]> {
    const response = await fetch(`${API_BASE_URL}/api/recurring-expenses`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch recurring expenses');
    }

    const result = await response.json();
    return result.data || [];
  },

  async getRecurringExpenseById(id: string): Promise<RecurringExpense> {
    const response = await fetch(`${API_BASE_URL}/api/recurring-expenses/${id}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch recurring expense');
    }

    const result = await response.json();
    return result.data;
  },

  async createRecurringExpense(data: CreateRecurringExpenseData): Promise<RecurringExpense> {
    // Transform camelCase to snake_case for backend
    const transformedData = {
      name: data.name,
      description: data.description,
      amount: data.amount,
      frequency: data.frequency,
      start_date: data.startDate,
      end_date: data.endDate,
      category: data.category,
      vendor: data.vendor,
      account: data.account,
      is_active: data.isActive,
    };

    const response = await fetch(`${API_BASE_URL}/api/recurring-expenses`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transformedData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create recurring expense');
    }

    const result = await response.json();
    return result.data;
  },

  async updateRecurringExpense(id: string, data: Partial<CreateRecurringExpenseData>): Promise<RecurringExpense> {
    // Transform camelCase to snake_case for backend
    const transformedData: any = {};
    if (data.name !== undefined) transformedData.name = data.name;
    if (data.description !== undefined) transformedData.description = data.description;
    if (data.amount !== undefined) transformedData.amount = data.amount;
    if (data.frequency !== undefined) transformedData.frequency = data.frequency;
    if (data.startDate !== undefined) transformedData.start_date = data.startDate;
    if (data.endDate !== undefined) transformedData.end_date = data.endDate;
    if (data.category !== undefined) transformedData.category = data.category;
    if (data.vendor !== undefined) transformedData.vendor = data.vendor;
    if (data.account !== undefined) transformedData.account = data.account;
    if (data.isActive !== undefined) transformedData.is_active = data.isActive;

    const response = await fetch(`${API_BASE_URL}/api/recurring-expenses/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transformedData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update recurring expense');
    }

    const result = await response.json();
    return result.data;
  },

  async deleteRecurringExpense(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/recurring-expenses/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete recurring expense');
    }
  },

  async searchRecurringExpenses(query: string): Promise<RecurringExpense[]> {
    const response = await fetch(`${API_BASE_URL}/api/recurring-expenses/search?query=${encodeURIComponent(query)}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to search recurring expenses');
    }

    const result = await response.json();
    return result.data || [];
  },

  async toggleRecurringExpense(id: string, isActive: boolean): Promise<RecurringExpense> {
    const response = await fetch(`${API_BASE_URL}/api/recurring-expenses/${id}/toggle`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isActive }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to toggle recurring expense');
    }

    const result = await response.json();
    return result.data;
  },
};
