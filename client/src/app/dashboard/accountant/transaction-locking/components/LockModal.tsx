"use client";

import React, { useState, useEffect } from "react";
import { X, Info } from "lucide-react";
import { format, parse, isValid, isAfter, isBefore, startOfDay, endOfDay, isSameDay } from 'date-fns';

interface LockModalProps {
  isOpen: boolean;
  onClose: () => void;
  moduleName: string;
  onLock: (lockDate: string, reason: string) => void;
  initialDate?: string;
  initialReason?: string;
  mode?: 'lock' | 'edit';
}

const LockModal: React.FC<LockModalProps> = ({
  isOpen,
  onClose,
  moduleName,
  onLock,
  initialDate = "",
  initialReason = "",
  mode = 'lock'
}) => {
  const [lockDate, setLockDate] = useState(initialDate);
  const [reason, setReason] = useState(initialReason);
  const [errors, setErrors] = useState<{date?: string, reason?: string}>({});

  // Get today's date in DD/MM/YYYY format using date-fns
  const getTodayDate = () => {
    const today = new Date();
    return format(today, 'dd/MM/yyyy');
  };

  // Reset form state when modal opens or module changes
  useEffect(() => {
    if (isOpen) {
      // Reset form state when modal opens
      setErrors({});
      
      if (mode === 'lock' && !initialDate) {
        // Auto-fill today's date for new locks
        setLockDate(getTodayDate());
        setReason(""); // Reset reason for new locks
      } else if (initialDate) {
        // Use provided initial values for edit mode
        setLockDate(initialDate);
        setReason(initialReason || "");
      } else {
        // Reset everything if no initial values
        setLockDate("");
        setReason("");
      }
    }
  }, [isOpen, mode, initialDate, initialReason, moduleName]); // Added moduleName dependency

  // Cleanup when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Reset form state when modal closes
      setErrors({});
      setLockDate("");
      setReason("");
    }
  }, [isOpen]);

  // Format date for display (DD/MM/YYYY) using date-fns
  const formatDate = (date: string) => {
    if (!date) return "";
    try {
      const dateObj = parse(date, 'dd/MM/yyyy', new Date());
      return format(dateObj, 'dd/MM/yyyy');
    } catch {
      return "";
    }
  };

  // Parse DD/MM/YYYY format to ISO date using date-fns
  const parseDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const dateObj = parse(dateStr, 'dd/MM/yyyy', new Date());
      return format(dateObj, 'yyyy-MM-dd');
    } catch {
      return "";
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Convert from YYYY-MM-DD to DD/MM/YYYY for display using date-fns
    if (value) {
      try {
        const dateObj = new Date(value);
        const formattedDate = format(dateObj, 'dd/MM/yyyy');
        setLockDate(formattedDate);
      } catch {
        setLockDate("");
      }
    } else {
      setLockDate("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔍 Frontend: LockModal handleSubmit called');
    console.log('🔍 Frontend: lockDate value:', lockDate);
    console.log('🔍 Frontend: reason value:', reason);
    
    const newErrors: {date?: string, reason?: string} = {};
    
    if (!lockDate) {
      newErrors.date = "Lock Date is required";
    } else {
      try {
        // Parse the DD/MM/YYYY format using date-fns
        const selectedDate = parse(lockDate, 'dd/MM/yyyy', new Date());
        const today = new Date();
        
        console.log('🔍 Frontend: lockDate string:', lockDate);
        console.log('🔍 Frontend: selectedDate:', selectedDate);
        console.log('🔍 Frontend: today:', today);
        
        // Use date-fns for proper date comparison
        const isSelectedDateAfterToday = isAfter(selectedDate, today);
        const isSelectedDateToday = isSameDay(selectedDate, today);
        
        console.log('🔍 Frontend: isSelectedDateAfterToday:', isSelectedDateAfterToday);
        console.log('🔍 Frontend: isSelectedDateToday:', isSelectedDateToday);
        
        if (isSelectedDateAfterToday) {
          newErrors.date = "Cannot lock transactions for future dates";
        }
      } catch (error) {
        console.error('🔍 Frontend: Date parsing error:', error);
        newErrors.date = "Invalid date format";
      }
    }
    
    if (!reason.trim()) {
      newErrors.reason = "Reason is required";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    console.log('🔍 Frontend: Calling onLock with:', lockDate, reason);
    onLock(lockDate, reason);
    onClose();
  };

  const handleCancel = () => {
    // Reset form state
    setErrors({});
    
    if (mode === 'lock') {
      // For lock mode, reset to today's date and empty reason
      setLockDate(getTodayDate());
      setReason("");
    } else {
      // For edit mode, reset to initial values
      setLockDate(initialDate || "");
      setReason(initialReason || "");
    }
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {mode === 'edit' ? 'Edit' : 'Lock'} - {moduleName}
          </h2>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Lock Date Field */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center gap-1">
                Lock Date*
                <Info className="h-4 w-4 text-gray-400" />
              </span>
            </label>
            <input
              type="date"
              value={lockDate ? parseDate(lockDate) : ""}
              onChange={handleDateChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.date ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Select lock date"
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date}</p>
            )}
          </div>

          {/* Reason Field */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason*
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                errors.reason ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter reason for locking transactions..."
            />
            {errors.reason && (
              <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              {mode === 'edit' ? 'Lock' : 'Lock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LockModal;
