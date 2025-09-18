"use client";

import { useState, useRef } from "react";
import { XMarkIcon, DocumentArrowUpIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { recurringExpenseService, RecurringExpense } from "@/services/recurringExpenseService";

interface ImportRecurringExpensesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (expenses: RecurringExpense[]) => void;
}

export default function ImportRecurringExpensesModal({
  isOpen,
  onClose,
  onImportSuccess,
}: ImportRecurringExpensesModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [importedCount, setImportedCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        setErrorMessage(null);
        setUploadStatus('idle');
      } else {
        setErrorMessage('Please select a CSV file');
        setFile(null);
      }
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      if (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
        setErrorMessage(null);
        setUploadStatus('idle');
      } else {
        setErrorMessage('Please select a CSV file');
        setFile(null);
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleImport = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadStatus('uploading');
    setUploadProgress(0);
    setErrorMessage(null);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const importedExpenses = await recurringExpenseService.importRecurringExpenses(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadStatus('success');
      setImportedCount(importedExpenses.length);
      
      // Call success callback after a short delay
      setTimeout(() => {
        onImportSuccess(importedExpenses);
        handleClose();
      }, 1500);

    } catch (error) {
      console.error('Import error:', error);
      setUploadStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to import recurring expenses');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setUploadProgress(0);
    setUploadStatus('idle');
    setErrorMessage(null);
    setImportedCount(0);
    onClose();
  };

  const downloadTemplate = () => {
    const templateData = [
      ['Name', 'Description', 'Amount', 'Frequency', 'Category', 'Vendor', 'Next Due', 'Status'],
      ['Office Rent', 'Monthly office space rental', '2500', 'monthly', 'Rent', 'ABC Properties', '2024-02-01', 'Active'],
      ['Internet Service', 'Monthly internet subscription', '99', 'monthly', 'Utilities', 'TechCom', '2024-02-15', 'Active']
    ];

    const csvContent = templateData.map(row => row.map(field => `"${field}"`).join(',')).join('\n');
    recurringExpenseService.downloadCSV(csvContent, 'recurring-expenses-template.csv');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Import Recurring Expenses</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {uploadStatus === 'success' ? (
            <div className="text-center">
              <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Import Successful!</h4>
              <p className="text-gray-600 mb-4">
                Successfully imported {importedCount} recurring expense{importedCount !== 1 ? 's' : ''}.
              </p>
            </div>
          ) : (
            <>
              {/* Instructions */}
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-4">
                  Upload a CSV file to import recurring expenses. Make sure your file follows the correct format.
                </p>
                <button
                  onClick={downloadTemplate}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Download CSV Template
                </button>
              </div>

              {/* File Upload Area */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  file
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {file ? (
                  <div className="space-y-2">
                    <DocumentArrowUpIcon className="h-12 w-12 text-green-500 mx-auto" />
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <DocumentArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto" />
                    <div className="text-sm text-gray-600">
                      <p className="font-medium">Drop your CSV file here</p>
                      <p>or</p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        browse files
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Error Message */}
              {errorMessage && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{errorMessage}</p>
                </div>
              )}

              {/* Upload Progress */}
              {uploadStatus === 'uploading' && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {uploadStatus !== 'success' && (
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={!file || isUploading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Importing...' : 'Import Recurring Expenses'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
