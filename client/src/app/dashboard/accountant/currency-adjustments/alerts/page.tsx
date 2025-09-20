"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Bell, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  RefreshCw,
  Loader2
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface RateAlert {
  _id: string;
  fromCurrency: string;
  toCurrency: string;
  targetRate: number;
  condition: 'above' | 'below' | 'equals';
  isActive: boolean;
  isTriggered: boolean;
  triggeredAt?: string;
  currentRate?: number;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  notificationSettings: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

const RateAlertsPage = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [alerts, setAlerts] = useState<RateAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAlert, setEditingAlert] = useState<RateAlert | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    fromCurrency: 'USD',
    toCurrency: 'EUR',
    targetRate: '',
    condition: 'above' as 'above' | 'below' | 'equals',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    notificationSettings: {
      email: false,
      push: true,
      inApp: true
    }
  });

  // Load alerts
  const loadAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api<{ success: boolean; data: { alerts: RateAlert[] } }>('/api/currency-analytics/alerts');
      
      if (response.success) {
        setAlerts(response.data.alerts);
      }
    } catch (error) {
      console.error('Error loading alerts:', error);
      setError('Failed to load rate alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && !authLoading) {
      loadAlerts();
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

      const alertData = {
        ...formData,
        targetRate: parseFloat(formData.targetRate)
      };

      if (editingAlert) {
        // Update existing alert
        const response = await api(`/api/currency-analytics/alerts/${editingAlert._id}`, {
          method: 'PUT',
          json: alertData
        });

        if (response.success) {
          setSuccess('Rate alert updated successfully');
          setEditingAlert(null);
          setShowCreateModal(false);
          await loadAlerts();
        }
      } else {
        // Create new alert
        const response = await api('/api/currency-analytics/alerts', {
          method: 'POST',
          json: alertData
        });

        if (response.success) {
          setSuccess('Rate alert created successfully');
          setShowCreateModal(false);
          await loadAlerts();
        }
      }

      // Reset form
      setFormData({
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        targetRate: '',
        condition: 'above',
        description: '',
        priority: 'medium',
        notificationSettings: {
          email: false,
          push: true,
          inApp: true
        }
      });
    } catch (error) {
      console.error('Error saving alert:', error);
      setError('Failed to save rate alert');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete alert
  const handleDeleteAlert = async (alertId: string) => {
    if (!confirm('Are you sure you want to delete this rate alert?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await api(`/api/currency-analytics/alerts/${alertId}`, {
        method: 'DELETE'
      });

      if (response.success) {
        setSuccess('Rate alert deleted successfully');
        await loadAlerts();
      }
    } catch (error) {
      console.error('Error deleting alert:', error);
      setError('Failed to delete rate alert');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit alert
  const handleEditAlert = (alert: RateAlert) => {
    setEditingAlert(alert);
    setFormData({
      fromCurrency: alert.fromCurrency,
      toCurrency: alert.toCurrency,
      targetRate: alert.targetRate.toString(),
      condition: alert.condition,
      description: alert.description || '',
      priority: alert.priority,
      notificationSettings: alert.notificationSettings
    });
    setShowCreateModal(true);
  };

  // Toggle alert active status
  const handleToggleAlert = async (alert: RateAlert) => {
    try {
      setLoading(true);
      const response = await api(`/api/currency-analytics/alerts/${alert._id}`, {
        method: 'PUT',
        json: { isActive: !alert.isActive }
      });

      if (response.success) {
        setSuccess(`Rate alert ${alert.isActive ? 'deactivated' : 'activated'} successfully`);
        await loadAlerts();
      }
    } catch (error) {
      console.error('Error toggling alert:', error);
      setError('Failed to update rate alert');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConditionText = (condition: string) => {
    switch (condition) {
      case 'above': return 'above';
      case 'below': return 'below';
      case 'equals': return 'equals';
      default: return condition;
    }
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
                  <Bell className="h-6 w-6 text-blue-600" />
                  Rate Alerts
                </h1>
                <p className="text-sm text-gray-600">
                  Set up notifications for currency rate changes
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadAlerts}
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
                  setEditingAlert(null);
                  setShowCreateModal(true);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Alert
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

        {/* Alerts Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Rate Alerts</h3>
            <p className="text-sm text-gray-600">
              Manage your currency rate notifications
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Currency Pair
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Condition
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Target Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notifications
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {alerts.map((alert) => (
                  <tr key={alert._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {alert.fromCurrency} → {alert.toCurrency}
                      </div>
                      {alert.description && (
                        <div className="text-sm text-gray-500">{alert.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getConditionText(alert.condition)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {alert.targetRate.toFixed(4)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(alert.priority)}`}>
                        {alert.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {alert.isActive ? (
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500 mr-2" />
                        )}
                        <span className={`text-sm ${alert.isActive ? 'text-green-600' : 'text-red-600'}`}>
                          {alert.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex space-x-1">
                        {alert.notificationSettings.email && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                            Email
                          </span>
                        )}
                        {alert.notificationSettings.push && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                            Push
                          </span>
                        )}
                        {alert.notificationSettings.inApp && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                            In-App
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditAlert(alert)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleAlert(alert)}
                          className={`${alert.isActive ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}`}
                        >
                          {alert.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteAlert(alert._id)}
                          className="text-red-600 hover:text-red-900"
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
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingAlert ? 'Edit Rate Alert' : 'Create Rate Alert'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingAlert(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">From Currency</label>
                      <select
                        value={formData.fromCurrency}
                        onChange={(e) => setFormData(prev => ({ ...prev, fromCurrency: e.target.value }))}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">To Currency</label>
                      <select
                        value={formData.toCurrency}
                        onChange={(e) => setFormData(prev => ({ ...prev, toCurrency: e.target.value }))}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                      <select
                        value={formData.condition}
                        onChange={(e) => setFormData(prev => ({ ...prev, condition: e.target.value as 'above' | 'below' | 'equals' }))}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="above">Above</option>
                        <option value="below">Below</option>
                        <option value="equals">Equals</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Target Rate</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={formData.targetRate}
                        onChange={(e) => setFormData(prev => ({ ...prev, targetRate: e.target.value }))}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Enter alert description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notification Settings</label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.notificationSettings.push}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            notificationSettings: { ...prev.notificationSettings, push: e.target.checked }
                          }))}
                          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-sm text-gray-700">Push Notifications</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.notificationSettings.inApp}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            notificationSettings: { ...prev.notificationSettings, inApp: e.target.checked }
                          }))}
                          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-sm text-gray-700">In-App Notifications</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.notificationSettings.email}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            notificationSettings: { ...prev.notificationSettings, email: e.target.checked }
                          }))}
                          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-sm text-gray-700">Email Notifications</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateModal(false);
                        setEditingAlert(null);
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
                      {editingAlert ? 'Update Alert' : 'Create Alert'}
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

export default RateAlertsPage;
