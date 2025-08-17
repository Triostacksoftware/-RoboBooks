"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Settings,
  ChevronDownIcon,
} from "lucide-react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { useToast } from "../../../../contexts/ToastContext";

interface Account {
  _id: string;
  code?: string;
  name: string;
  category: string;
  subtype?: string;
  parent?: string;
  opening_balance: number;
  balance: number;
  currency: string;
  is_active: boolean;
  gst_treatment?: string;
  gst_rate?: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface EditAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: Account | null;
  onSave: (accountData: Partial<Account>) => Promise<void>;
  categories: string[];
  subtypes: string[];
}

const EditAccountModal: React.FC<EditAccountModalProps> = ({
  isOpen,
  onClose,
  account,
  onSave,
  categories,
  subtypes,
}) => {
  const [formData, setFormData] = useState<Partial<Account>>({
    name: "",
    category: "asset",
    subtype: "",
    code: "",
    opening_balance: 0,
    currency: "INR",
    gst_treatment: "taxable",
    gst_rate: 0,
    description: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (account) {
      setFormData({
        name: account.name,
        category: account.category,
        subtype: account.subtype || "",
        code: account.code || "",
        opening_balance: account.opening_balance,
        currency: account.currency,
        gst_treatment: account.gst_treatment || "taxable",
        gst_rate: account.gst_rate || 0,
        description: account.description || "",
      });
    }
  }, [account]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Error saving account:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {account ? "Edit Account" : "New Account"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Type*
                <InformationCircleIcon className="h-4 w-4 ml-1 text-gray-400 inline" />
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Name*
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Code
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 1001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sub Type
              </label>
              <select
                value={formData.subtype}
                onChange={(e) =>
                  setFormData({ ...formData, subtype: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Sub Type</option>
                {subtypes.map((subtype) => (
                  <option key={subtype} value={subtype}>
                    {subtype
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Opening Balance
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.opening_balance}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    opening_balance: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) =>
                  setFormData({ ...formData, currency: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="INR">INR - Indian Rupee</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GST Treatment
              </label>
              <select
                value={formData.gst_treatment}
                onChange={(e) =>
                  setFormData({ ...formData, gst_treatment: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="taxable">Taxable</option>
                <option value="exempt">Exempt</option>
                <option value="nil_rated">Nil Rated</option>
                <option value="non_gst">Non GST</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GST Rate (%)
              </label>
              <input
                type="number"
                min="0"
                max="28"
                value={formData.gst_rate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    gst_rate: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter account description..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ChartOfAccountsPage = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const { showToast } = useToast();

  const [categories, setCategories] = useState<string[]>([]);
  const [subtypes, setSubtypes] = useState<string[]>([]);

  // Fetch categories and subtypes
  const fetchCategories = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chart-of-accounts/categories`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      const data = await response.json();
      setCategories(data.data.categories || []);
      setSubtypes(data.data.subtypes || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      // Fallback to default categories
      setCategories(["asset", "liability", "equity", "income", "expense"]);
      setSubtypes([
        "bank",
        "cash",
        "accounts_receivable",
        "fixed_asset",
        "inventory",
        "other_asset",
        "accounts_payable",
        "credit_card",
        "current_liability",
        "long_term_liability",
        "owner_equity",
        "retained_earnings",
        "sales",
        "other_income",
        "cost_of_goods_sold",
        "operating_expense",
        "other_expense",
      ]);
    }
  };

  // Fetch accounts
  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chart-of-accounts`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch accounts");
      }

      const data = await response.json();
      setAccounts(data.data || []);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      showToast("Failed to fetch accounts", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchAccounts();
  }, []);

  // Save account (create or update)
  const handleSaveAccount = async (accountData: Partial<Account>) => {
    try {
      const url = selectedAccount
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chart-of-accounts/${selectedAccount._id}`
        : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chart-of-accounts`;

      const method = selectedAccount ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(accountData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save account");
      }

      showToast(
        selectedAccount
          ? "Account updated successfully"
          : "Account created successfully",
        "success"
      );
      fetchAccounts();
    } catch (error) {
      console.error("Error saving account:", error);
      showToast(
        error instanceof Error ? error.message : "Failed to save account",
        "error"
      );
      throw error;
    }
  };

  // Delete account
  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm("Are you sure you want to delete this account?")) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chart-of-accounts/${accountId}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete account");
      }

      showToast("Account deleted successfully", "success");
      fetchAccounts();
    } catch (error) {
      console.error("Error deleting account:", error);
      showToast("Failed to delete account", "error");
    }
  };

  // Open edit modal
  const openEditModal = (account: Account | null = null) => {
    setSelectedAccount(account);
    setShowEditModal(true);
  };

  // Filter accounts
  const filteredAccounts = accounts.filter((account) => {
    const matchesSearch =
      account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (account.code &&
        account.code.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory =
      !categoryFilter || account.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    const colors = {
      asset: "bg-green-100 text-green-800",
      liability: "bg-red-100 text-red-800",
      equity: "bg-blue-100 text-blue-800",
      income: "bg-purple-100 text-purple-800",
      expense: "bg-orange-100 text-orange-800",
    };
    return (
      colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">
                Chart of Accounts
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-sm text-gray-600 hover:text-gray-900">
                Find Accountants
              </button>
              <div className="relative">
                <button
                  onClick={() => openEditModal()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New
                </button>
              </div>
              <button className="text-gray-600 hover:text-gray-900">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search in Chart of Accounts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </button>
            </div>
          </div>
        </div>

        {/* Accounts List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Active Accounts ({filteredAccounts.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading accounts...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">
                      ACCOUNT NAME
                    </th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">
                      ACCOUNT CODE
                    </th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">
                      ACCOUNT TYPE
                    </th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">
                      BALANCE
                    </th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">
                      CURRENCY
                    </th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-700 w-20"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAccounts.map((account) => (
                    <tr
                      key={account._id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-medium text-sm">
                                {account.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {account.name}
                            </div>
                            {account.description && (
                              <div className="text-sm text-gray-500">
                                {account.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-900">
                        {account.code || "-"}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(
                            account.category
                          )}`}
                        >
                          {account.category.charAt(0).toUpperCase() +
                            account.category.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-900">
                        ₹{account.balance.toFixed(2)}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-900">
                        {account.currency}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openEditModal(account)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                            title="Edit Account"
                          >
                            <Settings className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAccount(account._id)}
                            className="p-1 text-red-400 hover:text-red-600"
                            title="Delete Account"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit Account Modal */}
      <EditAccountModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        account={selectedAccount}
        onSave={handleSaveAccount}
        categories={categories}
        subtypes={subtypes}
      />
    </div>
  );
};

export default ChartOfAccountsPage;
