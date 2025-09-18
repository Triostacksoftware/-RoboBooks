import { api } from '../lib/api';

export interface BillItem {
  itemId: string;
  itemName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxRate?: number;
  taxAmount?: number;
}

export interface Bill {
  _id: string;
  billNumber: string;
  vendorId: string;
  vendorName: string;
  vendorEmail?: string;
  vendorAddress?: string;
  billDate: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'received' | 'overdue' | 'paid' | 'cancelled';
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  notes?: string;
  terms?: string;
  items: BillItem[];
  createdBy: string;
  receivedAt?: string;
  paidAt?: string;
  customFields?: { [key: string]: any };
  createdAt: string;
  updatedAt: string;
}

export interface BillStats {
  totalBills: number;
  draftBills: number;
  sentBills: number;
  receivedBills: number;
  overdueBills: number;
  paidBills: number;
  cancelledBills: number;
  totalAmount: number;
  averageBillValue: number;
  totalOverdue: number;
}

export interface CreateBillData {
  vendorId: string;
  billDate: string;
  dueDate: string;
  notes?: string;
  terms?: string;
  items: Omit<BillItem, 'totalPrice' | 'taxAmount'>[];
  currency?: string;
}

class BillService {
  private baseUrl = '/api/bills';

  async getBills(): Promise<Bill[]> {
    try {
      const response = await api<{ success: boolean; data: Bill[] }>(`${this.baseUrl}`);
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to fetch bills');
    } catch (error) {
      console.error('Error fetching bills:', error);
      return this.getMockBills();
    }
  }

  async getBillById(id: string): Promise<Bill> {
    try {
      const response = await api<{ success: boolean; data: Bill }>(`${this.baseUrl}/${id}`);
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to fetch bill');
    } catch (error) {
      console.error('Error fetching bill:', error);
      throw error;
    }
  }

  async createBill(data: CreateBillData): Promise<Bill> {
    try {
      const response = await api<{ success: boolean; data: Bill }>(`${this.baseUrl}`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to create bill');
    } catch (error) {
      console.error('Error creating bill:', error);
      throw error;
    }
  }

  async updateBill(id: string, data: Partial<CreateBillData>): Promise<Bill> {
    try {
      const response = await api<{ success: boolean; data: Bill }>(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to update bill');
    } catch (error) {
      console.error('Error updating bill:', error);
      throw error;
    }
  }

  async deleteBill(id: string): Promise<void> {
    try {
      const response = await api<{ success: boolean }>(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      });
      if (!response.success) {
        throw new Error('Failed to delete bill');
      }
    } catch (error) {
      console.error('Error deleting bill:', error);
      throw error;
    }
  }

  async searchBills(query: string): Promise<Bill[]> {
    try {
      const response = await api<{ success: boolean; data: Bill[] }>(`${this.baseUrl}/search?query=${encodeURIComponent(query)}`);
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to search bills');
    } catch (error) {
      console.error('Error searching bills:', error);
      return [];
    }
  }

  async getBillStats(): Promise<BillStats> {
    try {
      const response = await api<{ success: boolean; data: BillStats }>(`${this.baseUrl}/stats`);
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to fetch bill stats');
    } catch (error) {
      console.error('Error fetching bill stats:', error);
      return this.getMockStats();
    }
  }

  async importBills(file: File): Promise<Bill[]> {
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
        throw new Error('Failed to import bills');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error importing bills:', error);
      return this.getMockBills();
    }
  }

  async exportBills(bills: Bill[]): Promise<void> {
    try {
      const csvContent = this.convertToCSV(bills);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bills_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting bills:', error);
      throw error;
    }
  }

