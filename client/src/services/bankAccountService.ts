import { apiClient } from './apiClient';

export interface BankAccount {
  _id: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  branch: string;
  accountType: 'savings' | 'current' | 'credit' | 'loan';
  balance: number;
  currency: string;
  status: 'active' | 'inactive' | 'suspended';
  openingBalance: number;
  openingDate: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBankAccountRequest {
  accountName: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  branch: string;
  accountType: string;
  openingBalance: number;
  currency: string;
  openingDate: string;
  notes?: string;
}

export interface UpdateBankAccountRequest {
  accountName?: string;
  accountNumber?: string;
  bankName?: string;
  ifscCode?: string;
  branch?: string;
  accountType?: string;
  balance?: number;
  currency?: string;
  status?: string;
  notes?: string;
}

export interface BankAccountFilters {
  page?: number;
  limit?: number;
  accountType?: string;
  status?: string;
  bankName?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

class BankAccountService {
  private baseUrl = '/api/bank-accounts';

  // Get all bank accounts with filtering and pagination
  async getBankAccounts(filters: BankAccountFilters = {}): Promise<ApiResponse<PaginatedResponse<BankAccount>>> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await apiClient.get(`${this.baseUrl}?${params.toString()}`);
    return response.data;
  }

  // Get single bank account by ID
  async getBankAccountById(id: string): Promise<ApiResponse<BankAccount>> {
    const response = await apiClient.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  // Create new bank account
  async createBankAccount(bankAccountData: CreateBankAccountRequest): Promise<ApiResponse<BankAccount>> {
    const response = await apiClient.post(this.baseUrl, bankAccountData);
    return response.data;
  }

  // Update bank account
  async updateBankAccount(id: string, bankAccountData: UpdateBankAccountRequest): Promise<ApiResponse<BankAccount>> {
    const response = await apiClient.put(`${this.baseUrl}/${id}`, bankAccountData);
    return response.data;
  }

  // Delete bank account
  async deleteBankAccount(id: string): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.delete(`${this.baseUrl}/${id}`);
    return response.data;
  }

  // Get active bank accounts
  async getActiveBankAccounts(): Promise<ApiResponse<BankAccount[]>> {
    const response = await apiClient.get(`${this.baseUrl}/active`);
    return response.data;
  }

  // Get bank accounts by type
  async getBankAccountsByType(accountType: string): Promise<ApiResponse<BankAccount[]>> {
    const response = await apiClient.get(`${this.baseUrl}/type/${accountType}`);
    return response.data;
  }

  // Update bank account balance
  async updateBalance(id: string, newBalance: number): Promise<ApiResponse<BankAccount>> {
    const response = await apiClient.patch(`${this.baseUrl}/${id}/balance`, { balance: newBalance });
    return response.data;
  }

  // Get bank account summary
  async getBankAccountSummary(): Promise<ApiResponse<any>> {
    const response = await apiClient.get(`${this.baseUrl}/summary`);
    return response.data;
  }

  // Validate bank account data
  validateBankAccountData(data: CreateBankAccountRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.accountName || data.accountName.trim().length === 0) {
      errors.push('Account name is required');
    }

    if (!data.accountNumber || data.accountNumber.trim().length === 0) {
      errors.push('Account number is required');
    }

    if (!data.bankName || data.bankName.trim().length === 0) {
      errors.push('Bank name is required');
    }

    if (!data.ifscCode || data.ifscCode.trim().length === 0) {
      errors.push('IFSC code is required');
    }

    if (!data.branch || data.branch.trim().length === 0) {
      errors.push('Branch is required');
    }

    if (!data.accountType) {
      errors.push('Account type is required');
    }

    if (data.openingBalance === undefined || data.openingBalance < 0) {
      errors.push('Opening balance must be 0 or greater');
    }

    if (!data.currency) {
      errors.push('Currency is required');
    }

    if (!data.openingDate) {
      errors.push('Opening date is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Get account type options
  getAccountTypes(): string[] {
    return ['savings', 'current', 'credit', 'loan'];
  }

  // Get status options
  getStatusOptions(): string[] {
    return ['active', 'inactive', 'suspended'];
  }

  // Get currency options
  getCurrencyOptions(): string[] {
    return ['INR', 'USD', 'EUR', 'GBP', 'CAD', 'AUD'];
  }

  // Format account number for display (mask sensitive parts)
  formatAccountNumber(accountNumber: string): string {
    if (accountNumber.length <= 4) {
      return accountNumber;
    }
    return `****${accountNumber.slice(-4)}`;
  }

  // Format balance for display
  formatBalance(balance: number, currency: string = 'INR'): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(balance);
  }

  // Check if account is active
  isAccountActive(account: BankAccount): boolean {
    return account.status === 'active';
  }

  // Get account age in days
  getAccountAge(openingDate: string): number {
    const today = new Date();
    const opening = new Date(openingDate);
    const diffTime = today.getTime() - opening.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
}

export const bankAccountService = new BankAccountService();
export default bankAccountService;
