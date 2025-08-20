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
    parent?: string;
  }>;
  isSubAccount?: boolean;
  parentAccount?: {
    _id: string;
    name: string;
    accountHead: string;
    accountGroup: string;
  } | null;
  editingAccount?: {
    _id: string;
    name: string;
    accountHead: string;
    accountGroup: string;
    code?: string;
    description?: string;
    isActive: boolean;
    balanceType: string;
    openingBalance?: number;
    currency?: string;
    parent?: string;
  } | null;
}

const CreateAccountModal: React.FC<CreateAccountModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingAccounts = [],
  isSubAccount = false,
  parentAccount = null,
  editingAccount = null,
}) => {
  const { showToast } = useToast();
  const parentDropdownRef = useRef<HTMLDivElement>(null);
  const accountHeadDropdownRef = useRef<HTMLDivElement>(null);
  const accountGroupDropdownRef = useRef<HTMLDivElement>(null);
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

  // Initialize form data when modal opens for sub-account creation or editing
  useEffect(() => {
    console.log("🔍 useEffect triggered:", {
      isOpen,
      isSubAccount,
      parentAccount,
      editingAccount,
    });

    if (isOpen) {
      if (editingAccount) {
        // Editing mode - populate form with existing account data
        console.log("🔍 Setting up edit form with account:", editingAccount);
        setFormData({
          code: editingAccount.code || "",
          name: editingAccount.name,
          accountHead: editingAccount.accountHead,
          accountGroup: editingAccount.accountGroup,
          parent: editingAccount.parent || "",
          openingBalance: editingAccount.openingBalance || 0,
          currency: editingAccount.currency || "INR",
          description: editingAccount.description || "",
          isActive: editingAccount.isActive,
          isSubAccount: !!editingAccount.parent,
          balanceType: editingAccount.balanceType || "Debit",
        });
      } else if (isSubAccount && parentAccount) {
        // Sub-account creation mode
        console.log(
          "🔍 Setting up sub-account form with parent:",
          parentAccount
        );
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
            expense: "Debit",
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
          balanceType: getBalanceType(parentAccount.accountHead),
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
    }
  }, [isOpen, isSubAccount, parentAccount, editingAccount]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        parentDropdownRef.current &&
        !parentDropdownRef.current.contains(event.target as Node)
      ) {
        setShowParentDropdown(false);
      }
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
    };

    if (
      showParentDropdown ||
      showAccountHeadDropdown ||
      showAccountGroupDropdown
    ) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showParentDropdown, showAccountHeadDropdown, showAccountGroupDropdown]);

  // Account hierarchy structure - CORRECTED
  const accountHeads = [
    { value: "asset", label: "Asset" },
    { value: "liability", label: "Liability" },
    { value: "equity", label: "Equity" },
    { value: "income", label: "Income" },
    { value: "expense", label: "Expense" },
  ];

  const accountGroups = [
    // Asset groups - RESTRICTED
    { value: "Current Asset", label: "Current Asset", head: "asset" },
    { value: "Non-Current Asset", label: "Non-Current Asset", head: "asset" },
    { value: "Fixed Asset", label: "Fixed Asset", head: "asset" },
    { value: "Investment", label: "Investment", head: "asset" },

    // Liability groups - RESTRICTED
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

    // Equity groups - RESTRICTED
    { value: "Capital Account", label: "Capital Account", head: "equity" },

    // Income groups - RESTRICTED
    { value: "Direct Income", label: "Direct Income", head: "income" },
    { value: "Indirect Income", label: "Indirect Income", head: "income" },

    // Expense groups - RESTRICTED
    { value: "Direct Expense", label: "Direct Expense", head: "expense" },
    { value: "Indirect Expense", label: "Indirect Expense", head: "expense" },
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

  // Get all accounts with hierarchy information
  const getHierarchicalAccounts = () => {
    if (!formData.isSubAccount) {
      return [];
    }

    // If we have existingAccounts, use them (for backward compatibility)
    if (existingAccounts && existingAccounts.length > 0) {
      // Create a map of accounts by ID for quick lookup
      const accountMap = new Map();
      existingAccounts.forEach((account) => {
        accountMap.set(account._id, { ...account, children: [] });
      });

      // Build hierarchy
      const rootAccounts = [];
      existingAccounts.forEach((account) => {
        const parentId = account.parentId || account.parent;
        if (parentId) {
          const parent = accountMap.get(parentId);
          if (parent) {
            parent.children.push(accountMap.get(account._id));
          }
        } else {
          rootAccounts.push(accountMap.get(account._id));
        }
      });

      // Flatten hierarchy with indentation levels
      const flattenHierarchy = (accounts, level = 0, result = []) => {
        accounts.forEach((account) => {
          result.push({ ...account, level });
          if (account.children && account.children.length > 0) {
            flattenHierarchy(account.children, level + 1, result);
          }
        });
        return result;
      };

      return flattenHierarchy(rootAccounts);
    }

    // If no existingAccounts, return empty array
    return [];
  };

  // Render account option with simple decimal mark indentation
  const renderAccountOption = (account: any) => {
    // Simple decimal marks based on level
    const getIndentationMarks = (level: number) => {
      if (level === 0) return "";
      return "• ".repeat(level) + " ";
    };

    return (
      <div
        key={account._id}
        className="border-b border-gray-100 last:border-b-0"
      >
        <button
          type="button"
          onClick={() => {
            setFormData({ ...formData, parent: account._id });
            setShowParentDropdown(false);
          }}
          className="w-full px-3 py-2 text-left hover:bg-blue-50 text-sm transition-all duration-150"
        >
          {/* Account name with simple decimal marks */}
          <div
            className={`font-medium ${
              account.level === 0 ? "text-gray-900" : "text-gray-700"
            } ${formData.parent === account._id ? "text-blue-600" : ""}`}
          >
            <span className="text-blue-400 mr-1">
              {getIndentationMarks(account.level)}
            </span>
            {account.name}
            {formData.parent === account._id && (
              <span className="ml-2 text-blue-500">✓</span>
            )}
          </div>
        </button>
      </div>
    );
  };

  // Reset account group when account head changes (for regular accounts)
  useEffect(() => {
    if (formData.accountHead && !isSubAccount) {
      setFormData((prev) => ({ ...prev, accountGroup: "" }));
    }
  }, [formData.accountHead, isSubAccount]);

  // Update balance type when account head changes (for regular accounts)
  useEffect(() => {
    if (formData.accountHead && !isSubAccount) {
      const balanceTypeRules: { [key: string]: string } = {
        asset: "Debit",
        liability: "Credit",
        equity: "Credit",
        income: "Credit",
        expense: "Debit",
      };
      const newBalanceType =
        balanceTypeRules[formData.accountHead.toLowerCase()] || "Debit";
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
            {editingAccount
              ? "Edit Account"
              : isSubAccount
              ? "Add Sub-Account"
              : "Add New Account"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Parent Account Info removed - now shown as form field */}

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
              {editingAccount ? (
                // Read-only input for edit mode
                <input
                  type="text"
                  value={
                    accountHeads.find((h) => h.value === formData.accountHead)
                      ?.label || formData.accountHead
                  }
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                />
              ) : (
                // Dropdown for create mode
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
                      ? accountHeads.find(
                          (h) => h.value === formData.accountHead
                        )?.label
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
              )}
            </div>

            {/* Account Group - Only show for new top-level accounts or in edit mode */}
            {(!isSubAccount || editingAccount) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Group *
                </label>
                {editingAccount ? (
                  // Read-only input for edit mode
                  <input
                    type="text"
                    value={
                      accountGroups
                        .filter((g) => g.head === formData.accountHead)
                        .find((g) => g.value === formData.accountGroup)
                        ?.label || formData.accountGroup
                    }
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                ) : (
                  // Dropdown for create mode
                  <div className="relative" ref={accountGroupDropdownRef}>
                    <button
                      type="button"
                      onClick={() =>
                        setShowAccountGroupDropdown(!showAccountGroupDropdown)
                      }
                      disabled={!formData.accountHead}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left ${
                        !formData.accountHead
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      {formData.accountGroup
                        ? accountGroups
                            .filter((g) => g.head === formData.accountHead)
                            .find((g) => g.value === formData.accountGroup)
                            ?.label
                        : formData.accountHead
                        ? "Select account group"
                        : "Select account head first"}
                    </button>

                    {showAccountGroupDropdown && formData.accountHead && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {accountGroups
                          .filter(
                            (group) => group.head === formData.accountHead
                          )
                          .map((group) => (
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
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Parent Account - Show for sub-accounts */}
            {isSubAccount && parentAccount && (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parent Account *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={parentAccount.name}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                    placeholder="Parent account name"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Parent account cannot be changed
                  </div>
                </div>
              </div>
            )}

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
                    disabled={editingAccount}
                    className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                      editingAccount ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                  />
                  <label
                    htmlFor="isSubAccount"
                    className={`ml-2 text-sm ${
                      editingAccount
                        ? "text-gray-500 cursor-not-allowed"
                        : "text-gray-700"
                    }`}
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
                            <div className="font-medium">
                              {selectedAccount.name}
                            </div>
                          ) : (
                            "Select parent account"
                          );
                        })()
                      : "Select parent account"}
                  </button>

                  {showParentDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                      {getHierarchicalAccounts().length > 0 ? (
                        getHierarchicalAccounts().map((account) =>
                          renderAccountOption(account)
                        )
                      ) : (
                        <div className="px-3 py-2 text-sm text-gray-500">
                          No accounts available. Please create an account first.
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
              {editingAccount ? (
                // Read-only input for edit mode
                <input
                  type="text"
                  value={formData.balanceType}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                />
              ) : (
                // Dropdown for create mode
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
              )}
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
              {editingAccount
                ? "Update Account"
                : isSubAccount
                ? "Create Sub-Account"
                : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAccountModal;
