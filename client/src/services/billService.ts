export interface Bill {
  _id: string;
  billNumber: string;
  vendorId: string;
  vendorName: string;
  vendorEmail?: string;
  billDate: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'received' | 'overdue' | 'paid' | 'cancelled';
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  currency: string;
  notes?: string;
  terms?: string;
  items: Array<{
    itemId: string;
    itemName: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    taxRate?: number;
    taxAmount?: number;
  }>;
  attachments?: string[];
  createdBy: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBillData {
  vendorId: string;
  billDate: string;
  dueDate: string;
  notes?: string;
  terms?: string;
  items: Array<{
    itemId: string;
    itemName: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    taxRate?: number;
  }>;
  currency?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const billService = {
  async getBills(): Promise<Bill[]> {
    const response = await fetch(`${API_BASE_URL}/api/bills`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch bills');
    }

    const result = await response.json();
    return result.data || [];
  },

  async getBillById(id: string): Promise<Bill> {
    const response = await fetch(`${API_BASE_URL}/api/bills/${id}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch bill');
    }

    const result = await response.json();
    return result.data;
  },

  async createBill(data: CreateBillData): Promise<Bill> {
    // Transform camelCase to snake_case for backend
    const transformedData = {
      vendor_id: data.vendorId,
      total: data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0),
      status: 'pending', // Default status
      due_date: data.dueDate,
    };

    const response = await fetch(`${API_BASE_URL}/api/bills`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transformedData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create bill');
    }

    const result = await response.json();
    return result.data;
  },

  async updateBill(id: string, data: Partial<CreateBillData>): Promise<Bill> {
    // Transform camelCase to snake_case for backend
    const transformedData: any = {};
    if (data.vendorId !== undefined) transformedData.vendor_id = data.vendorId;
    if (data.dueDate !== undefined) transformedData.due_date = data.dueDate;
    if (data.items !== undefined) {
      transformedData.total = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    }

    const response = await fetch(`${API_BASE_URL}/api/bills/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transformedData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update bill');
    }

    const result = await response.json();
    return result.data;
  },

  async deleteBill(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/bills/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete bill');
    }
  },

  async searchBills(query: string): Promise<Bill[]> {
    const response = await fetch(`${API_BASE_URL}/api/bills/search?query=${encodeURIComponent(query)}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to search bills');
    }

    const result = await response.json();
    return result.data || [];
  },

  async updateBillStatus(id: string, status: Bill['status']): Promise<Bill> {
    const response = await fetch(`${API_BASE_URL}/api/bills/${id}/status`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update bill status');
    }

    const result = await response.json();
    return result.data;
  },

  async markBillAsPaid(id: string, paidAmount: number): Promise<Bill> {
    const response = await fetch(`${API_BASE_URL}/api/bills/${id}/pay`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paidAmount }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to mark bill as paid');
    }

    const result = await response.json();
    return result.data;
  },
};
