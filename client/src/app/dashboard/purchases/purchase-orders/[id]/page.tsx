"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  PrinterIcon,
  TruckIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { api } from "@/lib/api";
import { formatCurrency } from "@/utils/currency";

interface PurchaseOrder {
  _id: string;
  purchaseOrderNumber: string;
  referenceNumber?: string;
  date: string;
  deliveryDate?: string;
  vendor: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
  };
  deliveryAddress: {
    type: string;
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode?: string;
    phone?: string;
    email?: string;
  };
  shipmentPreference?: string;
  paymentTerms: string;
  items: Array<{
    _id: string;
    item: {
      _id: string;
      name: string;
      description?: string;
    };
    description: string;
    account: {
      _id: string;
      name: string;
      type: string;
    };
    quantity: number;
    rate: number;
    amount: number;
    discount: number;
    tax?: {
      _id: string;
      name: string;
      rate: number;
    };
    taxAmount: number;
    totalAmount: number;
  }>;
  subTotal: number;
  discount: {
    type: string;
    value: number;
    amount: number;
  };
  tax: {
    type: string;
    taxId?: {
      _id: string;
      name: string;
      rate: number;
    };
    amount: number;
  };
  adjustment: number;
  totalAmount: number;
  customerNotes?: string;
  termsAndConditions?: string;
  status:
    | "draft"
    | "sent"
    | "acknowledged"
    | "partially_received"
    | "received"
    | "closed"
    | "cancelled";
  attachments: Array<{
    _id: string;
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    uploadedAt: string;
  }>;
  sentAt?: string;
  acknowledgedAt?: string;
  receivedAt?: string;
  closedAt?: string;
  convertedToBill?: {
    _id: string;
    billNumber: string;
  };
  convertedAt?: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface PurchaseOrderResponse {
  success: boolean;
  data: PurchaseOrder;
}

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  sent: "bg-blue-100 text-blue-800",
  acknowledged: "bg-yellow-100 text-yellow-800",
  partially_received: "bg-orange-100 text-orange-800",
  received: "bg-green-100 text-green-800",
  closed: "bg-purple-100 text-purple-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusLabels = {
  draft: "Draft",
  sent: "Sent",
  acknowledged: "Acknowledged",
  partially_received: "Partially Received",
  received: "Received",
  closed: "Closed",
  cancelled: "Cancelled",
};

