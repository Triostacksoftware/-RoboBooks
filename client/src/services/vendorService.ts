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
  customFields?: { [key: string]: any };
  createdAt: string;
  updatedAt: string;
}

export interface VendorStats {
  totalVendors: number;
  activeVendors: number;
  inactiveVendors: number;
  totalPayables: number;
  totalCredits: number;
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

import { api } from '../lib/api';

class VendorService {
  private baseUrl = '/api/vendors';

  async getVendors(): Promise<Vendor[]> {
    try {
      const response = await api<{ success: boolean; data: Vendor[] }>(`${this.baseUrl}`);
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to fetch vendors');
    } catch (error) {
      console.error('Error fetching vendors:', error);
      // Return mock data for development
      return this.getMockVendors();
    }
  }

  async getVendorById(id: string): Promise<Vendor> {
    try {
      const response = await api<{ success: boolean; data: Vendor }>(`${this.baseUrl}/${id}`);
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to fetch vendor');
    } catch (error) {
      console.error('Error fetching vendor:', error);
      throw error;
    }
  }

  async createVendor(data: CreateVendorData): Promise<Vendor> {
    try {
      const response = await api<{ success: boolean; data: Vendor }>(`${this.baseUrl}`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to create vendor');
    } catch (error) {
      console.error('Error creating vendor:', error);
      throw error;
    }
  }

  async updateVendor(id: string, data: Partial<CreateVendorData>): Promise<Vendor> {
    try {
      const response = await api<{ success: boolean; data: Vendor }>(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to update vendor');
    } catch (error) {
      console.error('Error updating vendor:', error);
      throw error;
    }
  }

  async deleteVendor(id: string): Promise<void> {
    try {
      const response = await api<{ success: boolean }>(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      });
      if (!response.success) {
        throw new Error('Failed to delete vendor');
      }
    } catch (error) {
      console.error('Error deleting vendor:', error);
      throw error;
    }
  }

  async searchVendors(query: string): Promise<Vendor[]> {
    try {
      const response = await api<{ success: boolean; data: Vendor[] }>(`${this.baseUrl}/search?query=${encodeURIComponent(query)}`);
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to search vendors');
    } catch (error) {
      console.error('Error searching vendors:', error);
      return [];
    }
  }

  async getVendorStats(): Promise<VendorStats> {
    try {
      const response = await api<{ success: boolean; data: VendorStats }>(`${this.baseUrl}/stats`);
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to fetch vendor stats');
    } catch (error) {
      console.error('Error fetching vendor stats:', error);
      // Return mock stats for development
      return this.getMockStats();
    }
  }

  async importVendors(file: File): Promise<Vendor[]> {
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
        throw new Error('Failed to import vendors');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error importing vendors:', error);
      // Return mock data for development
      return this.getMockVendors();
    }
  }

  async exportVendors(vendors: Vendor[]): Promise<void> {
    try {
      const csvContent = this.convertToCSV(vendors);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vendors_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting vendors:', error);
      throw error;
    }
  }

  private convertToCSV(vendors: Vendor[]): string {
    const headers = [
      'Name',
      'Company Name',
      'Display Name',
      'Email',
      'Phone',
      'GSTIN',
      'Type',
      'Status',
      'Payables',
      'Unused Credits',
      'Created At'
    ];

    const rows = vendors.map(vendor => [
      vendor.name,
      vendor.companyName || '',
      vendor.displayName,
      vendor.email || '',
      vendor.phone || '',
      vendor.gstin,
      vendor.type || 'business',
      vendor.status || 'active',
      vendor.payables || 0,
      vendor.unusedCredits || 0,
      vendor.createdAt
    ]);

    return [headers, ...rows].map(row => 
      row.map(field => `"${field}"`).join(',')
    ).join('\n');
  }

  // Mock data for development
  private getMockVendors(): Vendor[] {
    return [
      {
        _id: '1',
        name: 'ABC Corporation',
        gstin: '29ABCDE1234F1Z5',
        companyName: 'ABC Corporation Ltd',
        displayName: 'ABC Corp',
        email: 'contact@abccorp.com',
        phone: '+91-9876543210',
        type: 'business',
        status: 'active',
        payables: 15000.00,
        unusedCredits: 5000.00,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      },
      {
        _id: '2',
        name: 'XYZ Suppliers',
        gstin: '27XYZAB5678G2H6',
        companyName: 'XYZ Suppliers Pvt Ltd',
        displayName: 'XYZ Suppliers',
        email: 'info@xyzsuppliers.com',
        phone: '+91-9876543211',
        type: 'business',
        status: 'active',
        payables: 25000.00,
        unusedCredits: 0.00,
        createdAt: '2024-01-16T10:00:00Z',
        updatedAt: '2024-01-16T10:00:00Z',
      },
      {
        _id: '3',
        name: 'John Doe',
        gstin: '29JOHND1234E5F7',
        displayName: 'John Doe',
        email: 'john.doe@email.com',
        phone: '+91-9876543212',
        type: 'individual',
        status: 'inactive',
        payables: 5000.00,
        unusedCredits: 2000.00,
        createdAt: '2024-01-17T10:00:00Z',
        updatedAt: '2024-01-17T10:00:00Z',
      },
    ];
  }

  private getMockStats(): VendorStats {
    return {
      totalVendors: 3,
      activeVendors: 2,
      inactiveVendors: 1,
      totalPayables: 45000.00,
      totalCredits: 7000.00,
    };
  }
}

export const vendorService = new VendorService();
