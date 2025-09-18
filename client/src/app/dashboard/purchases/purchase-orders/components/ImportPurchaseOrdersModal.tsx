"use client";

import React, { useState, useRef } from 'react';
import { XMarkIcon, DocumentArrowUpIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { purchaseOrderService } from '@/services/purchaseOrderService';

interface ImportPurchaseOrdersModalProps {
  onClose: () => void;
  onSubmit: (file: File) => void;
}

export default function ImportPurchaseOrdersModal({ onClose, onSubmit }: ImportPurchaseOrdersModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Please select a valid CSV file');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a file to import');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      await onSubmit(file);
      onClose();
    } catch (err) {
      setError('Failed to import purchase orders. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      ['PO Number', 'Vendor Name', 'Order Date', 'Expected Delivery Date', 'Status', 'Total Amount', 'Currency'],
      ['PO-2024-001', 'ABC Corporation', '2024-01-15', '2024-01-25', 'sent', '1180.00', 'INR'],
      ['PO-2024-002', 'XYZ Suppliers', '2024-01-16', '2024-01-30', 'draft', '2950.00', 'INR']
    ];

    const csvContent = templateData.map(row => 
      row.map(field => `"${field}"`).join(',')
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'purchase-orders_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Import Purchase Orders</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Instructions */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Import Instructions</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Use the CSV template format</li>
              <li>• Include all required fields</li>
              <li>• Ensure data is properly formatted</li>
              <li>• Maximum file size: 10MB</li>
            </ul>
          </div>

          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragging
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <DocumentArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-600 mb-2">
              Drag and drop your CSV file here, or
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              browse to select
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>

          {/* Selected File */}
          {file && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <DocumentArrowUpIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-900">{file.name}</span>
                </div>
                <span className="text-xs text-gray-500">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* Template Download */}
          <div className="mt-4">
            <button
              onClick={downloadTemplate}
              className="text-sm text-blue-600 hover:text-blue-700 underline"
            >
              Download CSV template
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!file || isUploading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Importing...' : 'Import Purchase Orders'}
          </button>
        </div>
      </div>
    </div>
  );
}
