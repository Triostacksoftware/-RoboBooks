// src/lib/api.ts
import { ExcelAccountData } from "../services/excelParserService";

// Track if we're currently refreshing a token to prevent multiple refresh attempts
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      console.log("🔄 Attempting to refresh access token...");
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"
        }/api/auth/refresh-token`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.accessToken) {
          // Store the new token in localStorage for backward compatibility
          if (typeof window !== "undefined") {
            localStorage.setItem("token", data.accessToken);
          }
          console.log("✅ Access token refreshed successfully");
          return data.accessToken;
        }
      }

      console.log("❌ Token refresh failed");
      return null;
    } catch (error) {
      console.error("❌ Token refresh error:", error);
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function api<T = unknown>(
  path: string,
  init: RequestInit & { json?: unknown } = {}
): Promise<T> {
  const { json, ...rest } = init;

  // Use environment variable for backend URL
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
  console.log("🌐 Making request to:", `${backendUrl}${path}`);
  console.log("🌐 Request method:", init.method || "GET");
  console.log("🌐 Request body:", json);

  // Prepare headers with authentication
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  // Add any additional headers from init
  if (init.headers) {
    Object.entries(init.headers).forEach(([key, value]) => {
      if (typeof value === "string") {
        headers[key] = value;
      }
    });
  }

  // Get JWT token from localStorage as fallback (for backward compatibility)
  let token = null;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("token");
  }

  // Add Authorization header if token exists (fallback for non-cookie auth)
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${backendUrl}${path}`, {
    credentials: "include", // include cookies for cross-origin
    cache: "no-store", // avoid 304/etag cache confusing auth flows
    headers,
    body: json ? JSON.stringify(json) : undefined,
    ...rest,
  });

  console.log("🌐 Response status:", res.status);
  console.log(
    "🌐 Response headers:",
    Object.fromEntries(res.headers.entries())
  );

  // Handle authentication errors specifically
  if (res.status === 401) {
    console.log("🔐 Authentication error (401) - attempting token refresh");

    // Don't try to refresh for auth endpoints to prevent infinite loops
    if (
      path.includes("/auth/login") ||
      path.includes("/auth/register") ||
      path.includes("/auth/refresh-token")
    ) {
      console.log("🔐 Auth endpoint - not attempting refresh");
      // Clear invalid tokens
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }

      const errorData = await res
        .json()
        .catch(() => ({ message: "Authentication failed" }));

      throw new Error(errorData.message || "Authentication failed");
    }

    // Try to refresh the token
    const newToken = await refreshAccessToken();

    if (newToken) {
      // Retry the original request with the new token
      console.log("🔄 Retrying request with refreshed token");
      headers.Authorization = `Bearer ${newToken}`;

      const retryRes = await fetch(`${backendUrl}${path}`, {
        credentials: "include",
        cache: "no-store",
        headers,
        body: json ? JSON.stringify(json) : undefined,
        ...rest,
      });

      if (retryRes.ok) {
        const data = await retryRes.json();
        console.log("✅ Request succeeded after token refresh");
        return data as T;
      } else {
        console.log("❌ Request failed even after token refresh");
        // Clear tokens and throw error
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
        }

        const errorData = await retryRes
          .json()
          .catch(() => ({ message: "Authentication failed" }));

        throw new Error(errorData.message || "Authentication failed");
      }
    } else {
      console.log("🔐 Token refresh failed - clearing invalid tokens");
      // Clear invalid tokens
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }

      const errorData = await res
        .json()
        .catch(() => ({ message: "Authentication failed" }));

      throw new Error(errorData.message || "Authentication failed");
    }
  }

  // Treat 304 as a cache issue and retry once with a cache-buster
  if (res.status === 304) {
    const retryUrl = `${backendUrl}${path}${
      path.includes("?") ? "&" : "?"
    }_=${Date.now()}`;
    const retry = await fetch(retryUrl, {
      credentials: "include",
      cache: "no-store",
      headers,
      body: json ? JSON.stringify(json) : undefined,
      ...rest,
    });
    if (!retry.ok) {
      const retryErr = await retry
        .json()
        .catch(() => ({ message: "Request failed" }));
      throw new Error(
        retryErr.message || `HTTP ${retry.status}: ${retry.statusText}`
      );
    }
    return (await retry.json()) as T;
  }

  if (!res.ok) {
    const errorData = await res
      .json()
      .catch(() => ({ message: "Request failed" }));
    console.error("🌐 API Error:", errorData);
    throw new Error(
      errorData.message || `HTTP ${res.status}: ${res.statusText}`
    );
  }

  const data = await res.json();
  console.log("🌐 Response data:", data);
  return data as T;
}

