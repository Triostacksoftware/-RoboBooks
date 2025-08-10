import React from 'react';

interface ReportsSidebarProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterType: string;
  onFilterTypeChange: (type: string) => void;
  showFavorites: boolean;
  onShowFavoritesChange: (show: boolean) => void;
  onCreateReport: () => void;
}

const reportCategories = [
  {
    id: 'all',
    name: 'All Reports',
    icon: '📊',
  },
  {
    id: 'favorites',
    name: 'Favorites',
    icon: '⭐',
  },
  {
    id: 'business_overview',
    name: 'Business Overview',
    icon: '🏢',
    subCategories: [
      'Profit and Loss',
      'Cash Flow Statement',
      'Balance Sheet',
      'Movement of Equity',
    ],
  },
  {
    id: 'sales',
    name: 'Sales',
    icon: '💰',
    subCategories: [
      'Sales by Customer',
      'Sales by Item',
      'Sales by Sales Person',
      'Sales Summary',
      'AR Aging Summary',
      'Sales Order Details',
      'Delivery Challan Details',
      'Quote Details',
      'Customer Balance Summary',
      'Receivable Summary',
      'Receivable Details',
      'Payments Received',
      'Time to Get Paid',
      'Credit Note Details',
      'Refund History',
      'Recurring Invoices',
    ],
  },
  {
    id: 'purchases_expenses',
    name: 'Purchases and Expenses',
    icon: '🛒',
    subCategories: [
      'Vendor Balance Summary',
      'AP Aging Details',
      'Bills Details',
      'Vendor Credits Details',
      'Payments Made',
      'Purchase Order Details',
      'Purchase Orders by Vendor',
      'Payable Summary',
      'Purchases by Vendor',
      'Purchases by Item',
      'Expenses by Category',
      'Expenses by Customer',
      'Expenses by Project',
      'Expenses by Employee',
      'Billable Expenses Details',
    ],
  },
  {
    id: 'banking',
    name: 'Banking',
    icon: '🏦',
    subCategories: [
      'Bank Reconciliation',
      'Bank Statement',
      'Cash Flow',
    ],
  },
  {
    id: 'accounting',
    name: 'Accounting',
    icon: '📋',
    subCategories: [
      'General Ledger',
      'Trial Balance',
      'Journal Entries',
      'Chart of Accounts',
    ],
  },
  {
    id: 'time_tracking',
    name: 'Time Tracking',
    icon: '⏰',
    subCategories: [
      'Time by Project',
      'Time by Employee',
      'Time Summary',
    ],
  },
  {
    id: 'inventory',
    name: 'Inventory',
    icon: '📦',
    subCategories: [
      'Stock Summary',
      'Stock Movement',
      'Low Stock Items',
      'Inventory Valuation',
    ],
  },
  {
    id: 'budgets',
    name: 'Budgets',
    icon: '📈',
    subCategories: [
      'Budget vs Actual',
      'Budget Summary',
    ],
  },
  {
    id: 'currency',
    name: 'Currency',
    icon: '💱',
    subCategories: [
      'Exchange Rate History',
      'Currency Gain/Loss',
    ],
  },
  {
    id: 'activity',
    name: 'Activity',
    icon: '📝',
    subCategories: [
      'User Activity',
      'System Logs',
    ],
  },
  {
    id: 'advanced_financial',
    name: 'Advanced Financial Analysis',
    icon: '📊',
    subCategories: [
      'Financial Ratios',
      'Trend Analysis',
      'Comparative Analysis',
    ],
  },
  {
    id: 'tds_reports',
    name: 'TDS Reports',
    icon: '🏛️',
    subCategories: [
      'TDS Summary',
      'TDS Details',
    ],
  },
  {
    id: 'gst_reports',
    name: 'GST Reports',
    icon: '🏛️',
    subCategories: [
      'GST Summary',
      'GST Details',
      'GST Reconciliation',
    ],
  },
];

export default function ReportsSidebar({
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  filterType,
  onFilterTypeChange,
  showFavorites,
  onShowFavoritesChange,
  onCreateReport,
}: ReportsSidebarProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Reports Center</h2>
        
        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Filters */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={filterType}
              onChange={(e) => onFilterTypeChange(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="system">System Generated</option>
              <option value="custom">Custom Reports</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="showFavorites"
              checked={showFavorites}
              onChange={(e) => onShowFavoritesChange(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="showFavorites" className="ml-2 block text-sm text-gray-700">
              Show Favorites Only
            </label>
          </div>
        </div>

        {/* Create Report Button */}
        <button
          onClick={onCreateReport}
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Create New Report
        </button>
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto">
        <nav className="px-4 py-2">
          <ul className="space-y-1">
            {reportCategories.map((category) => (
              <li key={category.id}>
                <button
                  onClick={() => onCategoryChange(category.id)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="mr-2">{category.icon}</span>
                    <span>{category.name}</span>
                  </div>
                </button>
                
                {/* Sub-categories */}
                {category.subCategories && selectedCategory === category.id && (
                  <ul className="ml-6 mt-1 space-y-1">
                    {category.subCategories.map((subCategory, index) => (
                      <li key={index}>
                        <button className="w-full text-left px-3 py-1 rounded-md text-xs text-gray-600 hover:bg-gray-50 transition-colors">
                          {subCategory}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
