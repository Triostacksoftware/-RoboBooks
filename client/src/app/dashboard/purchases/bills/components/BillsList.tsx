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
  PencilSquareIcon,
  TrashIcon,
  ArrowDownTrayIcon as DownloadIcon,
} from "@heroicons/react/24/outline";

interface BillsListProps {
  bills: Bill[];
  selectedBillId?: string;
  onEdit: (bill: Bill) => void;
  onDelete: (billId: string) => void;
  onBillClick: (bill: Bill) => void;
  isCollapsed?: boolean; // New prop to determine if showing minimal info
  selectedBillIds: string[];
  onBulkSelectionChange: (selectedIds: string[]) => void;
  onBulkImport: () => void;
  onBulkExport: () => void;
  onBulkDelete: () => void;
  onClearSelection: () => void;
}

export default function BillsList({ 
  bills, 
  selectedBillId, 
  onEdit, 
  onDelete, 
  onBillClick, 
  isCollapsed = false,
  selectedBillIds,
  onBulkSelectionChange,
  onBulkImport,
  onBulkExport,
  onBulkDelete,
  onClearSelection
}: BillsListProps) {
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
      onBulkSelectionChange([...selectedBillIds, billId]);
    } else {
      onBulkSelectionChange(selectedBillIds.filter(id => id !== billId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onBulkSelectionChange(bills.map(bill => bill._id));
    } else {
      onBulkSelectionChange([]);
    }
  };

  return (
    <div className="bg-white rounded-b-lg border border-t-0">
      {/* Bulk Actions Bar - Only show when items are selected */}
      {selectedBillIds.length > 0 && (
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
              {selectedBillIds.length} Selected
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
            All Bills ({bills.length})
          </h3>
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
                  checked={selectedBillIds.includes(bill._id)}
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
