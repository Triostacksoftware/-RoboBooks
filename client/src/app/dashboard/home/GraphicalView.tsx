"use client";

import React from "react";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ChartBarIcon,
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

export default function GraphicalView() {
  // Mock data for graphical view - all values set to 0
  const monthlyData = [
    { month: "Jan", revenue: 0, expenses: 0, profit: 0 },
    { month: "Feb", revenue: 0, expenses: 0, profit: 0 },
    { month: "Mar", revenue: 0, expenses: 0, profit: 0 },
    { month: "Apr", revenue: 0, expenses: 0, profit: 0 },
    { month: "May", revenue: 0, expenses: 0, profit: 0 },
    { month: "Jun", revenue: 0, expenses: 0, profit: 0 },
  ];

  const expenseBreakdown = [
    { name: "Office Supplies", value: 0, color: "#3B82F6" },
    { name: "Internet & Phone", value: 0, color: "#10B981" },
    { name: "Software Subscriptions", value: 0, color: "#8B5CF6" },
    { name: "Travel & Entertainment", value: 0, color: "#F59E0B" },
    { name: "Marketing", value: 0, color: "#EF4444" },
    { name: "Others", value: 0, color: "#6B7280" },
  ];

  const customerRevenue = [
    { name: "ABC Company", value: 0, color: "#3B82F6" },
    { name: "XYZ Corporation", value: 0, color: "#10B981" },
    { name: "DEF Limited", value: 0, color: "#8B5CF6" },
    { name: "Others", value: 0, color: "#6B7280" },
  ];

  const profitTrendData = [
    { month: "Jan", profit: 0 },
    { month: "Feb", profit: 0 },
    { month: "Mar", profit: 0 },
    { month: "Apr", profit: 0 },
    { month: "May", profit: 0 },
    { month: "Jun", profit: 0 },
  ];

  const kpiCards = [
    {
      title: "Total Revenue",
      value: "₹0",
      change: "0%",
      trend: "stable",
      icon: "💰",
      color: "bg-gray-50 border-gray-200",
    },
    {
      title: "Total Expenses",
      value: "₹0",
      change: "0%",
      trend: "stable",
      icon: "💸",
      color: "bg-gray-50 border-gray-200",
    },
    {
      title: "Net Profit",
      value: "₹0",
      change: "0%",
      trend: "stable",
      icon: "📈",
      color: "bg-gray-50 border-gray-200",
    },
    {
      title: "Cash Flow",
      value: "₹0",
      change: "0%",
      trend: "stable",
      icon: "🏦",
      color: "bg-gray-50 border-gray-200",
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
      {/* KPI Cards */}
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

      {/* Revenue vs Expenses Bar Chart */}
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

      {/* Expense Breakdown and Customer Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Breakdown Pie Chart */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Expense Breakdown</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={expenseBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
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
        </div>

        {/* Customer Revenue Distribution */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">
            Customer Revenue Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={customerRevenue}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
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
        </div>
      </div>

      {/* Profit Trend Line Chart */}
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
            Overall Profit Trend: 0%
          </span>
        </div>
      </div>

      {/* Cash Flow Area Chart */}
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

      {/* Performance Indicators */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">Performance Indicators</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">0%</div>
            <div className="text-sm text-gray-600">Customer Satisfaction</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">0%</div>
            <div className="text-sm text-gray-600">Payment Collection Rate</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">0%</div>
            <div className="text-sm text-gray-600">Expense Efficiency</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">0</div>
            <div className="text-sm text-gray-600">Active Projects</div>
          </div>
        </div>
      </div>
    </div>
  );
}
