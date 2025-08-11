export interface Vendor {
  _id: string;
  name: string;
  gstin: string;
  companyName?: string;
  displayName: string;
  email?: string;
  phone?: string;
  workPhone?: string;
  mobile?: string;
  address?: string;
  contactInfo?: string;
  type?: 'business' | 'individual';
  salutation?: string;
  firstName?: string;
  lastName?: string;
  pan?: string;
  msmeRegistered?: boolean;
  currency?: string;
  openingBalance?: number;
  paymentTerms?: string;
  tds?: string;
  enablePortal?: boolean;
  portalLanguage?: string;
  status?: 'active' | 'inactive';
  contactPersons?: Array<{
    name: string;
    email: string;
    phone: string;
    designation: string;
  }>;
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  payables?: number;
  unusedCredits?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVendorData {
  name: string;
  gstin: string;
  companyName?: string;
  displayName: string;
  email?: string;
  phone?: string;
  workPhone?: string;
  mobile?: string;
  address?: string;
  contactInfo?: string;
  type?: 'business' | 'individual';
  salutation?: string;
  firstName?: string;
  lastName?: string;
  pan?: string;
  msmeRegistered?: boolean;
  currency?: string;
  openingBalance?: number;
  paymentTerms?: string;
  tds?: string;
  enablePortal?: boolean;
  portalLanguage?: string;
  status?: 'active' | 'inactive';
  contactPersons?: Array<{
    name: string;
    email: string;
    phone: string;
    designation: string;
  }>;
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const vendorService = {
  async getVendors(): Promise<Vendor[]> {
    const response = await fetch(`${API_BASE_URL}/api/vendors`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch vendors');
    }

    const result = await response.json();
    return result.data || [];
  },

  async getVendorById(id: string): Promise<Vendor> {
    const response = await fetch(`${API_BASE_URL}/api/vendors/${id}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch vendor');
    }

    const result = await response.json();
    return result.data;
  },

  async createVendor(data: CreateVendorData): Promise<Vendor> {
    const response = await fetch(`${API_BASE_URL}/api/vendors`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create vendor');
    }

    const result = await response.json();
    return result.data;
  },

  async updateVendor(id: string, data: Partial<CreateVendorData>): Promise<Vendor> {
    const response = await fetch(`${API_BASE_URL}/api/vendors/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update vendor');
    }

    const result = await response.json();
    return result.data;
  },

  async deleteVendor(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/vendors/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete vendor');
    }
  },

  async searchVendors(query: string): Promise<Vendor[]> {
    const response = await fetch(`${API_BASE_URL}/api/vendors/search?query=${encodeURIComponent(query)}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to search vendors');
    }

    const result = await response.json();
    return result.data || [];
  },
};