// Logout utility function
export async function logout(): Promise<void> {
  try {
    console.log("🚪 Logging out...");
    await api("/api/auth/logout", { method: "POST" });
    console.log("✅ Logout successful");
  } catch (error) {
    console.error("❌ Logout failed:", error);
    // Even if logout fails, we still want to clear the session
  } finally {
    // Always clear the token from localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      console.log("🗑️ Token cleared from localStorage");
    }
  }
}

// Clear all authentication state utility
export function clearAuthState(): void {
  if (typeof window !== "undefined") {
    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("admin_token");

    // Clear sessionStorage
    sessionStorage.clear();

    // Clear cookies by setting them to expire in the past
    document.cookie =
      "rb_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie =
      "admin_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    console.log("🧹 All authentication state cleared");
  }
}

// Project API Types
export interface Project {
  _id: string;
  user_id: string;
  name: string;
  client: string;
  description: string;
  status: "active" | "completed" | "on-hold" | "cancelled";
  progress: number;
  budget: number;
  spent: number;
  revenue: number;
  startDate: string;
  endDate: string;
  teamMembers: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  _id: string;
  project_id: string;
  name: string;
  description: string;
  status: "pending" | "in-progress" | "completed";
  assignedTo: string;
  estimatedHours: number;
  actualHours: number;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimeEntry {
  _id: string;
  project_id: string;
  task: string;
  user: string;
  date: string;
  hours: number;
  description: string;
  billable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  _id: string;
  project_id: string;
  number: string;
  date: string;
  amount: number;
  status: "draft" | "sent" | "paid" | "overdue";
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  _id: string;
  project_id: string;
  description: string;
  amount: number;
  date: string;
  category: "travel" | "meals" | "supplies" | "equipment" | "other";
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
}

export interface ProjectDetails extends Project {
  tasks: Task[];
  timeEntries: TimeEntry[];
  invoices: Invoice[];
  expenses: Expense[];
}

export interface ProjectStats {
  totalEstimatedHours: number;
  totalActualHours: number;
  totalTimeEntries: number;
  totalInvoiced: number;
  totalExpenses: number;
  paidInvoices: number;
  netProfit: number;
  profitMargin: number;
}

// Project API Functions
export const projectApi = {
  // Project CRUD
  list: () => api<Project[]>("/api/projects"),
  getById: (id: string) => api<ProjectDetails>(`/api/projects/${id}`),
  create: (data: Partial<Project>) =>
    api<Project>("/api/projects", { method: "POST", json: data }),
  update: (id: string, data: Partial<Project>) =>
    api<Project>(`/api/projects/${id}`, { method: "PUT", json: data }),
  delete: (id: string) => api(`/api/projects/${id}`, { method: "DELETE" }),
  getStats: (id: string) => api<ProjectStats>(`/api/projects/${id}/stats`),

  // Task operations
  getTasks: (projectId: string) =>
    api<Task[]>(`/api/projects/${projectId}/tasks`),
  createTask: (projectId: string, data: Partial<Task>) =>
    api<Task>(`/api/projects/${projectId}/tasks`, {
      method: "POST",
      json: data,
    }),
  updateTask: (projectId: string, taskId: string, data: Partial<Task>) =>
    api<Task>(`/api/projects/${projectId}/tasks/${taskId}`, {
      method: "PUT",
      json: data,
    }),
  deleteTask: (projectId: string, taskId: string) =>
    api(`/api/projects/${projectId}/tasks/${taskId}`, { method: "DELETE" }),

  // Time entry operations
  getTimeEntries: (projectId: string) =>
    api<TimeEntry[]>(`/api/projects/${projectId}/time-entries`),
  createTimeEntry: (projectId: string, data: Partial<TimeEntry>) =>
    api<TimeEntry>(`/api/projects/${projectId}/time-entries`, {
      method: "POST",
      json: data,
    }),
  updateTimeEntry: (
    projectId: string,
    timeEntryId: string,
    data: Partial<TimeEntry>
  ) =>
    api<TimeEntry>(`/api/projects/${projectId}/time-entries/${timeEntryId}`, {
      method: "PUT",
      json: data,
    }),
  deleteTimeEntry: (projectId: string, timeEntryId: string) =>
    api(`/api/projects/${projectId}/time-entries/${timeEntryId}`, {
      method: "DELETE",
    }),

  // Invoice operations
  getInvoices: (projectId: string) =>
    api<Invoice[]>(`/api/projects/${projectId}/invoices`),
  createInvoice: (projectId: string, data: Partial<Invoice>) =>
    api<Invoice>(`/api/projects/${projectId}/invoices`, {
      method: "POST",
      json: data,
    }),
  updateInvoice: (
    projectId: string,
    invoiceId: string,
    data: Partial<Invoice>
  ) =>
    api<Invoice>(`/api/projects/${projectId}/invoices/${invoiceId}`, {
      method: "PUT",
      json: data,
    }),
  deleteInvoice: (projectId: string, invoiceId: string) =>
    api(`/api/projects/${projectId}/invoices/${invoiceId}`, {
      method: "DELETE",
    }),

  // Expense operations
  getExpenses: (projectId: string) =>
    api<Expense[]>(`/api/projects/${projectId}/expenses`),
  createExpense: (projectId: string, data: Partial<Expense>) =>
    api<Expense>(`/api/projects/${projectId}/expenses`, {
      method: "POST",
      json: data,
    }),
  updateExpense: (
    projectId: string,
    expenseId: string,
    data: Partial<Expense>
  ) =>
    api<Expense>(`/api/projects/${projectId}/expenses/${expenseId}`, {
      method: "PUT",
      json: data,
    }),
  deleteExpense: (projectId: string, expenseId: string) =>
    api(`/api/projects/${projectId}/expenses/${expenseId}`, {
      method: "DELETE",
    }),
};

// API utility functions
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

// Chart of Accounts API endpoints
export const CHART_OF_ACCOUNTS_API = {
  BASE: `${API_BASE_URL}/api/chart-of-accounts`,
  UPLOAD_EXCEL: `${API_BASE_URL}/api/chart-of-accounts/upload-excel`,
  CATEGORIES: `${API_BASE_URL}/api/chart-of-accounts/categories`,
  HIERARCHY: `${API_BASE_URL}/api/chart-of-accounts/hierarchy`,
  EXPORT: `${API_BASE_URL}/api/chart-of-accounts/export-excel`,
};

// Generic API request helper
export const apiRequest = async (url: string, options: RequestInit = {}) => {
  const defaultOptions: RequestInit = {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, defaultOptions);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `API request failed: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  return response.json();
};

// Chart of Accounts specific API functions
export const chartOfAccountsAPI = {
  // Get all accounts
  getAll: (params?: Record<string, string>) => {
    const searchParams = params ? new URLSearchParams(params).toString() : "";
    const url = searchParams
      ? `${CHART_OF_ACCOUNTS_API.BASE}?${searchParams}`
      : CHART_OF_ACCOUNTS_API.BASE;
    console.log("🌐 Chart of Accounts API URL:", url);
    console.log("🌐 Chart of Accounts API params:", params);
    return apiRequest(url);
  },

  // Create account
  create: (accountData: Record<string, unknown>) => {
    return apiRequest(CHART_OF_ACCOUNTS_API.BASE, {
      method: "POST",
      body: JSON.stringify(accountData),
    });
  },

  // Create default accounts
  createDefaults: () => {
    return apiRequest(`${CHART_OF_ACCOUNTS_API.BASE}/create-defaults`, {
      method: "POST",
    });
  },

  // Update account
  update: (id: string, accountData: Record<string, unknown>) => {
    return apiRequest(`${CHART_OF_ACCOUNTS_API.BASE}/${id}`, {
      method: "PUT",
      body: JSON.stringify(accountData),
    });
  },

  // Delete account
  delete: (id: string) => {
    return apiRequest(`${CHART_OF_ACCOUNTS_API.BASE}/${id}`, {
      method: "DELETE",
    });
  },

  // Get categories
  getCategories: () => {
    return apiRequest(CHART_OF_ACCOUNTS_API.CATEGORIES);
  },

  // Get hierarchy
  getHierarchy: () => {
    return apiRequest(CHART_OF_ACCOUNTS_API.HIERARCHY);
  },

  // Upload Excel file
  uploadExcelFile: (formData: FormData) => {
    return fetch(CHART_OF_ACCOUNTS_API.UPLOAD_EXCEL, {
      method: "POST",
      body: formData,
      credentials: "include",
    }).then((response) => {
      if (!response.ok) {
        throw new Error("Upload failed");
      }
      return response.json();
    });
  },

  // Upload parsed Excel data
  uploadExcelData: (accountsData: ExcelAccountData[]) => {
    return apiRequest(CHART_OF_ACCOUNTS_API.UPLOAD_EXCEL, {
      method: "POST",
      body: JSON.stringify({ accounts: accountsData }),
    });
  },

  // Export Excel
  exportExcel: () => {
    return fetch(CHART_OF_ACCOUNTS_API.EXPORT, {
      credentials: "include",
    }).then((response) => {
      if (!response.ok) {
        throw new Error("Export failed");
      }
      return response.blob();
    });
  },

  // Get account by ID
  getById: (id: string) => {
    return apiRequest(`${CHART_OF_ACCOUNTS_API.BASE}/${id}`);
  },

  // Get sub-accounts
  getSubAccounts: (parentId: string) => {
    return apiRequest(`${CHART_OF_ACCOUNTS_API.BASE}/${parentId}/sub-accounts`);
  },
};
