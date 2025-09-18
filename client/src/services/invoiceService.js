import { apiClient } from "./apiClient";

// Invoice API endpoints
const ENDPOINTS = {
  INVOICES: "/api/invoices",
  INVOICE: (id) => `/api/invoices/${id}`,
  CREATE_INVOICE: "/api/invoices",
  UPDATE_INVOICE: (id) => `/api/invoices/${id}`,
  DELETE_INVOICE: (id) => `/api/invoices/${id}`,
};

// HTTP wrapper functions
const http = {
  get: async (url) => {
    try {
      const response = await apiClient.get(url);
      return response;
    } catch (error) {
      console.error("GET request failed:", error);
      throw error;
    }
  },
  post: async (url, data) => {
    try {
      const response = await apiClient.post(url, data);
      return response;
    } catch (error) {
      console.error("POST request failed:", error);
      throw error;
    }
  },
  put: async (url, data) => {
    try {
      const response = await apiClient.put(url, data);
      return response;
    } catch (error) {
      console.error("PUT request failed:", error);
      throw error;
    }
  },
  delete: async (url) => {
    try {
      const response = await apiClient.delete(url);
      return response;
    } catch (error) {
      console.error("DELETE request failed:", error);
      throw error;
    }
  },
};

// Invoice service functions
export const invoiceService = {
  // Get all invoices for the current user
  getInvoices: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = queryParams ? `${ENDPOINTS.INVOICES}?${queryParams}` : ENDPOINTS.INVOICES;
      const response = await http.get(url);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
      // Return mock data for development
      return {
        data: [
          { _id: "1", invoiceNumber: "INV-001", customer: "ABC Corp", amount: 1500, status: "sent" },
          { _id: "2", invoiceNumber: "INV-002", customer: "XYZ Ltd", amount: 2300, status: "paid" },
          { _id: "3", invoiceNumber: "INV-003", customer: "Client A", amount: 800, status: "draft" },
        ],
        message: "Invoices fetched successfully",
      };
    }
  },

  // Get a specific invoice by ID
  getInvoice: async (id) => {
    try {
      const response = await http.get(ENDPOINTS.INVOICE(id));
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch invoice ${id}:`, error);
      throw error;
    }
  },

  // Create a new invoice
  createInvoice: async (invoiceData) => {
    try {
      const response = await http.post(ENDPOINTS.CREATE_INVOICE, invoiceData);
      return response.data;
    } catch (error) {
      console.error("Failed to create invoice:", error);
      throw error;
    }
  },

  // Update an existing invoice
  updateInvoice: async (id, invoiceData) => {
    try {
      const response = await http.put(ENDPOINTS.UPDATE_INVOICE(id), invoiceData);
      return response.data;
    } catch (error) {
      console.error(`Failed to update invoice ${id}:`, error);
      throw error;
    }
  },

  // Delete an invoice
  deleteInvoice: async (id) => {
    try {
      const response = await http.delete(ENDPOINTS.DELETE_INVOICE(id));
      return response.data;
    } catch (error) {
      console.error(`Failed to delete invoice ${id}:`, error);
      throw error;
    }
  },

  // Get invoice numbers for dropdown
  getInvoiceNumbers: async () => {
    try {
      const invoices = await invoiceService.getInvoices();
      return invoices.data?.map(invoice => ({
        value: invoice.invoiceNumber,
        label: `${invoice.invoiceNumber} - ${invoice.customer} (₹${invoice.amount})`,
        invoice: invoice
      })) || [];
    } catch (error) {
      console.error("Failed to fetch invoice numbers:", error);
      return [];
    }
  },
};

export default invoiceService;
