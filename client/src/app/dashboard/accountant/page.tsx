"use client";

import React from "react";
import Link from "next/link";
import { 
  BookOpen, 
  RefreshCw, 
  PieChart, 
  Calculator,
  FileText,
  Settings,
  TrendingUp,
  BarChart3,
  Scale
} from "lucide-react";

const AccountantPage = () => {
  const accountantModules = [
    {
      title: "Profit & Loss Report",
      description: "View and analyze your profit and loss statement",
      icon: TrendingUp,
      href: "/dashboard/accountant/profit-loss",
      color: "bg-green-500",
      features: [
        "Real-time P&L calculations",
        "Date range filtering",
        "Cash vs accrual basis",
        "Export capabilities"
      ]
    },
    {
      title: "Balance Sheet",
      description: "View your financial position at any point in time",
      icon: Scale,
      href: "/dashboard/accountant/balance-sheet",
      color: "bg-blue-500",
      features: [
        "Assets, liabilities & equity",
        "As-of-date reporting",
        "Account balance tracking",
        "Financial position analysis"
      ]
    },
    {
      title: "Manual Journals",
      description: "Create and manage manual journal entries",
      icon: BookOpen,
      href: "/dashboard/accountant/manual-journals",
      color: "bg-purple-500",
      features: [
        "Create journal entries",
        "Post and manage entries",
        "Track debit and credit balances",
        "Generate journal reports"
      ]
    },
    {
      title: "Bulk Update",
      description: "Update account information across multiple transactions",
      icon: RefreshCw,
      href: "/dashboard/accountant/bulk-update",
      color: "bg-orange-500",
      features: [
        "Filter transactions by criteria",
        "Bulk update account assignments",
        "Preview changes before applying",
        "Track update history"
      ]
    },
    {
      title: "Budgets",
      description: "Create and manage business budgets",
      icon: PieChart,
      href: "/dashboard/accountant/budgets",
      color: "bg-indigo-500",
      features: [
        "Set budget targets",
        "Track actual vs budgeted amounts",
        "Generate variance reports",
        "Monitor budget performance"
      ]
    },
    {
      title: "Chart of Accounts",
      description: "Manage your chart of accounts structure",
      icon: BarChart3,
      href: "/dashboard/accountant/chart-of-accounts",
      color: "bg-red-500",
      features: [
        "Organize account hierarchy",
        "Set account types and categories",
        "Configure account settings",
        "Import/export account structure"
      ]
    },
    {
      title: "Currency Adjustments",
      description: "Handle currency conversion and adjustments",
      icon: TrendingUp,
      href: "/dashboard/accountant/currency-adjustments",
      color: "bg-red-500",
      features: [
        "Multi-currency support",
        "Exchange rate management",
        "Currency conversion entries",
        "Foreign exchange gains/losses"
      ]
    },
    {
      title: "Transaction Locking",
      description: "Control transaction editing and posting",
      icon: Settings,
      href: "/dashboard/accountant/transaction-locking",
      color: "bg-gray-500",
      features: [
        "Lock periods and transactions",
        "Control user permissions",
        "Audit trail management",
        "Data integrity protection"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Calculator className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Accountant</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Professional accounting tools</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Accountant Tools
          </h2>
          <p className="text-lg text-gray-600">
            Professional accounting features to help you manage your financial data with precision and control.
          </p>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accountantModules.map((module) => {
            const IconComponent = module.icon;
            return (
              <Link
                key={module.title}
                href={module.href}
                className="group block"
              >
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center mb-4">
                    <div className={`p-3 rounded-lg ${module.color} text-white mr-4`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {module.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {module.description}
                      </p>
                    </div>
                  </div>
                  
                  <ul className="space-y-2">
                    {module.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <span className="text-sm font-medium text-blue-600 group-hover:text-blue-700">
                      Open {module.title} →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-sm text-gray-600">Draft Journals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-gray-600">Active Budgets</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">0</div>
              <div className="text-sm text-gray-600">Pending Updates</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">0</div>
              <div className="text-sm text-gray-600">Locked Periods</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountantPage;
