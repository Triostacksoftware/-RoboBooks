'use client'

import React from 'react'
import { EyeIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline'

export default function TabularView() {
  // Mock data for tabular view
  const financialData = [
    {
      id: 1,
      metric: 'Total Revenue',
      current: '₹125,000',
      previous: '₹98,000',
      change: '+27.6%',
      trend: 'up',
      category: 'Income'
    },
    {
      id: 2,
      metric: 'Total Expenses',
      current: '₹78,500',
      previous: '₹65,200',
      change: '+20.4%',
      trend: 'up',
      category: 'Expense'
    },
    {
      id: 3,
      metric: 'Net Profit',
      current: '₹46,500',
      previous: '₹32,800',
      change: '+41.8%',
      trend: 'up',
      category: 'Profit'
    },
    {
      id: 4,
      metric: 'Accounts Receivable',
      current: '₹23,400',
      previous: '₹18,900',
      change: '+23.8%',
      trend: 'up',
      category: 'Asset'
    },
    {
      id: 5,
      metric: 'Accounts Payable',
      current: '₹15,600',
      previous: '₹12,300',
      change: '+26.8%',
      trend: 'up',
      category: 'Liability'
    },
    {
      id: 6,
      metric: 'Cash Balance',
      current: '₹67,800',
      previous: '₹54,200',
      change: '+25.1%',
      trend: 'up',
      category: 'Asset'
    }
  ]

  const recentTransactions = [
    {
      id: 1,
      date: '2024-01-15',
      description: 'Invoice #INV-001 - ABC Company',
      amount: '₹12,500',
      type: 'Income',
      status: 'Paid'
    },
    {
      id: 2,
      date: '2024-01-14',
      description: 'Office Supplies - Stationery Store',
      amount: '₹2,300',
      type: 'Expense',
      status: 'Paid'
    },
    {
      id: 3,
      date: '2024-01-13',
      description: 'Invoice #INV-002 - XYZ Corp',
      amount: '₹8,900',
      type: 'Income',
      status: 'Pending'
    },
    {
      id: 4,
      date: '2024-01-12',
      description: 'Internet Bill - ISP Provider',
      amount: '₹1,200',
      type: 'Expense',
      status: 'Paid'
    },
    {
      id: 5,
      date: '2024-01-11',
      description: 'Invoice #INV-003 - DEF Ltd',
      amount: '₹15,600',
      type: 'Income',
      status: 'Overdue'
    }
  ]

  const topCustomers = [
    {
      id: 1,
      name: 'ABC Company',
      totalRevenue: '₹45,600',
      invoices: 12,
      lastInvoice: '2024-01-15',
      status: 'Active'
    },
    {
      id: 2,
      name: 'XYZ Corporation',
      totalRevenue: '₹38,900',
      invoices: 8,
      lastInvoice: '2024-01-13',
      status: 'Active'
    },
    {
      id: 3,
      name: 'DEF Limited',
      totalRevenue: '₹32,400',
      invoices: 15,
      lastInvoice: '2024-01-11',
      status: 'Overdue'
    },
    {
      id: 4,
      name: 'GHI Solutions',
      totalRevenue: '₹28,700',
      invoices: 6,
      lastInvoice: '2024-01-10',
      status: 'Active'
    },
    {
      id: 5,
      name: 'JKL Enterprises',
      totalRevenue: '₹25,300',
      invoices: 9,
      lastInvoice: '2024-01-08',
      status: 'Active'
    }
  ]

  const topExpenses = [
    {
      id: 1,
      category: 'Office Supplies',
      amount: '₹8,500',
      percentage: '10.8%',
      trend: 'up'
    },
    {
      id: 2,
      category: 'Internet & Phone',
      amount: '₹6,200',
      percentage: '7.9%',
      trend: 'stable'
    },
    {
      id: 3,
      category: 'Software Subscriptions',
      amount: '₹5,800',
      percentage: '7.4%',
      trend: 'up'
    },
    {
      id: 4,
      category: 'Travel & Entertainment',
      amount: '₹4,900',
      percentage: '6.2%',
      trend: 'down'
    },
    {
      id: 5,
      category: 'Marketing',
      amount: '₹4,200',
      percentage: '5.3%',
      trend: 'up'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Financial Metrics Table */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Financial Metrics</h2>
          <p className="text-gray-600 text-sm">Key financial indicators and their trends</p>
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
                    <div className="text-sm font-medium text-gray-900">{item.metric}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-semibold">{item.current}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{item.previous}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`flex items-center text-sm ${
                      item.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {item.trend === 'up' ? (
                        <ArrowUpIcon className="w-4 h-4 mr-1" />
                      ) : (
                        <ArrowDownIcon className="w-4 h-4 mr-1" />
                      )}
                      {item.change}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      item.category === 'Income' ? 'bg-green-100 text-green-800' :
                      item.category === 'Expense' ? 'bg-red-100 text-red-800' :
                      item.category === 'Profit' ? 'bg-blue-100 text-blue-800' :
                      item.category === 'Asset' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
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
              {recentTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{transaction.date}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{transaction.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-semibold ${
                      transaction.type === 'Income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      transaction.type === 'Income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      transaction.status === 'Paid' ? 'bg-green-100 text-green-800' :
                      transaction.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
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
            <p className="text-gray-600 text-sm">Highest revenue generating customers</p>
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
                {topCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-semibold">{customer.totalRevenue}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{customer.invoices}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        customer.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {customer.status}
                      </span>
                    </td>
                  </tr>
                ))}
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
                {topExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{expense.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-semibold">{expense.amount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{expense.percentage}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`flex items-center text-sm ${
                        expense.trend === 'up' ? 'text-red-600' : 
                        expense.trend === 'down' ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {expense.trend === 'up' ? (
                          <ArrowUpIcon className="w-4 h-4 mr-1" />
                        ) : expense.trend === 'down' ? (
                          <ArrowDownIcon className="w-4 h-4 mr-1" />
                        ) : (
                          <span className="w-4 h-4 mr-1">—</span>
                        )}
                        {expense.trend}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
