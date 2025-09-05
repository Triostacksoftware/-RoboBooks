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
      {/* Print Controls - Hidden when printing */}
      <div className="print:hidden bg-gray-100 p-4 border-b">
        <div className="max-w-4xl mx-auto flex justify-start items-center">
          <button
            onClick={handleBack}
            className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            < Back
          </button>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="invoice-content max-w-4xl mx-auto bg-white p-8 print:p-0 print:bg-white">
        {/* Company Header */}
        <div className="text-center py-6 print:py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 print:text-xl">
            {invoice.sellerName || "ROBOBOOKS SOLUTIONS"}
          </h1>
          <p className="text-sm text-gray-600">
            {invoice.sellerAddress ||
              "123 Business Street, Tech Park, Bangalore"}
          </p>
          <p className="text-sm text-gray-600">
            Phone no.: {invoice.sellerPhone || "+91 98765 43210"}
          </p>
          <p className="text-sm text-gray-600">
            GSTIN: {invoice.sellerGstin || "29ABCDE1234F1Z5"}
          </p>
          <p className="text-sm text-gray-600">State: 29-Karnataka</p>
        </div>

        {/* Tax Invoice Title */}
        <div className="text-center py-4 print:py-2 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 print:text-lg">
            Tax Invoice
          </h2>
        </div>

        {/* Bill To and Invoice Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 print:p-4 border-b border-gray-200">
          {/* Bill To */}
          <div>
            <h3 className="font-bold text-gray-900 mb-2">Bill To:</h3>
            <p className="font-medium text-gray-900">
              {invoice.buyerName || invoice.customerName}
            </p>
            {(invoice.buyerAddress || invoice.customerAddress) && (
              <p className="text-sm text-gray-600">
                {invoice.buyerAddress || invoice.customerAddress}
              </p>
            )}
            {(invoice.buyerPhone || invoice.customerPhone) && (
              <p className="text-sm text-gray-600">
                Contact No.: {invoice.buyerPhone || invoice.customerPhone}
              </p>
            )}
            {(invoice.buyerEmail || invoice.customerEmail) && (
              <p className="text-sm text-gray-600">
                Email: {invoice.buyerEmail || invoice.customerEmail}
              </p>
            )}
            {invoice.buyerGstin && (
              <p className="text-sm text-gray-600">
                GSTIN Number: {invoice.buyerGstin}
              </p>
            )}
            <p className="text-sm text-gray-600">State: 09-Uttar Pradesh</p>
          </div>

          {/* Invoice Details */}
          <div>
            <h3 className="font-bold text-gray-900 mb-2">Invoice Details:</h3>
            <p className="text-sm text-gray-600">
              Invoice No.: {invoice.invoiceNumber}
            </p>
            <p className="text-sm text-gray-600">
              Date: {formatDate(invoice.invoiceDate)}
            </p>
            <p className="text-sm text-gray-600">
              Place of Supply: 29-Karnataka
            </p>
            {invoice.orderNumber && (
              <p className="text-sm text-gray-600">
                Order No.: {invoice.orderNumber}
              </p>
            )}
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
