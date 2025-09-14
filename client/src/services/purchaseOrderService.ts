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
  createdAt: string;
  updatedAt: string;
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

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const purchaseOrderService = {
  async getPurchaseOrders(): Promise<PurchaseOrder[]> {
    const response = await fetch(`${API_BASE_URL}/api/purchase-orders`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch purchase orders');
    }

    const result = await response.json();
    return result.data || [];
  },

  async getPurchaseOrderById(id: string): Promise<PurchaseOrder> {
    const response = await fetch(`${API_BASE_URL}/api/purchase-orders/${id}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch purchase order');
    }

    const result = await response.json();
    return result.data;
  },

  async createPurchaseOrder(data: CreatePurchaseOrderData): Promise<PurchaseOrder> {
    // Transform camelCase to snake_case for backend
    const transformedData = {
      vendor_id: data.vendorId,
      po_number: `PO-${Date.now()}`, // Generate PO number
      order_date: data.orderDate,
      expected_delivery_date: data.expectedDeliveryDate,
      items: data.items.map(item => ({
        item_id: item.itemId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total: item.quantity * item.unitPrice
      })),
      subtotal: data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0),
      tax_amount: 0, // Default to 0
      total_amount: data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0),
      notes: data.notes,
    };

    const response = await fetch(`${API_BASE_URL}/api/purchase-orders`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transformedData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create purchase order');
    }

    const result = await response.json();
    return result.data;
  },

  async updatePurchaseOrder(id: string, data: Partial<CreatePurchaseOrderData>): Promise<PurchaseOrder> {
    // Transform camelCase to snake_case for backend
    const transformedData: any = {};
    if (data.vendorId !== undefined) transformedData.vendor_id = data.vendorId;
    if (data.orderDate !== undefined) transformedData.order_date = data.orderDate;
    if (data.expectedDeliveryDate !== undefined) transformedData.expected_delivery_date = data.expectedDeliveryDate;
    if (data.notes !== undefined) transformedData.notes = data.notes;
    if (data.items !== undefined) {
      transformedData.items = data.items.map(item => ({
        item_id: item.itemId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total: item.quantity * item.unitPrice
      }));
      transformedData.subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      transformedData.total_amount = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    }

    const response = await fetch(`${API_BASE_URL}/api/purchase-orders/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transformedData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update purchase order');
    }

    const result = await response.json();
    return result.data;
  },

  async deletePurchaseOrder(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/purchase-orders/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete purchase order');
    }
  },

  async searchPurchaseOrders(query: string): Promise<PurchaseOrder[]> {
    const response = await fetch(`${API_BASE_URL}/api/purchase-orders/search?query=${encodeURIComponent(query)}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to search purchase orders');
    }

    const result = await response.json();
    return result.data || [];
  },

  async updatePurchaseOrderStatus(id: string, status: PurchaseOrder['status']): Promise<PurchaseOrder> {
    const response = await fetch(`${API_BASE_URL}/api/purchase-orders/${id}/status`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update purchase order status');
    }

    const result = await response.json();
    return result.data;
  },

  async sendPurchaseOrder(id: string): Promise<PurchaseOrder> {
    const response = await fetch(`${API_BASE_URL}/api/purchase-orders/${id}/send`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send purchase order');
    }

    const result = await response.json();
    return result.data;
  },

  async approvePurchaseOrder(id: string): Promise<PurchaseOrder> {
    const response = await fetch(`${API_BASE_URL}/api/purchase-orders/${id}/approve`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to approve purchase order');
    }

    const result = await response.json();
    return result.data;
  },
};
