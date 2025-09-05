"use client";

import React from "react";
import {
  EyeIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/outline";

export default function TabularView() {
  // Mock data for tabular view - all values set to 0
  const financialData = [
    {
      id: 1,
      metric: "Total Revenue",
      current: "₹0",
      previous: "₹0",
      change: "0%",
      trend: "stable",
      category: "Income",
    },
    {
      id: 2,
      metric: "Total Expenses",
      current: "₹0",
      previous: "₹0",
      change: "0%",
      trend: "stable",
      category: "Expense",
    },
    {
      id: 3,
      metric: "Net Profit",
      current: "₹0",
      previous: "₹0",
      change: "0%",
      trend: "stable",
      category: "Profit",
    },
    {
      id: 4,
      metric: "Accounts Receivable",
      current: "₹0",
      previous: "₹0",
      change: "0%",
      trend: "stable",
      category: "Asset",
    },
    {
      id: 5,
      metric: "Accounts Payable",
      current: "₹0",
      previous: "₹0",
      change: "0%",
      trend: "stable",
      category: "Liability",
    },
    {
      id: 6,
      metric: "Cash Balance",
      current: "₹0",
      previous: "₹0",
      change: "0%",
      trend: "stable",
      category: "Asset",
    },
  ];

  const recentTransactions: any[] = [];

  const topCustomers: any[] = [];

  const topExpenses: any[] = [];

  return (
    <div className="space-y-6">
      {/* Financial Metrics Table */}
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

      {/* Recent Transactions Table */}
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

      {/* Top Customers and Expenses Grid */}
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
    </div>
  );
}
