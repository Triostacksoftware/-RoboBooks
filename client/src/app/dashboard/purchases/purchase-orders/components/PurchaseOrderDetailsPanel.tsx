"use client";

import React from "react";
import { PurchaseOrder } from "@/services/purchaseOrderService";
import { formatCurrency } from "@/utils/currency";
import { XMarkIcon, PencilIcon, CheckIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";

interface PurchaseOrderDetailsPanelProps {
  purchaseOrder: PurchaseOrder;
  onClose: () => void;
  onUpdate: (purchaseOrder: PurchaseOrder) => void;
  onDelete: (purchaseOrderId: string) => void;
}

export default function PurchaseOrderDetailsPanel({ 
  purchaseOrder, 
  onClose, 
  onUpdate, 
  onDelete 
}: PurchaseOrderDetailsPanelProps) {
  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      partially_received: 'bg-yellow-100 text-yellow-800',
      received: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {purchaseOrder.purchaseOrderNumber}
            </h2>
            <p className="text-sm text-gray-500">{purchaseOrder.vendorName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Order Information</h3>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Order Number</dt>
                <dd className="text-sm text-gray-900">{purchaseOrder.purchaseOrderNumber}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Vendor</dt>
                <dd className="text-sm text-gray-900">{purchaseOrder.vendorName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Order Date</dt>
                <dd className="text-sm text-gray-900">
                  {new Date(purchaseOrder.orderDate).toLocaleDateString()}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Expected Date</dt>
                <dd className="text-sm text-gray-900">
                  {new Date(purchaseOrder.expectedDate).toLocaleDateString()}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Total Amount</dt>
                <dd className="text-sm font-semibold text-gray-900">{formatCurrency(purchaseOrder.totalAmount)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Status</dt>
                <dd className="text-sm">
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(purchaseOrder.status)}`}>
                    {purchaseOrder.status.charAt(0).toUpperCase() + purchaseOrder.status.slice(1).replace('_', ' ')}
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex space-x-3">
          <button
            onClick={() => console.log("Edit purchase order:", purchaseOrder._id)}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(purchaseOrder._id)}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
