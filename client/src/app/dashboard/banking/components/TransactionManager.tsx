"use client";

import React, { useState } from "react";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import TransactionCategorizationModal from "./TransactionCategorizationModal";

interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
  account: string;
  status: "reconciled" | "pending" | "unreconciled";
  reference?: string;
}

interface TransactionManagerProps {
  transactions: Transaction[];
}

export default function TransactionManager({
  transactions,
}: TransactionManagerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDateRange, setSelectedDateRange] = useState("30");
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [showCategorizationModal, setShowCategorizationModal] = useState(false);
  const [transactionForCategorization, setTransactionForCategorization] =
    useState<Transaction | null>(null);

  const categories = [
    "all",
    "Office Supplies",
    "Transportation",
    "Software",
    "Client Payments",
    "Utilities",
    "Marketing",
  ];
  const statuses = ["all", "reconciled", "pending", "unreconciled"];
  const dateRanges = [
    { value: "7", label: "Last 7 days" },
    { value: "30", label: "Last 30 days" },
    { value: "90", label: "Last 90 days" },
    { value: "custom", label: "Custom range" },
  ];

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.account.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || transaction.category === selectedCategory;
    const matchesStatus =
      selectedStatus === "all" || transaction.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "reconciled":
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case "pending":
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case "unreconciled":
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "reconciled":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "unreconciled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleTransactionClick = (transaction: Transaction) => {
    setTransactionForCategorization(transaction);
    setShowCategorizationModal(true);
  };

  const handleModalSave = (data: Record<string, string>) => {
    console.log("Saving transaction data:", data);
    // Here you would typically make an API call to save the categorization
    setShowCategorizationModal(false);
    setTransactionForCategorization(null);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {dateRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status === "all"
                    ? "All Status"
                    : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>{filteredTransactions.length} transactions found</span>
            <div className="flex gap-4">
              <span>
                Total: ?
                {filteredTransactions
                  .reduce((sum, t) => sum + t.amount, 0)
                  .toFixed(2)}
              </span>
              <span>
                Income: ?
                {filteredTransactions
                  .filter((t) => t.amount > 0)
                  .reduce((sum, t) => sum + t.amount, 0)
                  .toFixed(2)}
              </span>
              <span>
                Expenses: ?
                {Math.abs(
                  filteredTransactions
                    .filter((t) => t.amount < 0)
                    .reduce((sum, t) => sum + t.amount, 0)
                ).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Transactions
            </h3>
            <div className="flex gap-2">
              <button className="text-sm text-blue-600 hover:text-blue-700">
                Export
              </button>
              <button className="text-sm text-blue-600 hover:text-blue-700">
                Bulk Actions
              </button>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => handleTransactionClick(transaction)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div
                    className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      transaction.type === "income"
                        ? "bg-green-100"
                        : "bg-red-100"
                    }`}
                  >
                    {transaction.type === "income" ? (
                      <ArrowUpIcon className="h-5 w-5 text-green-600" />
                    ) : (
                      <ArrowDownIcon className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {transaction.description}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      <span>{transaction.category}</span>
                      <span>•</span>
                      <span>{transaction.account}</span>
                      {transaction.reference && (
                        <>
                          <span>•</span>
                          <span>Ref: {transaction.reference}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        transaction.amount >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.amount >= 0 ? "+" : ""}?
                      {Math.abs(transaction.amount).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">{transaction.date}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusIcon(transaction.status)}
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        transaction.status
                      )}`}
                    >
                      {transaction.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTransaction(transaction);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-red-600 rounded">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Transaction Details
              </h3>
              <button
                onClick={() => setSelectedTransaction(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Description
                </label>
                <p className="text-gray-900">
                  {selectedTransaction.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Amount
                  </label>
                  <p
                    className={`font-semibold ${
                      selectedTransaction.amount >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {selectedTransaction.amount >= 0 ? "+" : ""}?
                    {Math.abs(selectedTransaction.amount).toFixed(2)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Category
                  </label>
                  <p className="text-gray-900">
                    {selectedTransaction.category}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Account
                  </label>
                  <p className="text-gray-900">{selectedTransaction.account}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Date
                  </label>
                  <p className="text-gray-900">{selectedTransaction.date}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Status
                  </label>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedTransaction.status)}
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        selectedTransaction.status
                      )}`}
                    >
                      {selectedTransaction.status}
                    </span>
                  </div>
                </div>

                {selectedTransaction.reference && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Reference
                    </label>
                    <p className="text-gray-900">
                      {selectedTransaction.reference}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                Edit Transaction
              </button>
              <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                Reconcile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Categorization Modal */}
      <TransactionCategorizationModal
        isOpen={showCategorizationModal}
        onClose={() => {
          setShowCategorizationModal(false);
          setTransactionForCategorization(null);
        }}
        transaction={transactionForCategorization}
        onSave={handleModalSave}
      />
    </div>
  );
}
