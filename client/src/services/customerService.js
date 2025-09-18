import { apiClient } from "./apiClient";

// Customer API endpoints
const ENDPOINTS = {
  CUSTOMERS: "/api/customers",
  CUSTOMER: (id) => `/api/customers/${id}`,
  CREATE_CUSTOMER: "/api/customers",
  UPDATE_CUSTOMER: (id) => `/api/customers/${id}`,
  DELETE_CUSTOMER: (id) => `/api/customers/${id}`,
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

// Customer service functions
export const customerService = {
  // Get all customers for the current user
  getCustomers: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = queryParams ? `${ENDPOINTS.CUSTOMERS}?${queryParams}` : ENDPOINTS.CUSTOMERS;
      const response = await http.get(url);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      // Return mock data for development
      return {
        data: [
          { _id: "1", name: "ABC Corp", email: "contact@abccorp.com", phone: "+91-9876543210" },
          { _id: "2", name: "XYZ Ltd", email: "info@xyzltd.com", phone: "+91-9876543211" },
          { _id: "3", name: "Client A", email: "clienta@example.com", phone: "+91-9876543212" },
          { _id: "4", name: "Client B", email: "clientb@example.com", phone: "+91-9876543213" },
        ],
        message: "Customers fetched successfully",
      };
    }
  },

  // Get a specific customer by ID
  getCustomer: async (id) => {
    try {
      const response = await http.get(ENDPOINTS.CUSTOMER(id));
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch customer ${id}:`, error);
      throw error;
    }
  },

  // Create a new customer
  createCustomer: async (customerData) => {
    try {
      const response = await http.post(ENDPOINTS.CREATE_CUSTOMER, customerData);
      return response.data;
    } catch (error) {
      console.error("Failed to create customer:", error);
      throw error;
    }
  },

  // Update an existing customer
  updateCustomer: async (id, customerData) => {
    try {
      const response = await http.put(ENDPOINTS.UPDATE_CUSTOMER(id), customerData);
      return response.data;
    } catch (error) {
      console.error(`Failed to update customer ${id}:`, error);
      throw error;
    }
  },

  // Delete a customer
  deleteCustomer: async (id) => {
    try {
      const response = await http.delete(ENDPOINTS.DELETE_CUSTOMER(id));
      return response.data;
    } catch (error) {
      console.error(`Failed to delete customer ${id}:`, error);
      throw error;
    }
  },

  // Get customers for dropdown
  getCustomersForDropdown: async () => {
    try {
      const customers = await customerService.getCustomers();
      return customers.data?.map(customer => ({
        value: customer._id,
        label: customer.name,
        customer: customer
      })) || [];
    } catch (error) {
      console.error("Failed to fetch customers for dropdown:", error);
      return [];
    }
  },

  // Search customers
  searchCustomers: async (query) => {
    try {
      const customers = await customerService.getCustomers({ search: query });
      return customers.data || [];
    } catch (error) {
      console.error("Failed to search customers:", error);
      return [];
    }
  },
};

export default customerService;
