"use client";

import React, { useState, useRef } from "react";
import {
  CloudArrowUpIcon,
  DocumentArrowDownIcon,
  ChevronDownIcon,
  LightBulbIcon,
  ArrowRightIcon,
  XMarkIcon,
  DocumentIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

interface ImportStep {
  id: number;
  title: string;
  isActive: boolean;
  isCompleted: boolean;
}

export default function ImportExpensesPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [characterEncoding, setCharacterEncoding] = useState("UTF-8 (Unicode)");
  const [showFileOptions, setShowFileOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const steps: ImportStep[] = [
    { id: 1, title: "Configure", isActive: currentStep === 1, isCompleted: currentStep > 1 },
    { id: 2, title: "Map Fields", isActive: currentStep === 2, isCompleted: currentStep > 2 },
    { id: 3, title: "Preview", isActive: currentStep === 3, isCompleted: currentStep > 3 },
  ];

  const encodingOptions = [
    "UTF-8 (Unicode)",
    "UTF-16 (Unicode)",
    "ISO-8859-1",
    "ISO-8859-2",
    "ISO-8859-9 (Turkish)",
    "GB2312 (Simplified Chinese)",
    "Big5 (Traditional Chinese)",
    "Shift_JIS (Japanese)",
  ];

  const fileOptions = [
    { label: "Attach From Desktop", value: "desktop" },
    { label: "Attach From Cloud", value: "cloud" },
    { label: "Attach From Documents", value: "documents" },
  ];

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
      setSelectedFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
    }
  };

  const handleFileOption = (option: string) => {
    setShowFileOptions(false);
    if (option === "desktop") {
      fileInputRef.current?.click();
    } else {
      // Handle cloud or documents options
      console.log("Selected option:", option);
    }
  };

  const downloadSampleCSV = () => {
    const csvContent = `Date,Description,Amount,Vendor,Account,Category,Payment Method,Reference,Notes,Billable,Customer,Project
2024-01-15,Office Supplies,150.00,Office Depot,Office Supplies,Office Supplies,Credit Card,REF001,Monthly office supplies,No,,
2024-01-16,Client Lunch,75.50,Restaurant ABC,Meals & Entertainment,Meals & Entertainment,Cash,REF002,Client meeting,Yes,ABC Corp,Project Alpha
2024-01-17,Software License,299.00,Software Inc,Software Subscriptions,Software & Subscriptions,Credit Card,REF003,Annual subscription,No,,`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'expenses_sample.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadSampleXLS = () => {
    // For demo purposes, we'll download a CSV file as XLS
    downloadSampleCSV();
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleCancel = () => {
    // Navigate back to expenses page
    window.location.href = '/dashboard/purchases/expenses';
  };

  const handleBulkExport = async () => {
    try {
      console.log('📤 Starting bulk export');
      const response = await fetch('/api/expenses/export', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `expenses_export_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Bulk export completed');
    } catch (error) {
      console.error('❌ Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses - Import & Export</h1>
          <p className="text-gray-600">Import your expense data from a file or export existing expenses</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleBulkExport}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <DocumentArrowDownIcon className="h-4 w-4" />
            <span>Export All Expenses</span>
          </button>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center space-x-8">
          {steps.map((step) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step.isActive
                    ? "bg-blue-600 text-white"
                    : step.isCompleted
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {step.isCompleted ? (
                  <CheckIcon className="h-4 w-4" />
                ) : (
                  step.id
                )}
              </div>
              <span
                className={`ml-2 text-sm font-medium ${
                  step.isActive ? "text-blue-600" : step.isCompleted ? "text-green-600" : "text-gray-500"
                }`}
              >
                {step.title}
              </span>
              {step.id < steps.length && (
                <ArrowRightIcon className="h-4 w-4 text-gray-400 mx-4" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Import Content */}
      <div className="bg-white rounded-lg border p-8">
        {/* File Upload Section */}
        <div className="space-y-6">
          {/* Drag and Drop Area */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
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
              accept=".csv,.tsv,.xls,.xlsx"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <CloudArrowUpIcon className="h-8 w-8 text-blue-600" />
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Drag and drop file to import
                </h3>
                <p className="text-gray-600">
                  Choose your file or drag it here
                </p>
              </div>
              
              <div className="flex items-center justify-center space-x-4">
                <div className="relative">
                  <button
                    onClick={() => setShowFileOptions(!showFileOptions)}
                    className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <span>Choose File</span>
                    <ChevronDownIcon className="h-4 w-4" />
                  </button>

                  {/* File Options Dropdown */}
                  {showFileOptions && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      <div className="py-2">
                        {fileOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => handleFileOption(option.value)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-sm text-gray-500">
                Maximum file size: 25 MB. Supported format: CSV or TSV or XLS
              </div>
            </div>
          </div>

          {/* Selected File Display */}
          {selectedFile && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <DocumentIcon className="h-8 w-8 text-green-600" />
                <div className="flex-1">
                  <h4 className="font-medium text-green-900">{selectedFile.name}</h4>
                  <p className="text-sm text-green-700">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-green-600 hover:text-green-800"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {/* Sample Files Download */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              Download a{" "}
              <button
                onClick={downloadSampleCSV}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                sample csv file
              </button>{" "}
              or{" "}
              <button
                onClick={downloadSampleXLS}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                sample xls file
              </button>{" "}
              and compare it to your import file to ensure you have the file perfect for the import.
            </p>
          </div>

          {/* Character Encoding */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">
                Character Encoding
              </label>
              <span className="text-gray-400">?</span>
            </div>
            
            <div className="relative">
              <select
                value={characterEncoding}
                onChange={(e) => setCharacterEncoding(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              >
                {encodingOptions.map((option) => (
                  <option key={option} value={option} style={{ color: '#111827' }}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Page Tips */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <div className="flex items-start space-x-3">
          <LightBulbIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-900 mb-3">Page Tips</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>
                • Import data with the details of GST Treatment by referring these{" "}
                <button className="text-blue-600 hover:text-blue-800 underline">
                  accepted formats
                </button>
                .
              </li>
              <li>
                • You can download the{" "}
                <button
                  onClick={downloadSampleXLS}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  sample xls file
                </button>{" "}
                to get detailed information about the data fields used while importing.
              </li>
              <li>
                • If you have files in other formats, you can convert it to an accepted file format using any online/offline converter.
              </li>
              <li>
                • You can configure your import settings and save them for future too!
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-4">
        <button
          onClick={handleCancel}
          className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          onClick={handleNext}
          disabled={!selectedFile}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <span>Next</span>
          <ArrowRightIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
