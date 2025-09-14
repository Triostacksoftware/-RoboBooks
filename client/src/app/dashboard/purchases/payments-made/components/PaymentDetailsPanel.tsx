"use client";

import React from "react";
import { Payment } from "@/services/paymentService";
import { formatCurrency } from "@/utils/currency";
import {
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  ClockIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

interface PaymentDetailsPanelProps {
  payment: Payment;
  onClose: () => void;
  onUpdate: (payment: Payment) => void;
  onDelete: (paymentId: string) => void;
}

export default function PaymentDetailsPanel({ 
  payment, 
  onClose, 
  onUpdate, 
  onDelete 
}: PaymentDetailsPanelProps) {
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

  const handleStatusUpdate = async (newStatus: Payment['status']) => {
    try {
      // This would call the API to update the payment status
      const updatedPayment = { ...payment, status: newStatus };
      onUpdate(updatedPayment);
      
      const event = new CustomEvent("showToast", {
        detail: {
          message: `Payment status updated to ${newStatus.replace('_', ' ')}!`,
          type: "success",
        },
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error("Error updating payment status:", error);
      const event = new CustomEvent("showToast", {
        detail: {
          message: "Failed to update payment status. Please try again.",
          type: "error",
        },
      });
      window.dispatchEvent(event);
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this payment?")) {
      try {
        onDelete(payment._id);
        const event = new CustomEvent("showToast", {
          detail: {
            message: "Payment deleted successfully!",
            type: "success",
          },
        });
        window.dispatchEvent(event);
      } catch (error) {
        console.error("Error deleting payment:", error);
        const event = new CustomEvent("showToast", {
          detail: {
            message: "Failed to delete payment. Please try again.",
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
              {payment.paymentNumber}
            </h2>
            <p className="text-sm text-gray-500">{payment.vendorName}</p>
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
          {/* Payment Information */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Payment Information</h3>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Payment Number</dt>
                <dd className="text-sm text-gray-900">{payment.paymentNumber}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Vendor</dt>
                <dd className="text-sm text-gray-900">{payment.vendorName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Payment Date</dt>
                <dd className="text-sm text-gray-900">
                  {new Date(payment.paymentDate).toLocaleDateString()}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Amount</dt>
                <dd className="text-sm font-semibold text-gray-900">{formatCurrency(payment.amount)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Payment Method</dt>
                <dd className="text-sm text-gray-900">
                  <div className="flex items-center">
                    <span className="mr-2">{getPaymentMethodIcon(payment.paymentMethod)}</span>
                    <span className="capitalize">{payment.paymentMethod.replace('_', ' ')}</span>
                  </div>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Status</dt>
                <dd className="text-sm">
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                    {getStatusIcon(payment.status)}
                    <span className="ml-1">
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </span>
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          {/* Additional Details */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Additional Details</h3>
            <dl className="space-y-2">
              {payment.billNumber && (
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Bill Number</dt>
                  <dd className="text-sm text-gray-900">{payment.billNumber}</dd>
                </div>
              )}
              {payment.reference && (
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Reference</dt>
                  <dd className="text-sm text-gray-900">{payment.reference}</dd>
                </div>
              )}
              {payment.bankAccount && (
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Bank Account</dt>
                  <dd className="text-sm text-gray-900">{payment.bankAccount}</dd>
                </div>
              )}
              {payment.checkNumber && (
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Check Number</dt>
                  <dd className="text-sm text-gray-900">{payment.checkNumber}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Currency</dt>
                <dd className="text-sm text-gray-900">{payment.currency}</dd>
              </div>
              {payment.notes && (
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Notes</dt>
                  <dd className="text-sm text-gray-900">{payment.notes}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Status Actions */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {payment.status === 'pending' && (
                <button
                  onClick={() => handleStatusUpdate('completed')}
                  className="w-full text-left px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-md"
                >
                  Mark as Completed
                </button>
              )}
              {payment.status === 'completed' && (
                <button
                  onClick={() => handleStatusUpdate('cancelled')}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                >
                  Mark as Cancelled
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
              console.log("Edit payment:", payment._id);
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
