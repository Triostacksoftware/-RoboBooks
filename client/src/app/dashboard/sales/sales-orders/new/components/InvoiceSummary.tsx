/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { CalculatorIcon } from "@heroicons/react/24/outline";

interface InvoiceSummaryProps {
  formData: any;
  onFormDataChange: (data: any) => void;
  isIntraState: () => boolean;
  tdsRecords: any[];
  tcsRecords: any[];
  isLoadingTaxes: boolean;
  onManageTDS: () => void;
  onManageTCS: () => void;
}

const InvoiceSummary: React.FC<InvoiceSummaryProps> = ({
  formData,
  onFormDataChange,
  isIntraState,
  tdsRecords,
  tcsRecords,
  isLoadingTaxes,
  onManageTDS,
  onManageTCS,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <CalculatorIcon className="h-5 w-5 mr-2" />
        Order Summary
      </h2>

      <div className="space-y-4">
        {/* Subtotal */}
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal:</span>
          <span className="font-medium">
            ₹{formData.subTotal?.toFixed(2) || "0.00"}
          </span>
        </div>

        {/* Discount */}
        <div className="flex justify-between">
          <span className="text-gray-600">Discount:</span>
          <span className="font-medium">
            ₹{formData.discountAmount?.toFixed(2) || "0.00"}
          </span>
        </div>

        {/* Tax */}
        <div className="flex justify-between">
          <span className="text-gray-600">Tax:</span>
          <span className="font-medium">
            ₹{formData.taxAmount?.toFixed(2) || "0.00"}
          </span>
        </div>

        {/* Total */}
        <div className="border-t pt-2">
          <div className="flex justify-between">
            <span className="text-lg font-semibold text-gray-900">Total:</span>
            <span className="text-lg font-semibold text-gray-900">
              ₹{formData.total?.toFixed(2) || "0.00"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceSummary;
