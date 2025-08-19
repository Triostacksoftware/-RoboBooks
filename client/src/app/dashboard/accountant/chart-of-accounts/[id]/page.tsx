"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Building2, ChevronDown } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import { chartOfAccountsAPI } from "@/lib/api";
import AccountTable from "../components/AccountTable";
import CreateAccountModal from "../components/CreateAccountModal";

interface Account {
  _id: string;
  name: string;
  accountType: string;
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

const AccountDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const [account, setAccount] = useState<Account | null>(null);
  const [subAccounts, setSubAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const accountId = params.id as string;

  // Fetch account details and sub-accounts
  const fetchAccountDetails = async () => {
    try {
      setLoading(true);
      const [accountData, subAccountsData] = await Promise.all([
        chartOfAccountsAPI.getById(accountId),
        chartOfAccountsAPI.getSubAccounts(accountId),
      ]);

      // Transform account data
      const transformedAccount: Account = {
        _id: accountData.data._id,
        name: accountData.data.name,
        accountType:
          accountData.data.category.charAt(0).toUpperCase() +
          accountData.data.category.slice(1),
        accountGroup: accountData.data.subtype
          ? accountData.data.subtype
              .replace(/_/g, " ")
              .replace(/\b\w/g, (l: string) => l.toUpperCase())
          : "Other",
        balance: Math.abs(accountData.data.balance || 0),
        balanceType: accountData.data.balance >= 0 ? "debit" : "credit",
        subAccountCount: accountData.data.subAccountCount,
        isParent: accountData.data.isParent,
        code: accountData.data.code,
        description: accountData.data.description,
        isActive: accountData.data.is_active,
      };

      // Transform sub-accounts data
      const transformedSubAccounts: Account[] = subAccountsData.data.map(
        (subAccount: any) => ({
          _id: subAccount._id,
          name: subAccount.name,
          accountType:
            subAccount.category.charAt(0).toUpperCase() +
            subAccount.category.slice(1),
          accountGroup: subAccount.subtype
            ? subAccount.subtype
                .replace(/_/g, " ")
                .replace(/\b\w/g, (l: string) => l.toUpperCase())
            : "Other",
          balance: Math.abs(subAccount.balance || 0),
          balanceType: subAccount.balance >= 0 ? "debit" : "credit",
          subAccountCount: subAccount.subAccountCount,
          isParent: subAccount.isParent,
          parentId: subAccount.parent,
          code: subAccount.code,
          description: subAccount.description,
          isActive: subAccount.is_active,
        })
      );

      setAccount(transformedAccount);
      setSubAccounts(transformedSubAccounts);
    } catch (error) {
      console.error("Error fetching account details:", error);
      showToast("Failed to fetch account details", "error");
    } finally {
      setLoading(false);
    }
  };

  // Create new sub-account
  const handleCreateSubAccount = async (accountData: any) => {
    try {
      await chartOfAccountsAPI.create({
        ...accountData,
        parent: accountId, // Set the current account as parent
      });

      showToast("Sub-account created successfully", "success");
      await fetchAccountDetails();
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error creating sub-account:", error);
      showToast(
        error instanceof Error ? error.message : "Failed to create sub-account",
        "error"
      );
    }
  };

  useEffect(() => {
    if (accountId) {
      fetchAccountDetails();
    }
  }, [accountId]);

  const handleAccountClick = (subAccount: Account) => {
    if (subAccount.isParent) {
      // Navigate to sub-account's sub-accounts
      router.push(`/dashboard/accountant/chart-of-accounts/${subAccount._id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Account not found
          </h2>
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const totalBalance = subAccounts.reduce((sum, subAccount) => {
    return (
      sum +
      (subAccount.balanceType === "debit"
        ? subAccount.balance
        : -subAccount.balance)
    );
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <Building2 className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {account.name} v2
                </h1>
                <p className="text-sm text-gray-600">
                  {account.accountType} ({account.accountGroup})
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-600">
                <span>My Company</span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Account Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Account Information
              </h3>
              <p className="text-sm text-gray-600">
                {account.name} ({account.accountGroup}) -{" "}
                {account.description || "No description"}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Total Balance of Sub-accounts
              </h3>
              <p className="text-2xl font-bold text-gray-900">
                ₹ {Math.abs(totalBalance).toFixed(2)}{" "}
                {totalBalance >= 0 ? "DR" : "CR"}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Total Closing Balance
              </h3>
              <p className="text-2xl font-bold text-gray-900">
                ₹ {account.balance.toFixed(2)}{" "}
                {account.balanceType.toUpperCase()}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button className="py-4 px-1 border-b-2 border-blue-500 text-sm font-medium text-blue-600">
                All Sub-Accounts
              </button>
              <button className="py-4 px-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700">
                Journal Entries
              </button>
            </nav>
          </div>
        </div>

        {/* Sub-Accounts Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Sub-Accounts
            </h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Sub-account
            </button>
          </div>
          <AccountTable
            accounts={subAccounts}
            onAccountClick={handleAccountClick}
            onEditAccount={(account) => console.log("Edit account:", account)}
          />
        </div>
      </div>

      {/* Create Sub-Account Modal */}
      <CreateAccountModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateSubAccount}
        existingAccounts={[account, ...subAccounts]}
      />
    </div>
  );
};

export default AccountDetailPage;
