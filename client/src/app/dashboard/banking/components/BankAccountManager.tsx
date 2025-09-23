"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  BanknotesIcon,
  CreditCardIcon,
  PlusIcon,
  Cog6ToothIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  LinkIcon,
  NoSymbolIcon,
  DocumentArrowUpIcon,
} from "@heroicons/react/24/outline";
import { useBanking } from "@/contexts/BankingContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
// import bankingService from "@/services/bankingService";

interface BankAccount {
  _id: string;
  name: string;
  accountCode?: string;
  currency: string;
  accountNumber?: string;
  bankName?: string;
  ifsc?: string;
  description?: string;
  isPrimary: boolean;
  accountType: "bank" | "credit_card";
  balance: number;
  status: "active" | "inactive" | "closed";
  lastSync?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Memoized currency options to prevent re-creation on every render
const CURRENCY_OPTIONS = [
  { value: "INR", label: "INR - Indian Rupee" },
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
];

// Add Account Modal Component
const AddAccountModal = ({
  isOpen,
  onClose,
  form,
  setForm,
  onSubmit,
  submitting,
  nameInputRef,
  onImportTransactions,
}: {
  isOpen: boolean;
  onClose: () => void;
  form: any;
  setForm: (updater: (prev: any) => any) => void;
  onSubmit: () => void;
  submitting: boolean;
  nameInputRef: React.RefObject<HTMLInputElement | null>;
  onImportTransactions: (file: File, accountId: string) => void;
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onMouseDown={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Add Bank or Credit Card
            </h3>
            <p className="text-sm text-gray-500">
              Create a manual account to start tracking balances and
              transactions.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          {/* Account Type Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Account Type *
            </label>
            <div className="flex space-x-6">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="accountType"
                  value="bank"
                  checked={form.accountType === "bank"}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      accountType: e.target.value as "bank" | "credit_card",
                    }))
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">Bank</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="accountType"
                  value="credit_card"
                  checked={form.accountType === "credit_card"}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      accountType: e.target.value as "bank" | "credit_card",
                    }))
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">Credit Card</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => {
                  const v = e.target.value;
                  setForm((prev) => ({ ...prev, name: v }));
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="e.g., Business Checking"
                autoComplete="off"
                ref={nameInputRef}
                required
              />
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Code
              </label>
              <input
                type="text"
                value={form.accountCode}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, accountCode: e.target.value }))
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="e.g., ACC001"
                autoComplete="off"
              />
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency *
              </label>
              <select
                value={form.currency}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, currency: e.target.value }))
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                required
              >
                {CURRENCY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Number
              </label>
              <input
                type="text"
                value={form.accountNumber}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    accountNumber: e.target.value,
                  }))
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="e.g., 1234567890"
                autoComplete="off"
              />
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank Name
              </label>
              <input
                type="text"
                value={form.bankName}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, bankName: e.target.value }))
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="e.g., Chase Bank"
                autoComplete="off"
              />
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IFSC
              </label>
              <input
                type="text"
                value={form.ifsc}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, ifsc: e.target.value }))
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="e.g., CHAS0000123"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="Max. 500 characters"
              maxLength={500}
            />
          </div>

          <div className="mt-4 flex items-center">
            <input
              id="isPrimary"
              type="checkbox"
              checked={form.isPrimary}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, isPrimary: e.target.checked }))
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="isPrimary"
              className="ml-2 block text-sm text-gray-900"
            >
              Make this primary
            </label>
          </div>

          {/* Import Transactions Section */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Import Existing Transactions</h4>
            <p className="text-xs text-gray-600 mb-3">
              Import transactions for this account. You can import after creating the account.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  // This will trigger file input for import
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.csv,.xlsx,.xls,.pdf';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      // We'll need to create the account first, then import
                      // For now, we'll store the file and import after account creation
                      setForm((prev) => ({ ...prev, importFile: file }));
                    }
                  };
                  input.click();
                }}
                className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <DocumentArrowUpIcon className="h-4 w-4" />
                {form.importFile ? "Change File" : "Select File to Import"}
              </button>
            </div>
            {form.importFile && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <DocumentArrowUpIcon className="h-4 w-4 text-green-600" />
                  <p className="text-xs text-green-700 font-medium">
                    Selected: {form.importFile.name}
                  </p>
                </div>
                <p className="text-xs text-green-600 mt-1">
                  File will be imported automatically after account creation
                </p>
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, importFile: null }))}
                  className="text-xs text-red-600 hover:text-red-800 mt-1 underline"
                >
                  Remove file
                </button>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Supported formats: CSV, Excel (.xlsx, .xls), PDF
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={submitting}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {submitting ? "Adding..." : "Add Account"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Edit Account Modal Component
const EditAccountModal = ({ 
  isOpen, 
  onClose, 
  form, 
  setForm, 
  onSubmit, 
  submitting, 
  nameInputRef, 
  account,
  onImportTransactions
}: {
  isOpen: boolean;
  onClose: () => void;
  form: {
    name: string;
    accountCode: string;
    currency: string;
    accountNumber: string;
    bankName: string;
    ifsc: string;
    description: string;
    isPrimary: boolean;
    accountType: "bank" | "credit_card";
  };
  setForm: (form: any) => void;
  onSubmit: () => void;
  submitting: boolean;
  nameInputRef: React.RefObject<HTMLInputElement | null>;
  account: BankAccount | null;
  onImportTransactions: (file: File, accountId: string) => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 w-full max-w-lg max-h-[90vh] overflow-y-auto mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Edit Bank Account</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Type
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="accountType"
                  value="bank"
                  checked={form.accountType === "bank"}
                  onChange={(e) => setForm({ ...form, accountType: e.target.value })}
                  className="mr-2"
                />
                Bank
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="accountType"
                  value="credit_card"
                  checked={form.accountType === "credit_card"}
                  onChange={(e) => setForm({ ...form, accountType: e.target.value })}
                  className="mr-2"
                />
                Credit Card
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Name *
            </label>
            <input
              ref={nameInputRef}
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Business Checking"
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Code
            </label>
            <input
              type="text"
              value={form.accountCode}
              onChange={(e) => setForm({ ...form, accountCode: e.target.value })}
              placeholder="e.g., ACC001"
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Currency
            </label>
            <select
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              {CURRENCY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Number
            </label>
            <input
              type="text"
              value={form.accountNumber}
              onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
              placeholder="e.g., 1234567890"
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bank Name
            </label>
            <input
              type="text"
              value={form.bankName}
              onChange={(e) => setForm({ ...form, bankName: e.target.value })}
              placeholder="e.g., Chase Bank"
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              IFSC
            </label>
            <input
              type="text"
              value={form.ifsc}
              onChange={(e) => setForm({ ...form, ifsc: e.target.value })}
              placeholder="e.g., CHAS0000123"
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Optional description"
              rows={2}
              maxLength={500}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Max. 500 characters
            </p>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPrimary"
              checked={form.isPrimary}
              onChange={(e) => setForm({ ...form, isPrimary: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="isPrimary" className="text-sm text-gray-700">
              Make this primary
            </label>
          </div>

          {/* Import Transactions Section */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Import Transactions</h3>
            <p className="text-xs text-gray-600 mb-3">
              Import transactions for this account. Files will be automatically associated with this account.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  // This will trigger file input for import
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.csv,.xlsx,.xls,.pdf';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      onImportTransactions(file, account?._id || '');
                    }
                  };
                  input.click();
                }}
                className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <DocumentArrowUpIcon className="h-4 w-4" />
                Import Transactions
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Supported formats: CSV, Excel (.xlsx, .xls), PDF
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {submitting ? "Updating..." : "Update Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Account Details Modal Component
const AccountDetailsModal = ({
  isOpen,
  onClose,
  selectedAccount,
  onSyncAccount,
  getAccountTypeIcon,
  getAccountTypeColor,
  getStatusIcon,
  getStatusColor,
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedAccount: BankAccount | null;
  onSyncAccount: (id: string) => void;
  getAccountTypeIcon: (type: string) => React.ReactNode;
  getAccountTypeColor: (type: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
  getStatusColor: (status: string) => string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Account Details
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {selectedAccount && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div
                className={`h-12 w-12 rounded-lg flex items-center justify-center ${getAccountTypeColor(
                  selectedAccount.accountType
                )}`}
              >
                {getAccountTypeIcon(selectedAccount.accountType)}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">
                  {selectedAccount.name}
                </h4>
                <p className="text-sm text-gray-500">
                  {selectedAccount.bankName || "N/A"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Account Number
                </label>
                <p className="text-gray-900">{selectedAccount.accountNumber}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Account Type
                </label>
                <p className="text-gray-900 capitalize">
                  {selectedAccount.accountType}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Balance
                </label>
                <p
                  className={`font-semibold ${
                    selectedAccount.balance >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {selectedAccount.balance >= 0 ? "+" : ""}?
                  {selectedAccount.balance.toLocaleString()}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Currency
                </label>
                <p className="text-gray-900">{selectedAccount.currency}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Status
                </label>
                <div className="flex items-center gap-2">
                  {getStatusIcon(selectedAccount.status)}
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      selectedAccount.status
                    )}`}
                  >
                    {selectedAccount.status}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Last Sync
                </label>
                <p className="text-gray-900">
                  {selectedAccount.lastSync
                    ? new Date(selectedAccount.lastSync).toLocaleString()
                    : "Never"}
                </p>
              </div>
            </div>

            {selectedAccount.ifsc && (
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  IFSC Code
                </label>
                <p className="text-gray-900">{selectedAccount.ifsc}</p>
              </div>
            )}

            {selectedAccount.description && (
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Description
                </label>
                <p className="text-gray-900">{selectedAccount.description}</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
            Edit Account
          </button>
          <button
            onClick={() =>
              selectedAccount && onSyncAccount(selectedAccount._id)
            }
            className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Sync Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default function BankAccountManager() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const banking = useBanking();
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(
    null
  );
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showAccountDetails, setShowAccountDetails] = useState(false);
  const [showEditAccount, setShowEditAccount] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [syncingAccount, setSyncingAccount] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState({
    name: "",
    accountCode: "",
    currency: "INR",
    accountNumber: "",
    bankName: "",
    ifsc: "",
    description: "",
    isPrimary: false,
    accountType: "bank" as "bank" | "credit_card",
    importFile: null as File | null,
  });

  const statuses = ["all", "active", "inactive", "closed"];
  const accountTypes = ["checking", "savings", "credit", "loan"];

  const filteredAccounts = Array.isArray(banking.accounts) ? banking.accounts.filter(
    (account) => {
      const matches = filterStatus === "all" || account.status === filterStatus;
      return matches;
    }
  ) : [];

  // Check if we need to show add account modal when no accounts exist
  React.useEffect(() => {
    if (banking.accounts.length === 0 && !banking.loading.accounts) {
      setShowAddAccount(true);
    }
  }, [banking.accounts.length, banking.loading.accounts]);

  // Sync bank account
  const handleSyncAccount = async (accountId: string) => {
    try {
      setSyncingAccount(accountId);
      await banking.syncAccount(accountId);
    } catch (err: any) {
      console.error("Error syncing account:", err);
    } finally {
      setSyncingAccount(null);
    }
  };

  // Bulk sync all accounts
  const handleBulkSync = async () => {
    if (!Array.isArray(banking.accounts) || banking.accounts.length === 0) {
      addToast({
        title: "Info",
        message: "No accounts to sync",
        type: "info",
        duration: 3000,
      });
      return;
    }

    const activeAccounts = banking.accounts.filter(account => account.status === "active");
    if (activeAccounts.length === 0) {
      addToast({
        title: "Info",
        message: "No active accounts to sync",
        type: "info",
        duration: 3000,
      });
      return;
    }

    try {
      setSyncingAccount("bulk");
      let successCount = 0;
      let errorCount = 0;

      for (const account of activeAccounts) {
        try {
          await banking.syncAccount(account._id);
          successCount++;
        } catch (err) {
          errorCount++;
          console.error(`Failed to sync account ${account.name}:`, err);
        }
      }

      if (successCount > 0) {
        addToast({
          title: "Success",
          message: `Successfully synced ${successCount} account(s)`,
          type: "success",
          duration: 3000,
        });
      }

      if (errorCount > 0) {
        addToast({
          title: "Warning",
          message: `Failed to sync ${errorCount} account(s)`,
          type: "error",
          duration: 5000,
        });
      }
    } catch (err: any) {
      addToast({
        title: "Error",
        message: "Failed to perform bulk sync",
        type: "error",
        duration: 5000,
      });
      console.error("Error during bulk sync:", err);
    } finally {
      setSyncingAccount(null);
    }
  };

  // Delete bank account
  const handleDeleteAccount = async (accountId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this bank account? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await banking.deleteAccount(accountId);
    } catch (err: any) {
      console.error("Error deleting account:", err);
    }
  };

  // Create bank account
  const handleAddAccount = async () => {
    if (!form.name || !form.accountType) {
      addToast({
        title: "Error",
        message: "Please fill in account name and select account type",
        type: "error",
        duration: 3000,
      });
      return;
    }
    try {
      setSubmitting(true);
      const newAccount = await banking.createAccount({
        name: form.name,
        accountCode: form.accountCode,
        currency: form.currency,
        accountNumber: form.accountNumber,
        bankName: form.bankName,
        ifsc: form.ifsc,
        description: form.description,
        isPrimary: form.isPrimary,
        accountType: form.accountType,
      });

      // If there's an import file, import transactions after account creation
      if (form.importFile && newAccount) {
        try {
          await handleImportTransactions(form.importFile, newAccount._id);
          // Refresh transactions to show the newly imported ones
          await banking.refreshTransactions();
          addToast({
            title: "Success",
            message: `Account created and transactions imported successfully!`,
            type: "success",
            duration: 5000,
          });
        } catch (importError) {
          console.error("Error importing transactions:", importError);
          addToast({
            title: "Warning",
            message: `Account created but failed to import transactions. You can import them later from the account edit page.`,
            type: "warning",
            duration: 5000,
          });
        }
      }

      setShowAddAccount(false);
      setForm({
        name: "",
        accountCode: "",
        currency: "INR",
        accountNumber: "",
        bankName: "",
        ifsc: "",
        description: "",
        isPrimary: false,
        accountType: "bank",
        importFile: null,
      });
    } catch (err: any) {
      console.error("Error creating account:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Edit bank account
  const handleEditAccount = async () => {
    if (!selectedAccount || !form.name || !form.accountType) {
      addToast({
        title: "Error",
        message: "Please fill in account name and select account type",
        type: "error",
        duration: 3000,
      });
      return;
    }
    try {
      setSubmitting(true);
      await banking.updateAccount(selectedAccount._id, {
        name: form.name,
        accountCode: form.accountCode,
        currency: form.currency,
        accountNumber: form.accountNumber,
        bankName: form.bankName,
        ifsc: form.ifsc,
        description: form.description,
        isPrimary: form.isPrimary,
        accountType: form.accountType,
      });
      setShowEditAccount(false);
      setSelectedAccount(null);
      setForm({
        name: "",
        accountCode: "",
        currency: "INR",
        accountNumber: "",
        bankName: "",
        ifsc: "",
        description: "",
        isPrimary: false,
        accountType: "bank",
        importFile: null,
      });
    } catch (err: any) {
      console.error("Error updating account:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle import transactions for specific account
  const handleImportTransactions = async (file: File, accountId: string) => {
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('accountId', accountId);
      formData.append('userId', user?.id || '');

      addToast({
        title: "Importing...",
        message: `Processing ${file.name} for account transactions`,
        type: "info",
        duration: 3000,
      });

      // Import transactions using fetch directly to backend
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const response = await fetch(`${backendUrl}/api/banking/import-transactions`, {
        method: 'POST',
        credentials: 'include', // Include cookies for authentication
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to import transactions');
      }

      const result = await response.json();
      
      addToast({
        title: "Success",
        message: `Successfully imported ${result.data?.count || 0} transactions from ${file.name}`,
        type: "success",
        duration: 5000,
      });
      
      // Refresh transactions to show the newly imported ones
      banking.refreshTransactions();
    } catch (err: any) {
      console.error("Error importing transactions:", err);
      addToast({
        title: "Error",
        message: `Failed to import transactions from ${file.name}`,
        type: "error",
        duration: 5000,
      });
    }
  };

  // Open edit modal with account data
  const openEditModal = (account: BankAccount) => {
    setSelectedAccount(account);
    setForm({
      name: account.name,
      accountCode: account.accountCode || "",
      currency: account.currency,
      accountNumber: account.accountNumber || "",
      bankName: account.bankName || "",
      ifsc: account.ifsc || "",
      description: account.description || "",
      isPrimary: account.isPrimary,
      accountType: account.accountType,
      importFile: null,
    });
    setShowEditAccount(true);
  };

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Listen for a global event to open the Add Account modal (triggered from parent page)
  useEffect(() => {
    const handler = () => setShowAddAccount(true);
    // Use capture=false to avoid interfering with input events; also mark passive
    window.addEventListener(
      "open-add-bank-account",
      handler as EventListener,
      false
    );
    return () =>
      window.removeEventListener(
        "open-add-bank-account",
        handler as EventListener,
        false
      );
  }, []);

  // Focus on account name field when modal opens
  useEffect(() => {
    if (showAddAccount && nameInputRef.current) {
      // Small delay to ensure modal is fully rendered
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  }, [showAddAccount]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case "inactive":
        return <NoSymbolIcon className="h-4 w-4 text-gray-500" />;
      case "closed":
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
      default:
        return <ExclamationTriangleIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "closed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAccountTypeIcon = (type: string) => {
    switch (type) {
      case "bank":
        return <BanknotesIcon className="h-6 w-6 text-blue-600" />;
      case "credit_card":
        return <CreditCardIcon className="h-6 w-6 text-purple-600" />;
      default:
        return <BanknotesIcon className="h-6 w-6 text-gray-600" />;
    }
  };

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case "bank":
        return "bg-blue-100";
      case "credit_card":
        return "bg-purple-100";
      default:
        return "bg-gray-100";
    }
  };



  // Prevent hydration mismatch by not rendering until hydrated
  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (banking.loading.accounts) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Bank Accounts</h3>
          <p className="text-gray-600">
            Manage your connected bank accounts and their settings
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleBulkSync}
            disabled={syncingAccount === "bulk"}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {syncingAccount === "bulk" ? (
              <ArrowPathIcon className="h-5 w-5 animate-spin" />
            ) : (
              <ArrowPathIcon className="h-5 w-5" />
            )}
            {syncingAccount === "bulk" ? "Syncing..." : "Sync All"}
          </button>
          <button
            onClick={() => setShowAddAccount(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Add Account
          </button>
        </div>
      </div>

      {/* Error */}
      {banking.errors.accounts && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex items-center gap-2">
          <ExclamationTriangleIcon className="h-5 w-5" />
          <span>{banking.errors.accounts}</span>
          <button onClick={banking.refreshAccounts} className="ml-auto underline">
            Retry
          </button>
        </div>
      )}

      {/* Empty state */}
      {Array.isArray(banking.accounts) && banking.accounts.length === 0 && !banking.errors.accounts && (
        <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center">
          <h4 className="text-gray-900 font-semibold mb-2">
            No bank accounts connected yet
          </h4>
          <p className="text-gray-600 mb-4">
            Connect your bank or add an account manually to get started.
          </p>
          <button
            onClick={() => setShowAddAccount(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Bank Account
          </button>
        </div>
      )}

      {/* Accounts Grid */}
      {Array.isArray(banking.accounts) && banking.accounts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAccounts.map((account) => (
            <div
              key={account._id}
              className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`h-12 w-12 rounded-lg flex items-center justify-center ${getAccountTypeColor(
                    account.accountType
                  )}`}
                >
                  {getAccountTypeIcon(account.accountType)}
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(account.status)}
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      account.status
                    )}`}
                  >
                    {account.status}
                  </span>
                </div>
              </div>

              <h4 className="font-semibold text-gray-900 mb-1">
                {account.name}
              </h4>
              <p className="text-sm text-gray-500 mb-3">
                {account.bankName || "N/A"} • {account.accountNumber || "N/A"}
              </p>

              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500">Balance</span>
                <span
                  className={`font-semibold ${
                    account.balance >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {account.balance >= 0 ? "+" : ""}?
                  {account.balance.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <span>Currency: {account.currency}</span>
                <span>Type: {account.accountType}</span>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-3">
                  Last synced:{" "}
                  {account.lastSync
                    ? new Date(account.lastSync).toLocaleString()
                    : "Never"}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedAccount(account);
                      setShowAccountDetails(true);
                    }}
                    className="flex-1 p-2 text-gray-400 hover:text-gray-600 rounded border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => openEditModal(account)}
                    className="flex-1 p-2 text-gray-400 hover:text-gray-600 rounded border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteAccount(account._id)}
                    className="flex-1 p-2 text-gray-400 hover:text-red-600 rounded border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                  {account.status === "inactive" && (
                    <button className="flex-1 p-2 text-blue-400 hover:text-blue-600 rounded border border-gray-200 hover:bg-gray-50 transition-colors">
                      <LinkIcon className="h-4 w-4" />
                    </button>
                  )}
                  {account.status === "active" && (
                    <button
                      onClick={() => handleSyncAccount(account._id)}
                      disabled={syncingAccount === account._id}
                      className="flex-1 p-2 text-blue-400 hover:text-blue-600 rounded border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      {syncingAccount === account._id ? (
                        <ArrowPathIcon className="h-4 w-4 animate-spin" />
                      ) : (
                        <ArrowPathIcon className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {Array.isArray(banking.accounts) && banking.accounts.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Account Summary
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {Array.isArray(banking.accounts) ? banking.accounts.length : 0}
                </div>
                <div className="text-sm text-gray-600">Total Accounts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {Array.isArray(banking.accounts) ? banking.accounts.filter((a) => a.status === "active").length : 0}
                </div>
                <div className="text-sm text-gray-600">Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600 mb-2">
                  {Array.isArray(banking.accounts) ? banking.accounts.filter((a) => a.status === "inactive").length : 0}
                </div>
                <div className="text-sm text-gray-600">Inactive</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 mb-2">
                  {Array.isArray(banking.accounts) ? banking.accounts.filter((a) => a.status === "closed").length : 0}
                </div>
                <div className="text-sm text-gray-600">Closed</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <AddAccountModal
        isOpen={showAddAccount}
        onClose={() => {
          setShowAddAccount(false);
          setForm({
            name: "",
            accountCode: "",
            currency: "INR",
            accountNumber: "",
            bankName: "",
            ifsc: "",
            description: "",
            isPrimary: false,
            accountType: "bank",
            importFile: null,
          });
        }}
        form={form}
        setForm={setForm}
        onSubmit={handleAddAccount}
        submitting={submitting}
        nameInputRef={nameInputRef}
        onImportTransactions={handleImportTransactions}
      />
      <AccountDetailsModal
        isOpen={showAccountDetails}
        onClose={() => setShowAccountDetails(false)}
        selectedAccount={selectedAccount}
        onSyncAccount={handleSyncAccount}
        getAccountTypeIcon={getAccountTypeIcon}
        getAccountTypeColor={getAccountTypeColor}
        getStatusIcon={getStatusIcon}
        getStatusColor={getStatusColor}
      />
      <EditAccountModal
        isOpen={showEditAccount}
        onClose={() => {
          setShowEditAccount(false);
          setSelectedAccount(null);
          setForm({
            name: "",
            accountCode: "",
            currency: "INR",
            accountNumber: "",
            bankName: "",
            ifsc: "",
            description: "",
            isPrimary: false,
            accountType: "bank",
            importFile: null,
          });
        }}
        form={form}
        setForm={setForm}
        onSubmit={handleEditAccount}
        submitting={submitting}
        nameInputRef={nameInputRef}
        account={selectedAccount}
        onImportTransactions={handleImportTransactions}
      />
    </div>
  );
}


