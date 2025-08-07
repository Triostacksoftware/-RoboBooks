"use client";

import React, { useState } from 'react';
import { 
  BanknotesIcon,
  CreditCardIcon,
  PlusIcon,
  Cog6ToothIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  LinkIcon,
  NoSymbolIcon
} from '@heroicons/react/24/outline';

interface BankAccount {
  id: number;
  name: string;
  bank: string;
  accountNumber: string;
  balance: number;
  type: 'checking' | 'savings' | 'credit' | 'loan';
  status: 'connected' | 'pending' | 'disconnected' | 'error';
  lastSync: string;
  currency: string;
  accountType: string;
  routingNumber?: string;
  swiftCode?: string;
}

interface BankAccountManagerProps {
  accounts: BankAccount[];
}

export default function BankAccountManager({ accounts }: BankAccountManagerProps) {
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showAccountDetails, setShowAccountDetails] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  const statuses = ['all', 'connected', 'pending', 'disconnected', 'error'];
  const accountTypes = ['checking', 'savings', 'credit', 'loan'];

  const filteredAccounts = accounts.filter(account => 
    filterStatus === 'all' || account.status === filterStatus
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <ArrowPathIcon className="h-4 w-4 text-yellow-500 animate-spin" />;
      case 'disconnected':
        return <NoSymbolIcon className="h-4 w-4 text-gray-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
      default:
        return <ExclamationTriangleIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'disconnected':
        return 'bg-gray-100 text-gray-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAccountTypeIcon = (type: string) => {
    switch (type) {
      case 'checking':
        return <BanknotesIcon className="h-6 w-6 text-blue-600" />;
      case 'savings':
        return <BanknotesIcon className="h-6 w-6 text-green-600" />;
      case 'credit':
        return <CreditCardIcon className="h-6 w-6 text-purple-600" />;
      case 'loan':
        return <BanknotesIcon className="h-6 w-6 text-red-600" />;
      default:
        return <BanknotesIcon className="h-6 w-6 text-gray-600" />;
    }
  };

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'checking':
        return 'bg-blue-100';
      case 'savings':
        return 'bg-green-100';
      case 'credit':
        return 'bg-purple-100';
      case 'loan':
        return 'bg-red-100';
      default:
        return 'bg-gray-100';
    }
  };

  const AddAccountModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Add Bank Account</h3>
          <button
            onClick={() => setShowAddAccount(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Business Checking Account"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Chase Bank"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              {accountTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Last 4 digits"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="CAD">CAD - Canadian Dollar</option>
            </select>
          </div>
        </div>
        
        <div className="mt-6 flex gap-3">
          <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
            Add Account
          </button>
          <button 
            onClick={() => setShowAddAccount(false)}
            className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  const AccountDetailsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Account Details</h3>
          <button
            onClick={() => setShowAccountDetails(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        {selectedAccount && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${getAccountTypeColor(selectedAccount.type)}`}>
                {getAccountTypeIcon(selectedAccount.type)}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{selectedAccount.name}</h4>
                <p className="text-sm text-gray-500">{selectedAccount.bank}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Account Number</label>
                <p className="text-gray-900">{selectedAccount.accountNumber}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600">Account Type</label>
                <p className="text-gray-900 capitalize">{selectedAccount.type}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600">Balance</label>
                <p className={`font-semibold ${
                  selectedAccount.balance >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {selectedAccount.balance >= 0 ? '+' : ''}${selectedAccount.balance.toLocaleString()}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600">Currency</label>
                <p className="text-gray-900">{selectedAccount.currency}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600">Status</label>
                <div className="flex items-center gap-2">
                  {getStatusIcon(selectedAccount.status)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedAccount.status)}`}>
                    {selectedAccount.status}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600">Last Sync</label>
                <p className="text-gray-900">{selectedAccount.lastSync}</p>
              </div>
            </div>
            
            {selectedAccount.routingNumber && (
              <div>
                <label className="block text-sm font-medium text-gray-600">Routing Number</label>
                <p className="text-gray-900">{selectedAccount.routingNumber}</p>
              </div>
            )}
            
            {selectedAccount.swiftCode && (
              <div>
                <label className="block text-sm font-medium text-gray-600">SWIFT Code</label>
                <p className="text-gray-900">{selectedAccount.swiftCode}</p>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-6 flex gap-3">
          <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
            Edit Account
          </button>
          <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors">
            Sync Now
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Bank Accounts</h3>
          <p className="text-gray-600">Manage your connected bank accounts and their settings</p>
        </div>
        <button
          onClick={() => setShowAddAccount(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Add Account
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Filter by status:</span>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {statuses.map(status => (
              <option key={status} value={status}>
                {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAccounts.map((account) => (
          <div key={account.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${getAccountTypeColor(account.type)}`}>
                {getAccountTypeIcon(account.type)}
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(account.status)}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(account.status)}`}>
                  {account.status}
                </span>
              </div>
            </div>
            
            <h4 className="font-semibold text-gray-900 mb-1">{account.name}</h4>
            <p className="text-sm text-gray-500 mb-3">{account.bank} • {account.accountNumber}</p>
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500">Balance</span>
              <span className={`font-semibold ${
                account.balance >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {account.balance >= 0 ? '+' : ''}${account.balance.toLocaleString()}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
              <span>Currency: {account.currency}</span>
              <span>Type: {account.type}</span>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-3">Last synced: {account.lastSync}</p>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    setSelectedAccount(account);
                    setShowAccountDetails(true);
                  }}
                  className="flex-1 p-2 text-gray-400 hover:text-gray-600 rounded border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <EyeIcon className="h-4 w-4" />
                </button>
                <button className="flex-1 p-2 text-gray-400 hover:text-gray-600 rounded border border-gray-200 hover:bg-gray-50 transition-colors">
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button className="flex-1 p-2 text-gray-400 hover:text-red-600 rounded border border-gray-200 hover:bg-gray-50 transition-colors">
                  <TrashIcon className="h-4 w-4" />
                </button>
                {account.status === 'disconnected' && (
                  <button className="flex-1 p-2 text-blue-400 hover:text-blue-600 rounded border border-gray-200 hover:bg-gray-50 transition-colors">
                    <LinkIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Account Summary</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-2">{accounts.length}</div>
              <div className="text-sm text-gray-600">Total Accounts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {accounts.filter(a => a.status === 'connected').length}
              </div>
              <div className="text-sm text-gray-600">Connected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600 mb-2">
                {accounts.filter(a => a.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 mb-2">
                {accounts.filter(a => a.status === 'error').length}
              </div>
              <div className="text-sm text-gray-600">Errors</div>
            </div>
          </div>
        </div>
      </div>

      {showAddAccount && <AddAccountModal />}
      {showAccountDetails && <AccountDetailsModal />}
    </div>
  );
} 