// src/lib/api.ts
export async function api<T = unknown>(
  path: string,
  init: RequestInit & { json?: unknown } = {}
): Promise<T> {
  const { json, ...rest } = init;

  // Use hardcoded backend URL for now
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
  console.log("🌐 Making request to:", `${backendUrl}${path}`);
  console.log("🌐 Request method:", init.method || "GET");
  console.log("🌐 Request body:", json);

  const res = await fetch(`${backendUrl}${path}`, {
    credentials: "include", // include cookies for cross-origin
    cache: "no-store", // avoid 304/etag cache confusing auth flows
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    body: json ? JSON.stringify(json) : undefined,
    ...rest,
  });

  console.log("🌐 Response status:", res.status);
  console.log(
    "🌐 Response headers:",
    Object.fromEntries(res.headers.entries())
  );

  // Treat 304 as a cache issue and retry once with a cache-buster
  if (res.status === 304) {
    const retryUrl = `${backendUrl}${path}${
      path.includes("?") ? "&" : "?"
    }_=${Date.now()}`;
    const retry = await fetch(retryUrl, {
      credentials: "include",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(init.headers || {}),
      },
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
