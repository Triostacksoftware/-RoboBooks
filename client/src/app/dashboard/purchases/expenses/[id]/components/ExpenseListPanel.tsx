"use client";

import { useState } from "react";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import { Expense } from "@/services/expenseService";
import { formatCurrency } from "@/utils/currency";

interface ExpenseListPanelProps {
  expenses: Expense[];
  selectedExpenseId?: string;
  onExpenseSelect: (expense: Expense) => void;
  isCollapsed: boolean;
}

export default function ExpenseListPanel({
  expenses,
  selectedExpenseId,
  onExpenseSelect,
  isCollapsed,
}: ExpenseListPanelProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const filteredExpenses = expenses.filter(expense =>
    expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.vendor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "Paid";
      case "pending":
        return "Pending";
      case "draft":
        return "Draft";
      default:
        return status;
    }
  };

  return (
    <div className="h-full bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Expenses</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.location.href = '/dashboard/purchases/expenses/record'}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              title="New Expense"
            >
              <PlusIcon className="h-5 w-5" />
            </button>
            <div className="relative">
              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                title="More Options"
              >
                <EllipsisHorizontalIcon className="h-5 w-5" />
              </button>
              {showMoreMenu && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowMoreMenu(false);
                        window.location.href = '/dashboard/purchases/expenses/import';
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Import Expenses
                    </button>
                    <button
                      onClick={() => {
                        setShowMoreMenu(false);
                        // Export functionality
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Export Expenses
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <FunnelIcon className="h-4 w-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Expenses List */}
      <div className="flex-1 overflow-y-auto">
        {filteredExpenses.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchTerm ? "No expenses found" : "No expenses yet"}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredExpenses.map((expense) => (
              <div
                key={expense._id}
                onClick={() => onExpenseSelect(expense)}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedExpenseId === expense._id ? "bg-blue-50 border-r-2 border-blue-500" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {expense.description || "Untitled Expense"}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(expense.status)}`}>
                        {getStatusText(expense.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {expense.vendor || "No vendor"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(expense.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(expense.amount, expense.currency)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {expense.category}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
