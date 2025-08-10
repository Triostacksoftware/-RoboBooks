import React from 'react';

interface Report {
  _id: string;
  name: string;
  description: string;
  type: 'system' | 'custom';
  category: string;
  subCategory?: string;
  isFavorite: boolean;
  isPublic: boolean;
  lastRun?: string;
  createdAt: string;
  updatedAt: string;
}

interface ReportsListProps {
  reports: Report[];
  loading: boolean;
  error: string | null;
  onToggleFavorite: (reportId: string) => void;
  onDeleteReport: (reportId: string) => void;
  onRefresh: () => void;
}

export default function ReportsList({
  reports,
  loading,
  error,
  onToggleFavorite,
  onDeleteReport,
  onRefresh,
}: ReportsListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getCategoryDisplayName = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      business_overview: 'Business Overview',
      sales: 'Sales',
      purchases_expenses: 'Purchases & Expenses',
      banking: 'Banking',
      accounting: 'Accounting',
      time_tracking: 'Time Tracking',
      inventory: 'Inventory',
      budgets: 'Budgets',
      currency: 'Currency',
      activity: 'Activity',
      advanced_financial: 'Advanced Financial',
      tds_reports: 'TDS Reports',
      gst_reports: 'GST Reports',
    };
    return categoryMap[category] || category;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <button
            onClick={onRefresh}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No reports found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new report.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Table Header */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Reports ({reports.length})
            </h3>
            <button
              onClick={onRefresh}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Report Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Run
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.map((report) => (
                <tr key={report._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <button
                        onClick={() => onToggleFavorite(report._id)}
                        className={`mr-2 ${report.isFavorite ? 'text-yellow-500' : 'text-gray-400'} hover:text-yellow-500`}
                      >
                        {report.isFavorite ? '⭐' : '☆'}
                      </button>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {report.name}
                        </div>
                        {report.subCategory && (
                          <div className="text-xs text-gray-500">
                            {report.subCategory}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{report.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {getCategoryDisplayName(report.category)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      report.type === 'system' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {report.type === 'system' ? 'System Generated' : 'Custom'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {report.lastRun ? formatDate(report.lastRun) : 'Never'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        View
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        Generate
                      </button>
                      <button 
                        onClick={() => onDeleteReport(report._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
