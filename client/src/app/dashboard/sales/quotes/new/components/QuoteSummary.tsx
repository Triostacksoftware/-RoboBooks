"use client";

import React, { useState, useRef, useEffect } from "react";

type TaxMode = "GST" | "IGST" | "NON_TAXABLE" | "NO_GST" | "EXPORT";

interface TDSRecord {
  _id: string;
  name: string;
  rate: number;
  section: string;
  status: "Active" | "Inactive";
}

interface TCSRecord {
  _id: string;
  name: string;
  rate: number;
  natureOfCollection: string;
  section?: string;
  status: "Active" | "Inactive";
}

interface QuoteSummaryProps {
  formData: {
    subTotal: number;
    discount: number;
    discountType: "percentage" | "amount";
    discountAmount: number;
    cgstTotal: number;
    sgstTotal: number;
    igstTotal: number;
    taxAmount: number;
    additionalTaxType: "TDS" | "TCS" | null;
    additionalTaxId: string;
    additionalTaxRate: number;
    additionalTaxAmount: number;
    adjustment: number;
    total: number;
    items: Array<{
      id: number;
      itemId: string;
      details: string;
      description: string;
      quantity: number;
      unit: string;
      rate: number;
      amount: number;
      taxMode: TaxMode;
      taxRate: number;
      taxAmount: number;
      cgst: number;
      sgst: number;
      igst: number;
      taxRemark: string;
    }>;
  };
  onFormDataChange: (data: QuoteSummaryProps["formData"]) => void;
  isIntraState: boolean;
  tdsRecords: TDSRecord[];
  tcsRecords: TCSRecord[];
  isLoadingTaxes: boolean;
  onManageTDS: () => void;
  onManageTCS: () => void;
}

// Modern Dropdown Component
interface ModernDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: (TDSRecord | TCSRecord)[];
  placeholder: string;
  isLoading?: boolean;
  onManage?: () => void;
  taxType?: string;
}

const ModernDropdown: React.FC<ModernDropdownProps> = ({
  value,
  onChange,
  options,
  placeholder,
  isLoading = false,
  onManage,
  taxType,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt._id === value);

  const filteredOptions = options.filter(
    (option) =>
      option.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      option.section?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: TDSRecord | TCSRecord) => {
    onChange(option._id);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex space-x-2">
        <div className="flex-1 relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            {selectedOption ? (
              <div>
                <div className="font-medium">{selectedOption.name}</div>
                <div className="text-xs text-gray-500">
                  {selectedOption.rate}% • {selectedOption.section || "N/A"}
                </div>
              </div>
            ) : (
              <span className="text-gray-500">{placeholder}</span>
            )}
          </button>

          {isOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
              <div className="p-2 border-b border-gray-200">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="max-h-48 overflow-auto">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option) => (
                    <button
                      key={option._id}
                      onClick={() => handleSelect(option)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 text-sm"
                    >
                      <div className="font-medium">{option.name}</div>
                      <div className="text-xs text-gray-500">
                        {option.rate}% • {option.section || "N/A"}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-gray-500 text-sm">
                    No options found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        {onManage && (
          <button
            type="button"
            onClick={onManage}
            className="px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap"
          >
            Manage {taxType}
          </button>
        )}
      </div>
    </div>
  );
};

