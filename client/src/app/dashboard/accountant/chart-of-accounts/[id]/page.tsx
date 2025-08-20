"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  MoreHorizontal,
  Building2,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  Info,
} from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import { chartOfAccountsAPI } from "@/lib/api";
import CreateAccountModal from "../components/CreateAccountModal";

interface Account {
  _id: string;
  name: string;
  accountHead: string;
  accountGroup: string;
  balance: number;
  balanceType: "credit" | "debit";
  subAccountCount?: number;
  isParent?: boolean;
  parentId?: string;
  code?: string;
  description?: string;
  isActive: boolean;
}

interface ParentAccount {
  _id: string;
  name: string;
  accountHead: string;
  accountGroup: string;
  balance: number;
  balanceType: "credit" | "debit";
  description?: string;
  totalSubAccountBalance: number;
  totalOpeningBalance: number;
  totalClosingBalance: number;
}

interface AccountFormData {
  name: string;
  accountHead: string;
  accountGroup: string;
  code?: string;
  openingBalance: number;
  currency: string;
  description?: string;
  isActive: boolean;
  balanceType: string;
}

interface BackendAccount {
  _id: string;
  name?: string;
  accountHead?: string;
  accountGroup?: string;
  balance?: number;
  balanceType?: "credit" | "debit";
  subAccountCount?: number;
  isParent?: boolean;
  parent?: { _id: string };
  code?: string;
  description?: string;
  isActive?: boolean;
}

