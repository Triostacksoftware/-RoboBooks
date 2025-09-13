/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import {
  BanknotesIcon,
  CreditCardIcon,
  ArrowTrendingDownIcon,
} from "@heroicons/react/24/outline";
import { bankingService } from "@/services/bankingService";
import { formatCurrency } from "@/utils/currency";

interface BankingOverviewData {
  totalBalance: number;
  totalAccounts: number;
  accounts: Array<{
    id: string;
    name: string;
    balance: number;
    currency: string;
    type: string;
  }>;
}

export default function BankingOverview() {
  const [overviewData, setOverviewData] = useState<BankingOverviewData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const loadBankingOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = (await bankingService.getBankingOverview()) as {
        data: BankingOverviewData;
      };
      setOverviewData(response.data);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to load banking overview"
      );
      console.error("Error loading banking overview:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsHydrated(true);
    loadBankingOverview();
  }, []);

  // Prevent hydration mismatch by not rendering until hydrated
  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />
          <p className="text-red-700">{error}</p>
        </div>
        <button
          onClick={loadBankingOverview}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!overviewData) {
    return (
      <div className="text-center text-gray-500">No banking data available</div>
    );
  }

  const { totalBalance, totalAccounts, accounts } = overviewData;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Balance</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalBalance || 0)}
              </p>
              <p className="text-xs text-gray-600 mt-1">Across all accounts</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <BanknotesIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Accounts
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {totalAccounts || 0}
              </p>
              <p className="text-xs text-gray-600 mt-1">Connected accounts</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <CreditCardIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Connected Accounts */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Connected Accounts
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {(accounts || []).map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      account.type === "bank"
                        ? "bg-blue-100"
                        : account.type === "credit_card"
                        ? "bg-purple-100"
                        : "bg-green-100"
                    }`}
                  >
                    <BanknotesIcon
                      className={`h-5 w-5 ${
                        account.type === "bank"
                          ? "text-blue-600"
                          : account.type === "credit_card"
                          ? "text-purple-600"
                          : "text-green-600"
                      }`}
                    />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {account.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {account.currency} • {account.type}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-semibold ${
                      account.balance >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {account.balance >= 0 ? "+" : ""}
                    {formatCurrency(account.balance)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {account.currency}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
