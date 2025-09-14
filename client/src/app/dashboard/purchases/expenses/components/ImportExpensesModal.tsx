"use client";

import React, { useState, useRef } from "react";
import {
  XMarkIcon,
  DocumentArrowUpIcon,
  DocumentIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

interface ImportExpensesModalProps {
  onClose: () => void;
  onSubmit: (file: File) => void;
}

export default function ImportExpensesModal({ onClose, onSubmit }: ImportExpensesModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importStep, setImportStep] = useState<'upload' | 'preview' | 'importing' | 'complete'>('upload');
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
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file);
        setImportStep('preview');
      } else {
        alert('Please select a CSV file');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file);
        setImportStep('preview');
      } else {
        alert('Please select a CSV file');
      }
    }
  };

  const handleImport = async () => {
    if (selectedFile) {
      setImportStep('importing');
      try {
        await onSubmit(selectedFile);
        setImportStep('complete');
        setTimeout(() => {
          onClose();
        }, 2000);
      } catch (error) {
        console.error('Import failed:', error);
        setImportStep('preview');
      }
    }
  };

  const downloadTemplate = () => {
    const csvContent = `Date,Description,Amount,Vendor,Account,Category,Payment Method,Reference,Notes,Billable,Customer,Project
2024-01-15,Office Supplies,150.00,Office Depot,Office Supplies,Office Supplies,Credit Card,REF001,Monthly office supplies,No,,
2024-01-16,Client Lunch,75.50,Restaurant ABC,Meals & Entertainment,Meals & Entertainment,Cash,REF002,Client meeting,Yes,ABC Corp,Project Alpha
2024-01-17,Software License,299.00,Software Inc,Software Subscriptions,Software & Subscriptions,Credit Card,REF003,Annual subscription,No,,`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'expenses_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Import Expenses</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {importStep === 'upload' && (
            <div className="space-y-6">
              {/* Upload Area */}
              <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <DocumentArrowUpIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Drop your CSV file here
                    </h3>
                    <p className="text-gray-600 mt-1">
                      or click to browse and select a file
                    </p>
                  </div>
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Choose File
                  </button>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Import Instructions</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Use the CSV template format for best results</li>
                  <li>• Required fields: Date, Description, Amount, Vendor, Account</li>
                  <li>• Date format: YYYY-MM-DD</li>
                  <li>• Amount should be numeric (e.g., 150.00)</li>
                  <li>• Billable field: Yes/No or True/False</li>
                </ul>
              </div>

              {/* Download Template */}
              <div className="flex items-center justify-between bg-blue-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <DocumentIcon className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Need a template?</p>
                    <p className="text-xs text-blue-700">Download our CSV template to get started</p>
                  </div>
                </div>
                <button
                  onClick={downloadTemplate}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Download Template
                </button>
              </div>
            </div>
          )}

          {importStep === 'preview' && selectedFile && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">File Ready for Import</h3>
                  <p className="text-sm text-gray-600">{selectedFile.name}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Preview (First 3 rows)</h4>
                <div className="text-sm text-gray-600 font-mono bg-white p-3 rounded border overflow-x-auto">
                  Date,Description,Amount,Vendor,Account,Category,Payment Method,Reference,Notes,Billable,Customer,Project
                  <br />
                  2024-01-15,Office Supplies,150.00,Office Depot,Office Supplies,Office Supplies,Credit Card,REF001,Monthly office supplies,No,,
                  <br />
                  2024-01-16,Client Lunch,75.50,Restaurant ABC,Meals & Entertainment,Meals & Entertainment,Cash,REF002,Client meeting,Yes,ABC Corp,Project Alpha
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setImportStep('upload')}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Back
                </button>
                <button
                  onClick={handleImport}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Import Expenses
                </button>
              </div>
            </div>
          )}

          {importStep === 'importing' && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Importing Expenses</h3>
              <p className="text-gray-600">Please wait while we process your file...</p>
            </div>
          )}

          {importStep === 'complete' && (
            <div className="text-center py-8">
              <CheckCircleIcon className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Import Complete!</h3>
              <p className="text-gray-600">Your expenses have been successfully imported.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
