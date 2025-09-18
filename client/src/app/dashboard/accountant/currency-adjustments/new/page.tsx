"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Save, 
  Calculator,
  AlertCircle,
  Loader2
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface Account {
  _id: string;
  name: string;
  code: string;
  currency: string;
}

interface CurrencyRate {
  _id: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  isActive: boolean;
}

const NewCurrencyAdjustmentPage = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form data
  const [formData, setFormData] = useState({
    accountId: '',
    fromCurrency: '',
    toCurrency: '',
    originalAmount: '',
    exchangeRate: '',
    adjustmentDate: new Date().toISOString().split('T')[0],
    description: '',
    adjustmentType: 'neutral'
  });

  // Options
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [exchangeRates, setExchangeRates] = useState<CurrencyRate[]>([]);
  const [convertedAmount, setConvertedAmount] = useState<number>(0);

  // Load accounts and exchange rates
  useEffect(() => {
    if (user && !authLoading) {
      loadAccounts();
      loadExchangeRates();
    }
  }, [user, authLoading]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const loadAccounts = async () => {
    try {
      const response = await api<{ success: boolean; data: Account[] }>('/api/accounts');
      if (response.success) {
        setAccounts(response.data);
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  const loadExchangeRates = async () => {
    try {
      const response = await api<{ success: boolean; data: CurrencyRate[] }>('/api/currency/rates');
      if (response.success) {
        setExchangeRates(response.data.filter(rate => rate.isActive));
      }
    } catch (error) {
      console.error('Error loading exchange rates:', error);
    }
  };

  // Calculate converted amount when original amount or exchange rate changes
  useEffect(() => {
    if (formData.originalAmount && formData.exchangeRate) {
      const original = parseFloat(formData.originalAmount);
      const rate = parseFloat(formData.exchangeRate);
      if (!isNaN(original) && !isNaN(rate)) {
        setConvertedAmount(original * rate);
      }
    }
  }, [formData.originalAmount, formData.exchangeRate]);

  // Auto-fill exchange rate when currencies are selected
  useEffect(() => {
    if (formData.fromCurrency && formData.toCurrency) {
      const rate = exchangeRates.find(r => 
        r.fromCurrency === formData.fromCurrency && 
        r.toCurrency === formData.toCurrency
      );
      if (rate) {
        setFormData(prev => ({ ...prev, exchangeRate: rate.rate.toString() }));
      }
    }
  }, [formData.fromCurrency, formData.toCurrency, exchangeRates]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api('/api/currency/adjustments', {
        method: 'POST',
        json: {
          accountId: formData.accountId,
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
        setSuccess('Currency adjustment created successfully!');
        setTimeout(() => {
          router.push('/dashboard/accountant/currency-adjustments');
        }, 2000);
      }
    } catch (error: any) {
      console.error('Error creating currency adjustment:', error);
      setError(error.message || 'Failed to create currency adjustment');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Please log in to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard/accountant/currency-adjustments")}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Currency Adjustments
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Calculator className="h-6 w-6 text-blue-600" />
                New Currency Adjustment
              </h1>
              <p className="text-sm text-gray-600">
                Create a new currency conversion adjustment
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Success</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>{success}</p>
                </div>
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
                  Account *
                </label>
                <select
                  id="accountId"
                  name="accountId"
                  value={formData.accountId}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select an account</option>
                  {accounts.map((account) => (
                    <option key={account._id} value={account._id}>
                      {account.name} ({account.code}) - {account.currency}
                    </option>
                  ))}
                </select>
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <option value="">Select currency</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="INR">INR - Indian Rupee</option>
                  <option value="JPY">JPY - Japanese Yen</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                  <option value="AUD">AUD - Australian Dollar</option>
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
                  <option value="">Select currency</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="INR">INR - Indian Rupee</option>
                  <option value="JPY">JPY - Japanese Yen</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                  <option value="AUD">AUD - Australian Dollar</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  step="0.01"
                  min="0"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="0.00"
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
                  step="0.0001"
                  min="0"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="0.0000"
                />
              </div>
            </div>

            {/* Converted Amount Display */}
            {convertedAmount > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex items-center">
                  <Calculator className="h-5 w-5 text-blue-400 mr-2" />
                  <div>
                    <h3 className="text-sm font-medium text-blue-800">Converted Amount</h3>
                    <p className="text-lg font-semibold text-blue-900">
                      {convertedAmount.toLocaleString()} {formData.toCurrency}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <option value="neutral">Neutral</option>
                  <option value="gain">Foreign Exchange Gain</option>
                  <option value="loss">Foreign Exchange Loss</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
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

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.push('/dashboard/accountant/currency-adjustments')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Adjustment
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewCurrencyAdjustmentPage;
