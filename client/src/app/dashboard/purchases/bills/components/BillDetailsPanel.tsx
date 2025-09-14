"use client";

import React from "react";
import { Bill } from "@/services/billService";
import { formatCurrency } from "@/utils/currency";
import {
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

interface BillDetailsPanelProps {
  bill: Bill;
  onClose: () => void;
  onUpdate: (bill: Bill) => void;
  onDelete: (billId: string) => void;
}

export default function BillDetailsPanel({ 
  bill, 
  onClose, 
  onUpdate, 
  onDelete 
}: BillDetailsPanelProps) {
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

  const handleStatusUpdate = async (newStatus: Bill['status']) => {
    try {
      // This would call the API to update the bill status
      const updatedBill = { ...bill, status: newStatus };
      onUpdate(updatedBill);
      
      const event = new CustomEvent("showToast", {
        detail: {
          message: `Bill status updated to ${newStatus.replace('_', ' ')}!`,
          type: "success",
        },
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error("Error updating bill status:", error);
      const event = new CustomEvent("showToast", {
        detail: {
          message: "Failed to update bill status. Please try again.",
          type: "error",
        },
      });
      window.dispatchEvent(event);
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this bill?")) {
      try {
        onDelete(bill._id);
        const event = new CustomEvent("showToast", {
          detail: {
            message: "Bill deleted successfully!",
            type: "success",
          },
        });
        window.dispatchEvent(event);
      } catch (error) {
        console.error("Error deleting bill:", error);
        const event = new CustomEvent("showToast", {
          detail: {
            message: "Failed to delete bill. Please try again.",
            type: "error",
          },
        });
        window.dispatchEvent(event);
      }
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {bill.billNumber}
            </h2>
            <p className="text-sm text-gray-500">{bill.vendorName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="space-y-6">
          {/* Bill Information */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Bill Information</h3>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Bill Number</dt>
                <dd className="text-sm text-gray-900">{bill.billNumber}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Vendor</dt>
                <dd className="text-sm text-gray-900">{bill.vendorName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Bill Date</dt>
                <dd className="text-sm text-gray-900">
                  {new Date(bill.billDate).toLocaleDateString()}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Due Date</dt>
                <dd className="text-sm text-gray-900">
                  {new Date(bill.dueDate).toLocaleDateString()}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Status</dt>
                <dd className="text-sm">
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(bill.status)}`}>
                    {getStatusIcon(bill.status)}
                    <span className="ml-1">
                      {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                    </span>
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          {/* Financial Summary */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Financial Summary</h3>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Subtotal</dt>
                <dd className="text-sm text-gray-900">{formatCurrency(bill.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Tax Amount</dt>
                <dd className="text-sm text-gray-900">{formatCurrency(bill.taxAmount)}</dd>
              </div>
              <div className="flex justify-between border-t pt-2">
                <dt className="text-sm font-medium text-gray-900">Total Amount</dt>
                <dd className="text-sm font-semibold text-gray-900">{formatCurrency(bill.totalAmount)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Paid Amount</dt>
                <dd className="text-sm text-gray-900">{formatCurrency(bill.paidAmount)}</dd>
              </div>
              <div className="flex justify-between border-t pt-2">
                <dt className="text-sm font-medium text-gray-900">Balance Amount</dt>
                <dd className="text-sm font-semibold text-gray-900">{formatCurrency(bill.balanceAmount)}</dd>
              </div>
            </dl>
          </div>

          {/* Status Actions */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {bill.status === 'draft' && (
                <button
                  onClick={() => handleStatusUpdate('sent')}
                  className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md"
                >
                  Mark as Sent
                </button>
              )}
              {bill.status === 'sent' && (
                <button
                  onClick={() => handleStatusUpdate('received')}
                  className="w-full text-left px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-md"
                >
                  Mark as Received
                </button>
              )}
              {bill.status === 'received' && (
                <button
                  onClick={() => handleStatusUpdate('paid')}
                  className="w-full text-left px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-md"
                >
                  Mark as Paid
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex space-x-3">
          <button
            onClick={() => {
              // Edit functionality would go here
              console.log("Edit bill:", bill._id);
            }}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
