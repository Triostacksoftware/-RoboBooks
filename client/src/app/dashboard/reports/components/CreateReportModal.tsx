import React, { useState } from 'react';
import { useToast } from '../../../../contexts/ToastContext';

interface CreateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateReport: (reportData: any) => Promise<void>;
}

const reportCategories = [
  { value: 'business_overview', label: 'Business Overview' },
  { value: 'sales', label: 'Sales' },
  { value: 'purchases_expenses', label: 'Purchases & Expenses' },
  { value: 'banking', label: 'Banking' },
  { value: 'accounting', label: 'Accounting' },
  { value: 'time_tracking', label: 'Time Tracking' },
  { value: 'inventory', label: 'Inventory' },
  { value: 'budgets', label: 'Budgets' },
  { value: 'currency', label: 'Currency' },
  { value: 'activity', label: 'Activity' },
  { value: 'advanced_financial', label: 'Advanced Financial' },
  { value: 'tds_reports', label: 'TDS Reports' },
  { value: 'gst_reports', label: 'GST Reports' },
];

export default function CreateReportModal({
  isOpen,
  onClose,
  onCreateReport,
}: CreateReportModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: 'System Generated',
    category: 'business_overview',
    subCategory: '',
    type: 'custom',
    isPublic: false,
    parameters: {},
    filters: {
      dateRange: {
        start: '',
        end: '',
      },
      customers: [],
      items: [],
      categories: [],
      status: [],
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      showToast('Please enter a report name', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreateReport(formData);
      // Reset form
      setFormData({
        name: '',
        description: 'System Generated',
        category: 'business_overview',
        subCategory: '',
        type: 'custom',
        isPublic: false,
        parameters: {},
        filters: {
          dateRange: {
            start: '',
            end: '',
          },
          customers: [],
          items: [],
          categories: [],
          status: [],
        },
      });
    } catch (error) {
      console.error('Create report error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Create New Report
            </h2>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter report name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {reportCategories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter report description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sub Category
              </label>
              <input
                type="text"
                value={formData.subCategory}
                onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter sub category (optional)"
              />
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.filters.dateRange.start}
                  onChange={(e) => setFormData({
                    ...formData,
                    filters: {
                      ...formData.filters,
                      dateRange: {
                        ...formData.filters.dateRange,
                        start: e.target.value,
                      },
                    },
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.filters.dateRange.end}
                  onChange={(e) => setFormData({
                    ...formData,
                    filters: {
                      ...formData.filters,
                      dateRange: {
                        ...formData.filters.dateRange,
                        end: e.target.value,
                      },
                    },
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
                  Make report public
                </label>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.name.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : 'Create Report'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
