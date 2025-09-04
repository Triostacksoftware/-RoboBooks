"use client";

import React, { useState } from "react";
import {
  CheckCircleIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import TransactionCategorizationModal from "./TransactionCategorizationModal";

interface ReconciliationItem {
  id: number;
  bankTransaction: {
    id: string;
    description: string;
    amount: number;
    date: string;
    reference?: string;
  };
  bookTransaction?: {
    id: string;
    description: string;
    amount: number;
    date: string;
    type: "invoice" | "expense" | "payment" | "manual";
  };
  status: "matched" | "unmatched" | "reconciled";
  difference?: number;
}

interface BankReconciliationProps {
  reconciliationData: {
    accountName: string;
    bankBalance: number;
    bookBalance: number;
    difference: number;
    items: ReconciliationItem[];
  };
}

export default function BankReconciliation({
  reconciliationData,
}: BankReconciliationProps) {
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<ReconciliationItem | null>(
    null
  );
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [showCategorizationModal, setShowCategorizationModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<{
    id: number;
    description: string;
    amount: number;
    date: string;
    reference?: string;
    type: "income" | "expense";
    status: string;
  } | null>(null);

  const statuses = ["all", "matched", "unmatched", "reconciled"];

  const filteredItems = reconciliationData.items.filter((item) => {
    const matchesSearch =
      item.bankTransaction.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      item.bookTransaction?.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      false;
    const matchesStatus =
      selectedStatus === "all" || item.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "matched":
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case "unmatched":
        return <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />;
      case "reconciled":
        return <CheckCircleIcon className="h-4 w-4 text-blue-500" />;
      default:
        return <ExclamationTriangleIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "matched":
        return "bg-green-100 text-green-800";
      case "unmatched":
        return "bg-yellow-100 text-yellow-800";
      case "reconciled":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleTransactionClick = (item: ReconciliationItem) => {
    // Convert reconciliation item to transaction format for the modal
    const transaction = {
      id: item.id,
      description: item.bankTransaction.description,
      amount: item.bankTransaction.amount,
      date: item.bankTransaction.date,
      reference: item.bankTransaction.reference,
      type: (item.bankTransaction.amount < 0 ? "expense" : "income") as
        | "expense"
        | "income",
      status: item.status,
    };
    setSelectedTransaction(transaction);
    setShowCategorizationModal(true);
  };

  const handleModalSave = (data: Record<string, string>) => {
    console.log("Saving transaction data:", data);
    // Here you would typically make an API call to save the categorization
    setShowCategorizationModal(false);
    setSelectedTransaction(null);
  };

  const ManualEntryModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Add Manual Transaction
          </h3>
          <button
            onClick={() => setShowManualEntry(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter transaction description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <input
              type="number"
              step="0.01"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="expense">Expense</option>
              <option value="income">Income</option>
              <option value="transfer">Transfer</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
            Add Transaction
          </button>
          <button
            onClick={() => setShowManualEntry(false)}
            className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Reconciliation Summary */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Bank Reconciliation - {reconciliationData.accountName}
          </h3>
          <p className="text-gray-600">
            Reconcile your bank statements with your books to ensure accuracy
            and identify any discrepancies.
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                ${reconciliationData.bankBalance.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Bank Balance</div>
            </div>

            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-2">
                ${reconciliationData.bookBalance.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Book Balance</div>
            </div>

            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div
                className={`text-2xl font-bold mb-2 ${
                  reconciliationData.difference === 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                ${Math.abs(reconciliationData.difference).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Difference</div>
              {reconciliationData.difference !== 0 && (
                <div className="text-xs text-red-600 mt-1">
                  Needs reconciliation
                </div>
              )}
            </div>

            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="text-2xl font-bold text-gray-600 mb-2">
                {
                  filteredItems.filter((item) => item.status === "unmatched")
                    .length
                }
              </div>
              <div className="text-sm text-gray-600">Unreconciled Items</div>
            </div>
          </div>

          {reconciliationData.difference !== 0 && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  There&apos;s a difference of $
                  {Math.abs(reconciliationData.difference).toFixed(2)} between
                  your bank and book balances.
                </span>
              </div>
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <ArrowPathIcon className="h-4 w-4" />
              Start Reconciliation
            </button>
            <button
              onClick={() => setShowManualEntry(true)}
              className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <PlusIcon className="h-4 w-4" />
              Add Manual Entry
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
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
      </div>

      {/* Reconciliation Items */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Reconciliation Items
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
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => handleTransactionClick(item)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div
                    className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      item.status === "matched"
                        ? "bg-green-100"
                        : item.status === "unmatched"
                        ? "bg-yellow-100"
                        : "bg-blue-100"
                    }`}
                  >
                    {getStatusIcon(item.status)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {item.bankTransaction.description}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Bank: {item.bankTransaction.date} • $
                          {item.bankTransaction.amount.toFixed(2)}
                          {item.bankTransaction.reference &&
                            ` • Ref: ${item.bankTransaction.reference}`}
                        </p>
                      </div>

                      {item.bookTransaction && (
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {item.bookTransaction.description}
                          </h4>
                          <p className="text-sm text-gray-500">
                            Book: {item.bookTransaction.date} • $
                            {item.bookTransaction.amount.toFixed(2)}
                          </p>
                        </div>
                      )}
                    </div>

                    {item.difference && item.difference !== 0 && (
                      <p className="text-sm text-red-600 mt-1">
                        Difference: ${item.difference.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItem(item);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    {item.status === "unmatched" && (
                      <>
                        <button className="p-1 text-green-400 hover:text-green-600 rounded">
                          <CheckCircleIcon className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-red-400 hover:text-red-600 rounded">
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showManualEntry && <ManualEntryModal />}

      {/* Transaction Categorization Modal */}
      <TransactionCategorizationModal
        isOpen={showCategorizationModal}
        onClose={() => {
          setShowCategorizationModal(false);
          setSelectedTransaction(null);
        }}
        transaction={selectedTransaction}
        onSave={handleModalSave}
      />
    </div>
  );
}
