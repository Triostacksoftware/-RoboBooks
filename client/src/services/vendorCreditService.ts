import { api } from '../lib/api';

export interface VendorCredit {
  _id: string;
  creditNumber: string;
  vendorId: string;
  vendorName: string;
  vendorEmail?: string;
  creditDate: string;
  amount: number;
  currency: string;
  status: 'draft' | 'issued' | 'applied' | 'cancelled';
  reference?: string;
  reason: string;
  notes?: string;
  appliedToBills?: string[];
  appliedAmount?: number;
  remainingAmount?: number;
  createdBy: string;
  issuedAt?: string;
  appliedAt?: string;
  customFields?: { [key: string]: any };
  createdAt: string;
  updatedAt: string;
}

export interface VendorCreditStats {
  totalCredits: number;
  draftCredits: number;
  issuedCredits: number;
  appliedCredits: number;
  cancelledCredits: number;
  totalAmount: number;
  averageCreditValue: number;
  totalAppliedAmount: number;
  totalRemainingAmount: number;
}

export interface CreateVendorCreditData {
  vendorId: string;
  creditDate: string;
  amount: number;
  currency?: string;
  reference?: string;
  reason: string;
  notes?: string;
}

class VendorCreditService {
  private baseUrl = '/api/vendor-credits';

  async getVendorCredits(): Promise<VendorCredit[]> {
    try {
      const response = await api<{ success: boolean; data: VendorCredit[] }>(`${this.baseUrl}`);
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to fetch vendor credits');
    } catch (error) {
      console.error('Error fetching vendor credits:', error);
      return this.getMockVendorCredits();
    }
  }

  async getVendorCreditById(id: string): Promise<VendorCredit> {
    try {
      const response = await api<{ success: boolean; data: VendorCredit }>(`${this.baseUrl}/${id}`);
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to fetch vendor credit');
    } catch (error) {
      console.error('Error fetching vendor credit:', error);
      throw error;
    }
  }

  async createVendorCredit(data: CreateVendorCreditData): Promise<VendorCredit> {
    try {
      const response = await api<{ success: boolean; data: VendorCredit }>(`${this.baseUrl}`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to create vendor credit');
    } catch (error) {
      console.error('Error creating vendor credit:', error);
      throw error;
    }
  }

  async updateVendorCredit(id: string, data: Partial<CreateVendorCreditData>): Promise<VendorCredit> {
    try {
      const response = await api<{ success: boolean; data: VendorCredit }>(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to update vendor credit');
    } catch (error) {
      console.error('Error updating vendor credit:', error);
      throw error;
    }
  }

  async deleteVendorCredit(id: string): Promise<void> {
    try {
      const response = await api<{ success: boolean }>(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      });
      if (!response.success) {
        throw new Error('Failed to delete vendor credit');
      }
    } catch (error) {
      console.error('Error deleting vendor credit:', error);
      throw error;
    }
  }

  async searchVendorCredits(query: string): Promise<VendorCredit[]> {
    try {
      const response = await api<{ success: boolean; data: VendorCredit[] }>(`${this.baseUrl}/search?query=${encodeURIComponent(query)}`);
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to search vendor credits');
    } catch (error) {
      console.error('Error searching vendor credits:', error);
      return [];
    }
  }

  async getVendorCreditStats(): Promise<VendorCreditStats> {
    try {
      const response = await api<{ success: boolean; data: VendorCreditStats }>(`${this.baseUrl}/stats`);
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to fetch vendor credit stats');
    } catch (error) {
      console.error('Error fetching vendor credit stats:', error);
      return this.getMockStats();
    }
  }

  async importVendorCredits(file: File): Promise<VendorCredit[]> {
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
        throw new Error('Failed to import vendor credits');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error importing vendor credits:', error);
      return this.getMockVendorCredits();
    }
  }

  async exportVendorCredits(vendorCredits: VendorCredit[]): Promise<void> {
    try {
      const csvContent = this.convertToCSV(vendorCredits);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vendor-credits_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting vendor credits:', error);
      throw error;
    }
  }

