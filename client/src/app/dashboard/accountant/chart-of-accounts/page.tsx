/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  MoreHorizontal,
  Building2,
  ChevronDown,
} from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import { chartOfAccountsAPI } from "@/lib/api";
import AccountTable from "./components/AccountTable";
import AccountTabs from "./components/AccountTabs";
import SearchAndActions from "./components/SearchAndActions";
import CreateAccountModal from "./components/CreateAccountModal";
import ExcelUploadModal from "./components/ExcelUploadModal";
import { ParsedExcelResult } from "@/services/excelParserService";

interface Account {
  _id: string;
  name: string;
  accountType: string;
  accountGroup: string;
  originalSubtype?: string; // Store the original subtype from backend
  balance: number;
  balanceType: "credit" | "debit";
  subAccountCount?: number;
  isParent?: boolean;
  parentId?: string;
  code?: string;
  description?: string;
  isActive: boolean;
}

const ChartOfAccountsPage = () => {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const { showToast } = useToast();

  // Fetch accounts from backend API
  const fetchAccounts = async (category?: string) => {
    try {
      setLoading(true);
      console.log("Fetching accounts...");

      // Build query parameters for filtering
      const params: Record<string, string> = {};
      if (category && category !== "all") {
        params.category = category;
      }

      const data = await chartOfAccountsAPI.getAll(params);
      console.log("Received data:", data);
      console.log("Filter params:", params);

      // Validate data structure
      if (!data || !data.data || !Array.isArray(data.data)) {
        console.error("❌ Invalid data structure received:", data);
        throw new Error("Invalid data structure received from API");
      }

      // Transform backend data to match frontend interface
      console.log(
        "🔄 Transforming accounts data:",
        data.data.length,
        "accounts"
      );
      const transformedAccounts: Account[] = data.data.map((account: any) => {
        // Determine balance type based on account category (accounting rules)
        const getBalanceType = (category: string, balance: number) => {
          const categoryLower = category.toLowerCase();

          // Assets and Expenses are typically debit (positive)
          if (categoryLower === "asset" || categoryLower === "expense") {
            return "debit";
          }

          // Liabilities, Equity, and Income are typically credit (negative)
          if (
            categoryLower === "liability" ||
            categoryLower === "equity" ||
            categoryLower === "income"
          ) {
            return "credit";
          }

          // Fallback: use the sign of the balance
          return balance >= 0 ? "debit" : "credit";
        };

        return {
          _id: account._id,
          name: account.name,
          accountType:
            account.category.charAt(0).toUpperCase() +
            account.category.slice(1),
          accountGroup: account.subtype
            ? account.subtype
                .replace(/_/g, " ")
                .replace(/\b\w/g, (l: string) => l.toUpperCase())
            : "Other",
          originalSubtype: account.subtype || null, // Store original subtype
          balance: Math.abs(account.balance || 0), // Use absolute value for display
          balanceType: getBalanceType(account.category, account.balance || 0),
          subAccountCount: account.subAccountCount,
          isParent: account.isParent,
          parentId: account.parent,
          code: account.code,
          description: account.description,
          isActive: account.is_active,
        };
      });

      console.log("Transformed accounts:", transformedAccounts);
      setAccounts(transformedAccounts);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      showToast(
        error instanceof Error ? error.message : "Failed to fetch accounts",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Upload parsed Excel data
  const handleExcelUpload = async (parsedData: ParsedExcelResult) => {
    try {
      console.log("Uploading parsed data:", parsedData.validRows, "valid rows");

      const result = await chartOfAccountsAPI.uploadExcelData(parsedData.data);
      console.log("Upload result:", result);

      // Create a more detailed success message
      const created = result.data.created || 0;
      const updated = result.data.updated || 0;
      const errors = result.data.errors || [];

      let message = `Successfully imported ${created} accounts, updated ${updated} accounts`;

      if (errors.length > 0) {
        message += ` (${errors.length} errors occurred)`;
      }

      showToast(message, "success");

      // Refresh the accounts list
      await fetchAccounts(activeTab);
      setShowUploadModal(false);
    } catch (error) {
      console.error("Error uploading Excel data:", error);
      showToast(
        error instanceof Error ? error.message : "Failed to upload Excel data",
        "error"
      );
    }
  };

  // Create new account
  const handleCreateAccount = async (accountData: any) => {
    try {
      await chartOfAccountsAPI.create({
        name: accountData.name,
        category: accountData.category, // Now category is the head (Asset, Income, etc.)
        subtype: accountData.subtype, // Now subtype is the group (Current, Fixed, etc.)
        parent: accountData.parent || null,
        code: accountData.code,
        opening_balance: accountData.opening_balance,
        currency: accountData.currency,
        gst_treatment: accountData.gst_treatment,
        gst_rate: accountData.gst_rate,
        description: accountData.description,
        is_active: accountData.is_active,
        is_sub_account: accountData.is_sub_account,
      });

      showToast("Account created successfully", "success");
      await fetchAccounts(activeTab);
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error creating account:", error);
      showToast(
        error instanceof Error ? error.message : "Failed to create account",
        "error"
      );
    }
  };

  useEffect(() => {
    fetchAccounts(activeTab);
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Fetch accounts with the new category filter
    fetchAccounts(tab);

    // Show toast notification for filtering
    if (tab !== "all") {
      const categoryName = tab.charAt(0).toUpperCase() + tab.slice(1);
      showToast(`Filtering by ${categoryName} accounts`, "info");
    } else {
      showToast("Showing all accounts", "info");
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleCreateAccountClick = () => {
    setShowCreateModal(true);
  };

  const handleUploadExcel = () => {
    setShowUploadModal(true);
  };

  const handleAccountClick = (account: Account) => {
    if (account.isParent) {
      // Navigate to sub-accounts
      router.push(`/dashboard/accountant/chart-of-accounts/${account._id}`);
    }
  };

  // Filter accounts by search term only (category filtering is now handled by backend)
  const filteredAccounts = accounts.filter((account) => {
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">
                Chart of Accounts v2
              </h1>
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
        {/* Account Type Tabs */}
        <AccountTabs activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Search and Actions */}
        <SearchAndActions
          searchTerm={searchTerm}
          onSearch={handleSearch}
          onCreateAccount={handleCreateAccountClick}
          onUploadExcel={handleUploadExcel}
        />

        {/* Accounts Table */}
        <AccountTable
          accounts={filteredAccounts}
          onAccountClick={handleAccountClick}
          onEditAccount={(account) => setSelectedAccount(account)}
        />
      </div>

      {/* Modals */}
      <CreateAccountModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateAccount}
        existingAccounts={accounts.map((account) => {
          const mappedAccount = {
            _id: account._id,
            name: account.name,
            category: account.accountType.toLowerCase(),
            subtype:
              account.originalSubtype ||
              account.accountGroup.toLowerCase().replace(/\s+/g, "_"),
            isParent: account.isParent,
            parentId: account.parentId,
          };

          // Debug: Check for current_asset accounts specifically
          if (mappedAccount.subtype === "current_asset") {
            console.log("🎯 Found current_asset account:", {
              name: mappedAccount.name,
              category: mappedAccount.category,
              subtype: mappedAccount.subtype,
              isParent: mappedAccount.isParent,
              originalSubtype: account.originalSubtype,
              accountGroup: account.accountGroup,
              parentId: mappedAccount.parentId,
            });
          }

          console.log("🔍 Mapped account for modal:", {
            name: mappedAccount.name,
            category: mappedAccount.category,
            subtype: mappedAccount.subtype,
            isParent: mappedAccount.isParent,
            originalSubtype: account.originalSubtype,
            accountGroup: account.accountGroup,
          });
          return mappedAccount;
        })}
      />

      <ExcelUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleExcelUpload}
      />
    </div>
  );
};

export default ChartOfAccountsPage;
