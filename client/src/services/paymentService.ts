export interface Payment {
  _id: string;
  paymentNumber: string;
  vendorId: string;
  vendorName: string;
  billId?: string;
  billNumber?: string;
  paymentDate: string;
    amount: number;
  paymentMethod: 'cash' | 'check' | 'bank_transfer' | 'credit_card' | 'other';
  reference?: string;
  notes?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  currency: string;
  bankAccount?: string;
  checkNumber?: string;
  createdBy: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentData {
  vendorId: string;
  billId?: string;
  paymentDate: string;
  amount: number;
  paymentMethod: 'cash' | 'check' | 'bank_transfer' | 'credit_card' | 'other';
  reference?: string;
  notes?: string;
  currency?: string;
  bankAccount?: string;
  checkNumber?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const paymentService = {
  async getPayments(): Promise<Payment[]> {
    const response = await fetch(`${API_BASE_URL}/api/payments`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch payments');
    }

    const result = await response.json();
    return result.data || [];
  },

  async getPaymentById(id: string): Promise<Payment> {
    const response = await fetch(`${API_BASE_URL}/api/payments/${id}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch payment');
    }

    const result = await response.json();
    return result.data;
  },

  async createPayment(data: CreatePaymentData): Promise<Payment> {
    const response = await fetch(`${API_BASE_URL}/api/payments`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create payment');
    }

    const result = await response.json();
    return result.data;
  },

  async updatePayment(id: string, data: Partial<CreatePaymentData>): Promise<Payment> {
    const response = await fetch(`${API_BASE_URL}/api/payments/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update payment');
    }

    const result = await response.json();
    return result.data;
  },

  async deletePayment(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/payments/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete payment');
    }
  },

  async searchPayments(query: string): Promise<Payment[]> {
    const response = await fetch(`${API_BASE_URL}/api/payments/search?query=${encodeURIComponent(query)}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to search payments');
    }

    const result = await response.json();
    return result.data || [];
  },

  async updatePaymentStatus(id: string, status: Payment['status']): Promise<Payment> {
    const response = await fetch(`${API_BASE_URL}/api/payments/${id}/status`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update payment status');
    }

    const result = await response.json();
    return result.data;
  },
};