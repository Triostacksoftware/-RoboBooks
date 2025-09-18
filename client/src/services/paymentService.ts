import { api } from '../lib/api';

export interface Payment {
  _id: string;
  paymentNumber: string;
  vendorId: string;
  vendorName: string;
  vendorEmail?: string;
  paymentDate: string;
  amount: number;
  currency: string;
  paymentMethod: 'cash' | 'check' | 'bank_transfer' | 'credit_card' | 'debit_card' | 'upi' | 'other';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  reference?: string;
  notes?: string;
  billIds?: string[];
  createdBy: string;
  processedAt?: string;
  customFields?: { [key: string]: any };
  createdAt: string;
  updatedAt: string;
}

export interface PaymentStats {
  totalPayments: number;
  pendingPayments: number;
  completedPayments: number;
  failedPayments: number;
  cancelledPayments: number;
  totalAmount: number;
  averagePaymentValue: number;
  totalPendingAmount: number;
}

export interface CreatePaymentData {
  vendorId: string;
  paymentDate: string;
  amount: number;
  currency?: string;
  paymentMethod: Payment['paymentMethod'];
  reference?: string;
  notes?: string;
  billIds?: string[];
}

class PaymentService {
  private baseUrl = '/api/payments';

  async getPayments(): Promise<Payment[]> {
    try {
      const response = await api<{ success: boolean; data: Payment[] }>(`${this.baseUrl}`);
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to fetch payments');
    } catch (error) {
      console.error('Error fetching payments:', error);
      return this.getMockPayments();
    }
  }

  async getPaymentById(id: string): Promise<Payment> {
    try {
      const response = await api<{ success: boolean; data: Payment }>(`${this.baseUrl}/${id}`);
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to fetch payment');
    } catch (error) {
      console.error('Error fetching payment:', error);
      throw error;
    }
  }

  async createPayment(data: CreatePaymentData): Promise<Payment> {
    try {
      const response = await api<{ success: boolean; data: Payment }>(`${this.baseUrl}`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to create payment');
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  async updatePayment(id: string, data: Partial<CreatePaymentData>): Promise<Payment> {
    try {
      const response = await api<{ success: boolean; data: Payment }>(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to update payment');
    } catch (error) {
      console.error('Error updating payment:', error);
      throw error;
    }
  }

  async deletePayment(id: string): Promise<void> {
    try {
      const response = await api<{ success: boolean }>(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      });
      if (!response.success) {
        throw new Error('Failed to delete payment');
      }
    } catch (error) {
      console.error('Error deleting payment:', error);
      throw error;
    }
  }

  async searchPayments(query: string): Promise<Payment[]> {
    try {
      const response = await api<{ success: boolean; data: Payment[] }>(`${this.baseUrl}/search?query=${encodeURIComponent(query)}`);
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to search payments');
    } catch (error) {
      console.error('Error searching payments:', error);
      return [];
    }
  }

  async getPaymentStats(): Promise<PaymentStats> {
    try {
      const response = await api<{ success: boolean; data: PaymentStats }>(`${this.baseUrl}/stats`);
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to fetch payment stats');
    } catch (error) {
      console.error('Error fetching payment stats:', error);
      return this.getMockStats();
    }
  }

  async importPayments(file: File): Promise<Payment[]> {
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
        throw new Error('Failed to import payments');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error importing payments:', error);
      return this.getMockPayments();
    }
  }

  async exportPayments(payments: Payment[]): Promise<void> {
    try {
      const csvContent = this.convertToCSV(payments);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payments_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting payments:', error);
      throw error;
    }
  }

  async updatePaymentStatus(id: string, status: Payment['status']): Promise<Payment> {
    try {
      const response = await api<{ success: boolean; data: Payment }>(`${this.baseUrl}/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to update payment status');
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }

  async processPayment(id: string): Promise<Payment> {
    try {
      const response = await api<{ success: boolean; data: Payment }>(`${this.baseUrl}/${id}/process`, {
        method: 'POST',
      });
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to process payment');
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  private convertToCSV(payments: Payment[]): string {
    const headers = [
      'Payment Number',
      'Vendor Name',
      'Payment Date',
      'Amount',
      'Currency',
      'Payment Method',
      'Status',
      'Reference',
      'Created At'
    ];

    const rows = payments.map(payment => [
      payment.paymentNumber,
      payment.vendorName,
      payment.paymentDate,
      payment.amount,
      payment.currency,
      payment.paymentMethod,
      payment.status,
      payment.reference || '',
      payment.createdAt
    ]);

    return [headers, ...rows].map(row =>
      row.map(field => `"${field}"`).join(',')
    ).join('\n');
  }

  private getMockPayments(): Payment[] {
    return [
      {
        _id: '1',
        paymentNumber: 'PAY-2024-001',
        vendorId: 'vendor1',
        vendorName: 'ABC Corporation',
        vendorEmail: 'billing@abccorp.com',
        paymentDate: '2024-01-20',
        amount: 1180.00,
        currency: 'INR',
        paymentMethod: 'bank_transfer',
        status: 'completed',
        reference: 'TXN123456789',
        notes: 'Payment for office supplies bill',
        billIds: ['bill1'],
        createdBy: 'user1',
        processedAt: '2024-01-20T10:00:00Z',
        createdAt: '2024-01-20T10:00:00Z',
        updatedAt: '2024-01-20T10:00:00Z',
      },
      {
        _id: '2',
        paymentNumber: 'PAY-2024-002',
        vendorId: 'vendor2',
        vendorName: 'XYZ Suppliers',
        vendorEmail: 'billing@xyzsuppliers.com',
        paymentDate: '2024-01-21',
        amount: 2950.00,
        currency: 'INR',
        paymentMethod: 'upi',
        status: 'pending',
        reference: 'UPI123456789',
        notes: 'Payment for equipment purchase',
        billIds: ['bill2'],
        createdBy: 'user1',
        createdAt: '2024-01-21T10:00:00Z',
        updatedAt: '2024-01-21T10:00:00Z',
      },
      {
        _id: '3',
        paymentNumber: 'PAY-2024-003',
        vendorId: 'vendor3',
        vendorName: 'Tech Solutions',
        vendorEmail: 'billing@techsolutions.com',
        paymentDate: '2024-01-22',
        amount: 590.00,
        currency: 'INR',
        paymentMethod: 'credit_card',
        status: 'completed',
        reference: 'CC123456789',
        notes: 'Payment for software license',
        billIds: ['bill3'],
        createdBy: 'user1',
        processedAt: '2024-01-22T10:00:00Z',
        createdAt: '2024-01-22T10:00:00Z',
        updatedAt: '2024-01-22T10:00:00Z',
      },
    ];
  }

  private getMockStats(): PaymentStats {
    return {
      totalPayments: 3,
      pendingPayments: 1,
      completedPayments: 2,
      failedPayments: 0,
      cancelledPayments: 0,
      totalAmount: 4720.00,
      averagePaymentValue: 1573.33,
      totalPendingAmount: 2950.00,
    };
  }
}

export const paymentService = new PaymentService();
