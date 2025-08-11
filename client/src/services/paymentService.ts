import { apiClient } from './apiClient';

export interface Payment {
  _id: string;
  paymentNumber: string;
  date: string;
  referenceNumber: string;
  customer: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  customerName: string;
  invoice: {
    _id: string;
    invoiceNumber: string;
    amount: number;
    dueDate: string;
  };
  invoiceNumber: string;
  mode: string;
  amount: number;
  unusedAmount: number;
  bankAccount?: {
    _id: string;
    accountName: string;
    accountNumber: string;
  };
  chequeNumber?: string;
  transactionId?: string;
  notes?: string;
  status: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  updatedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentRequest {
  customerId: string;
  invoiceId: string;
  amount: number;
  mode: string;
  referenceNumber?: string;
  bankAccountId?: string;
  chequeNumber?: string;
  transactionId?: string;
  notes?: string;
  date?: string;
  unusedAmount?: number;
}

export interface UpdatePaymentRequest {
  customerId?: string;
  invoiceId?: string;
  amount?: number;
  mode?: string;
  referenceNumber?: string;
  bankAccountId?: string;
  chequeNumber?: string;
  transactionId?: string;
  notes?: string;
  date?: string;
  unusedAmount?: number;
  status?: string;
}

export interface PaymentFilters {
  page?: number;
  limit?: number;
  customerId?: string;
  invoiceId?: string;
  mode?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaymentStats {
  summary: {
    totalPayments: number;
    totalAmount: number;
    totalUnusedAmount: number;
    averageAmount: number;
    minAmount: number;
    maxAmount: number;
  };
  byMode: Array<{
    _id: string;
    count: number;
    totalAmount: number;
  }>;
  byStatus: Array<{
    _id: string;
    count: number;
    totalAmount: number;
  }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

class PaymentService {
  private baseUrl = '/api/payments';

  // Create new payment
  async createPayment(paymentData: CreatePaymentRequest): Promise<ApiResponse<Payment>> {
    const response = await apiClient.post(this.baseUrl, paymentData);
    return response.data;
  }

  // Get all payments with filtering and pagination
  async getPayments(filters: PaymentFilters = {}): Promise<ApiResponse<PaginatedResponse<Payment>>> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await apiClient.get(`${this.baseUrl}?${params.toString()}`);
    return response.data;
  }

  // Get single payment by ID
  async getPaymentById(id: string): Promise<ApiResponse<Payment>> {
    const response = await apiClient.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  // Update payment
  async updatePayment(id: string, paymentData: UpdatePaymentRequest): Promise<ApiResponse<Payment>> {
    const response = await apiClient.put(`${this.baseUrl}/${id}`, paymentData);
    return response.data;
  }

  // Delete payment
  async deletePayment(id: string): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.delete(`${this.baseUrl}/${id}`);
    return response.data;
  }

  // Get payment statistics
  async getPaymentStats(filters: {
    startDate?: string;
    endDate?: string;
    customerId?: string;
    mode?: string;
  } = {}): Promise<ApiResponse<PaymentStats>> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await apiClient.get(`${this.baseUrl}/stats?${params.toString()}`);
    return response.data;
  }

  // Get payments by customer
  async getPaymentsByCustomer(
    customerId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<PaginatedResponse<Payment>>> {
    const response = await apiClient.get(
      `${this.baseUrl}/customer/${customerId}?page=${page}&limit=${limit}`
    );
    return response.data;
  }

  // Get payments by invoice
  async getPaymentsByInvoice(invoiceId: string): Promise<ApiResponse<Payment[]>> {
    const response = await apiClient.get(`${this.baseUrl}/invoice/${invoiceId}`);
    return response.data;
  }

  // Bulk update payments
  async bulkUpdatePayments(
    paymentIds: string[],
    updateData: UpdatePaymentRequest
  ): Promise<ApiResponse<{ matchedCount: number; modifiedCount: number }>> {
    const response = await apiClient.put(`${this.baseUrl}/bulk/update`, {
      paymentIds,
      updateData
    });
    return response.data;
  }

  // Export payments
  async exportPayments(filters: {
    startDate?: string;
    endDate?: string;
    customerId?: string;
    mode?: string;
    status?: string;
    format?: 'csv' | 'json';
  } = {}): Promise<Blob | ApiResponse<any[]>> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await apiClient.get(`${this.baseUrl}/export/data?${params.toString()}`, {
      responseType: filters.format === 'csv' ? 'blob' : 'json'
    });

    if (filters.format === 'csv') {
      return response.data;
    } else {
      return response.data;
    }
  }

  // Download CSV file
  async downloadPaymentsCSV(filters: PaymentFilters = {}): Promise<void> {
    try {
      const csvBlob = await this.exportPayments({ ...filters, format: 'csv' }) as Blob;
      
      const url = window.URL.createObjectURL(csvBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `payments-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading CSV:', error);
      throw error;
    }
  }

  // Get payment modes for dropdown
  getPaymentModes(): string[] {
    return [
      'Cash',
      'Bank Transfer',
      'Cheque',
      'Credit Card',
      'UPI',
      'Debit Card',
      'Online Payment',
      'Other'
    ];
  }

  // Get payment statuses for dropdown
  getPaymentStatuses(): string[] {
    return ['Pending', 'Completed', 'Failed', 'Cancelled'];
  }

  // Format amount for display
  formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  }

  // Format date for display
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Validate payment data
  validatePaymentData(data: CreatePaymentRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.customerId) errors.push('Customer is required');
    if (!data.invoiceId) errors.push('Invoice is required');
    if (!data.amount || data.amount <= 0) errors.push('Amount must be greater than 0');
    if (!data.mode) errors.push('Payment mode is required');

    // Validate bank account for certain modes
    if (['Bank Transfer', 'Cheque'].includes(data.mode) && !data.bankAccountId) {
      errors.push('Bank account is required for this payment mode');
    }

    // Validate cheque number for cheque payments
    if (data.mode === 'Cheque' && !data.chequeNumber) {
      errors.push('Cheque number is required for cheque payments');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const paymentService = new PaymentService();
export default paymentService;
