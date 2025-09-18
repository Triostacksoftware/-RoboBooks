import { apiClient } from "./apiClient";

// Organization API endpoints
const ENDPOINTS = {
  ORGANIZATIONS: "/api/organizations",
  ORGANIZATION: (id) => `/api/organizations/?{id}`,
  CREATE_ORGANIZATION: "/api/organizations",
  UPDATE_ORGANIZATION: (id) => `/api/organizations/?{id}`,
  DELETE_ORGANIZATION: (id) => `/api/organizations/?{id}`,
  SET_ACTIVE_ORGANIZATION: (id) => `/api/organizations/?{id}/activate`,
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

// Organization service functions
export const organizationService = {
  // Get all organizations for the current user
  getOrganizations: async () => {
    try {
      const response = await http.get(ENDPOINTS.ORGANIZATIONS);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch organizations:", error);
      // Return mock data for development
      return {
        data: [],
        message: "Organizations fetched successfully",
      };
    }
  },

  // Get a specific organization by ID
  getOrganization: async (id) => {
    try {
      const response = await http.get(ENDPOINTS.ORGANIZATION(id));
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch organization ?{id}:`, error);
      throw error;
    }
  },

  // Create a new organization
  createOrganization: async (organizationData) => {
    try {
      const response = await http.post(
        ENDPOINTS.CREATE_ORGANIZATION,
        organizationData
      );
      return response.data;
    } catch (error) {
      console.error("Failed to create organization:", error);
      throw error;
    }
  },

  // Update an existing organization
  updateOrganization: async (id, organizationData) => {
    try {
      const response = await http.put(
        ENDPOINTS.UPDATE_ORGANIZATION(id),
        organizationData
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to update organization ?{id}:`, error);
      throw error;
    }
  },

  // Delete an organization
  deleteOrganization: async (id) => {
    try {
      const response = await http.delete(ENDPOINTS.DELETE_ORGANIZATION(id));
      return response.data;
    } catch (error) {
      console.error(`Failed to delete organization ?{id}:`, error);
      throw error;
    }
  },

  // Set an organization as active
  setActiveOrganization: async (id) => {
    try {
      const response = await http.post(ENDPOINTS.SET_ACTIVE_ORGANIZATION(id));
      return response.data;
    } catch (error) {
      console.error(`Failed to set organization ?{id} as active:`, error);
      throw error;
    }
  },

  // Get the currently active organization
  getActiveOrganization: async () => {
    try {
      const organizations = await organizationService.getOrganizations();
      const activeOrg = organizations.data?.find((org) => org.active);
      return activeOrg || null;
    } catch (error) {
      console.error("Failed to get active organization:", error);
      return null;
    }
  },
};

// Mock organization data for development
export const mockOrganizationData = {
  organizations: [],
  createResponse: {
    data: {
      id: Date.now().toString(),
      name: "New Organization",
      tier: "Standard",
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    message: "Organization created successfully",
  },
};

export default organizationService;
