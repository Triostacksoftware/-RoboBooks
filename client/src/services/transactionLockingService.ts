const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

interface TransactionLock {
  module: string;
  status: 'unlocked' | 'locked' | 'partially_unlocked';
  lockDate?: string;
  reason?: string;
  partialUnlockFrom?: string;
  partialUnlockTo?: string;
  partialUnlockReason?: string;
  createdAt?: string;
  createdBy?: any;
  lastModified?: string;
  lastModifiedBy?: any;
}

interface LockStatusResponse {
  success: boolean;
  data: {
    [key: string]: TransactionLock;
  };
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any[];
}

class TransactionLockingService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = localStorage.getItem('token');
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      credentials: 'include',
    };

    try {
      console.log('🌐 Making API request:', `${API_BASE_URL}/api${endpoint}`, config);
      const response = await fetch(`${API_BASE_URL}/api${endpoint}`, config);
      console.log('🌐 Response status:', response.status);
      const data = await response.json();
      console.log('🌐 Response data:', data);

      if (!response.ok) {
        console.error('❌ API request failed:', data);
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('❌ API request failed:', error);
      throw error;
    }
  }

  /**
   * Get lock status for all modules
   */
  async getLockStatus(): Promise<LockStatusResponse> {
    return this.makeRequest<{ [key: string]: TransactionLock }>('/transaction-locking/status');
  }

  /**
   * Lock a specific module
   */
  async lockModule(module: string, lockDate: string, reason: string): Promise<ApiResponse<any>> {
    console.log('🔒 Service: Locking module', { module, lockDate, reason });
    return this.makeRequest('/transaction-locking/lock', {
      method: 'POST',
      body: JSON.stringify({
        module,
        lockDate,
        reason,
      }),
    });
  }

  /**
   * Edit an existing lock
   */
  async editLock(module: string, lockDate: string, reason: string): Promise<ApiResponse<any>> {
    return this.makeRequest('/transaction-locking/edit', {
      method: 'PUT',
      body: JSON.stringify({
        module,
        lockDate,
        reason,
      }),
    });
  }

  /**
   * Unlock a module completely
   */
  async unlockModule(module: string, reason: string): Promise<ApiResponse<any>> {
    return this.makeRequest('/transaction-locking/unlock', {
      method: 'PUT',
      body: JSON.stringify({
        module,
        reason,
      }),
    });
  }

  /**
   * Unlock a module partially
   */
  async unlockPartially(
    module: string,
    fromDate: string,
    toDate: string,
    reason: string
  ): Promise<ApiResponse<any>> {
    return this.makeRequest('/transaction-locking/unlock-partially', {
      method: 'PUT',
      body: JSON.stringify({
        module,
        fromDate,
        toDate,
        reason,
      }),
    });
  }

  /**
   * Check if a specific date is locked for a module
   */
  async checkDateLock(module: string, date: string): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({
      module,
      date,
    });

    return this.makeRequest(`/transaction-locking/check-date?${params}`);
  }

  /**
   * Lock all modules at once
   */
  async lockAllModules(lockDate: string, reason: string): Promise<ApiResponse<any>> {
    return this.makeRequest('/transaction-locking/lock-all', {
      method: 'POST',
      body: JSON.stringify({
        lockDate,
        reason,
      }),
    });
  }

  /**
   * Get audit trail for transaction locking operations
   */
  async getAuditTrail(
    module?: string,
    limit: number = 50,
    page: number = 1
  ): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      page: page.toString(),
      ...(module && { module }),
    });

    return this.makeRequest(`/transaction-locking/audit-trail?${params}`);
  }

  /**
   * Utility function to format date for display (DD/MM/YYYY)
   */
  formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  }

  /**
   * Utility function to parse date from DD/MM/YYYY format
   */
  parseDate(dateStr: string): Date {
    const [day, month, year] = dateStr.split('/');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }

  /**
   * Utility function to validate date format
   */
  validateDateFormat(dateStr: string): boolean {
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(dateStr)) {
      return false;
    }

    try {
      const date = this.parseDate(dateStr);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const formattedDate = `${day}/${month}/${year}`;
      return formattedDate === dateStr;
    } catch {
      return false;
    }
  }

  /**
   * Utility function to check if a date is in the future
   */
  isFutureDate(dateStr: string): boolean {
    try {
      const date = this.parseDate(dateStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date > today;
    } catch {
      return false;
    }
  }

  /**
   * Utility function to get today's date in DD/MM/YYYY format
   */
  getTodayDate(): string {
    return this.formatDate(new Date());
  }

  /**
   * Utility function to get yesterday's date in DD/MM/YYYY format
   */
  getYesterdayDate(): string {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return this.formatDate(yesterday);
  }
}

const transactionLockingService = new TransactionLockingService();

export default transactionLockingService;
export { transactionLockingService };
