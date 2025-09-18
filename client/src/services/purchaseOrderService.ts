export interface PurchaseOrderItem {
  itemId: string;
  itemName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxRate?: number;
  taxAmount?: number;
}

export interface PurchaseOrder {
  _id: string;
  poNumber: string;
  vendorId: string;
  vendorName: string;
  vendorEmail?: string;
  vendorAddress?: string;
  orderDate: string;
  expectedDeliveryDate?: string;
  status: 'draft' | 'sent' | 'approved' | 'partially_received' | 'received' | 'cancelled';
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  notes?: string;
  terms?: string;
  items: PurchaseOrderItem[];
  createdBy: string;
  approvedBy?: string;
  approvedAt?: string;
  receivedAt?: string;
  customFields?: { [key: string]: any };
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderStats {
  totalOrders: number;
  draftOrders: number;
  sentOrders: number;
  approvedOrders: number;
  receivedOrders: number;
  cancelledOrders: number;
  totalAmount: number;
  averageOrderValue: number;
}

export interface CreatePurchaseOrderData {
  vendorId: string;
  orderDate: string;
  expectedDeliveryDate?: string;
  notes?: string;
  terms?: string;
  items: Omit<PurchaseOrderItem, 'totalPrice' | 'taxAmount'>[];
  currency?: string;
}

import { api } from '../lib/api';

class PurchaseOrderService {
  private baseUrl = '/api/purchase-orders';

  async getPurchaseOrders(): Promise<PurchaseOrder[]> {
    try {
      const response = await api<{ success: boolean; data: PurchaseOrder[] }>(`${this.baseUrl}`);
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to fetch purchase orders');
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
      // Return mock data for development
      return this.getMockPurchaseOrders();
    }
  }

  async getPurchaseOrderById(id: string): Promise<PurchaseOrder> {
    try {
      const response = await api<{ success: boolean; data: PurchaseOrder }>(`${this.baseUrl}/${id}`);
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to fetch purchase order');
    } catch (error) {
      console.error('Error fetching purchase order:', error);
      throw error;
    }
  }

  async createPurchaseOrder(data: CreatePurchaseOrderData): Promise<PurchaseOrder> {
    try {
      const response = await api<{ success: boolean; data: PurchaseOrder }>(`${this.baseUrl}`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to create purchase order');
    } catch (error) {
      console.error('Error creating purchase order:', error);
      throw error;
    }
  }

  async updatePurchaseOrder(id: string, data: Partial<CreatePurchaseOrderData>): Promise<PurchaseOrder> {
    try {
      const response = await api<{ success: boolean; data: PurchaseOrder }>(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to update purchase order');
    } catch (error) {
      console.error('Error updating purchase order:', error);
      throw error;
    }
  }

  async deletePurchaseOrder(id: string): Promise<void> {
    try {
      const response = await api<{ success: boolean }>(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      });
      if (!response.success) {
        throw new Error('Failed to delete purchase order');
      }
    } catch (error) {
      console.error('Error deleting purchase order:', error);
      throw error;
    }
  }

  async searchPurchaseOrders(query: string): Promise<PurchaseOrder[]> {
    try {
      const response = await api<{ success: boolean; data: PurchaseOrder[] }>(`${this.baseUrl}/search?query=${encodeURIComponent(query)}`);
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to search purchase orders');
    } catch (error) {
      console.error('Error searching purchase orders:', error);
      return [];
    }
  }

  async getPurchaseOrderStats(): Promise<PurchaseOrderStats> {
    try {
      const response = await api<{ success: boolean; data: PurchaseOrderStats }>(`${this.baseUrl}/stats`);
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to fetch purchase order stats');
    } catch (error) {
      console.error('Error fetching purchase order stats:', error);
      // Return mock stats for development
      return this.getMockStats();
    }
  }

  async importPurchaseOrders(file: File): Promise<PurchaseOrder[]> {
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
        throw new Error('Failed to import purchase orders');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error importing purchase orders:', error);
      // Return mock data for development
      return this.getMockPurchaseOrders();
    }
  }

