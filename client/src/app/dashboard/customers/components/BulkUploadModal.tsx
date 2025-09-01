"use client";

import { useState, useRef } from "react";
import {
  XMarkIcon,
  ArrowUpTrayIcon,
  DocumentArrowDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface UploadResult {
  success: boolean;
  data?: {
    summary: {
      totalRows: number;
      validCustomers: number;
      created: number;
      updated: number;
      skipped: number;
      errors: number;
    };
    errors?: string[];
  };
  message?: string;
  error?: string;
}

interface PreviewData {
  totalRows: number;
  validCustomers: number;
  invalidCustomers: number;
  duplicatesFound: number;
  preview: Array<{
    rowNumber: number;
    customerData: any;
    errors: string[];
    isValid: boolean;
  }>;
  validationErrors: string[];
  duplicates: Array<{
    type: string;
    value: string;
    rows: number[];
    message: string;
  }>;
  canProceed: boolean;
}

export default function BulkUploadModal({
  isOpen,
  onClose,
  onSuccess,
}: BulkUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [uploadOptions, setUploadOptions] = useState({
    skipDuplicates: false,
    updateExisting: false,
    ignoreErrors: false,
  });
  const [currentStep, setCurrentStep] = useState<
    "select" | "preview" | "options" | "result"
  >("select");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewData(null);
      setUploadResult(null);
      setCurrentStep("select");
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewData(null);
      setUploadResult(null);
      setCurrentStep("select");
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/customers/download-template`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "customer_upload_template.xlsx";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error("Failed to download template");
      }
    } catch (error) {
      console.error("Error downloading template:", error);
    }
  };

  const previewFile = async () => {
    if (!selectedFile) return;

    setPreviewing(true);
    const formData = new FormData();
    formData.append("excel", selectedFile);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/customers/preview-excel`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const result = await response.json();

      if (response.ok) {
        setPreviewData(result.data);
        setCurrentStep(result.data.canProceed ? "preview" : "options");
      } else {
        console.error("Preview failed:", result.message);
        setUploadResult({
          success: false,
          message: result.message || "Failed to preview file",
        });
        setCurrentStep("result");
      }
    } catch (error) {
      console.error("Error previewing file:", error);
      setUploadResult({
        success: false,
        message: "Failed to preview file",
      });
      setCurrentStep("result");
    } finally {
      setPreviewing(false);
    }
  };

  const uploadFile = async () => {
    if (!selectedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("excel", selectedFile);
    formData.append("skipDuplicates", uploadOptions.skipDuplicates.toString());
    formData.append("updateExisting", uploadOptions.updateExisting.toString());
    formData.append("ignoreErrors", uploadOptions.ignoreErrors.toString());

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/customers/bulk-upload`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const result = await response.json();
      setUploadResult(result);
      setCurrentStep("result");

      if (result.success) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadResult({
        success: false,
        message: "Failed to upload file",
      });
      setCurrentStep("result");
    } finally {
      setUploading(false);
    }
  };

  const resetModal = () => {
    setSelectedFile(null);
    setPreviewData(null);
    setUploadResult(null);
    setCurrentStep("select");
    setUploadOptions({
      skipDuplicates: false,
      updateExisting: false,
      ignoreErrors: false,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Bulk Upload Customers
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-4">
              <div
                className={`flex items-center ${
                  currentStep === "select"
                    ? "text-blue-600"
                    : currentStep === "preview" ||
                      currentStep === "options" ||
                      currentStep === "result"
                    ? "text-green-600"
                    : "text-gray-400"
                }`}
              >
                <span className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-current">
                  1
                </span>
                <span className="ml-2">Select File</span>
              </div>
              <div
                className={`h-0.5 w-16 ${
                  currentStep === "preview" ||
                  currentStep === "options" ||
                  currentStep === "result"
                    ? "bg-green-600"
                    : "bg-gray-300"
                }`}
              ></div>
              <div
                className={`flex items-center ${
                  currentStep === "preview" || currentStep === "options"
                    ? "text-blue-600"
                    : currentStep === "result"
                    ? "text-green-600"
                    : "text-gray-400"
                }`}
              >
                <span className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-current">
                  2
                </span>
                <span className="ml-2">Preview</span>
              </div>
              <div
                className={`h-0.5 w-16 ${
                  currentStep === "result" ? "bg-green-600" : "bg-gray-300"
                }`}
              ></div>
              <div
                className={`flex items-center ${
                  currentStep === "result" ? "text-green-600" : "text-gray-400"
                }`}
              >
                <span className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-current">
                  3
                </span>
                <span className="ml-2">Upload</span>
              </div>
            </div>
          </div>

          {/* Step 1: File Selection */}
          {currentStep === "select" && (
            <div className="space-y-6">
              {/* Download Template */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-blue-900 mb-2">
                      Get Started
                    </h3>
                    <p className="text-sm text-blue-700 mb-3">
                      Download our Excel template to ensure your data is
                      formatted correctly.
                    </p>
                    <button
                      onClick={downloadTemplate}
                      className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                      Download Template
                    </button>
                  </div>
                </div>
              </div>

              {/* File Upload Area */}
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <ArrowUpTrayIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-600 mb-2">
                  Drop your Excel file here
                </p>
                <p className="text-sm text-gray-500 mb-4">or click to browse</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Choose File
                </button>
              </div>

              {selectedFile && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {selectedFile.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      onClick={previewFile}
                      disabled={previewing}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      {previewing ? "Analyzing..." : "Preview & Continue"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Preview */}
          {(currentStep === "preview" || currentStep === "options") &&
            previewData && (
              <div className="space-y-6">
                {/* Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-600 font-medium">
                      Total Rows
                    </p>
                    <p className="text-2xl font-bold text-blue-900">
                      {previewData.totalRows}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-600 font-medium">Valid</p>
                    <p className="text-2xl font-bold text-green-900">
                      {previewData.validCustomers}
                    </p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-sm text-red-600 font-medium">Invalid</p>
                    <p className="text-2xl font-bold text-red-900">
                      {previewData.invalidCustomers}
                    </p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-sm text-yellow-600 font-medium">
                      Duplicates
                    </p>
                    <p className="text-2xl font-bold text-yellow-900">
                      {previewData.duplicatesFound}
                    </p>
                  </div>
                </div>

                {/* Validation Errors */}
                {previewData.validationErrors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-red-900 mb-2">
                          Validation Errors (
                          {previewData.validationErrors.length})
                        </h3>
                        <div className="max-h-32 overflow-y-auto">
                          {previewData.validationErrors
                            .slice(0, 10)
                            .map((error, index) => (
                              <p
                                key={index}
                                className="text-sm text-red-700 mb-1"
                              >
                                {error}
                              </p>
                            ))}
                          {previewData.validationErrors.length > 10 && (
                            <p className="text-sm text-red-700 font-medium">
                              ... and {previewData.validationErrors.length - 10}{" "}
                              more errors
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Duplicates */}
                {previewData.duplicates.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-yellow-900 mb-2">
                          Duplicate Entries ({previewData.duplicates.length})
                        </h3>
                        <div className="max-h-32 overflow-y-auto">
                          {previewData.duplicates
                            .slice(0, 5)
                            .map((duplicate, index) => (
                              <p
                                key={index}
                                className="text-sm text-yellow-700 mb-1"
                              >
                                {duplicate.message}
                              </p>
                            ))}
                          {previewData.duplicates.length > 5 && (
                            <p className="text-sm text-yellow-700 font-medium">
                              ... and {previewData.duplicates.length - 5} more
                              duplicates
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Upload Options */}
                {!previewData.canProceed && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">
                      Upload Options
                    </h3>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={uploadOptions.skipDuplicates}
                          onChange={(e) =>
                            setUploadOptions({
                              ...uploadOptions,
                              skipDuplicates: e.target.checked,
                            })
                          }
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">
                          Skip duplicate entries
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={uploadOptions.updateExisting}
                          onChange={(e) =>
                            setUploadOptions({
                              ...uploadOptions,
                              updateExisting: e.target.checked,
                            })
                          }
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">
                          Update existing customers
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={uploadOptions.ignoreErrors}
                          onChange={(e) =>
                            setUploadOptions({
                              ...uploadOptions,
                              ignoreErrors: e.target.checked,
                            })
                          }
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">
                          Ignore validation errors and proceed
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Sample Data Preview */}
                {previewData.preview.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                      <h3 className="text-sm font-medium text-gray-900">
                        Data Preview (First 5 rows)
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Row
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Name
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Email
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Type
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {previewData.preview.slice(0, 5).map((row, index) => (
                            <tr
                              key={index}
                              className={row.isValid ? "" : "bg-red-50"}
                            >
                              <td className="px-3 py-2 text-sm text-gray-900">
                                {row.rowNumber}
                              </td>
                              <td className="px-3 py-2 text-sm text-gray-900">
                                {row.customerData.firstName}{" "}
                                {row.customerData.lastName}
                              </td>
                              <td className="px-3 py-2 text-sm text-gray-900">
                                {row.customerData.email}
                              </td>
                              <td className="px-3 py-2 text-sm text-gray-900">
                                {row.customerData.customerType}
                              </td>
                              <td className="px-3 py-2 text-sm">
                                {row.isValid ? (
                                  <span className="text-green-600 font-medium">
                                    Valid
                                  </span>
                                ) : (
                                  <span className="text-red-600 font-medium">
                                    {row.errors.length} error(s)
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

          {/* Step 3: Results */}
          {currentStep === "result" && uploadResult && (
            <div className="space-y-6">
              {uploadResult.success ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-8 w-8 text-green-600 mr-3" />
                    <div>
                      <h3 className="text-lg font-medium text-green-900">
                        Upload Successful!
                      </h3>
                      <p className="text-sm text-green-700 mt-1">
                        Your customers have been uploaded successfully.
                      </p>
                    </div>
                  </div>

                  {uploadResult.data?.summary && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white p-3 rounded border">
                        <p className="text-sm text-gray-600">Created</p>
                        <p className="text-xl font-bold text-green-600">
                          {uploadResult.data.summary.created}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <p className="text-sm text-gray-600">Updated</p>
                        <p className="text-xl font-bold text-blue-600">
                          {uploadResult.data.summary.updated}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <p className="text-sm text-gray-600">Skipped</p>
                        <p className="text-xl font-bold text-yellow-600">
                          {uploadResult.data.summary.skipped}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <p className="text-sm text-gray-600">Errors</p>
                        <p className="text-xl font-bold text-red-600">
                          {uploadResult.data.summary.errors}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="h-8 w-8 text-red-600 mr-3" />
                    <div>
                      <h3 className="text-lg font-medium text-red-900">
                        Upload Failed
                      </h3>
                      <p className="text-sm text-red-700 mt-1">
                        {uploadResult.message || uploadResult.error}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {uploadResult.data?.errors &&
                uploadResult.data.errors.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-yellow-900 mb-2">
                      Processing Errors ({uploadResult.data.errors.length})
                    </h3>
                    <div className="max-h-40 overflow-y-auto">
                      {uploadResult.data.errors.map((error, index) => (
                        <p key={index} className="text-sm text-yellow-700 mb-1">
                          {error}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            {currentStep === "result" ? "Close" : "Cancel"}
          </button>

          <div className="flex space-x-3">
            {currentStep === "select" && selectedFile && (
              <button
                onClick={previewFile}
                disabled={previewing}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {previewing ? "Analyzing..." : "Preview File"}
              </button>
            )}

            {(currentStep === "preview" || currentStep === "options") && (
              <>
                <button
                  onClick={() => setCurrentStep("select")}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={uploadFile}
                  disabled={
                    uploading ||
                    (!previewData?.canProceed &&
                      !uploadOptions.skipDuplicates &&
                      !uploadOptions.updateExisting &&
                      !uploadOptions.ignoreErrors)
                  }
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {uploading ? "Uploading..." : "Upload Customers"}
                </button>
              </>
            )}

            {currentStep === "result" && uploadResult?.success && (
              <button
                onClick={resetModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Upload Another File
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
