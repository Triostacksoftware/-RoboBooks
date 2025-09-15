"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeftIcon, 
  PlusIcon, 
  XMarkIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { customViewService, CustomFilter, CustomView } from '@/services/customViewService';

const CustomViewPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Custom view state
  const [viewName, setViewName] = useState('');
  const [description, setDescription] = useState('');
  const [customFilters, setCustomFilters] = useState<CustomFilter[]>([]);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedColumns, setSelectedColumns] = useState<string[]>(['date', 'description', 'amount', 'vendor', 'status']);
  const [isDefault, setIsDefault] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  
  // Results state
  const [results, setResults] = useState<any[]>([]);
  const [resultsCount, setResultsCount] = useState(0);
  const [resultsLoading, setResultsLoading] = useState(false);

  const module = 'vendor-credits';

  // Available options
  const availableFilterFields = customViewService.getAvailableFilterFields(module);
  const availableSortFields = customViewService.getAvailableSortFields(module);
  const availableColumns = customViewService.getAvailableColumns(module);

  // Load saved custom views on mount
  useEffect(() => {
    loadCustomViews();
  }, []);

  // Apply filters when they change
  useEffect(() => {
    applyFilters();
  }, [customFilters, sortBy, sortOrder, selectedColumns, searchTerm]);

  const loadCustomViews = async () => {
    try {
      setLoading(true);
      const views = await customViewService.getCustomViews(module);
    } catch (error) {
      console.error('Error loading custom views:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    try {
      setResultsLoading(true);
      const response = await customViewService.applyCustomView(module, {
        filters: customFilters,
        sortBy,
        sortOrder,
        columns: selectedColumns,
        searchTerm: searchTerm || undefined
      });
      
      setResults(response.data);
      setResultsCount(response.count);
    } catch (error) {
      console.error('Error applying filters:', error);
      setResults([]);
      setResultsCount(0);
    } finally {
      setResultsLoading(false);
    }
  };

  const addFilter = () => {
    const newFilter: CustomFilter = {
      id: Date.now().toString(),
      field: 'description',
      operator: 'contains',
      value: ''
    };
    setCustomFilters([...customFilters, newFilter]);
  };

  const removeFilter = (filterId: string) => {
    setCustomFilters(customFilters.filter(f => f.id !== filterId));
  };

  const updateFilter = (filterId: string, updates: Partial<CustomFilter>) => {
    setCustomFilters(customFilters.map(f => 
      f.id === filterId ? { ...f, ...updates } : f
    ));
  };

  const getFieldType = (field: string) => {
    const fieldConfig = availableFilterFields.find(f => f.value === field);
    return fieldConfig?.type || 'text';
  };

  const getAvailableOperators = (field: string) => {
    const fieldType = getFieldType(field);
    return customViewService.getAvailableOperators(fieldType);
  };

  const toggleColumn = (column: string) => {
    if (selectedColumns.includes(column)) {
      setSelectedColumns(selectedColumns.filter(c => c !== column));
    } else {
      setSelectedColumns([...selectedColumns, column]);
    }
  };

  const saveCustomView = async () => {
    if (!viewName.trim()) {
      alert('Please enter a view name');
      return;
    }

    try {
      setSaving(true);
      const customView: Omit<CustomView, '_id' | 'createdAt' | 'updatedAt'> = {
        name: viewName.trim(),
        description: description.trim() || undefined,
        module,
        filters: customFilters,
        sortBy,
        sortOrder,
        columns: selectedColumns,
        isDefault,
        isPublic
      };

      await customViewService.createCustomView(module, customView);
      alert('Custom view saved successfully!');
      router.back();
    } catch (error) {
      console.error('Error saving custom view:', error);
      alert('Error saving custom view. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const formatValue = (value: any, column: string) => {
    if (value === null || value === undefined) return '-';
    
    if (column === 'date') {
      return new Date(value).toLocaleDateString();
    }
    
    if (column === 'amount') {
      return typeof value === 'number' ? value.toFixed(2) : value;
    }
    
    return value.toString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              <span>Back</span>
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">Create Custom View - Vendor Credits</h1>
          </div>
          <button
            onClick={saveCustomView}
            disabled={saving || !viewName.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save View'}
          </button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Panel - Configuration */}
        <div className="w-1/2 bg-white border-r border-gray-200 p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* View Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                View Name
              </label>
              <input
                type="text"
                value={viewName}
                onChange={(e) => setViewName(e.target.value)}
                placeholder="Enter view name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Filters
                </label>
                <button
                  onClick={addFilter}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Add Filter</span>
                </button>
              </div>
              
              {customFilters.length === 0 ? (
                <p className="text-gray-500 text-sm">No filters applied</p>
              ) : (
                <div className="space-y-3">
                  {customFilters.map((filter) => (
                    <div key={filter.id} className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg">
                      <select
                        value={filter.field}
                        onChange={(e) => updateFilter(filter.id, { field: e.target.value, operator: 'contains', value: '' })}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        {availableFilterFields.map(field => (
                          <option key={field.value} value={field.value}>
                            {field.label}
                          </option>
                        ))}
                      </select>
                      
                      <select
                        value={filter.operator}
                        onChange={(e) => updateFilter(filter.id, { operator: e.target.value })}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        {getAvailableOperators(filter.field).map(op => (
                          <option key={op.value} value={op.value}>
                            {op.label}
                          </option>
                        ))}
                      </select>
                      
                      <input
                        type={getFieldType(filter.field) === 'number' ? 'number' : 
                              getFieldType(filter.field) === 'date' ? 'date' : 'text'}
                        value={filter.value}
                        onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                        placeholder="Enter value"
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      
                      <button
                        onClick={() => removeFilter(filter.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sorting */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Sorting
              </label>
              <div className="flex items-center space-x-3">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Sort by</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {availableSortFields.map(field => (
                      <option key={field.value} value={field.value}>
                        {field.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Order</label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Columns */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Columns
              </label>
              <div className="space-y-2">
                {availableColumns.map(column => (
                  <label key={column.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedColumns.includes(column.value)}
                      onChange={() => toggleColumn(column.value)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{column.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Options
              </label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Set as default view</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Make public (visible to all users)</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Results Preview */}
        <div className="w-1/2 bg-white p-6 overflow-y-auto">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search vendor credits..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Results Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Results ({resultsCount})
              </h3>
              {resultsLoading && (
                <div className="text-sm text-gray-500">Loading...</div>
              )}
            </div>

            {/* Results Table */}
            {results.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {resultsLoading ? 'Loading...' : 'No results found'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {selectedColumns.map(column => (
                        <th
                          key={column}
                          className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {availableColumns.find(c => c.value === column)?.label || column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {results.map((item, index) => (
                      <tr key={item._id || index} className="hover:bg-gray-50">
                        {selectedColumns.map(column => (
                          <td key={column} className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                            {formatValue(item[column], column)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomViewPage;
