"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Eye,
  CheckCircle,
  XCircle,
  RotateCcw,
  Trash2,
  RefreshCw,
  Loader2,
  Calendar,
  DollarSign,
  AlertTriangle
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface JournalEntry {
  _id: string;
  entryNumber: string;
  date: string;
  description: string;
  reference?: string;
  source: string;
  status: 'draft' | 'posted' | 'reversed';
  totalDebit: number;
  totalCredit: number;
  currency: string;
  exchangeRate?: number;
  lineItems: Array<{
    accountId: string;
    accountName: string;
    description?: string;
    debit: number;
    credit: number;
    currency: string;
    exchangeRate?: number;
    baseAmount?: number;
  }>;
  createdBy: {
    name: string;
    email: string;
  };
  approvedBy?: {
    name: string;
    email: string;
  };
  approvedAt?: string;
  reversedBy?: {
    name: string;
    email: string;
  };
  reversedAt?: string;
  reversalReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
}

const JournalEntriesPage = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);

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

  // Load journal entries
  const loadJournalEntries = async (page = currentPage) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      if (sourceFilter) params.append('source', sourceFilter);
      
      const response = await api<{ success: boolean; data: JournalEntry[]; pagination: PaginationInfo }>(
        `/api/journal-entries?${params.toString()}`
      );
      
      if (response.success) {
        setEntries(response.data);
        setPagination(response.pagination);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error loading journal entries:', error);
      setError('Failed to load journal entries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && !authLoading) {
      loadJournalEntries();
    }
  }, [user, authLoading]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/signin');
    }
  }, [user, authLoading, router]);

  // Handle search
  const handleSearch = () => {
    setCurrentPage(1);
    loadJournalEntries(1);
  };

  // Handle post entry
  const handlePostEntry = async (entryId: string) => {
    if (!confirm('Are you sure you want to post this journal entry?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await api(`/api/journal-entries/${entryId}/post`, {
        method: 'PUT'
      });

      if (response.success) {
        setSuccess('Journal entry posted successfully');
        await loadJournalEntries(currentPage);
      }
    } catch (error) {
      console.error('Error posting journal entry:', error);
      setError('Failed to post journal entry');
    } finally {
      setLoading(false);
    }
  };

  // Handle reverse entry
  const handleReverseEntry = async (entryId: string) => {
    const reason = prompt('Please provide a reason for reversing this journal entry:');
    if (!reason) return;

    if (!confirm('Are you sure you want to reverse this journal entry? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      const response = await api(`/api/journal-entries/${entryId}/reverse`, {
        method: 'PUT',
        json: { reason }
      });

      if (response.success) {
        setSuccess('Journal entry reversed successfully');
        await loadJournalEntries(currentPage);
      }
    } catch (error) {
      console.error('Error reversing journal entry:', error);
      setError('Failed to reverse journal entry');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete entry
  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this journal entry?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await api(`/api/journal-entries/${entryId}`, {
        method: 'DELETE'
      });

      if (response.success) {
        setSuccess('Journal entry deleted successfully');
        await loadJournalEntries(currentPage);
      }
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      setError('Failed to delete journal entry');
    } finally {
      setLoading(false);
    }
  };

  // Handle view entry
  const handleViewEntry = async (entryId: string) => {
    try {
      const response = await api<{ success: boolean; data: JournalEntry }>(`/api/journal-entries/${entryId}`);
      if (response.success) {
        setSelectedEntry(response.data);
        setShowViewModal(true);
      }
    } catch (error) {
      console.error('Error fetching journal entry:', error);
      setError('Failed to load journal entry details');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'posted': return 'bg-green-100 text-green-800';
      case 'reversed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <FileText className="h-4 w-4" />;
      case 'posted': return <CheckCircle className="h-4 w-4" />;
      case 'reversed': return <RotateCcw className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
                  <FileText className="h-6 w-6 text-blue-600" />
                  Journal Entries
                </h1>
                <p className="text-sm text-gray-600">
                  Manage accounting journal entries for currency adjustments
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => loadJournalEntries(currentPage)}
                disabled={loading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh
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

        {/* Search and Filters */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
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
            <button
              onClick={handleSearch}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Search
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mb-6 bg-white p-4 rounded-lg shadow">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">All Statuses</option>
                  <option value="draft">Draft</option>
                  <option value="posted">Posted</option>
                  <option value="reversed">Reversed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">All Sources</option>
                  <option value="currency_adjustment">Currency Adjustment</option>
                  <option value="manual">Manual</option>
                  <option value="system">System</option>
                  <option value="import">Import</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setStatusFilter('');
                    setSourceFilter('');
                    setCurrentPage(1);
                    loadJournalEntries(1);
                  }}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Journal Entries Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Journal Entries</h3>
            <p className="text-sm text-gray-600">
              {pagination.totalCount} entries found
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entry Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {entries.map((entry) => (
                  <tr key={entry._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{entry.entryNumber}</div>
                      {entry.reference && (
                        <div className="text-sm text-gray-500">{entry.reference}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(entry.date)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">{entry.description}</div>
                      {entry.notes && (
                        <div className="text-sm text-gray-500 max-w-xs truncate">{entry.notes}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="capitalize">{entry.source.replace('_', ' ')}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(entry.status)}`}>
                        {getStatusIcon(entry.status)}
                        <span className="ml-1 capitalize">{entry.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(entry.totalDebit, entry.currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewEntry(entry._id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {entry.status === 'draft' && (
                          <>
                            <button
                              onClick={() => handlePostEntry(entry._id)}
                              className="text-green-600 hover:text-green-900"
                              title="Post Entry"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteEntry(entry._id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete Entry"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {entry.status === 'posted' && (
                          <button
                            onClick={() => handleReverseEntry(entry._id)}
                            className="text-orange-600 hover:text-orange-900"
                            title="Reverse Entry"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} of {pagination.totalCount} entries
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => loadJournalEntries(currentPage - 1)}
                disabled={!pagination.hasPrevPage || loading}
                className="px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => loadJournalEntries(pageNum)}
                    disabled={loading}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => loadJournalEntries(currentPage + 1)}
                disabled={!pagination.hasNextPage || loading}
                className="px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* View Entry Modal */}
        {showViewModal && selectedEntry && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Journal Entry: {selectedEntry.entryNumber}
                  </h3>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  {/* Entry Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date</label>
                      <p className="text-sm text-gray-900">{formatDate(selectedEntry.date)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedEntry.status)}`}>
                        {getStatusIcon(selectedEntry.status)}
                        <span className="ml-1 capitalize">{selectedEntry.status}</span>
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Source</label>
                      <p className="text-sm text-gray-900 capitalize">{selectedEntry.source.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Currency</label>
                      <p className="text-sm text-gray-900">{selectedEntry.currency}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <p className="text-sm text-gray-900">{selectedEntry.description}</p>
                  </div>

                  {selectedEntry.notes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Notes</label>
                      <p className="text-sm text-gray-900">{selectedEntry.notes}</p>
                    </div>
                  )}

                  {/* Line Items */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Line Items</label>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Debit</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Credit</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedEntry.lineItems.map((item, index) => (
                            <tr key={index}>
                              <td className="px-4 py-2 text-sm text-gray-900">{item.accountName}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">{item.description || '-'}</td>
                              <td className="px-4 py-2 text-sm text-gray-900 text-right">
                                {item.debit > 0 ? formatCurrency(item.debit, item.currency) : '-'}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900 text-right">
                                {item.credit > 0 ? formatCurrency(item.credit, item.currency) : '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-50">
                          <tr>
                            <td colSpan={2} className="px-4 py-2 text-sm font-medium text-gray-900">Total</td>
                            <td className="px-4 py-2 text-sm font-medium text-gray-900 text-right">
                              {formatCurrency(selectedEntry.totalDebit, selectedEntry.currency)}
                            </td>
                            <td className="px-4 py-2 text-sm font-medium text-gray-900 text-right">
                              {formatCurrency(selectedEntry.totalCredit, selectedEntry.currency)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JournalEntriesPage;
