"use client";

import React from "react";
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
  placeOfSupplyState?: string;
  additionalTaxAmount?: number;
  additionalTaxType?: string;
  additionalTaxRate?: number;
}

interface InvoicePreviewProps {
  invoice: Invoice;
  isPrintMode?: boolean;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ 
  invoice, 
  isPrintMode = false 
}) => {
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
        (num % 100 !== 0 ? " " + convertLessThanOneThousand(num % 100) : "")
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
          (num % 100000 !== 0 ? " " + convert(num % 100000) : "")
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

  const getStateFromAddress = (address: string) => {
    if (address?.includes("Uttar Pradesh")) return "09";
    if (address?.includes("West Bengal")) return "19";
    if (address?.includes("Maharashtra")) return "27";
    if (address?.includes("Tamil Nadu")) return "33";
    if (address?.includes("Gujarat")) return "24";
    if (address?.includes("Rajasthan")) return "08";
    if (address?.includes("Punjab")) return "03";
    if (address?.includes("Haryana")) return "06";
    if (address?.includes("Delhi")) return "07";
    if (address?.includes("Karnataka")) return "29";
    return "09";
  };

  const isInterState = () => {
    const sellerState = "29"; // Karnataka
    const buyerState = getStateFromAddress(
      invoice.buyerAddress || invoice.customerAddress || ""
    );
    return sellerState !== buyerState;
  };

  return (
    <div className={`invoice-container bg-white ${isPrintMode ? 'print:bg-white' : ''}`}>
      {/* Company Letterhead */}
      <div className={`text-center py-6 mb-8 ${isPrintMode ? 'print:py-4 print:mb-6' : ''}`}>
        <h1 className={`text-3xl font-bold text-gray-900 mb-3 ${isPrintMode ? 'print:text-2xl' : ''}`}>
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
        <div className={`mt-6 border-t-2 border-gray-900 mx-16 ${isPrintMode ? 'print:mt-4 print:mx-8' : ''}`}></div>
      </div>

      {/* Billing and Shipping Information */}
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 mx-12 ${isPrintMode ? 'print:grid-cols-2 print:gap-6 print:mb-6 print:mx-8' : ''}`}>
        {/* Billing Address */}
        <div className={isPrintMode ? 'print:w-1/2' : ''}>
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
        <div className={isPrintMode ? 'print:w-1/2' : ''}>
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
                      invoice.buyerAddress || invoice.customerAddress || ""
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
      <div className={`mx-8 mb-8 ${isPrintMode ? 'print:mx-6 print:mb-6' : ''}`}>
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
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 mx-8 ${isPrintMode ? 'print:grid-cols-2 print:gap-6 print:mx-6' : ''}`}>
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
                          {formatCurrency((invoice.taxAmount || 0) / 2)}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1 text-sm text-gray-900">
                          SGST @ 9%:
                        </td>
                        <td className="py-1 text-sm text-right font-medium text-gray-900">
                          {formatCurrency((invoice.taxAmount || 0) / 2)}
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
                              {formatCurrency(invoice.taxAmount || 0)}
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
                        Math.abs(invoice.additionalTaxAmount || 0)
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
      <div className={`p-8 mt-12 ${isPrintMode ? 'print:p-6 print:mt-8' : ''}`}>
        <div className="flex justify-between items-end">
          <div>
            <p className="text-sm text-gray-900 font-medium">
              For: {invoice.sellerName || "ROBOBOOKS SOLUTIONS"}
            </p>
            {invoice.signature ? (
              <div className="mt-8">
                <img
                  src={invoice.signature.filePath}
                  alt="Digital Signature"
                  className="h-20 w-40 object-contain border border-gray-300 rounded"
                />
              </div>
            ) : (
              <div className="mt-16 border-t border-gray-900 w-40"></div>
            )}
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
  );
};

export default InvoicePreview;
