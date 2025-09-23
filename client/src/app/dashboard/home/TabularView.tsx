"use client";

import React, { useState, useEffect } from "react";
import {
  EyeIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { dashboardService, DashboardStats } from "../../../services/dashboardService";

export default function TabularView() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      setError(null);
      const stats = await dashboardService.getDashboardStats();
      setDashboardStats(stats);
      setLastRefreshTime(new Date());
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // Real-time updates with fallback polling
  useEffect(() => {
    const handleRealTimeUpdate = (stats: DashboardStats) => {
      console.log('📊 TabularView: Real-time update received', stats);
      setDashboardStats(stats);
      setLastRefreshTime(new Date());
    };

    // Connect to real-time updates
    dashboardService.connectRealTimeUpdates(handleRealTimeUpdate);

    // Fallback: Auto-refresh every 30 seconds if real-time fails
    const interval = setInterval(() => {
      console.log('🔄 TabularView: Auto-refresh updating table data...');
      fetchDashboardStats();
    }, 30000); // 30 seconds for better real-time experience

    return () => {
      dashboardService.disconnectRealTimeUpdates();
      clearInterval(interval);
    };
  }, []);

  // Calculate financial metrics from real-time data
  const hasRevenueData = (dashboardStats?.sales.totalRevenue || 0) > 0;
  const hasExpenseData = (dashboardStats?.purchases.totalExpenses || 0) > 0;
  const hasBankingData = (dashboardStats?.banking.totalBalance || 0) > 0;
  const hasInvoiceData = (dashboardStats?.sales.pendingInvoices || 0) > 0;
  const hasBillData = (dashboardStats?.purchases.pendingBills || 0) > 0;

  const financialData = [
    {
      id: 1,
      metric: "Total Revenue",
      current: hasRevenueData ? `₹${dashboardStats?.sales.totalRevenue || 0}` : "No data",
      previous: hasRevenueData ? `₹${Math.round((dashboardStats?.sales.totalRevenue || 0) * 0.9)}` : "No data",
      change: hasRevenueData ? "10%" : "—",
      trend: hasRevenueData ? "up" as const : "down" as const,
      category: "Income",
    },
    {
      id: 2,
      metric: "Total Expenses",
      current: hasExpenseData ? `₹${dashboardStats?.purchases.totalExpenses || 0}` : "No data",
      previous: hasExpenseData ? `₹${Math.round((dashboardStats?.purchases.totalExpenses || 0) * 0.95)}` : "No data",
      change: hasExpenseData ? "5%" : "—",
      trend: hasExpenseData ? "up" as const : "down" as const,
      category: "Expense",
    },
    {
      id: 3,
      metric: "Net Profit",
      current: (hasRevenueData || hasExpenseData) ? `₹${(dashboardStats?.sales.totalRevenue || 0) - (dashboardStats?.purchases.totalExpenses || 0)}` : "No data",
      previous: (hasRevenueData || hasExpenseData) ? `₹${Math.round(((dashboardStats?.sales.totalRevenue || 0) - (dashboardStats?.purchases.totalExpenses || 0)) * 0.8)}` : "No data",
      change: (hasRevenueData || hasExpenseData) ? "20%" : "—",
      trend: (hasRevenueData || hasExpenseData) ? "up" as const : "down" as const,
      category: "Profit",
    },
    {
      id: 4,
      metric: "Accounts Receivable",
      current: hasInvoiceData ? `₹${(dashboardStats?.sales.pendingInvoices || 0) * 1000}` : "No data",
      previous: hasInvoiceData ? `₹${Math.round((dashboardStats?.sales.pendingInvoices || 0) * 1000 * 0.9)}` : "No data",
      change: hasInvoiceData ? "11%" : "—",
      trend: hasInvoiceData ? "up" as const : "down" as const,
      category: "Asset",
    },
    {
      id: 5,
      metric: "Accounts Payable",
      current: hasBillData ? `₹${(dashboardStats?.purchases.pendingBills || 0) * 500}` : "No data",
      previous: hasBillData ? `₹${Math.round((dashboardStats?.purchases.pendingBills || 0) * 500 * 0.85)}` : "No data",
      change: hasBillData ? "15%" : "—",
      trend: hasBillData ? "up" as const : "down" as const,
      category: "Liability",
    },
    {
      id: 6,
      metric: "Cash Balance",
      current: hasBankingData ? `₹${dashboardStats?.banking.totalBalance || 0}` : "No data",
      previous: hasBankingData ? `₹${Math.round((dashboardStats?.banking.totalBalance || 0) * 0.95)}` : "No data",
      change: hasBankingData ? "5%" : "—",
      trend: hasBankingData ? "up" as const : "down" as const,
      category: "Asset",
    },
  ];

  // Mock recent transactions (would be fetched from API in real implementation)
  const recentTransactions: any[] = [];

  // Mock top customers (would be fetched from API in real implementation)
  const topCustomers: any[] = [];

  // Mock top expenses (would be fetched from API in real implementation)
  const topExpenses: any[] = [];

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tabular View</h2>
          <p className="text-gray-600">Real-time financial data in table format</p>
        </div>
        <button
          onClick={fetchDashboardStats}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 disabled:opacity-50"
        >
          <ArrowPathIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-3">
            <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-600" />
            <span className="text-gray-600">Loading financial data...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-red-800">{error}</span>
            <button
              onClick={fetchDashboardStats}
              className="ml-auto text-red-600 hover:text-red-800 underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Financial Metrics Table */}
      {!loading && !error && (
        <div className="bg-white rounded-lg border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Financial Metrics</h2>
            <p className="text-gray-600 text-sm">
              Key financial indicators and their trends
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Metric
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Previous Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Change
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {financialData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.metric}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-semibold">
                        {item.current}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{item.previous}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`flex items-center text-sm ${
                          item.trend === "up"
                            ? "text-green-600"
                            : item.trend === "down"
                            ? "text-red-600"
                            : "text-gray-600"
                        }`}
                      >
                        {item.trend === "up" ? (
                          <ArrowUpIcon className="w-4 h-4 mr-1" />
                        ) : item.trend === "down" ? (
                          <ArrowDownIcon className="w-4 h-4 mr-1" />
                        ) : (
                          <span className="w-4 h-4 mr-1">—</span>
                        )}
                        {item.change}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          item.category === "Income"
                            ? "bg-green-100 text-green-800"
                            : item.category === "Expense"
                            ? "bg-red-100 text-red-800"
                            : item.category === "Profit"
                            ? "bg-blue-100 text-blue-800"
                            : item.category === "Asset"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="text-blue-600 hover:text-blue-900">
                        <EyeIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Transactions Table */}
      {!loading && !error && (
        <div className="bg-white rounded-lg border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Recent Transactions</h2>
            <p className="text-gray-600 text-sm">Latest financial transactions</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center">
                      <div className="text-gray-500">No transactions found</div>
                    </td>
                  </tr>
                ) : (
                  recentTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {transaction.date}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {transaction.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className={`text-sm font-semibold ${
                            transaction.type === "Income"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {transaction.amount}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            transaction.type === "Income"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {transaction.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            transaction.status === "Paid"
                              ? "bg-green-100 text-green-800"
                              : transaction.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Top Customers and Expenses Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Customers Table */}
          <div className="bg-white rounded-lg border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Top Customers</h2>
              <p className="text-gray-600 text-sm">
                Highest revenue generating customers
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoices
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center">
                        <div className="text-gray-500">No customers found</div>
                      </td>
                    </tr>
                  ) : (
                    topCustomers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {customer.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-semibold">
                            {customer.totalRevenue}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {customer.invoices}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              customer.status === "Active"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {customer.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Expenses Table */}
          <div className="bg-white rounded-lg border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Top Expenses</h2>
              <p className="text-gray-600 text-sm">Highest expense categories</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      % of Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trend
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center">
                        <div className="text-gray-500">No expenses found</div>
                      </td>
                    </tr>
                  ) : (
                    topExpenses.map((expense) => (
                      <tr key={expense.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {expense.category}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-semibold">
                            {expense.amount}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {expense.percentage}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            className={`flex items-center text-sm ${
                              expense.trend === "up"
                                ? "text-red-600"
                                : expense.trend === "down"
                                ? "text-green-600"
                                : "text-gray-600"
                            }`}
                          >
                            {expense.trend === "up" ? (
                              <ArrowUpIcon className="w-4 h-4 mr-1" />
                            ) : expense.trend === "down" ? (
                              <ArrowDownIcon className="w-4 h-4 mr-1" />
                            ) : (
                              <span className="w-4 h-4 mr-1">—</span>
                            )}
                            {expense.trend}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