export default function PurchaseOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchPurchaseOrder(params.id as string);
    }
  }, [params.id]);

  const fetchPurchaseOrder = async (id: string) => {
    try {
      setLoading(true);
      const response = await api<PurchaseOrderResponse>(
        `/api/purchase-orders/${id}`
      );

      if (response.success) {
        setPurchaseOrder(response.data);
      }
    } catch (error) {
      console.error("Error fetching purchase order:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !purchaseOrder ||
      !confirm("Are you sure you want to delete this purchase order?")
    )
      return;

    try {
      setActionLoading("delete");
      const response = await api(`/api/purchase-orders/${purchaseOrder._id}`, {
        method: "DELETE",
      });

      if (response.success) {
        router.push("/dashboard/purchases/purchase-orders");
      }
    } catch (error) {
      console.error("Error deleting purchase order:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusUpdate = async (status: string) => {
    if (!purchaseOrder) return;

    try {
      setActionLoading(status);
      const response = await api(
        `/api/purchase-orders/${purchaseOrder._id}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status }),
        }
      );

      if (response.success) {
        fetchPurchaseOrder(purchaseOrder._id);
      }
    } catch (error) {
      console.error("Error updating purchase order status:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownloadAttachment = async (
    attachment: PurchaseOrder["attachments"][0]
  ) => {
    try {
      const response = await fetch(
        `/api/purchase-orders/${purchaseOrder?._id}/attachments/${attachment._id}/download`
      );
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = attachment.originalName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Error downloading attachment:", error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <TruckIcon className="h-4 w-4" />;
      case "received":
        return <CheckIcon className="h-4 w-4" />;
      case "cancelled":
        return <XMarkIcon className="h-4 w-4" />;
      case "acknowledged":
        return <ClockIcon className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getDaysUntilDelivery = (deliveryDate: string) => {
    if (!deliveryDate) return null;
    const today = new Date();
    const delivery = new Date(deliveryDate);
    const diffTime = delivery.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!purchaseOrder) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">
          Purchase order not found
        </h3>
        <p className="text-gray-500 mt-2">
          The purchase order you're looking for doesn't exist.
        </p>
        <button
          onClick={() => router.push("/dashboard/purchases/purchase-orders")}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Back to Purchase Orders
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {purchaseOrder.purchaseOrderNumber}
            </h1>
            <p className="text-gray-600">
              {new Date(purchaseOrder.date).toLocaleDateString()} •{" "}
              {purchaseOrder.vendor.name}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span
            className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full ${
              statusColors[purchaseOrder.status]
            }`}
          >
            {getStatusIcon(purchaseOrder.status)}
            <span className="ml-1">{statusLabels[purchaseOrder.status]}</span>
          </span>

          <div className="flex items-center space-x-1">
            <button
              onClick={() =>
                router.push(
                  `/dashboard/purchases/purchase-orders/${purchaseOrder._id}/edit`
                )
              }
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <PencilIcon className="h-5 w-5" />
            </button>

            {purchaseOrder.status === "draft" && (
              <button
                onClick={() => handleStatusUpdate("sent")}
                disabled={actionLoading === "sent"}
                className="p-2 text-green-600 hover:text-green-800 disabled:opacity-50"
                title="Send Purchase Order"
              >
                <TruckIcon className="h-5 w-5" />
              </button>
            )}

            {purchaseOrder.status === "sent" && (
              <button
                onClick={() => handleStatusUpdate("received")}
                disabled={actionLoading === "received"}
                className="p-2 text-green-600 hover:text-green-800 disabled:opacity-50"
                title="Mark as Received"
              >
                <CheckIcon className="h-5 w-5" />
              </button>
            )}

            <button
              onClick={handleDelete}
              disabled={actionLoading === "delete"}
              className="p-2 text-red-600 hover:text-red-800 disabled:opacity-50"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Purchase Order Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Date
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(purchaseOrder.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Reference Number
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {purchaseOrder.referenceNumber || "-"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Delivery Date
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {purchaseOrder.deliveryDate ? (
                    <div>
                      <div>
                        {new Date(
                          purchaseOrder.deliveryDate
                        ).toLocaleDateString()}
                      </div>
                      {getDaysUntilDelivery(purchaseOrder.deliveryDate) !==
                        null && (
                        <div
                          className={`text-xs ${
                            getDaysUntilDelivery(purchaseOrder.deliveryDate)! <
                            0
                              ? "text-red-500"
                              : getDaysUntilDelivery(
                                  purchaseOrder.deliveryDate
                                )! < 7
                              ? "text-yellow-500"
                              : "text-green-500"
                          }`}
                        >
                          {getDaysUntilDelivery(purchaseOrder.deliveryDate)! < 0
                            ? `${Math.abs(
                                getDaysUntilDelivery(
                                  purchaseOrder.deliveryDate
                                )!
                              )} days overdue`
                            : `${getDaysUntilDelivery(
                                purchaseOrder.deliveryDate
                              )} days left`}
                        </div>
                      )}
                    </div>
                  ) : (
                    "-"
                  )}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Payment Terms
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {purchaseOrder.paymentTerms}
                </p>
              </div>

              {purchaseOrder.shipmentPreference && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Shipment Preference
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {purchaseOrder.shipmentPreference}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Vendor Information */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Vendor Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Vendor Name
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {purchaseOrder.vendor.name}
                </p>
                {purchaseOrder.vendor.email && (
                  <p className="text-sm text-gray-500">
                    {purchaseOrder.vendor.email}
                  </p>
                )}
                {purchaseOrder.vendor.phone && (
                  <p className="text-sm text-gray-500">
                    {purchaseOrder.vendor.phone}
                  </p>
                )}
              </div>

              {purchaseOrder.vendor.address && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Vendor Address
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {purchaseOrder.vendor.address}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Delivery Address
            </h2>

            <div className="space-y-2">
              <p className="text-sm text-gray-900">
                <span className="font-medium">
                  {purchaseOrder.deliveryAddress.name}
                </span>
              </p>
              <p className="text-sm text-gray-900">
                {purchaseOrder.deliveryAddress.address}
              </p>
              <p className="text-sm text-gray-900">
                {purchaseOrder.deliveryAddress.city},{" "}
                {purchaseOrder.deliveryAddress.state}{" "}
                {purchaseOrder.deliveryAddress.zipCode}
              </p>
              <p className="text-sm text-gray-900">
                {purchaseOrder.deliveryAddress.country}
              </p>
              {purchaseOrder.deliveryAddress.phone && (
                <p className="text-sm text-gray-500">
                  Phone: {purchaseOrder.deliveryAddress.phone}
                </p>
              )}
              {purchaseOrder.deliveryAddress.email && (
                <p className="text-sm text-gray-500">
                  Email: {purchaseOrder.deliveryAddress.email}
                </p>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Items</h2>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Account
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Qty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {purchaseOrder.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.item.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.description || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.account.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(item.rate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes and Terms */}
          {(purchaseOrder.customerNotes ||
            purchaseOrder.termsAndConditions) && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Additional Information
              </h2>

              <div className="space-y-4">
                {purchaseOrder.customerNotes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Customer Notes
                    </label>
                    <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                      {purchaseOrder.customerNotes}
                    </p>
                  </div>
                )}

                {purchaseOrder.termsAndConditions && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Terms & Conditions
                    </label>
                    <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                      {purchaseOrder.termsAndConditions}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Attachments */}
          {purchaseOrder.attachments.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Attachments
              </h2>

              <div className="space-y-3">
                {purchaseOrder.attachments.map((attachment) => (
                  <div
                    key={attachment._id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <DocumentArrowDownIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {attachment.originalName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(attachment.size / 1024 / 1024).toFixed(2)} MB •{" "}
                          {new Date(attachment.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownloadAttachment(attachment)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <DocumentArrowDownIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Financial Summary */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Financial Summary
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">
                  Sub Total
                </span>
                <span className="text-sm text-gray-900">
                  {formatCurrency(purchaseOrder.subTotal)}
                </span>
              </div>

              {purchaseOrder.discount.amount > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">
                    Discount
                  </span>
                  <span className="text-sm text-gray-900">
                    {formatCurrency(purchaseOrder.discount.amount)}
                  </span>
                </div>
              )}

              {purchaseOrder.tax.amount > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Tax</span>
                  <span className="text-sm text-gray-900">
                    {formatCurrency(purchaseOrder.tax.amount)}
                  </span>
                </div>
              )}

              {purchaseOrder.adjustment !== 0 && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">
                    Adjustment
                  </span>
                  <span className="text-sm text-gray-900">
                    {formatCurrency(purchaseOrder.adjustment)}
                  </span>
                </div>
              )}

              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between">
                  <span className="text-base font-medium text-gray-900">
                    Total
                  </span>
                  <span className="text-base font-medium text-gray-900">
                    {formatCurrency(purchaseOrder.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Workflow Status */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Workflow Status
            </h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Created</span>
                <span className="text-sm text-gray-900">
                  {new Date(purchaseOrder.createdAt).toLocaleDateString()}
                </span>
              </div>

              {purchaseOrder.sentAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Sent</span>
                  <span className="text-sm text-gray-900">
                    {new Date(purchaseOrder.sentAt).toLocaleDateString()}
                  </span>
                </div>
              )}

              {purchaseOrder.acknowledgedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Acknowledged</span>
                  <span className="text-sm text-gray-900">
                    {new Date(
                      purchaseOrder.acknowledgedAt
                    ).toLocaleDateString()}
                  </span>
                </div>
              )}

              {purchaseOrder.receivedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Received</span>
                  <span className="text-sm text-gray-900">
                    {new Date(purchaseOrder.receivedAt).toLocaleDateString()}
                  </span>
                </div>
              )}

              {purchaseOrder.closedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Closed</span>
                  <span className="text-sm text-gray-900">
                    {new Date(purchaseOrder.closedAt).toLocaleDateString()}
                  </span>
                </div>
              )}

              {purchaseOrder.convertedToBill && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Converted to Bill
                  </span>
                  <span className="text-sm text-gray-900">
                    {purchaseOrder.convertedToBill.billNumber}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Audit Information */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Audit Information
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Created By
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {purchaseOrder.createdBy.name}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(purchaseOrder.createdAt).toLocaleString()}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Last Updated
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(purchaseOrder.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
