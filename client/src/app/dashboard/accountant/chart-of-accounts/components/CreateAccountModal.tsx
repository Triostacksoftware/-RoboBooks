import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

interface AccountFormData {
  code: string;
  name: string;
  category: string;
  subtype: string;
  parent: string;
  opening_balance: number;
  currency: string;
  description: string;
  is_active: boolean;
  is_sub_account: boolean;
}

interface HierarchicalAccount {
  _id: string;
  name: string;
  category: string;
  subtype: string;
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
    category: string;
    subtype: string;
    isParent?: boolean;
    parentId?: string;
  }>;
}

const CreateAccountModal: React.FC<CreateAccountModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingAccounts = [],
}) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState<AccountFormData>({
    code: "",
    name: "",
    category: "",
    subtype: "",
    parent: "",
    opening_balance: 0,
    currency: "INR",
    description: "",
    is_active: true,
    is_sub_account: false,
  });

  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSubtypeDropdown, setShowSubtypeDropdown] = useState(false);
  const [showParentDropdown, setShowParentDropdown] = useState(false);

  // Account hierarchy structure - CORRECTED
  const accountHeads = [
    { value: "asset", label: "Asset" },
    { value: "income", label: "Income" },
    { value: "expense", label: "Expense" },
    { value: "liability", label: "Liability" },
    { value: "equity", label: "Equity" },
  ];

  const accountGroups = [
    { value: "current_asset", label: "Current Asset", head: "asset" },
    { value: "fixed_asset", label: "Fixed Asset", head: "asset" },
    { value: "investment", label: "Investment", head: "asset" },
    {
      value: "current_liability",
      label: "Current Liability",
      head: "liability",
    },
    {
      value: "non_current_liability",
      label: "Non-Current Liability",
      head: "liability",
    },
    { value: "provisions", label: "Provisions", head: "liability" },
    { value: "loans", label: "Loans", head: "liability" },
    { value: "capital_account", label: "Capital Account", head: "equity" },
    { value: "direct_income", label: "Direct Income", head: "income" },
    { value: "indirect_income", label: "Indirect Income", head: "income" },
    { value: "direct_expense", label: "Direct Expense", head: "expense" },
    { value: "indirect_expense", label: "Indirect Expense", head: "expense" },
  ];

  // Get available groups based on selected head
  const getAvailableGroups = (head: string) => {
    if (!head) return [];
    return accountGroups.filter((group) => group.head === head);
  };

  const currencies = ["INR", "USD", "EUR", "GBP"];

  // Filter accounts by selected account group (subtype) and show account names
  const getFilteredParentAccounts = () => {
    console.log("🔍 getFilteredParentAccounts called with:", {
      is_sub_account: formData.is_sub_account,
      category: formData.category,
      subtype: formData.subtype,
      existingAccountsCount: existingAccounts.length,
    });

    console.log(
      "🔍 All existing accounts:",
      existingAccounts.map((acc) => ({
        name: acc.name,
        category: acc.category,
        subtype: acc.subtype,
        isParent: acc.isParent,
        parentId: acc.parentId,
      }))
    );

    // Debug: Check for current_asset accounts specifically
    const currentAssetAccounts = existingAccounts.filter(
      (acc) => acc.subtype === "current_asset"
    );
    console.log(
      "🎯 Current Asset accounts in existingAccounts:",
      currentAssetAccounts.map((acc) => ({
        name: acc.name,
        subtype: acc.subtype,
        isParent: acc.isParent,
        parentId: acc.parentId,
      }))
    );

    if (!formData.is_sub_account) {
      return [];
    }

    // Show all accounts that match the selected account group (subtype), not just parent accounts
    let filteredParentAccounts = existingAccounts;
    console.log(
      "🔍 Starting with all accounts:",
      filteredParentAccounts.length
    );

    // If account group (subtype) is selected, filter by it
    if (formData.subtype) {
      console.log("🔍 Filtering by subtype:", formData.subtype);
      console.log(
        "🔍 Available accounts before filtering:",
        filteredParentAccounts.map((acc) => ({
          name: acc.name,
          subtype: acc.subtype,
          isParent: acc.isParent,
        }))
      );

      // Debug: Check for direct_income accounts specifically
      const directIncomeAccounts = filteredParentAccounts.filter(
        (account) => account.subtype === "direct_income"
      );
      console.log(
        "🎯 Direct income accounts before filtering:",
        directIncomeAccounts
      );

      filteredParentAccounts = filteredParentAccounts.filter(
        (account) => account.subtype === formData.subtype
      );
      console.log("🔍 Filtered by account group:", formData.subtype);
      console.log(
        "🔍 Filtered accounts:",
        filteredParentAccounts.map((acc) => ({
          name: acc.name,
          subtype: acc.subtype,
          isParent: acc.isParent,
          parentId: acc.parentId,
        }))
      );
    }

    // If category is selected but no subtype, filter by category
    if (formData.category && !formData.subtype) {
      filteredParentAccounts = filteredParentAccounts.filter(
        (account) => account.category === formData.category
      );
      console.log("🔍 Filtered by category:", formData.category);
    }

    console.log(
      "🔍 Filtered accounts available:",
      filteredParentAccounts.length
    );
    console.log(
      "🔍 Filtered account names:",
      filteredParentAccounts.map((acc) => acc.name)
    );

    // Build hierarchical structure for filtered accounts
    const buildHierarchy = (
      accounts: HierarchicalAccount[],
      parentId: string | null = null,
      level: number = 0
    ): HierarchicalAccount[] => {
      return accounts
        .filter((account) => account.parentId === parentId)
        .map((account) => ({
          ...account,
          level,
          children: buildHierarchy(accounts, account._id, level + 1),
        }));
    };

    // For parent account selection, show all accounts in a flat list
    // Don't use hierarchy - just return all filtered accounts
    console.log(
      "🔍 Final filtered accounts (flat list):",
      filteredParentAccounts.length
    );
    console.log(
      "🔍 Final accounts details:",
      filteredParentAccounts.map((acc) => ({
        name: acc.name,
        subtype: acc.subtype,
        isParent: acc.isParent,
        parentId: acc.parentId,
      }))
    );
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
                {account.category?.charAt(0).toUpperCase() +
                  account.category?.slice(1)}{" "}
                •{" "}
                {account.subtype
                  ?.replace(/_/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
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
                category: account.category,
                subtype: account.subtype,
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
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const subtypeDropdownRef = useRef<HTMLDivElement>(null);
  const parentDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setShowCategoryDropdown(false);
      }
      if (
        subtypeDropdownRef.current &&
        !subtypeDropdownRef.current.contains(event.target as Node)
      ) {
        setShowSubtypeDropdown(false);
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

  // Reset subtype when category changes
  useEffect(() => {
    if (formData.category) {
      setFormData((prev) => ({ ...prev, subtype: "" }));
    }
  }, [formData.category]);

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Add New Account</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

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
              <div className="relative" ref={categoryDropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left"
                >
                  {formData.category
                    ? accountHeads.find((h) => h.value === formData.category)
                        ?.label
                    : "Select account head"}
                </button>

                {showCategoryDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {accountHeads.map((head) => (
                      <button
                        key={head.value}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, category: head.value });
                          setShowCategoryDropdown(false);
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Group *
              </label>
              <div className="relative" ref={subtypeDropdownRef}>
                <button
                  type="button"
                  onClick={() => {
                    if (formData.category) {
                      setShowSubtypeDropdown(!showSubtypeDropdown);
                    }
                  }}
                  disabled={!formData.category}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left ${
                    !formData.category
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {formData.subtype
                    ? getAvailableGroups(formData.category).find(
                        (g) => g.value === formData.subtype
                      )?.label
                    : formData.category
                    ? "Select account group"
                    : "Select account head first"}
                </button>

                {showSubtypeDropdown && formData.category && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {getAvailableGroups(formData.category).map((group) => (
                      <button
                        key={group.value}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, subtype: group.value });
                          setShowSubtypeDropdown(false);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-gray-100 text-sm"
                      >
                        {group.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sub Account Checkbox */}
            <div className="col-span-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isSubAccount"
                  checked={formData.is_sub_account}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      is_sub_account: e.target.checked,
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

            {/* Parent Account */}
            {formData.is_sub_account && (
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
                                {selectedAccount.category
                                  ?.charAt(0)
                                  .toUpperCase() +
                                  selectedAccount.category?.slice(1)}{" "}
                                •{" "}
                                {selectedAccount.subtype
                                  ?.replace(/_/g, " ")
                                  .replace(/\b\w/g, (l) => l.toUpperCase())}
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
                      {(formData.category || formData.subtype) && (
                        <div className="px-3 py-2 text-xs text-gray-600 bg-gray-50 border-b border-gray-200">
                          {formData.subtype
                            ? `Showing accounts for: ${formData.subtype
                                .replace(/_/g, " ")
                                .replace(/\b\w/g, (l) => l.toUpperCase())}`
                            : `Showing accounts for: ${
                                formData.category.charAt(0).toUpperCase() +
                                formData.category.slice(1)
                              }`}
                        </div>
                      )}

                      {getFilteredParentAccounts().length > 0 ? (
                        getFilteredParentAccounts().map((account) =>
                          renderAccountOption(account)
                        )
                      ) : (
                        <div className="px-3 py-2 text-sm text-gray-500">
                          {formData.subtype
                            ? `No accounts found for "${formData.subtype
                                .replace(/_/g, " ")
                                .replace(/\b\w/g, (l) =>
                                  l.toUpperCase()
                                )}" group. Please create an account in this group first.`
                            : formData.category
                            ? `No accounts found for "${
                                formData.category.charAt(0).toUpperCase() +
                                formData.category.slice(1)
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
                  value={formData.opening_balance}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      opening_balance: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.is_active}
              onChange={(e) =>
                setFormData({ ...formData, is_active: e.target.checked })
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
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAccountModal;
