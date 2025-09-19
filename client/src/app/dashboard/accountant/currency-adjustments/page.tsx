"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  TrendingUp, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload,
  RefreshCw,
  DollarSign,
  Calculator,
  AlertCircle,
  Loader2
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface CurrencyRate {
  _id: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  date: string;
  source: string;
  isActive: boolean;
  notes?: string;
}

interface CurrencyAdjustment {
  _id: string;
  accountId: string;
  accountName: string;
  fromCurrency: string;
  toCurrency: string;
  originalAmount: number;
  convertedAmount: number;
  exchangeRate: number;
  adjustmentDate: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  adjustmentType: 'gain' | 'loss' | 'neutral';
  amount: number;
  referenceNumber?: string;
}

const CurrencyAdjustmentsPage = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'rates' | 'adjustments'>('rates');
  const [exchangeRates, setExchangeRates] = useState<CurrencyRate[]>([]);
  const [adjustments, setAdjustments] = useState<CurrencyAdjustment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    currency: '',
    dateFrom: '',
    dateTo: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [showImportDropdown, setShowImportDropdown] = useState(false);
  const [stats, setStats] = useState({
    totalRates: 0,
    activeRates: 0,
    totalAdjustments: 0,
    pendingAdjustments: 0,
    approvedAdjustments: 0
  });

  // Load data from API
  const loadExchangeRates = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api<{ success: boolean; data: CurrencyRate[] }>('/api/currency/rates');
      if (response.success) {
        setExchangeRates(response.data);
      }
    } catch (error) {
      console.error('Error loading exchange rates:', error);
      setError('Failed to load exchange rates');
    } finally {
      setLoading(false);
    }
  };

  const loadCurrencyAdjustments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api<{ success: boolean; data: CurrencyAdjustment[] }>('/api/currency/adjustments');
      if (response.success) {
        setAdjustments(response.data);
      }
    } catch (error) {
      console.error('Error loading currency adjustments:', error);
      setError('Failed to load currency adjustments');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api<{ success: boolean; data: typeof stats }>('/api/currency/stats');
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  useEffect(() => {
    if (user && !authLoading) {
      loadExchangeRates();
      loadCurrencyAdjustments();
      loadStats();
      // Initialize default rates if none exist
      initializeDefaultRatesIfNeeded();
    }
  }, [user, authLoading]);

  const initializeDefaultRatesIfNeeded = async () => {
    try {
      // Check if user has any exchange rates
      if (exchangeRates.length === 0) {
        console.log('🔄 No exchange rates found, initializing defaults...');
        const response = await api('/api/currency/rates/initialize-defaults', {
          method: 'POST'
        });
        
        if (response.success) {
          console.log('✅ Default exchange rates initialized');
          // Reload data to show the new rates
          await loadExchangeRates();
          await loadStats();
        }
      }
    } catch (error) {
      console.error('Error initializing default rates:', error);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        setShowExportDropdown(false);
        setShowImportDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/signin');
    }
  }, [user, authLoading, router]);

  const filteredRates = exchangeRates.filter(rate => {
    const matchesSearch = rate.fromCurrency.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rate.toCurrency.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rate.source.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filters.status || (filters.status === 'active' ? rate.isActive : !rate.isActive);
    const matchesCurrency = !filters.currency || 
                           rate.fromCurrency === filters.currency || 
                           rate.toCurrency === filters.currency;
    
    return matchesSearch && matchesStatus && matchesCurrency;
  });

  const filteredAdjustments = adjustments.filter(adj => {
    const matchesSearch = adj.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         adj.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         adj.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filters.status || adj.status === filters.status;
    const matchesCurrency = !filters.currency || 
                           adj.fromCurrency === filters.currency || 
                           adj.toCurrency === filters.currency;
    
    const matchesDate = !filters.dateFrom || new Date(adj.adjustmentDate) >= new Date(filters.dateFrom);
    const matchesDateTo = !filters.dateTo || new Date(adj.adjustmentDate) <= new Date(filters.dateTo);
    
    return matchesSearch && matchesStatus && matchesCurrency && matchesDate && matchesDateTo;
  });

  const handleRefreshRates = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Fetch real-time rates for common currency pairs
      const commonPairs = [
        { from: 'USD', to: 'INR' },
        { from: 'EUR', to: 'INR' },
        { from: 'GBP', to: 'INR' },
        { from: 'USD', to: 'EUR' },
        { from: 'USD', to: 'GBP' },
        { from: 'EUR', to: 'USD' },
        { from: 'GBP', to: 'USD' }
      ];

      console.log('🔄 Fetching real-time exchange rates...');
      const response = await api('/api/currency/rates/realtime/bulk', {
        method: 'POST',
        json: { currencyPairs: commonPairs }
      });

      if (response.success) {
        console.log('✅ Real-time rates fetched successfully');
        await Promise.all([
          loadExchangeRates(),
          loadCurrencyAdjustments(),
          loadStats()
        ]);
        setSuccess(`Successfully updated ${response.data.length} exchange rates with real-time data!`);
      } else {
        console.log('❌ Failed to fetch real-time rates:', response.message);
        setError(response.message || 'Failed to fetch real-time exchange rates');
        // Still load existing data even if real-time fetch fails
        await Promise.all([
          loadExchangeRates(),
          loadCurrencyAdjustments(),
          loadStats()
        ]);
      }
    } catch (error) {
      console.error('Error refreshing rates:', error);
      setError('Failed to refresh exchange rates');
      // Still load existing data even if real-time fetch fails
      await Promise.all([
        loadExchangeRates(),
        loadCurrencyAdjustments(),
        loadStats()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleManualUpdate = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      console.log('🔄 Triggering manual exchange rate update...');
      const response = await api('/api/currency/rates/trigger-update', {
        method: 'POST'
      });

      if (response.success) {
        console.log('✅ Manual update triggered successfully');
        // Wait a moment for the update to complete, then refresh data
        setTimeout(async () => {
          await Promise.all([
            loadExchangeRates(),
            loadCurrencyAdjustments(),
            loadStats()
          ]);
          setSuccess('Exchange rates update completed! All rates have been refreshed.');
        }, 2000);
      } else {
        console.log('❌ Failed to trigger manual update:', response.message);
        setError(response.message || 'Failed to trigger exchange rate update');
      }
    } catch (error) {
      console.error('Error triggering manual update:', error);
      setError('Failed to trigger exchange rate update');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type: 'rates' | 'adjustments') => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/currency/export?type=${type}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = type === 'rates' ? 'exchange_rates.csv' : 'currency_adjustments.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export failed:', error);
      setError('Failed to export data');
    }
  };

  const handleImport = (type: 'rates' | 'adjustments') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const text = await file.text();
          const lines = text.split('\n');
          const headers = lines[0].split(',');
          const data = lines.slice(1).map(line => {
            const values = line.split(',');
            const obj: any = {};
            headers.forEach((header, index) => {
              obj[header.trim()] = values[index]?.trim().replace(/"/g, '');
            });
            return obj;
          }).filter(row => Object.keys(row).length > 1);

          await api('/api/currency/import', {
            method: 'POST',
            json: { type, data }
          });

          // Reload data
          await handleRefreshRates();
        } catch (error) {
          console.error('Import failed:', error);
          setError('Failed to import data');
        }
      }
    };
    input.click();
  };

  const handleApproveAdjustment = async (adjustmentId: string) => {
    try {
      await api(`/api/currency/adjustments/${adjustmentId}/status`, {
        method: 'PATCH',
        json: { status: 'approved' }
      });
      await loadCurrencyAdjustments();
      await loadStats();
    } catch (error) {
      console.error('Error approving adjustment:', error);
      setError('Failed to approve adjustment');
    }
  };

  const handleRejectAdjustment = async (adjustmentId: string) => {
    try {
      await api(`/api/currency/adjustments/${adjustmentId}/status`, {
        method: 'PATCH',
        json: { status: 'rejected', rejectionReason: 'Rejected by user' }
      });
      await loadCurrencyAdjustments();
      await loadStats();
    } catch (error) {
      console.error('Error rejecting adjustment:', error);
      setError('Failed to reject adjustment');
    }
  };

  // Show loading state while checking authentication
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

  // Show error if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
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
                onClick={() => router.push("/dashboard/accountant")}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                ← Back to Accountant
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                  Currency Adjustments
                </h1>
                <p className="text-sm text-gray-600">
                  Manage exchange rates and currency conversion adjustments
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleRefreshRates}
                disabled={loading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh Rates
              </button>
              <button 
                onClick={handleManualUpdate}
                disabled={loading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <TrendingUp className="h-4 w-4 mr-2" />
                )}
                Update All Rates
              </button>
              <button 
                onClick={() => router.push('/dashboard/accountant/currency-adjustments/new')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Adjustment
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
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
                onClick={() => setActiveTab('rates')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'rates'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Exchange Rates
              </button>
              <button
                onClick={() => setActiveTab('adjustments')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'adjustments'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Currency Adjustments
              </button>
            </nav>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative dropdown-container">
              <button 
                onClick={() => {
                  setShowExportDropdown(!showExportDropdown);
                  setShowImportDropdown(false);
                }}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
              {showExportDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 border border-gray-200">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        handleExport('rates');
                        setShowExportDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Export Exchange Rates
                    </button>
                    <button
                      onClick={() => {
                        handleExport('adjustments');
                        setShowExportDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Export Adjustments
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="relative dropdown-container">
              <button 
                onClick={() => {
                  setShowImportDropdown(!showImportDropdown);
                  setShowExportDropdown(false);
                }}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import
              </button>
              {showImportDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 border border-gray-200">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        handleImport('rates');
                        setShowImportDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Import Exchange Rates
                    </button>
                    <button
                      onClick={() => {
                        handleImport('adjustments');
                        setShowImportDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Import Adjustments
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mb-6 bg-white p-4 rounded-lg shadow border">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">All Statuses</option>
                  {activeTab === 'rates' ? (
                    <>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </>
                  ) : (
                    <>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select
                  value={filters.currency}
                  onChange={(e) => setFilters(prev => ({ ...prev, currency: e.target.value }))}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">All Currencies</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="INR">INR</option>
                  <option value="JPY">JPY</option>
                  <option value="CAD">CAD</option>
                  <option value="AUD">AUD</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setFilters({ status: '', currency: '', dateFrom: '', dateTo: '' })}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        {activeTab === 'rates' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Exchange Rates</h3>
              <p className="text-sm text-gray-600">Current exchange rates for currency conversions</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      From Currency
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      To Currency
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRates.map((rate) => (
                    <tr key={rate._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">{rate.fromCurrency}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">{rate.toCurrency}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{rate.rate.toFixed(4)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(rate.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {rate.source}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          rate.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {rate.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => router.push(`/dashboard/accountant/currency-adjustments/edit-rate/${rate._id}`)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={async () => {
                            if (confirm('Are you sure you want to delete this exchange rate?')) {
                              try {
                                await api(`/api/currency/rates/${rate._id}`, { method: 'DELETE' });
                                await handleRefreshRates();
                              } catch (error) {
                                setError('Failed to delete exchange rate');
                              }
                            }
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'adjustments' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Currency Adjustments</h3>
              <p className="text-sm text-gray-600">Track currency conversion adjustments and foreign exchange gains/losses</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Account
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Currency
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Original Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Converted Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Exchange Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAdjustments.map((adjustment) => (
                    <tr key={adjustment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{adjustment.accountName}</div>
                        <div className="text-sm text-gray-500">{adjustment.description}</div>
                        {adjustment.referenceNumber && (
                          <div className="text-xs text-gray-400">Ref: {adjustment.referenceNumber}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-900">{adjustment.fromCurrency}</span>
                          <span className="mx-2 text-gray-400">→</span>
                          <span className="text-sm text-gray-900">{adjustment.toCurrency}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {adjustment.originalAmount.toLocaleString()} {adjustment.fromCurrency}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {adjustment.convertedAmount.toLocaleString()} {adjustment.toCurrency}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{adjustment.exchangeRate.toFixed(4)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(adjustment.adjustmentDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          adjustment.status === 'approved' 
                            ? 'bg-green-100 text-green-800'
                            : adjustment.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {adjustment.status.charAt(0).toUpperCase() + adjustment.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => router.push(`/dashboard/accountant/currency-adjustments/view/${adjustment._id}`)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          View
                        </button>
                        {adjustment.status === 'pending' && (
                          <>
                            {/* Only show edit button for the creator */}
                            <button 
                              onClick={() => router.push(`/dashboard/accountant/currency-adjustments/edit/${adjustment._id}`)}
                              className="text-indigo-600 hover:text-indigo-900 mr-3"
                            >
                              Edit
                            </button>
                            {/* Only show approve/reject for admins - for now, show for all users */}
                            <button 
                              onClick={() => handleApproveAdjustment(adjustment._id)}
                              className="text-green-600 hover:text-green-900 mr-3"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleRejectAdjustment(adjustment._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Rates</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.activeRates}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calculator className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Pending Adjustments</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.pendingAdjustments}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Adjustments</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalAdjustments}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Approved Adjustments</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.approvedAdjustments}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrencyAdjustmentsPage;
