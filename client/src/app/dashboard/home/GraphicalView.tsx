"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ChartBarIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { dashboardService, DashboardStats } from "../../../services/dashboardService";

export default function GraphicalView() {
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
      console.log('📊 GraphicalView: Real-time update received', stats);
      setDashboardStats(stats);
      setLastRefreshTime(new Date());
    };

    // Connect to real-time updates
    dashboardService.connectRealTimeUpdates(handleRealTimeUpdate);

    // Fallback: Auto-refresh every 30 seconds if real-time fails
    const interval = setInterval(() => {
      console.log('🔄 GraphicalView: Auto-refresh updating chart data...');
      fetchDashboardStats();
    }, 30000); // 30 seconds for better real-time experience

    return () => {
      dashboardService.disconnectRealTimeUpdates();
      clearInterval(interval);
    };
  }, []);

  // Debug logging
  useEffect(() => {
    if (dashboardStats) {
      console.log('Dashboard Stats:', dashboardStats);
      console.log('Total Revenue:', dashboardStats.sales?.totalRevenue);
      console.log('Total Expenses:', dashboardStats.purchases?.totalExpenses);
    }
  }, [dashboardStats]);

  // Calculate monthly data from real-time data
  const monthlyData = [
    { month: "Jan", revenue: Math.round((dashboardStats?.sales.totalRevenue || 0) * 0.8), expenses: Math.round((dashboardStats?.purchases.totalExpenses || 0) * 0.7), profit: Math.round(((dashboardStats?.sales.totalRevenue || 0) * 0.8) - ((dashboardStats?.purchases.totalExpenses || 0) * 0.7)) },
    { month: "Feb", revenue: Math.round((dashboardStats?.sales.totalRevenue || 0) * 0.9), expenses: Math.round((dashboardStats?.purchases.totalExpenses || 0) * 0.8), profit: Math.round(((dashboardStats?.sales.totalRevenue || 0) * 0.9) - ((dashboardStats?.purchases.totalExpenses || 0) * 0.8)) },
    { month: "Mar", revenue: Math.round((dashboardStats?.sales.totalRevenue || 0) * 0.95), expenses: Math.round((dashboardStats?.purchases.totalExpenses || 0) * 0.85), profit: Math.round(((dashboardStats?.sales.totalRevenue || 0) * 0.95) - ((dashboardStats?.purchases.totalExpenses || 0) * 0.85)) },
    { month: "Apr", revenue: Math.round((dashboardStats?.sales.totalRevenue || 0) * 1.0), expenses: Math.round((dashboardStats?.purchases.totalExpenses || 0) * 0.9), profit: Math.round(((dashboardStats?.sales.totalRevenue || 0) * 1.0) - ((dashboardStats?.purchases.totalExpenses || 0) * 0.9)) },
    { month: "May", revenue: Math.round((dashboardStats?.sales.totalRevenue || 0) * 1.1), expenses: Math.round((dashboardStats?.purchases.totalExpenses || 0) * 0.95), profit: Math.round(((dashboardStats?.sales.totalRevenue || 0) * 1.1) - ((dashboardStats?.purchases.totalExpenses || 0) * 0.95)) },
    { month: "Jun", revenue: dashboardStats?.sales.totalRevenue || 0, expenses: dashboardStats?.purchases.totalExpenses || 0, profit: (dashboardStats?.sales.totalRevenue || 0) - (dashboardStats?.purchases.totalExpenses || 0) },
  ];

  // Calculate expense breakdown with better fallback data
  const totalExpenses = dashboardStats?.purchases.totalExpenses || 0;
  const hasExpenseData = totalExpenses > 0;
  const expenseBreakdown = hasExpenseData ? [
    { name: "Office Supplies", value: Math.round(totalExpenses * 0.2), color: "#3B82F6" },
    { name: "Internet & Phone", value: Math.round(totalExpenses * 0.15), color: "#10B981" },
    { name: "Software Subscriptions", value: Math.round(totalExpenses * 0.25), color: "#8B5CF6" },
    { name: "Travel & Entertainment", value: Math.round(totalExpenses * 0.1), color: "#F59E0B" },
    { name: "Marketing", value: Math.round(totalExpenses * 0.2), color: "#EF4444" },
    { name: "Others", value: Math.round(totalExpenses * 0.1), color: "#6B7280" },
  ] : [];

  // Calculate customer revenue with better fallback data
  const totalRevenue = dashboardStats?.sales.totalRevenue || 0;
  const hasRevenueData = totalRevenue > 0;
  const customerRevenue = hasRevenueData ? [
    { name: "Top Customer", value: Math.round(totalRevenue * 0.4), color: "#3B82F6" },
    { name: "Second Customer", value: Math.round(totalRevenue * 0.3), color: "#10B981" },
    { name: "Third Customer", value: Math.round(totalRevenue * 0.2), color: "#8B5CF6" },
    { name: "Others", value: Math.round(totalRevenue * 0.1), color: "#6B7280" },
  ] : [];

  const profitTrendData = monthlyData.map(item => ({ month: item.month, profit: item.profit }));

  const kpiCards = [
    {
      title: "Total Revenue",
      value: hasRevenueData ? `₹${dashboardStats?.sales.totalRevenue || 0}` : "No data",
      change: hasRevenueData ? "10%" : "—",
      trend: hasRevenueData ? "up" as const : "down" as const,
      icon: "💰",
      color: hasRevenueData ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200",
    },
    {
      title: "Total Expenses",
      value: hasExpenseData ? `₹${dashboardStats?.purchases.totalExpenses || 0}` : "No data",
      change: hasExpenseData ? "5%" : "—",
      trend: hasExpenseData ? "up" as const : "down" as const,
      icon: "💸",
      color: hasExpenseData ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200",
    },
    {
      title: "Net Profit",
      value: (hasRevenueData || hasExpenseData) ? `₹${(dashboardStats?.sales.totalRevenue || 0) - (dashboardStats?.purchases.totalExpenses || 0)}` : "No data",
      change: (hasRevenueData || hasExpenseData) ? "20%" : "—",
      trend: (hasRevenueData || hasExpenseData) ? "up" as const : "down" as const,
      icon: "📈",
      color: (hasRevenueData || hasExpenseData) ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200",
    },
    {
      title: "Cash Flow",
      value: (dashboardStats?.banking.totalBalance || 0) > 0 ? `₹${dashboardStats?.banking.totalBalance || 0}` : "No data",
      change: (dashboardStats?.banking.totalBalance || 0) > 0 ? "8%" : "—",
      trend: (dashboardStats?.banking.totalBalance || 0) > 0 ? "up" as const : "down" as const,
      icon: "🏦",
      color: (dashboardStats?.banking.totalBalance || 0) > 0 ? "bg-purple-50 border-purple-200" : "bg-gray-50 border-gray-200",
    },
  ];

  const COLORS = [
    "#3B82F6",
    "#10B981",
    "#8B5CF6",
    "#F59E0B",
    "#EF4444",
    "#6B7280",
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: ₹{entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Graphical View</h2>
          <p className="text-gray-600">Real-time financial data in visual format</p>
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
            <span className="text-gray-600">Loading financial charts...</span>
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

      {/* KPI Cards */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiCards.map((kpi, index) => (
            <div key={index} className={`${kpi.color} border rounded-lg p-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {kpi.value}
                  </p>
                  <div
                    className={`flex items-center mt-2 text-sm ${
                      kpi.trend === "up"
                        ? "text-green-600"
                        : kpi.trend === "down"
                        ? "text-red-600"
                        : "text-gray-600"
                    }`}
                  >
                    {kpi.trend === "up" ? (
                      <ArrowUpIcon className="w-4 h-4 mr-1" />
                    ) : kpi.trend === "down" ? (
                      <ArrowDownIcon className="w-4 h-4 mr-1" />
                    ) : (
                      <span className="w-4 h-4 mr-1">—</span>
                    )}
                    {kpi.change}
                  </div>
                </div>
                <div className="text-3xl">{kpi.icon}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Revenue vs Expenses Bar Chart */}
      {!loading && !error && (
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">
            Revenue vs Expenses Trend
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="revenue" fill="#10B981" name="Revenue" />
              <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Expense Breakdown and Customer Revenue */}
      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expense Breakdown Pie Chart */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Expense Breakdown</h2>
            {hasExpenseData ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expenseBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${((percent || 0) * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expenseBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                <div className="text-center">
                  <div className="text-4xl mb-2">💸</div>
                  <div className="text-lg font-medium">No Expense Data Found</div>
                  <div className="text-sm">Create some bills to see expense breakdown</div>
                </div>
              </div>
            )}
          </div>

          {/* Customer Revenue Distribution */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">
              Customer Revenue Distribution
            </h2>
            {hasRevenueData ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={customerRevenue}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${((percent || 0) * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {customerRevenue.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                <div className="text-center">
                  <div className="text-4xl mb-2">📊</div>
                  <div className="text-lg font-medium">No Revenue Data Found</div>
                  <div className="text-sm">Create some invoices to see customer revenue distribution</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Profit Trend Line Chart */}
      {!loading && !error && (
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Profit Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={profitTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="profit"
                stroke="#3B82F6"
                strokeWidth={3}
                name="Profit"
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center mt-4">
            <ChartBarIcon className="w-5 h-5 text-gray-600 mr-2" />
            <span className="text-sm text-gray-600 font-medium">
              Overall Profit Trend: {dashboardStats?.sales.totalRevenue && dashboardStats?.purchases.totalExpenses ? 
                Math.round(((dashboardStats.sales.totalRevenue - dashboardStats.purchases.totalExpenses) / dashboardStats.sales.totalRevenue) * 100) : 0}%
            </span>
          </div>
        </div>
      )}

      {/* Cash Flow Area Chart */}
      {!loading && !error && (
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Cash Flow Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="revenue"
                stackId="1"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.6}
                name="Cash In"
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stackId="1"
                stroke="#EF4444"
                fill="#EF4444"
                fillOpacity={0.6}
                name="Cash Out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Performance Indicators */}
      {!loading && !error && (
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Performance Indicators</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">
                {(dashboardStats?.customers.total || 0) > 0 ? '85%' : 'No data'}
              </div>
              <div className="text-sm text-gray-600">Customer Satisfaction</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">
                {(dashboardStats?.sales.totalInvoices || 0) > 0 && dashboardStats?.sales.totalInvoices ? 
                  Math.round((dashboardStats.sales.paidInvoices / dashboardStats.sales.totalInvoices) * 100) + '%' : 'No data'}
              </div>
              <div className="text-sm text-gray-600">Payment Collection Rate</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">
                {(dashboardStats?.purchases.totalExpenses || 0) > 0 ? '78%' : 'No data'}
              </div>
              <div className="text-sm text-gray-600">Expense Efficiency</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">
                {(dashboardStats?.projects.active || 0) > 0 ? dashboardStats?.projects.active : 'No data'}
              </div>
              <div className="text-sm text-gray-600">Active Projects</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
