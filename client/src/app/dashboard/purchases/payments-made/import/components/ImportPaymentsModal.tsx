"use client";

import React, { useState } from 'react';
import { XMarkIcon, DocumentArrowUpIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { paymentService } from '@/services/paymentService';

interface ImportPaymentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (payments: any[]) => void;
}

export default function ImportPaymentsModal({ isOpen, onClose, onImportSuccess }: ImportPaymentsModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importResults, setImportResults] = useState<{
    success: boolean;
    message: string;
    data: any[];
    errors: string[];
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImportResults(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await paymentService.importPayments(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      setImportResults({
        success: true,
        message: `Successfully imported ${result.length} payments`,
        data: result,
        errors: []
      });

      onImportSuccess(result);
    } catch (error) {
      console.error('Import error:', error);
      setImportResults({
        success: false,
        message: 'Failed to import payments',
        data: [],
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setUploadProgress(0);
    setImportResults(null);
    onClose();
  };

  const downloadTemplate = () => {
    const templateData = [
      ['Vendor Name', 'Payment Date', 'Amount', 'Currency', 'Payment Method', 'Reference', 'Notes'],
      ['ABC Corporation', '2024-01-20', '1000.00', 'INR', 'bank_transfer', 'TXN123456789', 'Payment for office supplies'],
      ['XYZ Suppliers', '2024-01-21', '2500.00', 'INR', 'upi', 'UPI123456789', 'Payment for equipment']
    ];

    const csvContent = templateData.map(row => 
      row.map(field => `"${field}"`).join(',')
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'payments_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Import Payments</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {!importResults ? (
            <>
              <div className="text-center">
                <DocumentArrowUpIcon className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Upload CSV File</h4>
                <p className="text-sm text-gray-500 mb-4">
                  Upload a CSV file with your payments data. Make sure the file follows the correct format.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select CSV File
                  </label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={downloadTemplate}
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    Download Template
                  </button>
                  <div className="text-xs text-gray-500">
                    Max file size: 10MB
                  </div>
                </div>
              </div>

              {file && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      onClick={() => setFile(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Uploading...</span>
                    <span className="text-gray-600">{uploadProgress}%</span>
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
          ) : (
            <div className="text-center">
              <CheckCircleIcon className={`h-12 w-12 mx-auto mb-4 ${
                importResults.success ? 'text-green-500' : 'text-red-500'
              }`} />
              <h4 className={`text-lg font-medium mb-2 ${
                importResults.success ? 'text-green-900' : 'text-red-900'
              }`}>
                {importResults.success ? 'Import Successful' : 'Import Failed'}
              </h4>
              <p className={`text-sm mb-4 ${
                importResults.success ? 'text-green-700' : 'text-red-700'
              }`}>
                {importResults.message}
              </p>
              
              {importResults.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <h5 className="text-sm font-medium text-red-800 mb-2">Errors:</h5>
                  <ul className="text-xs text-red-700 space-y-1">
                    {importResults.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {importResults.success && importResults.data.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-green-800">
                    Successfully imported {importResults.data.length} payments.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex space-x-3">
            {!importResults ? (
              <>
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={!file || isUploading}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? 'Importing...' : 'Import Payments'}
                </button>
              </>
            ) : (
              <button
                onClick={handleClose}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
