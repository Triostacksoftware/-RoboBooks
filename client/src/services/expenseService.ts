import { api } from '../lib/api';

export interface Expense {
  _id: string;
  date: string;
  description: string;
  amount: number;
  vendor: string;
  account: string;
  status: "unbilled" | "invoiced" | "reimbursed" | "billable" | "non-billable";
  hasReceipt: boolean;
  billable: boolean;
  customer?: string;
  project?: string;
  category: string;
  paymentMethod: string;
  reference: string;
  notes?: string;
  customFields?: { [key: string]: any };
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseData {
  date: string;
  description: string;
  amount: number;
  vendor: string;
  account: string;
  category?: string;
  paymentMethod?: string;
  reference?: string;
  notes?: string;
  billable?: boolean;
  customer?: string;
  project?: string;
  hasReceipt?: boolean;
  customFields?: { [key: string]: any };
}

export interface ExpenseStats {
  totalExpenses: number;
  totalAmount: number;
  unbilledAmount: number;
  billableAmount: number;
  nonBillableAmount: number;
}

class ExpenseService {
  private baseUrl = '/api/expenses';

  async getExpenses(): Promise<Expense[]> {
    try {
      const response = await api<{ success: boolean; data: Expense[] }>(`${this.baseUrl}`);
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to fetch expenses');
    } catch (error) {
      console.error('Error fetching expenses:', error);
      // Return mock data for development
      return this.getMockExpenses();
    }
  }

  async getExpenseById(id: string): Promise<Expense> {
    try {
      const response = await api<{ success: boolean; data: Expense }>(`${this.baseUrl}/${id}`);
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to fetch expense');
    } catch (error) {
      console.error('Error fetching expense:', error);
      throw error;
    }
  }

  async getExpense(id: string): Promise<Expense> {
    return this.getExpenseById(id);
  }

  async createExpense(expenseData: CreateExpenseData): Promise<Expense> {
    try {
      console.log('💾 ExpenseService: Creating expense with data:', expenseData);
      const response = await api<{ success: boolean; data: Expense }>(`${this.baseUrl}`, {
        method: 'POST',
        body: JSON.stringify(expenseData),
      });
      console.log('💾 ExpenseService: API response:', response);
      if (response.success) {
        console.log('✅ ExpenseService: Expense created successfully:', response.data);
        return response.data;
      }
      throw new Error('Failed to create expense');
    } catch (error) {
      console.error('❌ ExpenseService: Error creating expense:', error);
      // Don't return mock data - let the error propagate
      throw error;
    }
  }

  async updateExpense(id: string, expenseData: Partial<CreateExpenseData>): Promise<Expense> {
    try {
      const response = await api<{ success: boolean; data: Expense }>(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(expenseData),
      });
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to update expense');
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  }

  async deleteExpense(id: string): Promise<void> {
    try {
      const response = await api<{ success: boolean }>(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      });
      if (!response.success) {
        throw new Error('Failed to delete expense');
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  }

  async getExpenseStats(): Promise<ExpenseStats> {
    try {
      const response = await api<{ success: boolean; data: ExpenseStats }>(`${this.baseUrl}/stats`);
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to fetch expense stats');
    } catch (error) {
      console.error('Error fetching expense stats:', error);
      // Return mock stats for development
      return this.getMockStats();
    }
  }

  async importExpenses(file: File): Promise<Expense[]> {
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
        throw new Error('Failed to import expenses');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error importing expenses:', error);
      // Return mock data for development
      return this.getMockExpenses();
    }
  }

  async exportExpenses(expenses: Expense[]): Promise<void> {
    try {
      const csvContent = this.convertToCSV(expenses);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting expenses:', error);
      throw error;
    }
  }

  async convertToInvoice(expenseId: string): Promise<void> {
    try {
      const response = await api<{ success: boolean }>(`${this.baseUrl}/${expenseId}/convert-to-invoice`, {
        method: 'POST',
      });
      if (!response.success) {
        throw new Error('Failed to convert expense to invoice');
      }
    } catch (error) {
      console.error('Error converting expense to invoice:', error);
      throw error;
    }
  }

