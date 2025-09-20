import { transactionLockingService } from './transactionLockingService';

export interface ModuleLockStatus {
  module: string;
  status: 'locked' | 'unlocked' | 'partially_unlocked';
  lockDate?: string;
  reason?: string;
  partialUnlockFrom?: string;
  partialUnlockTo?: string;
}

class TransactionLockingEnforcement {
  private lockStatusCache: Record<string, ModuleLockStatus> = {};
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Check if a module is locked and should be blocked
   */
  async isModuleLocked(moduleName: string): Promise<boolean> {
    try {
      console.log('🔒 Enforcement: Checking if module is locked:', moduleName);
      const lockStatus = await this.getModuleLockStatus(moduleName);
      console.log('🔒 Enforcement: Lock status for', moduleName, ':', lockStatus);
      
      // If module is locked, always block access regardless of date
      if (lockStatus.status === 'locked') {
        console.log('🔒 Enforcement: Module is locked - blocking access');
        return true;
      }
      
      // If module is partially unlocked, check if today falls in unlock period
      if (lockStatus.status === 'partially_unlocked') {
        const today = new Date();
        const fromDate = lockStatus.partialUnlockFrom ? this.parseDate(lockStatus.partialUnlockFrom) : null;
        const toDate = lockStatus.partialUnlockTo ? this.parseDate(lockStatus.partialUnlockTo) : null;
        
        console.log('🔒 Enforcement: Partial unlock - Today:', today, 'From:', fromDate, 'To:', toDate);
        
        // If today is within the partial unlock period, module is not locked
        if (fromDate && toDate && today >= fromDate && today <= toDate) {
          console.log('🔒 Enforcement: Module is in partial unlock period - allowing access');
          return false;
        }
        
        // Otherwise, module is locked
        console.log('🔒 Enforcement: Module is locked (partial unlock expired) - blocking access');
        return true;
      }
      
      console.log('🔒 Enforcement: Module is not locked - allowing access');
      return false;
    } catch (error) {
      console.error('🔒 Enforcement: Error checking module lock status:', error);
      // On error, allow access (fail-safe)
      return false;
    }
  }

  /**
   * Get lock status for a specific module
   */
  async getModuleLockStatus(moduleName: string): Promise<ModuleLockStatus> {
    try {
      console.log('🔒 Enforcement: Getting lock status for module:', moduleName);
      
      // Always fetch fresh data for now (disable cache temporarily for debugging)
      // Check cache first
      if (false && this.isCacheValid() && this.lockStatusCache[moduleName]) {
        console.log('🔒 Enforcement: Using cached data for', moduleName);
        return this.lockStatusCache[moduleName];
      }

      // Fetch fresh data
      console.log('🔒 Enforcement: Fetching fresh data from API');
      const response = await transactionLockingService.getLockStatus();
      console.log('🔒 Enforcement: Full API response:', JSON.stringify(response, null, 2));
      
      if (response.success && response.data) {
        console.log('🔒 Enforcement: All modules data:', response.data);
        const moduleData = response.data[moduleName];
        console.log('🔒 Enforcement: Module data for', moduleName, ':', JSON.stringify(moduleData, null, 2));
        
        const lockStatus: ModuleLockStatus = {
          module: moduleName,
          status: moduleData?.status || 'unlocked',
          lockDate: moduleData?.lockDate,
          reason: moduleData?.reason,
          partialUnlockFrom: moduleData?.partialUnlockFrom,
          partialUnlockTo: moduleData?.partialUnlockTo
        };

        console.log('🔒 Enforcement: Final lock status:', JSON.stringify(lockStatus, null, 2));

        // Update cache
        this.lockStatusCache[moduleName] = lockStatus;
        this.cacheTimestamp = Date.now();

        return lockStatus;
      }

      // Default to unlocked if no data
      console.log('🔒 Enforcement: No data from API, defaulting to unlocked');
      return {
        module: moduleName,
        status: 'unlocked'
      };
    } catch (error) {
      console.error('🔒 Enforcement: Error fetching module lock status:', error);
      return {
        module: moduleName,
        status: 'unlocked'
      };
    }
  }

  /**
   * Get lock message for a locked module
   */
  async getLockMessage(moduleName: string): Promise<string> {
    const lockStatus = await this.getModuleLockStatus(moduleName);
    
    if (lockStatus.status === 'locked') {
      return `This module is locked. Transactions created before ${lockStatus.lockDate} have been locked. Reason: ${lockStatus.reason || 'No reason provided'}`;
    }
    
    if (lockStatus.status === 'partially_unlocked') {
      return `This module is partially locked. Only transactions between ${lockStatus.partialUnlockFrom} and ${lockStatus.partialUnlockTo} are accessible. Reason: ${lockStatus.partialUnlockReason || 'No reason provided'}`;
    }
    
    return '';
  }

  /**
   * Clear cache (useful after lock/unlock operations)
   */
  clearCache(): void {
    this.lockStatusCache = {};
    this.cacheTimestamp = 0;
  }

  /**
   * Check if cache is still valid
   */
  private isCacheValid(): boolean {
    return Date.now() - this.cacheTimestamp < this.CACHE_DURATION;
  }

  /**
   * Parse DD/MM/YYYY date string to Date object
   */
  private parseDate(dateStr: string): Date {
    if (!dateStr) return new Date();
    
    const [day, month, year] = dateStr.split('/');
    if (day && month && year) {
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    
    return new Date();
  }
}

export const transactionLockingEnforcement = new TransactionLockingEnforcement();
