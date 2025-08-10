"use client";

import React from "react";
import { format } from "date-fns";

interface DeliveryChallanPreviewProps {
  deliveryChallan: any;
}

const DeliveryChallanPreview: React.FC<DeliveryChallanPreviewProps> = ({
  deliveryChallan,
}) => {
  const formatAddress = (address: any) => {
    if (!address) return "";
    const parts = [
      address.name,
      address.address,
      address.city,
      address.state,
      address.zipCode,
      address.country,
    ].filter(Boolean);
    return parts.join(", ");
  };

  const convertToWords = (num: number): string => {
    // Simple number to words conversion for Indian Rupee
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

    if (num === 0) return "Zero";
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100)
      return (
        tens[Math.floor(num / 10)] + (num % 10 ? " " + ones[num % 10] : "")
      );
    if (num < 1000)
      return (
        ones[Math.floor(num / 100)] +
        " Hundred" +
        (num % 100 ? " and " + convertToWords(num % 100) : "")
      );
    if (num < 100000)
      return (
        convertToWords(Math.floor(num / 1000)) +
        " Thousand" +
        (num % 1000 ? " " + convertToWords(num % 1000) : "")
      );
    if (num < 10000000)
      return (
        convertToWords(Math.floor(num / 100000)) +
        " Lakh" +
        (num % 100000 ? " " + convertToWords(num % 100000) : "")
      );
    return (
      convertToWords(Math.floor(num / 10000000)) +
      " Crore" +
      (num % 10000000 ? " " + convertToWords(num % 10000000) : "")
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Preview</h3>

      {/* A4 Preview Container */}
      <div
        className="bg-white border border-gray-300 shadow-lg mx-auto"
        style={{ width: "210mm" }}
      >
        {/* Company Header */}
        <div className="border-b-2 border-gray-800 p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            COMPANY NAME
          </h1>
          <p className="text-sm text-gray-600 mb-1">Company Address Line 1</p>
          <p className="text-sm text-gray-600 mb-1">Company Address Line 2</p>
          <p className="text-sm text-gray-600 mb-1">City, State - Pincode</p>
          <p className="text-sm text-gray-600">
            Phone: +91-XXXXXXXXXX | Email: info@company.com
          </p>
        </div>

        {/* Document Title */}
        <div className="text-center py-6 border-b border-gray-300">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            DELIVERY CHALLAN
          </h2>
          <div className="flex justify-center space-x-8 text-sm text-gray-600">
            <span>DC No: {deliveryChallan.challanNo}</span>
            <span>
              Date:{" "}
              {format(new Date(deliveryChallan.challanDate), "dd/MM/yyyy")}
            </span>
          </div>
        </div>

        {/* Customer and Challan Details */}
        <div className="p-6 grid grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">
              Deliver To:
            </h3>
            <div className="text-sm text-gray-700">
              {deliveryChallan.shipTo ? (
                <>
                  <p className="font-medium">{deliveryChallan.shipTo.name}</p>
                  <p>{deliveryChallan.shipTo.address}</p>
                  <p>
                    {deliveryChallan.shipTo.city},{" "}
                    {deliveryChallan.shipTo.state} -{" "}
                    {deliveryChallan.shipTo.zipCode}
                  </p>
                  <p>{deliveryChallan.shipTo.country}</p>
                </>
              ) : (
                <p className="text-gray-500">No shipping address specified</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">
              Challan Details:
            </h3>
            <div className="text-sm text-gray-700 space-y-1">
              <p>
                <span className="font-medium">Reference:</span>{" "}
                {deliveryChallan.referenceNo || "N/A"}
              </p>
              <p>
                <span className="font-medium">Type:</span>{" "}
                {deliveryChallan.challanType}
              </p>
              <p>
                <span className="font-medium">Place of Supply:</span>{" "}
                {deliveryChallan.placeOfSupply || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="px-6 pb-4">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">
                  S.No
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">
                  Item Description
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">
                  HSN/SAC
                </th>
                <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium text-gray-700">
                  Quantity
                </th>
                <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium text-gray-700">
                  UOM
                </th>
                <th className="border border-gray-300 px-3 py-2 text-right text-sm font-medium text-gray-700">
                  Rate (₹)
                </th>
                <th className="border border-gray-300 px-3 py-2 text-right text-sm font-medium text-gray-700">
                  Amount (₹)
                </th>
              </tr>
            </thead>
            <tbody>
              {deliveryChallan.items.map((item: any, index: number) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">
                    {index + 1}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">
                    {item.itemName}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-600">
                    {item.hsn || "-"}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900 text-center">
                    {item.quantity}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900 text-center">
                    {item.uom}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900 text-right">
                    {item.rate?.toFixed(2) || "0.00"}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900 text-right">
                    {item.amount?.toFixed(2) || "0.00"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="px-6 pb-4">
          <div className="flex justify-end">
            <div className="w-64">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="text-gray-900">
                    ₹{deliveryChallan.subTotal?.toFixed(2) || "0.00"}
                  </span>
                </div>
                {deliveryChallan.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Discount{" "}
                      {deliveryChallan.discountType === "percentage"
                        ? `(${deliveryChallan.discount}%)`
                        : ""}
                      :
                    </span>
                    <span className="text-gray-900">
                      -₹{deliveryChallan.discountAmount?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                )}
                {deliveryChallan.adjustment !== 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Adjustment:</span>
                    <span className="text-gray-900">
                      {deliveryChallan.adjustment > 0 ? "+" : ""}₹
                      {deliveryChallan.adjustment?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                )}
                <div className="border-t border-gray-300 pt-2">
                  <div className="flex justify-between font-semibold">
                    <span className="text-gray-900">Total:</span>
                    <span className="text-gray-900">
                      ₹{deliveryChallan.total?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-gray-600 italic">
                  Amount in Words:{" "}
                  {convertToWords(Math.floor(deliveryChallan.total || 0))}{" "}
                  Rupees Only
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes and Terms */}
        {(deliveryChallan.notes || deliveryChallan.terms) && (
          <div className="px-6 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {deliveryChallan.notes && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 border-b border-gray-300 pb-1">
                    Notes:
                  </h4>
                  <p className="text-sm text-gray-700">
                    {deliveryChallan.notes}
                  </p>
                </div>
              )}
              {deliveryChallan.terms && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 border-b border-gray-300 pb-1">
                    Terms & Conditions:
                  </h4>
                  <p className="text-sm text-gray-700">
                    {deliveryChallan.terms}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Signature Section */}
        <div className="px-6 pb-4 border-t border-gray-300 pt-4">
          <div className="grid grid-cols-2 gap-8">
            <div className="text-center">
              <div className="border-t-2 border-gray-400 w-32 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Customer Signature</p>
            </div>
            <div className="text-center">
              <div className="border-t-2 border-gray-400 w-32 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Authorized Signature</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-300">
          <div className="text-center text-xs text-gray-500">
            <p>This is a computer generated document. No signature required.</p>
            <p>Generated on {format(new Date(), "dd/MM/yyyy HH:mm")}</p>
          </div>
        </div>
      </div>

      {/* Print Instructions */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Click the Print/PDF button above to generate a printable version
        </p>
      </div>
    </div>
  );
};

export default DeliveryChallanPreview;
