"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, Info, ChevronDown, Edit, User, Globe, MapPin, Phone, Mail, ExternalLink } from "lucide-react";
import LockModal from "./components/LockModal";
import UnlockPartiallyModal from "./components/UnlockPartiallyModal";
import UnlockCompleteModal from "./components/UnlockCompleteModal";
import transactionLockingService from "../../../../services/transactionLockingService";
import { transactionLockingEnforcement } from "../../../../services/transactionLockingEnforcement";
import { useToast } from "../../../../contexts/ToastContext";

interface TransactionLock {
  module: string;
  status: 'unlocked' | 'locked' | 'partially_unlocked';
  lockDate?: string;
  reason?: string;
  partialUnlockFrom?: string;
  partialUnlockTo?: string;
  partialUnlockReason?: string;
}

interface Accountant {
  id: string;
  name: string;
  company: string;
  logo: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  badge: string;
}

const TransactionLockingPage = () => {
  const router = useRouter();
  const { addToast, removeToastsByType } = useToast();
  const [transactionLocks, setTransactionLocks] = useState<TransactionLock[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [showFindAccountants, setShowFindAccountants] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('India');
  const [selectedState, setSelectedState] = useState('All');
  const [showUnlockDropdown, setShowUnlockDropdown] = useState<string | null>(null);
  
  // Modal states
  const [showLockModal, setShowLockModal] = useState(false);
  const [showUnlockPartiallyModal, setShowUnlockPartiallyModal] = useState(false);
  const [showUnlockCompleteModal, setShowUnlockCompleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState<string>("");
  const [viewMode, setViewMode] = useState<'individual' | 'lock-all'>('individual');

  // Load transaction locks on component mount
  useEffect(() => {
    loadTransactionLocks();
  }, []);

  // Debug: Monitor transactionLocks state changes
  useEffect(() => {
    console.log('🔄 Transaction locks state changed:', transactionLocks);
  }, [transactionLocks]);

  const loadTransactionLocks = async () => {
    try {
      console.log('📊 Loading transaction locks...');
      setLoading(true);
      const response = await transactionLockingService.getLockStatus();

      console.log('📊 Lock status response:', response);
      console.log('📊 Response data:', response.data);
      console.log('📊 Response success:', response.success);
      console.log('📊 Response data Sales:', response.data?.Sales);
      console.log('📊 Response data Purchases:', response.data?.Purchases);
      console.log('📊 Response data Banking:', response.data?.Banking);
      console.log('📊 Response data Accountant:', response.data?.Accountant);

      if (response.success && response.data) {
        const locksArray = Object.entries(response.data).map(([module, data]) => ({
          module,
          ...data
        }));
        console.log('📊 Parsed transaction locks:', locksArray);
        console.log('📊 Current transactionLocks state before update:', transactionLocks);
        console.log('📊 Setting transaction locks state...');
        setTransactionLocks(locksArray);
        setRefreshTrigger(prev => prev + 1); // Force re-render
        console.log('📊 Transaction locks state updated with:', locksArray);
      } else {
        console.log('📊 No data in response or unsuccessful response, using default state');
        // Fallback to default unlocked state for all modules
        const defaultLocks = [
          { module: 'Sales', status: 'unlocked' as const },
          { module: 'Purchases', status: 'unlocked' as const },
          { module: 'Banking', status: 'unlocked' as const },
          { module: 'Accountant', status: 'unlocked' as const }
        ];
        setTransactionLocks(defaultLocks);
        setRefreshTrigger(prev => prev + 1); // Force re-render
      }
    } catch (error) {
      console.error('❌ Failed to load transaction locks:', error);
      addToast({
        type: 'error',
        title: 'Failed to load transaction locks',
        message: 'Please refresh the page and try again'
      });
    } finally {
      setLoading(false);
    }
  };

  // Mock accountant data
  const accountants: Accountant[] = [
    {
      id: '1',
      name: 'Anmol Gakhar',
      company: 'A3CA Global Private Limited',
      logo: 'A3CA',
      country: 'India',
      phone: '+91 9316900087',
      email: 'anmol.gakhar@a3ca.com',
      website: 'https://a3ca.com',
      badge: 'Finance | Premium Partner'
    },
    {
      id: '2',
      name: 'Prashant Lumdhe',
      company: 'BHAKTI SERVICES.',
      logo: 'CA',
      country: 'India',
      phone: '+91 771 993 6194',
      email: 'bhaktiservices2012@gmail.com',
      website: '#',
      badge: 'Finance | Authorised Partner'
    },
    {
      id: '3',
      name: 'Hansal Bavishi',
      company: 'Hansal Bavishi and Associates',
      logo: 'HBA',
      country: 'India',
      phone: '+91 9820194559',
      email: 'support@infinzi.in',
      website: 'https://infinzi.in',
      badge: 'Finance | Authorised Partner'
    }
  ];

  const getLockIcon = (status: string) => {
    switch (status) {
      case 'locked':
      case 'partially_unlocked':
        return <Lock className="h-6 w-6 text-red-500" />;
      default:
        return <Lock className="h-6 w-6 text-gray-400" />;
    }
  };

  const getStatusBadge = (lock: TransactionLock) => {
    if (lock.status === 'partially_unlocked') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          PARTIALLY UNLOCKED
        </span>
      );
    }
    return null;
  };

  const getStatusText = (lock: TransactionLock) => {
    switch (lock.status) {
      case 'locked':
        return `Transactions created before ${lock.lockDate} have been locked.`;
      case 'partially_unlocked':
        return `Transactions created before ${lock.lockDate} have been locked.`;
      default:
        return "You have not locked the transactions in this module.";
    }
  };

  // Handler functions
  const handleLock = (moduleName: string) => {
    setSelectedModule(moduleName);
    setShowLockModal(true);
  };

  const handleEdit = (moduleName: string) => {
    setSelectedModule(moduleName);
    setShowEditModal(true);
  };

  const handleUnlockPartially = (moduleName: string) => {
    setSelectedModule(moduleName);
    setShowUnlockPartiallyModal(true);
    setShowUnlockDropdown(null);
  };

  const handleUnlockComplete = (moduleName: string) => {
    setSelectedModule(moduleName);
    setShowUnlockCompleteModal(true);
    setShowUnlockDropdown(null);
  };

  const handleSwitchToLockAll = () => {
    setViewMode('lock-all');
  };

  const handleSwitchToIndividual = () => {
    setViewMode('individual');
  };

  const handleLockAll = () => {
    setSelectedModule('All Transactions');
    setShowLockModal(true);
  };

  const handleEditAll = () => {
    setSelectedModule('All Transactions');
    setShowEditModal(true);
  };

  const onLockSubmit = async (lockDate: string, reason: string) => {
    try {
      console.log('🔒 Attempting to lock:', { selectedModule, lockDate, reason });
      console.log('🔒 Frontend sending lockDate string:', lockDate);
      
      // Remove any existing processing toasts first
      removeToastsByType('info');
      
      // Show loading toast
      addToast({
        type: 'info',
        title: 'Processing...',
        message: `Locking ${selectedModule} module...`,
        duration: 0 // Don't auto-dismiss processing toast
      });
      
      let response;
      if (selectedModule === 'All Transactions') {
        response = await transactionLockingService.lockAllModules(lockDate, reason);
      } else {
        response = await transactionLockingService.lockModule(selectedModule, lockDate, reason);
      }
      
      console.log('🔒 Lock response:', response);
      
      // Remove processing toast
      removeToastsByType('info');
      
      if (response.success) {
        addToast({
          type: 'success',
          title: `${selectedModule} locked successfully`
        });
        // Close the lock modal
        setShowLockModal(false);
        setSelectedModule("");
        console.log('🔒 Lock successful, reloading transaction locks...');
        await loadTransactionLocks(); // Reload data from server
        // Clear enforcement cache to ensure immediate effect
        transactionLockingEnforcement.clearCache();
        console.log('🔒 Transaction locks reloaded and cache cleared');
      } else {
        addToast({
          type: 'error',
          title: 'Failed to lock',
          message: response.message
        });
      }
    } catch (error: any) {
      console.error('❌ Failed to lock:', error);
      // Remove processing toast on error
      removeToastsByType('info');
      addToast({
        type: 'error',
        title: 'Failed to lock',
        message: error.message || 'An unexpected error occurred'
      });
    }
  };

  const onEditSubmit = async (lockDate: string, reason: string) => {
    try {
      let response;
      if (selectedModule === 'All Transactions') {
        // For All Transactions, we need to update all individual modules
        const modules = ['Sales', 'Purchases', 'Banking', 'Accountant'];
        const results = [];
        
        for (const module of modules) {
          try {
            const moduleResponse = await transactionLockingService.editLock(module, lockDate, reason);
            results.push({ module, success: true });
          } catch (error: any) {
            results.push({ module, success: false, error: error.message });
          }
        }
        
        const successCount = results.filter(r => r.success).length;
        if (successCount === modules.length) {
          addToast({
            type: 'success',
            title: 'All Transactions lock updated successfully'
          });
        } else {
          addToast({
            type: 'warning',
            title: 'Partial Update',
            message: `Updated ${successCount}/${modules.length} modules`
          });
        }
      } else {
        response = await transactionLockingService.editLock(selectedModule, lockDate, reason);
        
        if (response.success) {
          addToast({
            type: 'success',
            title: `${selectedModule} lock updated successfully`
          });
        }
      }
      
      // Close the edit modal
      setShowEditModal(false);
      setSelectedModule("");
      await loadTransactionLocks(); // Reload data from server
    } catch (error: any) {
      console.error('Failed to edit lock:', error);
      addToast({
        type: 'error',
        title: 'Failed to edit lock',
        message: error.message || 'An unexpected error occurred'
      });
    }
  };

  const onUnlockPartiallySubmit = async (fromDate: string, toDate: string, reason: string) => {
    try {
      let response;
      if (selectedModule === 'All Transactions') {
        // For All Transactions, we need to partially unlock all individual modules
        const modules = ['Sales', 'Purchases', 'Banking', 'Accountant'];
        const results = [];
        
        for (const module of modules) {
          try {
            const moduleResponse = await transactionLockingService.unlockPartially(module, fromDate, toDate, reason);
            results.push({ module, success: true });
          } catch (error: any) {
            results.push({ module, success: false, error: error.message });
          }
        }
        
        const successCount = results.filter(r => r.success).length;
        if (successCount === modules.length) {
          addToast({
            type: 'success',
            title: 'All Transactions partially unlocked successfully'
          });
        } else {
          addToast({
            type: 'warning',
            title: 'Partial Unlock',
            message: `Partially unlocked ${successCount}/${modules.length} modules`
          });
        }
      } else {
        response = await transactionLockingService.unlockPartially(selectedModule, fromDate, toDate, reason);
        
        if (response.success) {
          addToast({
            type: 'success',
            title: `${selectedModule} module partially unlocked successfully`
          });
        }
      }
      
      await loadTransactionLocks(); // Reload data from server
      // Clear enforcement cache to ensure immediate effect
      transactionLockingEnforcement.clearCache();
    } catch (error: any) {
      console.error('Failed to partially unlock:', error);
      addToast({
        type: 'error',
        title: 'Failed to partially unlock',
        message: error.message || 'An unexpected error occurred'
      });
    }
  };

  const onUnlockCompleteSubmit = async (reason: string) => {
    try {
      let response;
      if (selectedModule === 'All Transactions') {
        // For All Transactions, we need to unlock all individual modules
        const modules = ['Sales', 'Purchases', 'Banking', 'Accountant'];
        const results = [];
        
        for (const module of modules) {
          try {
            const moduleResponse = await transactionLockingService.unlockModule(module, reason);
            results.push({ module, success: true });
          } catch (error: any) {
            results.push({ module, success: false, error: error.message });
          }
        }
        
        const successCount = results.filter(r => r.success).length;
        if (successCount === modules.length) {
          addToast({
            type: 'success',
            title: 'All Transactions unlocked successfully'
          });
        } else {
          addToast({
            type: 'warning',
            title: 'Partial Unlock',
            message: `Unlocked ${successCount}/${modules.length} modules`
          });
        }
      } else {
        response = await transactionLockingService.unlockModule(selectedModule, reason);
        
        if (response.success) {
          addToast({
            type: 'success',
            title: `${selectedModule} module unlocked successfully`
          });
        }
      }
      
      await loadTransactionLocks(); // Reload data from server
      // Clear enforcement cache to ensure immediate effect
      transactionLockingEnforcement.clearCache();
    } catch (error: any) {
      console.error('Failed to unlock:', error);
      addToast({
        type: 'error',
        title: 'Failed to unlock',
        message: error.message || 'An unexpected error occurred'
      });
    }
  };

  const getActionButtons = (lock: TransactionLock) => {
    if (lock.status === 'unlocked') {
      return (
        <button 
          onClick={() => handleLock(lock.module)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Lock
        </button>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <div className="relative">
          <button 
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center gap-1"
            onClick={() => setShowUnlockDropdown(showUnlockDropdown === lock.module ? null : lock.module)}
          >
            Unlock
            <ChevronDown className="h-4 w-4" />
          </button>
          {showUnlockDropdown === lock.module && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
              <div className="py-1">
                <button 
                  onClick={() => handleUnlockPartially(lock.module)}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Unlock Partially
                </button>
                <button 
                  onClick={() => handleUnlockComplete(lock.module)}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Unlock Completely
                </button>
              </div>
            </div>
          )}
        </div>
        <button 
          onClick={() => handleEdit(lock.module)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Edit
        </button>
      </div>
    );
  };

  const getReasonDisplay = (lock: TransactionLock) => {
    if (lock.status === 'unlocked') return null;

    return (
      <div className="mt-2">
        {lock.reason && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Reason:</span> {lock.reason}
          </div>
        )}
        {lock.status === 'partially_unlocked' && lock.partialUnlockFrom && (
          <div className="mt-1">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Partial Unlock enabled from {lock.partialUnlockFrom} to {lock.partialUnlockTo}.</span>
            </div>
            {lock.partialUnlockReason && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">Reason:</span> {lock.partialUnlockReason}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Helper function to check if all modules are locked
  const areAllModulesLocked = () => {
    return transactionLocks.every(lock => lock.status === 'locked' || lock.status === 'partially_unlocked');
  };

  // Helper function to get All Transactions status
  const getAllTransactionsStatus = () => {
    if (!areAllModulesLocked()) {
      return {
        status: 'unlocked' as const,
        lockDate: undefined,
        reason: undefined,
        partialUnlockFrom: undefined,
        partialUnlockTo: undefined,
        partialUnlockReason: undefined
      };
    }

    // If all modules are locked, use the first module's data as reference
    const firstLocked = transactionLocks.find(lock => lock.status === 'locked' || lock.status === 'partially_unlocked');
    return firstLocked || {
      status: 'unlocked' as const,
      lockDate: undefined,
      reason: undefined,
      partialUnlockFrom: undefined,
      partialUnlockTo: undefined,
      partialUnlockReason: undefined
    };
  };

  // Helper function to get All Transactions action buttons
  const getAllTransactionsActionButtons = () => {
    const allStatus = getAllTransactionsStatus();
    
    if (allStatus.status === 'unlocked') {
      return (
        <button 
          onClick={handleLockAll}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Lock
        </button>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <div className="relative">
          <button 
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center gap-1"
            onClick={() => setShowUnlockDropdown(showUnlockDropdown === 'All Transactions' ? null : 'All Transactions')}
          >
            Unlock
            <ChevronDown className="h-4 w-4" />
          </button>
          {showUnlockDropdown === 'All Transactions' && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
              <div className="py-1">
                <button 
                  onClick={() => {
                    setSelectedModule('All Transactions');
                    setShowUnlockPartiallyModal(true);
                    setShowUnlockDropdown(null);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Unlock Partially
                </button>
                <button 
                  onClick={() => {
                    setSelectedModule('All Transactions');
                    setShowUnlockCompleteModal(true);
                    setShowUnlockDropdown(null);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Unlock Completely
                </button>
              </div>
            </div>
          )}
        </div>
        <button 
          onClick={handleEditAll}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Edit
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => {
                  if (viewMode === 'lock-all') {
                    setViewMode('individual');
                  } else {
                    router.push('/dashboard');
                  }
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200 text-gray-700 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm font-medium">Back</span>
              </button>
              
              <div className="flex items-center">
                <Lock className="h-8 w-8 text-blue-600 mr-3" />
                <h1 className="text-2xl font-bold text-gray-900">Transaction Locking</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setShowFindAccountants(!showFindAccountants)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <User className="h-4 w-4" />
                Find Accountants
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Title and Description */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Transaction Locking</h2>
              <p className="text-lg text-gray-600 max-w-4xl">
                Transaction locking prevents you and your users from making any changes to transactions that might affect your accounts. 
                Once transactions are locked, users cannot edit, modify, or delete any transactions that were recorded before the specified date in this module.
              </p>
            </div>

            {/* Content based on view mode */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading transaction locks...</span>
              </div>
            ) : viewMode === 'individual' ? (
              /* Individual Modules View */
              <>
                {/* Module Cards */}
                <div className="space-y-6 mb-8" key={`modules-${refreshTrigger}`}>
                  {transactionLocks.map((lock) => (
                    <div key={`${lock.module}-${refreshTrigger}`} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          {getLockIcon(lock.status)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{lock.module}</h3>
                              <Info className="h-4 w-4 text-gray-400" />
                              {getStatusBadge(lock)}
                            </div>
                            <p className="text-gray-600 mb-2">
                              {getStatusText(lock)}
                            </p>
                            {getReasonDisplay(lock)}
                          </div>
                        </div>
                        <div className="ml-4">
                          {getActionButtons(lock)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Lock All Transactions Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Lock All Transactions At Once</h3>
                      <p className="text-gray-600">
                        You can freeze all transactions at once instead of locking the Sales, Purchases, Banking and Account transactions individually.
                      </p>
                    </div>
                    <button 
                      onClick={handleSwitchToLockAll}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Switch to Lock All Transactions →
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Lock All Transactions View */
              <>
                {/* All Transactions Card */}
                <div className="space-y-6 mb-8">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        {getLockIcon(getAllTransactionsStatus().status)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">All Transactions</h3>
                            <Info className="h-4 w-4 text-gray-400" />
                            {getStatusBadge(getAllTransactionsStatus())}
                          </div>
                          <p className="text-gray-600 mb-2">
                            {getStatusText(getAllTransactionsStatus())}
                          </p>
                          {getReasonDisplay(getAllTransactionsStatus())}
                        </div>
                      </div>
                      <div className="ml-4">
                        {getAllTransactionsActionButtons()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lock Individual Modules Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Lock Individual Modules</h3>
                      <div className="text-gray-600">
                        <p className="mb-2">You will be able to:</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Select the modules (Sales, Purchases, Banking, Accountant) you wish to lock, instead of locking all transactions.</li>
                          <li>Set different lock dates for each module.</li>
                        </ul>
                      </div>
                    </div>
                    <button 
                      onClick={handleSwitchToIndividual}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Lock className="h-4 w-4" />
                      Lock Individual Modules
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Find Accountants Sidebar */}
          {showFindAccountants && (
            <div className="w-96 bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-fit">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Find Accountants</h3>
                <button 
                  onClick={() => setShowFindAccountants(false)}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
              
              <p className="text-gray-600 mb-4">
                Connect with an accountant in your area to manage your business finances with ease.{' '}
                <a href="#" className="text-blue-600 hover:text-blue-700 underline">Learn More</a>
              </p>

              {/* Filters */}
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <select 
                      value={selectedCountry}
                      onChange={(e) => setSelectedCountry(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="India">India</option>
                      <option value="USA">USA</option>
                      <option value="UK">UK</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <select 
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="All">All</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Karnataka">Karnataka</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Accountant Listings */}
              <div className="space-y-4">
                {accountants.map((accountant) => (
                  <div key={accountant.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="text-green-700 font-semibold text-sm">{accountant.logo}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{accountant.name}</h4>
                        <p className="text-sm text-gray-600">{accountant.company}</p>
                        <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {accountant.badge}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Globe className="h-3 w-3" />
                        {accountant.country}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        {accountant.phone}
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        {accountant.email}
                      </div>
                      <div className="flex items-center gap-2">
                        <ExternalLink className="h-3 w-3" />
                        <a href={accountant.website} className="text-blue-600 hover:text-blue-700">
                          Visit Website
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                  Want to be listed as an accountant? Apply Now
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <LockModal
        isOpen={showLockModal}
        onClose={() => setShowLockModal(false)}
        moduleName={selectedModule}
        onLock={onLockSubmit}
        mode="lock"
      />

      <LockModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        moduleName={selectedModule}
        onLock={onEditSubmit}
        mode="edit"
        initialDate={
          selectedModule === 'All Transactions' 
            ? getAllTransactionsStatus().lockDate || ""
            : transactionLocks.find(l => l.module === selectedModule)?.lockDate || ""
        }
        initialReason={
          selectedModule === 'All Transactions' 
            ? getAllTransactionsStatus().reason || ""
            : transactionLocks.find(l => l.module === selectedModule)?.reason || ""
        }
      />

      <UnlockPartiallyModal
        isOpen={showUnlockPartiallyModal}
        onClose={() => setShowUnlockPartiallyModal(false)}
        moduleName={selectedModule}
        onUnlockPartially={onUnlockPartiallySubmit}
      />

      <UnlockCompleteModal
        isOpen={showUnlockCompleteModal}
        onClose={() => setShowUnlockCompleteModal(false)}
        moduleName={selectedModule}
        onUnlockComplete={onUnlockCompleteSubmit}
        existingPartialUnlock={
          selectedModule === 'All Transactions'
            ? getAllTransactionsStatus().partialUnlockFrom
              ? {
                  fromDate: getAllTransactionsStatus().partialUnlockFrom || "",
                  toDate: getAllTransactionsStatus().partialUnlockTo || ""
                }
              : undefined
            : transactionLocks.find(l => l.module === selectedModule)?.partialUnlockFrom
              ? {
                  fromDate: transactionLocks.find(l => l.module === selectedModule)?.partialUnlockFrom || "",
                  toDate: transactionLocks.find(l => l.module === selectedModule)?.partialUnlockTo || ""
                }
              : undefined
        }
      />
    </div>
  );
};

export default TransactionLockingPage;
