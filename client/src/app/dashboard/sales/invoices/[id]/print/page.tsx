"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { formatCurrency } from "@/utils/currency";

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
  items: InvoiceItem[];
  subTotal: number;
  discount: number;
  discountType: "percentage" | "amount";
  discountAmount: number;
  taxType: string;
  taxRate: number;
  taxAmount: number;
  shippingCharges: number;
  adjustment: number;
  roundOff: number;
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
  signature?: {
    fileName: string;
    filePath: string;
    fileSize: number;
  };
  createdAt: string;
  updatedAt: string;
}

const InvoicePrintPage = () => {
  const params = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/invoices/${params.id}`
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    router.push("/dashboard/sales/invoices");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Invoice not found"}</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Print Styles */}
        <style jsx global>{`
          @media print {
            * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            
            /* Completely remove browser headers and footers */
            @page {
              margin: 0 !important;
              padding: 0 !important;
              size: A4 !important;
              -webkit-print-color-adjust: exact !important;
            }
            
            /* Force remove all browser print elements */
            @media print {
              @page {
                margin: 0 !important;
                padding: 0 !important;
                size: A4 !important;
                -webkit-print-color-adjust: exact !important;
              }
              
              /* Hide browser print headers/footers completely */
              @page :first {
                margin: 0 !important;
                padding: 0 !important;
              }
              
              @page :left {
                margin: 0 !important;
                padding: 0 !important;
              }
              
              @page :right {
                margin: 0 !important;
                padding: 0 !important;
              }
            }
            
            body {
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
              font-size: 12pt !important;
              line-height: 1.4 !important;
              -webkit-print-color-adjust: exact !important;
            }
            
            /* Hide specific UI elements */
            nav, header, footer, aside, .sidebar, .navigation, .navbar,
            .print\\:hidden, .no-print, .action-buttons, .status-dropdown,
            .toast, .modal, .overlay, .backdrop {
              display: none !important;
            }
            
            /* Hide only Print and Send Invoice buttons in print */
            button[class*="send"], button[class*="Send"],
            button[class*="print"], button[class*="Print"],
            /* Target specific button text content for these two buttons only */
            button:has-text("Send Invoice"),
            button:has-text("Print"),
            /* Target by button position in the action bar */
            .flex button:nth-child(2), /* Send Invoice button */
            .flex button:nth-child(3)  /* Print button */ {
              display: none !important;
            }
            
            /* Hide common UI patterns but be more selective */
            [class*="header"]:not(.invoice-content),
            [class*="navbar"]:not(.invoice-content),
            [class*="sidebar"]:not(.invoice-content),
            [class*="footer"]:not(.invoice-content),
            [class*="toolbar"]:not(.invoice-content) {
              display: none !important;
            }
            
            /* Ensure only invoice content prints */
            .invoice-content {
              margin: 0 !important;
              padding: 0 !important;
              max-width: none !important;
              width: 100% !important;
              box-shadow: none !important;
              border: none !important;
              position: static !important;
              top: 0 !important;
              left: 0 !important;
            }
            
            /* Optimize table printing */
            table {
              page-break-inside: avoid !important;
              border-collapse: collapse !important;
            }
            
            /* Ensure proper page breaks */
            .page-break {
              page-break-before: always !important;
            }
            
            /* Hide scrollbars and ensure full width */
            html, body {
              overflow: visible !important;
              width: 100% !important;
              height: auto !important;
            }
            
            /* Ensure text is black for printing */
            * {
              color: black !important;
            }
            
            /* Ensure invoice content is visible and properly styled */
            .invoice-content {
              display: block !important;
              visibility: visible !important;
              opacity: 1 !important;
              position: static !important;
              top: auto !important;
              left: auto !important;
              right: auto !important;
              bottom: auto !important;
              margin: 0 !important;
              padding: 0 !important;
              min-height: auto !important;
              height: auto !important;
            }
            
            /* Remove excessive footer space */
            .invoice-content > *:last-child {
              margin-bottom: 0 !important;
              padding-bottom: 0 !important;
            }
            
            /* Ensure proper page sizing */
            html, body {
              height: auto !important;
              min-height: auto !important;
              max-height: none !important;
            }
            
            /* Remove any bottom spacing */
            body::after {
              display: none !important;
            }
            
            /* Hide only specific buttons in print output */
            button:has-text("Print"),
            button:has-text("Send Invoice"),
            button[class*="print"],
            button[class*="Print"],
            button[class*="send"],
            button[class*="Send"],
            /* Target buttons by their specific text content */
            button:contains("Print"),
            button:contains("Send Invoice"),
            /* Target by common button patterns for these specific actions */
            .flex button:nth-child(3), /* Print button (3rd position) */
            .flex button:nth-child(2)  /* Send Invoice button (2nd position) */ {
              display: none !important;
            }
            
            /* Force remove browser print headers and footers */
            @media print {
              /* Remove all browser print elements */
              @page {
                margin: 0 !important;
                padding: 0 !important;
                size: A4 !important;
                -webkit-print-color-adjust: exact !important;
              }
              
              /* Additional page rules to force removal */
              @page :first {
                margin: 0 !important;
                padding: 0 !important;
                size: A4 !important;
              }
              
              @page :left {
                margin: 0 !important;
                padding: 0 !important;
                size: A4 !important;
              }
              
              @page :right {
                margin: 0 !important;
                padding: 0 !important;
                size: A4 !important;
              }
              
              /* Force hide any browser print elements */
              @page {
                margin: 0 !important;
                padding: 0 !important;
                size: A4 !important;
                -webkit-print-color-adjust: exact !important;
              }
            }
          }
        `}</style>

      {/* Print Controls - Hidden when printing */}
      <div className="print:hidden bg-gray-100 p-4 border-b">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button
            onClick={handleBack}
            className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            &lt; Back
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white border border-blue-600 rounded-md hover:bg-blue-700"
          >
            🖨️ Print Invoice
          </button>
        </div>
      </div>

      {/* Invoice Content - Print Optimized */}
      <div className="invoice-content max-w-4xl mx-auto bg-white p-8 print:p-0 print:bg-white print:max-w-none print:m-0 print:shadow-none">
        {/* Company Header - SS1 Design */}
        <div className="text-center py-8 print:py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 print:text-2xl">
            {invoice.sellerName || "ROBOBOOKS SOLUTIONS"}
          </h1>
          <p className="text-sm text-gray-800 mb-1">
            {invoice.sellerAddress || "123 Business Street, Tech Park, Bangalore - 560001"}
          </p>
          <p className="text-sm text-gray-800 mb-1">
            {invoice.sellerPhone || "+91 9876543210"} | {invoice.sellerEmail || "info@robobooks.com"}
          </p>
          <p className="text-sm text-gray-800 mb-1">
            GSTIN: {invoice.sellerGstin || "29ABCDE1234F1Z5"} | Origin of Supply: 29-Karnataka
          </p>
          
          {/* Invoice Details - Single line with bullet points (SS1 style) */}
          <div className="text-center text-xs text-gray-700 mb-2">
            <span>• Invoice No: {invoice.invoiceNumber} • Date: {formatDate(invoice.invoiceDate)} • Due Date: {formatDate(invoice.dueDate)} {invoice.orderNumber && `• Order No: ${invoice.orderNumber}`}</span>
          </div>
        </div>

        {/* Professional Horizontal Line */}
        <div className="border-t-2 border-gray-900 mx-16 print:mx-8"></div>

        {/* Billing and Shipping Address */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 print:p-4 border-b border-gray-200">
          {/* Billing Address */}
          <div>
            <h3 className="font-bold text-gray-900 mb-3 underline">Billing Address:</h3>
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
                State: {invoice.buyerAddress?.includes("Uttar Pradesh") ? "09-Uttar Pradesh" :
                       invoice.buyerAddress?.includes("West Bengal") ? "19-West Bengal" :
                       invoice.buyerAddress?.includes("Maharashtra") ? "27-Maharashtra" :
                       invoice.buyerAddress?.includes("Tamil Nadu") ? "33-Tamil Nadu" :
                       invoice.buyerAddress?.includes("Gujarat") ? "24-Gujarat" :
                       invoice.buyerAddress?.includes("Rajasthan") ? "08-Rajasthan" :
                       invoice.buyerAddress?.includes("Punjab") ? "03-Punjab" :
                       invoice.buyerAddress?.includes("Haryana") ? "06-Haryana" :
                       invoice.buyerAddress?.includes("Delhi") ? "07-Delhi" :
                       invoice.buyerAddress?.includes("Karnataka") ? "29-Karnataka" :
                       "09-Uttar Pradesh"}
              </p>
            </div>
          </div>

          {/* Shipping Address */}
          <div>
            <h3 className="font-bold text-gray-900 mb-3 underline">Shipping Address:</h3>
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
                {invoice.placeOfSupplyState ? 
                  `${invoice.placeOfSupplyState.includes("Uttar Pradesh") ? "09" :
                    invoice.placeOfSupplyState.includes("West Bengal") ? "19" :
                    invoice.placeOfSupplyState.includes("Maharashtra") ? "27" :
                    invoice.placeOfSupplyState.includes("Tamil Nadu") ? "33" :
                    invoice.placeOfSupplyState.includes("Gujarat") ? "24" :
                    invoice.placeOfSupplyState.includes("Rajasthan") ? "08" :
                    invoice.placeOfSupplyState.includes("Punjab") ? "03" :
                    invoice.placeOfSupplyState.includes("Haryana") ? "06" :
                    invoice.placeOfSupplyState.includes("Delhi") ? "07" :
                    invoice.placeOfSupplyState.includes("Karnataka") ? "29" : "09"}-${invoice.placeOfSupplyState}` :
                  `${invoice.buyerAddress?.includes("Uttar Pradesh") ? "09" :
                    invoice.buyerAddress?.includes("West Bengal") ? "19" :
                    invoice.buyerAddress?.includes("Maharashtra") ? "27" :
                    invoice.buyerAddress?.includes("Tamil Nadu") ? "33" :
                    invoice.buyerAddress?.includes("Gujarat") ? "24" :
                    invoice.buyerAddress?.includes("Rajasthan") ? "08" :
                    invoice.buyerAddress?.includes("Punjab") ? "03" :
                    invoice.buyerAddress?.includes("Haryana") ? "06" :
                    invoice.buyerAddress?.includes("Delhi") ? "07" :
                    invoice.buyerAddress?.includes("Karnataka") ? "29" : "09"}-Delivery Location`}
              </p>
              {invoice.terms && (
                <p className="text-sm text-gray-800">
                  <span className="font-medium">Terms:</span> {invoice.terms}
                </p>
              )}
              {invoice.salesperson && (
                <p className="text-sm text-gray-800">
                  <span className="font-medium">Salesperson:</span> {invoice.salesperson}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="p-6 print:p-4">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700">
                  #
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700">
                  Item name
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700">
                  HSN/SAC
                </th>
                <th className="border border-gray-300 px-3 py-2 text-right text-xs font-medium text-gray-700">
                  Quantity
                </th>
                <th className="border border-gray-300 px-3 py-2 text-right text-xs font-medium text-gray-700">
                  Price/unit
                </th>
                <th className="border border-gray-300 px-3 py-2 text-right text-xs font-medium text-gray-700">
                  GST
                </th>
                <th className="border border-gray-300 px-3 py-2 text-right text-xs font-medium text-gray-700">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-3 py-2 text-sm">
                    {index + 1}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm">
                    {item.details}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm">
                    8704
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-right">
                    {item.quantity}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-right">
                    {formatCurrency(item.rate)}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-right">
                    {formatCurrency(item.taxAmount)} ({item.taxRate}%)
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-right font-medium">
                    {formatCurrency(item.amount)}
                  </td>
                </tr>
              ))}
              {/* Total Row */}
              <tr className="bg-gray-50">
                <td
                  colSpan={3}
                  className="border border-gray-300 px-3 py-2 text-sm font-bold"
                >
                  Total
                </td>
                <td className="border border-gray-300 px-3 py-2 text-sm text-right font-bold">
                  {invoice.items.reduce((sum, item) => sum + item.quantity, 0)}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-sm text-right font-bold"></td>
                <td className="border border-gray-300 px-3 py-2 text-sm text-right font-bold">
                  {formatCurrency(invoice.taxAmount)}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-sm text-right font-bold">
                  {formatCurrency(invoice.total)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Summary and Terms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 print:p-4 border-t border-gray-200">
          {/* Left Side - Amount in Words and Terms */}
          <div>
            <div className="mb-4">
              <h4 className="font-bold text-gray-900 mb-1">
                Invoice Amount In Words:
              </h4>
              <p className="text-sm text-gray-700">
                {numberToWords(invoice.total)}
              </p>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-1">
                Terms And Conditions:
              </h4>
              <p className="text-sm text-gray-700">
                {invoice.termsConditions ||
                  "Thank you for doing business with us."}
              </p>
            </div>
          </div>

          {/* Right Side - Financial Summary */}
          <div>
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="py-1 text-sm text-gray-600">Sub Total:</td>
                  <td className="py-1 text-sm text-right font-medium">
                    {formatCurrency(invoice.subTotal)}
                  </td>
                </tr>
                {invoice.taxAmount > 0 && (
                  <>
                    <tr>
                      <td className="py-1 text-sm text-gray-600">
                        SGST@{invoice.taxRate / 2}%:
                      </td>
                      <td className="py-1 text-sm text-right font-medium">
                        {formatCurrency(invoice.taxAmount / 2)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 text-sm text-gray-600">
                        CGST@{invoice.taxRate / 2}%:
                      </td>
                      <td className="py-1 text-sm text-right font-medium">
                        {formatCurrency(invoice.taxAmount / 2)}
                      </td>
                    </tr>
                  </>
                )}
                <tr className="border-t border-gray-300">
                  <td className="py-2 text-lg font-bold text-gray-900">
                    Total:
                  </td>
                  <td className="py-2 text-lg font-bold text-right text-gray-900 bg-purple-100">
                    {formatCurrency(invoice.total)}
                  </td>
                </tr>
                <tr>
                  <td className="py-1 text-sm text-gray-600">Received:</td>
                  <td className="py-1 text-sm text-right font-medium bg-purple-100">
                    {formatCurrency(invoice.amountPaid)}
                  </td>
                </tr>
                <tr>
                  <td className="py-1 text-sm text-gray-600">Balance:</td>
                  <td className="py-1 text-sm text-right font-bold bg-purple-100">
                    {formatCurrency(invoice.balanceDue)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Signature Area */}
        <div className="p-6 print:p-4 border-t border-gray-200">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-sm text-gray-600">
                For: {invoice.sellerName || "ROBOBOOKS SOLUTIONS"}
              </p>
              {invoice.signature ? (
                <div className="mt-4 print:mt-3">
                  <img
                    src={invoice.signature.filePath}
                    alt="Digital Signature"
                    className="h-16 w-32 object-contain border border-gray-300 rounded"
                  />
                </div>
              ) : (
                <div className="mt-8 print:mt-6 border-t border-gray-400 w-32"></div>
              )}
              <p className="text-sm text-gray-600 mt-1">Authorized Signatory</p>
            </div>
            <div className="text-sm text-gray-500">
              <p>www.robobooks.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @media print {
            @page {
              margin: 0.5in;
              size: A4;
            }
            body {
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
              background: white !important;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            .print\\:hidden {
              display: none !important;
            }
            .print\\:p-0 {
              padding: 0 !important;
            }
            .print\\:p-4 {
              padding: 1rem !important;
            }
            .print\\:py-4 {
              padding-top: 1rem !important;
              padding-bottom: 1rem !important;
            }
            .print\\:py-2 {
              padding-top: 0.5rem !important;
              padding-bottom: 0.5rem !important;
            }
            .print\\:text-xl {
              font-size: 1.25rem !important;
            }
            .print\\:text-lg {
              font-size: 1.125rem !important;
            }
            .print\\:mt-6 {
              margin-top: 1.5rem !important;
            }
            /* Hide only the print controls when printing */
            .print\\:hidden {
              display: none !important;
            }
            /* Show invoice content */
            .invoice-content {
              display: block !important;
              visibility: visible !important;
              opacity: 1 !important;
            }
            /* Ensure all invoice elements are visible */
            .invoice-content * {
              display: revert !important;
              visibility: visible !important;
            }
          }
        `,
        }}
      />
    </>
  );
};

export default InvoicePrintPage;
