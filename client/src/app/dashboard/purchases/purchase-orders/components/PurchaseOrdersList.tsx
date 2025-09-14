"use client";

import React, { useState } from "react";
import { PurchaseOrder } from "@/services/purchaseOrderService";
import { formatCurrency } from "@/utils/currency";
import {
  PencilIcon,
  CheckIcon,
  PaperAirplaneIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface PurchaseOrdersListProps {
  purchaseOrders: PurchaseOrder[];
  selectedPurchaseOrderId?: string;
  onEdit: (purchaseOrder: PurchaseOrder) => void;
  onDelete: (purchaseOrderId: string) => void;
  onPurchaseOrderClick: (purchaseOrder: PurchaseOrder) => void;
  isCollapsed?: boolean;
}

export default function PurchaseOrdersList({ 
  purchaseOrders, 
  selectedPurchaseOrderId, 
  onEdit, 
  onDelete, 
  onPurchaseOrderClick, 
  isCollapsed = false 
}: PurchaseOrdersListProps) {
  const [selectedPurchaseOrders, setSelectedPurchaseOrders] = useState<string[]>([]);

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <PencilIcon className="h-4 w-4" />;
      case 'sent':
        return <PaperAirplaneIcon className="h-4 w-4" />;
      case 'approved':
        return <CheckIcon className="h-4 w-4" />;
      case 'partially_received':
        return <CheckIcon className="h-4 w-4" />;
      case 'received':
        return <CheckIcon className="h-4 w-4" />;
      case 'cancelled':
        return <XMarkIcon className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white">
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">
            All Purchase Orders ({purchaseOrders.length})
          </h3>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {purchaseOrders.map((purchaseOrder) => (
          <div 
            key={purchaseOrder._id}
            className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
              selectedPurchaseOrderId === purchaseOrder._id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
            }`}
            onClick={() => onPurchaseOrderClick(purchaseOrder)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <input
                  type="checkbox"
                  checked={selectedPurchaseOrders.includes(purchaseOrder._id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    if (e.target.checked) {
                      setSelectedPurchaseOrders(prev => [...prev, purchaseOrder._id]);
                    } else {
                      setSelectedPurchaseOrders(prev => prev.filter(id => id !== purchaseOrder._id));
                    }
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">
                    {purchaseOrder.purchaseOrderNumber}
                  </div>
                  
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(purchaseOrder.orderDate).toLocaleDateString()} • {purchaseOrder.vendorName}
                  </div>
                  
                  {!isCollapsed && (
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(purchaseOrder.status)}`}>
                        {getStatusIcon(purchaseOrder.status)}
                        <span className="ml-1">
                          {purchaseOrder.status.charAt(0).toUpperCase() + purchaseOrder.status.slice(1).replace('_', ' ')}
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {!isCollapsed && (
                <div className="text-sm font-semibold text-gray-900">
                  {formatCurrency(purchaseOrder.totalAmount)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {purchaseOrders.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-sm">No purchase orders found</div>
        </div>
      )}
    </div>
  );
}
