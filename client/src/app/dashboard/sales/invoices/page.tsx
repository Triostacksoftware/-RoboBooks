"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { useToast } from "../../../../contexts/ToastContext";
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
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

interface Invoice {
  _id: string;
  invoiceNumber: string;
  customerName: string;
  customerId: {
    firstName: string;
    lastName: string;
    email: string;
  };
  invoiceDate: string;
  dueDate: string;
  total: number;
  status: string;
  created_at: string;
}

const AllInvoicesPage = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/invoices`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log("Invoices response:", result);
        const invoicesData = result.data || result;
        setInvoices(Array.isArray(invoicesData) ? invoicesData : []);
      } else {
        console.error("Error fetching invoices:", response.status);
        setError("Failed to fetch invoices");
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
      setError("Failed to fetch invoices");
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Draft":
        return "bg-gray-100 text-gray-800";
      case "Sent":
        return "bg-blue-100 text-blue-800";
      case "Paid":
        return "bg-green-100 text-green-800";
      case "Unpaid":
        return "bg-yellow-100 text-yellow-800";
      case "Overdue":
        return "bg-red-100 text-red-800";
      case "Partially Paid":
        return "bg-orange-100 text-orange-800";
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

  const handleEditInvoice = (invoiceId: string) => {
    router.push(`/dashboard/sales/invoices/${invoiceId}/edit`);
  };

  const getNextStatus = (currentStatus: string) => {
    // Define valid status transitions based on backend rules
    const validTransitions: { [key: string]: string[] } = {
      Draft: ["Sent", "Cancelled"],
      Sent: ["Paid", "Unpaid", "Overdue", "Partially Paid"],
      Unpaid: ["Paid", "Overdue", "Partially Paid", "Sent"],
      Overdue: ["Paid", "Unpaid", "Partially Paid"],
      Paid: ["Unpaid", "Partially Paid"],
      "Partially Paid": ["Paid", "Unpaid"],
      Cancelled: [],
    };

    const transitions = validTransitions[currentStatus] || [];

    // Return the first available transition, or cycle through them
    if (transitions.length > 0) {
      // For better UX, cycle through common transitions
      const commonCycle = [
        "Sent",
        "Paid",
        "Unpaid",
        "Overdue",
        "Partially Paid",
      ];
      const currentIndex = commonCycle.indexOf(currentStatus);
      const nextIndex = (currentIndex + 1) % commonCycle.length;
      const nextStatus = commonCycle[nextIndex];

      // Check if the next status is valid for current status
      if (transitions.includes(nextStatus)) {
        return nextStatus;
      }

      // If not, return the first valid transition
      return transitions[0];
    }

    return "Sent"; // Default fallback
  };

  const handleStatusUpdate = async (invoiceId: string, newStatus: string) => {
    try {
      setUpdatingStatus(invoiceId);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/invoices/${invoiceId}/status`,
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
        showToast(`Invoice status updated to ${newStatus}`, "success");
        // Refresh the invoices list
        fetchInvoices();
      } else {
        showToast(result.error || "Failed to update status", "error");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      showToast("Failed to update status. Please try again.", "error");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
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
        setDeleting(invoiceId);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/invoices/${invoiceId}`,
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
            "Invoice has been deleted successfully.",
            "success"
          );
          // Refresh the invoices list
          fetchInvoices();
        } else {
          const errorData = await response.json();
          await Swal.fire(
            "Error!",
            `Failed to delete invoice: ${errorData.error || "Unknown error"}`,
            "error"
          );
        }
      } catch (error) {
        console.error("Error deleting invoice:", error);
        await Swal.fire(
          "Error!",
          "Failed to delete invoice. Please try again.",
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
          <div className="flex items-center space-x-4">
            {/* Back Button */}
            <button
              onClick={() => router.push('/dashboard/sales')}
              className="flex items-center gap-2 px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200 text-gray-700 hover:text-gray-900"
              aria-label="Go back to Sales"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span className="text-sm font-medium">Back</span>
            </button>
            
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-semibold text-gray-900">
                All Invoices
              </h1>
              <ChevronDownIcon className="h-4 w-4 text-gray-400" />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Link href="/dashboard/sales/invoices/new">
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
                onClick={fetchInvoices}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          ) : invoices.length === 0 ? (
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
                      Learn how to create your first Invoice.
                    </p>
                  </div>
                </div>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                It&rsquo;s time to get paid!
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                We don&lsquo;t want to boast too much, but sending amazing
                invoices and getting paid is easier than ever. Go ahead! Try it
                yourself.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link href="/dashboard/sales/invoices/new">
                  <button className="px-6 py-3 text-white bg-blue-600 rounded-md hover:bg-blue-700 font-medium">
                    NEW INVOICE
                  </button>
                </Link>
                <button className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 font-medium">
                  NEW RECURRING INVOICE
                </button>
              </div>

              <button className="text-blue-600 hover:text-blue-800 font-medium">
                Import Invoices
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
                        placeholder="Search invoices..."
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
                        <option value="Unpaid">Unpaid</option>
                        <option value="Paid">Paid</option>
                        <option value="Overdue">Overdue</option>
                        <option value="Partially Paid">Partially Paid</option>
                      </select>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {filteredInvoices.length} of {invoices.length} invoices
                  </div>
                </div>
              </div>

              {/* Invoices Table */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Invoice
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Due Date
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
                      {filteredInvoices.map((invoice) => (
                        <tr key={invoice._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div
                                className="text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
                                onClick={() =>
                                  router.push(
                                    `/dashboard/sales/invoices/${invoice._id}`
                                  )
                                }
                              >
                                {invoice.invoiceNumber}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {invoice.customerName ||
                                  invoice.customerId?.firstName +
                                    " " +
                                    invoice.customerId?.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {invoice.customerId?.email}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(invoice.invoiceDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(invoice.dueDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCurrency(invoice.total)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() =>
                                handleStatusUpdate(
                                  invoice._id,
                                  getNextStatus(invoice.status)
                                )
                              }
                              disabled={updatingStatus === invoice._id}
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-200 ${
                                updatingStatus === invoice._id
                                  ? "opacity-50 cursor-not-allowed"
                                  : "cursor-pointer hover:opacity-80 hover:scale-105"
                              } ${getStatusColor(invoice.status)}`}
                              title={`Click to toggle status. Next: ${getNextStatus(
                                invoice.status
                              )}`}
                            >
                              {updatingStatus === invoice._id ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                                  Updating...
                                </>
                              ) : (
                                <>
                                  {invoice.status}
                                  <ArrowPathIcon className="h-3 w-3 opacity-60" />
                                </>
                              )}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                className="text-blue-600 hover:text-blue-900"
                                title="View"
                                onClick={() =>
                                  router.push(
                                    `/dashboard/sales/invoices/${invoice._id}`
                                  )
                                }
                              >
                                <EyeIcon className="h-4 w-4" />
                              </button>
                              <button
                                className="text-green-600 hover:text-green-900"
                                title="Edit"
                                onClick={() => handleEditInvoice(invoice._id)}
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button
                                className={`${
                                  deleting === invoice._id
                                    ? "text-gray-400 cursor-not-allowed"
                                    : "text-red-600 hover:text-red-900"
                                }`}
                                title="Delete"
                                onClick={() => handleDeleteInvoice(invoice._id)}
                                disabled={deleting === invoice._id}
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

          {filteredInvoices.length > 0 && (
            <div className="mt-8">
              {/* Lifecycle Diagram */}
              <div className="mb-12">
                <h2 className="text-xl font-semibold text-gray-900 text-center mb-8">
                  Life cycle of an Invoice
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

                    {/* Unpaid */}
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-2">
                        <CurrencyDollarIcon className="h-6 w-6 text-yellow-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        UNPAID
                      </span>
                    </div>

                    <div className="flex items-center">
                      <div className="w-8 h-0.5 bg-gray-300 border-dashed border-gray-300"></div>
                    </div>

                    {/* Overdue */}
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-2">
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="h-4 w-4 text-red-600" />
                          <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        OVERDUE
                      </span>
                    </div>

                    <div className="flex items-center">
                      <div className="w-8 h-0.5 bg-gray-300 border-dashed border-gray-300"></div>
                    </div>

                    {/* Partially Paid */}
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-2">
                        <div className="flex items-center space-x-1">
                          <CurrencyDollarIcon className="h-4 w-4 text-orange-600" />
                          <ArrowPathIcon className="h-4 w-4 text-orange-600" />
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        PARTIALLY PAID
                      </span>
                    </div>

                    <div className="flex items-center">
                      <div className="w-8 h-0.5 bg-gray-300 border-dashed border-gray-300"></div>
                    </div>

                    {/* Paid */}
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                        <div className="flex items-center space-x-1">
                          <CurrencyDollarIcon className="h-4 w-4 text-green-600" />
                          <CheckIcon className="h-4 w-4 text-green-600" />
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        PAID
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Brand Your Invoices */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                      <UserIcon className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Brand Your Invoices
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Choose your favourite theme from our gallery of templates
                    and personalize your invoice to reflect your brand.
                  </p>
                  <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                    Learn More
                  </button>
                </div>

                {/* Collect Online Payments */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                      <CreditCardIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Collect Online Payments
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Configure a payment gateway and collect online payments from
                    your customer with ease.
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
                    accept quotes, keep track of invoices and make payments.
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
    </div>
  );
};

export default AllInvoicesPage;
