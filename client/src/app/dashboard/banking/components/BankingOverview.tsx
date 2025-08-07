"use client";

import React from 'react';
import { 
  BanknotesIcon, 
  CreditCardIcon, 
  ArrowUpIcon, 
  ArrowDownIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

interface BankingOverviewProps {
  accounts: Array<{
    id: number;
    name: string;
    bank: string;
    accountNumber: string;
    balance: number;
    type: string;
    status: string;
    lastSync: string;
  }>;
}

export default function BankingOverview({ accounts }: BankingOverviewProps) {
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
  const connectedAccounts = accounts.filter(account => account.status === 'connected').length;
  const totalAccounts = accounts.length;

  const monthlyData = {
    income: 15250.00,
    expenses: 8420.75,
    netFlow: 6829.25
  };

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
                ${monthlyData.income.toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
                ${monthlyData.expenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
              <p className="text-2xl font-bold text-gray-900">{connectedAccounts}/{totalAccounts}</p>
              <p className="text-xs text-blue-600 mt-1">
                {Math.round((connectedAccounts / totalAccounts) * 100)}% connected
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
                ${monthlyData.income.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Income</div>
              <div className="text-xs text-green-600 mt-1">+12.3% vs last month</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">
                ${monthlyData.expenses.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Expenses</div>
              <div className="text-xs text-red-600 mt-1">-5.2% vs last month</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                ${monthlyData.netFlow.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Net Cash Flow</div>
              <div className="text-xs text-blue-600 mt-1">+45.2% vs last month</div>
            </div>
          </div>
          
          {/* Simple Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Income vs Expenses</span>
              <span>{Math.round((monthlyData.income / (monthlyData.income + monthlyData.expenses)) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(monthlyData.income / (monthlyData.income + monthlyData.expenses)) * 100}%` }}
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
            {accounts.map((account) => (
              <div key={account.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
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
                    {account.status === 'connected' ? 'Connected' : 'Pending'} • {account.lastSync}
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