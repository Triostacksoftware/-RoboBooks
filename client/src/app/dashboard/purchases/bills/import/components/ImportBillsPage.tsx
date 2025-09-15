"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, DocumentArrowUpIcon } from "@heroicons/react/24/outline";

export default function ImportBillsPage() {
  const router = useRouter();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.type === "text/csv" || file.type === "application/vnd.ms-excel" || file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
      setSelectedFile(file);
      setError(null);
    } else {
      setError("Please select a valid CSV or Excel file");
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/bills/import", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to import bills");
      }

      const result = await response.json();
      alert(`Successfully imported ${result.count} bills`);
      router.push("/dashboard/purchases/bills");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Bills
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Import Bills</h1>
        <p className="text-gray-600 mt-2">
          Upload a CSV or Excel file to import multiple bills at once
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <DocumentArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Drop your file here
          </h3>
          <p className="text-gray-600 mb-4">
            or click to browse and select a file
          </p>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileInput}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
          >
            Choose File
          </label>
        </div>

        {selectedFile && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <DocumentArrowUpIcon className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-green-800 font-medium">
                {selectedFile.name}
              </span>
              <span className="text-green-600 ml-2">
                ({(selectedFile.size / 1024).toFixed(1)} KB)
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!selectedFile || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Importing..." : "Import Bills"}
          </button>
        </div>
      </div>

      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          File Format Requirements
        </h3>
        <div className="space-y-3 text-sm text-gray-600">
          <p>
            <strong>Supported formats:</strong> CSV, Excel (.xlsx, .xls)
          </p>
          <p>
            <strong>Required columns:</strong> Vendor Name, Amount, Date, Description
          </p>
          <p>
            <strong>Optional columns:</strong> Reference, Notes, Due Date
          </p>
          <p>
            <strong>Date format:</strong> YYYY-MM-DD or MM/DD/YYYY
          </p>
        </div>
      </div>
    </div>
  );
}
