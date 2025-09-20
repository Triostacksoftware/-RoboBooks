"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Layers, 
  Upload, 
  Download, 
  Trash2, 
  CheckCircle,
  XCircle,
  RefreshCw,
  Loader2,
  AlertTriangle,
  FileText,
  BarChart3,
  Settings,
  Play,
  Pause
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface BulkOperationResult {
  successful: Array<{
    index: number;
    data: any;
    [key: string]: any;
  }>;
  failed: Array<{
    index: number;
    data: any;
    error: string;
  }>;
  total: number;
}

const BulkOperationsPage = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'create' | 'update' | 'delete' | 'export'>('create');
  const [operationResult, setOperationResult] = useState<BulkOperationResult | null>(null);

  // Form states
  const [adjustmentsData, setAdjustmentsData] = useState('');
  const [currencyPairs, setCurrencyPairs] = useState('');
  const [selectedAdjustments, setSelectedAdjustments] = useState<string[]>([]);
  const [exportFilters, setExportFilters] = useState({
    dataType: 'adjustments',
    format: 'json',
    status: '',
    fromDate: '',
    toDate: ''
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/signin');
    }
  }, [user, authLoading, router]);

  // Handle bulk create adjustments
  const handleBulkCreateAdjustments = async () => {
    try {
      setLoading(true);
      setError(null);

      // Parse JSON data
      let adjustments;
      try {
        adjustments = JSON.parse(adjustmentsData);
      } catch (parseError) {
        setError('Invalid JSON format. Please check your data.');
        return;
      }

      if (!Array.isArray(adjustments)) {
        setError('Data must be an array of adjustments.');
        return;
      }

      const response = await api<{ success: boolean; data: BulkOperationResult }>('/api/bulk-operations/adjustments/create', {
        method: 'POST',
        json: {
          adjustments,
          options: {
            autoApprove: false,
            createJournalEntries: true
          }
        }
      });

      if (response.success) {
        setSuccess(`Bulk create completed. ${response.data.successful.length}/${response.data.total} successful`);
        setOperationResult(response.data);
      }
    } catch (error) {
      console.error('Error in bulk create:', error);
      setError('Failed to create bulk adjustments');
    } finally {
      setLoading(false);
    }
  };

  // Handle bulk update rates
  const handleBulkUpdateRates = async () => {
    try {
      setLoading(true);
      setError(null);

      // Parse JSON data
      let pairs;
      try {
        pairs = JSON.parse(currencyPairs);
      } catch (parseError) {
        setError('Invalid JSON format. Please check your data.');
        return;
      }

      if (!Array.isArray(pairs)) {
        setError('Data must be an array of currency pairs.');
        return;
      }

      const response = await api<{ success: boolean; data: BulkOperationResult }>('/api/bulk-operations/rates/update', {
        method: 'POST',
        json: { currencyPairs: pairs }
      });

      if (response.success) {
        setSuccess(`Bulk rate update completed. ${response.data.successful.length}/${response.data.total} successful`);
        setOperationResult(response.data);
      }
    } catch (error) {
      console.error('Error in bulk update rates:', error);
      setError('Failed to update bulk rates');
    } finally {
      setLoading(false);
    }
  };

  // Handle bulk delete adjustments
  const handleBulkDeleteAdjustments = async () => {
    if (selectedAdjustments.length === 0) {
      setError('Please select adjustments to delete');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedAdjustments.length} adjustments?`)) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await api<{ success: boolean; data: BulkOperationResult }>('/api/bulk-operations/adjustments/delete', {
        method: 'POST',
        json: {
          adjustmentIds: selectedAdjustments,
          options: {
            deleteJournalEntries: true,
            forceDelete: false
          }
        }
      });

      if (response.success) {
        setSuccess(`Bulk delete completed. ${response.data.successful.length}/${response.data.total} successful`);
        setOperationResult(response.data);
        setSelectedAdjustments([]);
      }
    } catch (error) {
      console.error('Error in bulk delete:', error);
      setError('Failed to delete bulk adjustments');
    } finally {
      setLoading(false);
    }
  };

  // Handle bulk export
  const handleBulkExport = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/bulk-operations/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(exportFilters)
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `export-${exportFilters.dataType}-${new Date().toISOString().split('T')[0]}.${exportFilters.format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        setSuccess('Data exported successfully');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Export failed');
      }
    } catch (error) {
      console.error('Error in bulk export:', error);
      setError('Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  // Sample data generators
  const generateSampleAdjustments = () => {
    const sample = [
      {
        fromCurrency: "USD",
        toCurrency: "EUR",
        originalAmount: 1000,
        exchangeRate: 0.85,
        description: "Sample adjustment 1",
        referenceNumber: "REF-001"
      },
      {
        fromCurrency: "GBP",
        toCurrency: "USD",
        originalAmount: 500,
        exchangeRate: 1.25,
        description: "Sample adjustment 2",
        referenceNumber: "REF-002"
      }
    ];
    setAdjustmentsData(JSON.stringify(sample, null, 2));
  };

  const generateSampleCurrencyPairs = () => {
    const sample = [
      { from: "USD", to: "EUR" },
      { from: "USD", to: "GBP" },
      { from: "USD", to: "JPY" },
      { from: "EUR", to: "USD" },
      { from: "GBP", to: "USD" }
    ];
    setCurrencyPairs(JSON.stringify(sample, null, 2));
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/dashboard/accountant/currency-adjustments")}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                ← Back to Currency Adjustments
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Layers className="h-6 w-6 text-blue-600" />
                  Bulk Operations
                </h1>
                <p className="text-sm text-gray-600">
                  Perform multiple operations at once for efficiency
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Display */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Success</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>{success}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('create')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'create'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Upload className="h-4 w-4 mr-2 inline" />
                Bulk Create
              </button>
              <button
                onClick={() => setActiveTab('update')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'update'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <RefreshCw className="h-4 w-4 mr-2 inline" />
                Bulk Update
              </button>
              <button
                onClick={() => setActiveTab('delete')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'delete'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Trash2 className="h-4 w-4 mr-2 inline" />
                Bulk Delete
              </button>
              <button
                onClick={() => setActiveTab('export')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'export'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Download className="h-4 w-4 mr-2 inline" />
                Bulk Export
              </button>
            </nav>
          </div>
        </div>

        {/* Bulk Create Tab */}
        {activeTab === 'create' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Bulk Create Adjustments</h3>
              <p className="text-sm text-gray-600">
                Create multiple currency adjustments at once using JSON format
              </p>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adjustments Data (JSON Format)
                </label>
                <textarea
                  value={adjustmentsData}
                  onChange={(e) => setAdjustmentsData(e.target.value)}
                  className="w-full h-64 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  placeholder="Enter JSON data for adjustments..."
                />
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={generateSampleAdjustments}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Generate Sample Data
                  </button>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleBulkCreateAdjustments}
                  disabled={loading || !adjustmentsData.trim()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  Create Adjustments
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Update Tab */}
        {activeTab === 'update' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Bulk Update Exchange Rates</h3>
              <p className="text-sm text-gray-600">
                Update multiple exchange rates at once using real-time data
              </p>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency Pairs (JSON Format)
                </label>
                <textarea
                  value={currencyPairs}
                  onChange={(e) => setCurrencyPairs(e.target.value)}
                  className="w-full h-64 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  placeholder="Enter JSON data for currency pairs..."
                />
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={generateSampleCurrencyPairs}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Generate Sample Data
                  </button>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleBulkUpdateRates}
                  disabled={loading || !currencyPairs.trim()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Update Rates
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Delete Tab */}
        {activeTab === 'delete' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Bulk Delete Adjustments</h3>
              <p className="text-sm text-gray-600">
                Delete multiple currency adjustments at once
              </p>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adjustment IDs (comma-separated)
                </label>
                <input
                  type="text"
                  value={selectedAdjustments.join(', ')}
                  onChange={(e) => setSelectedAdjustments(e.target.value.split(',').map(id => id.trim()).filter(id => id))}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter adjustment IDs separated by commas..."
                />
                <p className="mt-1 text-sm text-gray-500">
                  {selectedAdjustments.length} adjustment(s) selected
                </p>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleBulkDeleteAdjustments}
                  disabled={loading || selectedAdjustments.length === 0}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Delete Adjustments
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Export Tab */}
        {activeTab === 'export' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Bulk Export Data</h3>
              <p className="text-sm text-gray-600">
                Export data in various formats for analysis or backup
              </p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data Type</label>
                  <select
                    value={exportFilters.dataType}
                    onChange={(e) => setExportFilters(prev => ({ ...prev, dataType: e.target.value }))}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="adjustments">Currency Adjustments</option>
                    <option value="rates">Exchange Rates</option>
                    <option value="journal-entries">Journal Entries</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
                  <select
                    value={exportFilters.format}
                    onChange={(e) => setExportFilters(prev => ({ ...prev, format: e.target.value }))}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="json">JSON</option>
                    <option value="csv">CSV</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status (Optional)</label>
                  <select
                    value={exportFilters.status}
                    onChange={(e) => setExportFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                  <input
                    type="date"
                    value={exportFilters.fromDate}
                    onChange={(e) => setExportFilters(prev => ({ ...prev, fromDate: e.target.value }))}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                  <input
                    type="date"
                    value={exportFilters.toDate}
                    onChange={(e) => setExportFilters(prev => ({ ...prev, toDate: e.target.value }))}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleBulkExport}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Export Data
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Operation Results */}
        {operationResult && (
          <div className="mt-8 bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Operation Results</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{operationResult.successful.length}</div>
                  <div className="text-sm text-gray-500">Successful</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{operationResult.failed.length}</div>
                  <div className="text-sm text-gray-500">Failed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">{operationResult.total}</div>
                  <div className="text-sm text-gray-500">Total</div>
                </div>
              </div>

              {operationResult.failed.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Failed Operations</h4>
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    {operationResult.failed.map((failure, index) => (
                      <div key={index} className="text-sm text-red-700 mb-1">
                        <strong>Index {failure.index}:</strong> {failure.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkOperationsPage;
