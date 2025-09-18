import { api } from "@/lib/api";

// Lightweight wrapper to mimic axios `{ data }` shape
const http = {
  get: async (path, options = {}) => {
    const params = options.params || undefined;
    const query = params ? `?${new URLSearchParams(params).toString()}` : "";
    const response = await api(`/api${path}${query}`);
    // Extract data from the API response structure {success: true, data: [...]}
    return { data: response.data || response };
  },
  post: async (path, body) => {
    const response = await api(`/api${path}`, { method: "POST", json: body });
    return { data: response.data || response };
  },
  put: async (path, body) => {
    const response = await api(`/api${path}`, { method: "PUT", json: body });
    return { data: response.data || response };
  },
  patch: async (path, body) => {
    const response = await api(`/api${path}`, { method: "PATCH", json: body });
    return { data: response.data || response };
  },
  delete: async (path) => {
    const response = await api(`/api${path}`, { method: "DELETE" });
    return { data: response.data || response };
  },
};

// Bank Account Management
export const bankingService = {
  // Bank Accounts
  getBankAccounts: () => http.get("/banking/accounts"),
  getBankAccount: (id) => http.get(`/banking/accounts/${id}`),
  createBankAccount: (data) => http.post("/banking/accounts", data),
  updateBankAccount: (id, data) => http.put(`/banking/accounts/${id}`, data),
  deleteBankAccount: (id) => http.delete(`/banking/accounts/${id}`),
  syncBankAccount: (id) => http.patch(`/banking/accounts/${id}/sync`),
  getAccountTransactions: (id, params) =>
    http.get(`/banking/accounts/${id}/transactions`, { params }),
  getBankAccountsSummary: () => http.get("/banking/overview"),

  // Bank Transactions
  getTransactions: (params) => http.get("/banking/transactions", { params }),
  getTransaction: (id) => http.get(`/banking/transactions/${id}`),
  createTransaction: (data) => http.post("/banking/transactions", data),
  updateTransaction: (id, data) => http.put(`/banking/transactions/${id}`, data),
  deleteTransaction: (id) => http.delete(`/banking/transactions/${id}`),
  reconcileTransaction: (id) =>
    http.patch(`/banking/transactions/${id}/reconcile`),
  categorizeTransaction: (id, data) =>
    http.patch(`/banking/transactions/${id}/categorize`, data),
  getTransactionCategories: () => http.get("/banking/transactions/categories"),
  getTransactionSummary: (params) =>
    http.get("/banking/transactions/summary", { params }),

  // Bank Reconciliation
  getReconciliations: (params) => http.get("/banking/reconciliations", { params }),
  getAccountReconciliations: (accountId) =>
    http.get(`/banking/reconciliations/account/${accountId}`),
  createReconciliation: (data) => http.post("/banking/reconciliations", data),
  autoMatchReconciliation: (accountId) =>
    http.post(`/banking/reconciliations/${accountId}/auto-match`),

  // Banking Overview & Analytics
  getBankingOverview: (params) => http.get("/banking/overview", { params }),
  getCashFlow: (params) => http.get("/banking/cash-flow", { params }),
  getAccountAnalytics: (accountId, params) =>
    http.get(`/banking/account-analytics/${accountId}`, { params }),
  getSyncStatus: () => http.get("/banking/sync-status"),
};

// Mock data for development/testing
export const mockBankingData = {
  accounts: [
    {
      id: 1,
      name: "Business Checking Account",
      bank: "Chase Bank",
      accountNumber: "****1234",
      balance: 45250.75,
      type: "checking",
      status: "connected",
      lastSync: "2024-01-15T10:30:00Z",
      currency: "USD",
      accountType: "Business",
      routingNumber: "021000021",
      swiftCode: "CHASUS33",
    },
    {
      id: 2,
      name: "Savings Account",
      bank: "Wells Fargo",
      accountNumber: "****5678",
      balance: 125000.0,
      type: "savings",
      status: "connected",
      lastSync: "2024-01-15T09:15:00Z",
      currency: "USD",
      accountType: "Personal",
    },
    {
      id: 3,
      name: "Credit Card",
      bank: "American Express",
      accountNumber: "****9012",
      balance: -3240.5,
      type: "credit",
      status: "connected",
      lastSync: "2024-01-15T08:45:00Z",
      currency: "USD",
      accountType: "Business",
    },
    {
      id: 4,
      name: "Business Loan",
      bank: "Bank of America",
      accountNumber: "****3456",
      balance: -75000.0,
      type: "loan",
      status: "connected",
      lastSync: "2024-01-14T16:20:00Z",
      currency: "USD",
      accountType: "Term Loan",
    },
  ],

  transactions: [
    {
      id: 1,
      description: "Client Payment - ABC Corp",
      amount: 5000.0,
      type: "income",
      category: "Client Payments",
      date: "2024-01-15",
      account: "Business Checking Account",
      status: "reconciled",
      reference: "INV-2024-001",
    },
    {
      id: 2,
      description: "Office Supplies - Staples",
      amount: -245.75,
      type: "expense",
      category: "Office Supplies",
      date: "2024-01-14",
      account: "Business Checking Account",
      status: "pending",
      reference: "TXN-001",
    },
    {
      id: 3,
      description: "Software Subscription - Adobe",
      amount: -89.99,
      type: "expense",
      category: "Software",
      date: "2024-01-13",
      account: "Business Checking Account",
      status: "reconciled",
      reference: "ADOBE-001",
    },
    {
      id: 4,
      description: "Transportation - Uber",
      amount: -32.5,
      type: "expense",
      category: "Transportation",
      date: "2024-01-12",
      account: "Credit Card",
      status: "unreconciled",
      reference: "UBER-001",
    },
  ],

  reconciliationData: {
    accountName: "Business Checking Account",
    bankBalance: 45250.75,
    bookBalance: 45250.75,
    difference: 0,
    items: [
      {
        id: 1,
        bankTransaction: {
          id: "BT-001",
          description: "Client Payment - ABC Corp",
          amount: 5000.0,
          date: "2024-01-15",
          reference: "INV-2024-001",
        },
        bookTransaction: {
          id: "BK-001",
          description: "Invoice Payment - ABC Corp",
          amount: 5000.0,
          date: "2024-01-15",
          type: "invoice",
        },
        status: "matched",
        difference: 0,
      },
      {
        id: 2,
        bankTransaction: {
          id: "BT-002",
          description: "Office Supplies - Staples",
          amount: 245.75,
          date: "2024-01-14",
          reference: "TXN-001",
        },
        status: "unmatched",
        difference: 245.75,
      },
    ],
  },

  // Import transactions for specific account
  importTransactions: async (formData) => {
    const response = await fetch('/api/banking/import-transactions', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to import transactions');
    }
    
    return await response.json();
  },
};

export default bankingService;
