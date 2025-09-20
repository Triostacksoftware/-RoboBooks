'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  User,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  FileText,
  Settings,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Plus,
  Trash2
} from 'lucide-react';

interface AuditTrailEntry {
  _id: string;
  action: string;
  entityType: string;
  entityName?: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  metadata: {
    status: 'success' | 'warning' | 'failure';
    ipAddress?: string;
    userAgent?: string;
    changes?: any;
    errorMessage?: string;
  };
  createdAt: string;
  userId: {
    name: string;
    email: string;
  };
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
}

const AuditTrailPage = () => {
  const { user, authLoading } = useAuth();
  const [auditTrail, setAuditTrail] = useState<AuditTrailEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 50
  });

  // Filters
  const [filters, setFilters] = useState({
    action: '',
    entityType: '',
    startDate: '',
    endDate: '',
    severity: '',
    status: ''
  });

  // Summary data
  const [summary, setSummary] = useState<any>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    if (user && !authLoading) {
      loadAuditTrail();
      loadSummary();
    }
  }, [user, authLoading]);

  const loadAuditTrail = async (page = 1) => {
    try {
      setLoading(true);
      setError('');

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value))
      });

      const response = await api<{
        success: boolean;
        data: AuditTrailEntry[];
        pagination: PaginationInfo;
      }>(`/api/audit-trail?${queryParams}`);

      if (response.success) {
        setAuditTrail(response.data);
        setPagination(response.pagination);
      } else {
        setError('Failed to load audit trail');
      }
    } catch (error) {
      console.error('Error loading audit trail:', error);
      setError('Failed to load audit trail');
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      setSummaryLoading(true);
      const response = await api<{ success: boolean; data: any }>('/api/audit-trail/summary?period=30d');
      if (response.success) {
        setSummary(response.data);
      }
    } catch (error) {
      console.error('Error loading summary:', error);
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    loadAuditTrail(1);
  };

  const handleClearFilters = () => {
    setFilters({
      action: '',
      entityType: '',
      startDate: '',
      endDate: '',
      severity: '',
      status: ''
    });
    loadAuditTrail(1);
  };

  const handlePageChange = (page: number) => {
    loadAuditTrail(page);
  };

  const handleExport = async (format: 'json' | 'csv' = 'json') => {
    try {
      const queryParams = new URLSearchParams({
        format,
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value))
      });

      if (format === 'csv') {
        const response = await fetch(`/api/audit-trail/export?${queryParams}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `audit-trail-${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
      } else {
        const response = await api(`/api/audit-trail/export?${queryParams}`);
        if (response.success) {
          const dataStr = JSON.stringify(response.data, null, 2);
          const dataBlob = new Blob([dataStr], { type: 'application/json' });
          const url = window.URL.createObjectURL(dataBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `audit-trail-${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
      }
    } catch (error) {
      console.error('Error exporting audit trail:', error);
      setError('Failed to export audit trail');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'failure': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create': return <Plus className="h-4 w-4 text-green-600" />;
      case 'update': return <Settings className="h-4 w-4 text-blue-600" />;
      case 'delete': return <Trash2 className="h-4 w-4 text-red-600" />;
      case 'view': return <Eye className="h-4 w-4 text-gray-600" />;
      case 'export': return <Download className="h-4 w-4 text-purple-600" />;
      case 'login': return <User className="h-4 w-4 text-blue-600" />;
      case 'logout': return <User className="h-4 w-4 text-gray-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-600" />
          <p className="text-gray-600">Please log in to access this page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Audit Trail</h1>
              <p className="mt-2 text-gray-600">
                Track all system activities and changes
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => handleExport('json')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Export JSON
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </button>
              <button
                onClick={() => loadAuditTrail(pagination.currentPage)}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Activity className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Actions
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {summary.userStats?.totalActions || 0}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Success Rate
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {summary.userStats?.totalActions > 0 
                          ? Math.round(((summary.userStats.totalActions - summary.userStats.errorCount) / summary.userStats.totalActions) * 100)
                          : 0}%
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Errors
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {summary.userStats?.errorCount || 0}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Warnings
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {summary.userStats?.warningCount || 0}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Filters</h3>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Action
                </label>
                <select
                  value={filters.action}
                  onChange={(e) => handleFilterChange('action', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Actions</option>
                  <option value="create">Create</option>
                  <option value="update">Update</option>
                  <option value="delete">Delete</option>
                  <option value="view">View</option>
                  <option value="export">Export</option>
                  <option value="login">Login</option>
                  <option value="logout">Logout</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Entity Type
                </label>
                <select
                  value={filters.entityType}
                  onChange={(e) => handleFilterChange('entityType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Entities</option>
                  <option value="CurrencyRate">Currency Rate</option>
                  <option value="CurrencyAdjustment">Currency Adjustment</option>
                  <option value="Account">Account</option>
                  <option value="User">User</option>
                  <option value="JournalEntry">Journal Entry</option>
                  <option value="Document">Document</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Severity
                </label>
                <select
                  value={filters.severity}
                  onChange={(e) => handleFilterChange('severity', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Severities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="failure">Failure</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-4 flex space-x-3">
              <button
                onClick={handleApplyFilters}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Filter className="h-4 w-4 mr-2" />
                Apply Filters
              </button>
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <p className="text-sm text-green-800">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Audit Trail Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Audit Trail ({pagination.totalCount} entries)
            </h3>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Loading audit trail...</p>
            </div>
          ) : auditTrail.length === 0 ? (
            <div className="p-8 text-center">
              <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">No audit trail entries found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Entity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Severity
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {auditTrail.map((entry) => (
                    <tr key={entry._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(entry.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-gray-400" />
                          {entry.userId?.name || 'System'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          {getActionIcon(entry.action)}
                          <span className="ml-2 capitalize">{entry.action}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{entry.entityType}</div>
                          {entry.entityName && (
                            <div className="text-gray-500">{entry.entityName}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                        <div className="truncate" title={entry.description}>
                          {entry.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          {getStatusIcon(entry.metadata?.status || 'success')}
                          <span className="ml-2 capitalize">
                            {entry.metadata?.status || 'success'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(entry.severity)}`}>
                          {entry.severity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
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
                    <span className="font-medium">
                      {(pagination.currentPage - 1) * pagination.limit + 1}
                    </span>{' '}
                    to{' '}
                    <span className="font-medium">
                      {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)}
                    </span>{' '}
                    of{' '}
                    <span className="font-medium">{pagination.totalCount}</span>{' '}
                    results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={!pagination.hasPrevPage}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === pagination.currentPage
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={!pagination.hasNextPage}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditTrailPage;
