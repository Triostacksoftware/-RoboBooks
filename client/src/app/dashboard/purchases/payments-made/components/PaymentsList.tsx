"use client";

import React, { useState } from "react";
import { Payment } from "@/services/paymentService";
import { formatCurrency } from "@/utils/currency";
import {
  PencilIcon,
  CheckIcon,
  ClockIcon,
  XCircleIcon,
  XMarkIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowDownTrayIcon as DownloadIcon,
} from "@heroicons/react/24/outline";

interface PaymentsListProps {
  payments: Payment[];
  selectedPaymentId?: string;
  onEdit: (payment: Payment) => void;
  onDelete: (paymentId: string) => void;
  onPaymentClick: (payment: Payment) => void;
  isCollapsed?: boolean; // New prop to determine if showing minimal info
  selectedPaymentIds: string[];
  onBulkSelectionChange: (selectedIds: string[]) => void;
  onBulkImport: () => void;
  onBulkExport: () => void;
  onBulkDelete: () => void;
  onClearSelection: () => void;
}

export default function PaymentsList({ 
  payments, 
  selectedPaymentId, 
  onEdit, 
  onDelete, 
  onPaymentClick, 
  isCollapsed = false,
  selectedPaymentIds,
  onBulkSelectionChange,
  onBulkImport,
  onBulkExport,
  onBulkDelete,
  onClearSelection
}: PaymentsListProps) {
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-4 w-4" />;
      case 'completed':
        return <CheckIcon className="h-4 w-4" />;
      case 'failed':
        return <XCircleIcon className="h-4 w-4" />;
      case 'cancelled':
        return <XMarkIcon className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return '💵';
      case 'check':
        return '📝';
      case 'bank_transfer':
        return '🏦';
      case 'credit_card':
        return '💳';
      default:
        return '💰';
    }
  };

  const sortedPayments = [...payments].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'date':
        aValue = new Date(a.paymentDate).getTime();
        bValue = new Date(b.paymentDate).getTime();
        break;
      case 'amount':
        aValue = a.amount;
        bValue = b.amount;
        break;
      case 'vendor':
        aValue = a.vendorName.toLowerCase();
        bValue = b.vendorName.toLowerCase();
        break;
      case 'status':
        aValue = a.status.toLowerCase();
        bValue = b.status.toLowerCase();
        break;
      default:
        aValue = new Date(a.paymentDate).getTime();
        bValue = new Date(b.paymentDate).getTime();
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSelectPayment = (paymentId: string, checked: boolean) => {
    if (checked) {
      onBulkSelectionChange([...selectedPaymentIds, paymentId]);
    } else {
      onBulkSelectionChange(selectedPaymentIds.filter(id => id !== paymentId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onBulkSelectionChange(payments.map(payment => payment._id));
    } else {
      onBulkSelectionChange([]);
    }
  };

  return (
    <div className="bg-white rounded-b-lg border border-t-0">
      {/* Bulk Actions Bar - Only show when items are selected */}
      {selectedPaymentIds.length > 0 && (
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
                <button
                  onClick={onBulkImport}
                  className="group px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                >
                  <div className="flex items-center space-x-2">
                    <PencilSquareIcon className="w-4 h-4 text-blue-600" />
                    <span>Bulk Import</span>
                  </div>
                </button>
                <button
                  onClick={onBulkExport}
                  className="group px-3 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 hover:border-emerald-300 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  title="Export"
                >
                  <div className="flex items-center space-x-2">
                    <DownloadIcon className="w-4 h-4" />
                    <span>Export</span>
                  </div>
                </button>
            <button
              onClick={onBulkDelete}
              className="group px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/30"
            >
              <div className="flex items-center space-x-2">
                <TrashIcon className="w-4 h-4 text-red-600" />
                <span>Delete</span>
              </div>
            </button>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
              {selectedPaymentIds.length} Selected
            </span>
            <button
              onClick={onClearSelection}
              className="group p-2 text-orange-600 hover:text-orange-700 bg-orange-50 border border-orange-200 hover:bg-orange-100 hover:border-orange-300 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              title="Clear Selection"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">
            All Payments ({payments.length})
          </h3>
        </div>
      </div>

      {/* Simplified List */}
      <div className="divide-y divide-gray-200">
        {sortedPayments.map((payment) => (
          <div 
            key={payment._id}
            className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
              selectedPaymentId === payment._id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
            }`}
            onClick={() => onPaymentClick(payment)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <input
                  type="checkbox"
                  checked={selectedPaymentIds.includes(payment._id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleSelectPayment(payment._id, e.target.checked);
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                
                <div className="flex-1 min-w-0">
                  {/* Payment Number - Always visible */}
                  <div className="text-sm font-semibold text-gray-900 truncate">
                    {payment.paymentNumber}
                  </div>
                  
                  {/* Date and Vendor - Always visible */}
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(payment.paymentDate).toLocaleDateString()} • {payment.vendorName}
                  </div>
                  
                  {/* Status - Only show when not collapsed */}
                  {!isCollapsed && (
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                        {getStatusIcon(payment.status)}
                        <span className="ml-1">
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Amount - Only show when not collapsed */}
              {!isCollapsed && (
                <div className="text-sm font-semibold text-gray-900">
                  {formatCurrency(payment.amount)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {payments.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-sm">No payments found</div>
        </div>
      )}
    </div>
  );
}
