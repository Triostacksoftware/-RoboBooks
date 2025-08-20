"use client";

import React, { useState, useRef } from "react";
import {
  X,
  Upload,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import * as XLSX from "xlsx";
import { api } from "@/lib/api";

interface AdminExcelUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

interface ParsedExcelResult {
  data: any[];
  errors: any[];
  totalRows: number;
  validRows: number;
}

const AdminExcelUploadModal: React.FC<AdminExcelUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedExcelResult | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [createHierarchy, setCreateHierarchy] = useState(true);
  const [overwriteExisting, setOverwriteExisting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (isValidFile(file)) {
        setSelectedFile(file);
        await parseFile(file);
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (isValidFile(file)) {
        setSelectedFile(file);
        await parseFile(file);
      }
    }
  };

  const parseFile = async (file: File) => {
    try {
      setIsParsing(true);
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Validate headers
      const headers = data[0] as string[];
      const expectedHeaders = ["Account Name", "Account Head", "Account Group", "Balance", "Balance Type"];
      
      const missingHeaders = expectedHeaders.filter(header => 
        !headers.some(h => h?.toString().toLowerCase().includes(header.toLowerCase()))
      );

      if (missingHeaders.length > 0) {
        throw new Error(`Missing required columns: ${missingHeaders.join(", ")}`);
      }

      // Process data rows
      const dataRows = data.slice(1);
      const validRows = dataRows.filter(row => 
        row[0] && row[1] && row[2] && row.length >= 3
      );

      const errors: any[] = [];
      
      // Basic validation
      validRows.forEach((row, index) => {
        const rowNumber = index + 2;
        if (!row[0]?.toString().trim()) {
          errors.push({ row: rowNumber, field: "Account Name", message: "Account name is required" });
        }
        if (!row[1]?.toString().trim()) {
          errors.push({ row: rowNumber, field: "Account Head", message: "Account head is required" });
        }
        if (!row[2]?.toString().trim()) {
          errors.push({ row: rowNumber, field: "Account Group", message: "Account group is required" });
        }
        if (row[3] && isNaN(parseFloat(row[3]))) {
          errors.push({ row: rowNumber, field: "Balance", message: "Balance must be a valid number" });
        }
      });

      setParsedData({
        data: validRows,
        errors,
        totalRows: dataRows.length,
        validRows: validRows.length - errors.length,
      });
    } catch (error) {
      console.error("Error parsing file:", error);
      setParsedData({
        data: [],
        errors: [{ row: 0, field: "File", message: error instanceof Error ? error.message : "Unknown error" }],
        totalRows: 0,
        validRows: 0,
      });
    } finally {
      setIsParsing(false);
    }
  };

  const isValidFile = (file: File): boolean => {
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    const validExtensions = [".xlsx", ".xls"];

    return (
      validTypes.includes(file.type) ||
      validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))
    );
  };

  const handleUpload = async () => {
    if (!parsedData || parsedData.errors.length > 0) {
      alert("Please fix validation errors before uploading");
      return;
    }

    try {
      setIsUploading(true);
      
      // Convert parsed data to the format expected by the backend
      const accounts = parsedData.data.map((row) => ({
        name: row[0]?.toString().trim(),
        accountType: row[1]?.toString().trim(),
        accountGroup: row[2]?.toString().trim(),
        balance: parseFloat(row[3]) || 0,
        balanceType: row[4]?.toString().toLowerCase() || "debit",
      }));

      const response = await api("/api/chart-of-accounts/upload-excel", {
        method: "POST",
        json: {
          accounts,
          createHierarchy,
          overwriteExisting,
        },
      });

      if (response.success) {
        onUploadSuccess();
      } else {
        alert("Upload failed: " + response.message);
      }
    } catch (error) {
      console.error("Error uploading:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadSample = () => {
    // Create sample Excel data with correct format
    const sampleData = [
      {
        "Account Name": "Cash in Hand",
        "Account Head": "asset",
        "Account Group": "cash",
        "Balance": 0,
        "Balance Type": "debit",
      },
      {
        "Account Name": "Bank Account",
        "Account Head": "asset",
        "Account Group": "bank",
        "Balance": 0,
        "Balance Type": "debit",
      },
      {
        "Account Name": "Accounts Receivable",
        "Account Head": "asset",
        "Account Group": "accounts_receivable",
        "Balance": 0,
        "Balance Type": "debit",
      },
      {
        "Account Name": "Accounts Payable",
        "Account Head": "liability",
        "Account Group": "accounts_payable",
        "Balance": 0,
        "Balance Type": "credit",
      },
      {
        "Account Name": "Sales Revenue",
        "Account Head": "income",
        "Account Group": "sales",
        "Balance": 0,
        "Balance Type": "credit",
      },
      {
        "Account Name": "Office Rent",
        "Account Head": "expense",
        "Account Group": "rent_expense",
        "Balance": 0,
        "Balance Type": "debit",
      },
    ];

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(sampleData);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Chart of Accounts");

    // Generate and download file
    XLSX.writeFile(workbook, "chart-of-accounts-sample.xlsx");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Upload Chart of Accounts</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Instructions */}
          <div className="text-sm text-gray-600">
            <p className="mb-2">
              Upload an Excel file (.xlsx or .xls) with your Chart of Accounts data.
            </p>
            <button
              onClick={handleDownloadSample}
              className="text-purple-600 hover:text-purple-800 font-medium"
            >
              Download Sample Format
            </button>
          </div>

          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? "border-purple-500 bg-purple-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />

            {selectedFile ? (
              <div className="space-y-2">
                <FileSpreadsheet className="h-12 w-12 text-green-500 mx-auto" />
                <p className="font-medium text-green-600">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
                {isParsing && (
                  <div className="flex items-center justify-center gap-2 text-purple-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                    <span className="text-sm">Parsing file...</span>
                  </div>
                )}
                {parsedData && !isParsing && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-3 w-3" />
                      <span>{parsedData.validRows} valid rows</span>
                    </div>
                    {parsedData.errors.length > 0 && (
                      <div className="flex items-center gap-1 text-red-600 mt-1">
                        <AlertCircle className="h-3 w-3" />
                        <span>{parsedData.errors.length} errors</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                <p className="text-gray-600">
                  Drag and drop your Excel file here, or{" "}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-purple-600 hover:text-purple-800 font-medium"
                  >
                    browse
                  </button>
                </p>
                <p className="text-xs text-gray-500">
                  Supports .xlsx and .xls files up to 5MB
                </p>
              </div>
            )}
          </div>

          {/* Detailed Error Display */}
          {parsedData && parsedData.errors.length > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="text-sm font-medium text-red-800 mb-2">
                Validation Errors:
              </h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {parsedData.errors.slice(0, 5).map((error, index) => (
                  <div key={index} className="text-xs text-red-700">
                    <strong>Row {error.row}:</strong> {error.field} -{" "}
                    {error.message}
                  </div>
                ))}
                {parsedData.errors.length > 5 && (
                  <div className="text-xs text-red-600 italic">
                    ... and {parsedData.errors.length - 5} more errors
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Upload Options */}
          {parsedData && parsedData.validRows > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900">Upload Options</h4>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={createHierarchy}
                    onChange={(e) => setCreateHierarchy(e.target.checked)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Create account hierarchy (group accounts by category and subtype)
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={overwriteExisting}
                    onChange={(e) => setOverwriteExisting(e.target.checked)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Overwrite existing accounts with same name
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Help Text */}
          <div className="mt-4 space-y-2">
            <p className="text-xs text-gray-500">
              <strong>Expected columns:</strong> Account Name, Account Head,
              Account Group, Balance, Balance Type
            </p>
            <p className="text-xs text-gray-500">
              <strong>Account Head:</strong> Any descriptive account type (e.g.,
              asset, liability, income, expense, equity)
            </p>
            <p className="text-xs text-gray-500">
              <strong>Balance Type:</strong> debit or credit
            </p>
            <details className="mt-2">
              <summary className="text-xs text-purple-600 cursor-pointer hover:text-purple-800">
                View suggested Account Groups
              </summary>
              <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                <div className="grid grid-cols-2 gap-1">
                  <div>
                    <strong>Assets:</strong> bank, cash, accounts_receivable,
                    fixed_asset, inventory, other_asset, current_asset,
                    investment, loans, advances, prepaid_expenses
                  </div>
                  <div>
                    <strong>Liabilities:</strong> accounts_payable, credit_card,
                    current_liability, long_term_liability, non_current_liability,
                    provisions, loans_payable, bonds_payable
                  </div>
                  <div>
                    <strong>Equity:</strong> owner_equity, retained_earnings,
                    capital, drawings
                  </div>
                  <div>
                    <strong>Income:</strong> sales, service_revenue, other_income,
                    direct_income, indirect_income, interest_income,
                    commission_income
                  </div>
                  <div>
                    <strong>Expenses:</strong> cost_of_goods_sold,
                    operating_expense, other_expense, direct_expense,
                    indirect_expense, salary_expense, rent_expense,
                    utilities_expense, advertising_expense, depreciation_expense,
                    interest_expense, tax_expense
                  </div>
                </div>
                <p className="mt-2 text-gray-500 italic">
                  Note: You can use any descriptive account group name. The system
                  now accepts all account group names.
                </p>
              </div>
            </details>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!parsedData || parsedData.errors.length > 0 || isUploading}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </div>
              ) : (
                "Upload"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminExcelUploadModal;
