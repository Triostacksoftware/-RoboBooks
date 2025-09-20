"use client";

import React, { useState, useEffect } from "react";
import ModuleAccessGuard from "@/components/ModuleAccessGuard";
import { 
  RefreshCw, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  Calculator,
  AlertTriangle,
  Settings,
  ChevronDown
} from "lucide-react";
import { useToast } from "../../../../contexts/ToastContext";

interface BulkUpdate {
  _id: string;
  name: string;
  description: string;
  filterCriteria: {
    transactionType: string[];
    dateRange: {
      start: string;
      end: string;
    };
    accountIds: string[];
  };
  newAccountId: string;
  status: 'draft' | 'preview' | 'executed' | 'cancelled';
  affectedTransactions: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  executedAt?: string;
}

const BulkUpdatePage = () => {
  const [bulkUpdates, setBulkUpdates] = useState<BulkUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState<BulkUpdate | null>(null);
  const { showToast } = useToast();

  // Fetch bulk updates
  const fetchBulkUpdates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/bulk-updates?${params}`,
        {
          credentials: 'include',
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch bulk updates');
      }

      const data = await response.json();
      setBulkUpdates(data.data || []);
    } catch (error) {
      console.error('Error fetching bulk updates:', error);
      showToast('Failed to fetch bulk updates', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBulkUpdates();
  }, [searchTerm, statusFilter]);

  // Delete bulk update
  const handleDelete = async (updateId: string) => {
    if (!confirm('Are you sure you want to delete this bulk update?')) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/bulk-updates/${updateId}`,
        {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete bulk update');
      }

      showToast('Bulk update deleted successfully', 'success');
      fetchBulkUpdates();
    } catch (error) {
      console.error('Error deleting bulk update:', error);
      showToast('Failed to delete bulk update', 'error');
    }
  };

  // Execute bulk update
  const handleExecute = async (updateId: string) => {
    if (!confirm('Are you sure you want to execute this bulk update? This action cannot be undone.')) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/bulk-updates/${updateId}/execute`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to execute bulk update');
      }

      showToast('Bulk update executed successfully', 'success');
      fetchBulkUpdates();
    } catch (error) {
      console.error('Error executing bulk update:', error);
      showToast('Failed to execute bulk update', 'error');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'executed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'preview':
        return <Eye className="h-4 w-4 text-blue-500" />;
      case 'draft':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'executed':
        return 'bg-green-100 text-green-800';
      case 'preview':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // If no bulk updates exist, show the empty state with calculator icon and warning
  if (bulkUpdates.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Calculator className="h-8 w-8 text-purple-600 mr-3" />
                <h1 className="text-2xl font-bold text-gray-900">Bulk Update Accounts in Transactions</h1>
              </div>
              <div className="flex items-center space-x-4">
                <button className="text-sm text-gray-600 hover:text-gray-900">
                  Find Accountants
                </button>
                <div className="relative">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center">
                    <Plus className="h-4 w-4 mr-2" />
                    New
                  </button>
                </div>
                <button className="text-gray-600 hover:text-gray-900">
                  <Settings className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            {/* Calculator Icon */}
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-orange-500 rounded-full flex items-center justify-center">
              <Calculator className="h-12 w-12 text-white" />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Bulk Update Accounts in Transactions
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Filter transactions (Invoices, Credit Notes, Purchase Orders, Expenses, Bills, Vendor Credits) and bulk-update its accounts with a new account.
            </p>
            
            {/* Warning Box */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8 max-w-2xl mx-auto">
              <div className="flex items-start">
                <AlertTriangle className="h-6 w-6 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                    Important Warning
                  </h3>
                  <p className="text-yellow-700">
                    Bulk-updating accounts in transactions will cause significant changes to the financial data of your business. We recommend that you do this with the assistance of an accountant.
                  </p>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 font-medium flex items-center mx-auto"
            >
              <Filter className="h-5 w-5 mr-2" />
              Filter and Bulk Update
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Calculator className="h-8 w-8 text-purple-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Bulk Update Accounts in Transactions</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-sm text-gray-600 hover:text-gray-900">
                Find Accountants
              </button>
              <div className="relative">
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New
                </button>
              </div>
              <button className="text-gray-600 hover:text-gray-900">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search bulk updates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="preview">Preview</option>
                <option value="executed">Executed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Updates List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Bulk Updates ({bulkUpdates.length})
            </h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading bulk updates...</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {bulkUpdates.map((update) => (
                <div key={update._id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          {update.name}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(update.status)}`}>
                          {update.status}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-1">{update.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>Transactions: {update.affectedTransactions}</span>
                        <span>Created: {new Date(update.createdAt).toLocaleDateString()}</span>
                        {update.executedAt && (
                          <span>Executed: {new Date(update.executedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedUpdate(update)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setSelectedUpdate(update)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {update.status === 'preview' && (
                        <button
                          onClick={() => handleExecute(update._id)}
                          className="p-2 text-green-400 hover:text-green-600"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(update._id)}
                        className="p-2 text-red-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Wrapped with access guard
const BulkUpdatePageWithGuard = () => (
  <ModuleAccessGuard moduleName="Accountant">
    <BulkUpdatePage />
  </ModuleAccessGuard>
);

export default BulkUpdatePageWithGuard;
