"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { api } from "../../../../lib/api";
import { formatCurrency } from "../../../../utils/currency";

interface RecurringExpense {
  _id: string;
  date: string;
  expenseAccount: {
    _id: string;
    name: string;
    type: string;
  };
  amount: number;
  taxAmount: number;
  totalAmount: number;
  paidThrough: {
    _id: string;
    name: string;
    type: string;
  };
  vendor?: {
    _id: string;
    name: string;
    email: string;
  };
  customer?: {
    _id: string;
    name: string;
    email: string;
  };
  invoiceNumber?: string;
  notes?: string;
  category: string;
  status: "draft" | "pending" | "approved" | "rejected" | "paid";
  isRecurring: boolean;
  recurringPattern: {
    frequency: string;
    interval: number;
    endDate?: string;
  };
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface RecurringExpensesResponse {
  success: boolean;
  data: RecurringExpense[];
}

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  paid: "bg-blue-100 text-blue-800",
};

const categoryColors = {
  travel: "bg-purple-100 text-purple-800",
  meals: "bg-orange-100 text-orange-800",
  supplies: "bg-blue-100 text-blue-800",
  equipment: "bg-indigo-100 text-indigo-800",
  office: "bg-gray-100 text-gray-800",
  marketing: "bg-pink-100 text-pink-800",
  utilities: "bg-yellow-100 text-yellow-800",
  rent: "bg-green-100 text-green-800",
  insurance: "bg-red-100 text-red-800",
  other: "bg-slate-100 text-slate-800",
};

const frequencyLabels = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
};

export default function RecurringExpensesPage() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<RecurringExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const fetchRecurringExpenses = async () => {
    try {
      setLoading(true);
      const response = await api<RecurringExpensesResponse>(
        "/api/expenses/recurring"
      );

      if (response.success) {
        setExpenses(response.data);
      }
    } catch (error) {
      console.error("Error fetching recurring expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecurringExpenses();
  }, []);

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      !searchTerm ||
      expense.expenseAccount.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      expense.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.vendor?.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || expense.status === statusFilter;
    const matchesCategory =
      !categoryFilter || expense.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this recurring expense?"))
      return;

    try {
      const response = await api(`/api/expenses/${id}`, {
        method: "DELETE",
      });

      if (response.success) {
        fetchRecurringExpenses();
      }
    } catch (error) {
      console.error("Error deleting recurring expense:", error);
    }
  };

  const getNextDueDate = (expense: RecurringExpense) => {
    const lastDate = new Date(expense.date);
    const now = new Date();
    const { frequency, interval } = expense.recurringPattern;

    let nextDate = new Date(lastDate);

    while (nextDate <= now) {
      switch (frequency) {
        case "daily":
          nextDate.setDate(nextDate.getDate() + interval);
          break;
        case "weekly":
          nextDate.setDate(nextDate.getDate() + 7 * interval);
          break;
        case "monthly":
          nextDate.setMonth(nextDate.getMonth() + interval);
          break;
        case "yearly":
          nextDate.setFullYear(nextDate.getFullYear() + interval);
          break;
      }
    }

    return nextDate;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Recurring Expenses
          </h1>
          <p className="text-gray-600">
            Manage your recurring business expenses
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard/purchases/expenses/new")}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          New Recurring Expense
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search recurring expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="paid">Paid</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            <option value="travel">Travel</option>
            <option value="meals">Meals</option>
            <option value="supplies">Supplies</option>
            <option value="equipment">Equipment</option>
            <option value="office">Office</option>
            <option value="marketing">Marketing</option>
            <option value="utilities">Utilities</option>
            <option value="rent">Rent</option>
            <option value="insurance">Insurance</option>
            <option value="other">Other</option>
          </select>

          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <FunnelIcon className="h-4 w-4 mr-2" />
            More Filters
          </button>
        </div>
      </div>

      {/* Recurring Expenses Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading recurring expenses...</p>
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <ArrowPathIcon className="h-12 w-12" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No recurring expenses found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new recurring expense.
            </p>
            <div className="mt-6">
              <button
                onClick={() => router.push("/dashboard/purchases/expenses/new")}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                New Recurring Expense
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Frequency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Next Due
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredExpenses.map((expense) => (
                  <tr key={expense._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {expense.expenseAccount.name}
                      </div>
                      {expense.notes && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {expense.notes}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          categoryColors[
                            expense.category as keyof typeof categoryColors
                          ]
                        }`}
                      >
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Every {expense.recurringPattern.interval}{" "}
                      {frequencyLabels[
                        expense.recurringPattern
                          .frequency as keyof typeof frequencyLabels
                      ].toLowerCase()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(expense.totalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getNextDueDate(expense).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          statusColors[expense.status]
                        }`}
                      >
                        {expense.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            router.push(
                              `/dashboard/purchases/expenses/${expense._id}`
                            )
                          }
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            router.push(
                              `/dashboard/purchases/expenses/${expense._id}/edit`
                            )
                          }
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(expense._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
