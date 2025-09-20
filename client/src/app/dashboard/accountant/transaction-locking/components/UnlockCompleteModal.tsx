"use client";

import React, { useState, useEffect } from "react";
import { X, Info } from "lucide-react";

interface UnlockCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  moduleName: string;
  onUnlockComplete: (reason: string) => void;
  existingPartialUnlock?: {
    fromDate: string;
    toDate: string;
  };
}

const UnlockCompleteModal: React.FC<UnlockCompleteModalProps> = ({
  isOpen,
  onClose,
  moduleName,
  onUnlockComplete,
  existingPartialUnlock
}) => {
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState<{reason?: string}>({});

  // Reset form state when modal opens or module changes
  useEffect(() => {
    if (isOpen) {
      // Reset form state when modal opens
      setErrors({});
      setReason("");
    }
  }, [isOpen, moduleName]);

  // Cleanup when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Reset form state when modal closes
      setErrors({});
      setReason("");
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: {reason?: string} = {};
    
    if (!reason.trim()) {
      newErrors.reason = "Reason is required";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    onUnlockComplete(reason);
    onClose();
  };

  const handleCancel = () => {
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
            Unlock - {moduleName}
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
              placeholder="Enter reason for unlocking transactions..."
            />
            {errors.reason && (
              <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
            )}
          </div>

          {/* Informational Note */}
          {existingPartialUnlock && (
            <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-800">
                  {moduleName} transactions have already been partially unlocked from {existingPartialUnlock.fromDate} to {existingPartialUnlock.toDate}.
                </p>
              </div>
            </div>
          )}

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

export default UnlockCompleteModal;
