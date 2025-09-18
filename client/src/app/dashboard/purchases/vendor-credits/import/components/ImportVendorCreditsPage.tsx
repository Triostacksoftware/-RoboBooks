"use client";

import React, { useState } from 'react';
import { ArrowLeftIcon, DocumentArrowUpIcon, CheckIcon } from '@heroicons/react/24/outline';

export default function ImportVendorCreditsPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    // Simulate upload process
    setTimeout(() => {
      setIsUploading(false);
      setUploadSuccess(true);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => window.history.back()}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Vendor Credits
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Import Vendor Credits</h1>
            <p className="text-gray-600">Import vendor credit data from Excel or CSV files</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Upload Vendor Credit Data</h2>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Upload your vendor credit file</h3>
            <p className="text-gray-600 mb-4">
              Supported formats: Excel (.xlsx, .xls) or CSV (.csv)
            </p>
            
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
            >
              Choose File
            </label>
          </div>

          {isUploading && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
                <span className="text-blue-800">Uploading and processing file...</span>
              </div>
            </div>
          )}

          {uploadSuccess && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <CheckIcon className="h-5 w-5 text-green-600 mr-3" />
                <span className="text-green-800">Vendor credits imported successfully!</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
