"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  PauseIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  ChevronDownIcon,
  DocumentArrowDownIcon,
  PrinterIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import Swal from "sweetalert2";

interface RecurringInvoice {
  _id: string;
  profileName: string;
  frequency: string;
  startDate: string;
  endDate: string;
  neverExpires: boolean;
  nextGenerationDate: string;
  status: string;
  total: number;
  totalGenerated: number;
  customerName: string;
  customerId: {
    firstName: string;
    lastName: string;
    email: string;
  };
  items: Array<{
    details: string;
    quantity: number;
    rate: number;
    amount: number;
    taxRate: number;
    taxAmount: number;
  }>;
  generatedInvoices: Array<{
    _id: string;
    invoiceNumber: string;
    invoiceDate: string;
    total: number;
    status: string;
  }>;
  created_at: string;
  // Additional fields for invoice-like display
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  buyerGstin?: string;
  buyerAddress?: string;
  sellerName?: string;
  sellerEmail?: string;
  sellerPhone?: string;
  sellerGstin?: string;
  sellerAddress?: string;
  placeOfSupplyState?: string;
  subTotal: number;
  discount: number;
  discountType: "percentage" | "amount";
  discountAmount: number;
  taxAmount: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  additionalTaxType?: "TDS" | "TCS" | null;
  additionalTaxId?: string;
  additionalTaxRate: number;
  additionalTaxAmount: number;
  adjustment: number;
  terms?: string;
  salesperson?: string;
  customerNotes?: string;
  termsConditions?: string;
  internalNotes?: string;
}

