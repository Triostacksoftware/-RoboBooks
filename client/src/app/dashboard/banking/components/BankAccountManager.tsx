"use client";

import React, { useState, useEffect } from 'react';
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
import { bankingService } from '@/services/bankingService';

interface BankAccount {
  _id: string;
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

export default function BankAccountManager() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showAccountDetails, setShowAccountDetails] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [syncingAccount, setSyncingAccount] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    bank: '',
    type: 'checking' as 'checking' | 'savings' | 'credit' | 'loan',
    accountNumber: '',
    currency: 'USD',
  });

  const statuses = ['all', 'connected', 'pending', 'disconnected', 'error'];
  const accountTypes = ['checking', 'savings', 'credit', 'loan'];

  const filteredAccounts = accounts.filter(account => 
    filterStatus === 'all' || account.status === filterStatus
  );

  // Load bank accounts
  const loadBankAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = (await bankingService.getBankAccounts()) as {
        data: BankAccount[];
      };
      setAccounts(response.data);
      // If there are no accounts yet, prompt user to add one
      if (response.data.length === 0) {
        setShowAddAccount(true);
      }
    } catch (err: any) {
      const message = err?.message || err.response?.data?.message || 'Failed to load bank accounts';
      setError(message);
      console.error('Error loading bank accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Sync bank account
  const handleSyncAccount = async (accountId: string) => {
    try {
      setSyncingAccount(accountId);
      await bankingService.syncBankAccount(accountId);
      await loadBankAccounts(); // Reload accounts to get updated data
    } catch (err: any) {
      const message = err?.message || err.response?.data?.message || 'Failed to sync account';
      setError(message);
      console.error('Error syncing account:', err);
    } finally {
      setSyncingAccount(null);
    }
  };

  // Delete bank account
  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm('Are you sure you want to delete this bank account? This action cannot be undone.')) {
      return;
    }

    try {
      await bankingService.deleteBankAccount(accountId);
      await loadBankAccounts(); // Reload accounts
    } catch (err: any) {
      const message = err?.message || err.response?.data?.message || 'Failed to delete account';
      setError(message);
      console.error('Error deleting account:', err);
    }
  };

  // Create bank account
  const handleAddAccount = async () => {
    if (!form.name || !form.bank || !form.accountNumber) {
      setError('Please fill in account name, bank name and account number');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      await bankingService.createBankAccount({
        name: form.name,
        bank: form.bank,
        accountNumber: form.accountNumber,
        type: form.type,
        currency: form.currency,
        accountType: 'Manual',
        status: 'connected',
      });
      setShowAddAccount(false);
      setForm({ name: '', bank: '', type: 'checking', accountNumber: '', currency: 'USD' });
      await loadBankAccounts();
    } catch (err: any) {
      const message = err?.message || err.response?.data?.message || 'Failed to create bank account';
      setError(message);
      console.error('Error creating account:', err);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    loadBankAccounts();
  }, []);

  // Listen for a global event to open the Add Account modal (triggered from parent page)
  useEffect(() => {
    const handler = () => setShowAddAccount(true);
    window.addEventListener('open-add-bank-account', handler as EventListener);
    return () => window.removeEventListener('open-add-bank-account', handler as EventListener);
  }, []);

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
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Business Checking Account"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
            <input
              type="text"
              value={form.bank}
              onChange={(e) => setForm(prev => ({ ...prev, bank: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Chase Bank"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
            <select 
              value={form.type}
              onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value as any }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
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
              value={form.accountNumber}
              onChange={(e) => setForm(prev => ({ ...prev, accountNumber: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Last 4 digits"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <select 
              value={form.currency}
              onChange={(e) => setForm(prev => ({ ...prev, currency: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="CAD">CAD - Canadian Dollar</option>
            </select>
          </div>
        </div>
        
        <div className="mt-6 flex gap-3">
          <button 
            onClick={handleAddAccount}
            disabled={submitting}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
            {submitting ? 'Adding...' : 'Add Account'}
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
                <p className="text-gray-900">{new Date(selectedAccount.lastSync).toLocaleString()}</p>
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
          <button 
            onClick={() => selectedAccount && handleSyncAccount(selectedAccount._id)}
            className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Sync Now
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex items-center gap-2">
          <ExclamationTriangleIcon className="h-5 w-5" />
          <span>{error}</span>
          <button onClick={loadBankAccounts} className="ml-auto underline">Retry</button>
        </div>
      )}

      {/* Empty state */}
      {accounts.length === 0 && !error && (
        <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center">
          <h4 className="text-gray-900 font-semibold mb-2">No bank accounts connected yet</h4>
          <p className="text-gray-600 mb-4">Connect your bank or add an account manually to get started.</p>
          <button
            onClick={() => setShowAddAccount(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Bank Account
          </button>
        </div>
      )}

      {/* Accounts Grid */}
      {accounts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAccounts.map((account) => (
            <div key={account._id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
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
                <p className="text-xs text-gray-500 mb-3">Last synced: {new Date(account.lastSync).toLocaleString()}</p>
                
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
                  <button 
                    onClick={() => handleDeleteAccount(account._id)}
                    className="flex-1 p-2 text-gray-400 hover:text-red-600 rounded border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                  {account.status === 'disconnected' && (
                    <button className="flex-1 p-2 text-blue-400 hover:text-blue-600 rounded border border-gray-200 hover:bg-gray-50 transition-colors">
                      <LinkIcon className="h-4 w-4" />
                    </button>
                  )}
                  {account.status === 'connected' && (
                    <button 
                      onClick={() => handleSyncAccount(account._id)}
                      disabled={syncingAccount === account._id}
                      className="flex-1 p-2 text-blue-400 hover:text-blue-600 rounded border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      {syncingAccount === account._id ? (
                        <ArrowPathIcon className="h-4 w-4 animate-spin" />
                      ) : (
                        <ArrowPathIcon className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {accounts.length > 0 && (
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
      )}

      {showAddAccount && <AddAccountModal />}
      {showAccountDetails && <AccountDetailsModal />}
    </div>
  );
} 