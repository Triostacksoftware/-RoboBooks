import { api } from '../api';

export interface Customer {
  _id: string;
  customerType: 'Business' | 'Individual';
  salutation?: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  displayName: string;
  email: string;
  workPhone?: string;
  mobile?: string;
  pan?: string;
  currency: string;
  openingBalance: number;
  paymentTerms: string;
  portalEnabled: boolean;
  portalLanguage: string;
  billingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  shippingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  contactPersons?: Array<{
    name: string;
    email: string;
    phone: string;
    designation: string;
  }>;
  receivables: number;
  unusedCredits: number;
  isActive: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  _id: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  buyerGstin?: string;
  buyerAddress?: string;
  sellerName?: string;
  sellerEmail?: string;
  sellerPhone?: string;
  sellerGstin?: string;
  sellerAddress?: string;
  invoiceNumber: string;
  orderNumber?: string;
  invoiceDate: string;
  terms: string;
  dueDate: string;
  salesperson?: string;
  subject?: string;
  project?: string;
  items: Array<{
    itemId?: string;
    details: string;
    description?: string;
    quantity: number;
    unit: string;
    rate: number;
    amount: number;
    taxRate: number;
    taxAmount: number;
  }>;
  subTotal: number;
  discount: number;
  discountType: 'percentage' | 'amount';
  discountAmount: number;
  taxAmount: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  additionalTaxType?: 'TDS' | 'TCS' | null;
  additionalTaxId?: string;
  additionalTaxRate: number;
  additionalTaxAmount: number;
  adjustment: number;
  total: number;
  paymentTerms?: string;
  paymentMethod?: string;
  amountPaid: number;
  balanceDue: number;
  customerNotes: string;
  termsConditions?: string;
  internalNotes?: string;
  files?: Array<{
    fileName: string;
    filePath: string;
    fileSize: number;
    uploadedAt: string;
  }>;
  status: 'Draft' | 'Sent' | 'Viewed' | 'Unpaid' | 'Paid' | 'Overdue' | 'Partially Paid' | 'Cancelled' | 'Void';
  emailSent: boolean;
  emailSentAt?: string;
  lastViewedAt?: string;
  remindersSent: number;
  currency: string;
  exchangeRate: number;
  created_at: string;
  updated_at: string;
}

export interface CustomerResponse {
  success: boolean;
  data: Customer[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface InvoiceResponse {
  success: boolean;
  data: Invoice[];
  message: string;
}

export interface CustomerSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'inactive';
  type?: 'Business' | 'Individual';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class CustomerInvoiceService {
  /**
   * Fetch all customers with optional filtering and pagination
   */
  static async getCustomers(params: CustomerSearchParams = {}): Promise<CustomerResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('status', params.status);
      if (params.type) queryParams.append('type', params.type);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const response = await api<CustomerResponse>(`/api/customers?${queryParams.toString()}`);
      return response;
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw new Error('Failed to fetch customers');
    }
  }

  /**
   * Fetch a single customer by ID
   */
  static async getCustomerById(id: string): Promise<Customer> {
    try {
      const response = await api<{ success: boolean; data: Customer }>(`/api/customers/${id}`);
      if (!response.success) {
        throw new Error('Failed to fetch customer');
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching customer:', error);
      throw new Error('Failed to fetch customer');
    }
  }

  /**
   * Search customers with a query string
   */
  static async searchCustomers(query: string, limit: number = 10): Promise<Customer[]> {
    try {
      const response = await api<{ success: boolean; data: Customer[] }>(`/api/customers/search?q=${encodeURIComponent(query)}&limit=${limit}`);
      if (!response.success) {
        throw new Error('Failed to search customers');
      }
      return response.data;
    } catch (error) {
      console.error('Error searching customers:', error);
      throw new Error('Failed to search customers');
    }
  }

  /**
   * Fetch all invoices
   */
  static async getInvoices(): Promise<InvoiceResponse> {
    try {
      const response = await api<InvoiceResponse>('/api/invoices');
      return response;
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw new Error('Failed to fetch invoices');
    }
  }

  /**
   * Fetch a single invoice by ID
   */
  static async getInvoiceById(id: string): Promise<Invoice> {
    try {
      const response = await api<{ success: boolean; data: Invoice; message: string }>(`/api/invoices/${id}`);
      if (!response.success) {
        throw new Error('Failed to fetch invoice');
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching invoice:', error);
      throw new Error('Failed to fetch invoice');
    }
  }

  /**
   * Get customer statistics
   */
  static async getCustomerStats(): Promise<{
    totalCustomers: number;
    activeCustomers: number;
    businessCustomers: number;
    individualCustomers: number;
    customersWithReceivables: number;
  }> {
    try {
      const response = await api<{ success: boolean; data: any }>('/api/customers/stats');
      if (!response.success) {
        throw new Error('Failed to fetch customer statistics');
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching customer statistics:', error);
      throw new Error('Failed to fetch customer statistics');
    }
  }

  /**
   * Get customers by type (Business or Individual)
   */
  static async getCustomersByType(type: 'Business' | 'Individual', page: number = 1, limit: number = 25): Promise<CustomerResponse> {
    try {
      const response = await api<CustomerResponse>(`/api/customers/type/${type}?page=${page}&limit=${limit}`);
      return response;
    } catch (error) {
      console.error('Error fetching customers by type:', error);
      throw new Error('Failed to fetch customers by type');
    }
  }
}

export default CustomerInvoiceService;
