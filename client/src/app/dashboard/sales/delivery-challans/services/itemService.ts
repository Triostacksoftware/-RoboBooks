export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface Item {
  _id: string;
  name: string;
  type: 'Goods' | 'Service';
  unit?: string;
  hsnCode?: string;
  sacCode?: string;
  sellingPrice?: number;
  costPrice?: number;
  category?: string;
  brand?: string;
  currentStock?: number;
  sku?: string;
  barcode?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ItemSearchParams {
  q?: string;
  type?: 'Goods' | 'Service';
  category?: string;
  page?: number;
  limit?: number;
}

export interface ItemSearchResponse {
  data: Item[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export class ItemService {
  private baseUrl = '/api/items';

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP error! status: ${response.status}`,
        };
      }

      return {
        success: true,
        data: data.data || data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      };
    }
  }

  async searchItems(params: ItemSearchParams = {}): Promise<ApiResponse<ItemSearchResponse>> {
    const searchParams = new URLSearchParams();
    
    if (params.q) searchParams.append('q', params.q);
    if (params.type) searchParams.append('type', params.type);
    if (params.category) searchParams.append('category', params.category);
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());

    return this.makeRequest<ItemSearchResponse>(`/search?${searchParams.toString()}`);
  }

  async getItemById(id: string): Promise<ApiResponse<Item>> {
    return this.makeRequest<Item>(`/${id}`);
  }

  async getActiveItems(limit: number = 100): Promise<ApiResponse<Item[]>> {
    return this.makeRequest<Item[]>(`/?limit=${limit}&isActive=true`);
  }

  async getItemsByType(type: 'Goods' | 'Service'): Promise<ApiResponse<Item[]>> {
    return this.makeRequest<Item[]>(`/type/${type}`);
  }
}

export const itemService = new ItemService();
export type { Item, ItemSearchParams, ItemSearchResponse };
