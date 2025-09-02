/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef } from "react";
import {
  DocumentArrowUpIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

interface BankStatementImportProps {
  step: number;
  importData: {
    file: File | null;
    mappedFields: any;
    previewData: any[];
    accountName: string;
    selectedAccount: any;
  };
  setImportData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
  onComplete: () => void;
}

const BankStatementImport: React.FC<BankStatementImportProps> = ({
  step,
  importData,
  setImportData,
  onNext,
  onBack,
  onComplete,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [fileData, setFileData] = useState<any>(null);
  const [fieldMapping, setFieldMapping] = useState<any>({});
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock accounts for demo
  const mockAccounts = [
    { id: 1, name: "Business Checking Account", bank: "Chase Bank" },
    { id: 2, name: "Business Credit Card", bank: "American Express" },
    { id: 3, name: "Savings Account", bank: "Wells Fargo" },
  ];

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    setUploading(true);

    try {
      // Simulate file processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock file data based on file type
      const mockData = generateMockData(file.name);
      setFileData(mockData);
      setFieldMapping(mockData.autoMapping);
      setPreviewData(mockData.sampleData);

      setImportData({
        ...importData,
        file,
        mappedFields: mockData.autoMapping,
        previewData: mockData.sampleData,
      });

      setUploading(false);
      onNext();
    } catch (error) {
      console.error("File upload error:", error);
      setUploading(false);
    }
  };

  // Generate mock data for demo
  const generateMockData = (fileName: string) => {
    const isExcel = fileName.includes(".xlsx") || fileName.includes(".xls");
    const isCSV = fileName.includes(".csv");

    if (isExcel || isCSV) {
      return {
        fileName,
        totalRows: 3,
        headers: [
          "Date",
          "Withdrawals",
          "Deposits",
          "Payee",
          "Description",
          "Reference Number",
        ],
        autoMapping: {
          date: "Date",
          withdrawals: "Withdrawals",
          deposits: "Deposits",
          payee: "Payee",
          description: "Description",
          referenceNumber: "Reference Number",
        },
        sampleData: [
          {
            Date: "2019-06-01",
            Withdrawals: "0",
            Deposits: "5000",
            Payee: "John Roberts",
            Description: "Cheque deposit",
            Reference: "Ref-1900",
          },
          {
            Date: "2019-06-02",
            Withdrawals: "7500",
            Deposits: "0",
            Payee: "Smith",
            Description: "Electronics purchase",
            Reference: "Ref-2134",
          },
          {
            Date: "2019-06-03",
            Withdrawals: "4000",
            Deposits: "0",
            Payee: "Joseph",
            Description: "Insurance payment",
            Reference: "Ref-9872",
          },
        ],
      };
    }

    return {
      fileName,
      totalRows: 0,
      headers: [],
      autoMapping: {},
      sampleData: [],
    };
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

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
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  // Handle field mapping change
  const handleFieldMappingChange = (field: string, value: string) => {
    const newMapping = { ...fieldMapping, [field]: value };
    setFieldMapping(newMapping);
    setImportData({
      ...importData,
      mappedFields: newMapping,
    });
  };

  // Process field mapping
  const processFieldMapping = async () => {
    setProcessing(true);

    try {
      // Simulate processing
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Process data with new mapping
      const processed = previewData.map((row) => ({
        date: row[fieldMapping.date] || "",
        description: row[fieldMapping.description] || "",
        payee: row[fieldMapping.payee] || "",
        referenceNumber: row[fieldMapping.referenceNumber] || "",
        withdrawals: parseFloat(row[fieldMapping.withdrawals]) || 0,
        deposits: parseFloat(row[fieldMapping.deposits]) || 0,
        status: "ready",
      }));

      setPreviewData(processed);
      setImportData({
        ...importData,
        previewData: processed,
      });

      setProcessing(false);
      onNext();
    } catch (error) {
      console.error("Processing error:", error);
      setProcessing(false);
    }
  };

  // Import transactions
  const handleImport = async () => {
    setProcessing(true);

    try {
      // Simulate import
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setProcessing(false);
      onComplete();
    } catch (error) {
      console.error("Import error:", error);
      setProcessing(false);
    }
  };

  // Step 1: File Upload
  if (step === 1) {
    return (
      <div className="max-w-4xl mx-auto">
        <div
          className={`bg-white rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
            dragActive ? "border-blue-400 bg-blue-50" : "border-gray-300"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Drag and drop file to import
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Maximum File Size: 1 MB for CSV, TSV, XLS, OFX, QIF, CAMT.053 and
            CAMT.054 • 5 MB for PDF files
          </p>

          <div className="mt-6">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Choose File
            </button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".csv,.xlsx,.xls,.pdf,.ofx,.qif,.xml"
              onChange={handleFileInputChange}
            />
          </div>

          <p className="mt-4 text-xs text-gray-500">
            Ensure that the import file is in the correct format by comparing it
            with our sample file.{" "}
            <button className="text-blue-600 hover:underline">
              Download sample file▾
            </button>
          </p>
        </div>

        {/* File Type and Encoding */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Character Encoding
            </label>
            <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
              <option>UTF-8 (Unicode)</option>
              <option>ISO-8859-1</option>
              <option>Windows-1252</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date Format
            </label>
            <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
              <option>yyyy-MM-dd</option>
              <option>MM/dd/yyyy</option>
              <option>dd/MM/yyyy</option>
            </select>
          </div>
        </div>

        {/* Page Tips */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                If you have files in other formats, you can convert it to an
                accepted file format using any online/offline converter.
              </p>
            </div>
          </div>
        </div>

        {uploading && (
          <div className="mt-6 text-center">
            <div className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-800 bg-blue-100 rounded-md">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-800"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing file...
            </div>
          </div>
        )}
      </div>
    );
  }

  // Step 2: Field Mapping
  if (step === 2) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900">Map Fields</h3>
            <p className="text-sm text-gray-600">
              The best match to each field on the selected file have been
              auto-selected.
            </p>
          </div>

          {/* Default Data Formats */}
          <div className="mb-6 p-4 bg-gray-50 rounded-md">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <div className="mt-1 flex items-center">
                  <span className="text-sm text-gray-500">
                    Select format at field level
                  </span>
                  <button className="ml-2 text-blue-600 hover:text-blue-700 text-sm">
                    Edit
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Decimal Format
                </label>
                <div className="mt-1 flex items-center">
                  <span className="text-sm text-gray-500">1234567.89</span>
                  <button className="ml-2 text-blue-600 hover:text-blue-700 text-sm">
                    Edit
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Field Mapping Table */}
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    RoboBooks Field
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Imported File Headers
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[
                  { field: "date", label: "Date*", required: true },
                  {
                    field: "description",
                    label: "Description",
                    required: false,
                  },
                  { field: "payee", label: "Payee", required: false },
                  {
                    field: "referenceNumber",
                    label: "Reference Number",
                    required: false,
                  },
                  {
                    field: "withdrawals",
                    label: "Withdrawals",
                    required: false,
                  },
                  { field: "deposits", label: "Deposits", required: false },
                ].map((item) => (
                  <tr key={item.field}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.label}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <button className="text-red-500 hover:text-red-700">
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                        <select
                          value={fieldMapping[item.field] || ""}
                          onChange={(e) =>
                            handleFieldMappingChange(item.field, e.target.value)
                          }
                          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        >
                          <option value="">Select field</option>
                          {fileData?.headers?.map((header: string) => (
                            <option key={header} value={header}>
                              {header}
                            </option>
                          ))}
                        </select>
                        {item.field === "date" && (
                          <select className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                            <option>yyyy-MM-dd</option>
                            <option>MM/dd/yyyy</option>
                            <option>dd/MM/yyyy</option>
                          </select>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Navigation */}
          <div className="mt-6 flex justify-between">
            <button
              onClick={onBack}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Previous
            </button>
            <button
              onClick={processFieldMapping}
              disabled={processing}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {processing ? "Processing..." : "Next"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Preview & Import
  if (step === 3) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              Preview & Import
            </h3>
            <p className="text-sm text-gray-600">
              Review your data before importing
            </p>
          </div>

          {/* Import Summary */}
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex">
              <CheckCircleIcon className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  Statement is ready for import.
                </p>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircleIcon className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Ready to Import
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {previewData.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Errors
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">0</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ExclamationTriangleIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Unmapped Fields
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">0</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Important Note */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Note:</strong> The duplicate transactions found in
                  your bank statement will be saved under{" "}
                  <strong>Automatically Excluded Transactions</strong>. You can
                  restore those transactions later if needed.
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-6 flex justify-between">
            <button
              onClick={onBack}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Previous
            </button>
            <button
              onClick={handleImport}
              disabled={processing}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {processing ? "Importing..." : "Import"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default BankStatementImport;
