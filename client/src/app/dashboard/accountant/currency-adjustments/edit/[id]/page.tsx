"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft, 
  Save, 
  X,
  AlertCircle,
  Loader2
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface CurrencyAdjustment {
  _id: string;
  accountId?: string;
  accountName: string;
  fromCurrency: string;
  toCurrency: string;
  originalAmount: number;
  convertedAmount: number;
  exchangeRate: number;
  adjustmentDate: string;
  description: string;
  adjustmentType: 'gain' | 'loss' | 'neutral';
  amount: number;
  referenceNumber?: string;
  userId: string;
}

interface Account {
  _id: string;
  name: string;
  code: string;
  currency: string;
}

const EditCurrencyAdjustmentPage = () => {
  const router = useRouter();
  const params = useParams();
  const { user, authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);

  const [formData, setFormData] = useState({
    accountId: '',
    fromCurrency: 'USD',
    toCurrency: 'INR',
    originalAmount: '',
    exchangeRate: '',
    adjustmentDate: '',
    description: '',
    adjustmentType: 'gain' as 'gain' | 'loss' | 'neutral'
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/signin');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (params.id) {
      loadAdjustment();
      loadAccounts();
    }
  }, [params.id]);

  const loadAdjustment = async () => {
    try {
      setLoading(true);
      const response = await api<{ success: boolean; data: CurrencyAdjustment }>(`/api/currency/adjustments/${params.id}`);
      if (response.success) {
        const adjustment = response.data;
        setFormData({
          accountId: adjustment.accountId || '',
          fromCurrency: adjustment.fromCurrency,
          toCurrency: adjustment.toCurrency,
          originalAmount: adjustment.originalAmount.toString(),
          exchangeRate: adjustment.exchangeRate.toString(),
          adjustmentDate: new Date(adjustment.adjustmentDate).toISOString().split('T')[0],
          description: adjustment.description,
          adjustmentType: adjustment.adjustmentType
        });
      } else {
        setError('Failed to load currency adjustment');
      }
    } catch (error) {
      console.error('Error loading adjustment:', error);
      setError('Failed to load currency adjustment');
    } finally {
      setLoading(false);
    }
  };

  const loadAccounts = async () => {
    try {
      console.log('🔍 Loading accounts...');
      const response = await api<{ success: boolean; data: Account[] }>('/api/accounts');
      console.log('🔍 Accounts response:', response);
      if (response.success) {
        setAccounts(response.data);
        console.log('✅ Loaded accounts:', response.data.length);
      } else {
        console.log('❌ Failed to load accounts:', response);
      }
    } catch (error) {
      console.error('❌ Error loading accounts:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear errors when user starts typing
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const calculateConvertedAmount = () => {
    const original = parseFloat(formData.originalAmount);
    const rate = parseFloat(formData.exchangeRate);
    if (!isNaN(original) && !isNaN(rate)) {
      return original * rate;
    }
    return 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api(`/api/currency/adjustments/${params.id}`, {
        method: 'PUT',
        json: {
          accountId: formData.accountId || null,
          fromCurrency: formData.fromCurrency,
          toCurrency: formData.toCurrency,
          originalAmount: parseFloat(formData.originalAmount),
          exchangeRate: parseFloat(formData.exchangeRate),
          adjustmentDate: formData.adjustmentDate,
          description: formData.description,
          adjustmentType: formData.adjustmentType
        }
      });

      if (response.success) {
        setSuccess('Currency adjustment updated successfully!');
        setTimeout(() => {
          router.push('/dashboard/accountant/currency-adjustments');
        }, 1500);
      } else {
        setError(response.message || 'Failed to update currency adjustment');
      }
    } catch (error: any) {
      console.error('Error updating adjustment:', error);
      setError(error.message || 'Failed to update currency adjustment');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading currency adjustment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard/accountant/currency-adjustments')}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Currency Adjustments
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900">Edit Currency Adjustment</h1>
          <p className="text-gray-600 mt-2">Update the currency conversion adjustment details</p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Success</h3>
                <div className="mt-2 text-sm text-green-700">{success}</div>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Account Selection */}
              <div>
                <label htmlFor="accountId" className="block text-sm font-medium text-gray-700">
                  Account (Optional)
                </label>
                <select
                  id="accountId"
                  name="accountId"
                  value={formData.accountId}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select an account (optional)</option>
                  {accounts.map((account) => (
                    <option key={account._id} value={account._id}>
                      {account.name} ({account.code}) - {account.currency}
                    </option>
                  ))}
                </select>
                {accounts.length === 0 && (
                  <p className="mt-1 text-sm text-gray-500">
                    No accounts found. You can still update the currency adjustment without selecting an account.
                  </p>
                )}
              </div>

              {/* Adjustment Date */}
              <div>
                <label htmlFor="adjustmentDate" className="block text-sm font-medium text-gray-700">
                  Adjustment Date *
                </label>
                <input
                  type="date"
                  id="adjustmentDate"
                  name="adjustmentDate"
                  value={formData.adjustmentDate}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              {/* From Currency */}
              <div>
                <label htmlFor="fromCurrency" className="block text-sm font-medium text-gray-700">
                  From Currency *
                </label>
                <select
                  id="fromCurrency"
                  name="fromCurrency"
                  value={formData.fromCurrency}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="INR">INR - Indian Rupee</option>
                  <option value="JPY">JPY - Japanese Yen</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                  <option value="AUD">AUD - Australian Dollar</option>
                  <option value="CHF">CHF - Swiss Franc</option>
                  <option value="CNY">CNY - Chinese Yuan</option>
                </select>
              </div>

              {/* To Currency */}
              <div>
                <label htmlFor="toCurrency" className="block text-sm font-medium text-gray-700">
                  To Currency *
                </label>
                <select
                  id="toCurrency"
                  name="toCurrency"
                  value={formData.toCurrency}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="INR">INR - Indian Rupee</option>
                  <option value="JPY">JPY - Japanese Yen</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                  <option value="AUD">AUD - Australian Dollar</option>
                  <option value="CHF">CHF - Swiss Franc</option>
                  <option value="CNY">CNY - Chinese Yuan</option>
                </select>
              </div>

              {/* Original Amount */}
              <div>
                <label htmlFor="originalAmount" className="block text-sm font-medium text-gray-700">
                  Original Amount *
                </label>
                <input
                  type="number"
                  id="originalAmount"
                  name="originalAmount"
                  value={formData.originalAmount}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              {/* Exchange Rate */}
              <div>
                <label htmlFor="exchangeRate" className="block text-sm font-medium text-gray-700">
                  Exchange Rate *
                </label>
                <input
                  type="number"
                  id="exchangeRate"
                  name="exchangeRate"
                  value={formData.exchangeRate}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.0001"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              {/* Converted Amount (Read-only) */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Converted Amount
                </label>
                <div className="mt-1 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <span className="text-lg font-semibold text-blue-900">
                    {calculateConvertedAmount().toLocaleString()} {formData.toCurrency}
                  </span>
                </div>
              </div>

              {/* Adjustment Type */}
              <div>
                <label htmlFor="adjustmentType" className="block text-sm font-medium text-gray-700">
                  Adjustment Type *
                </label>
                <select
                  id="adjustmentType"
                  name="adjustmentType"
                  value={formData.adjustmentType}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="gain">Foreign Exchange Gain</option>
                  <option value="loss">Foreign Exchange Loss</option>
                  <option value="neutral">Neutral</option>
                </select>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Describe the purpose of this currency adjustment..."
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push('/dashboard/accountant/currency-adjustments')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {saving ? 'Updating...' : 'Update Adjustment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditCurrencyAdjustmentPage;
