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
} from "@heroicons/react/24/outline";

interface PaymentsListProps {
  payments: Payment[];
  selectedPaymentId?: string;
  onEdit: (payment: Payment) => void;
  onDelete: (paymentId: string) => void;
  onPaymentClick: (payment: Payment) => void;
  isCollapsed?: boolean; // New prop to determine if showing minimal info
}

export default function PaymentsList({ 
  payments, 
  selectedPaymentId, 
  onEdit, 
  onDelete, 
  onPaymentClick, 
  isCollapsed = false 
}: PaymentsListProps) {
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
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
      setSelectedPayments(prev => [...prev, paymentId]);
    } else {
      setSelectedPayments(prev => prev.filter(id => id !== paymentId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPayments(payments.map(payment => payment._id));
    } else {
      setSelectedPayments([]);
    }
  };

  return (
    <div className="bg-white rounded-b-lg border border-t-0">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">
            All Payments ({payments.length})
          </h3>
          {selectedPayments.length > 0 && (
            <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
              {selectedPayments.length} selected
            </span>
          )}
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
                  checked={selectedPayments.includes(payment._id)}
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
