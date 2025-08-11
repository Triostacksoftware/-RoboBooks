const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface DeliveryChallan {
  _id: string;
  challanNo: string;
  challanDate: string;
  referenceNo?: string;
  customerId: string;
  challanType: string;
  placeOfSupply: string;
  shipTo: {
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  dispatchFrom: {
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  items: Array<{
    itemId: string;
    itemName: string;
    hsn: string;
    quantity: number;
    uom: string;
    rate: number;
    amount: number;
    notes?: string;
  }>;
  subTotal: number;
  discount: number;
  discountType: 'percentage' | 'amount';
  discountAmount: number;
  adjustment: number;
  total: number;
  notes?: string;
  terms?: string;
  status: string;
  invoiceStatus: string;
  attachments: string[];
  fy: string;
  numberingSeries: string;
  audit: Array<{
    status: string;
    timestamp: string;
    userId: string;
    notes?: string;
  }>;
  emailLog: Array<{
    to: string;
    cc?: string;
    subject: string;
    message: string;
    messageId: string;
    status: string;
    timestamp: string;
  }>;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateDeliveryChallanData {
  customerId: string;
  challanDate: string;
  referenceNo?: string;
  challanType: string;
  placeOfSupply: string;
  shipTo: {
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  dispatchFrom: {
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  items: Array<{
    itemId: string;
    quantity: number;
    uom: string;
    rate?: number;
    notes?: string;
  }>;
  subTotal: number;
  discount: number;
  discountType: 'percentage' | 'amount';
  discountAmount: number;
  adjustment: number;
  total: number;
  notes?: string;
  terms?: string;
  attachments: string[];
  fy: string;
  numberingSeries: string;
}

interface UpdateDeliveryChallanData extends Partial<CreateDeliveryChallanData> {}

interface EmailData {
  to: string;
  cc?: string;
  subject: string;
  message: string;
}

interface ReturnData {
  partialReturn: boolean;
  returnedItems?: Array<{
    itemId: string;
    quantity: number;
    notes?: string;
  }>;
  notes?: string;
}

class DeliveryChallanService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}/api/delivery-challans${endpoint}`;
      
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

  // Get all delivery challans with filters and pagination
  async getAll(queryString: string): Promise<ApiResponse<{
    deliveryChallans: DeliveryChallan[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  }>> {
    return this.makeRequest(`?${queryString}`);
  }

  // Get delivery challan by ID
  async getById(id: string): Promise<ApiResponse<DeliveryChallan>> {
    return this.makeRequest(`/${id}`);
  }

  // Create new delivery challan
  async create(data: CreateDeliveryChallanData): Promise<ApiResponse<DeliveryChallan>> {
    return this.makeRequest('', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Update delivery challan
  async update(id: string, data: UpdateDeliveryChallanData): Promise<ApiResponse<DeliveryChallan>> {
    return this.makeRequest(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Delete delivery challan
  async delete(id: string): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return this.makeRequest(`/${id}`, {
      method: 'DELETE',
    });
  }

  // Update status
  async updateStatus(id: string, status: string, notes?: string): Promise<ApiResponse<DeliveryChallan>> {
    return this.makeRequest(`/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    });
  }

  // Open challan
  async openChallan(id: string, notes?: string): Promise<ApiResponse<DeliveryChallan>> {
    return this.makeRequest(`/${id}/open`, {
      method: 'PATCH',
      body: JSON.stringify({ notes }),
    });
  }

  // Mark as delivered
  async markDelivered(id: string, notes?: string): Promise<ApiResponse<DeliveryChallan>> {
    return this.makeRequest(`/${id}/delivered`, {
      method: 'PATCH',
      body: JSON.stringify({ notes }),
    });
  }

  // Mark as returned
  async markReturned(id: string, returnData: ReturnData): Promise<ApiResponse<DeliveryChallan>> {
    return this.makeRequest(`/${id}/returned`, {
      method: 'PATCH',
      body: JSON.stringify(returnData),
    });
  }

  // Send email
  async sendEmail(id: string, emailData: EmailData): Promise<ApiResponse<{ success: boolean; messageId: string }>> {
    return this.makeRequest(`/${id}/send-email`, {
      method: 'POST',
      body: JSON.stringify(emailData),
    });
  }

  // Duplicate delivery challan
  async duplicate(id: string): Promise<ApiResponse<DeliveryChallan>> {
    return this.makeRequest(`/${id}/duplicate`, {
      method: 'POST',
    });
  }

  // Get next challan number
  async getNextChallanNumber(orgId: string, fy: string, numberingSeries?: string): Promise<ApiResponse<{ nextChallanNumber: string }>> {
    const params = new URLSearchParams({ orgId, fy });
    if (numberingSeries) {
      params.append('numberingSeries', numberingSeries);
    }
    return this.makeRequest(`/next-number?${params.toString()}`);
  }
}

export const deliveryChallanService = new DeliveryChallanService();
