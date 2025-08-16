"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import {
  ChevronDownIcon,
  PlusIcon,
  EllipsisVerticalIcon,
  BellIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  UserCircleIcon,
  PlayIcon,
  DocumentTextIcon,
  CheckIcon,
  EnvelopeIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  UserIcon,
  CreditCardIcon,
  Square3Stack3DIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

interface SalesOrder {
  _id: string;
  salesOrderNumber: string;
  customerName: string;
  customerId: {
    firstName: string;
    lastName: string;
    email: string;
  };
  orderDate: string;
  deliveryDate: string;
  total: number;
  status: string;
  createdAt: string;
}

const AllSalesOrdersPage = () => {
  const router = useRouter();
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  useEffect(() => {
    fetchSalesOrders();
  }, []);

  const fetchSalesOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/sales-orders`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log("Sales Orders response:", result);
        const salesOrdersData = result.data || result;
        setSalesOrders(Array.isArray(salesOrdersData) ? salesOrdersData : []);
      } else {
        console.error("Error fetching sales orders:", response.status);
        setError("Failed to fetch sales orders");
      }
    } catch (error) {
      console.error("Error fetching sales orders:", error);
      setError("Failed to fetch sales orders");
      setSalesOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredSalesOrders = salesOrders.filter((salesOrder) => {
    const matchesSearch =
      salesOrder.salesOrderNumber
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      salesOrder.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || salesOrder.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Draft":
        return "bg-gray-100 text-gray-800";
      case "Sent":
        return "bg-blue-100 text-blue-800";
      case "Confirmed":
        return "bg-green-100 text-green-800";
      case "Shipped":
        return "bg-purple-100 text-purple-800";
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const handleEditSalesOrder = (salesOrderId: string) => {
    router.push(`/dashboard/sales/sales-orders/${salesOrderId}/edit`);
  };

  const getNextStatus = (currentStatus: string) => {
    // Define the status cycle: Sent -> Confirmed -> Shipped -> Delivered
    const statusCycle: { [key: string]: string } = {
      Sent: "Confirmed",
      Confirmed: "Shipped",
      Shipped: "Delivered",
      Draft: "Sent",
      Delivered: "Delivered",
      Cancelled: "Draft",
    };

    return statusCycle[currentStatus] || "Sent";
  };

  const showToastMessage = (message: string, type: "success" | "error") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleStatusUpdate = async (
    salesOrderId: string,
    newStatus: string
  ) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/sales-orders/${salesOrderId}/status`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const result = await response.json();

      if (result.success) {
        showToastMessage(
          `Sales order status updated to ${newStatus}`,
          "success"
        );
        // Refresh the sales orders list
        fetchSalesOrders();
      } else {
        showToastMessage(result.error || "Failed to update status", "error");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      showToastMessage("Failed to update status. Please try again.", "error");
    }
  };

  const handleDeleteSalesOrder = async (salesOrderId: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        setDeleting(salesOrderId);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/sales-orders/${salesOrderId}`,
          {
            method: "DELETE",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          await Swal.fire(
            "Deleted!",
            "Sales order has been deleted successfully.",
            "success"
          );
          // Refresh the sales orders list
          fetchSalesOrders();
        } else {
          const errorData = await response.json();
          await Swal.fire(
            "Error!",
            `Failed to delete sales order: ${
              errorData.error || "Unknown error"
            }`,
            "error"
          );
        }
      } catch (error) {
        console.error("Error deleting sales order:", error);
        await Swal.fire(
          "Error!",
          "Failed to delete sales order. Please try again.",
          "error"
        );
      } finally {
        setDeleting(null);
      }
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-semibold text-gray-900">
              All Sales Orders
            </h1>
            <ChevronDownIcon className="h-4 w-4 text-gray-400" />
          </div>
          <div className="flex items-center space-x-3">
            <Link href="/dashboard/sales/sales-orders/new">
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                <PlusIcon className="h-4 w-4 mr-2 inline" />
                New
              </button>
            </Link>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <EllipsisVerticalIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-full">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-600 p-8">
              <p>{error}</p>
              <button
                onClick={fetchSalesOrders}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          ) : salesOrders.length === 0 ? (
            <div className="text-center py-12">
              {/* Empty State */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
                <div className="flex items-center justify-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <PlayIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Books
                    </h2>
                    <p className="text-sm text-gray-600">
                      Learn how to create your first Sales Order.
                    </p>
                  </div>
                </div>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                It&rsquo;s time to manage orders!
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                We don&lsquo;t want to boast too much, but creating and managing
                sales orders is easier than ever. Go ahead! Try it yourself.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link href="/dashboard/sales/sales-orders/new">
                  <button className="px-6 py-3 text-white bg-blue-600 rounded-md hover:bg-blue-700 font-medium">
                    NEW SALES ORDER
                  </button>
                </Link>
                <button className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 font-medium">
                  NEW RECURRING ORDER
                </button>
              </div>

              <button className="text-blue-600 hover:text-blue-800 font-medium">
                Import Sales Orders
              </button>
            </div>
          ) : (
            <>
              {/* Filters and Search */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative">
                      <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search sales orders..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="relative">
                      <FunnelIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <select
                        className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <option value="All">All Status</option>
                        <option value="Draft">Draft</option>
                        <option value="Sent">Sent</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {filteredSalesOrders.length} of {salesOrders.length} sales
                    orders
                  </div>
                </div>
              </div>

              {/* Sales Orders Table */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sales Order
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Delivery Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredSalesOrders.map((salesOrder) => (
                        <tr key={salesOrder._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div
                                className="text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
                                onClick={() =>
                                  router.push(
                                    `/dashboard/sales/sales-orders/${salesOrder._id}`
                                  )
                                }
                              >
                                {salesOrder.salesOrderNumber}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {salesOrder.customerName ||
                                  salesOrder.customerId?.firstName +
                                    " " +
                                    salesOrder.customerId?.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {salesOrder.customerId?.email}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(salesOrder.orderDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(salesOrder.deliveryDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCurrency(salesOrder.total)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() =>
                                handleStatusUpdate(
                                  salesOrder._id,
                                  getNextStatus(salesOrder.status)
                                )
                              }
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition-all duration-200 hover:scale-105 ${getStatusColor(
                                salesOrder.status
                              )}`}
                              title={`Click to toggle status. Next: ${getNextStatus(
                                salesOrder.status
                              )}`}
                            >
                              {salesOrder.status}
                              <ArrowPathIcon className="h-3 w-3 opacity-60" />
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                className="text-blue-600 hover:text-blue-900"
                                title="View"
                                onClick={() =>
                                  router.push(
                                    `/dashboard/sales/sales-orders/${salesOrder._id}`
                                  )
                                }
                              >
                                <EyeIcon className="h-4 w-4" />
                              </button>
                              <button
                                className="text-green-600 hover:text-green-900"
                                title="Edit"
                                onClick={() =>
                                  handleEditSalesOrder(salesOrder._id)
                                }
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button
                                className={`${
                                  deleting === salesOrder._id
                                    ? "text-gray-400 cursor-not-allowed"
                                    : "text-red-600 hover:text-red-900"
                                }`}
                                title="Delete"
                                onClick={() =>
                                  handleDeleteSalesOrder(salesOrder._id)
                                }
                                disabled={deleting === salesOrder._id}
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {filteredSalesOrders.length > 0 && (
            <div className="mt-8">
              {/* Lifecycle Diagram */}
              <div className="mb-12">
                <h2 className="text-xl font-semibold text-gray-900 text-center mb-8">
                  Life cycle of a Sales Order
                </h2>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex flex-wrap justify-center items-center space-x-4 md:space-x-8">
                    {/* Draft */}
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                        <DocumentTextIcon className="h-6 w-6 text-gray-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        DRAFT
                      </span>
                      <CheckIcon className="h-4 w-4 text-green-500 mt-1" />
                    </div>

                    <div className="flex items-center">
                      <div className="w-8 h-0.5 bg-gray-300 border-dashed border-gray-300"></div>
                    </div>

                    {/* Sent */}
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                        <EnvelopeIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        SENT
                      </span>
                      <CheckIcon className="h-4 w-4 text-green-500 mt-1" />
                    </div>

                    <div className="flex items-center">
                      <div className="w-8 h-0.5 bg-gray-300 border-dashed border-gray-300"></div>
                    </div>

                    {/* Confirmed */}
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                        <CheckIcon className="h-6 w-6 text-green-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        CONFIRMED
                      </span>
                    </div>

                    <div className="flex items-center">
                      <div className="w-8 h-0.5 bg-gray-300 border-dashed border-gray-300"></div>
                    </div>

                    {/* Shipped */}
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="h-4 w-4 text-purple-600" />
                          <ExclamationTriangleIcon className="h-4 w-4 text-purple-600" />
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        SHIPPED
                      </span>
                    </div>

                    <div className="flex items-center">
                      <div className="w-8 h-0.5 bg-gray-300 border-dashed border-gray-300"></div>
                    </div>

                    {/* Delivered */}
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                        <div className="flex items-center space-x-1">
                          <CheckIcon className="h-4 w-4 text-green-600" />
                          <CheckIcon className="h-4 w-4 text-green-600" />
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        DELIVERED
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Brand Your Sales Orders */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                      <UserIcon className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Brand Your Sales Orders
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Choose your favourite theme from our gallery of templates
                    and personalize your sales order to reflect your brand.
                  </p>
                  <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                    Learn More
                  </button>
                </div>

                {/* Track Order Status */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                      <CreditCardIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Track Order Status
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Monitor the status of your sales orders from draft to
                    delivery with real-time updates and notifications.
                  </p>
                  <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                    Learn More
                  </button>
                </div>

                {/* Customer Portal */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <Square3Stack3DIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Customer Portal
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Enable Customer Portal for your customers and allow them to
                    view sales orders, track delivery status and manage their
                    orders.
                  </p>
                  <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all duration-300 transform ${
            toastType === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          <div className="flex items-center">
            {toastType === "success" ? (
              <CheckIcon className="h-5 w-5 mr-2" />
            ) : (
              <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
            )}
            <span className="font-medium">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllSalesOrdersPage;