const SubAccountPage = () => {
  const router = useRouter();
  const params = useParams();
  const accountId = params.id as string;

  const [parentAccount, setParentAccount] = useState<ParentAccount | null>(
    null
  );
  const [subAccounts, setSubAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("sub-accounts");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { showToast } = useToast();

  // Fetch parent account details
  const fetchParentAccount = async () => {
    try {
      const data = await chartOfAccountsAPI.getById(accountId);
      if (data.success && data.data) {
        const account = data.data;
        setParentAccount({
          _id: account._id,
          name: account.name || "Unknown Account",
          accountHead: account.accountHead
            ? account.accountHead.charAt(0).toUpperCase() +
              account.accountHead.slice(1)
            : "Unknown",
          accountGroup: account.accountGroup || "Unknown",
          balance: Math.abs(account.balance || 0),
          balanceType: account.balanceType || "debit",
          description: account.description,
          totalSubAccountBalance: 0, // Will be calculated
          totalOpeningBalance: 0, // Will be calculated
          totalClosingBalance: 0, // Will be calculated
        });
      }
    } catch (error) {
      console.error("Error fetching parent account:", error);
      showToast("Failed to fetch account details", "error");
    }
  };

  // Fetch sub-accounts
  const fetchSubAccounts = async () => {
    try {
      const data = await chartOfAccountsAPI.getSubAccounts(accountId);
      if (data.success) {
        const transformedAccounts: Account[] = (data.data || [])
          .filter((account: BackendAccount) => account && account._id) // Filter out invalid accounts
          .map((account: BackendAccount) => {
            // Ensure all required fields exist
            const safeAccount = {
              _id: account._id || "",
              name: account.name || "Unnamed Account",
              accountHead: account.accountHead || "unknown",
              accountGroup: account.accountGroup || "Unknown",
              balance: account.balance || 0,
              balanceType: account.balanceType || "debit",
              subAccountCount: account.subAccountCount || 0,
              isParent: (account.subAccountCount || 0) > 0,
              parentId: account.parent?._id || null,
              code: account.code || "",
              description: account.description || "",
              isActive:
                account.isActive !== undefined ? account.isActive : true,
            };

            return {
              ...safeAccount,
              accountHead: safeAccount.accountHead
                ? safeAccount.accountHead.charAt(0).toUpperCase() +
                  safeAccount.accountHead.slice(1)
                : "Unknown",
              balance: Math.abs(safeAccount.balance),
            };
          });

        setSubAccounts(transformedAccounts);

        // Calculate totals
        const totalBalance = transformedAccounts.reduce(
          (sum, acc) => sum + acc.balance,
          0
        );
        const totalOpening = transformedAccounts.reduce(
          (sum, acc) => sum + (acc.balance || 0),
          0
        );
        const totalClosing = totalBalance; // For now, same as balance

        setParentAccount((prev) =>
          prev
            ? {
                ...prev,
                totalSubAccountBalance: totalBalance,
                totalOpeningBalance: totalOpening,
                totalClosingBalance: totalClosing,
              }
            : null
        );
      }
    } catch (error) {
      console.error("Error fetching sub-accounts:", error);
      showToast("Failed to fetch sub-accounts", "error");
      // Set empty array to prevent further errors
      setSubAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accountId) {
      fetchParentAccount();
      fetchSubAccounts();
    }
  }, [accountId]);

  // Create new sub-account
  const handleCreateSubAccount = async (accountData: AccountFormData) => {
    try {
      await chartOfAccountsAPI.create({
        name: accountData.name,
        accountHead: accountData.accountHead.toLowerCase(),
        accountGroup: accountData.accountGroup,
        parent: accountId, // Set parent to current account
        code: accountData.code,
        openingBalance: accountData.openingBalance,
        currency: accountData.currency,
        description: accountData.description,
        isActive: accountData.isActive,
        balanceType: accountData.balanceType.toLowerCase(),
      });

      showToast("Sub-account created successfully", "success");
      await fetchSubAccounts(); // Refresh sub-accounts
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error creating sub-account:", error);
      showToast(
        error instanceof Error ? error.message : "Failed to create sub-account",
        "error"
      );
    }
  };

  // Handle account click to navigate to its sub-accounts
  const handleAccountClick = (account: Account) => {
    // Navigate to account page for any account (with or without sub-accounts)
    router.push(`/dashboard/accountant/chart-of-accounts/${account._id}`);
  };

  // Filter sub-accounts by search term
  const filteredSubAccounts = subAccounts.filter((account) => {
    const matchesSearch = account.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!parentAccount) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Account Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The account you&apos;re looking for doesn&apos;t exist.
          </p>
          <button
            onClick={() =>
              router.push("/dashboard/accountant/chart-of-accounts")
            }
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Chart of Accounts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() =>
                  router.push("/dashboard/accountant/chart-of-accounts")
                }
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <Building2 className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {parentAccount.name}
                </h1>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <Info className="h-4 w-4 mr-1" />
                  {parentAccount.accountHead} • {parentAccount.accountGroup}
                  {parentAccount.description &&
                    ` • ${parentAccount.description}`}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Removed topmost Add Sub-account button and My Company text */}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-600 mb-4">
          <button
            onClick={() =>
              router.push("/dashboard/accountant/chart-of-accounts")
            }
            className="hover:text-blue-600"
          >
            Chart of Accounts
          </button>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{parentAccount.name}</span>
        </div>

        {/* Tabs */}
        <div className="flex space-x-8 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("sub-accounts")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "sub-accounts"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            All Sub-Accounts
          </button>
          <button
            onClick={() => setActiveTab("journal-entries")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "journal-entries"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Journal Entries
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Total Balance of Sub-accounts
            </h3>
            <p className="text-2xl font-bold text-gray-900">
              ₹{parentAccount.totalSubAccountBalance.toFixed(2)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Total Opening Balance
            </h3>
            <p className="text-2xl font-bold text-gray-900">
              ₹{parentAccount.totalOpeningBalance.toFixed(2)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Total Closing Balance
            </h3>
            <p className="text-2xl font-bold text-gray-900">
              ₹{parentAccount.totalClosingBalance.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Q Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Sub-account
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
              <Filter className="h-4 w-4" />
              Filters
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
              <ArrowUpDown className="h-4 w-4" />
              Sort By
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Download className="h-4 w-4" />
              Export (csv)
            </button>
          </div>
        </div>

        {/* Sub-Accounts Table */}
        {activeTab === "sub-accounts" && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Sub-Accounts
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Account Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Balance
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSubAccounts.length > 0 ? (
                    filteredSubAccounts.map((account) => (
                      <tr
                        key={account._id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleAccountClick(account)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {(account.subAccountCount ?? 0) > 0 && (
                              <ChevronRight className="h-4 w-4 text-gray-400 mr-2" />
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {account.name}
                              </div>
                              {(account.subAccountCount ?? 0) > 0 && (
                                <div className="text-xs text-gray-500">
                                  {account.subAccountCount} account
                                  {account.subAccountCount !== 1 ? "s" : ""}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            ₹{account.balance.toFixed(2)}{" "}
                            {account.balanceType.toUpperCase()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-gray-400 hover:text-gray-600">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-6 py-4 text-center text-sm text-gray-500"
                      >
                        No sub-accounts found. Create your first sub-account
                        using the &quot;Add Sub-account&quot; button.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="px-6 py-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-700">
                  <span>Rows per page: 50</span>
                </div>
                <div className="text-sm text-gray-700">
                  1-{filteredSubAccounts.length} of {filteredSubAccounts.length}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Journal Entries Tab */}
        {activeTab === "journal-entries" && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center text-gray-500">
              <p>Journal entries functionality will be implemented here.</p>
            </div>
          </div>
        )}
      </div>

      {/* Create Sub-Account Modal */}
      <CreateAccountModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateSubAccount}
        existingAccounts={subAccounts}
        isSubAccount={true}
        parentAccount={parentAccount}
      />
    </div>
  );
};

export default SubAccountPage;
