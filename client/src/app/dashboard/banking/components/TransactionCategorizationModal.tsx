"use client";

import React, { useState, useEffect } from "react";
import {
  XMarkIcon,
  DocumentArrowUpIcon,
  CheckCircleIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import {
  accountService,
  mockAccountData,
} from "../../../../services/accountService";

interface Account {
  id: number;
  code: string;
  name: string;
  accountHead: string;
  accountGroup: string;
  isActive: boolean;
}

interface Transaction {
  id: number;
  description: string;
  amount: number;
  date: string;
  reference?: string;
  type?: "income" | "expense";
  category?: string;
  account?: string;
  status?: string;
}

interface FormData {
  category: string;
  account: string;
  date: string;
  amount: string;
  vendor: string;
  invoice: string;
  description: string;
  customer: string;
}

interface TransactionCategorizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onSave: (data: FormData) => void;
}

const categories = [
  { value: "expense", label: "Expense", icon: "📤" },
  { value: "income", label: "Income", icon: "📥" },
  { value: "transfer", label: "Transfer To Another Account", icon: "🔄" },
  { value: "vendor_advance", label: "Vendor Advance", icon: "💰" },
  { value: "vendor_payment", label: "Vendor Payment", icon: "💳" },
  { value: "card_payment", label: "Card Payment", icon: "💳" },
  { value: "owner_drawings", label: "Owner Drawings", icon: "👤" },
];

export default function TransactionCategorizationModal({
  isOpen,
  onClose,
  transaction,
  onSave,
}: TransactionCategorizationModalProps) {
  const [formData, setFormData] = useState({
    category: "expense",
    account: "",
    date: "",
    amount: "",
    vendor: "",
    invoice: "",
    description: "",
    customer: "",
  });

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  // Load accounts on component mount
  useEffect(() => {
    loadAccounts();
  }, []);

  // Update form data when transaction changes
  useEffect(() => {
    if (transaction) {
      setFormData({
        category: transaction.amount < 0 ? "expense" : "income",
        account: "",
        date: transaction.date || "",
        amount: Math.abs(transaction.amount).toString(),
        vendor: "",
        invoice: transaction.reference || "",
        description: transaction.description || "",
        customer: "",
      });
    }
  }, [transaction]);

  const loadAccounts = async () => {
    try {
      // Try to fetch from API first, fallback to mock data
      try {
        const response = await accountService.getActiveAccounts();
        const responseData = response.data as { data?: Account[] };
        setAccounts(responseData.data || []);
      } catch (error) {
        // Fallback to mock data if API fails
        console.warn("API failed, using mock data:", error);
        setAccounts(mockAccountData.accounts);
      }
    } catch (error) {
      console.error("Error loading accounts:", error);
      setAccounts(mockAccountData.accounts);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    onSave(formData);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 2000);
  };

  const handleUpload = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  // Show all available accounts in dropdown
  const getFilteredAccounts = () => {
    return accounts;
  };

  return (
    <>
      <style jsx>{`
        @keyframes slideInLeft {
          from {
            transform: translateX(-100vw);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>

      {/* Success Toast - Always rendered, independent of modal */}
      {showSuccess && (
        <div
          className="fixed top-4 left-4 bg-green-100 border border-green-200 rounded-lg p-3 flex items-center gap-2 shadow-lg z-[99999] max-w-sm"
          style={{
            animation: "slideInLeft 0.3s ease-out forwards",
          }}
        >
          <CheckCircleIcon className="h-5 w-5 text-green-600" />
          <span className="text-green-800 font-medium">
            Manual Journal Updated
          </span>
        </div>
      )}

      {/* Modal - Only show when open */}
      {isOpen && transaction && (
        <div className="fixed inset-0 z-[9999] flex">
          {/* Backdrop */}
          <div className="flex-1 bg-black bg-opacity-25" onClick={onClose} />

          {/* Modal Panel - Right Side from Top */}
          <div className="w-[600px] bg-white shadow-2xl flex flex-col h-screen overflow-hidden relative">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-gray-900">
                  CATEGORIZE MANUALLY
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-1 rounded"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      handleInputChange("category", e.target.value)
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Account Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.account}
                    onChange={(e) =>
                      handleInputChange("account", e.target.value)
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="">Select an account</option>
                    {getFilteredAccounts().map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.code} - {account.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
                <button className="text-sm text-blue-600 hover:text-blue-700 mt-1">
                  + Itemize
                </button>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date<span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) =>
                      handleInputChange("amount", e.target.value)
                    }
                    className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Vendor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vendor
                </label>
                <div className="relative">
                  <select
                    value={formData.vendor}
                    onChange={(e) =>
                      handleInputChange("vendor", e.target.value)
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="">Select a vendor</option>
                    <option value="staples">Staples</option>
                    <option value="abc_corp">ABC Corp</option>
                    <option value="marketing_agency">Marketing Agency</option>
                    <option value="utility_company">Utility Company</option>
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Invoice# */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice#
                </label>
                <input
                  type="text"
                  value={formData.invoice}
                  onChange={(e) => handleInputChange("invoice", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter invoice number"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Enter description"
                />
              </div>

              {/* Customer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer
                </label>
                <div className="relative">
                  <select
                    value={formData.customer}
                    onChange={(e) =>
                      handleInputChange("customer", e.target.value)
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="">Select a customer</option>
                    <option value="abc_corp">ABC Corp</option>
                    <option value="xyz_ltd">XYZ Ltd</option>
                    <option value="tech_solutions">Tech Solutions Inc</option>
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Reporting Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reporting Tags
                </label>
                <button className="text-sm text-blue-600 hover:text-blue-700">
                  🔗 Associate Tags
                </button>
              </div>

              {/* Attach Receipt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attach Receipt
                </label>
                <button
                  onClick={handleUpload}
                  className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                  <DocumentArrowUpIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-600">Upload File</span>
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 pb-8 border-t border-gray-200 bg-gray-50">
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Save
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
