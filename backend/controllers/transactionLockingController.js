import transactionLockingService from '../services/transactionLockingService.js';
import { validationResult } from 'express-validator';

class TransactionLockingController {

  /**
   * Get lock status for all modules
   */
  async getLockStatus(req, res) {
    try {
      console.log('🔍 getLockStatus - req.user:', req.user);
      const companyId = req.user.organization;
      const userId = req.user.id;
      console.log('🔍 getLockStatus - companyId:', companyId);
      console.log('🔍 getLockStatus - userId:', userId);

      if (!companyId) {
        console.log('❌ getLockStatus - No company ID found');
        return res.status(400).json({
          success: false,
          message: 'Company ID is required'
        });
      }

      const result = await transactionLockingService.getLockStatus(companyId);

      res.status(200).json(result);

    } catch (error) {
      console.error('Error getting lock status:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get lock status'
      });
    }
  }

  /**
   * Lock a specific module
   */
  async lockModule(req, res) {
    try {
      console.log('🔍 lockModule - req.user:', req.user);
      console.log('🔍 lockModule - req.body:', req.body);
      
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const companyId = req.user.organization;
      const userId = req.user.id;
      const { module, lockDate, reason } = req.body;
      
      console.log('🔍 lockModule - companyId:', companyId);
      console.log('🔍 lockModule - userId:', userId);
      console.log('🔍 lockModule - module:', module);
      console.log('🔍 lockModule - lockDate:', lockDate);
      console.log('🔍 lockModule - reason:', reason);

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: 'Company ID is required'
        });
      }

      const result = await transactionLockingService.lockModule(
        companyId, 
        userId, 
        module, 
        lockDate, 
        reason
      );

      res.status(201).json(result);

    } catch (error) {
      console.error('Error locking module:', error);
      
      if (error.message.includes('already locked') || 
          error.message.includes('future dates') ||
          error.message.includes('Invalid')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Failed to lock module'
      });
    }
  }

  /**
   * Edit an existing lock
   */
  async editLock(req, res) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const companyId = req.user.organization;
      const userId = req.user.id;
      const { module, lockDate, reason } = req.body;

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: 'Company ID is required'
        });
      }

      const result = await transactionLockingService.editLock(
        companyId, 
        userId, 
        module, 
        lockDate, 
        reason
      );

      res.status(200).json(result);

    } catch (error) {
      console.error('Error editing lock:', error);
      
      if (error.message.includes('No active lock') || 
          error.message.includes('future dates') ||
          error.message.includes('Invalid')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Failed to edit lock'
      });
    }
  }

  /**
   * Unlock a module completely
   */
  async unlockModule(req, res) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const companyId = req.user.organization;
      const userId = req.user.id;
      const { module, reason } = req.body;

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: 'Company ID is required'
        });
      }

      const result = await transactionLockingService.unlockModule(
        companyId, 
        userId, 
        module, 
        reason
      );

      res.status(200).json(result);

    } catch (error) {
      console.error('Error unlocking module:', error);
      
      if (error.message.includes('No active lock')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Failed to unlock module'
      });
    }
  }

  /**
   * Unlock a module partially
   */
  async unlockPartially(req, res) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const companyId = req.user.organization;
      const userId = req.user.id;
      const { module, fromDate, toDate, reason } = req.body;

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: 'Company ID is required'
        });
      }

      const result = await transactionLockingService.unlockPartially(
        companyId, 
        userId, 
        module, 
        fromDate, 
        toDate, 
        reason
      );

      res.status(200).json(result);

    } catch (error) {
      console.error('Error partially unlocking module:', error);
      
      if (error.message.includes('No active lock') || 
          error.message.includes('cannot be after') ||
          error.message.includes('Invalid')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Failed to partially unlock module'
      });
    }
  }

  /**
   * Check if a specific date is locked
   */
  async checkDateLock(req, res) {
    try {
      const companyId = req.user.organization;
      const { module, date } = req.query;

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: 'Company ID is required'
        });
      }

      if (!module || !date) {
        return res.status(400).json({
          success: false,
          message: 'Module and date are required'
        });
      }

      const result = await transactionLockingService.isDateLocked(
        companyId, 
        module, 
        date
      );

      res.status(200).json(result);

    } catch (error) {
      console.error('Error checking date lock:', error);
      
      if (error.message.includes('Invalid date')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Failed to check date lock status'
      });
    }
  }

  /**
   * Lock all modules at once
   */
  async lockAllModules(req, res) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const companyId = req.user.organization;
      const userId = req.user.id;
      const { lockDate, reason } = req.body;

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: 'Company ID is required'
        });
      }

      const result = await transactionLockingService.lockAllModules(
        companyId, 
        userId, 
        lockDate, 
        reason
      );

      res.status(201).json(result);

    } catch (error) {
      console.error('Error locking all modules:', error);
      
      if (error.message.includes('future dates') ||
          error.message.includes('Invalid')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Failed to lock all modules'
      });
    }
  }

  /**
   * Get audit trail for transaction locking
   */
  async getAuditTrail(req, res) {
    try {
      const companyId = req.user.organization;
      const { module, limit = 50, page = 1 } = req.query;

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: 'Company ID is required'
        });
      }

      // This would require the AuditTrail model to be implemented
      // For now, return a placeholder response
      res.status(200).json({
        success: true,
        data: {
          message: 'Audit trail functionality will be implemented when AuditTrail model is available',
          module: module || 'all',
          limit: parseInt(limit),
          page: parseInt(page)
        }
      });

    } catch (error) {
      console.error('Error getting audit trail:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get audit trail'
      });
    }
  }
}

export default new TransactionLockingController();
