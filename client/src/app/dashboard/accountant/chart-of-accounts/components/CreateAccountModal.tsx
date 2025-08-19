import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";

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
}

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (accountData: AccountFormData) => void;
}

const CreateAccountModal: React.FC<CreateAccountModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
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
  });

  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSubtypeDropdown, setShowSubtypeDropdown] = useState(false);

  const accountCategories = [
    "asset",
    "liability",
    "equity",
    "income",
    "expense",
  ];

  const accountSubtypes = [
    "bank",
    "cash",
    "accounts_receivable",
    "fixed_asset",
    "inventory",
    "other_asset",
    "current_asset",
    "investment",
    "loans",
    "advances",
    "prepaid_expenses",
    "accounts_payable",
    "credit_card",
    "current_liability",
    "long_term_liability",
    "non_current_liability",
    "provisions",
    "loans_payable",
    "bonds_payable",
    "owner_equity",
    "retained_earnings",
    "capital",
    "drawings",
    "sales",
    "service_revenue",
    "other_income",
    "direct_income",
    "indirect_income",
    "interest_income",
    "commission_income",
    "cost_of_goods_sold",
    "operating_expense",
    "other_expense",
    "direct_expense",
    "indirect_expense",
    "salary_expense",
    "rent_expense",
    "utilities_expense",
    "advertising_expense",
    "depreciation_expense",
    "interest_expense",
    "tax_expense",
  ];

  const currencies = ["INR", "USD", "EUR", "GBP"];

  // Refs for dropdowns
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const subtypeDropdownRef = useRef<HTMLDivElement>(null);

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
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <div className="relative" ref={categoryDropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left"
                >
                  {formData.category || "Select category"}
                </button>

                {showCategoryDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {accountCategories.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, category });
                          setShowCategoryDropdown(false);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-gray-100 text-sm capitalize"
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Subtype */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subtype
              </label>
              <div className="relative" ref={subtypeDropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowSubtypeDropdown(!showSubtypeDropdown)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left"
                >
                  {formData.subtype || "Select subtype"}
                </button>

                {showSubtypeDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {accountSubtypes.map((subtype) => (
                      <button
                        key={subtype}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, subtype });
                          setShowSubtypeDropdown(false);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-gray-100 text-sm"
                      >
                        {subtype
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Parent Account */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parent Account
              </label>
              <input
                type="text"
                value={formData.parent}
                onChange={(e) =>
                  setFormData({ ...formData, parent: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Parent account ID (optional)"
              />
            </div>

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
