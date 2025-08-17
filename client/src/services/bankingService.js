import { api } from '@/lib/api';

// Lightweight wrapper to mimic axios `{ data }` shape
const http = {
  get: async (path, options = {}) => {
    const params = options.params || undefined;
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    const data = await api(`/api${path}${query}`);
    return { data };
  },
  post: async (path, body) => {
    const data = await api(`/api${path}`, { method: 'POST', json: body });
    return { data };
  },
  put: async (path, body) => {
    const data = await api(`/api${path}`, { method: 'PUT', json: body });
    return { data };
  },
  patch: async (path, body) => {
    const data = await api(`/api${path}`, { method: 'PATCH', json: body });
    return { data };
  },
  delete: async (path) => {
    const data = await api(`/api${path}`, { method: 'DELETE' });
    return { data };
  }
};

// Bank Account Management
export const bankingService = {
  // Bank Accounts
  getBankAccounts: () => http.get('/api/bank-accounts'),
  getBankAccount: (id) => http.get(`/api/bank-accounts/${id}`),
  createBankAccount: (data) => http.post('/api/bank-accounts', data),
  updateBankAccount: (id, data) => http.put(`/api/bank-accounts/${id}`, data),
  deleteBankAccount: (id) => http.delete(`/api/bank-accounts/${id}`),
  syncBankAccount: (id) => http.patch(`/api/bank-accounts/${id}/sync`),
  getAccountTransactions: (id, params) => http.get(`/api/bank-accounts/${id}/transactions`, { params }),
  getBankAccountsSummary: () => http.get('/api/bank-accounts/summary'),

  // Bank Transactions
  getTransactions: (params) => http.get('/api/bank-transactions', { params }),
  getTransaction: (id) => http.get(`/api/bank-transactions/${id}`),
  createTransaction: (data) => http.post('/api/bank-transactions', data),
  updateTransaction: (id, data) => http.put(`/api/bank-transactions/${id}`, data),
  deleteTransaction: (id) => http.delete(`/api/bank-transactions/${id}`),
  reconcileTransaction: (id) => http.patch(`/api/bank-transactions/${id}/reconcile`),
  categorizeTransaction: (id, data) => http.patch(`/api/bank-transactions/${id}/categorize`, data),
  getTransactionCategories: () => http.get('/api/bank-transactions/categories'),
  getTransactionSummary: (params) => http.get('/api/bank-transactions/summary', { params }),

  // Bank Reconciliation
  getReconciliations: () => http.get('/api/bank-reconciliations'),
  getReconciliation: (id) => http.get(`/api/bank-reconciliations/${id}`),
  createReconciliation: (data) => http.post('/api/bank-reconciliations', data),
  updateReconciliation: (id, data) => http.put(`/api/bank-reconciliations/${id}`, data),
  updateReconciliationItem: (id, itemId, data) => http.patch(`/api/bank-reconciliations/${id}/items/${itemId}`, data),
  completeReconciliation: (id) => http.post(`/api/bank-reconciliations/${id}/complete`),
  autoMatchReconciliation: (id) => http.post(`/api/bank-reconciliations/${id}/auto-match`),
  getAccountReconciliations: (accountId) => http.get(`/api/bank-reconciliations/account/${accountId}`),

  // Banking Overview & Analytics
  getBankingOverview: (params) => http.get('/api/banking/overview', { params }),
  getCashFlow: (params) => http.get('/api/banking/cash-flow', { params }),
  getAccountAnalytics: (accountId, params) => http.get(`/api/banking/account-analytics/${accountId}`, { params }),
  getSyncStatus: () => http.get('/api/banking/sync-status'),
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
      swiftCode: "CHASUS33"
    },
    {
      id: 2,
      name: "Savings Account",
      bank: "Wells Fargo",
      accountNumber: "****5678",
      balance: 125000.00,
      type: "savings",
      status: "connected",
      lastSync: "2024-01-15T09:15:00Z",
      currency: "USD",
      accountType: "Personal"
    },
    {
      id: 3,
      name: "Credit Card",
      bank: "American Express",
      accountNumber: "****9012",
      balance: -3240.50,
      type: "credit",
      status: "connected",
      lastSync: "2024-01-15T08:45:00Z",
      currency: "USD",
      accountType: "Business"
    },
    {
      id: 4,
      name: "Business Loan",
      bank: "Bank of America",
      accountNumber: "****3456",
      balance: -75000.00,
      type: "loan",
      status: "connected",
      lastSync: "2024-01-14T16:20:00Z",
      currency: "USD",
      accountType: "Term Loan"
    }
  ],

  transactions: [
    {
      id: 1,
      description: "Client Payment - ABC Corp",
      amount: 5000.00,
      type: "income",
      category: "Client Payments",
      date: "2024-01-15",
      account: "Business Checking Account",
      status: "reconciled",
      reference: "INV-2024-001"
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
      reference: "TXN-001"
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
      reference: "ADOBE-001"
    },
    {
      id: 4,
      description: "Transportation - Uber",
      amount: -32.50,
      type: "expense",
      category: "Transportation",
      date: "2024-01-12",
      account: "Credit Card",
      status: "unreconciled",
      reference: "UBER-001"
    }
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
          amount: 5000.00,
          date: "2024-01-15",
          reference: "INV-2024-001"
        },
        bookTransaction: {
          id: "BK-001",
          description: "Invoice Payment - ABC Corp",
          amount: 5000.00,
          date: "2024-01-15",
          type: "invoice"
        },
        status: "matched",
        difference: 0
      },
      {
        id: 2,
        bankTransaction: {
          id: "BT-002",
          description: "Office Supplies - Staples",
          amount: 245.75,
          date: "2024-01-14",
          reference: "TXN-001"
        },
        status: "unmatched",
        difference: 245.75
      }
    ]
  }
};

export default bankingService;
