export interface VendorCredit {
  _id: string;
  creditNumber: string;
  vendorId: string;
  vendorName: string;
  creditDate: string;
  amount: number;
  reason: string;
  description?: string;
  status: 'draft' | 'issued' | 'applied' | 'cancelled';
  appliedAmount: number;
  remainingAmount: number;
  currency: string;
  reference?: string;
  billId?: string;
  billNumber?: string;
  createdBy: string;
  appliedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVendorCreditData {
  vendorId: string;
  creditDate: string;
  amount: number;
  reason: string;
  description?: string;
  currency?: string;
  reference?: string;
  billId?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const vendorCreditService = {
  async getVendorCredits(): Promise<VendorCredit[]> {
    const response = await fetch(`${API_BASE_URL}/api/vendor-credits`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch vendor credits');
    }

    const result = await response.json();
    return result.data || [];
  },

  async getVendorCreditById(id: string): Promise<VendorCredit> {
    const response = await fetch(`${API_BASE_URL}/api/vendor-credits/${id}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch vendor credit');
    }

    const result = await response.json();
    return result.data;
  },

  async createVendorCredit(data: CreateVendorCreditData): Promise<VendorCredit> {
    // Transform camelCase to snake_case for backend
    const transformedData = {
      vendor_id: data.vendorId,
      credit_number: `VC-${Date.now()}`, // Generate credit number
      credit_date: data.creditDate,
      amount: data.amount,
      reason: data.reason,
      reference: data.reference,
      notes: data.description,
    };

    const response = await fetch(`${API_BASE_URL}/api/vendor-credits`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transformedData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create vendor credit');
    }

    const result = await response.json();
    return result.data;
  },

  async updateVendorCredit(id: string, data: Partial<CreateVendorCreditData>): Promise<VendorCredit> {
    // Transform camelCase to snake_case for backend
    const transformedData: any = {};
    if (data.vendorId !== undefined) transformedData.vendor_id = data.vendorId;
    if (data.creditDate !== undefined) transformedData.credit_date = data.creditDate;
    if (data.amount !== undefined) transformedData.amount = data.amount;
    if (data.reason !== undefined) transformedData.reason = data.reason;
    if (data.reference !== undefined) transformedData.reference = data.reference;
    if (data.description !== undefined) transformedData.notes = data.description;

    const response = await fetch(`${API_BASE_URL}/api/vendor-credits/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transformedData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update vendor credit');
    }

    const result = await response.json();
    return result.data;
  },

  async deleteVendorCredit(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/vendor-credits/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete vendor credit');
    }
  },

  async searchVendorCredits(query: string): Promise<VendorCredit[]> {
    const response = await fetch(`${API_BASE_URL}/api/vendor-credits/search?query=${encodeURIComponent(query)}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to search vendor credits');
    }

    const result = await response.json();
    return result.data || [];
  },

  async updateVendorCreditStatus(id: string, status: VendorCredit['status']): Promise<VendorCredit> {
    const response = await fetch(`${API_BASE_URL}/api/vendor-credits/${id}/status`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update vendor credit status');
    }

    const result = await response.json();
    return result.data;
  },

  async applyVendorCredit(id: string, billId: string, amount: number): Promise<VendorCredit> {
    const response = await fetch(`${API_BASE_URL}/api/vendor-credits/${id}/apply`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ billId, amount }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to apply vendor credit');
    }

    const result = await response.json();
    return result.data;
  },
};
