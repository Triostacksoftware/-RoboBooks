"use client";

import React, { useState, useEffect } from "react";
import { 
  PieChart, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  Settings,
  DollarSign
} from "lucide-react";
import { useToast } from "../../../../contexts/ToastContext";

interface Budget {
  _id: string;
  name: string;
  description: string;
  period: {
    start: string;
    end: string;
  };
  categories: {
    categoryId: string;
    categoryName: string;
    budgetedAmount: number;
    actualAmount: number;
    variance: number;
  }[];
  totalBudgeted: number;
  totalActual: number;
  totalVariance: number;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  activatedAt?: string;
}

const BudgetsPage = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const { showToast } = useToast();

  // Fetch budgets
  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/budgets?${params}`,
        {
          credentials: 'include',
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch budgets');
      }

      const data = await response.json();
      setBudgets(data.data || []);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      showToast('Failed to fetch budgets', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [searchTerm, statusFilter]);

  // Delete budget
  const handleDelete = async (budgetId: string) => {
    if (!confirm('Are you sure you want to delete this budget?')) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/budgets/${budgetId}`,
        {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete budget');
      }

      showToast('Budget deleted successfully', 'success');
      fetchBudgets();
    } catch (error) {
      console.error('Error deleting budget:', error);
      showToast('Failed to delete budget', 'error');
    }
  };

  // Activate budget
  const handleActivate = async (budgetId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/budgets/${budgetId}/activate`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to activate budget');
      }

      showToast('Budget activated successfully', 'success');
      fetchBudgets();
    } catch (error) {
      console.error('Error activating budget:', error);
      showToast('Failed to activate budget', 'error');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'completed':
        return <TrendingUp className="h-4 w-4 text-blue-500" />;
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
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // If no budgets exist, show the empty state with message and call-to-action
  if (budgets.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <PieChart className="h-8 w-8 text-purple-600 mr-3" />
                <h1 className="text-2xl font-bold text-gray-900">Budgets</h1>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Budget your business finance. Stay on top of your expenses.
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Create budgets for the various activities of your business, compare them with the actuals, and see how your business is performing.
            </p>
            
            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 font-medium flex items-center mx-auto"
            >
              <Plus className="h-5 w-5 mr-2" />
              CREATE BUDGET
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
              <PieChart className="h-8 w-8 text-purple-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Budgets</h1>
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
                  placeholder="Search budgets..."
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
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </button>
            </div>
          </div>
        </div>

        {/* Budgets List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Budgets ({budgets.length})
            </h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading budgets...</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {budgets.map((budget) => (
                <div key={budget._id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          {budget.name}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(budget.status)}`}>
                          {budget.status}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-1">{budget.description}</p>
                      <div className="flex items-center space-x-6 mt-2 text-sm text-gray-500">
                        <span>Period: {new Date(budget.period.start).toLocaleDateString()} - {new Date(budget.period.end).toLocaleDateString()}</span>
                        <span>Budgeted: ${budget.totalBudgeted.toFixed(2)}</span>
                        <span>Actual: ${budget.totalActual.toFixed(2)}</span>
                        <span className={`${budget.totalVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          Variance: ${budget.totalVariance.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedBudget(budget)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setSelectedBudget(budget)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {budget.status === 'draft' && (
                        <button
                          onClick={() => handleActivate(budget._id)}
                          className="p-2 text-green-400 hover:text-green-600"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(budget._id)}
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

export default BudgetsPage;