  private convertToCSV(expenses: Expense[]): string {
    const headers = [
      'Date',
      'Description',
      'Amount',
      'Vendor',
      'Account',
      'Category',
      'Payment Method',
      'Reference',
      'Notes',
      'Billable',
      'Customer',
      'Project',
      'Status',
      'Has Receipt'
    ];

    const rows = expenses.map(expense => [
      expense.date,
      expense.description,
      expense.amount.toString(),
      expense.vendor,
      expense.account,
      expense.category,
      expense.paymentMethod,
      expense.reference,
      expense.notes || '',
      expense.billable ? 'Yes' : 'No',
      expense.customer || '',
      expense.project || '',
      expense.status,
      expense.hasReceipt ? 'Yes' : 'No'
    ]);

    return [headers, ...rows].map(row => 
      row.map(field => `"${field}"`).join(',')
    ).join('\n');
  }

  // Mock data for development
  private getMockExpenses(): Expense[] {
    return [
      {
        _id: '1',
        date: '2024-01-15',
        description: 'Office Supplies',
        amount: 150.00,
        vendor: 'Office Depot',
        account: 'Office Supplies',
        category: 'Office Supplies',
        paymentMethod: 'Credit Card',
        reference: 'REF001',
        notes: 'Monthly office supplies',
        status: 'unbilled',
        hasReceipt: true,
        billable: false,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      },
      {
        _id: '2',
        date: '2024-01-16',
        description: 'Client Lunch',
        amount: 75.50,
        vendor: 'Restaurant ABC',
        account: 'Meals & Entertainment',
        category: 'Meals & Entertainment',
        paymentMethod: 'Cash',
        reference: 'REF002',
        notes: 'Client meeting',
        status: 'unbilled',
        hasReceipt: true,
        billable: true,
        customer: 'ABC Corp',
        project: 'Project Alpha',
        createdAt: '2024-01-16T12:00:00Z',
        updatedAt: '2024-01-16T12:00:00Z',
      },
      {
        _id: '3',
        date: '2024-01-17',
        description: 'Software License',
        amount: 299.00,
        vendor: 'Software Inc',
        account: 'Software Subscriptions',
        category: 'Software & Subscriptions',
        paymentMethod: 'Credit Card',
        reference: 'REF003',
        notes: 'Annual subscription',
        status: 'invoiced',
        hasReceipt: true,
        billable: false,
        createdAt: '2024-01-17T09:00:00Z',
        updatedAt: '2024-01-17T09:00:00Z',
      },
      {
        _id: '4',
        date: '2024-01-18',
        description: 'Travel Expenses',
        amount: 450.00,
        vendor: 'Airline XYZ',
        account: 'Travel & Entertainment',
        category: 'Business Travel',
        paymentMethod: 'Credit Card',
        reference: 'REF004',
        notes: 'Client visit',
        status: 'reimbursed',
        hasReceipt: true,
        billable: true,
        customer: 'XYZ Corp',
        project: 'Project Beta',
        createdAt: '2024-01-18T14:00:00Z',
        updatedAt: '2024-01-18T14:00:00Z',
      },
      {
        _id: '5',
        date: '2024-01-19',
        description: 'Marketing Materials',
        amount: 200.00,
        vendor: 'Print Shop',
        account: 'Marketing',
        category: 'Marketing & Advertising',
        paymentMethod: 'Check',
        reference: 'REF005',
        notes: 'Brochures and flyers',
        status: 'unbilled',
        hasReceipt: false,
        billable: false,
        createdAt: '2024-01-19T11:00:00Z',
        updatedAt: '2024-01-19T11:00:00Z',
      },
    ];
  }

  private createMockExpense(expenseData: CreateExpenseData): Expense {
    return {
      _id: Date.now().toString(),
      ...expenseData,
      status: 'unbilled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  private getMockStats(): ExpenseStats {
    return {
      totalExpenses: 5,
      totalAmount: 1174.50,
      unbilledAmount: 425.50,
      billableAmount: 525.50,
      nonBillableAmount: 649.00,
    };
  }
}

export const expenseService = new ExpenseService();
