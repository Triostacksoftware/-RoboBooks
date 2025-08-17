import { apiClient } from './apiClient';

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  customer: {
    _id: string;
    name: string;
    email: string;
  };
  customerName: string;
  date: string;
  dueDate: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  items: InvoiceItem[];
  notes: string;
  terms: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  _id: string;
  item: {
    _id: string;
    name: string;
    description: string;
  };
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
}

export interface CreateInvoiceRequest {
  customerId: string;
  date: string;
  dueDate: string;
  items: Omit<InvoiceItem, '_id' | 'item'>[];
  notes?: string;
  terms?: string;
}

export interface UpdateInvoiceRequest {
  customerId?: string;
  date?: string;
  dueDate?: string;
  items?: Omit<InvoiceItem, '_id' | 'item'>[];
  notes?: string;
  terms?: string;
  status?: string;
}

export interface InvoiceFilters {
  page?: number;
  limit?: number;
  customerId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
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

class InvoiceService {
  private baseUrl = '/api/invoices';

  // Get all invoices with filtering and pagination
  async getInvoices(filters: InvoiceFilters = {}): Promise<ApiResponse<PaginatedResponse<Invoice>>> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await apiClient.get(`${this.baseUrl}?${params.toString()}`);
    return response.data;
  }

  // Get single invoice by ID
  async getInvoiceById(id: string): Promise<ApiResponse<Invoice>> {
    const response = await apiClient.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  // Create new invoice
  async createInvoice(invoiceData: CreateInvoiceRequest): Promise<ApiResponse<Invoice>> {
    const response = await apiClient.post(this.baseUrl, invoiceData);
    return response.data;
  }

  // Update invoice
  async updateInvoice(id: string, invoiceData: UpdateInvoiceRequest): Promise<ApiResponse<Invoice>> {
    const response = await apiClient.put(`${this.baseUrl}/${id}`, invoiceData);
    return response.data;
  }

  // Delete invoice
  async deleteInvoice(id: string): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.delete(`${this.baseUrl}/${id}`);
    return response.data;
  }

  // Get invoices by customer
  async getInvoicesByCustomer(customerId: string): Promise<ApiResponse<Invoice[]>> {
    const response = await apiClient.get(`${this.baseUrl}/customer/${customerId}`);
    return response.data;
  }

  // Get unpaid invoices
  async getUnpaidInvoices(): Promise<ApiResponse<Invoice[]>> {
    const response = await apiClient.get(`${this.baseUrl}/unpaid`);
    return response.data;
  }

  // Get overdue invoices
  async getOverdueInvoices(): Promise<ApiResponse<Invoice[]>> {
    const response = await apiClient.get(`${this.baseUrl}/overdue`);
    return response.data;
  }

  // Mark invoice as sent
  async markInvoiceAsSent(id: string): Promise<ApiResponse<Invoice>> {
    const response = await apiClient.patch(`${this.baseUrl}/${id}/send`);
    return response.data;
  }

  // Mark invoice as paid
  async markInvoiceAsPaid(id: string): Promise<ApiResponse<Invoice>> {
    const response = await apiClient.patch(`${this.baseUrl}/${id}/paid`);
    return response.data;
  }

  // Get invoice statistics
  async getInvoiceStats(filters: {
    startDate?: string;
    endDate?: string;
    customerId?: string;
    status?: string;
  } = {}): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await apiClient.get(`${this.baseUrl}/stats?${params.toString()}`);
    return response.data;
  }

  // Validate invoice data
  validateInvoiceData(data: CreateInvoiceRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.customerId) {
      errors.push('Customer is required');
    }

    if (!data.date) {
      errors.push('Invoice date is required');
    }

    if (!data.dueDate) {
      errors.push('Due date is required');
    }

    if (!data.items || data.items.length === 0) {
      errors.push('At least one item is required');
    }

    // Validate items
    data.items?.forEach((item, index) => {
      if (!item.description || item.description.trim().length === 0) {
        errors.push(`Item ${index + 1}: Description is required`);
      }
      if (!item.quantity || item.quantity <= 0) {
        errors.push(`Item ${index + 1}: Quantity must be greater than 0`);
      }
      if (!item.rate || item.rate <= 0) {
        errors.push(`Item ${index + 1}: Rate must be greater than 0`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Calculate invoice totals
  calculateInvoiceTotals(items: Omit<InvoiceItem, '_id' | 'item'>[]): {
    amount: number;
    taxAmount: number;
    totalAmount: number;
  } {
    let amount = 0;
    let taxAmount = 0;

    items.forEach(item => {
      const itemAmount = item.quantity * item.rate;
      amount += itemAmount;
      taxAmount += (itemAmount * item.taxRate) / 100;
    });

    return {
      amount: Math.round(amount * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      totalAmount: Math.round((amount + taxAmount) * 100) / 100
    };
  }

  // Get invoice status options
  getInvoiceStatuses(): string[] {
    return ['draft', 'sent', 'paid', 'overdue', 'cancelled'];
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

  // Check if invoice is overdue
  isInvoiceOverdue(invoice: Invoice): boolean {
    if (invoice.status === 'paid' || invoice.status === 'cancelled') {
      return false;
    }
    return new Date(invoice.dueDate) < new Date();
  }

  // Get days until due
  getDaysUntilDue(dueDate: string): number {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
}

export const invoiceService = new InvoiceService();
export default invoiceService;
