"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import { useBanking } from "@/contexts/BankingContext";
import { useToast } from "@/contexts/ToastContext";

interface ReconciliationData {
  accountId: string;
    accountName: string;
    bankBalance: number;
    bookBalance: number;
    difference: number;
  unreconciledItems: number;
  transactions: any[];
}

export default function BankReconciliation() {
  const { accounts, transactions, getUnreconciledTransactions, reconcileTransaction, autoMatchReconciliation } = useBanking();
  const { addToast } = useToast();
  
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [reconciliationData, setReconciliationData] = useState<ReconciliationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Calculate reconciliation data for selected account
  useEffect(() => {
    if (selectedAccount) {
      const account = accounts.find(acc => acc._id === selectedAccount);
      if (account) {
        const unreconciledTransactions = getUnreconciledTransactions().filter(
          t => t.accountId === selectedAccount
        );
        
        const totalUnreconciledAmount = unreconciledTransactions.reduce((sum, t) => {
          return sum + (t.type === 'credit' ? t.amount : -t.amount);
        }, 0);

        setReconciliationData({
          accountId: account._id,
          accountName: account.name,
          bankBalance: account.balance,
          bookBalance: account.balance - totalUnreconciledAmount,
          difference: totalUnreconciledAmount,
          unreconciledItems: unreconciledTransactions.length,
          transactions: unreconciledTransactions,
        });
      }
    } else {
      setReconciliationData(null);
    }
  }, [selectedAccount, accounts, getUnreconciledTransactions]);

  const handleStartReconciliation = async () => {
    if (!selectedAccount) {
      addToast({
        title: "Error",
        message: "Please select an account first",
        type: "error",
        duration: 3000,
      });
      return;
    }

    try {
      setLoading(true);
      await autoMatchReconciliation(selectedAccount);
      addToast({
        title: "Success",
        message: "Auto-matching completed successfully!",
        type: "success",
        duration: 3000,
      });
    } catch (error: any) {
      addToast({
        title: "Error",
        message: "Failed to start reconciliation",
        type: "error",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReconcileTransaction = async (transactionId: string) => {
    try {
      await reconcileTransaction(transactionId);
      addToast({
        title: "Success",
        message: "Transaction reconciled successfully!",
        type: "success",
        duration: 3000,
      });
    } catch (error: any) {
      addToast({
        title: "Error",
        message: "Failed to reconcile transaction",
        type: "error",
        duration: 5000,
      });
    }
  };

  const filteredTransactions = reconciliationData?.transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.payee?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Bank Reconciliation</h3>
          <p className="text-gray-600">
            Reconcile your bank statements with your books to ensure accuracy
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleStartReconciliation}
            disabled={loading || !selectedAccount}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <ArrowPathIcon className="h-5 w-5 animate-spin" />
            ) : (
              <ArrowPathIcon className="h-5 w-5" />
            )}
            {loading ? "Processing..." : "Start Reconciliation"}
          </button>
          <button className="bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors flex items-center gap-2">
            <PlusIcon className="h-5 w-5" />
            Add Manual Entry
          </button>
        </div>
          </div>

      {/* Account Selection */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Account to Reconcile
            </label>
        <select
          value={selectedAccount}
          onChange={(e) => setSelectedAccount(e.target.value)}
          className="w-full max-w-md border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Choose an account...</option>
          {accounts.map((account) => (
            <option key={account._id} value={account._id}>
              {account.name} - {account.bankName || "N/A"}
            </option>
          ))}
        </select>
          </div>

      {/* Reconciliation Summary */}
      {reconciliationData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
          <div>
                <p className="text-sm text-gray-600">Bank Balance</p>
                <p className="text-2xl font-bold text-blue-600">
                  ₹{reconciliationData.bankBalance.toLocaleString()}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="h-6 w-6 text-blue-600" />
          </div>
          </div>
        </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Book Balance</p>
                <p className="text-2xl font-bold text-green-600">
                  ₹{reconciliationData.bookBalance.toLocaleString()}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
        </div>
      </div>
    </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Difference</p>
                <p className={`text-2xl font-bold ${reconciliationData.difference === 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{reconciliationData.difference.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  {reconciliationData.difference === 0 ? 'Balanced' : 'Needs reconciliation'}
          </p>
        </div>
              <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                reconciliationData.difference === 0 ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {reconciliationData.difference === 0 ? (
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                ) : (
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                )}
            </div>
              </div>
            </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unreconciled Items</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reconciliationData.unreconciledItems}
                </p>
              </div>
              <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <ExclamationTriangleIcon className="h-6 w-6 text-gray-600" />
            </div>
              </div>
            </div>
          </div>
      )}

      {/* Alert Message */}
      {reconciliationData && reconciliationData.difference !== 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
            <p className="text-yellow-800">
              There's a difference of ₹{reconciliationData.difference.toLocaleString()} between your bank and book balances.
            </p>
              </div>
            </div>
          )}

      {/* Transaction Search and Filters */}
      {reconciliationData && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
            <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
            <div className="sm:w-48">
            <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="reconciled">Reconciled</option>
                <option value="cancelled">Cancelled</option>
            </select>
        </div>
      </div>

          {/* Transactions List */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Unreconciled Transactions</h4>
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No unreconciled transactions found
            </div>
            ) : (
              filteredTransactions.map((transaction) => (
                <div
                  key={transaction._id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${
                        transaction.type === 'credit' ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <div>
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-sm text-gray-500">
                          {transaction.payee && `${transaction.payee} • `}
                          {new Date(transaction.date).toLocaleDateString()}
                          </p>
                        </div>
                  </div>
                </div>
                  <div className="flex items-center gap-4">
                  <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">{transaction.status}</p>
                  </div>
                    <button
                      onClick={() => handleReconcileTransaction(transaction._id)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    >
                      Reconcile
                    </button>
                  </div>
                </div>
              ))
                    )}
                  </div>
                </div>
      )}
    </div>
  );
}