  async exportPurchaseOrders(orders: PurchaseOrder[]): Promise<void> {
    try {
      const csvContent = this.convertToCSV(orders);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `purchase-orders_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting purchase orders:', error);
      throw error;
    }
  }

  async updatePurchaseOrderStatus(id: string, status: PurchaseOrder['status']): Promise<PurchaseOrder> {
    try {
      const response = await api<{ success: boolean; data: PurchaseOrder }>(`${this.baseUrl}/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to update purchase order status');
    } catch (error) {
      console.error('Error updating purchase order status:', error);
      throw error;
    }
  }

  async sendPurchaseOrder(id: string): Promise<PurchaseOrder> {
    try {
      const response = await api<{ success: boolean; data: PurchaseOrder }>(`${this.baseUrl}/${id}/send`, {
        method: 'POST',
      });
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to send purchase order');
    } catch (error) {
      console.error('Error sending purchase order:', error);
      throw error;
    }
  }

  async approvePurchaseOrder(id: string): Promise<PurchaseOrder> {
    try {
      const response = await api<{ success: boolean; data: PurchaseOrder }>(`${this.baseUrl}/${id}/approve`, {
        method: 'POST',
      });
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to approve purchase order');
    } catch (error) {
      console.error('Error approving purchase order:', error);
      throw error;
    }
  }

  private convertToCSV(orders: PurchaseOrder[]): string {
    const headers = [
      'PO Number',
      'Vendor Name',
      'Order Date',
      'Expected Delivery Date',
      'Status',
      'Total Amount',
      'Currency',
      'Created At'
    ];

    const rows = orders.map(order => [
      order.poNumber,
      order.vendorName,
      order.orderDate,
      order.expectedDeliveryDate || '',
      order.status,
      order.totalAmount,
      order.currency,
      order.createdAt
    ]);

    return [headers, ...rows].map(row => 
      row.map(field => `"${field}"`).join(',')
    ).join('\n');
  }

  // Mock data for development
  private getMockPurchaseOrders(): PurchaseOrder[] {
    return [
      {
        _id: '1',
        poNumber: 'PO-2024-001',
        vendorId: 'vendor1',
        vendorName: 'ABC Corporation',
        vendorEmail: 'contact@abccorp.com',
        orderDate: '2024-01-15',
        expectedDeliveryDate: '2024-01-25',
        status: 'sent',
        subtotal: 1000.00,
        taxAmount: 180.00,
        totalAmount: 1180.00,
        currency: 'INR',
        notes: 'Urgent delivery required',
        items: [
          {
            itemId: 'item1',
            itemName: 'Office Supplies',
            description: 'Stationery items',
            quantity: 10,
            unitPrice: 100.00,
            totalPrice: 1000.00,
            taxRate: 18,
            taxAmount: 180.00
          }
        ],
        createdBy: 'user1',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      },
      {
        _id: '2',
        poNumber: 'PO-2024-002',
        vendorId: 'vendor2',
        vendorName: 'XYZ Suppliers',
        vendorEmail: 'info@xyzsuppliers.com',
        orderDate: '2024-01-16',
        expectedDeliveryDate: '2024-01-30',
        status: 'draft',
        subtotal: 2500.00,
        taxAmount: 450.00,
        totalAmount: 2950.00,
        currency: 'INR',
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
        createdAt: '2024-01-16T10:00:00Z',
        updatedAt: '2024-01-16T10:00:00Z',
      },
    ];
  }

  private getMockStats(): PurchaseOrderStats {
    return {
      totalOrders: 2,
      draftOrders: 1,
      sentOrders: 1,
      approvedOrders: 0,
      receivedOrders: 0,
      cancelledOrders: 0,
      totalAmount: 4130.00,
      averageOrderValue: 2065.00,
    };
  }
}

export const purchaseOrderService = new PurchaseOrderService();
