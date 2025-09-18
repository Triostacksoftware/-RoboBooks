import { api } from "../lib/api";

// Lightweight wrapper to mimic axios `{ data }` shape
const http = {
  get: async (path, options = {}) => {
    const params = options.params || undefined;
    const query = params ? `??{new URLSearchParams(params).toString()}` : "";
    const data = await api(`/api?{path}?{query}`);
    return { data };
  },
  post: async (path, body) => {
    const data = await api(`/api?{path}`, { method: "POST", json: body });
    return { data };
  },
  put: async (path, body) => {
    const data = await api(`/api?{path}`, { method: "PUT", json: body });
    return { data };
  },
  delete: async (path) => {
    const data = await api(`/api?{path}`, { method: "DELETE" });
    return { data };
  },
};

// Chart of Accounts Management
export const accountService = {
  // Get all accounts
  getAccounts: (params) => http.get("/accounts", { params }),

  // Get account by ID
  getAccount: (id) => http.get(`/accounts/?{id}`),

  // Get accounts by category (asset, liability, equity, income, expense)
  getAccountsByCategory: (category) =>
    http.get("/accounts", { params: { accountHead: category } }),

  // Get active accounts only
  getActiveAccounts: () =>
    http.get("/accounts", { params: { isActive: true } }),
};

// Mock data for development/testing
export const mockAccountData = {
  accounts: [
    // Assets
    {
      id: 1,
      code: "1001",
      name: "Cash",
      accountHead: "asset",
      accountGroup: "Current Asset",
      isActive: true,
    },
    {
      id: 2,
      code: "1002",
      name: "Bank - ICICI",
      accountHead: "asset",
      accountGroup: "Bank",
      isActive: true,
    },
    {
      id: 3,
      code: "1003",
      name: "Bank - HDFC",
      accountHead: "asset",
      accountGroup: "Bank",
      isActive: true,
    },
    {
      id: 4,
      code: "1200",
      name: "Accounts Receivable",
      accountHead: "asset",
      accountGroup: "Accounts Receivable",
      isActive: true,
    },

    // Liabilities
    {
      id: 5,
      code: "2001",
      name: "Accounts Payable",
      accountHead: "liability",
      accountGroup: "Accounts Payable",
      isActive: true,
    },
    {
      id: 6,
      code: "2002",
      name: "Credit Card - AMEX",
      accountHead: "liability",
      accountGroup: "Credit Card",
      isActive: true,
    },
    {
      id: 7,
      code: "2100",
      name: "GST Payable",
      accountHead: "liability",
      accountGroup: "Current Liability",
      isActive: true,
    },

    // Income
    {
      id: 8,
      code: "4001",
      name: "Sales Revenue",
      accountHead: "income",
      accountGroup: "Sales",
      isActive: true,
    },
    {
      id: 9,
      code: "4002",
      name: "Service Revenue",
      accountHead: "income",
      accountGroup: "Service Revenue",
      isActive: true,
    },
    {
      id: 10,
      code: "4100",
      name: "Interest Income",
      accountHead: "income",
      accountGroup: "Interest Income",
      isActive: true,
    },

    // Expenses
    {
      id: 11,
      code: "5001",
      name: "Office Supplies",
      accountHead: "expense",
      accountGroup: "Operating Expense",
      isActive: true,
    },
    {
      id: 12,
      code: "5002",
      name: "Transportation",
      accountHead: "expense",
      accountGroup: "Operating Expense",
      isActive: true,
    },
    {
      id: 13,
      code: "5003",
      name: "Software Subscriptions",
      accountHead: "expense",
      accountGroup: "Operating Expense",
      isActive: true,
    },
    {
      id: 14,
      code: "5004",
      name: "Marketing Expense",
      accountHead: "expense",
      accountGroup: "Operating Expense",
      isActive: true,
    },
    {
      id: 15,
      code: "5005",
      name: "Utilities Expense",
      accountHead: "expense",
      accountGroup: "Operating Expense",
      isActive: true,
    },
    {
      id: 16,
      code: "5006",
      name: "Rent Expense",
      accountHead: "expense",
      accountGroup: "Operating Expense",
      isActive: true,
    },
    {
      id: 17,
      code: "5007",
      name: "Professional Services",
      accountHead: "expense",
      accountGroup: "Operating Expense",
      isActive: true,
    },

    // Equity
    {
      id: 18,
      code: "3001",
      name: "Owner's Capital",
      accountHead: "equity",
      accountGroup: "Owner Equity",
      isActive: true,
    },
    {
      id: 19,
      code: "3002",
      name: "Retained Earnings",
      accountHead: "equity",
      accountGroup: "Retained Earnings",
      isActive: true,
    },
  ],
};

export default accountService;
