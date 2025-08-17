import { apiClient } from './apiClient';

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
  currency?: string;
  openingBalance?: number;
  paymentTerms?: string;
  portalEnabled?: boolean;
  portalLanguage?: string;
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
  receivables?: number;
  unusedCredits?: number;
  isActive: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerRequest {
  name: string;
  email: string;
  phone: string;
  address: string;
  gstin?: string;
  pan?: string;
}

export interface UpdateCustomerRequest {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  gstin?: string;
  pan?: string;
  status?: 'active' | 'inactive';
}

export interface CustomerFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
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

class CustomerService {
  private baseUrl = '/api/customers';

  // Get all customers with filtering and pagination
  async getCustomers(filters: CustomerFilters = {}): Promise<ApiResponse<PaginatedResponse<Customer>>> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await apiClient.get(`${this.baseUrl}?${params.toString()}`);
    return response.data;
  }

  // Get single customer by ID
  async getCustomerById(id: string): Promise<ApiResponse<Customer>> {
    const response = await apiClient.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  // Create new customer
  async createCustomer(customerData: CreateCustomerRequest): Promise<ApiResponse<Customer>> {
    const response = await apiClient.post(this.baseUrl, customerData);
    return response.data;
  }

  // Update customer
  async updateCustomer(id: string, customerData: UpdateCustomerRequest): Promise<ApiResponse<Customer>> {
    const response = await apiClient.put(`${this.baseUrl}/${id}`, customerData);
    return response.data;
  }

  // Delete customer
  async deleteCustomer(id: string): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.delete(`${this.baseUrl}/${id}`);
    return response.data;
  }

  // Search customers by name or email
  async searchCustomers(query: string): Promise<ApiResponse<Customer[]>> {
    const response = await apiClient.get(`${this.baseUrl}/search?q=${encodeURIComponent(query)}`);
    return response.data;
  }

  // Get active customers only
  async getActiveCustomers(): Promise<ApiResponse<Customer[]>> {
    const response = await apiClient.get(`${this.baseUrl}/active`);
    return response.data;
  }

  // Validate customer data
  validateCustomerData(data: CreateCustomerRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.name || data.name.trim().length === 0) {
      errors.push('Customer name is required');
    }

    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Valid email is required');
    }

    if (!data.phone || data.phone.trim().length === 0) {
      errors.push('Phone number is required');
    }

    if (!data.address || data.address.trim().length === 0) {
      errors.push('Address is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Format phone number for display
  formatPhone(phone: string): string {
    // Basic phone formatting for Indian numbers
    if (phone.length === 10) {
      return `${phone.slice(0, 5)} ${phone.slice(5, 10)}`;
    }
    return phone;
  }

  // Get customer status options
  getCustomerStatuses(): string[] {
    return ['active', 'inactive'];
  }
}

export const customerService = new CustomerService();
export default customerService;
