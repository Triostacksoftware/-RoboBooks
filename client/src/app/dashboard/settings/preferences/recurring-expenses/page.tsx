"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, CheckIcon } from "@heroicons/react/24/outline";
import { preferencesService } from "@/services/preferencesService";

interface RecurringExpensePreferences {
  defaultSortBy: string;
  defaultSortOrder: 'asc' | 'desc';
  showColumns: { [key: string]: boolean };
  columnWidths: { [key: string]: number };
  itemsPerPage: number;
  showFilters: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  defaultFilters: any[];
  showEmptyStates: boolean;
}

const defaultPreferences: RecurringExpensePreferences = {
  defaultSortBy: 'createdAt',
  defaultSortOrder: 'desc',
  showColumns: {
    name: true,
    amount: true,
    frequency: true,
    category: true,
    vendor: true,
    nextDue: true,
    status: true,
    createdAt: true
  },
  columnWidths: {
    name: 200,
    amount: 120,
    frequency: 120,
    category: 150,
    vendor: 150,
    nextDue: 120,
    status: 100,
    createdAt: 120
  },
  itemsPerPage: 25,
  showFilters: true,
  autoRefresh: false,
  refreshInterval: 5,
  defaultFilters: [],
  showEmptyStates: true
};

export default function RecurringExpensesPreferencesPage() {
  const [preferences, setPreferences] = useState<RecurringExpensePreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const data = await preferencesService.getPreferences('recurring-expenses');
      if (data?.preferences) {
        setPreferences({
          ...defaultPreferences,
          ...data.preferences,
          showColumns: { ...defaultPreferences.showColumns, ...data.preferences.showColumns },
          columnWidths: { ...defaultPreferences.columnWidths, ...data.preferences.columnWidths }
        });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      setMessage({ type: 'error', text: 'Failed to load preferences' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await preferencesService.savePreferences('recurring-expenses', preferences);
      setMessage({ type: 'success', text: 'Preferences saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving preferences:', error);
      setMessage({ type: 'error', text: 'Failed to save preferences' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      setSaving(true);
      await preferencesService.resetPreferences('recurring-expenses');
      setPreferences(defaultPreferences);
      setMessage({ type: 'success', text: 'Preferences reset to defaults!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error resetting preferences:', error);
      setMessage({ type: 'error', text: 'Failed to reset preferences' });
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = (key: keyof RecurringExpensePreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const updateColumnVisibility = (column: string, visible: boolean) => {
    setPreferences(prev => ({
      ...prev,
      showColumns: { ...prev.showColumns, [column]: visible }
    }));
  };

  const updateColumnWidth = (column: string, width: number) => {
    setPreferences(prev => ({
      ...prev,
      columnWidths: { ...prev.columnWidths, [column]: width }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Recurring Expenses Preferences</h1>
        <p className="text-gray-600 mt-2">
          Customize how recurring expenses are displayed and managed
        </p>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="space-y-8">
        {/* General Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Sort By
              </label>
              <select
                value={preferences.defaultSortBy}
                onChange={(e) => updatePreference('defaultSortBy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="name">Name</option>
                <option value="amount">Amount</option>
                <option value="frequency">Frequency</option>
                <option value="category">Category</option>
                <option value="vendor">Vendor</option>
                <option value="nextDue">Next Due Date</option>
                <option value="status">Status</option>
                <option value="createdAt">Created Date</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort Order
              </label>
              <select
                value={preferences.defaultSortOrder}
                onChange={(e) => updatePreference('defaultSortOrder', e.target.value as 'asc' | 'desc')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                onChange={(e) => updatePreference('itemsPerPage', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="showFilters"
                checked={preferences.showFilters}
                onChange={(e) => updatePreference('showFilters', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="showFilters" className="ml-2 text-sm text-gray-700">
                Show Filters by Default
              </label>
            </div>
          </div>
        </div>

        {/* Auto Refresh */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Auto Refresh</h2>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoRefresh"
                checked={preferences.autoRefresh}
                onChange={(e) => updatePreference('autoRefresh', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="autoRefresh" className="ml-2 text-sm text-gray-700">
                Enable Auto Refresh
              </label>
            </div>

            {preferences.autoRefresh && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Refresh Interval (minutes)
                </label>
                <select
                  value={preferences.refreshInterval}
                  onChange={(e) => updatePreference('refreshInterval', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Column Visibility</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(preferences.showColumns).map(([column, visible]) => (
              <div key={column} className="flex items-center">
                <input
                  type="checkbox"
                  id={`column-${column}`}
                  checked={visible}
                  onChange={(e) => updateColumnVisibility(column, e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={`column-${column}`} className="ml-2 text-sm text-gray-700 capitalize">
                  {column.replace(/([A-Z])/g, ' $1').trim()}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Column Widths */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Column Widths</h2>
          
          <div className="space-y-4">
            {Object.entries(preferences.columnWidths).map(([column, width]) => (
              <div key={column} className="flex items-center space-x-4">
                <label className="w-32 text-sm text-gray-700 capitalize">
                  {column.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <input
                  type="range"
                  min="80"
                  max="300"
                  value={width}
                  onChange={(e) => updateColumnWidth(column, parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="w-12 text-sm text-gray-500">{width}px</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex justify-end space-x-4">
        <button
          onClick={handleReset}
          disabled={saving}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          Reset to Defaults
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <CheckIcon className="h-4 w-4 mr-2" />
              Save Preferences
            </>
          )}
        </button>
      </div>
    </div>
  );
}