const QuoteSummary: React.FC<QuoteSummaryProps> = ({
  formData,
  onFormDataChange,
  isIntraState,
  tdsRecords,
  tcsRecords,
  isLoadingTaxes,
  onManageTDS,
  onManageTCS,
}) => {
  const handleDiscountChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    onFormDataChange({
      ...formData,
      discount: numValue,
    });
  };

  const handleAdjustmentChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    onFormDataChange({
      ...formData,
      adjustment: numValue,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
      <h2 className="text-sm font-semibold text-gray-900 mb-3">
        Summary & Totals
      </h2>

      <div className="space-y-0">
        {/* Sub Total */}
        <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
          <span className="text-sm text-gray-600">Sub Total</span>
          <span className="font-medium text-gray-900 text-sm">
            ₹{(formData.subTotal || 0).toFixed(2)}
          </span>
        </div>

        {/* Discount */}
        <div className="py-1.5 border-b border-gray-100">
          <div className="text-sm text-gray-600 mb-1.5">Discount</div>
          <div className="flex items-center space-x-2">
            <select
              value={formData.discountType}
              onChange={(e) =>
                onFormDataChange({
                  ...formData,
                  discountType: e.target.value as "percentage" | "amount",
                })
              }
              className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="percentage">%</option>
              <option value="amount">₹</option>
            </select>
            <input
              type="number"
              step="0.01"
              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={formData.discount || 0}
              onChange={(e) => handleDiscountChange(e.target.value)}
            />
            <span className="font-medium text-gray-900 min-w-[45px] text-right text-sm">
              ₹{(formData.discountAmount || 0).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Tax Breakdown */}
        <div className="py-1.5 border-b border-gray-100">
          <div className="text-sm text-gray-600 mb-1.5">Tax</div>
          {(() => {
            // Get the effective tax rate from the first taxable item
            const taxableItems =
              formData.items?.filter(
                (item) => item.taxMode === "GST" || item.taxMode === "IGST"
              ) || [];

            // Default to 18% if no items or find the most common tax rate
            let effectiveTaxRate = 18;
            if (taxableItems.length > 0) {
              // Get tax rate from first item with GST/IGST, or default to 18
              effectiveTaxRate = taxableItems[0]?.taxRate || 18;
            }

            const halfRate = effectiveTaxRate / 2;

            return isIntraState ? (
              <div className="space-y-0.5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">CGST {halfRate}%</span>
                  <span className="text-gray-700">
                    ₹{(formData.cgstTotal || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">SGST {halfRate}%</span>
                  <span className="text-gray-700">
                    ₹{(formData.sgstTotal || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">IGST {effectiveTaxRate}%</span>
                <span className="text-gray-700">
                  ₹{(formData.igstTotal || 0).toFixed(2)}
                </span>
              </div>
            );
          })()}
          <div className="flex justify-between items-center mt-1.5 pt-1.5 border-t border-gray-100">
            <span className="text-sm text-gray-600">Total Tax</span>
            <span className="font-medium text-gray-900 text-sm">
              ₹{(formData.taxAmount || 0).toFixed(2)}
            </span>
          </div>
        </div>

        {/* TDS/TCS Section */}
        <div className="py-2 border-b border-gray-100">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Additional Tax</span>
          </div>

          {/* Tax Type Radio Buttons */}
          <div className="flex space-x-4 mb-2">
            <label className="flex items-center text-sm">
              <input
                type="radio"
                name="additionalTaxType"
                value="TDS"
                checked={formData.additionalTaxType === "TDS"}
                onChange={() => {
                  onFormDataChange({
                    ...formData,
                    additionalTaxType: "TDS",
                    additionalTaxId: "",
                    additionalTaxRate: 0,
                  });
                }}
                className="mr-1.5"
              />
              TDS
            </label>
            <label className="flex items-center text-sm">
              <input
                type="radio"
                name="additionalTaxType"
                value="TCS"
                checked={formData.additionalTaxType === "TCS"}
                onChange={() => {
                  onFormDataChange({
                    ...formData,
                    additionalTaxType: "TCS",
                    additionalTaxId: "",
                    additionalTaxRate: 0,
                  });
                }}
                className="mr-1.5"
              />
              TCS
            </label>
            <label className="flex items-center text-sm">
              <input
                type="radio"
                name="additionalTaxType"
                value=""
                checked={!formData.additionalTaxType}
                onChange={() => {
                  onFormDataChange({
                    ...formData,
                    additionalTaxType: null,
                    additionalTaxId: "",
                    additionalTaxRate: 0,
                  });
                }}
                className="mr-1.5"
              />
              None
            </label>
          </div>

          {/* Tax Selection Dropdown */}
          {formData.additionalTaxType && (
            <div className="space-y-2">
              <ModernDropdown
                value={formData.additionalTaxId}
                onChange={(selectedId) => {
                  const records =
                    formData.additionalTaxType === "TDS"
                      ? tdsRecords
                      : tcsRecords;
                  const selectedRecord = records.find(
                    (r) => r._id === selectedId
                  );

                  onFormDataChange({
                    ...formData,
                    additionalTaxId: selectedId,
                    additionalTaxRate: selectedRecord?.rate || 0,
                  });
                }}
                options={
                  formData.additionalTaxType === "TDS" ? tdsRecords : tcsRecords
                }
                placeholder={`Select ${formData.additionalTaxType}`}
                isLoading={isLoadingTaxes}
                onManage={
                  formData.additionalTaxType === "TDS"
                    ? onManageTDS
                    : onManageTCS
                }
                taxType={formData.additionalTaxType}
              />

              {/* Tax Amount Display */}
              {formData.additionalTaxType && formData.additionalTaxRate > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">
                    {formData.additionalTaxType} {formData.additionalTaxRate}%
                    {formData.additionalTaxType === "TDS"
                      ? " (Deducted)"
                      : " (Collected)"}
                  </span>
                  <span
                    className={`font-medium ${
                      formData.additionalTaxType === "TDS"
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {formData.additionalTaxType === "TDS" ? "-" : "+"}₹
                    {(formData.additionalTaxAmount || 0).toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Adjustment */}
        <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
          <span className="text-sm text-gray-600">Adjustment</span>
          <div className="flex items-center space-x-1">
            <input
              type="number"
              step="0.01"
              className="w-18 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={formData.adjustment || 0}
              onChange={(e) => handleAdjustmentChange(e.target.value)}
            />
            <span className="text-sm text-gray-500">₹</span>
          </div>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center py-2 border-t-2 border-gray-200">
          <span className="text-sm font-semibold text-gray-900">Total</span>
          <span className="text-base font-bold text-gray-900">
            ₹{(formData.total || 0).toFixed(2)}
          </span>
        </div>

        {/* Origin of Supply Info */}
        <div className="mt-2 p-1.5 bg-blue-50 rounded text-xs">
          <div className="text-blue-900 font-medium mb-0.5">
            📍 Origin of Supply
          </div>
          <div className="text-blue-700 font-medium">
            Karnataka (Company Office)
          </div>
          <div className="text-blue-600 text-xs mt-1">
            {isIntraState ? (
              <span>Same state delivery: CGST + SGST</span>
            ) : (
              <span>Inter-state delivery: IGST</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteSummary;
