import React, { useState, useRef } from "react";
import {
  X,
  Upload,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import {
  ExcelParserService,
  ParsedExcelResult,
  ValidationError,
} from "@/services/excelParserService";
import * as XLSX from "xlsx";

interface ExcelUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (parsedData: ParsedExcelResult) => void;
}

const ExcelUploadModal: React.FC<ExcelUploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedExcelResult | null>(null);
  const [isParsing, setIsParsing] = useState(false);
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
      const result = await ExcelParserService.parseExcelFile(file);
      setParsedData(result);
    } catch (error) {
      console.error("Error parsing file:", error);
      setParsedData(null);
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

  const handleUpload = () => {
    if (parsedData) {
      onUpload(parsedData);
    }
  };

  const handleDownloadSample = () => {
    // Create sample Excel data with correct format
    const sampleData = [
      {
        "Account Name": "Cash in Hand",
        "Account Head": "Asset",
        "Account Group": "Current Asset",
        Balance: 0,
        "Balance Type": "debit",
      },
      {
        "Account Name": "Bank Account",
        "Account Head": "Asset",
        "Account Group": "Current Asset",
        Balance: 0,
        "Balance Type": "debit",
      },
      {
        "Account Name": "Accounts Receivable",
        "Account Head": "Asset",
        "Account Group": "Current Asset",
        Balance: 0,
        "Balance Type": "debit",
      },
      {
        "Account Name": "Accounts Payable",
        "Account Head": "Liability",
        "Account Group": "Current Liability",
        Balance: 0,
        "Balance Type": "credit",
      },
      {
        "Account Name": "Sales Revenue",
        "Account Head": "Income",
        "Account Group": "Direct Income",
        Balance: 0,
        "Balance Type": "credit",
      },
      {
        "Account Name": "Office Rent",
        "Account Head": "Expense",
        "Account Group": "Direct Expense",
        Balance: 0,
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
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Upload Excel File</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Upload an Excel file (.xlsx or .xls) with your Chart of Accounts
            data.
          </p>

          <button
            onClick={handleDownloadSample}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm mb-4"
          >
            <Download className="h-4 w-4" />
            Download Sample Format
          </button>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center ${
            dragActive
              ? "border-blue-500 bg-blue-50"
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
                <div className="flex items-center justify-center gap-2 text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
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

              {/* Detailed Error Display */}
              {parsedData && parsedData.errors.length > 0 && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
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
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="h-12 w-12 text-gray-400 mx-auto" />
              <p className="text-gray-600">
                Drag and drop your Excel file here, or{" "}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-800 font-medium"
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
            <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-800">
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

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!parsedData || parsedData.errors.length > 0}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExcelUploadModal;
