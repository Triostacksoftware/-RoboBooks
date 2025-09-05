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
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { formatCurrency } from "@/utils/currency";

interface RecurringInvoice {
  _id: string;
  profileName: string;
  customerName: string;
  customerId: {
    firstName: string;
    lastName: string;
    email: string;
  };
  frequency: string;
  startDate: string;
  nextGenerationDate: string;
  status: string;
  total: number;
  totalGenerated: number;
  created_at: string;
}

const AllRecurringInvoicesPage = () => {
  const router = useRouter();
  const [recurringInvoices, setRecurringInvoices] = useState<
    RecurringInvoice[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  useEffect(() => {
    fetchRecurringInvoices();
  }, []);

  const fetchRecurringInvoices = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/recurring-invoices`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log("Recurring invoices response:", result);
        const invoicesData = result.data || result;
        setRecurringInvoices(Array.isArray(invoicesData) ? invoicesData : []);
      } else {
        console.error("Error fetching recurring invoices:", response.status);
        setError("Failed to fetch recurring invoices");
      }
    } catch (error) {
      console.error("Error fetching recurring invoices:", error);
      setError("Failed to fetch recurring invoices");
      setRecurringInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecurringInvoices = recurringInvoices.filter((invoice) => {
    const matchesSearch =
      invoice.profileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || invoice.status === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case "daily":
        return "Daily";
      case "weekly":
        return "Weekly";
      case "monthly":
        return "Monthly";
      case "yearly":
        return "Yearly";
      default:
        return frequency;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleEditRecurringInvoice = (invoiceId: string) => {
    router.push(`/dashboard/sales/recurring-invoices/${invoiceId}/edit`);
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case "active":
        return "paused";
      case "paused":
        return "active";
      default:
        return "active";
    }
  };

  const showToastMessage = (message: string, type: "success" | "error") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleStatusUpdate = async (invoiceId: string, newStatus: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/recurring-invoices/${invoiceId}/status`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        showToastMessage(`Status updated to ${newStatus}`, "success");
        fetchRecurringInvoices(); // Refresh the list
      } else {
        showToastMessage("Failed to update status", "error");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      showToastMessage("Failed to update status", "error");
    }
  };

  const handleDeleteRecurringInvoice = async (invoiceId: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the recurring invoice profile and all its data.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        setDeleting(invoiceId);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/recurring-invoices/${invoiceId}`,
          {
            method: "DELETE",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          showToastMessage("Recurring invoice deleted successfully", "success");
          fetchRecurringInvoices(); // Refresh the list
        } else {
          showToastMessage("Failed to delete recurring invoice", "error");
        }
      } catch (error) {
        console.error("Error deleting recurring invoice:", error);
        showToastMessage("Failed to delete recurring invoice", "error");
      } finally {
        setDeleting(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                All Recurring Invoices
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your recurring invoice profiles
              </p>
            </div>
            <Link
              href="/dashboard/sales/recurring-invoices/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              New Recurring Invoice
            </Link>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by profile name or customer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="All">All Status</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Recurring Invoices List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {error ? (
            <div className="p-6 text-center">
              <ExclamationTriangleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-600">{error}</p>
            </div>
          ) : filteredRecurringInvoices.length === 0 ? (
            <div className="p-12 text-center">
              <ArrowPathIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No recurring invoices found
              </h3>
              <p className="text-gray-500 mb-6">
                Get started by creating your first recurring invoice profile.
              </p>
              <Link
                href="/dashboard/sales/recurring-invoices/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Recurring Invoice
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Profile Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Frequency
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Next Generation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Generated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRecurringInvoices.map((invoice) => (
                    <tr key={invoice._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <ArrowPathIcon className="h-5 w-5 text-blue-500 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {invoice.profileName}
                            </div>
                            <div className="text-sm text-gray-500">
                              Created {formatDate(invoice.created_at)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {invoice.customerName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {invoice.customerId?.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {getFrequencyLabel(invoice.frequency)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {formatDate(invoice.nextGenerationDate)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            invoice.status
                          )}`}
                        >
                          {invoice.status.charAt(0).toUpperCase() +
                            invoice.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {invoice.totalGenerated} invoices
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(invoice.total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            href={`/dashboard/sales/recurring-invoices/${invoice._id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() =>
                              handleEditRecurringInvoice(invoice._id)
                            }
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleStatusUpdate(
                                invoice._id,
                                getNextStatus(invoice.status)
                              )
                            }
                            className="text-green-600 hover:text-green-900"
                          >
                            {invoice.status === "active" ? (
                              <ClockIcon className="h-4 w-4" />
                            ) : (
                              <PlayIcon className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteRecurringInvoice(invoice._id)
                            }
                            disabled={deleting === invoice._id}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            {deleting === invoice._id ? (
                              <ArrowPathIcon className="h-4 w-4 animate-spin" />
                            ) : (
                              <TrashIcon className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-50">
          <div
            className={`px-4 py-2 rounded-md shadow-lg ${
              toastType === "success"
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {toastMessage}
          </div>
        </div>
      )}
    </div>
  );
};

export default AllRecurringInvoicesPage;
