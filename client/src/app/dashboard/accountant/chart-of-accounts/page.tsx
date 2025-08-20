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
  Database,
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
  const fetchAccounts = async (accountHead?: string) => {
    try {
      setLoading(true);
      console.log("Fetching accounts...");

      // Build query parameters for filtering
      const params: Record<string, string> = {};
      if (accountHead && accountHead !== "all") {
        params.accountHead = accountHead;
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
      const transformedAccounts: Account[] = data.data
        .filter((account: any) => account && account._id) // Filter out invalid accounts
        .map((account: any) => {
          // Ensure all required fields exist
          const safeAccount = {
            _id: account._id || "",
            name: account.name || "Unnamed Account",
            accountHead: account.accountHead || "unknown",
            accountGroup: account.accountGroup || "Unknown",
            balance: account.balance || 0,
            balanceType: account.balanceType || "debit",
            subAccountCount: account.subAccountCount || 0,
            isParent: account.isParent || false,
            parentId: account.parent?._id || null,
            code: account.code || "",
            description: account.description || "",
            isActive: account.isActive !== undefined ? account.isActive : true,
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

      console.log("Transformed accounts:", transformedAccounts);
      setAccounts(transformedAccounts);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      showToast(
        error instanceof Error ? error.message : "Failed to fetch accounts",
        "error"
      );
      // Set empty array to prevent further errors
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  // Export accounts to Excel
  const handleExportExcel = async () => {
    try {
      const blob = await chartOfAccountsAPI.exportExcel();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `chart-of-accounts-${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast("Accounts exported successfully", "success");
    } catch (error) {
      console.error("Export failed:", error);
      showToast("Failed to export accounts", "error");
    }
  };

  // Create default accounts
  const handleCreateDefaults = async () => {
    try {
      const result = await chartOfAccountsAPI.createDefaults();
      showToast("Default accounts created successfully", "success");
      await fetchAccounts(activeTab);
    } catch (error) {
      console.error("Error creating defaults:", error);
      showToast("Failed to create default accounts", "error");
    }
  };

  // Upload Excel file
  const handleExcelUpload = async (file: File) => {
    try {
      console.log("Uploading Excel file:", file.name);

      // Create FormData to send file
      const formData = new FormData();
      formData.append("file", file);

      const result = await chartOfAccountsAPI.uploadExcelFile(formData);
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
      console.error("Error uploading Excel file:", error);
      showToast(
        error instanceof Error ? error.message : "Failed to upload Excel file",
        "error"
      );
    }
  };

  // Create new account
  const handleCreateAccount = async (accountData: any) => {
    try {
      await chartOfAccountsAPI.create({
        name: accountData.name,
        accountHead: accountData.accountHead.toLowerCase(),
        accountGroup: accountData.accountGroup,
        parent: accountData.parent || null,
        code: accountData.code,
        openingBalance: accountData.openingBalance,
        currency: accountData.currency,
        description: accountData.description,
        isActive: accountData.isActive,
        balanceType: accountData.balanceType.toLowerCase(), // Add the missing balanceType field
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
    // Fetch accounts with the new account head filter
    fetchAccounts(tab);

    // Show toast notification for filtering
    if (tab !== "all") {
      const accountHeadName = tab.charAt(0).toUpperCase() + tab.slice(1);
      showToast(`Filtering by ${accountHeadName} accounts`, "info");
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

  // Handle account click to navigate to sub-accounts
  const handleAccountClick = (account: Account) => {
    if (account.isParent || account.subAccountCount > 0) {
      // Navigate to sub-accounts page
      router.push(`/dashboard/accountant/chart-of-accounts/${account._id}`);
    }
  };

  // Filter accounts by search term only (account head filtering is now handled by backend)
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
          onSearchChange={handleSearch}
          onCreateAccount={handleCreateAccountClick}
          onImportExcel={handleUploadExcel}
          onExportExcel={handleExportExcel}
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
        existingAccounts={accounts}
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
