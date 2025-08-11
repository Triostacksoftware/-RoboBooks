'use client';

import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface PaymentHistoryEntry {
  id: string;
  customerName: string;
  timestamp: string;
  description: string;
  amount: number;
  invoiceNumber: string;
}

interface PaymentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentHistory: PaymentHistoryEntry[];
}

const PaymentHistoryModal: React.FC<PaymentHistoryModalProps> = ({
  isOpen,
  onClose,
  paymentHistory
}) => {
  if (!isOpen) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-GB') + ' ' + date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Payment History</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="text-red-500 hover:text-red-600 p-1"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Payment History Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(80vh-120px)]">
          {paymentHistory.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">No payment history available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {paymentHistory.map((entry) => (
                <div key={entry.id} className="flex items-start space-x-3">
                  {/* Payment Icon */}
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 border border-green-200 rounded flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>

                  {/* Payment Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {entry.customerName}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(entry.timestamp)}
                      </span>
                    </div>
                    
                    {/* Payment Description Bubble */}
                    <div className="bg-gray-100 rounded-lg px-3 py-2 mb-2">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {entry.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end">
            {/* Navigation controls removed */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentHistoryModal;
