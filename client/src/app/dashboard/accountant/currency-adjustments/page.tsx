"use client";

import React, { useState, useEffect } from "react";
import ModuleAccessGuard from "@/components/ModuleAccessGuard";
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
  Loader2,
  BarChart3,
  FileText,
  Settings,
  Layers,
  Folder,
  Activity
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


interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
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
  const [activeTab, setActiveTab] = useState<'rates' | 'adjustments' | 'analytics' | 'journal-entries' | 'api-providers' | 'bulk-operations' | 'documents' | 'audit-trail'>('rates');
  const [exchangeRates, setExchangeRates] = useState<CurrencyRate[]>([]);
  const [adjustments, setAdjustments] = useState<CurrencyAdjustment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Clear messages after a delay
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);
  
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);
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
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 20
  });

  // User preferences state
  const [userPreferences, setUserPreferences] = useState({
    baseCurrency: 'USD',
    currencySettings: {
      autoRefresh: true,
      refreshInterval: 10,
      notifications: {
        rateAlerts: true,
        email: false,
        push: true
      }
    }
  });

  // Analytics state
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [analyticsBaseCurrency, setAnalyticsBaseCurrency] = useState('USD');

  // Additional state for functionality
  const [isCreatingJournalEntry, setIsCreatingJournalEntry] = useState(false);
  const [isTestingProviders, setIsTestingProviders] = useState(false);
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);
  const [isExportingData, setIsExportingData] = useState(false);
  const [isImportingData, setIsImportingData] = useState(false);
  const [isBulkOperating, setIsBulkOperating] = useState(false);

  // Load data from API
  const loadExchangeRates = async (page = currentPage) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api<{ 
        success: boolean; 
        data: CurrencyRate[]; 
        pagination: PaginationInfo 
      }>(`/api/currency/rates?page=${page}&limit=20&sortBy=date&sortOrder=desc`);
      if (response.success) {
        setExchangeRates(response.data);
        setPagination(response.pagination);
        setCurrentPage(page);
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

  const loadUserPreferences = async () => {
    try {
      const response = await api<{ success: boolean; data: any }>('/api/user-preferences');
      if (response.success) {
        setUserPreferences(response.data);
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  };

  useEffect(() => {
    if (user && !authLoading) {
      loadExchangeRates();
      loadCurrencyAdjustments();
      loadStats();
      loadUserPreferences();
      // Initialize default rates if none exist
      initializeDefaultRatesIfNeeded();
    }
  }, [user, authLoading]);

  const initializeDefaultRatesIfNeeded = async () => {
    try {
      // Check if user has any exchange rates
      if (exchangeRates.length === 0) {
        console.log('🔄 No exchange rates found, initializing defaults...');
      const response = await api<{ success: boolean; message?: string }>('/api/currency/rates/initialize-defaults', {
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

  // Journal Entries Functions
  const handleCreateJournalEntry = async () => {
    try {
      setIsCreatingJournalEntry(true);
      const response = await api<{ success: boolean; message?: string }>('/api/journal-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: 'Auto-generated journal entry from currency adjustment',
          entries: [
            {
              account: 'Currency Adjustment Account',
              debit: 0,
              credit: 0,
              description: 'Currency adjustment entry'
            }
          ],
          source: 'currency_adjustment',
          sourceId: null
        })
      });

      if (response.success) {
        setSuccess('Journal entry created successfully!');
        // Refresh data if needed
      } else {
        setError('Failed to create journal entry');
      }
    } catch (error) {
      console.error('Error creating journal entry:', error);
      setError('Error creating journal entry');
    } finally {
      setIsCreatingJournalEntry(false);
    }
  };

  const handleAutoGenerateJournalEntries = async () => {
    try {
      setIsCreatingJournalEntry(true);
      const response = await api<{ success: boolean; count?: number; message?: string }>('/api/journal-entries/auto-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.success) {
        setSuccess(`Generated ${response.count || 0} journal entries successfully!`);
      } else {
        setError('Failed to auto-generate journal entries');
      }
    } catch (error) {
      console.error('Error auto-generating journal entries:', error);
      setError('Error auto-generating journal entries');
    } finally {
      setIsCreatingJournalEntry(false);
    }
  };

  // API Providers Functions
  const handleTestAllProviders = async () => {
    try {
      setIsTestingProviders(true);
      const response = await api<{ success: boolean; message?: string }>('/api/api-providers/test-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.success) {
        setSuccess('All providers tested successfully!');
        // Refresh provider data if needed
      } else {
        setError('Some providers failed the test');
      }
    } catch (error) {
      console.error('Error testing providers:', error);
      setError('Error testing providers');
    } finally {
      setIsTestingProviders(false);
    }
  };

  const handleAddProvider = async () => {
    try {
      const providerName = prompt('Enter provider name:');
      if (!providerName) return;

      const response = await api<{ success: boolean; message?: string }>('/api/api-providers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: providerName,
          baseUrl: 'https://api.example.com',
          apiKey: '',
          isActive: false,
          priority: 1
        })
      });

      if (response.success) {
        setSuccess('Provider added successfully!');
      } else {
        setError('Failed to add provider');
      }
    } catch (error) {
      console.error('Error adding provider:', error);
      setError('Error adding provider');
    }
  };

  // Bulk Operations Functions
  const handleBulkCreate = async () => {
    try {
      setIsBulkOperating(true);
      const response = await api<{ success: boolean; message?: string }>('/api/bulk-operations/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation: 'create',
          data: []
        })
      });

      if (response.success) {
        setSuccess('Bulk create operation started!');
      } else {
        setError('Failed to start bulk create operation');
      }
    } catch (error) {
      console.error('Error starting bulk create:', error);
      setError('Error starting bulk create operation');
    } finally {
      setIsBulkOperating(false);
    }
  };

  const handleBulkUpdate = async () => {
    try {
      setIsBulkOperating(true);
      const response = await api<{ success: boolean; message?: string }>('/api/bulk-operations/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation: 'update',
          data: []
        })
      });

      if (response.success) {
        setSuccess('Bulk update operation started!');
      } else {
        setError('Failed to start bulk update operation');
      }
    } catch (error) {
      console.error('Error starting bulk update:', error);
      setError('Error starting bulk update operation');
    } finally {
      setIsBulkOperating(false);
    }
  };

  const handleBulkDelete = async () => {
    try {
      setIsBulkOperating(true);
      const response = await api<{ success: boolean; message?: string }>('/api/bulk-operations/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation: 'delete',
          data: []
        })
      });

      if (response.success) {
        setSuccess('Bulk delete operation started!');
      } else {
        setError('Failed to start bulk delete operation');
      }
    } catch (error) {
      console.error('Error starting bulk delete:', error);
      setError('Error starting bulk delete operation');
    } finally {
      setIsBulkOperating(false);
    }
  };

  const handleBulkExport = async () => {
    try {
      setIsExportingData(true);
      const response = await api<{ success: boolean; data?: string; message?: string }>('/api/bulk-operations/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          format: 'csv',
          data: 'currency_rates'
        })
      });

      if (response.success && response.data) {
        // Create download link
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'currency_data.csv';
        a.click();
        window.URL.revokeObjectURL(url);
        setSuccess('Export completed successfully!');
      } else {
        setError('Failed to export data');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      setError('Error exporting data');
    } finally {
      setIsExportingData(false);
    }
  };

  const handleBulkImport = async () => {
    try {
      setIsImportingData(true);
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.csv,.xlsx';
      fileInput.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        const response = await api<{ success: boolean; count?: number; message?: string }>('/api/bulk-operations/import', {
          method: 'POST',
          body: formData
        });

        if (response.success) {
          setSuccess(`Import completed! Processed ${response.count || 0} records.`);
        } else {
          setError('Failed to import data');
        }
        setIsImportingData(false);
      };
      fileInput.click();
    } catch (error) {
      console.error('Error importing data:', error);
      setError('Error importing data');
      setIsImportingData(false);
    }
  };

  // Document Functions
  const handleUploadDocument = async () => {
    try {
      setIsUploadingDocument(true);
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.multiple = true;
      fileInput.accept = '.pdf,.doc,.docx,.xlsx,.csv';
      fileInput.onchange = async (e) => {
        const files = (e.target as HTMLInputElement).files;
        if (!files || files.length === 0) return;

        for (const file of Array.from(files)) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('category', 'currency_adjustment');

          const response = await api<{ success: boolean; message?: string }>('/api/documents/upload', {
            method: 'POST',
            body: formData
          });

          if (!response.success) {
            setError(`Failed to upload ${file.name}`);
            return;
          }
        }
        setSuccess(`Successfully uploaded ${files.length} file(s)!`);
        setIsUploadingDocument(false);
      };
      fileInput.click();
    } catch (error) {
      console.error('Error uploading documents:', error);
      setError('Error uploading documents');
      setIsUploadingDocument(false);
    }
  };

  const handleCreateFolder = async () => {
    try {
      const folderName = prompt('Enter folder name:');
      if (!folderName) return;

      const response = await api<{ success: boolean; message?: string }>('/api/documents/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: folderName,
          category: 'currency_adjustment'
        })
      });

      if (response.success) {
        setSuccess('Folder created successfully!');
      } else {
        setError('Failed to create folder');
      }
    } catch (error) {
      console.error('Error creating folder:', error);
      setError('Error creating folder');
    }
  };

  // Audit Trail Functions
  const handleExportAuditTrail = async () => {
    try {
      setIsExportingData(true);
      const response = await api<{ success: boolean; data?: string; message?: string }>('/api/audit-trail/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          format: 'csv',
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString()
        })
      });

      if (response.success && response.data) {
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'audit_trail.csv';
        a.click();
        window.URL.revokeObjectURL(url);
        setSuccess('Audit trail exported successfully!');
      } else {
        setError('Failed to export audit trail');
      }
    } catch (error) {
      console.error('Error exporting audit trail:', error);
      setError('Error exporting audit trail');
    } finally {
      setIsExportingData(false);
    }
  };

  const handleRefreshAuditTrail = async () => {
    try {
      const response = await api<{ success: boolean; message?: string }>('/api/audit-trail', {
        method: 'GET'
      });

      if (response.success) {
        setSuccess('Audit trail refreshed successfully!');
      } else {
        setError('Failed to refresh audit trail');
      }
    } catch (error) {
      console.error('Error refreshing audit trail:', error);
      setError('Error refreshing audit trail');
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
      // Fetch real-time rates for major world currency pairs
      const majorPairs = [
        // Major currencies vs USD
        { from: 'USD', to: 'EUR' },
        { from: 'USD', to: 'GBP' },
        { from: 'USD', to: 'JPY' },
        { from: 'USD', to: 'CHF' },
        { from: 'USD', to: 'CAD' },
        { from: 'USD', to: 'AUD' },
        { from: 'USD', to: 'INR' },
        { from: 'USD', to: 'CNY' },
        { from: 'USD', to: 'SGD' },
        { from: 'USD', to: 'HKD' },
        // Major currencies vs EUR
        { from: 'EUR', to: 'USD' },
        { from: 'EUR', to: 'GBP' },
        { from: 'EUR', to: 'JPY' },
        { from: 'EUR', to: 'INR' },
        // Major currencies vs GBP
        { from: 'GBP', to: 'USD' },
        { from: 'GBP', to: 'EUR' },
        { from: 'GBP', to: 'INR' },
        // Major currencies vs INR
        { from: 'INR', to: 'USD' },
        { from: 'INR', to: 'EUR' },
        { from: 'INR', to: 'GBP' }
      ];

      console.log('🔄 Fetching real-time exchange rates...');
      const response = await api<{ success: boolean; data?: any[]; message?: string }>('/api/currency/rates/realtime/bulk', {
        method: 'POST',
        json: { currencyPairs: majorPairs }
      });

      if (response.success) {
        console.log('✅ Real-time rates fetched successfully');
        await Promise.all([
          loadExchangeRates(),
          loadCurrencyAdjustments(),
          loadStats()
        ]);
        setSuccess(`Successfully updated ${response.data?.length || 0} exchange rates with real-time data!`);
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
      const response = await api<{ success: boolean; message?: string }>('/api/currency/rates/trigger-update', {
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

          const response = await api<{ success: boolean; message?: string }>('/api/currency/import', {
            method: 'POST',
            json: { type, data }
          });

          if (response.success) {
            setSuccess('Data imported successfully!');
            // Reload data
            await handleRefreshRates();
          } else {
            setError('Failed to import data');
          }
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
      await api<{ success: boolean; message?: string }>(`/api/currency/adjustments/${adjustmentId}/status`, {
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
      await api<{ success: boolean; message?: string }>(`/api/currency/adjustments/${adjustmentId}/status`, {
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
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
              <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                  <button
                    onClick={() => setError(null)}
                    className="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                  >
                    <span className="sr-only">Dismiss</span>
                    <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Display */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Success</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>{success}</p>
                </div>
              </div>
              <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                  <button
                    onClick={() => setSuccess(null)}
                    className="inline-flex bg-green-50 rounded-md p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-50 focus:ring-green-600"
                  >
                    <span className="sr-only">Dismiss</span>
                    <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
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
               <button
                 onClick={() => setActiveTab('analytics')}
                 className={`py-2 px-1 border-b-2 font-medium text-sm ${
                   activeTab === 'analytics'
                     ? 'border-blue-500 text-blue-600'
                     : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                 }`}
               >
                 Analytics
               </button>
               <button
                 onClick={() => setActiveTab('journal-entries')}
                 className={`py-2 px-1 border-b-2 font-medium text-sm ${
                   activeTab === 'journal-entries'
                     ? 'border-blue-500 text-blue-600'
                     : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                 }`}
               >
                 Journal Entries
               </button>
               <button
                 onClick={() => setActiveTab('api-providers')}
                 className={`py-2 px-1 border-b-2 font-medium text-sm ${
                   activeTab === 'api-providers'
                     ? 'border-blue-500 text-blue-600'
                     : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                 }`}
               >
                 API Providers
               </button>
               <button
                 onClick={() => setActiveTab('bulk-operations')}
                 className={`py-2 px-1 border-b-2 font-medium text-sm ${
                   activeTab === 'bulk-operations'
                     ? 'border-blue-500 text-blue-600'
                     : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                 }`}
               >
                 Bulk Operations
               </button>
               <button
                 onClick={() => setActiveTab('documents')}
                 className={`py-2 px-1 border-b-2 font-medium text-sm ${
                   activeTab === 'documents'
                     ? 'border-blue-500 text-blue-600'
                     : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                 }`}
               >
                 Documents
               </button>
               <button
                 onClick={() => setActiveTab('audit-trail')}
                 className={`py-2 px-1 border-b-2 font-medium text-sm ${
                   activeTab === 'audit-trail'
                     ? 'border-blue-500 text-blue-600'
                     : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                 }`}
               >
                 Audit Trail
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
            {activeTab === 'rates' && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Base Currency:</label>
                <select
                  value={userPreferences.baseCurrency}
                  onChange={async (e) => {
                    const newBaseCurrency = e.target.value;
                    setUserPreferences(prev => ({ ...prev, baseCurrency: newBaseCurrency }));
                    try {
                      await api('/api/user-preferences', {
                        method: 'PUT',
                        json: { baseCurrency: newBaseCurrency }
                      });
                    } catch (error) {
                      console.error('Error updating base currency:', error);
                    }
                  }}
                  className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="INR">INR</option>
                  <option value="JPY">JPY</option>
                  <option value="CAD">CAD</option>
                  <option value="AUD">AUD</option>
                  <option value="CHF">CHF</option>
                  <option value="CNY">CNY</option>
                </select>
              </div>
            )}
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
               <p className="text-sm text-gray-600">
                 Current exchange rates for currency conversions (auto-synced every 10 minutes from real-time API)
               </p>
               <p className="text-xs text-gray-500 mt-1">
                 Showing {pagination.totalCount} rates across {pagination.totalPages} pages
               </p>
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
                   {loading ? (
                     <tr>
                       <td colSpan={7} className="px-6 py-8 text-center">
                         <div className="flex items-center justify-center">
                           <Loader2 className="h-6 w-6 animate-spin mr-2" />
                           <span className="text-gray-600">Loading exchange rates...</span>
                         </div>
                       </td>
                     </tr>
                   ) : filteredRates.length === 0 ? (
                     <tr>
                       <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                         No exchange rates found
                       </td>
                     </tr>
                   ) : (
                     filteredRates.map((rate) => (
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
                           onClick={async () => {
                             if (confirm('Are you sure you want to delete this exchange rate?')) {
                               try {
                                 await api<{ success: boolean; message?: string }>(`/api/currency/rates/${rate._id}`, { method: 'DELETE' });
                                 await loadExchangeRates(currentPage);
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
                   ))
                   )}
                 </tbody>
               </table>
             </div>
             
             {/* Pagination */}
             {pagination.totalPages > 1 && (
               <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                 <div className="flex-1 flex justify-between sm:hidden">
                   <button
                     onClick={() => loadExchangeRates(currentPage - 1)}
                     disabled={!pagination.hasPrevPage}
                     className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     Previous
                   </button>
                   <button
                     onClick={() => loadExchangeRates(currentPage + 1)}
                     disabled={!pagination.hasNextPage}
                     className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     Next
                   </button>
                 </div>
                 <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                   <div>
                     <p className="text-sm text-gray-700">
                       Showing{' '}
                       <span className="font-medium">{(currentPage - 1) * pagination.limit + 1}</span>
                       {' '}to{' '}
                       <span className="font-medium">
                         {Math.min(currentPage * pagination.limit, pagination.totalCount)}
                       </span>
                       {' '}of{' '}
                       <span className="font-medium">{pagination.totalCount}</span>
                       {' '}results
                     </p>
                   </div>
                   <div>
                     <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                       <button
                         onClick={() => loadExchangeRates(currentPage - 1)}
                         disabled={!pagination.hasPrevPage}
                         className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                       >
                         <span className="sr-only">Previous</span>
                         ←
                       </button>
                       
                       {/* Page numbers */}
                       {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                         const pageNum = Math.max(1, Math.min(pagination.totalPages - 4, currentPage - 2)) + i;
                         if (pageNum > pagination.totalPages) return null;
                         
                         return (
                           <button
                             key={pageNum}
                             onClick={() => loadExchangeRates(pageNum)}
                             className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                               pageNum === currentPage
                                 ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                 : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                             }`}
                           >
                             {pageNum}
                           </button>
                         );
                       })}
                       
                       <button
                         onClick={() => loadExchangeRates(currentPage + 1)}
                         disabled={!pagination.hasNextPage}
                         className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                       >
                         <span className="sr-only">Next</span>
                         →
                       </button>
                     </nav>
                   </div>
                 </div>
               </div>
             )}
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
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center">
                        <div className="flex items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin mr-2" />
                          <span className="text-gray-600">Loading adjustments...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredAdjustments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                        No currency adjustments found
                      </td>
                    </tr>
                  ) : (
                    filteredAdjustments.map((adjustment) => (
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
                            <button
                              onClick={async () => {
                                try {
                                  const response = await api<{ success: boolean; message?: string }>(`/api/journal-entries/from-adjustment/${adjustment._id}`, {
                                    method: 'POST'
                                  });
                                  if (response.success) {
                                    setSuccess('Journal entry created successfully');
                                    // Optionally redirect to journal entries page
                                    router.push('/dashboard/accountant/currency-adjustments/journal-entries');
                                  }
                                } catch (error) {
                                  console.error('Error creating journal entry:', error);
                                  setError('Failed to create journal entry');
                                }
                              }}
                              className="text-green-600 hover:text-green-900 mr-3"
                              title="Create Journal Entry"
                            >
                              <FileText className="h-4 w-4" />
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
                  ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
         )}

         {/* Analytics Tab */}
         {activeTab === 'analytics' && (
           <div className="space-y-6">
             {/* Analytics Header */}
             <div className="bg-white shadow rounded-lg">
               <div className="px-6 py-4 border-b border-gray-200">
                 <h3 className="text-lg font-medium text-gray-900">Currency Analytics</h3>
                 <p className="text-sm text-gray-600">
                   Advanced analytics and insights for currency performance
                 </p>
               </div>
               <div className="p-6">
                 <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center space-x-4">
                     <select
                       value={selectedPeriod}
                       onChange={(e) => setSelectedPeriod(e.target.value)}
                       className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                     >
                       <option value="7d">Last 7 days</option>
                       <option value="30d">Last 30 days</option>
                       <option value="90d">Last 90 days</option>
                       <option value="1y">Last year</option>
                     </select>
                     <select
                       value={analyticsBaseCurrency}
                       onChange={(e) => setAnalyticsBaseCurrency(e.target.value)}
                       className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                     >
                       <option value="USD">USD</option>
                       <option value="EUR">EUR</option>
                       <option value="GBP">GBP</option>
                       <option value="INR">INR</option>
                       <option value="JPY">JPY</option>
                     </select>
                   </div>
                   <button
                     onClick={() => router.push('/dashboard/accountant/currency-adjustments/analytics')}
                     className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                   >
                     <BarChart3 className="h-4 w-4 mr-2" />
                     Open Full Dashboard
                   </button>
                 </div>

                 {/* Quick Analytics Summary */}
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                   <div className="bg-gray-50 rounded-lg p-4">
                     <div className="flex items-center">
                       <BarChart3 className="h-5 w-5 text-blue-600" />
                       <div className="ml-3">
                         <p className="text-sm font-medium text-gray-500">Total Pairs</p>
                         <p className="text-lg font-semibold text-gray-900">{exchangeRates.length}</p>
                       </div>
                     </div>
                   </div>
                   
                   <div className="bg-gray-50 rounded-lg p-4">
                     <div className="flex items-center">
                       <TrendingUp className="h-5 w-5 text-green-600" />
                       <div className="ml-3">
                         <p className="text-sm font-medium text-gray-500">Active Rates</p>
                         <p className="text-lg font-semibold text-gray-900">
                           {exchangeRates.filter(rate => rate.isActive).length}
                         </p>
                       </div>
                     </div>
                   </div>
                   
                   <div className="bg-gray-50 rounded-lg p-4">
                     <div className="flex items-center">
                       <Calculator className="h-5 w-5 text-orange-600" />
                       <div className="ml-3">
                         <p className="text-sm font-medium text-gray-500">Pending Adjustments</p>
                         <p className="text-lg font-semibold text-gray-900">
                           {adjustments.filter(adj => adj.status === 'pending').length}
                         </p>
                       </div>
                     </div>
                   </div>
                   
                   <div className="bg-gray-50 rounded-lg p-4">
                     <div className="flex items-center">
                       <DollarSign className="h-5 w-5 text-purple-600" />
                       <div className="ml-3">
                         <p className="text-sm font-medium text-gray-500">Total Adjustments</p>
                         <p className="text-lg font-semibold text-gray-900">{adjustments.length}</p>
                       </div>
                     </div>
                   </div>
                 </div>

                 {/* Recent Rate Changes */}
                 <div className="mt-6">
                   <h4 className="text-md font-medium text-gray-900 mb-3">Recent Rate Changes</h4>
                   <div className="bg-gray-50 rounded-lg p-4">
                     <div className="space-y-2">
                       {exchangeRates.slice(0, 5).map((rate) => (
                         <div key={rate._id} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                           <div className="flex items-center">
                             <span className="text-sm font-medium text-gray-900">
                               {rate.fromCurrency}/{rate.toCurrency}
                             </span>
                             <span className="ml-2 text-xs text-gray-500">
                               {rate.source}
                             </span>
                           </div>
                           <div className="flex items-center">
                             <span className="text-sm text-gray-900 mr-2">
                               {rate.rate.toFixed(4)}
                             </span>
                             <span className={`text-xs px-2 py-1 rounded-full ${
                               rate.isActive 
                                 ? 'bg-green-100 text-green-800' 
                                 : 'bg-red-100 text-red-800'
                             }`}>
                               {rate.isActive ? 'Active' : 'Inactive'}
                             </span>
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>
                 </div>

                 {/* Currency Performance Chart Placeholder */}
                 <div className="mt-6">
                   <h4 className="text-md font-medium text-gray-900 mb-3">Currency Performance</h4>
                   <div className="bg-gray-50 rounded-lg p-8 text-center">
                     <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                     <p className="text-gray-600 mb-4">
                       Detailed performance charts and analytics
                     </p>
                     <button
                       onClick={() => router.push('/dashboard/accountant/currency-adjustments/analytics')}
                       className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                     >
                       <BarChart3 className="h-4 w-4 mr-2" />
                       View Full Analytics
                     </button>
                   </div>
                 </div>
               </div>
             </div>
           </div>
         )}

         {/* Journal Entries Tab */}
         {activeTab === 'journal-entries' && (
           <div className="space-y-6">
             {/* Journal Entries Header */}
             <div className="bg-white shadow rounded-lg">
               <div className="px-6 py-4 border-b border-gray-200">
                 <h3 className="text-lg font-medium text-gray-900">Journal Entries</h3>
                 <p className="text-sm text-gray-600">
                   Manage accounting journal entries for currency adjustments
                 </p>
               </div>
               <div className="p-6">
                 <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center space-x-4">
                     <button
                       onClick={handleCreateJournalEntry}
                       disabled={isCreatingJournalEntry}
                       className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                     >
                       {isCreatingJournalEntry ? (
                         <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                       ) : (
                         <Plus className="h-4 w-4 mr-2" />
                       )}
                       New Journal Entry
                     </button>
                   </div>
                   <button
                     onClick={() => router.push('/dashboard/accountant/currency-adjustments/journal-entries')}
                     className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                   >
                     <FileText className="h-4 w-4 mr-2" />
                     View All Entries
                   </button>
                 </div>

                 {/* Quick Stats */}
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                   <div className="bg-gray-50 rounded-lg p-4">
                     <div className="flex items-center">
                       <FileText className="h-5 w-5 text-blue-600" />
                       <div className="ml-3">
                         <p className="text-sm font-medium text-gray-500">Total Entries</p>
                         <p className="text-lg font-semibold text-gray-900">0</p>
                       </div>
                     </div>
                   </div>
                   
                   <div className="bg-gray-50 rounded-lg p-4">
                     <div className="flex items-center">
                       <Calculator className="h-5 w-5 text-green-600" />
                       <div className="ml-3">
                         <p className="text-sm font-medium text-gray-500">Auto-Generated</p>
                         <p className="text-lg font-semibold text-gray-900">0</p>
                       </div>
                     </div>
                   </div>
                   
                   <div className="bg-gray-50 rounded-lg p-4">
                     <div className="flex items-center">
                       <DollarSign className="h-5 w-5 text-orange-600" />
                       <div className="ml-3">
                         <p className="text-sm font-medium text-gray-500">Total Amount</p>
                         <p className="text-lg font-semibold text-gray-900">$0.00</p>
                       </div>
                     </div>
                   </div>
                   
                   <div className="bg-gray-50 rounded-lg p-4">
                     <div className="flex items-center">
                       <Activity className="h-5 w-5 text-purple-600" />
                       <div className="ml-3">
                         <p className="text-sm font-medium text-gray-500">This Month</p>
                         <p className="text-lg font-semibold text-gray-900">0</p>
                       </div>
                     </div>
                   </div>
                 </div>

                 {/* Recent Journal Entries */}
                 <div className="mb-6">
                   <h4 className="text-md font-medium text-gray-900 mb-3">Recent Journal Entries</h4>
                   <div className="bg-gray-50 rounded-lg p-4">
                     <div className="text-center py-8">
                       <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                       <p className="text-gray-600 mb-4">No journal entries found</p>
                       <p className="text-sm text-gray-500">
                         Journal entries will appear here when currency adjustments are processed
                       </p>
                     </div>
                   </div>
                 </div>

                 {/* Quick Actions */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="bg-blue-50 rounded-lg p-4">
                     <h5 className="text-sm font-medium text-blue-900 mb-2">Auto-Generate from Adjustments</h5>
                     <p className="text-sm text-blue-700 mb-3">
                       Automatically create journal entries for pending currency adjustments
                     </p>
                     <button 
                       onClick={handleAutoGenerateJournalEntries}
                       disabled={isCreatingJournalEntry}
                       className="text-sm text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
                     >
                       {isCreatingJournalEntry ? 'Generating...' : 'Generate Now →'}
                     </button>
                   </div>
                   
                   <div className="bg-green-50 rounded-lg p-4">
                     <h5 className="text-sm font-medium text-green-900 mb-2">Export Entries</h5>
                     <p className="text-sm text-green-700 mb-3">
                       Export journal entries for accounting software integration
                     </p>
                     <button className="text-sm text-green-600 hover:text-green-800 font-medium">
                       Export CSV →
                     </button>
                   </div>
                 </div>
               </div>
             </div>
           </div>
         )}

         {/* API Providers Tab */}
         {activeTab === 'api-providers' && (
           <div className="space-y-6">
             {/* API Providers Header */}
             <div className="bg-white shadow rounded-lg">
               <div className="px-6 py-4 border-b border-gray-200">
                 <h3 className="text-lg font-medium text-gray-900">API Providers</h3>
                 <p className="text-sm text-gray-600">
                   Manage exchange rate API providers and fallback options
                 </p>
               </div>
               <div className="p-6">
                 <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center space-x-4">
                     <button
                       onClick={handleAddProvider}
                       className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                     >
                       <Plus className="h-4 w-4 mr-2" />
                       Add Provider
                     </button>
                     <button
                       onClick={handleTestAllProviders}
                       disabled={isTestingProviders}
                       className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                     >
                       {isTestingProviders ? (
                         <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                       ) : (
                         <RefreshCw className="h-4 w-4 mr-2" />
                       )}
                       Test All
                     </button>
                   </div>
                   <button
                     onClick={() => router.push('/dashboard/accountant/currency-adjustments/api-providers')}
                     className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                   >
                     <Settings className="h-4 w-4 mr-2" />
                     Manage Providers
                   </button>
                 </div>

                 {/* Provider Stats */}
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                   <div className="bg-gray-50 rounded-lg p-4">
                     <div className="flex items-center">
                       <Settings className="h-5 w-5 text-blue-600" />
                       <div className="ml-3">
                         <p className="text-sm font-medium text-gray-500">Total Providers</p>
                         <p className="text-lg font-semibold text-gray-900">5</p>
                       </div>
                     </div>
                   </div>
                   
                   <div className="bg-gray-50 rounded-lg p-4">
                     <div className="flex items-center">
                       <Activity className="h-5 w-5 text-green-600" />
                       <div className="ml-3">
                         <p className="text-sm font-medium text-gray-500">Active</p>
                         <p className="text-lg font-semibold text-gray-900">2</p>
                       </div>
                     </div>
                   </div>
                   
                   <div className="bg-gray-50 rounded-lg p-4">
                     <div className="flex items-center">
                       <TrendingUp className="h-5 w-5 text-orange-600" />
                       <div className="ml-3">
                         <p className="text-sm font-medium text-gray-500">Success Rate</p>
                         <p className="text-lg font-semibold text-gray-900">100%</p>
                       </div>
                     </div>
                   </div>
                   
                   <div className="bg-gray-50 rounded-lg p-4">
                     <div className="flex items-center">
                       <DollarSign className="h-5 w-5 text-purple-600" />
                       <div className="ml-3">
                         <p className="text-sm font-medium text-gray-500">Total Requests</p>
                         <p className="text-lg font-semibold text-gray-900">216</p>
                       </div>
                     </div>
                   </div>
                 </div>

                 {/* Provider List */}
                 <div className="mb-6">
                   <h4 className="text-md font-medium text-gray-900 mb-3">Provider Status</h4>
                   <div className="space-y-3">
                     <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                       <div className="flex items-center">
                         <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                         <div>
                           <p className="text-sm font-medium text-gray-900">ExchangeRate-API.com</p>
                           <p className="text-xs text-gray-500">Priority 1 • 216 requests • 100% success</p>
                         </div>
                       </div>
                       <div className="flex items-center space-x-2">
                         <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">Active</span>
                         <button className="text-gray-400 hover:text-gray-600">
                           <Settings className="h-4 w-4" />
                         </button>
                       </div>
                     </div>
                     
                     <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                       <div className="flex items-center">
                         <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                         <div>
                           <p className="text-sm font-medium text-gray-900">ExchangeRate.host</p>
                           <p className="text-xs text-gray-500">Priority 2 • 0 requests • 100% success</p>
                         </div>
                       </div>
                       <div className="flex items-center space-x-2">
                         <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">Active</span>
                         <button className="text-gray-400 hover:text-gray-600">
                           <Settings className="h-4 w-4" />
                         </button>
                       </div>
                     </div>
                     
                     <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                       <div className="flex items-center">
                         <div className="w-3 h-3 bg-gray-400 rounded-full mr-3"></div>
                         <div>
                           <p className="text-sm font-medium text-gray-900">Fixer.io</p>
                           <p className="text-xs text-gray-500">Priority 2 • Requires API key</p>
                         </div>
                       </div>
                       <div className="flex items-center space-x-2">
                         <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded-full">Inactive</span>
                         <button className="text-gray-400 hover:text-gray-600">
                           <Settings className="h-4 w-4" />
                         </button>
                       </div>
                     </div>
                   </div>
                 </div>

                 {/* Quick Actions */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="bg-blue-50 rounded-lg p-4">
                     <h5 className="text-sm font-medium text-blue-900 mb-2">Provider Health</h5>
                     <p className="text-sm text-blue-700 mb-3">
                       Monitor provider performance and automatic failover status
                     </p>
                     <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                       View Health Status →
                     </button>
                   </div>
                   
                   <div className="bg-green-50 rounded-lg p-4">
                     <h5 className="text-sm font-medium text-green-900 mb-2">Add New Provider</h5>
                     <p className="text-sm text-green-700 mb-3">
                       Configure additional exchange rate API providers
                     </p>
                     <button className="text-sm text-green-600 hover:text-green-800 font-medium">
                       Configure Provider →
                     </button>
                   </div>
                 </div>
               </div>
             </div>
           </div>
         )}

         {/* Bulk Operations Tab */}
         {activeTab === 'bulk-operations' && (
           <div className="space-y-6">
             {/* Bulk Operations Header */}
             <div className="bg-white shadow rounded-lg">
               <div className="px-6 py-4 border-b border-gray-200">
                 <h3 className="text-lg font-medium text-gray-900">Bulk Operations</h3>
                 <p className="text-sm text-gray-600">
                   Perform multiple operations at once for efficiency
                 </p>
               </div>
               <div className="p-6">
                 <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center space-x-4">
                     <button
                       onClick={handleBulkCreate}
                       disabled={isBulkOperating}
                       className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                     >
                       {isBulkOperating ? (
                         <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                       ) : (
                         <Plus className="h-4 w-4 mr-2" />
                       )}
                       New Bulk Operation
                     </button>
                     <button
                       onClick={handleBulkImport}
                       disabled={isImportingData}
                       className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                     >
                       {isImportingData ? (
                         <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                       ) : (
                         <Upload className="h-4 w-4 mr-2" />
                       )}
                       Import Data
                     </button>
                   </div>
                   <button
                     onClick={() => router.push('/dashboard/accountant/currency-adjustments/bulk-operations')}
                     className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                   >
                     <Layers className="h-4 w-4 mr-2" />
                     Advanced Operations
                   </button>
                 </div>

                 {/* Operation Stats */}
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                   <div className="bg-gray-50 rounded-lg p-4">
                     <div className="flex items-center">
                       <Layers className="h-5 w-5 text-blue-600" />
                       <div className="ml-3">
                         <p className="text-sm font-medium text-gray-500">Total Operations</p>
                         <p className="text-lg font-semibold text-gray-900">0</p>
                       </div>
                     </div>
                   </div>
                   
                   <div className="bg-gray-50 rounded-lg p-4">
                     <div className="flex items-center">
                       <Activity className="h-5 w-5 text-green-600" />
                       <div className="ml-3">
                         <p className="text-sm font-medium text-gray-500">Completed</p>
                         <p className="text-lg font-semibold text-gray-900">0</p>
                       </div>
                     </div>
                   </div>
                   
                   <div className="bg-gray-50 rounded-lg p-4">
                     <div className="flex items-center">
                       <AlertCircle className="h-5 w-5 text-orange-600" />
                       <div className="ml-3">
                         <p className="text-sm font-medium text-gray-500">Failed</p>
                         <p className="text-lg font-semibold text-gray-900">0</p>
                       </div>
                     </div>
                   </div>
                   
                   <div className="bg-gray-50 rounded-lg p-4">
                     <div className="flex items-center">
                       <DollarSign className="h-5 w-5 text-purple-600" />
                       <div className="ml-3">
                         <p className="text-sm font-medium text-gray-500">Records Processed</p>
                         <p className="text-lg font-semibold text-gray-900">0</p>
                       </div>
                     </div>
                   </div>
                 </div>

                 {/* Quick Operations */}
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                   <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                     <div className="flex items-center mb-3">
                       <Plus className="h-5 w-5 text-blue-600" />
                       <h5 className="text-sm font-medium text-blue-900 ml-2">Bulk Create</h5>
                     </div>
                     <p className="text-sm text-blue-700 mb-3">
                       Create multiple exchange rates or adjustments at once
                     </p>
                     <button 
                       onClick={handleBulkCreate}
                       disabled={isBulkOperating}
                       className="text-sm text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
                     >
                       {isBulkOperating ? 'Starting...' : 'Start Creation →'}
                     </button>
                   </div>
                   
                   <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                     <div className="flex items-center mb-3">
                       <RefreshCw className="h-5 w-5 text-green-600" />
                       <h5 className="text-sm font-medium text-green-900 ml-2">Bulk Update</h5>
                     </div>
                     <p className="text-sm text-green-700 mb-3">
                       Update multiple records with new values
                     </p>
                     <button 
                       onClick={handleBulkUpdate}
                       disabled={isBulkOperating}
                       className="text-sm text-green-600 hover:text-green-800 font-medium disabled:opacity-50"
                     >
                       {isBulkOperating ? 'Starting...' : 'Start Update →'}
                     </button>
                   </div>
                   
                   <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                     <div className="flex items-center mb-3">
                       <AlertCircle className="h-5 w-5 text-red-600" />
                       <h5 className="text-sm font-medium text-red-900 ml-2">Bulk Delete</h5>
                     </div>
                     <p className="text-sm text-red-700 mb-3">
                       Remove multiple records safely
                     </p>
                     <button 
                       onClick={handleBulkDelete}
                       disabled={isBulkOperating}
                       className="text-sm text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                     >
                       {isBulkOperating ? 'Starting...' : 'Start Deletion →'}
                     </button>
                   </div>
                   
                   <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                     <div className="flex items-center mb-3">
                       <Download className="h-5 w-5 text-purple-600" />
                       <h5 className="text-sm font-medium text-purple-900 ml-2">Bulk Export</h5>
                     </div>
                     <p className="text-sm text-purple-700 mb-3">
                       Export multiple records to various formats
                     </p>
                     <button 
                       onClick={handleBulkExport}
                       disabled={isExportingData}
                       className="text-sm text-purple-600 hover:text-purple-800 font-medium disabled:opacity-50"
                     >
                       {isExportingData ? 'Exporting...' : 'Start Export →'}
                     </button>
                   </div>
                   
                   <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                     <div className="flex items-center mb-3">
                       <Upload className="h-5 w-5 text-orange-600" />
                       <h5 className="text-sm font-medium text-orange-900 ml-2">Bulk Import</h5>
                     </div>
                     <p className="text-sm text-orange-700 mb-3">
                       Import data from CSV or Excel files
                     </p>
                     <button 
                       onClick={handleBulkImport}
                       disabled={isImportingData}
                       className="text-sm text-orange-600 hover:text-orange-800 font-medium disabled:opacity-50"
                     >
                       {isImportingData ? 'Importing...' : 'Start Import →'}
                     </button>
                   </div>
                   
                   <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                     <div className="flex items-center mb-3">
                       <Settings className="h-5 w-5 text-gray-600" />
                       <h5 className="text-sm font-medium text-gray-900 ml-2">Bulk Settings</h5>
                     </div>
                     <p className="text-sm text-gray-700 mb-3">
                       Configure bulk operation preferences
                     </p>
                     <button className="text-sm text-gray-600 hover:text-gray-800 font-medium">
                       Configure →
                     </button>
                   </div>
                 </div>

                 {/* Recent Operations */}
                 <div className="mb-6">
                   <h4 className="text-md font-medium text-gray-900 mb-3">Recent Operations</h4>
                   <div className="bg-gray-50 rounded-lg p-4">
                     <div className="text-center py-8">
                       <Layers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                       <p className="text-gray-600 mb-4">No recent operations found</p>
                       <p className="text-sm text-gray-500">
                         Bulk operations will appear here when executed
                       </p>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
           </div>
         )}

         {/* Documents Tab */}
         {activeTab === 'documents' && (
           <div className="space-y-6">
             {/* Documents Header */}
             <div className="bg-white shadow rounded-lg">
               <div className="px-6 py-4 border-b border-gray-200">
                 <h3 className="text-lg font-medium text-gray-900">Document Management</h3>
                 <p className="text-sm text-gray-600">
                   Upload, organize, and manage documents related to currency adjustments
                 </p>
               </div>
               <div className="p-6">
                 <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center space-x-4">
                     <button
                       onClick={handleUploadDocument}
                       disabled={isUploadingDocument}
                       className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                     >
                       {isUploadingDocument ? (
                         <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                       ) : (
                         <Upload className="h-4 w-4 mr-2" />
                       )}
                       Upload Document
                     </button>
                     <button
                       onClick={handleCreateFolder}
                       className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                     >
                       <Folder className="h-4 w-4 mr-2" />
                       New Folder
                     </button>
                   </div>
                   <button
                     onClick={() => router.push('/dashboard/accountant/currency-adjustments/documents')}
                     className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                   >
                     <Folder className="h-4 w-4 mr-2" />
                     Manage Documents
                   </button>
                 </div>

                 {/* Document Stats */}
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                   <div className="bg-gray-50 rounded-lg p-4">
                     <div className="flex items-center">
                       <Folder className="h-5 w-5 text-blue-600" />
                       <div className="ml-3">
                         <p className="text-sm font-medium text-gray-500">Total Documents</p>
                         <p className="text-lg font-semibold text-gray-900">0</p>
                       </div>
                     </div>
                   </div>
                   
                   <div className="bg-gray-50 rounded-lg p-4">
                     <div className="flex items-center">
                       <FileText className="h-5 w-5 text-green-600" />
                       <div className="ml-3">
                         <p className="text-sm font-medium text-gray-500">PDF Files</p>
                         <p className="text-lg font-semibold text-gray-900">0</p>
                       </div>
                     </div>
                   </div>
                   
                   <div className="bg-gray-50 rounded-lg p-4">
                     <div className="flex items-center">
                       <DollarSign className="h-5 w-5 text-orange-600" />
                       <div className="ml-3">
                         <p className="text-sm font-medium text-gray-500">Total Size</p>
                         <p className="text-lg font-semibold text-gray-900">0 MB</p>
                       </div>
                     </div>
                   </div>
                   
                   <div className="bg-gray-50 rounded-lg p-4">
                     <div className="flex items-center">
                       <Activity className="h-5 w-5 text-purple-600" />
                       <div className="ml-3">
                         <p className="text-sm font-medium text-gray-500">This Month</p>
                         <p className="text-lg font-semibold text-gray-900">0</p>
                       </div>
                     </div>
                   </div>
                 </div>

                 {/* Recent Documents */}
                 <div className="mb-6">
                   <h4 className="text-md font-medium text-gray-900 mb-3">Recent Documents</h4>
                   <div className="bg-gray-50 rounded-lg p-4">
                     <div className="text-center py-8">
                       <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                       <p className="text-gray-600 mb-4">No documents found</p>
                       <p className="text-sm text-gray-500">
                         Upload documents to get started with document management
                       </p>
                     </div>
                   </div>
                 </div>

                 {/* Quick Actions */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="bg-blue-50 rounded-lg p-4">
                     <h5 className="text-sm font-medium text-blue-900 mb-2">Upload Multiple Files</h5>
                     <p className="text-sm text-blue-700 mb-3">
                       Drag and drop multiple files or use the upload button
                     </p>
                     <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                       Start Upload →
                     </button>
                   </div>
                   
                   <div className="bg-green-50 rounded-lg p-4">
                     <h5 className="text-sm font-medium text-green-900 mb-2">Organize Documents</h5>
                     <p className="text-sm text-green-700 mb-3">
                       Create folders and categorize your documents
                     </p>
                     <button className="text-sm text-green-600 hover:text-green-800 font-medium">
                       Organize Now →
                     </button>
                   </div>
                 </div>
               </div>
             </div>
           </div>
         )}

         {/* Audit Trail Tab */}
         {activeTab === 'audit-trail' && (
           <div className="space-y-6">
             {/* Audit Trail Header */}
             <div className="bg-white shadow rounded-lg">
               <div className="px-6 py-4 border-b border-gray-200">
                 <h3 className="text-lg font-medium text-gray-900">Audit Trail</h3>
                 <p className="text-sm text-gray-600">
                   Track all system activities and changes for compliance and security
                 </p>
               </div>
               <div className="p-6">
                 <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center space-x-4">
                     <button
                       onClick={handleExportAuditTrail}
                       disabled={isExportingData}
                       className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                     >
                       {isExportingData ? (
                         <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                       ) : (
                         <Download className="h-4 w-4 mr-2" />
                       )}
                       Export Trail
                     </button>
                     <button
                       onClick={handleRefreshAuditTrail}
                       className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                     >
                       <RefreshCw className="h-4 w-4 mr-2" />
                       Refresh
                     </button>
                   </div>
                   <button
                     onClick={() => router.push('/dashboard/accountant/currency-adjustments/audit-trail')}
                     className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                   >
                     <Activity className="h-4 w-4 mr-2" />
                     View Full Trail
                   </button>
                 </div>

                 {/* Audit Stats */}
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                   <div className="bg-gray-50 rounded-lg p-4">
                     <div className="flex items-center">
                       <Activity className="h-5 w-5 text-blue-600" />
                       <div className="ml-3">
                         <p className="text-sm font-medium text-gray-500">Total Activities</p>
                         <p className="text-lg font-semibold text-gray-900">0</p>
                       </div>
                     </div>
                   </div>
                   
                   <div className="bg-gray-50 rounded-lg p-4">
                     <div className="flex items-center">
                       <TrendingUp className="h-5 w-5 text-green-600" />
                       <div className="ml-3">
                         <p className="text-sm font-medium text-gray-500">Today</p>
                         <p className="text-lg font-semibold text-gray-900">0</p>
                       </div>
                     </div>
                   </div>
                   
                   <div className="bg-gray-50 rounded-lg p-4">
                     <div className="flex items-center">
                       <AlertCircle className="h-5 w-5 text-orange-600" />
                       <div className="ml-3">
                         <p className="text-sm font-medium text-gray-500">Warnings</p>
                         <p className="text-lg font-semibold text-gray-900">0</p>
                       </div>
                     </div>
                   </div>
                   
                   <div className="bg-gray-50 rounded-lg p-4">
                     <div className="flex items-center">
                       <DollarSign className="h-5 w-5 text-purple-600" />
                       <div className="ml-3">
                         <p className="text-sm font-medium text-gray-500">This Month</p>
                         <p className="text-lg font-semibold text-gray-900">0</p>
                       </div>
                     </div>
                   </div>
                 </div>

                 {/* Recent Activities */}
                 <div className="mb-6">
                   <h4 className="text-md font-medium text-gray-900 mb-3">Recent Activities</h4>
                   <div className="bg-gray-50 rounded-lg p-4">
                     <div className="text-center py-8">
                       <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                       <p className="text-gray-600 mb-4">No recent activities found</p>
                       <p className="text-sm text-gray-500">
                         System activities will be logged here for audit purposes
                       </p>
                     </div>
                   </div>
                 </div>

                 {/* Quick Actions */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="bg-blue-50 rounded-lg p-4">
                     <h5 className="text-sm font-medium text-blue-900 mb-2">Export Audit Log</h5>
                     <p className="text-sm text-blue-700 mb-3">
                       Download comprehensive audit trail for compliance reporting
                     </p>
                     <button 
                       onClick={handleExportAuditTrail}
                       disabled={isExportingData}
                       className="text-sm text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
                     >
                       {isExportingData ? 'Exporting...' : 'Export CSV →'}
                     </button>
                   </div>
                   
                   <div className="bg-green-50 rounded-lg p-4">
                     <h5 className="text-sm font-medium text-green-900 mb-2">Filter Activities</h5>
                     <p className="text-sm text-green-700 mb-3">
                       Search and filter activities by user, action, or date range
                     </p>
                     <button className="text-sm text-green-600 hover:text-green-800 font-medium">
                       Apply Filters →
                     </button>
                   </div>
                 </div>
               </div>
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

// Wrapped with access guard
const CurrencyAdjustmentsPageWithGuard = () => (
  <ModuleAccessGuard moduleName="Accountant">
    <CurrencyAdjustmentsPage />
  </ModuleAccessGuard>
);

export default CurrencyAdjustmentsPageWithGuard;
