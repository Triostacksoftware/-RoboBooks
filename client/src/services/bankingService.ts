import { apiClient } from "./apiClient";

export interface BankAccount {
  _id: string;
  name: string;
  accountCode?: string;
  currency: string;
  accountNumber?: string;
  bankName?: string;
  ifsc?: string;
  description?: string;
  isPrimary: boolean;
  accountType: "bank" | "credit_card";
  balance: number;
  status: "active" | "inactive" | "closed";
  lastSync?: Date;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface BankTransaction {
  _id: string;
  accountId: string;
  userId: string;
  date: string;
  description: string;
  payee?: string;
  referenceNumber?: string;
  withdrawals: number;
  deposits: number;
  amount: number;
  type: "deposit" | "withdrawal";
  category?: string;
  status: "uncategorized" | "categorized" | "reconciled";
  isImported: boolean;
  importSource: "manual" | "csv" | "excel" | "pdf" | "ofx" | "qif" | "camt";
  importBatchId?: string;
  originalData?: any;
  createdAt: string;
  updatedAt: string;
}

export interface ImportData {
  importId: string;
  fileName: string;
  totalRows: number;
  headers: string[];
  autoMapping: Record<string, string>;
  sampleData: any[];
}

export interface FieldMapping {
  date: string;
  description: string;
  payee: string;
  referenceNumber: string;
  withdrawals: string;
  deposits: string;
}

export interface ImportPreview {
  processedData: any[];
  totalRows: number;
  readyRows: number;
}

export interface BankingOverview {
  totalAccounts: number;
  totalBalance: number;
  accounts: {
    id: string;
    name: string;
    balance: number;
    currency: string;
    type: string;
  }[];
}

class BankingService {
  // Bank Account Management
  async getBankAccounts(): Promise<{ success: boolean; data: BankAccount[] }> {
    const response = await apiClient.get("/banking/accounts");
    return response.data as { success: boolean; data: BankAccount[] };
  }

  async createBankAccount(
    accountData: Partial<BankAccount>
  ): Promise<{ success: boolean; data: BankAccount }> {
    const response = await apiClient.post("/banking/accounts", accountData);
    return response.data as { success: boolean; data: BankAccount };
  }

  async updateBankAccount(
    id: string,
    accountData: Partial<BankAccount>
  ): Promise<{ success: boolean; data: BankAccount }> {
    const response = await apiClient.put(
      `/banking/accounts/${id}`,
      accountData
    );
    return response.data as { success: boolean; data: BankAccount };
  }

  async deleteBankAccount(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/banking/accounts/${id}`);
    return response.data as { success: boolean; message: string };
  }

  // Transaction Management
  async getTransactions(
    accountId?: string,
    page = 1,
    limit = 50,
    status?: string
  ): Promise<{
    success: boolean;
    data: BankTransaction[];
    pagination: {
      current: number;
      total: number;
      hasNext: boolean;
    };
  }> {
    const params = new URLSearchParams();
    if (accountId) params.append("accountId", accountId);
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    if (status) params.append("status", status);

    const response = await apiClient.get(
      `/banking/transactions?${params.toString()}`
    );
    return response.data as {
      success: boolean;
      data: BankTransaction[];
      pagination: {
        current: number;
        total: number;
        hasNext: boolean;
      };
    };
  }

  // Bank Statement Import
  async uploadStatement(
    file: File,
    accountId: string
  ): Promise<{ success: boolean; data: ImportData }> {
    const formData = new FormData();
    formData.append("statement", file);
    formData.append("accountId", accountId);

    const response = await apiClient.post("/banking/import/upload", formData);
    return response.data as { success: boolean; data: ImportData };
  }

  async updateFieldMapping(
    importId: string,
    fieldMapping: FieldMapping,
    dateFormat: string,
    decimalFormat: string
  ): Promise<{ success: boolean; data: ImportPreview }> {
    const response = await apiClient.put(
      `/banking/import/${importId}/mapping`,
      {
        fieldMapping,
        dateFormat,
        decimalFormat,
      }
    );
    return response.data as { success: boolean; data: ImportPreview };
  }

  async importTransactions(importId: string): Promise<{
    success: boolean;
    message: string;
    data: {
      importedCount: number;
      importBatchId: string;
    };
  }> {
    const response = await apiClient.post(
      `/banking/import/${importId}/process`,
      {}
    );
    return response.data as {
      success: boolean;
      message: string;
      data: {
        importedCount: number;
        importBatchId: string;
      };
    };
  }

  async getImportStatus(importId: string): Promise<{
    success: boolean;
    data: {
      status: string;
      fileName: string;
      totalRows: number;
      importedRows: number;
      errorRows: number;
      fieldMapping: FieldMapping;
      processedData: any[];
    };
  }> {
    const response = await apiClient.get(`/banking/import/${importId}/status`);
    return response.data as {
      success: boolean;
      data: {
        status: string;
        fileName: string;
        totalRows: number;
        importedRows: number;
        errorRows: number;
        fieldMapping: FieldMapping;
        processedData: any[];
      };
    };
  }

  // Banking Overview
  async getBankingOverview(): Promise<{
    success: boolean;
    data: BankingOverview;
  }> {
    const response = await apiClient.get("/banking/overview");
    return response.data as { success: boolean; data: BankingOverview };
  }

  // Legacy methods for backward compatibility
  async syncBankAccount(accountId: string): Promise<any> {
    // This would be implemented when real bank integration is added
    console.log("Syncing account:", accountId);
    return { success: true, message: "Account synced successfully" };
  }
}

export const bankingService = new BankingService();
