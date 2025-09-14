"use client";

import React, { useState } from "react";
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  CheckIcon,
  XMarkIcon,
  EllipsisHorizontalIcon,
  CalendarIcon,
  UserIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import { Expense } from "../../../../../services/expenseService";

interface ExpenseListProps {
  expenses: Expense[];
  selectedExpenseId?: string;
  onEdit: (expense: Expense) => void;
  onDelete: (expenseId: string) => void;
  onConvertToInvoice: (expenseId: string) => void;
  onExpenseClick?: (expense: Expense) => void;
  isCollapsed?: boolean; // New prop to determine if showing minimal info
}

export default function ExpenseList({ expenses, selectedExpenseId, onEdit, onDelete, onConvertToInvoice, onExpenseClick, isCollapsed = false }: ExpenseListProps) {
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unbilled':
        return 'bg-gray-100 text-gray-800';
      case 'invoiced':
        return 'bg-blue-100 text-blue-800';
      case 'reimbursed':
        return 'bg-green-100 text-green-800';
      case 'billable':
        return 'bg-purple-100 text-purple-800';
      case 'non-billable':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleSelectAll = () => {
    if (selectedExpenses.length === expenses.length) {
      setSelectedExpenses([]);
    } else {
      setSelectedExpenses(expenses.map(expense => expense._id));
    }
  };

  const handleSelectExpense = (expenseId: string) => {
    setSelectedExpenses(prev =>
      prev.includes(expenseId)
        ? prev.filter(id => id !== expenseId)
        : [...prev, expenseId]
    );
  };

  const sortedExpenses = [...expenses].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'date':
        aValue = new Date(a.date).getTime();
        bValue = new Date(b.date).getTime();
        break;
      case 'amount':
        aValue = a.amount;
        bValue = b.amount;
        break;
      case 'vendor':
        aValue = a.vendor.toLowerCase();
        bValue = b.vendor.toLowerCase();
        break;
      case 'description':
        aValue = a.description.toLowerCase();
        bValue = b.description.toLowerCase();
        break;
      default:
        aValue = a.date;
        bValue = b.date;
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">
            All Expenses ({expenses.length})
          </h3>
          {selectedExpenses.length > 0 && (
            <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
              {selectedExpenses.length} selected
            </span>
          )}
        </div>
      </div>

      {/* Simplified List */}
      <div className="divide-y divide-gray-200">
        {sortedExpenses.map((expense) => (
          <div 
            key={expense._id} 
            className={`px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between ${
              selectedExpenseId === expense._id ? "bg-blue-50 border-r-2 border-blue-500" : ""
            }`}
            onClick={() => onExpenseClick?.(expense)}
          >
            {/* Left side - Checkbox and details */}
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <input
                type="checkbox"
                checked={selectedExpenses.includes(expense._id)}
                onChange={(e) => {
                  e.stopPropagation();
                  handleSelectExpense(expense._id);
                }}
                className="rounded border-gray-300"
              />
              
              <div className="flex-1 min-w-0">
                {/* Primary title - Category/Description */}
                <div className="text-sm font-semibold text-gray-900 truncate">
                  {expense.category || expense.description}
                </div>
                
                {/* Date and Vendor - Always show */}
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(expense.date).toLocaleDateString('en-IN')} • {expense.vendor}
                </div>
                
                {/* Status and Amount - Only show when not collapsed */}
                {!isCollapsed && (
                  <>
                    {/* Status */}
                    <div className="text-xs text-gray-400 uppercase mt-1">
                      {expense.status}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Right side - Amount - Only show when not collapsed */}
            {!isCollapsed && (
              <div className="text-sm font-semibold text-gray-900">
                {formatCurrency(expense.amount)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty state */}
      {expenses.length === 0 && (
        <div className="text-center py-8">
          <DocumentTextIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <h3 className="text-sm font-medium text-gray-900 mb-1">No expenses found</h3>
          <p className="text-xs text-gray-600">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
}
