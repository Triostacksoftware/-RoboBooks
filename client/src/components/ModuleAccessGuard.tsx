"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, AlertTriangle, ArrowLeft } from 'lucide-react';
import { transactionLockingEnforcement } from '@/services/transactionLockingEnforcement';

interface ModuleAccessGuardProps {
  moduleName: string;
  children: React.ReactNode;
  fallbackComponent?: React.ReactNode;
}

const ModuleAccessGuard: React.FC<ModuleAccessGuardProps> = ({
  moduleName,
  children,
  fallbackComponent
}) => {
  const [isLocked, setIsLocked] = useState<boolean | null>(null);
  const [lockMessage, setLockMessage] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log('🛡️ ModuleAccessGuard: Checking access for module:', moduleName);
    checkModuleAccess();
  }, [moduleName]);

  const checkModuleAccess = async () => {
    try {
      setLoading(true);
      console.log('🛡️ ModuleAccessGuard: Calling isModuleLocked for:', moduleName);
      const locked = await transactionLockingEnforcement.isModuleLocked(moduleName);
      console.log('🛡️ ModuleAccessGuard: Module locked result:', locked);
      setIsLocked(locked);
      
      if (locked) {
        const message = await transactionLockingEnforcement.getLockMessage(moduleName);
        console.log('🛡️ ModuleAccessGuard: Lock message:', message);
        setLockMessage(message);
      }
    } catch (error) {
      console.error('🛡️ ModuleAccessGuard: Error checking module access:', error);
      // On error, allow access (fail-safe)
      setIsLocked(false);
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    router.push('/dashboard');
  };

  const handleGoToTransactionLocking = () => {
    router.push('/dashboard/accountant/transaction-locking');
  };

  // Show loading state
  if (loading) {
    console.log('🛡️ ModuleAccessGuard: Showing loading state');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking module access...</p>
        </div>
      </div>
    );
  }

  console.log('🛡️ ModuleAccessGuard: Loading complete. isLocked:', isLocked);

  // If module is locked, show lock screen
  if (isLocked) {
    console.log('🛡️ ModuleAccessGuard: Module is locked, showing lock screen');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Lock Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <Lock className="h-8 w-8 text-red-600" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Module Locked
          </h2>

          {/* Module Name */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="text-lg font-semibold text-red-800">
                {moduleName} Module
              </span>
            </div>
          </div>

          {/* Lock Message */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <p className="text-gray-700 text-sm leading-relaxed mb-3">
              This module is locked. Transactions created before 23/09/2025 have been locked.
            </p>
            <div className="bg-orange-100 border border-orange-300 rounded-lg p-3">
              <p className="text-orange-800 text-lg font-bold text-center">
                Reason: {lockMessage.split('Reason: ')[1] || lockMessage}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleGoToTransactionLocking}
              className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Manage Transaction Locks
            </button>
            
            <button
              onClick={handleGoBack}
              className="w-full bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Contact your administrator if you need access to this module.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If module is not locked, render children
  console.log('🛡️ ModuleAccessGuard: Module is not locked, rendering children');
  return <>{children}</>;
};

export default ModuleAccessGuard;
