"use client";

import React, { useState, useEffect } from 'react';
import { 
  BanknotesIcon, 
  CreditCardIcon, 
  ArrowUpIcon, 
  ArrowDownIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import { bankingService } from '@/services/bankingService';

interface BankAccount {
  _id: string;
  name: string;
  bank: string;
  accountNumber: string;
  balance: number;
  type: string;
  status: string;
  lastSync: string;
}

interface BankingOverviewData {
  totalBalance: number;
  cashFlow: {
    income: number;
    expenses: number;
    netFlow: number;
  };
  accountSummary: {
    total: number;
    connected: number;
    pending: number;
    disconnected: number;
    error: number;
  };
  accountsByType: {
    checking: number;
    savings: number;
    credit: number;
    loan: number;
  };
  connectedAccounts: BankAccount[];
  recentTransactions: Array<{
    id: string;
    description: string;
    amount: number;
    type: string;
    category: string;
    date: string;
    account: string;
    status: string;
    reference?: string;
  }>;
}

export default function BankingOverview() {
  const [overviewData, setOverviewData] = useState<BankingOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBankingOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = (await bankingService.getBankingOverview()) as {
        data: BankingOverviewData;
      };
      setOverviewData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load banking overview');
      console.error('Error loading banking overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBankingOverview();
  }, []);

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
      <div className="text-center text-gray-500">
        No banking data available
      </div>
    );
  }

  const { totalBalance, cashFlow, accountSummary, accountsByType, connectedAccounts, recentTransactions } = overviewData;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Balance</p>
              <p className="text-2xl font-bold text-gray-900">
                ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-green-600 mt-1 flex items-center">
                <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                +2.5% from last month
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <BanknotesIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Month Income</p>
              <p className="text-2xl font-bold text-green-600">
                ${cashFlow.income.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-green-600 mt-1 flex items-center">
                <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                +12.3% from last month
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <ArrowUpIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Month Expenses</p>
              <p className="text-2xl font-bold text-red-600">
                ${cashFlow.expenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-red-600 mt-1 flex items-center">
                <ArrowTrendingDownIcon className="h-3 w-3 mr-1" />
                -5.2% from last month
              </p>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
              <ArrowDownIcon className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Connected Accounts</p>
              <p className="text-2xl font-bold text-gray-900">{accountSummary.connected}/{accountSummary.total}</p>
              <p className="text-xs text-blue-600 mt-1">
                {accountSummary.total > 0 ? Math.round((accountSummary.connected / accountSummary.total) * 100) : 0}% connected
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <CreditCardIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Financial Flow Chart */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Cash Flow Overview</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                ${cashFlow.income.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Income</div>
              <div className="text-xs text-green-600 mt-1">+12.3% vs last month</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">
                ${cashFlow.expenses.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Expenses</div>
              <div className="text-xs text-red-600 mt-1">-5.2% vs last month</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                ${cashFlow.netFlow.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Net Cash Flow</div>
              <div className="text-xs text-blue-600 mt-1">+45.2% vs last month</div>
            </div>
          </div>
          
          {/* Simple Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Income vs Expenses</span>
              <span>{cashFlow.income + cashFlow.expenses > 0 ? Math.round((cashFlow.income / (cashFlow.income + cashFlow.expenses)) * 100) : 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${cashFlow.income + cashFlow.expenses > 0 ? (cashFlow.income / (cashFlow.income + cashFlow.expenses)) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Connected Accounts */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Connected Accounts</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {connectedAccounts.map((account) => (
              <div key={account._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                    account.type === 'checking' ? 'bg-blue-100' : 
                    account.type === 'credit' ? 'bg-purple-100' : 'bg-green-100'
                  }`}>
                    <BanknotesIcon className={`h-5 w-5 ${
                      account.type === 'checking' ? 'text-blue-600' : 
                      account.type === 'credit' ? 'text-purple-600' : 'text-green-600'
                    }`} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{account.name}</h4>
                    <p className="text-sm text-gray-500">{account.bank} • {account.accountNumber}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    account.balance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {account.balance >= 0 ? '+' : ''}${account.balance.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {account.status === 'connected' ? 'Connected' : 'Pending'} • {new Date(account.lastSync).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      {recentTransactions.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      transaction.amount > 0 ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {transaction.amount > 0 ? (
                        <ArrowUpIcon className="h-5 w-5 text-green-600" />
                      ) : (
                        <ArrowDownIcon className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{transaction.description}</h4>
                      <p className="text-sm text-gray-500">{transaction.category} • {transaction.account}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount >= 0 ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(transaction.date).toLocaleDateString()} • {transaction.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 