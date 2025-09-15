export interface Item {
  _id: string;
  name: string;
  description?: string;
  type: 'Goods' | 'Service';
  category?: string;
  unitPrice: number;
  unit: string;
  taxRate: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateItemData {
  name: string;
  description?: string;
  type: 'Goods' | 'Service';
  category?: string;
  unitPrice: number;
  unit: string;
  taxRate: number;
  isActive?: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const itemService = {
  async getItems(): Promise<Item[]> {
    const response = await fetch(`${API_BASE_URL}/api/items`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch items');
    }

    const result = await response.json();
    return result.data || [];
  },

  async getItemById(id: string): Promise<Item> {
    const response = await fetch(`${API_BASE_URL}/api/items/${id}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch item');
    }

    const result = await response.json();
    return result.data;
  },

  async getActiveItems(): Promise<Item[]> {
    const response = await fetch(`${API_BASE_URL}/api/items?isActive=true`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch active items');
    }

    const result = await response.json();
    return result.data || [];
  },

  async searchItems(query: string): Promise<Item[]> {
    const response = await fetch(`${API_BASE_URL}/api/items/search?query=${encodeURIComponent(query)}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to search items');
    }

    const result = await response.json();
    return result.data || [];
  },

  async createItem(data: CreateItemData): Promise<Item> {
    const response = await fetch(`${API_BASE_URL}/api/items`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create item');
    }

    const result = await response.json();
    return result.data;
  },

  async updateItem(id: string, data: Partial<CreateItemData>): Promise<Item> {
    const response = await fetch(`${API_BASE_URL}/api/items/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update item');
    }

    const result = await response.json();
    return result.data;
  },

  async deleteItem(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/items/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete item');
    }
  },
};
