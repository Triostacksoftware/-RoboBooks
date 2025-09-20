"use client";

import React, { useState, useEffect } from "react";
import { X, Info } from "lucide-react";
import { format } from "date-fns";

interface UnlockPartiallyModalProps {
  isOpen: boolean;
  onClose: () => void;
  moduleName: string;
  onUnlockPartially: (fromDate: string, toDate: string, reason: string) => void;
}

const UnlockPartiallyModal: React.FC<UnlockPartiallyModalProps> = ({
  isOpen,
  onClose,
  moduleName,
  onUnlockPartially
}) => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState<{fromDate?: string, toDate?: string, reason?: string}>({});

  // Get today's date in DD/MM/YYYY format
  const getTodayDate = () => {
    return format(new Date(), 'dd/MM/yyyy');
  };

  // Reset form state when modal opens or module changes
  useEffect(() => {
    if (isOpen) {
      // Reset form state when modal opens and pre-fill with today's date
      setErrors({});
      const todayDate = getTodayDate();
      setFromDate(todayDate);
      setToDate(todayDate);
      setReason("");
    }
  }, [isOpen, moduleName]);

  // Cleanup when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Reset form state when modal closes
      setErrors({});
      setFromDate("");
      setToDate("");
      setReason("");
    }
  }, [isOpen]);

  // Parse DD/MM/YYYY format to ISO date
  const parseDate = (dateStr: string) => {
    if (!dateStr) return "";
    const [day, month, year] = dateStr.split('/');
    if (day && month && year) {
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return "";
  };

  // Convert ISO date to DD/MM/YYYY format
  const formatDate = (isoDate: string) => {
    if (!isoDate) return "";
    const dateObj = new Date(isoDate);
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleFromDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      const dateObj = new Date(value);
      const day = String(dateObj.getDate()).padStart(2, '0');
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const year = dateObj.getFullYear();
      setFromDate(`${day}/${month}/${year}`);
    } else {
      setFromDate("");
    }
  };

  const handleToDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      const dateObj = new Date(value);
      const day = String(dateObj.getDate()).padStart(2, '0');
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const year = dateObj.getFullYear();
      setToDate(`${day}/${month}/${year}`);
    } else {
      setToDate("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: {fromDate?: string, toDate?: string, reason?: string} = {};
    
    if (!fromDate) {
      newErrors.fromDate = "From date is required";
    }
    
    if (!toDate) {
      newErrors.toDate = "To date is required";
    }
    
    if (fromDate && toDate) {
      const fromDateObj = new Date(parseDate(fromDate));
      const toDateObj = new Date(parseDate(toDate));
      
      if (fromDateObj > toDateObj) {
        newErrors.toDate = "To date must be after or equal to from date";
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
    onUnlockPartially(fromDate, toDate, reason);
    onClose();
  };

  const handleCancel = () => {
    const todayDate = getTodayDate();
    setFromDate(todayDate);
    setToDate(todayDate);
    setReason("");
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Unlock Partially - {moduleName}
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
          {/* Partial Unlock Period */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Partial Unlock Period*
            </label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={fromDate ? parseDate(fromDate) : ""}
                onChange={handleFromDateChange}
                className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.fromDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <span className="text-gray-500">-</span>
              <input
                type="date"
                value={toDate ? parseDate(toDate) : ""}
                onChange={handleToDateChange}
                className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.toDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {(errors.fromDate || errors.toDate) && (
              <p className="mt-1 text-sm text-red-600">
                {errors.fromDate || errors.toDate}
              </p>
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
              placeholder="Enter reason for partial unlock..."
            />
            {errors.reason && (
              <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
            )}
          </div>

          {/* Informational Note */}
          <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-800">
                Transactions can be created, modified or deleted during the unlock period. However, ensure that all the modules that might be impacted by the transaction should be unlocked as well.
              </p>
            </div>
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
              Unlock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UnlockPartiallyModal;
