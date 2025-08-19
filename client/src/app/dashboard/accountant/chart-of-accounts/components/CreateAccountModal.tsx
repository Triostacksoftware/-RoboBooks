import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

interface AccountFormData {
  code: string;
  name: string;
  accountHead: string;
  accountGroup: string;
  parent: string;
  openingBalance: number;
  currency: string;
  description: string;
  isActive: boolean;
  isSubAccount: boolean;
  balanceType: string;
}

interface HierarchicalAccount {
  _id: string;
  name: string;
  accountHead: string;
  accountGroup: string;
  isParent?: boolean;
  parentId?: string;
  level?: number;
  children?: HierarchicalAccount[];
}

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (accountData: AccountFormData) => void;
  existingAccounts?: Array<{
    _id: string;
    name: string;
    accountHead: string;
    accountGroup: string;
    isParent?: boolean;
    parentId?: string;
  }>;
  isSubAccount?: boolean;
  parentAccount?: {
    _id: string;
    name: string;
    accountHead: string;
    accountGroup: string;
  } | null;
}

const CreateAccountModal: React.FC<CreateAccountModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingAccounts = [],
  isSubAccount = false,
  parentAccount = null,
}) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState<AccountFormData>({
    code: "",
    name: "",
    accountHead: "",
    accountGroup: "",
    parent: "",
    openingBalance: 0,
    currency: "INR",
    description: "",
    isActive: true,
    isSubAccount: false,
    balanceType: "Debit",
  });

  const [showAccountHeadDropdown, setShowAccountHeadDropdown] = useState(false);
  const [showAccountGroupDropdown, setShowAccountGroupDropdown] =
    useState(false);
  const [showParentDropdown, setShowParentDropdown] = useState(false);

  // Initialize form data when modal opens for sub-account creation
  useEffect(() => {
    console.log("🔍 useEffect triggered:", {
      isOpen,
      isSubAccount,
      parentAccount,
    });

    if (isOpen && isSubAccount && parentAccount) {
      console.log("🔍 Setting up sub-account form with parent:", parentAccount);
      console.log("🔍 Parent account details:", {
        _id: parentAccount._id,
        name: parentAccount.name,
        accountHead: parentAccount.accountHead,
        accountGroup: parentAccount.accountGroup,
      });

      // Generate a random 8-digit account code
      const generateAccountCode = () => {
        const min = 10000000; // 8 digits starting with 1
        const max = 99999999;
        return Math.floor(Math.random() * (max - min + 1)) + min;
      };

      // Determine balance type based on account head
      const getBalanceType = (accountHead: string) => {
        const balanceTypeRules: { [key: string]: string } = {
          asset: "Debit",
          liability: "Credit",
          equity: "Credit",
          income: "Credit",
          expense: "Debit"
        };
        return balanceTypeRules[accountHead.toLowerCase()] || "Debit";
      };

      const newFormData = {
        code: generateAccountCode().toString(),
        name: "",
        accountHead: parentAccount.accountHead.toLowerCase(),
        accountGroup: parentAccount.accountGroup, // Ensure this is set
        parent: parentAccount._id,
        openingBalance: 0,
        currency: "INR",
        description: "",
        isActive: true,
        isSubAccount: true,
        balanceType: getBalanceType(parentAccount.accountHead), // Add balance type
      };

      console.log("🔍 New form data to be set:", newFormData);
      setFormData(newFormData);

      console.log("🔍 Form data set for sub-account:", {
        accountHead: parentAccount.accountHead.toLowerCase(),
        accountGroup: parentAccount.accountGroup,
        parent: parentAccount._id,
        balanceType: getBalanceType(parentAccount.accountHead)
      });
    } else if (isOpen && !isSubAccount) {
      console.log("🔍 Setting up regular account form");
      // Reset form for regular account creation
      setFormData({
        code: "",
        name: "",
        accountHead: "",
        accountGroup: "",
        parent: "",
        openingBalance: 0,
        currency: "INR",
        description: "",
        isActive: true,
        isSubAccount: false,
        balanceType: "Debit", // Add default balance type
      });
    }
  }, [isOpen, isSubAccount, parentAccount]);

  // Account hierarchy structure - CORRECTED
  const accountHeads = [
    { value: "asset", label: "Asset" },
    { value: "liability", label: "Liability" },
    { value: "equity", label: "Equity" },
    { value: "income", label: "Income" },
    { value: "expense", label: "Expense" },
  ];

  const accountGroups = [
    // Asset groups
    { value: "Current Asset", label: "Current Asset", head: "asset" },
    { value: "Non-Current Asset", label: "Non-Current Asset", head: "asset" },
    { value: "Fixed Asset", label: "Fixed Asset", head: "asset" },
    { value: "Investment", label: "Investment", head: "asset" },
    { value: "Bank", label: "Bank", head: "asset" },
    { value: "Cash", label: "Cash", head: "asset" },
    {
      value: "Accounts Receivable",
      label: "Accounts Receivable",
      head: "asset",
    },
    { value: "Inventory", label: "Inventory", head: "asset" },
    { value: "Prepaid Expenses", label: "Prepaid Expenses", head: "asset" },
    {
      value: "Other Current Asset",
      label: "Other Current Asset",
      head: "asset",
    },
    { value: "Other Asset", label: "Other Asset", head: "asset" },

    // Liability groups
    {
      value: "Current Liability",
      label: "Current Liability",
      head: "liability",
    },
    {
      value: "Non-Current Liability",
      label: "Non-Current Liability",
      head: "liability",
    },
    { value: "Provisions", label: "Provisions", head: "liability" },
    { value: "Loans", label: "Loans", head: "liability" },
    { value: "Accounts Payable", label: "Accounts Payable", head: "liability" },
    { value: "Credit Card", label: "Credit Card", head: "liability" },
    {
      value: "Long Term Borrowings",
      label: "Long Term Borrowings",
      head: "liability",
    },
    { value: "Bonds Payable", label: "Bonds Payable", head: "liability" },
    {
      value: "Other Current Liability",
      label: "Other Current Liability",
      head: "liability",
    },
    { value: "Other Liability", label: "Other Liability", head: "liability" },

    // Equity groups
    { value: "Capital Account", label: "Capital Account", head: "equity" },
    { value: "Owner Equity", label: "Owner Equity", head: "equity" },
    { value: "Retained Earnings", label: "Retained Earnings", head: "equity" },
    { value: "Capital", label: "Capital", head: "equity" },
    { value: "Drawings", label: "Drawings", head: "equity" },
    { value: "Partner's Capital", label: "Partner's Capital", head: "equity" },
    {
      value: "Proprietor's Capital",
      label: "Proprietor's Capital",
      head: "equity",
    },

    // Income groups
    { value: "Direct Income", label: "Direct Income", head: "income" },
    { value: "Indirect Income", label: "Indirect Income", head: "income" },
    { value: "Sales", label: "Sales", head: "income" },
    { value: "Service Revenue", label: "Service Revenue", head: "income" },
    { value: "Other Income", label: "Other Income", head: "income" },
    { value: "Interest Income", label: "Interest Income", head: "income" },
    { value: "Commission Income", label: "Commission Income", head: "income" },

    // Expense groups
    { value: "Direct Expense", label: "Direct Expense", head: "expense" },
    { value: "Indirect Expense", label: "Indirect Expense", head: "expense" },
    {
      value: "Cost of Goods Sold",
      label: "Cost of Goods Sold",
      head: "expense",
    },
    { value: "Operating Expense", label: "Operating Expense", head: "expense" },
    { value: "Other Expense", label: "Other Expense", head: "expense" },
    { value: "Salary Expense", label: "Salary Expense", head: "expense" },
    { value: "Rent Expense", label: "Rent Expense", head: "expense" },
    { value: "Utilities Expense", label: "Utilities Expense", head: "expense" },
    {
      value: "Advertising Expense",
      label: "Advertising Expense",
      head: "expense",
    },
    {
      value: "Depreciation Expense",
      label: "Depreciation Expense",
      head: "expense",
    },
    { value: "Interest Expense", label: "Interest Expense", head: "expense" },
    { value: "Tax Expense", label: "Tax Expense", head: "expense" },
  ];

  // Get available groups based on selected head
  const getAvailableGroups = (head: string) => {
    if (!head) return [];
    return accountGroups.filter((group) => group.head === head);
  };

  // Add the parent's account group to the available groups if it's not already there
  const getAvailableGroupsWithParent = (head: string) => {
    console.log("🔍 getAvailableGroupsWithParent called with head:", head);

    const baseGroups = getAvailableGroups(head);
    console.log("🔍 Base groups for head:", head, baseGroups);

    // If this is a sub-account and we have a parent account group, ensure it's included
    if (isSubAccount && parentAccount && parentAccount.accountGroup) {
      console.log(
        "🔍 Checking parent account group:",
        parentAccount.accountGroup
      );
      const parentGroupExists = baseGroups.some(
        (g) => g.value === parentAccount.accountGroup
      );
      console.log("🔍 Parent group exists in base groups:", parentGroupExists);

      if (!parentGroupExists) {
        console.log("🔍 Adding parent account group to available groups");
        // Add the parent's account group to the list
        baseGroups.push({
          value: parentAccount.accountGroup,
          label: parentAccount.accountGroup,
          head: head,
        });
      }
    }

    console.log("🔍 Final available groups:", baseGroups);
    return baseGroups;
  };

  const currencies = ["INR", "USD", "EUR", "GBP"];

  // Filter accounts by selected account group and show account names
  const getFilteredParentAccounts = () => {
    if (!formData.isSubAccount) {
      return [];
    }

    // Show all accounts that match the selected account group
    let filteredParentAccounts = existingAccounts;

    // If account group is selected, filter by it
    if (formData.accountGroup) {
      filteredParentAccounts = filteredParentAccounts.filter(
        (account) => account.accountGroup === formData.accountGroup
      );
    }

    // If account head is selected but no account group, filter by account head
    if (formData.accountHead && !formData.accountGroup) {
      filteredParentAccounts = filteredParentAccounts.filter(
        (account) => account.accountHead === formData.accountHead
      );
    }

    return filteredParentAccounts;
  };

  // Render account option (flat list)
  const renderAccountOption = (account: HierarchicalAccount) => {
    return (
      <div
        key={account._id}
        className="border-b border-gray-100 last:border-b-0"
      >
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => {
              setFormData({ ...formData, parent: account._id });
              setShowParentDropdown(false);
            }}
            className="flex-1 px-3 py-2 text-left hover:bg-gray-100 text-sm"
          >
            <div className="flex-1">
              <div className="font-semibold text-gray-900">{account.name}</div>
              <div className="text-xs text-gray-500 mt-1">
                {account.accountHead?.charAt(0).toUpperCase() +
                  account.accountHead?.slice(1)}{" "}
                • {account.accountGroup}
              </div>
            </div>
            {account.isParent && (
              <span className="text-xs text-blue-600 ml-2 bg-blue-50 px-2 py-1 rounded">
                Parent
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              // Set this account as parent and open a new modal for sub-account
              setFormData({
                ...formData,
                parent: account._id,
                accountHead: account.accountHead,
                accountGroup: account.accountGroup,
              });
              setShowParentDropdown(false);
              // Open a new modal for creating sub-account
              handleCreateSubAccount(account);
            }}
            className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded mr-2"
            title="Add Sub-account"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              ></path>
            </svg>
          </button>
        </div>
      </div>
    );
  };

  // Refs for dropdowns
  const accountHeadDropdownRef = useRef<HTMLDivElement>(null);
  const accountGroupDropdownRef = useRef<HTMLDivElement>(null);
  const parentDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        accountHeadDropdownRef.current &&
        !accountHeadDropdownRef.current.contains(event.target as Node)
      ) {
        setShowAccountHeadDropdown(false);
      }
      if (
        accountGroupDropdownRef.current &&
        !accountGroupDropdownRef.current.contains(event.target as Node)
      ) {
        setShowAccountGroupDropdown(false);
      }
      if (
        parentDropdownRef.current &&
        !parentDropdownRef.current.contains(event.target as Node)
      ) {
        setShowParentDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Reset account group when account head changes
  useEffect(() => {
    if (formData.accountHead) {
      setFormData((prev) => ({ ...prev, accountGroup: "" }));
    }
  }, [formData.accountHead]);

  // Update balance type when account head changes (for regular accounts)
  useEffect(() => {
    if (formData.accountHead && !isSubAccount) {
      const balanceTypeRules: { [key: string]: string } = {
        asset: "Debit",
        liability: "Credit", 
        equity: "Credit",
        income: "Credit",
        expense: "Debit"
      };
      const newBalanceType = balanceTypeRules[formData.accountHead.toLowerCase()] || "Debit";
      setFormData((prev) => ({ ...prev, balanceType: newBalanceType }));
    }
  }, [formData.accountHead, isSubAccount]);

  const handleCreateSubAccount = (parentAccount: HierarchicalAccount) => {
    // Close current modal and show a message to create sub-account
    onClose();

    // Show a toast message with instructions
    showToast(
      `To create a sub-account under "${parentAccount.name}", please create a new account and select "${parentAccount.name}" as the parent.`,
      "info"
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  // Debug logging
  console.log("🔍 CreateAccountModal render:", {
    isSubAccount,
    parentAccount,
    formData,
    formDataAccountGroup: formData.accountGroup,
    formDataAccountHead: formData.accountHead,
    availableGroups: getAvailableGroupsWithParent(formData.accountHead),
    availableGroupsCount: getAvailableGroupsWithParent(formData.accountHead)
      .length,
  });

  // Debug account group display logic
  const accountGroupDisplayValue = (() => {
    if (formData.accountGroup) {
      // First try to find in predefined groups
      const predefinedGroup = getAvailableGroupsWithParent(
        formData.accountHead
      ).find((g) => g.value === formData.accountGroup);
      if (predefinedGroup) {
        console.log("🔍 Found predefined group:", predefinedGroup.label);
        return predefinedGroup.label;
      }
      // If not found in predefined groups, show the actual value
      console.log(
        "🔍 Using actual account group value:",
        formData.accountGroup
      );
      return formData.accountGroup;
    } else {
      console.log("🔍 No account group set, showing placeholder");
      return formData.accountHead
        ? "Select account group"
        : "Select account head first";
    }
  })();

  console.log(
    "🔍 Final account group display value:",
    accountGroupDisplayValue
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {isSubAccount ? "Add Sub-Account" : "Add New Account"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Parent Account Info (for sub-accounts) */}
        {isSubAccount && parentAccount && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              Parent Account
            </h3>
            <p className="text-sm text-blue-700">
              {parentAccount.name} ({parentAccount.accountHead} •{" "}
              {parentAccount.accountGroup})
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Account Code */}
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

            {/* Account Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter account name"
                required
              />
            </div>

            {/* Account Head */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Head *
              </label>
              <div className="relative" ref={accountHeadDropdownRef}>
                <button
                  type="button"
                  onClick={() =>
                    setShowAccountHeadDropdown(!showAccountHeadDropdown)
                  }
                  disabled={isSubAccount && parentAccount}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left ${
                    isSubAccount && parentAccount
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {formData.accountHead
                    ? accountHeads.find((h) => h.value === formData.accountHead)
                        ?.label
                    : "Select account head"}
                </button>

                {showAccountHeadDropdown &&
                  !(isSubAccount && parentAccount) && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {accountHeads.map((head) => (
                        <button
                          key={head.value}
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              accountHead: head.value,
                            });
                            setShowAccountHeadDropdown(false);
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-gray-100 text-sm"
                        >
                          {head.label}
                        </button>
                      ))}
                    </div>
                  )}
              </div>
            </div>

            {/* Account Group */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Group *
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    if (formData.accountHead) {
                      setShowAccountGroupDropdown(!showAccountGroupDropdown);
                    }
                  }}
                  disabled={!formData.accountHead}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left ${
                    !formData.accountHead
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {accountGroupDisplayValue}
                </button>

                {showAccountGroupDropdown && formData.accountHead && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {getAvailableGroupsWithParent(formData.accountHead).map(
                      (group) => (
                        <button
                          key={group.value}
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              accountGroup: group.value,
                            });
                            setShowAccountGroupDropdown(false);
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-gray-100 text-sm"
                        >
                          {group.label}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Sub Account Checkbox - Only show for regular account creation */}
            {!isSubAccount && (
              <div className="col-span-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isSubAccount"
                    checked={formData.isSubAccount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isSubAccount: e.target.checked,
                      })
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="isSubAccount"
                    className="ml-2 text-sm text-gray-700"
                  >
                    This is a sub account
                  </label>
                </div>
              </div>
            )}

            {/* Parent Account - Only show for regular account creation */}
            {!isSubAccount && formData.isSubAccount && (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parent Account *
                </label>
                <div className="relative" ref={parentDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowParentDropdown(!showParentDropdown)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left"
                  >
                    {formData.parent
                      ? (() => {
                          const selectedAccount = existingAccounts.find(
                            (a) => a._id === formData.parent
                          );
                          return selectedAccount ? (
                            <div>
                              <div className="font-medium">
                                {selectedAccount.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {selectedAccount.accountHead
                                  ?.charAt(0)
                                  .toUpperCase() +
                                  selectedAccount.accountHead?.slice(1)}{" "}
                                • {selectedAccount.accountGroup}
                              </div>
                            </div>
                          ) : (
                            "Select parent account"
                          );
                        })()
                      : "Select parent account"}
                  </button>

                  {showParentDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {/* Header showing filter info */}
                      {(formData.accountHead || formData.accountGroup) && (
                        <div className="px-3 py-2 text-xs text-gray-600 bg-gray-50 border-b border-gray-200">
                          {formData.accountGroup
                            ? `Showing accounts for: ${formData.accountGroup}`
                            : `Showing accounts for: ${
                                formData.accountHead.charAt(0).toUpperCase() +
                                formData.accountHead.slice(1)
                              }`}
                        </div>
                      )}

                      {getFilteredParentAccounts().length > 0 ? (
                        getFilteredParentAccounts().map((account) =>
                          renderAccountOption(account)
                        )
                      ) : (
                        <div className="px-3 py-2 text-sm text-gray-500">
                          {formData.accountGroup
                            ? `No accounts found for "${formData.accountGroup}" group. Please create an account in this group first.`
                            : formData.accountHead
                            ? `No accounts found for "${
                                formData.accountHead.charAt(0).toUpperCase() +
                                formData.accountHead.slice(1)
                              }" category. Please create an account in this category first.`
                            : "No accounts available. Please create an account first."}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Currency */}
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
                {currencies.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>

            {/* Opening Balance */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Opening Balance
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  ₹
                </span>
                <input
                  type="number"
                  value={formData.openingBalance}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      openingBalance: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Balance Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Balance Type *
              </label>
              <select
                value={formData.balanceType}
                onChange={(e) =>
                  setFormData({ ...formData, balanceType: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Debit">Debit</option>
                <option value="Credit">Credit</option>
              </select>
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
              Account is active
            </label>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter description of account"
              rows={3}
            />
          </div>

          {/* Buttons */}
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
              className="px-4 py-2 text-sm font-medium text-white bg-yellow-500 rounded-lg hover:bg-yellow-600"
            >
              {isSubAccount ? "Create Sub-Account" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAccountModal;
