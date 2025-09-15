"use client";

import React, { useState } from "react";
import { Bill } from "@/services/billService";
import { formatCurrency } from "@/utils/currency";
import {
  PencilIcon,
  CheckIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface BillsListProps {
  bills: Bill[];
  selectedBillId?: string;
  onEdit: (bill: Bill) => void;
  onDelete: (billId: string) => void;
  onBillClick: (bill: Bill) => void;
  isCollapsed?: boolean; // New prop to determine if showing minimal info
}

export default function BillsList({ 
  bills, 
  selectedBillId, 
  onEdit, 
  onDelete, 
  onBillClick, 
  isCollapsed = false 
}: BillsListProps) {
  const [selectedBills, setSelectedBills] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      received: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      paid: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <PencilIcon className="h-4 w-4" />;
      case 'sent':
        return <ClockIcon className="h-4 w-4" />;
      case 'received':
        return <CheckIcon className="h-4 w-4" />;
      case 'overdue':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'paid':
        return <CheckIcon className="h-4 w-4" />;
      case 'cancelled':
        return <XMarkIcon className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const sortedBills = [...bills].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'date':
        aValue = new Date(a.billDate).getTime();
        bValue = new Date(b.billDate).getTime();
        break;
      case 'amount':
        aValue = a.totalAmount;
        bValue = b.totalAmount;
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
        aValue = new Date(a.billDate).getTime();
        bValue = new Date(b.billDate).getTime();
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSelectBill = (billId: string, checked: boolean) => {
    if (checked) {
      setSelectedBills(prev => [...prev, billId]);
    } else {
      setSelectedBills(prev => prev.filter(id => id !== billId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedBills(bills.map(bill => bill._id));
    } else {
      setSelectedBills([]);
    }
  };

  return (
    <div className="bg-white rounded-b-lg border border-t-0">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">
            All Bills ({bills.length})
          </h3>
          {selectedBills.length > 0 && (
            <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
              {selectedBills.length} selected
            </span>
          )}
        </div>
      </div>

      {/* Simplified List */}
      <div className="divide-y divide-gray-200">
        {sortedBills.map((bill) => (
          <div 
            key={bill._id}
            className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
              selectedBillId === bill._id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
            }`}
            onClick={() => onBillClick(bill)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <input
                  type="checkbox"
                  checked={selectedBills.includes(bill._id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleSelectBill(bill._id, e.target.checked);
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                
                <div className="flex-1 min-w-0">
                  {/* Bill Number - Always visible */}
                  <div className="text-sm font-semibold text-gray-900 truncate">
                    {bill.billNumber}
                  </div>
                  
                  {/* Date and Vendor - Always visible */}
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(bill.billDate).toLocaleDateString()} • {bill.vendorName}
                  </div>
                  
                  {/* Status - Only show when not collapsed */}
                  {!isCollapsed && (
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(bill.status)}`}>
                        {getStatusIcon(bill.status)}
                        <span className="ml-1">
                          {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Amount - Only show when not collapsed */}
              {!isCollapsed && (
                <div className="text-sm font-semibold text-gray-900">
                  {formatCurrency(bill.totalAmount)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {bills.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-sm">No bills found</div>
        </div>
      )}
    </div>
  );
}
