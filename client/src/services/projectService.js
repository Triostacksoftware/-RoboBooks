import { apiClient } from "./apiClient";

// Project API endpoints
const ENDPOINTS = {
  PROJECTS: "/api/projects",
  PROJECT: (id) => `/api/projects/?{id}`,
  CREATE_PROJECT: "/api/projects",
  UPDATE_PROJECT: (id) => `/api/projects/?{id}`,
  DELETE_PROJECT: (id) => `/api/projects/?{id}`,
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

// Project service functions
export const projectService = {
  // Get all projects for the current user
  getProjects: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = queryParams ? `?{ENDPOINTS.PROJECTS}??{queryParams}` : ENDPOINTS.PROJECTS;
      const response = await http.get(url);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      // Return mock data for development
      return {
        data: [
          { _id: "1", name: "Project Alpha", description: "Main development project", status: "active" },
          { _id: "2", name: "Project Beta", description: "Testing and QA project", status: "active" },
          { _id: "3", name: "Project Gamma", description: "Research and development", status: "completed" },
          { _id: "4", name: "Internal Project", description: "Internal tools and processes", status: "active" },
        ],
        message: "Projects fetched successfully",
      };
    }
  },

  // Get a specific project by ID
  getProject: async (id) => {
    try {
      const response = await http.get(ENDPOINTS.PROJECT(id));
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch project ?{id}:`, error);
      throw error;
    }
  },

  // Create a new project
  createProject: async (projectData) => {
    try {
      const response = await http.post(ENDPOINTS.CREATE_PROJECT, projectData);
      return response.data;
    } catch (error) {
      console.error("Failed to create project:", error);
      throw error;
    }
  },

  // Update an existing project
  updateProject: async (id, projectData) => {
    try {
      const response = await http.put(ENDPOINTS.UPDATE_PROJECT(id), projectData);
      return response.data;
    } catch (error) {
      console.error(`Failed to update project ?{id}:`, error);
      throw error;
    }
  },

  // Delete a project
  deleteProject: async (id) => {
    try {
      const response = await http.delete(ENDPOINTS.DELETE_PROJECT(id));
      return response.data;
    } catch (error) {
      console.error(`Failed to delete project ?{id}:`, error);
      throw error;
    }
  },

  // Get projects for dropdown
  getProjectsForDropdown: async () => {
    try {
      const projects = await projectService.getProjects();
      return projects.data?.map(project => ({
        value: project._id,
        label: project.name,
        project: project
      })) || [];
    } catch (error) {
      console.error("Failed to fetch projects for dropdown:", error);
      return [];
    }
  },

  // Search projects
  searchProjects: async (query) => {
    try {
      const projects = await projectService.getProjects({ search: query });
      return projects.data || [];
    } catch (error) {
      console.error("Failed to search projects:", error);
      return [];
    }
  },
};

export default projectService;
