"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  CloudArrowUpIcon,
  DocumentArrowDownIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

export default function ImportRecurringExpensesPage() {
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
      const file = e.dataTransfer.files[0];
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        setSelectedFile(file);
        setError(null);
      } else {
        setError("Please select a CSV file");
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        setSelectedFile(file);
        setError(null);
      } else {
        setError("Please select a CSV file");
      }
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/recurring-expenses/import", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to import recurring expenses");
      }

      const event = new CustomEvent("showToast", {
        detail: {
          message: "Recurring expenses imported successfully!",
          type: "success",
        },
      });
      window.dispatchEvent(event);
      router.push("/dashboard/purchases/recurring-expenses");
    } catch (err: any) {
      console.error("Error importing recurring expenses:", err);
      setError(err.message || "Failed to import recurring expenses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `name,description,amount,frequency,startDate,endDate,category,vendor,account,isActive,totalOccurrences
Office Rent,Monthly office rent payment,5000,monthly,2024-01-01,,Rent,Landlord,Rent Expense,true,12
Software Subscription,Monthly software license,100,monthly,2024-01-01,,Software Subscriptions,Software Company,Software Expense,true,
Internet Bill,Monthly internet service,80,monthly,2024-01-01,,Utilities,ISP Company,Utilities Expense,true,
Office Supplies,Monthly office supplies,200,monthly,2024-01-01,,Office Supplies,Supply Store,Office Expenses,true,`;

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "recurring-expenses-template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push("/dashboard/purchases/recurring-expenses")}
          className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Recurring Expenses
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Import Recurring Expenses</h1>
        <p className="text-gray-600 mt-2">
          Import recurring expenses from a CSV file to quickly set up your recurring payments.
        </p>
      </div>

      <div className="space-y-6">
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-start">
            <InformationCircleIcon className="h-5 w-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Import Instructions:</p>
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li>Download the CSV template to see the required format</li>
                <li>Fill in your recurring expense data following the template</li>
                <li>Upload the completed CSV file</li>
                <li>Review and confirm the import</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Template Download */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Step 1: Download Template</h3>
          <p className="text-gray-600 mb-4">
            Download our CSV template to ensure your data is formatted correctly.
          </p>
          <button
            onClick={downloadTemplate}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
          >
            <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
            Download CSV Template
          </button>
        </div>

        {/* File Upload */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Step 2: Upload CSV File</h3>
          
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center ${
              dragActive
                ? "border-blue-400 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".csv"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            {selectedFile ? (
              <div className="space-y-2">
                <CloudArrowUpIcon className="mx-auto h-12 w-12 text-green-500" />
                <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="text-sm text-gray-600">
                  <p className="font-medium">Click to upload or drag and drop</p>
                  <p>CSV file only</p>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Import Button */}
        {selectedFile && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Step 3: Import Data</h3>
            <p className="text-gray-600 mb-4">
              Ready to import {selectedFile.name}? This will create new recurring expenses in your system.
            </p>
            <button
              onClick={handleImport}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Importing...
                </>
              ) : (
                <>
                  <CloudArrowUpIcon className="h-4 w-4 mr-2" />
                  Import Recurring Expenses
                </>
              )}
            </button>
          </div>
        )}

        {/* CSV Format Info */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">CSV Format Requirements</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-medium text-gray-900">Column</th>
                  <th className="text-left py-2 font-medium text-gray-900">Required</th>
                  <th className="text-left py-2 font-medium text-gray-900">Description</th>
                  <th className="text-left py-2 font-medium text-gray-900">Example</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-2 font-mono text-gray-700">name</td>
                  <td className="py-2 text-red-600">Yes</td>
                  <td className="py-2 text-gray-600">Recurring expense name</td>
                  <td className="py-2 text-gray-500">Office Rent</td>
                </tr>
                <tr>
                  <td className="py-2 font-mono text-gray-700">amount</td>
                  <td className="py-2 text-red-600">Yes</td>
                  <td className="py-2 text-gray-600">Amount (numeric)</td>
                  <td className="py-2 text-gray-500">5000</td>
                </tr>
                <tr>
                  <td className="py-2 font-mono text-gray-700">frequency</td>
                  <td className="py-2 text-red-600">Yes</td>
                  <td className="py-2 text-gray-600">daily, weekly, monthly, quarterly, yearly</td>
                  <td className="py-2 text-gray-500">monthly</td>
                </tr>
                <tr>
                  <td className="py-2 font-mono text-gray-700">startDate</td>
                  <td className="py-2 text-red-600">Yes</td>
                  <td className="py-2 text-gray-600">Start date (YYYY-MM-DD)</td>
                  <td className="py-2 text-gray-500">2024-01-01</td>
                </tr>
                <tr>
                  <td className="py-2 font-mono text-gray-700">category</td>
                  <td className="py-2 text-red-600">Yes</td>
                  <td className="py-2 text-gray-600">Expense category</td>
                  <td className="py-2 text-gray-500">Rent</td>
                </tr>
                <tr>
                  <td className="py-2 font-mono text-gray-700">account</td>
                  <td className="py-2 text-red-600">Yes</td>
                  <td className="py-2 text-gray-600">Account name</td>
                  <td className="py-2 text-gray-500">Rent Expense</td>
                </tr>
                <tr>
                  <td className="py-2 font-mono text-gray-700">description</td>
                  <td className="py-2 text-gray-500">No</td>
                  <td className="py-2 text-gray-600">Description</td>
                  <td className="py-2 text-gray-500">Monthly office rent</td>
                </tr>
                <tr>
                  <td className="py-2 font-mono text-gray-700">endDate</td>
                  <td className="py-2 text-gray-500">No</td>
                  <td className="py-2 text-gray-600">End date (YYYY-MM-DD)</td>
                  <td className="py-2 text-gray-500">2024-12-31</td>
                </tr>
                <tr>
                  <td className="py-2 font-mono text-gray-700">vendor</td>
                  <td className="py-2 text-gray-500">No</td>
                  <td className="py-2 text-gray-600">Vendor name</td>
                  <td className="py-2 text-gray-500">Landlord</td>
                </tr>
                <tr>
                  <td className="py-2 font-mono text-gray-700">isActive</td>
                  <td className="py-2 text-gray-500">No</td>
                  <td className="py-2 text-gray-600">true or false</td>
                  <td className="py-2 text-gray-500">true</td>
                </tr>
                <tr>
                  <td className="py-2 font-mono text-gray-700">totalOccurrences</td>
                  <td className="py-2 text-gray-500">No</td>
                  <td className="py-2 text-gray-600">Number of occurrences</td>
                  <td className="py-2 text-gray-500">12</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
