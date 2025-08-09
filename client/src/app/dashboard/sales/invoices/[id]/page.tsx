"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { generateClientPDF } from "../../../../../utils/pdfGenerator";
import {
  ArrowLeftIcon,
  PrinterIcon,
  EnvelopeIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  ChevronDownIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";

interface InvoiceItem {
  id: number;
  itemId?: string;
  details: string;
  description?: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  taxRate: number;
  taxAmount: number;
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  orderNumber?: string;
  invoiceDate: string;
  dueDate: string;
  terms: string;
  salesperson?: string;
  subject?: string;
  project?: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAddress?: string;
  // Buyer Details
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  buyerGstin?: string;
  buyerAddress?: string;
  // Seller Details
  sellerName?: string;
  sellerEmail?: string;
  sellerPhone?: string;
  sellerGstin?: string;
  sellerAddress?: string;
  // Place of supply
  placeOfSupplyState?: string;
  items: InvoiceItem[];
  subTotal: number;
  discount: number;
  discountType: "percentage" | "amount";
  discountAmount: number;
  // GST Details
  taxAmount: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  // TDS/TCS Details
  additionalTaxType?: "TDS" | "TCS" | null;
  additionalTaxId?: string;
  additionalTaxRate: number;
  additionalTaxAmount: number;
  adjustment: number;
  total: number;
  paymentTerms?: string;
  paymentMethod?: string;
  amountPaid: number;
  balanceDue: number;
  customerNotes?: string;
  termsConditions?: string;
  internalNotes?: string;
  status: string;
  currency: string;
  exchangeRate: number;
  createdAt: string;
  updatedAt: string;
}

const InvoiceDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/invoices/${params.id}`,
          {
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setInvoice(result.data);
          } else {
            setError(result.error || "Failed to fetch invoice");
          }
        } else {
          setError("Failed to fetch invoice");
        }
      } catch (error) {
        console.error("Error fetching invoice:", error);
        setError("Error fetching invoice");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchInvoice();
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "unpaid":
        return "bg-red-100 text-red-800";
      case "overdue":
        return "bg-orange-100 text-orange-800";
      case "partially paid":
        return "bg-yellow-100 text-yellow-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "void":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return <CheckIcon className="h-4 w-4" />;
      case "unpaid":
        return <XMarkIcon className="h-4 w-4" />;
      case "overdue":
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      case "partially paid":
        return <ClockIcon className="h-4 w-4" />;
      case "draft":
        return <DocumentDuplicateIcon className="h-4 w-4" />;
      case "sent":
        return <EnvelopeIcon className="h-4 w-4" />;
      default:
        return <DocumentDuplicateIcon className="h-4 w-4" />;
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
    if (!invoice) return false;

    const sellerStateCode = "29"; // Karnataka (seller)

    // First check if we have proper place of supply data in the invoice
    let placeOfSupplyState = "";

    // Check if invoice has explicit place of supply state
    if (invoice.placeOfSupplyState) {
      placeOfSupplyState = getStateFromAddress(invoice.placeOfSupplyState);
    } else {
      // Fallback to shipping/delivery address
      const deliveryAddress = invoice.buyerAddress || invoice.customerAddress;
      placeOfSupplyState = getStateFromAddress(deliveryAddress);
    }

    console.log("GST Calculation Debug:", {
      sellerState: "Karnataka (29)",
      placeOfSupplyState: placeOfSupplyState,
      deliveryAddress: invoice.buyerAddress || invoice.customerAddress,
      hasPlaceOfSupply: !!invoice.placeOfSupplyState,
      isInterState: sellerStateCode !== placeOfSupplyState,
    });

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

  const showToastMessage = (message: string, type: "success" | "error") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      setUpdatingStatus(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/invoices/${params.id}/status`,
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
        showToastMessage(`Invoice status updated to ${newStatus}`, "success");
        // Update local state
        setInvoice((prev) => (prev ? { ...prev, status: newStatus } : null));
        setShowStatusDropdown(false);
      } else {
        showToastMessage(result.error || "Failed to update status", "error");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      showToastMessage("Failed to update status. Please try again.", "error");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!invoice) return;
    try {
      generateClientPDF(invoice);
      showToastMessage("PDF downloaded successfully!", "success");
    } catch (error) {
      console.error("Error generating PDF:", error);
      showToastMessage("Failed to generate PDF", "error");
    }
  };

  const handleSendInvoice = async () => {
    if (!invoice) return;

    const recipientEmail = invoice.buyerEmail || invoice.customerEmail;
    if (!recipientEmail) {
      showToastMessage("No email address found for the customer", "error");
      return;
    }

    setSending(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/invoices/${params.id}/send-email`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recipientEmail: recipientEmail,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        showToastMessage("Invoice sent successfully!", "success");
        // Refresh invoice data to update status
        const refreshResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/invoices/${params.id}`,
          {
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (refreshResponse.ok) {
          const refreshResult = await refreshResponse.json();
          if (refreshResult.success) {
            setInvoice(refreshResult.data);
          }
        }
      } else {
        showToastMessage(result.error || "Failed to send invoice", "error");
      }
    } catch (error) {
      console.error("Error sending invoice:", error);
      showToastMessage("Failed to send invoice. Please try again.", "error");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-auto bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="flex-1 overflow-auto bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto" />
          <p className="mt-4 text-gray-600">{error || "Invoice not found"}</p>
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
              onClick={() => router.push("/dashboard/sales/invoices")}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Invoice #{invoice.invoiceNumber}
              </h1>
              <p className="text-sm text-gray-500">
                {invoice.customerName} • {formatDate(invoice.invoiceDate)}
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
                } ${getStatusColor(invoice.status)}`}
              >
                {getStatusIcon(invoice.status)}
                <span className="ml-1 capitalize">{invoice.status}</span>
                <ChevronDownIcon className="h-3 w-3 ml-1" />
              </button>

              {showStatusDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                  <div className="py-1">
                    <button
                      onClick={() => handleStatusUpdate("Draft")}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Draft
                    </button>
                    <button
                      onClick={() => handleStatusUpdate("Sent")}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sent
                    </button>
                    <button
                      onClick={() => handleStatusUpdate("Unpaid")}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Unpaid
                    </button>
                    <button
                      onClick={() => handleStatusUpdate("Paid")}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Paid
                    </button>
                    <button
                      onClick={() => handleStatusUpdate("Overdue")}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Overdue
                    </button>
                    <button
                      onClick={() => handleStatusUpdate("Partially Paid")}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Partially Paid
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                onClick={() => {
                  // Open preview in a new tab
                  window.open(
                    `/dashboard/sales/invoices/${params.id}/print`,
                    "_blank"
                  );
                }}
              >
                <EyeIcon className="h-4 w-4 mr-2" />
                Preview
              </button>
              <button
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                onClick={() =>
                  router.push(`/dashboard/sales/invoices/${params.id}/print`)
                }
              >
                <PrinterIcon className="h-4 w-4 mr-2" />
                Print
              </button>
              <button
                className={`flex items-center px-3 py-2 text-sm font-medium border rounded-md ${
                  sending
                    ? "text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed"
                    : "text-gray-700 bg-white border-gray-300 hover:bg-gray-50"
                }`}
                onClick={handleSendInvoice}
                disabled={sending}
              >
                <EnvelopeIcon className="h-4 w-4 mr-2" />
                {sending ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Tax Invoice Card */}
          <div className="bg-white">
            {/* Company Letterhead */}
            <div className="text-center py-6 mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                {invoice.sellerName || "ROBOBOOKS SOLUTIONS"}
              </h1>
              <div className="text-sm text-gray-800 space-y-1">
                <p>
                  {invoice.sellerAddress ||
                    "123 Business Street, Tech Park, Bangalore - 560001"}
                </p>
                <p>
                  {invoice.sellerPhone || "+91 98765 43210"} |{" "}
                  {invoice.sellerEmail || "info@robobooks.com"}
                </p>
                <p>
                  GSTIN: {invoice.sellerGstin || "29ABCDE1234F1Z5"} | Origin of
                  Supply: 29-Karnataka
                </p>

                {/* Invoice Details as bullet points */}
                <div className="flex justify-center items-center mt-3 text-xs text-gray-700">
                  <span>• Invoice No: {invoice.invoiceNumber}</span>
                  <span className="mx-2">
                    • Date: {formatDate(invoice.invoiceDate)}
                  </span>
                  <span className="mx-2">
                    • Due Date: {formatDate(invoice.dueDate)}
                  </span>
                  {invoice.orderNumber && (
                    <span className="mx-2">
                      • Order No: {invoice.orderNumber}
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
                    {invoice.buyerName || invoice.customerName}
                  </p>
                  {(invoice.buyerAddress || invoice.customerAddress) && (
                    <p className="text-sm text-gray-800">
                      {invoice.buyerAddress || invoice.customerAddress}
                    </p>
                  )}
                  {(invoice.buyerPhone || invoice.customerPhone) && (
                    <p className="text-sm text-gray-800">
                      Phone: {invoice.buyerPhone || invoice.customerPhone}
                    </p>
                  )}
                  {(invoice.buyerEmail || invoice.customerEmail) && (
                    <p className="text-sm text-gray-800">
                      Email: {invoice.buyerEmail || invoice.customerEmail}
                    </p>
                  )}
                  {invoice.buyerGstin && (
                    <p className="text-sm text-gray-800">
                      GSTIN: {invoice.buyerGstin}
                    </p>
                  )}
                  <p className="text-sm text-gray-800 font-medium">
                    State:{" "}
                    {invoice.buyerAddress?.includes("Uttar Pradesh")
                      ? "09-Uttar Pradesh"
                      : invoice.buyerAddress?.includes("West Bengal")
                      ? "19-West Bengal"
                      : invoice.buyerAddress?.includes("Maharashtra")
                      ? "27-Maharashtra"
                      : invoice.buyerAddress?.includes("Tamil Nadu")
                      ? "33-Tamil Nadu"
                      : invoice.buyerAddress?.includes("Gujarat")
                      ? "24-Gujarat"
                      : invoice.buyerAddress?.includes("Rajasthan")
                      ? "08-Rajasthan"
                      : invoice.buyerAddress?.includes("Punjab")
                      ? "03-Punjab"
                      : invoice.buyerAddress?.includes("Haryana")
                      ? "06-Haryana"
                      : invoice.buyerAddress?.includes("Delhi")
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
                    {invoice.buyerName || invoice.customerName}
                  </p>
                  {(invoice.buyerAddress || invoice.customerAddress) && (
                    <p className="text-sm text-gray-800">
                      {invoice.buyerAddress || invoice.customerAddress}
                    </p>
                  )}
                  <p className="text-sm text-gray-800">
                    <span className="font-medium">Place of Supply:</span>{" "}
                    {invoice.placeOfSupplyState
                      ? `${getStateFromAddress(invoice.placeOfSupplyState)}-${
                          invoice.placeOfSupplyState
                        }`
                      : `${getStateFromAddress(
                          invoice.buyerAddress || invoice.customerAddress
                        )}-Delivery Location`}
                  </p>
                  {invoice.terms && (
                    <p className="text-sm text-gray-800">
                      <span className="font-medium">Terms:</span>{" "}
                      {invoice.terms}
                    </p>
                  )}
                  {invoice.salesperson && (
                    <p className="text-sm text-gray-800">
                      <span className="font-medium">Salesperson:</span>{" "}
                      {invoice.salesperson}
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
                  {invoice.items.map((item, index) => (
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
                        {item.taxRate}%
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
                      {invoice.items.reduce(
                        (sum, item) => sum + item.quantity,
                        0
                      )}
                    </td>
                    <td className="border border-gray-400 px-3 py-2 text-sm text-right font-bold text-gray-900"></td>
                    <td className="border border-gray-400 px-3 py-2 text-sm text-right font-bold text-gray-900">
                      {formatCurrency(invoice.taxAmount)}
                    </td>
                    <td className="border border-gray-400 px-3 py-2 text-sm text-right font-bold text-gray-900">
                      {formatCurrency(invoice.subTotal)}
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
                    {numberToWords(invoice.total)}
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-2 underline">
                    TERMS AND CONDITIONS:
                  </h4>
                  <p className="text-sm text-gray-800">
                    {invoice.termsConditions ||
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
                        {formatCurrency(invoice.subTotal)}
                      </td>
                    </tr>

                    {/* Discount */}
                    {invoice.discountAmount > 0 && (
                      <tr>
                        <td className="py-1 text-sm text-gray-900">
                          Discount (
                          {invoice.discountType === "percentage"
                            ? `${invoice.discount}%`
                            : "Fixed"}
                          ):
                        </td>
                        <td className="py-1 text-sm text-right font-medium text-gray-900">
                          - {formatCurrency(invoice.discountAmount)}
                        </td>
                      </tr>
                    )}

                    {/* GST Breakdown */}
                    {invoice.taxAmount > 0 && (
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
                                {formatCurrency(invoice.taxAmount / 2)}
                              </td>
                            </tr>
                            <tr>
                              <td className="py-1 text-sm text-gray-900">
                                SGST @ 9%:
                              </td>
                              <td className="py-1 text-sm text-right font-medium text-gray-900">
                                {formatCurrency(invoice.taxAmount / 2)}
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
                              {formatCurrency(invoice.taxAmount)}
                            </td>
                          </tr>
                        )}
                      </>
                    )}

                    {/* TDS/TCS */}
                    {invoice.additionalTaxAmount !== 0 &&
                      invoice.additionalTaxType && (
                        <tr>
                          <td className="py-1 text-sm text-gray-900">
                            {invoice.additionalTaxType} @{" "}
                            {invoice.additionalTaxRate}%:
                          </td>
                          <td className="py-1 text-sm text-right font-medium text-gray-900">
                            {invoice.additionalTaxType === "TDS" ? "- " : "+ "}
                            {formatCurrency(
                              Math.abs(invoice.additionalTaxAmount)
                            )}
                          </td>
                        </tr>
                      )}

                    {/* Adjustment */}
                    {invoice.adjustment !== 0 && (
                      <tr>
                        <td className="py-1 text-sm text-gray-900">
                          Adjustment:
                        </td>
                        <td className="py-1 text-sm text-right font-medium text-gray-900">
                          {invoice.adjustment > 0 ? "+ " : "- "}
                          {formatCurrency(Math.abs(invoice.adjustment))}
                        </td>
                      </tr>
                    )}

                    <tr className="border-t border-gray-400">
                      <td className="py-2 text-base font-bold text-gray-900">
                        TOTAL:
                      </td>
                      <td className="py-2 text-base font-bold text-right text-gray-900">
                        {formatCurrency(invoice.total)}
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
                    For: {invoice.sellerName || "ROBOBOOKS SOLUTIONS"}
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

          {/* Action Buttons */}
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleDownloadPDF}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                Download PDF
              </button>

              <button
                onClick={handleSendInvoice}
                disabled={sending}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <EnvelopeIcon className="h-4 w-4 mr-2" />
                {sending ? "Sending..." : "Send Invoice"}
              </button>

              <button
                onClick={() => window.print()}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <PrinterIcon className="h-4 w-4 mr-2" />
                Print
              </button>

              <button
                onClick={() =>
                  router.push(`/dashboard/sales/invoices/${params.id}/edit`)
                }
                className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit
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

export default InvoiceDetailPage;
