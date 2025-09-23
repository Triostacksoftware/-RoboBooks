"use client";

import React, { useState, useEffect } from "react";
import { XMarkIcon, CalendarIcon, BanknotesIcon } from "@heroicons/react/24/outline";
import { useBanking } from "@/contexts/BankingContext";
import { useToast } from "@/contexts/ToastContext";

interface ManualTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ManualTransactionModal: React.FC<ManualTransactionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { accounts, createTransaction } = useBanking();
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState({
    accountId: "",
    date: new Date().toISOString().split('T')[0],
    description: "",
    amount: "",
    type: "debit",
    category: "",
    payee: "",
    referenceNumber: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const transactionCategories = [
    "income", "expense", "transfer", "investment", "loan", "refund",
    "cash", "fees", "interest", "salary", "bonus", "rent", "utilities",
    "groceries", "entertainment", "transportation", "healthcare", "education"
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.accountId) newErrors.accountId = "Account is required";
    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast("Please fix the errors before submitting", "error");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Use the BankingContext createTransaction function instead of direct API call
      const result = await createTransaction({
        ...formData,
        amount: parseFloat(formData.amount),
      });

      if (result) {
        showToast("Transaction created successfully!", "success");
        onClose();
        resetForm();
      } else {
        showToast("Failed to create transaction", "error");
      }
    } catch (error) {
      console.error("Error creating transaction:", error);
      showToast("Failed to create transaction. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      accountId: "",
      date: new Date().toISOString().split('T')[0],
      description: "",
      amount: "",
      type: "debit",
      category: "",
      payee: "",
      referenceNumber: "",
    });
    setErrors({});
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  useEffect(() => {
    if (isOpen && accounts.length > 0 && !formData.accountId) {
      setFormData(prev => ({ ...prev, accountId: accounts[0]._id }));
    }
  }, [isOpen, accounts, formData.accountId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BanknotesIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Add Manual Transaction</h2>
              <p className="text-sm text-gray-500">Create a new transaction manually</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Account */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.accountId}
                onChange={(e) => handleInputChange("accountId", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.accountId ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select an account</option>
                {accounts.map((account) => (
                  <option key={account._id} value={account._id}>
                    {account.name} - {account.bankName}
                  </option>
                ))}
              </select>
              {errors.accountId && (
                <p className="mt-1 text-sm text-red-600">{errors.accountId}</p>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.date ? "border-red-500" : "border-gray-300"
                  }`}
                />
                <CalendarIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date}</p>
              )}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Enter transaction description"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.description ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Amount and Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => handleInputChange("amount", e.target.value)}
                placeholder="0.00"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.amount ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
              )}
            </div>

            {/* Transaction Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange("type", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="debit">Debit (Money Out)</option>
                <option value="credit">Credit (Money In)</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a category</option>
                {transactionCategories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Payee */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payee
              </label>
              <input
                type="text"
                value={formData.payee}
                onChange={(e) => handleInputChange("payee", e.target.value)}
                placeholder="Enter payee name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Reference Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reference Number
              </label>
              <input
                type="text"
                value={formData.referenceNumber}
                onChange={(e) => handleInputChange("referenceNumber", e.target.value)}
                placeholder="Enter reference number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Preview */}
          {formData.amount && formData.description && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Transaction Preview:</h4>
              <div className="text-sm text-gray-600">
                <p><strong>Type:</strong> {formData.type === 'debit' ? 'Debit' : 'Credit'}</p>
                <p><strong>Amount:</strong> ₹{parseFloat(formData.amount || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                <p><strong>Description:</strong> {formData.description}</p>
                {formData.category && <p><strong>Category:</strong> {formData.category}</p>}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <span>Create Transaction</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManualTransactionModal;
