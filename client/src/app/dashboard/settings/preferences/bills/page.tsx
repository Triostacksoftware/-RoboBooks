"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeftIcon, 
  CheckIcon, 
  XMarkIcon,
  Cog6ToothIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowsUpDownIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { preferencesService } from '@/services/preferencesService';

interface BillPreferences {
  defaultSortBy: string;
  defaultSortOrder: 'asc' | 'desc';
  showColumns: {
    billNumber: boolean;
    vendorName: boolean;
    billDate: boolean;
    dueDate: boolean;
    status: boolean;
    totalAmount: boolean;
    currency: boolean;
    notes: boolean;
    createdAt: boolean;
  };
  columnWidths: {
    [key: string]: number;
  };
  itemsPerPage: number;
  showFilters: boolean;
  autoRefresh: boolean;
  refreshInterval: number; // in minutes
}

const defaultPreferences: BillPreferences = {
  defaultSortBy: 'createdAt',
  defaultSortOrder: 'desc',
  showColumns: {
    billNumber: true,
    vendorName: true,
    billDate: true,
    dueDate: true,
    status: true,
    totalAmount: true,
    currency: true,
    notes: true,
    createdAt: true,
  },
  columnWidths: {},
  itemsPerPage: 25,
  showFilters: true,
  autoRefresh: false,
  refreshInterval: 5,
};

const sortOptions = [
  { value: 'billNumber', label: 'Bill Number' },
  { value: 'vendorName', label: 'Vendor Name' },
  { value: 'billDate', label: 'Bill Date' },
  { value: 'dueDate', label: 'Due Date' },
  { value: 'status', label: 'Status' },
  { value: 'totalAmount', label: 'Total Amount' },
  { value: 'currency', label: 'Currency' },
  { value: 'createdAt', label: 'Created Date' },
];

const columnOptions = [
  { key: 'billNumber', label: 'Bill Number', required: true },
  { key: 'vendorName', label: 'Vendor Name', required: true },
  { key: 'billDate', label: 'Bill Date', required: true },
  { key: 'dueDate', label: 'Due Date', required: true },
  { key: 'status', label: 'Status', required: true },
  { key: 'totalAmount', label: 'Total Amount', required: true },
  { key: 'currency', label: 'Currency', required: false },
  { key: 'notes', label: 'Notes', required: false },
  { key: 'createdAt', label: 'Created Date', required: false },
];

export default function BillsPreferencesPage() {
  const router = useRouter();
  const [preferences, setPreferences] = useState<BillPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const savedPreferences = await preferencesService.getPreferences('bills');
      if (savedPreferences) {
        setPreferences({ ...defaultPreferences, ...savedPreferences });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      setMessage({ type: 'error', text: 'Failed to load preferences' });
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    try {
      setSaving(true);
      setMessage(null);
      await preferencesService.savePreferences('bills', preferences);
      setMessage({ type: 'success', text: 'Preferences saved successfully!' });
    } catch (error) {
      console.error('Error saving preferences:', error);
      setMessage({ type: 'error', text: 'Failed to save preferences' });
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = async () => {
    try {
      setLoading(true);
      const resetPrefs = await preferencesService.resetPreferences('bills');
      setPreferences(resetPrefs.preferences);
      setMessage({ type: 'success', text: 'Preferences reset to defaults successfully!' });
    } catch (error) {
      console.error('Error resetting preferences:', error);
      setMessage({ type: 'error', text: 'Failed to reset preferences' });
    } finally {
      setLoading(false);
    }
  };

  const updateColumnVisibility = (key: string, visible: boolean) => {
    setPreferences(prev => ({
      ...prev,
      showColumns: {
        ...prev.showColumns,
        [key]: visible
      }
    }));
  };

  const updateColumnWidth = (key: string, width: number) => {
    setPreferences(prev => ({
      ...prev,
      columnWidths: {
        ...prev.columnWidths,
        [key]: width
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <ArrowPathIcon className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading preferences...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Bills Preferences</h1>
                <p className="text-gray-600">Customize how bills are displayed and managed</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={resetToDefaults}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Reset to Defaults
              </button>
              <button
                onClick={savePreferences}
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {saving ? (
                  <ArrowPathIcon className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckIcon className="h-4 w-4" />
                )}
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8">
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        <div className="max-w-4xl space-y-8">
          {/* General Settings */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Cog6ToothIcon className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">General Settings</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Sort By
                </label>
                <select
                  value={preferences.defaultSortBy}
                  onChange={(e) => setPreferences(prev => ({ ...prev, defaultSortBy: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort Order
                </label>
                <select
                  value={preferences.defaultSortOrder}
                  onChange={(e) => setPreferences(prev => ({ ...prev, defaultSortOrder: e.target.value as 'asc' | 'desc' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Items Per Page
                </label>
                <select
                  value={preferences.itemsPerPage}
                  onChange={(e) => setPreferences(prev => ({ ...prev, itemsPerPage: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.showFilters}
                    onChange={(e) => setPreferences(prev => ({ ...prev, showFilters: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Show Filters by Default</span>
                </label>
              </div>
            </div>
          </div>

          {/* Auto Refresh Settings */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <ArrowPathIcon className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Auto Refresh Settings</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.autoRefresh}
                    onChange={(e) => setPreferences(prev => ({ ...prev, autoRefresh: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enable Auto Refresh</span>
                </label>
              </div>
              
              {preferences.autoRefresh && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Refresh Interval (minutes)
                  </label>
                  <select
                    value={preferences.refreshInterval}
                    onChange={(e) => setPreferences(prev => ({ ...prev, refreshInterval: parseInt(e.target.value) }))}
                    className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={1}>1 minute</option>
                    <option value={5}>5 minutes</option>
                    <option value={10}>10 minutes</option>
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Column Visibility */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <EyeIcon className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Column Visibility</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {columnOptions.map(column => (
                <div key={column.key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-700">{column.label}</span>
                    {column.required && (
                      <span className="text-xs text-red-500">Required</span>
                    )}
                  </div>
                  <button
                    onClick={() => updateColumnVisibility(column.key, !preferences.showColumns[column.key as keyof typeof preferences.showColumns])}
                    disabled={column.required}
                    className={`p-1 rounded ${
                      column.required 
                        ? 'cursor-not-allowed opacity-50' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {preferences.showColumns[column.key as keyof typeof preferences.showColumns] ? (
                      <EyeIcon className="h-4 w-4 text-green-600" />
                    ) : (
                      <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Column Widths */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <ArrowsUpDownIcon className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Column Widths</h2>
            </div>
            
            <div className="space-y-4">
              {columnOptions.filter(col => preferences.showColumns[col.key as keyof typeof preferences.showColumns]).map(column => (
                <div key={column.key} className="flex items-center space-x-4">
                  <div className="w-32">
                    <span className="text-sm font-medium text-gray-700">{column.label}</span>
                  </div>
                  <div className="flex-1">
                    <input
                      type="range"
                      min="100"
                      max="400"
                      value={preferences.columnWidths[column.key] || 150}
                      onChange={(e) => updateColumnWidth(column.key, parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                  <div className="w-16 text-right">
                    <span className="text-sm text-gray-500">
                      {preferences.columnWidths[column.key] || 150}px
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
