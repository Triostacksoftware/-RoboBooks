const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface Customer {
  _id: string;
  customerType: 'Business' | 'Individual';
  salutation: string;
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
  contactPersons: Array<{
    name: string;
    email: string;
    phone: string;
    designation: string;
  }>;
  receivables: number;
  unusedCredits: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CustomerSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'inactive';
  type?: 'Business' | 'Individual';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface CustomerSearchResponse {
  customers: Customer[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

class CustomerService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}/api/customers${endpoint}`;
      
      const defaultOptions: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        ...options,
      };

      const response = await fetch(url, defaultOptions);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Search customers with filters and pagination
  async searchCustomers(params: CustomerSearchParams = {}): Promise<ApiResponse<CustomerSearchResponse>> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    if (params.type) queryParams.append('type', params.type);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    return this.makeRequest(`?${queryParams.toString()}`);
  }

  // Get customer by ID
  async getCustomerById(id: string): Promise<ApiResponse<Customer>> {
    return this.makeRequest(`/${id}`);
  }

  // Get all active customers (for dropdowns)
  async getActiveCustomers(): Promise<ApiResponse<Customer[]>> {
    return this.makeRequest('?status=active&limit=1000&sortBy=displayName&sortOrder=asc');
  }
}

export const customerService = new CustomerService();
export type { Customer, CustomerSearchParams, CustomerSearchResponse };
