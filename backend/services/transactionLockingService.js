import TransactionLocking from '../models/TransactionLocking.js';
import AuditTrail from '../models/AuditTrail.js';
import { format, parse, isValid, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';

class TransactionLockingService {
  
  /**
   * Lock a module with specified date and reason
   * @param {string} companyId - Company ID
   * @param {string} userId - User ID performing the action
   * @param {string} module - Module to lock (Sales, Purchases, Banking, Accountant)
   * @param {string} lockDate - Date in DD/MM/YYYY format
   * @param {string} reason - Reason for locking
   * @returns {Object} Created lock record
   */
  async lockModule(companyId, userId, module, lockDate, reason) {
    try {
      // Validate inputs
      if (!module || !lockDate || !reason) {
        throw new Error('Module, lock date, and reason are required');
      }

      if (!['Sales', 'Purchases', 'Banking', 'Accountant'].includes(module)) {
        throw new Error('Invalid module specified');
      }

      // Parse and validate date
      console.log('🔍 Backend received lockDate string:', lockDate);
      const parsedDate = this.parseDate(lockDate);
      console.log('🔍 Backend parsed date:', parsedDate);
      console.log('🔍 Backend current date:', new Date());
      TransactionLocking.validateLockDate(parsedDate);

      // Check if module is already locked
      const existingLock = await TransactionLocking.findOne({
        company: companyId,
        module: module,
        status: { $in: ['locked', 'partially_unlocked'] }
      });

      if (existingLock) {
        throw new Error(`Module ${module} is already locked`);
      }

      // Create new lock
      const lockRecord = new TransactionLocking({
        company: companyId,
        module: module,
        lockDate: parsedDate,
        reason: reason.trim(),
        status: 'locked',
        createdBy: userId,
        lastModifiedBy: userId
      });

      await lockRecord.save();

      // Create audit trail
      await this.createAuditTrail(companyId, userId, 'LOCK_CREATED', {
        module,
        lockDate: lockRecord.formattedLockDate,
        reason,
        status: 'locked'
      });

      return {
        success: true,
        data: {
          id: lockRecord._id,
          module: lockRecord.module,
          status: lockRecord.status,
          lockDate: lockRecord.formattedLockDate,
          reason: lockRecord.reason,
          createdAt: lockRecord.createdAt
        }
      };

    } catch (error) {
      throw new Error(`Failed to lock module: ${error.message}`);
    }
  }

  /**
   * Edit an existing lock
   * @param {string} companyId - Company ID
   * @param {string} userId - User ID performing the action
   * @param {string} module - Module to edit
   * @param {string} lockDate - New date in DD/MM/YYYY format
   * @param {string} reason - New reason
   * @returns {Object} Updated lock record
   */
  async editLock(companyId, userId, module, lockDate, reason) {
    try {
      // Validate inputs
      if (!module || !lockDate || !reason) {
        throw new Error('Module, lock date, and reason are required');
      }

      // Parse and validate date
      const parsedDate = this.parseDate(lockDate);
      TransactionLocking.validateLockDate(parsedDate);

      // Find existing lock
      const existingLock = await TransactionLocking.findOne({
        company: companyId,
        module: module,
        status: { $in: ['locked', 'partially_unlocked'] }
      });

      if (!existingLock) {
        throw new Error(`No active lock found for module ${module}`);
      }

      // Store old values for audit trail
      const oldValues = {
        lockDate: existingLock.formattedLockDate,
        reason: existingLock.reason
      };

      // Update lock
      existingLock.lockDate = parsedDate;
      existingLock.reason = reason.trim();
      existingLock.lastModifiedBy = userId;

      await existingLock.save();

      // Create audit trail
      await this.createAuditTrail(companyId, userId, 'LOCK_EDITED', {
        module,
        oldValues,
        newValues: {
          lockDate: existingLock.formattedLockDate,
          reason
        }
      });

      return {
        success: true,
        data: {
          id: existingLock._id,
          module: existingLock.module,
          status: existingLock.status,
          lockDate: existingLock.formattedLockDate,
          reason: existingLock.reason,
          partialUnlockFrom: existingLock.formattedPartialUnlockFrom,
          partialUnlockTo: existingLock.formattedPartialUnlockTo,
          partialUnlockReason: existingLock.partialUnlockReason,
          updatedAt: existingLock.updatedAt
        }
      };

    } catch (error) {
      throw new Error(`Failed to edit lock: ${error.message}`);
    }
  }

  /**
   * Unlock a module completely
   * @param {string} companyId - Company ID
   * @param {string} userId - User ID performing the action
   * @param {string} module - Module to unlock
   * @param {string} reason - Reason for unlocking
   * @returns {Object} Success response
   */
  async unlockModule(companyId, userId, module, reason) {
    try {
      // Validate inputs
      if (!module || !reason) {
        throw new Error('Module and reason are required');
      }

      // Find existing lock
      const existingLock = await TransactionLocking.findOne({
        company: companyId,
        module: module,
        status: { $in: ['locked', 'partially_unlocked'] }
      });

      if (!existingLock) {
        throw new Error(`No active lock found for module ${module}`);
      }

      // Store old values for audit trail
      const oldValues = {
        status: existingLock.status,
        lockDate: existingLock.formattedLockDate,
        reason: existingLock.reason,
        partialUnlockFrom: existingLock.formattedPartialUnlockFrom,
        partialUnlockTo: existingLock.formattedPartialUnlockTo,
        partialUnlockReason: existingLock.partialUnlockReason
      };

      // Update to unlocked status
      existingLock.status = 'unlocked';
      existingLock.lockDate = undefined;
      existingLock.reason = undefined;
      existingLock.partialUnlockFrom = undefined;
      existingLock.partialUnlockTo = undefined;
      existingLock.partialUnlockReason = undefined;
      existingLock.lastModifiedBy = userId;

      await existingLock.save();

      // Create audit trail
      await this.createAuditTrail(companyId, userId, 'LOCK_UNLOCKED', {
        module,
        unlockReason: reason,
        oldValues
      });

      return {
        success: true,
        data: {
          module,
          status: 'unlocked',
          unlockedAt: new Date(),
          unlockReason: reason
        }
      };

    } catch (error) {
      throw new Error(`Failed to unlock module: ${error.message}`);
    }
  }

  /**
   * Unlock a module partially for a specific date range
   * @param {string} companyId - Company ID
   * @param {string} userId - User ID performing the action
   * @param {string} module - Module to partially unlock
   * @param {string} fromDate - Start date in DD/MM/YYYY format
   * @param {string} toDate - End date in DD/MM/YYYY format
   * @param {string} reason - Reason for partial unlock
   * @returns {Object} Updated lock record
   */
  async unlockPartially(companyId, userId, module, fromDate, toDate, reason) {
    try {
      // Validate inputs
      if (!module || !fromDate || !toDate || !reason) {
        throw new Error('Module, date range, and reason are required');
      }

      // Parse and validate dates
      const parsedFromDate = this.parseDate(fromDate);
      const parsedToDate = this.parseDate(toDate);

      if (parsedFromDate > parsedToDate) {
        throw new Error('From date cannot be after to date');
      }

      // Find existing lock
      const existingLock = await TransactionLocking.findOne({
        company: companyId,
        module: module,
        status: 'locked'
      });

      if (!existingLock) {
        throw new Error(`No active lock found for module ${module}`);
      }

      // Validate that partial unlock dates are within lock period
      if (parsedFromDate > existingLock.lockDate) {
        throw new Error('Partial unlock start date cannot be after lock date');
      }

      // Store old values for audit trail
      const oldValues = {
        status: existingLock.status,
        partialUnlockFrom: existingLock.formattedPartialUnlockFrom,
        partialUnlockTo: existingLock.formattedPartialUnlockTo,
        partialUnlockReason: existingLock.partialUnlockReason
      };

      // Update to partially unlocked
      existingLock.status = 'partially_unlocked';
      existingLock.partialUnlockFrom = parsedFromDate;
      existingLock.partialUnlockTo = parsedToDate;
      existingLock.partialUnlockReason = reason.trim();
      existingLock.lastModifiedBy = userId;

      await existingLock.save();

      // Create audit trail
      await this.createAuditTrail(companyId, userId, 'LOCK_PARTIALLY_UNLOCKED', {
        module,
        fromDate: existingLock.formattedPartialUnlockFrom,
        toDate: existingLock.formattedPartialUnlockTo,
        reason,
        oldValues
      });

      return {
        success: true,
        data: {
          id: existingLock._id,
          module: existingLock.module,
          status: existingLock.status,
          lockDate: existingLock.formattedLockDate,
          reason: existingLock.reason,
          partialUnlockFrom: existingLock.formattedPartialUnlockFrom,
          partialUnlockTo: existingLock.formattedPartialUnlockTo,
          partialUnlockReason: existingLock.partialUnlockReason,
          updatedAt: existingLock.updatedAt
        }
      };

    } catch (error) {
      throw new Error(`Failed to partially unlock module: ${error.message}`);
    }
  }

  /**
   * Get lock status for all modules
   * @param {string} companyId - Company ID
   * @returns {Object} Lock status for all modules
   */
  async getLockStatus(companyId) {
    try {
      console.log('🔍 getLockStatus service - companyId:', companyId);
      console.log('🔍 getLockStatus service - companyId type:', typeof companyId);
      
      const status = await TransactionLocking.getLockStatus(companyId);
      
      console.log('🔍 getLockStatus service - raw status from model:', JSON.stringify(status, null, 2));
      
      return {
        success: true,
        data: status
      };

    } catch (error) {
      console.error('❌ getLockStatus service error:', error);
      throw new Error(`Failed to get lock status: ${error.message}`);
    }
  }

  /**
   * Check if a specific date is locked for a module
   * @param {string} companyId - Company ID
   * @param {string} module - Module to check
   * @param {string} date - Date in DD/MM/YYYY format
   * @returns {Object} Lock status for the date
   */
  async isDateLocked(companyId, module, date) {
    try {
      const parsedDate = this.parseDate(date);
      const isLocked = await TransactionLocking.isDateLocked(companyId, module, parsedDate);
      
      return {
        success: true,
        data: {
          module,
          date,
          isLocked
        }
      };

    } catch (error) {
      throw new Error(`Failed to check date lock status: ${error.message}`);
    }
  }

  /**
   * Lock all modules at once
   * @param {string} companyId - Company ID
   * @param {string} userId - User ID performing the action
   * @param {string} lockDate - Date in DD/MM/YYYY format
   * @param {string} reason - Reason for locking
   * @returns {Object} Success response
   */
  async lockAllModules(companyId, userId, lockDate, reason) {
    try {
      const modules = ['Sales', 'Purchases', 'Banking', 'Accountant'];
      const results = [];

      for (const module of modules) {
        try {
          const result = await this.lockModule(companyId, userId, module, lockDate, reason);
          results.push(result.data);
        } catch (error) {
          // If module is already locked, skip it
          if (error.message.includes('already locked')) {
            results.push({
              module,
              status: 'already_locked',
              message: error.message
            });
          } else {
            throw error;
          }
        }
      }

      // Create audit trail
      await this.createAuditTrail(companyId, userId, 'LOCK_ALL_CREATED', {
        lockDate,
        reason,
        results
      });

      return {
        success: true,
        data: {
          message: 'All modules locked successfully',
          results
        }
      };

    } catch (error) {
      throw new Error(`Failed to lock all modules: ${error.message}`);
    }
  }

  /**
   * Parse date from DD/MM/YYYY format to Date object using date-fns
   * @param {string} dateStr - Date string in DD/MM/YYYY format
   * @returns {Date} Parsed date object
   */
  parseDate(dateStr) {
    console.log('📅 Parsing date string:', dateStr);
    
    if (!dateStr) {
      throw new Error('Date is required');
    }

    try {
      // Parse DD/MM/YYYY format using date-fns
      const parsedDate = parse(dateStr, 'dd/MM/yyyy', new Date());
      console.log('📅 Parsed date with date-fns:', parsedDate);
      
      // Check if the parsed date is valid
      if (!isValid(parsedDate)) {
        throw new Error('Invalid date format');
      }

      // Verify the parsed date matches the input string
      const formattedBack = format(parsedDate, 'dd/MM/yyyy');
      console.log('📅 Formatted back:', formattedBack);
      
      if (formattedBack !== dateStr) {
        throw new Error('Date parsing mismatch');
      }

      console.log('✅ Date parsing successful with date-fns');
      return parsedDate;
      
    } catch (error) {
      console.error('❌ Date parsing failed:', error.message);
      throw new Error(`Invalid date format: ${dateStr}. Expected DD/MM/YYYY format.`);
    }
  }

  /**
   * Create audit trail entry
   * @param {string} companyId - Company ID
   * @param {string} userId - User ID
   * @param {string} action - Action performed
   * @param {Object} details - Additional details
   */
  async createAuditTrail(companyId, userId, action, details) {
    try {
      if (AuditTrail) {
        // Map transaction locking actions to audit trail actions
        const auditAction = this.mapToAuditAction(action);
        const auditEntity = 'account'; // Use account as entity type for transaction locking
        
        await AuditTrail.create({
          user: userId,
          action: auditAction,
          entity: auditEntity,
          details: {
            ...details,
            company: companyId,
            originalAction: action
          },
          timestamp: new Date()
        });
      }
    } catch (error) {
      // Don't throw error for audit trail failures
      console.error('Failed to create audit trail:', error);
    }
  }

  /**
   * Map transaction locking actions to audit trail actions
   * @param {string} action - Transaction locking action
   * @returns {string} Audit trail action
   */
  mapToAuditAction(action) {
    const actionMap = {
      'LOCK_CREATED': 'create',
      'LOCK_EDITED': 'update',
      'LOCK_UNLOCKED': 'update',
      'LOCK_PARTIALLY_UNLOCKED': 'update',
      'LOCK_ALL_CREATED': 'create'
    };
    
    return actionMap[action] || 'update';
  }
}

export default new TransactionLockingService();
