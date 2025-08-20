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
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
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
  const [allAccountsForDropdown, setAllAccountsForDropdown] = useState<
    Account[]
  >([]);
  const { showToast } = useToast();

  // Initialize SweetAlert2 with React content
  const MySwal = withReactContent(Swal);

  // Fetch all accounts for dropdown (including sub-accounts)
  const fetchAllAccountsForDropdown = async () => {
    try {
      console.log("Fetching all accounts for dropdown...");
      const data = await chartOfAccountsAPI.getAllForDropdown();
      console.log("Received dropdown data:", data);

      if (!data || !data.data || !Array.isArray(data.data)) {
        console.error("❌ Invalid dropdown data structure received:", data);
        return;
      }

      const transformedAccounts: Account[] = data.data
        .filter((account: any) => account && account._id)
        .map((account: any) => ({
          _id: account._id || "",
          name: account.name || "Unnamed Account",
          accountHead: account.accountHead || "unknown",
          accountGroup: account.accountGroup || "Unknown",
          balance: account.balance || 0,
          balanceType: account.balanceType || "debit",
          subAccountCount: account.subAccountCount || 0,
          isParent: account.isParent || false,
          parentId: account.parentId || account.parent?._id || null,
          code: account.code || "",
          description: account.description || "",
          isActive: account.isActive !== undefined ? account.isActive : true,
        }));

      console.log("Transformed dropdown accounts:", transformedAccounts);
      setAllAccountsForDropdown(transformedAccounts);
    } catch (error) {
      console.error("Error fetching dropdown accounts:", error);
      showToast(
        error instanceof Error
          ? error.message
          : "Failed to fetch dropdown accounts",
        "error"
      );
    }
  };

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

  // Create or update account
  const handleCreateAccount = async (accountData: any) => {
    try {
      if (selectedAccount) {
        // Update existing account - only allow specific fields to be updated
        await chartOfAccountsAPI.updatePartial(selectedAccount._id, {
          name: accountData.name,
          code: accountData.code,
          description: accountData.description,
          isActive: accountData.isActive,
          currency: accountData.currency,
        });

        showToast("Account updated successfully", "success");
        setSelectedAccount(null);
      } else {
        // Create new account
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
          balanceType: accountData.balanceType.toLowerCase(),
        });

        showToast("Account created successfully", "success");
      }

      await fetchAccounts(activeTab);
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error saving account:", error);
      showToast(
        error instanceof Error ? error.message : "Failed to save account",
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

  const handleCreateAccountClick = async () => {
    // Fetch all accounts for dropdown when opening the modal
    await fetchAllAccountsForDropdown();
    setShowCreateModal(true);
  };

  const handleUploadExcel = () => {
    setShowUploadModal(true);
  };

  // Handle account click to navigate to sub-accounts
  const handleAccountClick = (account: Account) => {
    // Navigate to account page for any account (with or without sub-accounts)
    router.push(`/dashboard/accountant/chart-of-accounts/${account._id}`);
  };

  // Handle delete account with SweetAlert2
  const handleDeleteAccount = async (accountId: string) => {
    const account = accounts.find((acc) => acc._id === accountId);
    const accountName = account?.name || "this account";

    try {
      const result = await MySwal.fire({
        title: "Delete Account?",
        html: `
          <div class="text-left">
            <p class="text-gray-600 mb-3">Are you sure you want to delete <strong>"${accountName}"</strong>?</p>
            <div class="bg-red-50 border border-red-200 rounded-lg p-3">
              <div class="flex items-center">
                <svg class="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
                <span class="text-red-800 text-sm font-medium">This action cannot be undone!</span>
              </div>
            </div>
          </div>
        `,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Yes, Delete Account",
        cancelButtonText: "Cancel",
        reverseButtons: true,
        focusCancel: true,
        customClass: {
          popup: "rounded-lg",
          title: "text-xl font-semibold text-gray-900",
          confirmButton: "rounded-lg px-4 py-2 font-medium",
          cancelButton: "rounded-lg px-4 py-2 font-medium",
        },
      });

      if (result.isConfirmed) {
        // Show loading state
        MySwal.fire({
          title: "Deleting Account...",
          html: "Please wait while we delete the account.",
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: false,
          didOpen: () => {
            MySwal.showLoading();
          },
        });

        await chartOfAccountsAPI.delete(accountId);

        // Show success message
        await MySwal.fire({
          title: "Deleted!",
          text: `"${accountName}" has been successfully deleted.`,
          icon: "success",
          confirmButtonColor: "#10b981",
          confirmButtonText: "OK",
          customClass: {
            popup: "rounded-lg",
            confirmButton: "rounded-lg px-4 py-2 font-medium",
          },
        });

        showToast("Account deleted successfully", "success");
        await fetchAccounts(activeTab);
      }
    } catch (error) {
      console.error("Error deleting account:", error);

      // Show error message
      await MySwal.fire({
        title: "Error!",
        text:
          error instanceof Error ? error.message : "Failed to delete account",
        icon: "error",
        confirmButtonColor: "#ef4444",
        confirmButtonText: "OK",
        customClass: {
          popup: "rounded-lg",
          confirmButton: "rounded-lg px-4 py-2 font-medium",
        },
      });

      showToast(
        error instanceof Error ? error.message : "Failed to delete account",
        "error"
      );
    }
  };

  // Handle archive/unarchive account
  const handleArchiveAccount = async (accountId: string) => {
    try {
      const account = accounts.find((acc) => acc._id === accountId);
      if (!account) return;

      const newIsActive = !account.isActive;
      const action = newIsActive ? "unarchived" : "archived";

      await chartOfAccountsAPI.update(accountId, { isActive: newIsActive });
      showToast(`Account ${action} successfully`, "success");
      await fetchAccounts(activeTab);
    } catch (error) {
      console.error("Error archiving account:", error);
      showToast(
        error instanceof Error ? error.message : "Failed to archive account",
        "error"
      );
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
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard/accountant')}
                className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
              >
                ← Back to Accountant
              </button>
              <div className="flex items-center">
                <Building2 className="h-8 w-8 text-blue-600 mr-3" />
                <h1 className="text-2xl font-bold text-gray-900">
                  Chart of Accounts v2
                </h1>
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
          onEditAccount={(account) => {
            setSelectedAccount(account);
            setShowCreateModal(true);
          }}
          onDeleteAccount={handleDeleteAccount}
          onArchiveAccount={handleArchiveAccount}
        />
      </div>

      {/* Modals */}
      <CreateAccountModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedAccount(null);
        }}
        onSave={handleCreateAccount}
        existingAccounts={allAccountsForDropdown}
        editingAccount={selectedAccount}
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
