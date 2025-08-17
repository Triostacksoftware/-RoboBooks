/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "@/lib/api";

// Lightweight wrapper to mimic axios `{ data }` shape
export const apiClient = {
  get: async (path: string, options: { responseType?: string } = {}) => {
    const data = await api(path);
    return { data };
  },

  post: async (path: string, body: any) => {
    const data = await api(path, { method: "POST", json: body });
    return { data };
  },

  put: async (path: string, body: any) => {
    const data = await api(path, { method: "PUT", json: body });
    return { data };
  },

  patch: async (path: string, body: any) => {
    const data = await api(path, { method: "PATCH", json: body });
    return { data };
  },

  delete: async (path: string) => {
    const data = await api(path, { method: "DELETE" });
    return { data };
  },
};
