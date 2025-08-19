/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
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
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const { showToast } = useToast();

  // Fetch accounts from backend API
  const fetchAccounts = async () => {
    try {
      setLoading(true);
      console.log("Fetching accounts...");

      const data = await chartOfAccountsAPI.getAll();
      console.log("Received data:", data);

      // Transform backend data to match frontend interface
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
      showToast("Failed to fetch accounts", "error");
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
      await fetchAccounts();
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
        category: accountData.category,
        subtype: accountData.subtype,
        parent: accountData.parent || null,
        code: accountData.code,
        opening_balance: accountData.opening_balance,
        currency: accountData.currency,
        gst_treatment: accountData.gst_treatment,
        gst_rate: accountData.gst_rate,
        description: accountData.description,
        is_active: accountData.is_active,
      });

      showToast("Account created successfully", "success");
      await fetchAccounts();
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
    fetchAccounts();
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
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
      // Navigate to sub-accounts or expand
      console.log("Navigate to sub-accounts for:", account.name);
    }
  };

  const filteredAccounts = accounts.filter((account) => {
    const matchesSearch = account.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesTab =
      activeTab === "all" ||
      account.accountType.toLowerCase() === activeTab.toLowerCase();
    return matchesSearch && matchesTab;
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
