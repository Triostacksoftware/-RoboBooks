'use client';

import React, { useState } from 'react';
import {
  DocumentArrowUpIcon,
  EnvelopeIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import SendEmailModal from '../components/SendEmailModal';

interface DeliveryChallanDetailProps {
  deliveryChallan: any;
  onStatusUpdate: (status: string, additionalData?: any) => void;
  onSendEmail: (emailData: any) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

interface ReturnData {
  partialReturn: boolean;
  returnedItems: string[];
  notes: string;
}

const DeliveryChallanDetail: React.FC<DeliveryChallanDetailProps> = ({
  deliveryChallan,
  onStatusUpdate,
  onSendEmail,
  onDuplicate,
  onDelete
}) => {
  const [showSendEmailModal, setShowSendEmailModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnData, setReturnData] = useState<ReturnData>({
    partialReturn: false,
    returnedItems: [],
    notes: ''
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft': return 'bg-gray-100 text-gray-800';
      case 'Open': return 'bg-blue-100 text-blue-800';
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Returned': return 'bg-red-100 text-red-800';
      case 'Partially Returned': return 'bg-orange-100 text-orange-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInvoiceStatusColor = (status: string) => {
    switch (status) {
      case 'Not Invoiced': return 'bg-gray-100 text-gray-800';
      case 'Partially Invoiced': return 'bg-yellow-100 text-yellow-800';
      case 'Fully Invoiced': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canEdit = deliveryChallan.status === 'Draft';
  const canOpen = deliveryChallan.status === 'Draft';
  const canMarkDelivered = deliveryChallan.status === 'Open';
  const canReturn = ['Open', 'Delivered'].includes(deliveryChallan.status);

  const handleReturn = () => {
    if (returnData.partialReturn && returnData.returnedItems.length === 0) {
      alert('Please select items to return for partial return');
      return;
    }
    onStatusUpdate('Returned', returnData);
    setShowReturnModal(false);
    setReturnData({ partialReturn: false, returnedItems: [], notes: '' });
  };

  const handleItemReturnToggle = (itemId: string) => {
    setReturnData(prev => ({
      ...prev,
      returnedItems: prev.returnedItems.includes(itemId)
        ? prev.returnedItems.filter(id => id !== itemId)
        : [...prev.returnedItems, itemId]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Status and Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(deliveryChallan.status)}`}>
              {deliveryChallan.status}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getInvoiceStatusColor(deliveryChallan.invoiceStatus)}`}>
              {deliveryChallan.invoiceStatus}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <EyeIcon className="h-4 w-4 mr-2" />
              Print/PDF
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {canOpen && (
            <button
              onClick={() => onStatusUpdate('Open')}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Convert to Open
            </button>
          )}

          {canMarkDelivered && (
            <button
              onClick={() => onStatusUpdate('Delivered')}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <CheckIcon className="h-4 w-4 mr-2" />
              Mark Delivered
            </button>
          )}

          {canReturn && (
            <button
              onClick={() => setShowReturnModal(true)}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <XMarkIcon className="h-4 w-4 mr-2" />
              Mark Returned
            </button>
          )}

          <button
            onClick={() => setShowSendEmailModal(true)}
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <EnvelopeIcon className="h-4 w-4 mr-2" />
            Send
          </button>

          <button
            onClick={onDuplicate}
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
            Duplicate
          </button>

          {canEdit && (
            <button
              onClick={() => {/* Navigate to edit page */}}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit
            </button>
          )}

          {canEdit && (
            <button
              onClick={onDelete}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Basic Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Challan Number</label>
            <p className="mt-1 text-sm text-gray-900">{deliveryChallan.challanNo}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Reference Number</label>
            <p className="mt-1 text-sm text-gray-900">{deliveryChallan.referenceNo || '-'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Challan Date</label>
            <p className="mt-1 text-sm text-gray-900">
              {format(new Date(deliveryChallan.challanDate), 'MMM dd, yyyy')}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Challan Type</label>
            <p className="mt-1 text-sm text-gray-900">{deliveryChallan.challanType}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Customer</label>
            <p className="mt-1 text-sm text-gray-900">{deliveryChallan.customerName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Place of Supply</label>
            <p className="mt-1 text-sm text-gray-900">{deliveryChallan.placeOfSupply || '-'}</p>
          </div>
        </div>
      </div>

      {/* Addresses */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Addresses</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Ship To</h4>
            {deliveryChallan.shipTo ? (
              <div className="text-sm text-gray-900">
                <p>{deliveryChallan.shipTo.name}</p>
                <p>{deliveryChallan.shipTo.address}</p>
                <p>{deliveryChallan.shipTo.city}, {deliveryChallan.shipTo.state} {deliveryChallan.shipTo.pincode}</p>
                <p>{deliveryChallan.shipTo.country}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No shipping address specified</p>
            )}
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Dispatch From</h4>
            {deliveryChallan.dispatchFrom ? (
              <div className="text-sm text-gray-900">
                <p>{deliveryChallan.dispatchFrom.name}</p>
                <p>{deliveryChallan.dispatchFrom.address}</p>
                <p>{deliveryChallan.dispatchFrom.city}, {deliveryChallan.dispatchFrom.state} {deliveryChallan.dispatchFrom.pincode}</p>
                <p>{deliveryChallan.dispatchFrom.country}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No dispatch address specified</p>
            )}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Items</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">HSN</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UOM</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {deliveryChallan.items.map((item: any, index: number) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.itemName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.hsn || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.uom}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{item.rate?.toFixed(2) || '0.00'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{item.amount?.toFixed(2) || '0.00'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Subtotal</span>
            <span className="text-sm font-medium text-gray-900">₹{deliveryChallan.subTotal?.toFixed(2) || '0.00'}</span>
          </div>
          {deliveryChallan.discount > 0 && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">
                Discount {deliveryChallan.discountType === 'percentage' ? `(${deliveryChallan.discount}%)` : ''}
              </span>
              <span className="text-sm font-medium text-gray-900">-₹{deliveryChallan.discountAmount?.toFixed(2) || '0.00'}</span>
            </div>
          )}
          {deliveryChallan.adjustment !== 0 && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Adjustment</span>
              <span className="text-sm font-medium text-gray-900">
                {deliveryChallan.adjustment > 0 ? '+' : ''}₹{deliveryChallan.adjustment?.toFixed(2) || '0.00'}
              </span>
            </div>
          )}
          <div className="border-t pt-3">
            <div className="flex justify-between">
              <span className="text-base font-medium text-gray-900">Total</span>
              <span className="text-base font-bold text-gray-900">₹{deliveryChallan.total?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes and Terms */}
      {(deliveryChallan.notes || deliveryChallan.terms) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
          {deliveryChallan.notes && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <p className="text-sm text-gray-900">{deliveryChallan.notes}</p>
            </div>
          )}
          {deliveryChallan.terms && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Terms & Conditions</label>
              <p className="text-sm text-gray-900">{deliveryChallan.terms}</p>
            </div>
          )}
        </div>
      )}

      {/* Audit Timeline */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Audit Timeline</h3>
        <div className="space-y-4">
          {deliveryChallan.audit && deliveryChallan.audit.length > 0 ? (
            deliveryChallan.audit.map((entry: any, index: number) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{entry.action}</p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(entry.timestamp), 'MMM dd, yyyy HH:mm')} by {entry.userName || 'System'}
                  </p>
                  {entry.notes && (
                    <p className="text-xs text-gray-600 mt-1">{entry.notes}</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No audit entries yet</p>
          )}
        </div>
      </div>

      {/* Email Log */}
      {deliveryChallan.emailLog && deliveryChallan.emailLog.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Email History</h3>
          <div className="space-y-3">
            {deliveryChallan.emailLog.map((email: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{email.to}</p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(email.timestamp), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  Sent
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Send Email Modal */}
      <SendEmailModal
        isOpen={showSendEmailModal}
        onClose={() => setShowSendEmailModal(false)}
        onSend={onSendEmail}
        deliveryChallan={deliveryChallan}
      />

      {/* Return Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Mark as Returned</h3>
              
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={returnData.partialReturn}
                    onChange={(e) => setReturnData(prev => ({ ...prev, partialReturn: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Partial Return</span>
                </label>
              </div>

              {returnData.partialReturn && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Items to Return</label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {deliveryChallan.items.map((item: any, index: number) => (
                      <label key={index} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={returnData.returnedItems.includes(item._id || index.toString())}
                          onChange={() => handleItemReturnToggle(item._id || index.toString())}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {item.itemName} ({item.quantity} {item.uom})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={returnData.notes}
                  onChange={(e) => setReturnData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Optional notes about the return..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowReturnModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReturn}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
                >
                  Mark Returned
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryChallanDetail;
