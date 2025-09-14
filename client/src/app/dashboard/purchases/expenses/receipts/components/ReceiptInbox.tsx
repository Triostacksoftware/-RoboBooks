"use client";

import React, { useState, useRef } from "react";
import {
  CloudArrowUpIcon,
  DocumentArrowUpIcon,
  CheckIcon,
  XMarkIcon,
  DocumentIcon,
  EnvelopeIcon,
  ArrowPathIcon,
  EyeIcon,
  TrashIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

interface ReceiptDocument {
  id: string;
  filename: string;
  type: 'image' | 'pdf' | 'doc' | 'sheet';
  size: number;
  uploadedAt: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  extractedData?: {
    vendor?: string;
    amount?: number;
    date?: string;
    description?: string;
  };
  previewUrl?: string;
}

export default function ReceiptInbox() {
  const [documents, setDocuments] = useState<ReceiptDocument[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(true);
  const [autoscanEnabled, setAutoscanEnabled] = useState(false);
  const [availableAutoscans, setAvailableAutoscans] = useState(2);
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
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    const newDocuments: ReceiptDocument[] = files.map((file, index) => ({
      id: Date.now().toString() + index,
      filename: file.name,
      type: getFileType(file.type),
      size: file.size,
      uploadedAt: new Date().toISOString(),
      status: 'pending',
      previewUrl: URL.createObjectURL(file)
    }));

    setDocuments(prev => [...prev, ...newDocuments]);

    // Simulate processing
    newDocuments.forEach(doc => {
      setTimeout(() => {
        setDocuments(prev => prev.map(d => 
          d.id === doc.id 
            ? { ...d, status: 'processing' }
            : d
        ));
      }, 1000);

      setTimeout(() => {
        setDocuments(prev => prev.map(d => 
          d.id === doc.id 
            ? { 
                ...d, 
                status: 'completed',
                extractedData: {
                  vendor: 'Sample Vendor',
                  amount: Math.random() * 1000 + 100,
                  date: new Date().toISOString().split('T')[0],
                  description: 'Sample expense description'
                }
              }
            : d
        ));
      }, 3000);
    });
  };

  const getFileType = (mimeType: string): 'image' | 'pdf' | 'doc' | 'sheet' => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'doc';
    return 'sheet';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <DocumentIcon className="h-8 w-8 text-blue-500" />;
      case 'pdf':
        // Fallback to DocumentIcon since DocumentTextIcon is not defined/imported
        return <DocumentIcon className="h-8 w-8 text-red-500" />;
      case 'doc':
        return <DocumentIcon className="h-8 w-8 text-blue-600" />;
      case 'sheet':
        return <DocumentIcon className="h-8 w-8 text-green-500" />;
      default:
        return <DocumentIcon className="h-8 w-8 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />;
      case 'processing':
        return <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />;
      case 'completed':
        return <CheckIcon className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XMarkIcon className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-white rounded-lg border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button 
              onClick={() => window.location.href = '/dashboard/purchases/expenses'}
              className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm"
            >
              Expenses
            </button>
            <button className="py-4 px-1 border-b-2 border-blue-500 text-blue-600 font-medium text-sm">
              Receipts Inbox
            </button>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Receipts Inbox</h1>
          <p className="text-gray-600">Upload and process your expense documents</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Available Autoscans: {availableAutoscans}
          </div>
        </div>
      </div>

      {/* Permission Modal */}
      {showPermissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Cog6ToothIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Enable Autoscan</h3>
                <p className="text-sm text-gray-600">Allow automatic data extraction from your documents</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">What Autoscan does:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Automatically extracts vendor, amount, and date from receipts</li>
                  <li>• Reduces manual data entry by up to 80%</li>
                  <li>• Supports 15+ languages</li>
                  <li>• Works with images, PDFs, and documents</li>
                </ul>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="enableAutoscan"
                  checked={autoscanEnabled}
                  onChange={(e) => setAutoscanEnabled(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="enableAutoscan" className="text-sm font-medium text-gray-700">
                  I agree to enable Autoscan for automatic data extraction
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowPermissionModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Skip for now
              </button>
              <button
                onClick={() => {
                  setShowPermissionModal(false);
                  setAvailableAutoscans(5); // Give some free scans
                }}
                disabled={!autoscanEnabled}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Enable Autoscan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="space-y-8">
        {/* Upload Area */}
        <div className="bg-white rounded-lg border p-8">
          <div
            className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
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
              multiple
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <CloudArrowUpIcon className="h-8 w-8 text-orange-500" />
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Drag & Drop Files Here
                </h3>
                <p className="text-gray-600">
                  Upload your documents (Images, PDF, Docs or Sheets) here
                </p>
              </div>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Choose files to upload
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Autoscan Section */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DocumentIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Advanced Autoscan</h3>
                <p className="text-gray-600">
                  Introducing Advanced Autoscan with improved accuracy and faster scanning time.
                </p>
                <ul className="text-sm text-gray-600 mt-2 space-y-1">
                  <li>• Fast extraction of line item information and increased accuracy.</li>
                  <li>• Autoscanning of documents in 15 languages (English, Swedish, Spanish, Portuguese, Dutch, Italian, French, German, Danish, Chinese, Norwegian Bokmal, Russian, Malay, Thai, and Vietnamese).</li>
                </ul>
              </div>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
              Buy Now
            </button>
          </div>
        </div>

        {/* Key Features Section */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">
            Key Features of Document
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Auto Scan Feature */}
            <div className="text-center p-6 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DocumentIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Auto scan</h4>
              <p className="text-gray-600">Enable auto-scan to automatically capture data</p>
            </div>

            {/* Mail-In Feature */}
            <div className="text-center p-6 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <EnvelopeIcon className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Mail-In</h4>
              <p className="text-gray-600">Have your clients directly mail documents to your account</p>
            </div>

            {/* Convert Feature */}
            <div className="text-center p-6 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowPathIcon className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Convert</h4>
              <p className="text-gray-600">Convert scanned documents into transactions</p>
            </div>
          </div>
        </div>

        {/* Uploaded Documents */}
        {documents.length > 0 && (
          <div className="bg-white rounded-lg border">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Uploaded Documents ({documents.length})
              </h3>
            </div>
            
            <div className="divide-y divide-gray-200">
              {documents.map((doc) => (
                <div key={doc.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getFileIcon(doc.type)}
                      <div>
                        <h4 className="font-medium text-gray-900">{doc.filename}</h4>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(doc.size)} • {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                        {doc.extractedData && (
                          <div className="mt-2 text-sm text-gray-600">
                            <span className="font-medium">Vendor:</span> {doc.extractedData.vendor} • 
                            <span className="font-medium ml-2">Amount:</span> ₹{doc.extractedData.amount?.toFixed(2)} • 
                            <span className="font-medium ml-2">Date:</span> {doc.extractedData.date}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(doc.status)}
                        <span className="text-sm text-gray-600 capitalize">{doc.status}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600">
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
