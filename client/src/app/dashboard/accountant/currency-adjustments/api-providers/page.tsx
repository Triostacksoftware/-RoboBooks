"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Play,
  Pause,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Loader2,
  Globe,
  Zap,
  BarChart3
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface ApiProvider {
  _id: string;
  name: string;
  displayName: string;
  baseUrl: string;
  isActive: boolean;
  priority: number;
  successRate: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  lastUsed?: string;
  lastError?: {
    message: string;
    timestamp: string;
    errorCode: string;
  };
  supportedCurrencies: string[];
  rateLimit: {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
  };
  timeout: number;
  retryAttempts: number;
  description?: string;
  website?: string;
  createdAt: string;
  updatedAt: string;
}

const ApiProvidersPage = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [providers, setProviders] = useState<ApiProvider[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState<ApiProvider | null>(null);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    baseUrl: '',
    apiKey: '',
    isActive: true,
    priority: 1,
    supportedCurrencies: [] as string[],
    rateLimit: {
      requestsPerMinute: 60,
      requestsPerHour: 1000,
      requestsPerDay: 10000
    },
    timeout: 10000,
    retryAttempts: 3,
    description: '',
    website: ''
  });

  // Load providers
  const loadProviders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api<{ success: boolean; data: ApiProvider[] }>('/api/api-providers');
      
      if (response.success) {
        setProviders(response.data);
      }
    } catch (error) {
      console.error('Error loading providers:', error);
      setError('Failed to load API providers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && !authLoading) {
      loadProviders();
    }
  }, [user, authLoading]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/signin');
    }
  }, [user, authLoading, router]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);

      if (editingProvider) {
        // Update existing provider
        const response = await api(`/api/api-providers/${editingProvider._id}`, {
          method: 'PUT',
          json: formData
        });

        if (response.success) {
          setSuccess('API provider updated successfully');
          setEditingProvider(null);
          setShowCreateModal(false);
          await loadProviders();
        }
      } else {
        // Create new provider
        const response = await api('/api/api-providers', {
          method: 'POST',
          json: formData
        });

        if (response.success) {
          setSuccess('API provider created successfully');
          setShowCreateModal(false);
          await loadProviders();
        }
      }

      // Reset form
      setFormData({
        name: '',
        displayName: '',
        baseUrl: '',
        apiKey: '',
        isActive: true,
        priority: 1,
        supportedCurrencies: [],
        rateLimit: {
          requestsPerMinute: 60,
          requestsPerHour: 1000,
          requestsPerDay: 10000
        },
        timeout: 10000,
        retryAttempts: 3,
        description: '',
        website: ''
      });
    } catch (error) {
      console.error('Error saving provider:', error);
      setError('Failed to save API provider');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete provider
  const handleDeleteProvider = async (providerId: string) => {
    if (!confirm('Are you sure you want to delete this API provider?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await api(`/api/api-providers/${providerId}`, {
        method: 'DELETE'
      });

      if (response.success) {
        setSuccess('API provider deleted successfully');
        await loadProviders();
      }
    } catch (error) {
      console.error('Error deleting provider:', error);
      setError('Failed to delete API provider');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit provider
  const handleEditProvider = (provider: ApiProvider) => {
    setEditingProvider(provider);
    setFormData({
      name: provider.name,
      displayName: provider.displayName,
      baseUrl: provider.baseUrl,
      apiKey: '', // Don't show existing API key for security
      isActive: provider.isActive,
      priority: provider.priority,
      supportedCurrencies: provider.supportedCurrencies,
      rateLimit: provider.rateLimit,
      timeout: provider.timeout,
      retryAttempts: provider.retryAttempts,
      description: provider.description || '',
      website: provider.website || ''
    });
    setShowCreateModal(true);
  };

  // Handle toggle provider status
  const handleToggleProvider = async (provider: ApiProvider) => {
    try {
      setLoading(true);
      const response = await api(`/api/api-providers/${provider._id}`, {
        method: 'PUT',
        json: { isActive: !provider.isActive }
      });

      if (response.success) {
        setSuccess(`API provider ${provider.isActive ? 'deactivated' : 'activated'} successfully`);
        await loadProviders();
      }
    } catch (error) {
      console.error('Error toggling provider:', error);
      setError('Failed to update API provider status');
    } finally {
      setLoading(false);
    }
  };

  // Handle test provider
  const handleTestProvider = async (providerId: string) => {
    try {
      setTestingProvider(providerId);
      const response = await api(`/api/api-providers/${providerId}/test`, {
        method: 'POST',
        json: { fromCurrency: 'USD', toCurrency: 'EUR' }
      });

      if (response.success) {
        setSuccess('API provider test completed successfully');
        await loadProviders(); // Refresh to get updated stats
      }
    } catch (error) {
      console.error('Error testing provider:', error);
      setError('Failed to test API provider');
    } finally {
      setTestingProvider(null);
    }
  };

  // Handle initialize defaults
  const handleInitializeDefaults = async () => {
    try {
      setLoading(true);
      const response = await api('/api/api-providers/initialize-defaults', {
        method: 'POST'
      });

      if (response.success) {
        setSuccess('Default API providers initialized successfully');
        await loadProviders();
      }
    } catch (error) {
      console.error('Error initializing defaults:', error);
      setError('Failed to initialize default providers');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
                  <Settings className="h-6 w-6 text-blue-600" />
                  API Providers
                </h1>
                <p className="text-sm text-gray-600">
                  Manage exchange rate API providers and fallback options
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleInitializeDefaults}
                disabled={loading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <Zap className="h-4 w-4 mr-2" />
                Initialize Defaults
              </button>
              <button
                onClick={loadProviders}
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
              <button
                onClick={() => {
                  setEditingProvider(null);
                  setShowCreateModal(true);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Provider
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

        {/* Providers Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">API Providers</h3>
            <p className="text-sm text-gray-600">
              Configure and manage exchange rate API providers
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Provider
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Success Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requests
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Used
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {providers.map((provider) => (
                  <tr key={provider._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Globe className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{provider.displayName}</div>
                          <div className="text-sm text-gray-500">{provider.name}</div>
                          {provider.website && (
                            <a 
                              href={provider.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              {provider.website}
                            </a>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(provider.isActive)}`}>
                        {getStatusIcon(provider.isActive)}
                        <span className="ml-1">{provider.isActive ? 'Active' : 'Inactive'}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {provider.priority}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className={`h-2 rounded-full ${provider.successRate >= 90 ? 'bg-green-600' : provider.successRate >= 70 ? 'bg-yellow-600' : 'bg-red-600'}`}
                            style={{ width: `${provider.successRate}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900">{provider.successRate.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="text-green-600">{provider.successfulRequests}</div>
                      <div className="text-red-600">{provider.failedRequests}</div>
                      <div className="text-gray-500 text-xs">Total: {provider.totalRequests}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {provider.lastUsed ? formatDate(provider.lastUsed) : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleTestProvider(provider._id)}
                          disabled={testingProvider === provider._id}
                          className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                          title="Test Provider"
                        >
                          {testingProvider === provider._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleEditProvider(provider)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit Provider"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleProvider(provider)}
                          className={`${provider.isActive ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}`}
                          title={provider.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {provider.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteProvider(provider._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Provider"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-4/5 max-w-2xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingProvider ? 'Edit API Provider' : 'Create API Provider'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingProvider(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                      <input
                        type="text"
                        value={formData.displayName}
                        onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Base URL</label>
                    <input
                      type="url"
                      value={formData.baseUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, baseUrl: e.target.value }))}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">API Key (Optional)</label>
                    <input
                      type="password"
                      value={formData.apiKey}
                      onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Enter API key if required"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={formData.priority}
                        onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      />
                    </div>
                    <div className="flex items-center">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-sm text-gray-700">Active</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Timeout (ms)</label>
                      <input
                        type="number"
                        value={formData.timeout}
                        onChange={(e) => setFormData(prev => ({ ...prev, timeout: parseInt(e.target.value) }))}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Retry Attempts</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={formData.retryAttempts}
                        onChange={(e) => setFormData(prev => ({ ...prev, retryAttempts: parseInt(e.target.value) }))}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Requests/Min</label>
                      <input
                        type="number"
                        value={formData.rateLimit.requestsPerMinute}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          rateLimit: { ...prev.rateLimit, requestsPerMinute: parseInt(e.target.value) }
                        }))}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateModal(false);
                        setEditingProvider(null);
                      }}
                      className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : null}
                      {editingProvider ? 'Update Provider' : 'Create Provider'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiProvidersPage;
