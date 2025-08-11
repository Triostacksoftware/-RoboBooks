/**
 * Credit Note Service
 * Handles all credit note related API operations
 */

import { creditNoteIdGenerator } from "../utils/creditNoteIdGenerator";

export interface CreditNoteItem {
  id: string;
  itemDetails: string;
  account: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface CreditNote {
  id: string;
  creditNoteNumber: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  date: string;
  referenceNumber?: string;
  salesperson?: string;
  subject?: string;
  items: CreditNoteItem[];
  subTotal: number;
  discount: number;
  discountType: "percentage" | "amount";
  tdsType: "TDS" | "TCS";
  selectedTax?: string;
  tdsAmount: number;
  adjustment: number;
  total: number;
  status: "draft" | "open" | "void";
  notes?: string;
  terms?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCreditNoteRequest {
  customerName: string;
  referenceNumber?: string;
  creditNoteDate: string;
  salesperson?: string;
  subject?: string;
  items: CreditNoteItem[];
  discount: number;
  discountType: "percentage" | "amount";
  tdsType: "TDS" | "TCS";
  selectedTax?: string;
  tdsAmount: number;
  adjustment: number;
  notes?: string;
  terms?: string;
}

export interface UpdateCreditNoteRequest extends CreateCreditNoteRequest {
  id: string;
}

export interface CreditNoteFilters {
  status?: "draft" | "open" | "void";
  customerName?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

class CreditNoteService {
  private baseUrl = "/api/credit-notes"; // Adjust based on your API structure

  /**
   * Get all credit notes with optional filtering
   */
  async getCreditNotes(filters?: CreditNoteFilters): Promise<CreditNote[]> {
    try {
      const queryParams = new URLSearchParams();

      if (filters?.status) queryParams.append("status", filters.status);
      if (filters?.customerName)
        queryParams.append("customerName", filters.customerName);
      if (filters?.dateFrom) queryParams.append("dateFrom", filters.dateFrom);
      if (filters?.dateTo) queryParams.append("dateTo", filters.dateTo);
      if (filters?.search) queryParams.append("search", filters.search);

      const response = await fetch(`${this.baseUrl}?${queryParams.toString()}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch credit notes: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching credit notes:", error);
      throw error;
    }
  }

  /**
   * Get a single credit note by ID
   */
  async getCreditNote(id: string): Promise<CreditNote> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch credit note: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching credit note:", error);
      throw error;
    }
  }

  /**
   * Create a new credit note
   */
  async createCreditNote(data: CreateCreditNoteRequest): Promise<CreditNote> {
    try {
      // Generate the next credit note number
      const existingCreditNotes = await this.getCreditNotes();
      const existingNumbers = existingCreditNotes.map(
        (cn) => cn.creditNoteNumber
      );
      const nextNumber =
        creditNoteIdGenerator.getNextFromExisting(existingNumbers);

      const creditNoteData = {
        ...data,
        creditNoteNumber: nextNumber,
        status: "draft" as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(creditNoteData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create credit note: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating credit note:", error);
      throw error;
    }
  }

  /**
   * Update an existing credit note
   */
  async updateCreditNote(
    id: string,
    data: UpdateCreditNoteRequest
  ): Promise<CreditNote> {
    try {
      const updateData = {
        ...data,
        updatedAt: new Date().toISOString(),
      };

      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update credit note: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating credit note:", error);
      throw error;
    }
  }

  /**
   * Delete a credit note
   */
  async deleteCreditNote(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete credit note: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error deleting credit note:", error);
      throw error;
    }
  }

  /**
   * Change credit note status
   */
  async updateCreditNoteStatus(
    id: string,
    status: "draft" | "open" | "void"
  ): Promise<CreditNote> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to update credit note status: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating credit note status:", error);
      throw error;
    }
  }

  /**
   * Get credit note statistics
   */
  async getCreditNoteStats(): Promise<{
    total: number;
    draft: number;
    open: number;
    void: number;
    totalAmount: number;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/stats`);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch credit note stats: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching credit note stats:", error);
      throw error;
    }
  }

  /**
   * Export credit notes to PDF
   */
  async exportToPDF(id: string): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}/export/pdf`);

      if (!response.ok) {
        throw new Error(`Failed to export credit note: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error("Error exporting credit note:", error);
      throw error;
    }
  }

  /**
   * Send credit note to customer
   */
  async sendToCustomer(id: string, email?: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send credit note: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error sending credit note:", error);
      throw error;
    }
  }

  /**
   * Calculate totals for credit note items
   */
  calculateTotals(
    items: CreditNoteItem[],
    discount: number,
    discountType: "percentage" | "amount",
    tdsAmount: number,
    adjustment: number
  ) {
    const subTotal = items.reduce((sum, item) => sum + item.amount, 0);
    const discountAmount =
      discountType === "percentage" ? (subTotal * discount) / 100 : discount;
    const total = subTotal - discountAmount - tdsAmount + adjustment;

    return {
      subTotal,
      discountAmount,
      total,
    };
  }

  /**
   * Validate credit note data
   */
  validateCreditNote(data: CreateCreditNoteRequest): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!data.customerName?.trim()) {
      errors.push("Customer name is required");
    }

    if (!data.creditNoteDate) {
      errors.push("Credit note date is required");
    }

    if (!data.items || data.items.length === 0) {
      errors.push("At least one item is required");
    } else {
      data.items.forEach((item, index) => {
        if (!item.itemDetails?.trim()) {
          errors.push(`Item ${index + 1}: Item details are required`);
        }
        if (item.quantity <= 0) {
          errors.push(`Item ${index + 1}: Quantity must be greater than 0`);
        }
        if (item.rate < 0) {
          errors.push(`Item ${index + 1}: Rate cannot be negative`);
        }
      });
    }

    if (data.discount < 0) {
      errors.push("Discount cannot be negative");
    }

    if (data.adjustment < 0) {
      errors.push("Adjustment cannot be negative");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// Export singleton instance
export const creditNoteService = new CreditNoteService();