  async updateBillStatus(id: string, status: Bill['status']): Promise<Bill> {
    try {
      const response = await api<{ success: boolean; data: Bill }>(`${this.baseUrl}/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to update bill status');
    } catch (error) {
      console.error('Error updating bill status:', error);
      throw error;
    }
  }

  async markBillAsPaid(id: string, paymentData?: { amount: number; paymentMethod: string; reference?: string }): Promise<Bill> {
    try {
      const response = await api<{ success: boolean; data: Bill }>(`${this.baseUrl}/${id}/pay`, {
        method: 'POST',
        body: JSON.stringify(paymentData || {}),
      });
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to mark bill as paid');
    } catch (error) {
      console.error('Error marking bill as paid:', error);
      throw error;
    }
  }

  private convertToCSV(bills: Bill[]): string {
    const headers = [
      'Bill Number',
      'Vendor Name',
      'Bill Date',
      'Due Date',
      'Status',
      'Total Amount',
      'Currency',
      'Created At'
    ];

    const rows = bills.map(bill => [
      bill.billNumber,
      bill.vendorName,
      bill.billDate,
      bill.dueDate,
      bill.status,
      bill.totalAmount,
      bill.currency,
      bill.createdAt
    ]);

    return [headers, ...rows].map(row =>
      row.map(field => `"${field}"`).join(',')
    ).join('\n');
  }

  private getMockBills(): Bill[] {
    return [
      {
        _id: '1',
        billNumber: 'BILL-2024-001',
        vendorId: 'vendor1',
        vendorName: 'ABC Corporation',
        vendorEmail: 'billing@abccorp.com',
        billDate: '2024-01-15',
        dueDate: '2024-02-15',
        status: 'received',
        subtotal: 1000.00,
        taxAmount: 180.00,
        totalAmount: 1180.00,
        currency: 'INR',
        notes: 'Monthly office supplies',
        items: [
          {
            itemId: 'item1',
            itemName: 'Office Supplies',
            description: 'Stationery and office materials',
            quantity: 10,
            unitPrice: 100.00,
            totalPrice: 1000.00,
            taxRate: 18,
            taxAmount: 180.00
          }
        ],
        createdBy: 'user1',
        receivedAt: '2024-01-15T10:00:00Z',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      },
      {
        _id: '2',
        billNumber: 'BILL-2024-002',
        vendorId: 'vendor2',
        vendorName: 'XYZ Suppliers',
        vendorEmail: 'billing@xyzsuppliers.com',
        billDate: '2024-01-16',
        dueDate: '2024-02-16',
        status: 'overdue',
        subtotal: 2500.00,
        taxAmount: 450.00,
        totalAmount: 2950.00,
        currency: 'INR',
        notes: 'Equipment purchase',
        items: [
          {
            itemId: 'item2',
            itemName: 'Computer Equipment',
            description: 'Laptops and accessories',
            quantity: 5,
            unitPrice: 500.00,
            totalPrice: 2500.00,
            taxRate: 18,
            taxAmount: 450.00
          }
        ],
        createdBy: 'user1',
        receivedAt: '2024-01-16T10:00:00Z',
        createdAt: '2024-01-16T10:00:00Z',
        updatedAt: '2024-01-16T10:00:00Z',
      },
      {
        _id: '3',
        billNumber: 'BILL-2024-003',
        vendorId: 'vendor3',
        vendorName: 'Tech Solutions',
        vendorEmail: 'billing@techsolutions.com',
        billDate: '2024-01-17',
        dueDate: '2024-02-17',
        status: 'paid',
        subtotal: 500.00,
        taxAmount: 90.00,
        totalAmount: 590.00,
        currency: 'INR',
        notes: 'Software license renewal',
        items: [
          {
            itemId: 'item3',
            itemName: 'Software License',
            description: 'Annual software subscription',
            quantity: 1,
            unitPrice: 500.00,
            totalPrice: 500.00,
            taxRate: 18,
            taxAmount: 90.00
          }
        ],
        createdBy: 'user1',
        receivedAt: '2024-01-17T10:00:00Z',
        paidAt: '2024-01-20T10:00:00Z',
        createdAt: '2024-01-17T10:00:00Z',
        updatedAt: '2024-01-20T10:00:00Z',
      },
    ];
  }

  private getMockStats(): BillStats {
    return {
      totalBills: 3,
      draftBills: 0,
      sentBills: 0,
      receivedBills: 1,
      overdueBills: 1,
      paidBills: 1,
      cancelledBills: 0,
      totalAmount: 4720.00,
      averageBillValue: 1573.33,
      totalOverdue: 2950.00,
    };
  }
}

export const billService = new BillService();