const RecurringInvoiceViewPage = () => {
  const params = useParams();
  const router = useRouter();
  const [recurringInvoice, setRecurringInvoice] =
    useState<RecurringInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchRecurringInvoice(params.id as string);
    }
  }, [params.id]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".status-dropdown")) {
        setShowStatusDropdown(false);
      }
    };

    if (showStatusDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showStatusDropdown]);

  const fetchRecurringInvoice = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/recurring-invoices/${id}`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setRecurringInvoice(result.data);
      } else {
        setError("Failed to fetch recurring invoice");
      }
    } catch (error) {
      console.error("Error fetching recurring invoice:", error);
      setError("Failed to fetch recurring invoice");
    } finally {
      setLoading(false);
    }
  };

  const showToastMessage = (message: string, type: "success" | "error") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return <CheckIcon className="h-4 w-4" />;
      case "paused":
        return <ClockIcon className="h-4 w-4" />;
      case "completed":
        return <DocumentDuplicateIcon className="h-4 w-4" />;
      case "draft":
        return <DocumentDuplicateIcon className="h-4 w-4" />;
      case "sent":
        return <EnvelopeIcon className="h-4 w-4" />;
      default:
        return <DocumentDuplicateIcon className="h-4 w-4" />;
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  // Helper function to extract state code from address
  const getStateFromAddress = (address: string | undefined) => {
    if (!address) return "09"; // Default to UP

    const addr = address.toLowerCase();

    if (addr.includes("uttar pradesh") || addr.includes("up")) return "09";
    if (addr.includes("west bengal") || addr.includes("wb")) return "19";
    if (addr.includes("maharashtra") || addr.includes("mh")) return "27";
    if (addr.includes("tamil nadu") || addr.includes("tn")) return "33";
    if (addr.includes("gujarat") || addr.includes("gj")) return "24";
    if (addr.includes("rajasthan") || addr.includes("rj")) return "08";
    if (addr.includes("punjab") || addr.includes("pb")) return "03";
    if (addr.includes("haryana") || addr.includes("hr")) return "06";
    if (addr.includes("delhi") || addr.includes("dl")) return "07";
    if (addr.includes("karnataka") || addr.includes("ka")) return "29";
    if (addr.includes("andhra pradesh") || addr.includes("ap")) return "37";
    if (addr.includes("telangana") || addr.includes("ts")) return "36";
    if (addr.includes("kerala") || addr.includes("kl")) return "32";
    if (addr.includes("odisha") || addr.includes("or")) return "21";
    if (addr.includes("bihar") || addr.includes("br")) return "10";
    if (addr.includes("jharkhand") || addr.includes("jh")) return "20";
    if (addr.includes("assam") || addr.includes("as")) return "18";

    console.log("State not detected for address:", address);
    return "09"; // Default fallback
  };

  // Check if transaction is inter-state (based on place of supply)
  const isInterState = () => {
    if (!recurringInvoice) return false;

    const sellerStateCode = "29"; // Karnataka (seller)

    // First check if we have proper place of supply data in the invoice
    let placeOfSupplyState = "";

    // Check if invoice has explicit place of supply state
    if (recurringInvoice.placeOfSupplyState) {
      placeOfSupplyState = getStateFromAddress(
        recurringInvoice.placeOfSupplyState
      );
    } else {
      // Fallback to shipping/delivery address
      const deliveryAddress =
        recurringInvoice.buyerAddress || recurringInvoice.customerAddress;
      placeOfSupplyState = getStateFromAddress(deliveryAddress);
    }

    return sellerStateCode !== placeOfSupplyState;
  };

  const numberToWords = (num: number) => {
    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
    ];
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];
    const teens = [
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];

    const convertLessThanOneThousand = (num: number): string => {
      if (num === 0) return "";

      if (num < 10) return ones[num];
      if (num < 20) return teens[num - 10];
      if (num < 100)
        return (
          tens[Math.floor(num / 10)] +
          (num % 10 !== 0 ? " " + ones[num % 10] : "")
        );
      return (
        ones[Math.floor(num / 100)] +
        " Hundred" +
        (num % 100 !== 0 ? " and " + convertLessThanOneThousand(num % 100) : "")
      );
    };

    const convert = (num: number): string => {
      if (num === 0) return "Zero";
      if (num < 1000) return convertLessThanOneThousand(num);
      if (num < 100000)
        return (
          convertLessThanOneThousand(Math.floor(num / 1000)) +
          " Thousand" +
          (num % 1000 !== 0 ? " " + convertLessThanOneThousand(num % 1000) : "")
        );
      if (num < 10000000)
        return (
          convertLessThanOneThousand(Math.floor(num / 100000)) +
          " Lakh" +
          (num % 100000 !== 0
            ? " " +
              convert(Math.floor(num / 1000) % 100) +
              " Thousand" +
              (num % 1000 !== 0
                ? " " + convertLessThanOneThousand(num % 1000)
                : "")
            : "")
        );
      return (
        convertLessThanOneThousand(Math.floor(num / 10000000)) +
        " Crore" +
        (num % 10000000 !== 0 ? " " + convert(num % 10000000) : "")
      );
    };

    const rupees = Math.floor(num);
    const paise = Math.round((num - rupees) * 100);

    let result = convert(rupees) + " Rupees";
    if (paise > 0) {
      result += " and " + convert(paise) + " Paise";
    }
    result += " only";

    return result;
  };

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      setUpdatingStatus(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/recurring-invoices/${params.id}/status`,
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
        fetchRecurringInvoice(params.id as string); // Refresh the data
        setShowStatusDropdown(false);
      } else {
        showToastMessage("Failed to update status", "error");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      showToastMessage("Failed to update status", "error");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
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
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/recurring-invoices/${params.id}`,
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
          router.push("/dashboard/sales/recurring-invoices");
        } else {
          showToastMessage("Failed to delete recurring invoice", "error");
        }
      } catch (error) {
        console.error("Error deleting recurring invoice:", error);
        showToastMessage("Failed to delete recurring invoice", "error");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-auto bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading recurring invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !recurringInvoice) {
    return (
      <div className="flex-1 overflow-auto bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto" />
          <p className="mt-4 text-gray-600">
            {error || "Recurring invoice not found"}
          </p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push("/dashboard/sales/recurring-invoices")}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {recurringInvoice.profileName}
              </h1>
              <p className="text-sm text-gray-500">
                {recurringInvoice.customerName} •{" "}
                {getFrequencyLabel(recurringInvoice.frequency)} •{" "}
                {formatDate(recurringInvoice.startDate)}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative status-dropdown">
              <button
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                disabled={updatingStatus}
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium cursor-pointer hover:opacity-80 ${
                  updatingStatus ? "opacity-50 cursor-not-allowed" : ""
                } ${getStatusColor(recurringInvoice.status)}`}
              >
                {getStatusIcon(recurringInvoice.status)}
                <span className="ml-1 capitalize">
                  {recurringInvoice.status}
                </span>
                <ChevronDownIcon className="h-3 w-3 ml-1" />
              </button>

              {showStatusDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                  <div className="py-1">
                    <button
                      onClick={() => handleStatusUpdate("active")}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Active
                    </button>
                    <button
                      onClick={() => handleStatusUpdate("paused")}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Paused
                    </button>
                    <button
                      onClick={() => handleStatusUpdate("completed")}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Completed
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                onClick={() => window.print()}
              >
                <PrinterIcon className="h-4 w-4 mr-2" />
                Print
              </button>
              <button
                onClick={() =>
                  router.push(
                    `/dashboard/sales/recurring-invoices/${params.id}/edit`
                  )
                }
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center px-3 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-md hover:bg-red-200"
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Recurring Invoice Profile Card */}
          <div className="bg-white">
            {/* Company Letterhead */}
            <div className="text-center py-6 mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                {recurringInvoice.sellerName || "ROBOBOOKS SOLUTIONS"}
              </h1>
              <div className="text-sm text-gray-800 space-y-1">
                <p>
                  {recurringInvoice.sellerAddress ||
                    "123 Business Street, Tech Park, Bangalore - 560001"}
                </p>
                <p>
                  {recurringInvoice.sellerPhone || "+91 98765 43210"} |{" "}
                  {recurringInvoice.sellerEmail || "info@robobooks.com"}
                </p>
                <p>
                  GSTIN: {recurringInvoice.sellerGstin || "29ABCDE1234F1Z5"} |
                  Origin of Supply: 29-Karnataka
                </p>

                {/* Profile Details as bullet points */}
                <div className="flex justify-center items-center mt-3 text-xs text-gray-700">
                  <span>• Profile: {recurringInvoice.profileName}</span>
                  <span className="mx-2">
                    • Frequency: {getFrequencyLabel(recurringInvoice.frequency)}
                  </span>
                  <span className="mx-2">
                    • Start Date: {formatDate(recurringInvoice.startDate)}
                  </span>
                  {!recurringInvoice.neverExpires && (
                    <span className="mx-2">
                      • End Date: {formatDate(recurringInvoice.endDate)}
                    </span>
                  )}
                </div>
              </div>

              {/* Professional Horizontal Line */}
              <div className="mt-6 border-t-2 border-gray-900 mx-16"></div>
            </div>

            {/* Billing and Shipping Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 mx-12">
              {/* Billing Address */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3 underline">
                  Billing Address:
                </h3>
                <div className="space-y-1">
                  <p className="font-semibold text-gray-900">
                    {recurringInvoice.buyerName ||
                      recurringInvoice.customerName}
                  </p>
                  {(recurringInvoice.buyerAddress ||
                    recurringInvoice.customerAddress) && (
                    <p className="text-sm text-gray-800">
                      {recurringInvoice.buyerAddress ||
                        recurringInvoice.customerAddress}
                    </p>
                  )}
                  {(recurringInvoice.buyerPhone ||
                    recurringInvoice.customerPhone) && (
                    <p className="text-sm text-gray-800">
                      Phone:{" "}
                      {recurringInvoice.buyerPhone ||
                        recurringInvoice.customerPhone}
                    </p>
                  )}
                  {(recurringInvoice.buyerEmail ||
                    recurringInvoice.customerEmail) && (
                    <p className="text-sm text-gray-800">
                      Email:{" "}
                      {recurringInvoice.buyerEmail ||
                        recurringInvoice.customerEmail}
                    </p>
                  )}
                  {recurringInvoice.buyerGstin && (
                    <p className="text-sm text-gray-800">
                      GSTIN: {recurringInvoice.buyerGstin}
                    </p>
                  )}
                  <p className="text-sm text-gray-800 font-medium">
                    State:{" "}
                    {recurringInvoice.buyerAddress?.includes("Uttar Pradesh")
                      ? "09-Uttar Pradesh"
                      : recurringInvoice.buyerAddress?.includes("West Bengal")
                      ? "19-West Bengal"
                      : recurringInvoice.buyerAddress?.includes("Maharashtra")
                      ? "27-Maharashtra"
                      : recurringInvoice.buyerAddress?.includes("Tamil Nadu")
                      ? "33-Tamil Nadu"
                      : recurringInvoice.buyerAddress?.includes("Gujarat")
                      ? "24-Gujarat"
                      : recurringInvoice.buyerAddress?.includes("Rajasthan")
                      ? "08-Rajasthan"
                      : recurringInvoice.buyerAddress?.includes("Punjab")
                      ? "03-Punjab"
                      : recurringInvoice.buyerAddress?.includes("Haryana")
                      ? "06-Haryana"
                      : recurringInvoice.buyerAddress?.includes("Delhi")
                      ? "07-Delhi"
                      : "09-Uttar Pradesh"}
                  </p>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3 underline">
                  Shipping Address:
                </h3>
                <div className="space-y-1">
                  <p className="font-semibold text-gray-900">
                    {recurringInvoice.buyerName ||
                      recurringInvoice.customerName}
                  </p>
                  {(recurringInvoice.buyerAddress ||
                    recurringInvoice.customerAddress) && (
                    <p className="text-sm text-gray-800">
                      {recurringInvoice.buyerAddress ||
                        recurringInvoice.customerAddress}
                    </p>
                  )}
                  <p className="text-sm text-gray-800">
                    <span className="font-medium">Place of Supply:</span>{" "}
                    {recurringInvoice.placeOfSupplyState
                      ? `${getStateFromAddress(
                          recurringInvoice.placeOfSupplyState
                        )}-${recurringInvoice.placeOfSupplyState}`
                      : `${getStateFromAddress(
                          recurringInvoice.buyerAddress ||
                            recurringInvoice.customerAddress
                        )}-Delivery Location`}
                  </p>
                  {recurringInvoice.terms && (
                    <p className="text-sm text-gray-800">
                      <span className="font-medium">Terms:</span>{" "}
                      {recurringInvoice.terms}
                    </p>
                  )}
                  {recurringInvoice.salesperson && (
                    <p className="text-sm text-gray-800">
                      <span className="font-medium">Salesperson:</span>{" "}
                      {recurringInvoice.salesperson}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mx-8 mb-8">
              <table className="w-full border-collapse border border-gray-400">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-400 px-3 py-2 text-left text-sm font-medium text-gray-900">
                      SR NO.
                    </th>
                    <th className="border border-gray-400 px-3 py-2 text-left text-sm font-medium text-gray-900">
                      ITEM NAME
                    </th>
                    <th className="border border-gray-400 px-3 py-2 text-left text-sm font-medium text-gray-900">
                      HSN/SAC
                    </th>
                    <th className="border border-gray-400 px-3 py-2 text-right text-sm font-medium text-gray-900">
                      QTY
                    </th>
                    <th className="border border-gray-400 px-3 py-2 text-right text-sm font-medium text-gray-900">
                      RATE
                    </th>
                    <th className="border border-gray-400 px-3 py-2 text-right text-sm font-medium text-gray-900">
                      TAX %
                    </th>
                    <th className="border border-gray-400 px-3 py-2 text-right text-sm font-medium text-gray-900">
                      AMOUNT
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recurringInvoice.items.map((item, index) => (
                    <tr key={index}>
                      <td className="border border-gray-400 px-3 py-2 text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="border border-gray-400 px-3 py-2 text-sm text-gray-900">
                        {item.details}
                      </td>
                      <td className="border border-gray-400 px-3 py-2 text-sm text-gray-900">
                        8704
                      </td>
                      <td className="border border-gray-400 px-3 py-2 text-sm text-right text-gray-900">
                        {item.quantity}
                      </td>
                      <td className="border border-gray-400 px-3 py-2 text-sm text-right text-gray-900">
                        {formatCurrency(item.rate)}
                      </td>
                      <td className="border border-gray-400 px-3 py-2 text-sm text-right text-gray-900">
                        {item.taxRate || 18}%
                      </td>
                      <td className="border border-gray-400 px-3 py-2 text-sm text-right font-medium text-gray-900">
                        {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  ))}
                  {/* Total Row */}
                  <tr className="bg-gray-100">
                    <td
                      colSpan={3}
                      className="border border-gray-400 px-3 py-2 text-sm font-bold text-gray-900"
                    >
                      TOTAL
                    </td>
                    <td className="border border-gray-400 px-3 py-2 text-sm text-right font-bold text-gray-900">
                      {recurringInvoice.items.reduce(
                        (sum, item) => sum + item.quantity,
                        0
                      )}
                    </td>
                    <td className="border border-gray-400 px-3 py-2 text-sm text-right font-bold text-gray-900"></td>
                    <td className="border border-gray-400 px-3 py-2 text-sm text-right font-bold text-gray-900">
                      {formatCurrency(recurringInvoice.taxAmount || 0)}
                    </td>
                    <td className="border border-gray-400 px-3 py-2 text-sm text-right font-bold text-gray-900">
                      {formatCurrency(
                        recurringInvoice.subTotal || recurringInvoice.total
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Summary and Terms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mx-8">
              {/* Left Side - Amount in Words and Terms */}
              <div>
                <div className="mb-6">
                  <h4 className="font-bold text-gray-900 mb-2 underline">
                    INVOICE AMOUNT IN WORDS:
                  </h4>
                  <p className="text-sm text-gray-800 font-medium">
                    {numberToWords(recurringInvoice.total)}
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-2 underline">
                    TERMS AND CONDITIONS:
                  </h4>
                  <p className="text-sm text-gray-800">
                    {recurringInvoice.termsConditions ||
                      "Thank you for doing business with us."}
                  </p>
                </div>
              </div>

              {/* Right Side - Financial Summary */}
              <div className="border border-gray-400 p-4">
                <h4 className="font-bold text-gray-900 mb-3 text-center underline">
                  FINANCIAL SUMMARY
                </h4>
                <table className="w-full">
                  <tbody>
                    <tr>
                      <td className="py-1 text-sm text-gray-900">Sub Total:</td>
                      <td className="py-1 text-sm text-right font-medium text-gray-900">
                        {formatCurrency(
                          recurringInvoice.subTotal || recurringInvoice.total
                        )}
                      </td>
                    </tr>

                    {/* Discount */}
                    {recurringInvoice.discountAmount > 0 && (
                      <tr>
                        <td className="py-1 text-sm text-gray-900">
                          Discount (
                          {recurringInvoice.discountType === "percentage"
                            ? `${recurringInvoice.discount}%`
                            : "Fixed"}
                          ):
                        </td>
                        <td className="py-1 text-sm text-right font-medium text-gray-900">
                          - {formatCurrency(recurringInvoice.discountAmount)}
                        </td>
                      </tr>
                    )}

                    {/* GST Breakdown */}
                    {recurringInvoice.taxAmount > 0 && (
                      <>
                        {/* Display GST based on actual transaction type */}
                        {!isInterState() ? (
                          /* Intra-State: CGST + SGST (same state) */
                          <>
                            <tr>
                              <td className="py-1 text-sm text-gray-900">
                                CGST @ 9%:
                              </td>
                              <td className="py-1 text-sm text-right font-medium text-gray-900">
                                {formatCurrency(
                                  recurringInvoice.cgstTotal ||
                                    recurringInvoice.taxAmount / 2
                                )}
                              </td>
                            </tr>
                            <tr>
                              <td className="py-1 text-sm text-gray-900">
                                SGST @ 9%:
                              </td>
                              <td className="py-1 text-sm text-right font-medium text-gray-900">
                                {formatCurrency(
                                  recurringInvoice.sgstTotal ||
                                    recurringInvoice.taxAmount / 2
                                )}
                              </td>
                            </tr>
                          </>
                        ) : (
                          /* Inter-State: IGST (different states) */
                          <tr>
                            <td className="py-1 text-sm text-gray-900">
                              IGST @ 18%:
                            </td>
                            <td className="py-1 text-sm text-right font-medium text-gray-900">
                              {formatCurrency(
                                recurringInvoice.igstTotal ||
                                  recurringInvoice.taxAmount
                              )}
                            </td>
                          </tr>
                        )}
                      </>
                    )}

                    {/* TDS/TCS */}
                    {recurringInvoice.additionalTaxAmount !== 0 &&
                      recurringInvoice.additionalTaxType && (
                        <tr>
                          <td className="py-1 text-sm text-gray-900">
                            {recurringInvoice.additionalTaxType} @{" "}
                            {recurringInvoice.additionalTaxRate}%:
                          </td>
                          <td className="py-1 text-sm text-right font-medium text-gray-900">
                            {recurringInvoice.additionalTaxType === "TDS"
                              ? "- "
                              : "+ "}
                            {formatCurrency(
                              Math.abs(recurringInvoice.additionalTaxAmount)
                            )}
                          </td>
                        </tr>
                      )}

                    {/* Adjustment */}
                    {recurringInvoice.adjustment !== 0 && (
                      <tr>
                        <td className="py-1 text-sm text-gray-900">
                          Adjustment:
                        </td>
                        <td className="py-1 text-sm text-right font-medium text-gray-900">
                          {recurringInvoice.adjustment > 0 ? "+ " : "- "}
                          {formatCurrency(
                            Math.abs(recurringInvoice.adjustment)
                          )}
                        </td>
                      </tr>
                    )}

                    <tr className="border-t border-gray-400">
                      <td className="py-2 text-base font-bold text-gray-900">
                        TOTAL:
                      </td>
                      <td className="py-2 text-base font-bold text-right text-gray-900">
                        {formatCurrency(recurringInvoice.total)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Signature Area */}
            <div className="p-8 mt-12">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm text-gray-900 font-medium">
                    For: {recurringInvoice.sellerName || "ROBOBOOKS SOLUTIONS"}
                  </p>
                  <div className="mt-16 border-t border-gray-900 w-40"></div>
                  <p className="text-sm text-gray-900 mt-2">
                    Authorized Signatory
                  </p>
                </div>
                <div className="text-sm text-gray-900">
                  <p>www.robobooks.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Generated Invoices Section */}
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DocumentDuplicateIcon className="h-5 w-5 mr-2 text-blue-600" />
              Generated Invoices
            </h2>
            {recurringInvoice.generatedInvoices.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No invoices generated yet
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invoice Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recurringInvoice.generatedInvoices.map((invoice) => (
                      <tr key={invoice._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {invoice.invoiceNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(invoice.invoiceDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(invoice.total)}
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
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() =>
                              router.push(
                                `/dashboard/sales/invoices/${invoice._id}`
                              )
                            }
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <PrinterIcon className="h-4 w-4 mr-2" />
                Print
              </button>

              <button
                onClick={() =>
                  router.push(
                    `/dashboard/sales/recurring-invoices/${params.id}/edit`
                  )
                }
                className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit
              </button>

              <button
                onClick={handleDelete}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50">
          <div
            className={`px-6 py-4 rounded-lg shadow-lg text-white ${
              toastType === "success" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            <div className="flex items-center">
              {toastType === "success" ? (
                <CheckIcon className="h-5 w-5 mr-2" />
              ) : (
                <XMarkIcon className="h-5 w-5 mr-2" />
              )}
              <span className="font-medium">{toastMessage}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecurringInvoiceViewPage;
