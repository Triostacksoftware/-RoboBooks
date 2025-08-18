import React, { useState, useRef } from "react";
import { X, Upload, FileSpreadsheet, Download } from "lucide-react";

interface ExcelUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => void;
}

const ExcelUploadModal: React.FC<ExcelUploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (isValidFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (isValidFile(file)) {
        setSelectedFile(file);
      }
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
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  const handleDownloadSample = () => {
    // Create sample Excel data
    const sampleData = [
      ["Account Name", "Account Head", "Account Group", "Balance", "Balance Type"],
      ["Cash in Hand", "Asset", "Current Asset", "50000", "debit"],
      ["Bank Account", "Asset", "Current Asset", "100000", "debit"],
      ["Accounts Receivable", "Asset", "Current Asset", "25000", "debit"],
      ["Inventory", "Asset", "Current Asset", "75000", "debit"],
      ["Equipment", "Asset", "Fixed Asset", "50000", "debit"],
      ["Accounts Payable", "Liability", "Current Liability", "30000", "credit"],
      ["Sales Revenue", "Income", "Sales", "0", "credit"],
      ["Cost of Goods Sold", "Expense", "Direct Expense", "0", "debit"],
      ["Rent Expense", "Expense", "Operating Expense", "0", "debit"],
    ];

    // Convert to CSV and download
    const csvContent = sampleData.map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "chart-of-accounts-sample.csv";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
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
            Upload an Excel file (.xlsx or .xls) with your Chart of Accounts data.
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
            <strong>Expected columns:</strong> Account Name, Account Head, Account Group, Balance, Balance Type
          </p>
          <p className="text-xs text-gray-500">
            <strong>Account Head:</strong> Asset, Liability, Income, Expense, Equity
          </p>
          <p className="text-xs text-gray-500">
            <strong>Balance Type:</strong> debit or credit
          </p>
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
            disabled={!selectedFile}
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
