"use client";

import React, { useState, useEffect } from "react";
import ModuleAccessGuard from "@/components/ModuleAccessGuard";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  PrinterIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  UserIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  TruckIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

interface SalesOrderItem {
  _id: string;
  itemId: string;
  details: string;
  description?: string;
  quantity: number;
  rate: number;
  taxRate: number;
  taxAmount: number;
  amount: number;
}

interface SalesOrder {
  _id: string;
  salesOrderNumber: string;
  customerId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    company?: string;
    address?: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  };
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderDate: string;
  deliveryDate: string;
  items: SalesOrderItem[];
  subTotal: number;
  taxAmount: number;
  total: number;
  status: string;
  customerNotes?: string;
  termsConditions?: string;
  createdAt: string;
  updatedAt: string;
}

const SalesOrderDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const [salesOrder, setSalesOrder] = useState<SalesOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (params.id) {
      fetchSalesOrder(params.id as string);
    }
  }, [params.id]);

  const fetchSalesOrder = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/sales-orders/${id}`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setSalesOrder(result.data || result);
      } else {
        setError("Failed to fetch sales order");
      }
    } catch (error) {
      console.error("Error fetching sales order:", error);
      setError("Failed to fetch sales order");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/sales-orders/${params.id}`,
          {
            method: "DELETE",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          Swal.fire("Deleted!", "Sales order has been deleted.", "success");
          router.push("/dashboard/sales/sales-orders");
        } else {
          Swal.fire("Error!", "Failed to delete sales order.", "error");
        }
      } catch (error) {
        console.error("Error deleting sales order:", error);
        Swal.fire("Error!", "Failed to delete sales order.", "error");
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "viewed":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "draft":
        return <DocumentTextIcon className="h-4 w-4" />;
      case "sent":
        return <EnvelopeIcon className="h-4 w-4" />;
      case "viewed":
        return <EyeIcon className="h-4 w-4" />;
      case "confirmed":
        return <CheckIcon className="h-4 w-4" />;
      case "shipped":
        return <TruckIcon className="h-4 w-4" />;
      case "delivered":
        return <CheckIcon className="h-4 w-4" />;
      case "cancelled":
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      default:
        return <DocumentTextIcon className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading sales order...</p>
        </div>
      </div>
    );
  }

  if (error || !salesOrder) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            {error || "Sales order not found"}
          </p>
          <Link
            href="/dashboard/sales/sales-orders"
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            Back to Sales Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard/sales/sales-orders"
            className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Sales Order #{salesOrder.salesOrderNumber}
            </h1>
            <p className="text-gray-600 mt-1">
              Created on {new Date(salesOrder.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
              salesOrder.status
            )}`}
          >
            {getStatusIcon(salesOrder.status)}
            <span className="ml-1">{salesOrder.status}</span>
          </span>
          <Link
            href={`/dashboard/sales/sales-orders/${salesOrder._id}/edit`}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2"
          >
            <PencilIcon className="h-4 w-4" />
            <span>Edit</span>
          </Link>
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2"
          >
            <TrashIcon className="h-4 w-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <UserIcon className="h-5 w-5 mr-2" />
              Customer Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-900">
                  {salesOrder.customerId.firstName}{" "}
                  {salesOrder.customerId.lastName}
                </h3>
                {salesOrder.customerId.company && (
                  <p className="text-gray-600">
                    {salesOrder.customerId.company}
                  </p>
                )}
                <p className="text-gray-600">{salesOrder.customerId.email}</p>
                <p className="text-gray-600">{salesOrder.customerId.phone}</p>
              </div>
              {salesOrder.customerId.address && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    Shipping Address
                  </h3>
                  <p className="text-gray-600">
                    {salesOrder.customerId.address.street}
                  </p>
                  <p className="text-gray-600">
                    {salesOrder.customerId.address.city},{" "}
                    {salesOrder.customerId.address.state}{" "}
                    {salesOrder.customerId.address.zipCode}
                  </p>
                  <p className="text-gray-600">
                    {salesOrder.customerId.address.country}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CurrencyDollarIcon className="h-5 w-5 mr-2" />
              Order Items
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tax Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {salesOrder.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.details}
                          </div>
                          {item.description && (
                            <div className="text-sm text-gray-500">
                              {item.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{item.rate.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.taxRate}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₹{item.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes and Terms */}
          {(salesOrder.notes || salesOrder.terms) && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Additional Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {salesOrder.customerNotes && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Notes</h3>
                    <p className="text-gray-600">{salesOrder.customerNotes}</p>
                  </div>
                )}
                {salesOrder.termsConditions && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">
                      Terms & Conditions
                    </h3>
                    <p className="text-gray-600">
                      {salesOrder.termsConditions}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Order Summary
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">
                  ₹{salesOrder.subTotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax:</span>
                <span className="font-medium">
                  ₹{salesOrder.taxAmount.toFixed(2)}
                </span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-gray-900">
                    Total:
                  </span>
                  <span className="text-lg font-semibold text-gray-900">
                    ₹{salesOrder.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              Order Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Order Date
                </label>
                <p className="text-sm text-gray-900">
                  {new Date(salesOrder.orderDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Delivery Date
                </label>
                <p className="text-sm text-gray-900">
                  {new Date(salesOrder.deliveryDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                    salesOrder.status
                  )}`}
                >
                  {getStatusIcon(salesOrder.status)}
                  <span className="ml-1">{salesOrder.status}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Actions
            </h2>
            <div className="space-y-3">
              <Link
                href={`/dashboard/sales/sales-orders/${salesOrder._id}/print`}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center justify-center space-x-2"
              >
                <PrinterIcon className="h-4 w-4" />
                <span>Print</span>
              </Link>
              <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2">
                <EnvelopeIcon className="h-4 w-4" />
                <span>Send to Customer</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Wrapped with access guard
const SalesOrderDetailPageWithGuard = () => (
  <ModuleAccessGuard moduleName="Sales">
    <SalesOrderDetailPage />
  </ModuleAccessGuard>
);

export default SalesOrderDetailPageWithGuard;