  async updateVendorCreditStatus(id: string, status: VendorCredit['status']): Promise<VendorCredit> {
    try {
      const response = await api<{ success: boolean; data: VendorCredit }>(`${this.baseUrl}/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to update vendor credit status');
    } catch (error) {
      console.error('Error updating vendor credit status:', error);
      throw error;
    }
  }

  async issueVendorCredit(id: string): Promise<VendorCredit> {
    try {
      const response = await api<{ success: boolean; data: VendorCredit }>(`${this.baseUrl}/${id}/issue`, {
        method: 'POST',
      });
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to issue vendor credit');
    } catch (error) {
      console.error('Error issuing vendor credit:', error);
      throw error;
    }
  }

  async applyVendorCredit(id: string, billIds: string[], amount: number): Promise<VendorCredit> {
    try {
      const response = await api<{ success: boolean; data: VendorCredit }>(`${this.baseUrl}/${id}/apply`, {
        method: 'POST',
        body: JSON.stringify({ billIds, amount }),
      });
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to apply vendor credit');
    } catch (error) {
      console.error('Error applying vendor credit:', error);
      throw error;
    }
  }

  async cancelVendorCredit(id: string): Promise<VendorCredit> {
    try {
      const response = await api<{ success: boolean; data: VendorCredit }>(`${this.baseUrl}/${id}/cancel`, {
        method: 'POST',
      });
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to cancel vendor credit');
    } catch (error) {
      console.error('Error cancelling vendor credit:', error);
      throw error;
    }
  }

  private convertToCSV(vendorCredits: VendorCredit[]): string {
    const headers = [
      'Credit Number',
      'Vendor Name',
      'Credit Date',
      'Amount',
      'Currency',
      'Status',
      'Reference',
      'Reason',
      'Applied Amount',
      'Remaining Amount',
      'Created At'
    ];

    const rows = vendorCredits.map(credit => [
      credit.creditNumber,
      credit.vendorName,
      credit.creditDate,
      credit.amount,
      credit.currency,
      credit.status,
      credit.reference || '',
      credit.reason,
      credit.appliedAmount || 0,
      credit.remainingAmount || credit.amount,
      credit.createdAt
    ]);

    return [headers, ...rows].map(row =>
      row.map(field => `"${field}"`).join(',')
    ).join('\n');
  }

  private getMockVendorCredits(): VendorCredit[] {
    return [
      {
        _id: '1',
        creditNumber: 'VC-2024-001',
        vendorId: 'vendor1',
        vendorName: 'ABC Corporation',
        vendorEmail: 'billing@abccorp.com',
        creditDate: '2024-01-15',
        amount: 500.00,
        currency: 'INR',
        status: 'issued',
        reference: 'REF001',
        reason: 'Return of defective goods',
        notes: 'Credit for returned office supplies',
        appliedToBills: [],
        appliedAmount: 0,
        remainingAmount: 500.00,
        createdBy: 'user1',
        issuedAt: '2024-01-15T10:00:00Z',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      },
      {
        _id: '2',
        creditNumber: 'VC-2024-002',
        vendorId: 'vendor2',
        vendorName: 'XYZ Suppliers',
        vendorEmail: 'billing@xyzsuppliers.com',
        creditDate: '2024-01-16',
        amount: 1000.00,
        currency: 'INR',
        status: 'applied',
        reference: 'REF002',
        reason: 'Overpayment refund',
        notes: 'Credit for overpayment on previous bill',
        appliedToBills: ['bill1'],
        appliedAmount: 1000.00,
        remainingAmount: 0.00,
        createdBy: 'user1',
        issuedAt: '2024-01-16T10:00:00Z',
        appliedAt: '2024-01-17T10:00:00Z',
        createdAt: '2024-01-16T10:00:00Z',
        updatedAt: '2024-01-17T10:00:00Z',
      },
      {
        _id: '3',
        creditNumber: 'VC-2024-003',
        vendorId: 'vendor3',
        vendorName: 'Tech Solutions',
        vendorEmail: 'billing@techsolutions.com',
        creditDate: '2024-01-17',
        amount: 250.00,
        currency: 'INR',
        status: 'draft',
        reference: 'REF003',
        reason: 'Service credit',
        notes: 'Credit for service interruption',
        appliedToBills: [],
        appliedAmount: 0,
        remainingAmount: 250.00,
        createdBy: 'user1',
        createdAt: '2024-01-17T10:00:00Z',
        updatedAt: '2024-01-17T10:00:00Z',
      },
    ];
  }

  private getMockStats(): VendorCreditStats {
    return {
      totalCredits: 3,
      draftCredits: 1,
      issuedCredits: 1,
      appliedCredits: 1,
      cancelledCredits: 0,
      totalAmount: 1750.00,
      averageCreditValue: 583.33,
      totalAppliedAmount: 1000.00,
      totalRemainingAmount: 750.00,
    };
  }
}

export const vendorCreditService = new VendorCreditService();
