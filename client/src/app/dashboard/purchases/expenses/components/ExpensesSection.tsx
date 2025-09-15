"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  PlusIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  EllipsisHorizontalIcon,
  MagnifyingGlassIcon,
  DocumentArrowUpIcon,
  PlayIcon,
  CheckIcon,
  XMarkIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ReceiptRefundIcon,
  ArrowPathIcon,
  Cog6ToothIcon,
  DocumentIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  StarIcon,
  ArrowsUpDownIcon,
  ArrowDownTrayIcon as ArrowDownTrayIconSolid,
  ArrowUpTrayIcon as ArrowUpTrayIconSolid,
  ClipboardDocumentListIcon,
  ArrowPathIcon as RefreshIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowDownTrayIcon as DownloadIcon,
} from "@heroicons/react/24/outline";
import { expenseService, Expense } from "../../../../../services/expenseService";
import { formatCurrency } from "@/utils/currency";
import ImportExpensesModal from "./ImportExpensesModal";
import ExpenseFilters from "./ExpenseFilters";
import ExpenseList from "./ExpenseList";

interface ExpenseStats {
  totalExpenses: number;
  totalAmount: number;
  unbilledAmount: number;
  billableAmount: number;
  nonBillableAmount: number;
}

interface ExpensesSectionProps {
  expenses: Expense[];
  selectedExpenseId?: string;
  onExpenseSelect: (expense: Expense) => void;
  isCollapsed: boolean;
  selectedExpenseIds: string[];
  onBulkSelectionChange: (selectedIds: string[]) => void;
  onBulkImport: () => void;
  onBulkExport: () => void;
  onBulkDelete: () => void;
  onClearSelection: () => void;
}

export default function ExpensesSection({ 
  expenses, 
  selectedExpenseId, 
  onExpenseSelect, 
  isCollapsed,
  selectedExpenseIds,
  onBulkSelectionChange,
  onBulkImport,
  onBulkExport,
  onBulkDelete,
  onClearSelection
}: ExpensesSectionProps) {
  const router = useRouter();
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [showImportModal, setShowImportModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [showMainDropdown, setShowMainDropdown] = useState(false);
  const [sortBy, setSortBy] = useState('created_time');
  const [sortOrder, setSortOrder] = useState('desc');
  const [dropdownPosition, setDropdownPosition] = useState<'left' | 'right'>('right');
  const moreMenuRef = useRef<HTMLButtonElement>(null);
  const mainDropdownRef = useRef<HTMLButtonElement>(null);
  const filterRef = useRef<HTMLButtonElement>(null);
  const [stats, setStats] = useState<ExpenseStats>({
    totalExpenses: 0,
    totalAmount: 0,
    unbilledAmount: 0,
    billableAmount: 0,
    nonBillableAmount: 0,
  });

  // Main dropdown options (All Expenses dropdown)
  const mainDropdownOptions = [
    { value: "all", label: "All Expenses", icon: StarIcon },
    { value: "unbilled", label: "Unbilled", icon: DocumentTextIcon },
    { value: "invoiced", label: "Invoiced", icon: CheckIcon },
    { value: "reimbursed", label: "Reimbursed", icon: ReceiptRefundIcon },
    { value: "billable", label: "Billable", icon: CurrencyDollarIcon },
    { value: "non-billable", label: "Non-Billable", icon: XMarkIcon },
    { value: "with-receipts", label: "With Receipts", icon: DocumentIcon },
    { value: "without-receipts", label: "Without Receipts", icon: XMarkIcon },
  ];

  // Filter options matching Zoho Books
  const filterOptions = [
    { value: "All", label: "All", icon: StarIcon },
    { value: "Unbilled", label: "Unbilled", icon: DocumentTextIcon },
    { value: "Invoiced", label: "Invoiced", icon: CheckIcon },
    { value: "Reimbursed", label: "Reimbursed", icon: ReceiptRefundIcon },
    { value: "Billable", label: "Billable", icon: CurrencyDollarIcon },
    { value: "Non-Billable", label: "Non-Billable", icon: XMarkIcon },
    { value: "With Receipts", label: "With Receipts", icon: DocumentIcon },
    { value: "Without Receipts", label: "Without Receipts", icon: XMarkIcon },
    { value: "custom", label: "New Custom View", icon: PlusIcon, isCustom: true },
  ];

  // Column options for sorting
  const columnOptions = [
    { value: "date", label: "Date" },
    { value: "expense_account", label: "Expense Account" },
    { value: "vendor_name", label: "Vendor Name" },
    { value: "paid_through", label: "Paid Through" },
    { value: "customer_name", label: "Customer Name" },
    { value: "amount", label: "Amount" },
  ];

  // More menu options - Matching Zoho Books exactly
  const moreMenuOptions = [
    {
      id: "all",
      label: "All",
      icon: StarIcon,
      action: () => {
        setSelectedFilter("All");
        setShowMoreMenu(false);
      }
    },
    {
      id: "sort",
      label: "Sort by",
      icon: ArrowsUpDownIcon,
      hasSubmenu: true,
      submenu: [
        { label: "Date", value: "date" },
        { label: "Expense Account", value: "expense_account" },
        { label: "Vendor Name", value: "vendor_name" },
        { label: "Paid Through", value: "paid_through" },
        { label: "Customer Name", value: "customer_name" },
        { label: "Amount", value: "amount" },
        { label: "Created Time", value: "created_time" },
      ]
    },
    {
      id: "import",
      label: "Import Expenses",
      icon: ArrowDownTrayIconSolid,
      action: () => window.location.href = '/dashboard/purchases/expenses/import'
    },
    {
      id: "export",
      label: "Export",
      icon: ArrowUpTrayIconSolid,
      hasSubmenu: true,
      submenu: [
        { label: "Export Expenses", value: "export_all" },
        { label: "Export Current View", value: "export_current" },
      ]
    },
    {
      id: "preferences",
      label: "Preferences",
      icon: Cog6ToothIcon,
      action: () => console.log("Open preferences")
    },
    {
      id: "custom_fields",
      label: "Manage Custom Fields",
      icon: ClipboardDocumentListIcon,
      action: () => console.log("Manage custom fields")
    },
    {
      id: "refresh",
      label: "Refresh List",
      icon: RefreshIcon,
      action: () => window.location.reload()
    },
    {
      id: "reset_columns",
      label: "Reset Column Width",
      icon: ArrowPathIcon,
      action: () => console.log("Reset column width")
    },
  ];

  // Calculate stats when expenses change
  const calculateStats = (expenseList: Expense[]) => {
    const totalAmount = expenseList.reduce((sum, expense) => sum + expense.amount, 0);
    const unbilledAmount = expenseList
        .filter(e => e.status === "unbilled")
        .reduce((sum, expense) => sum + expense.amount, 0);
    const billableAmount = expenseList
        .filter(e => e.billable)
        .reduce((sum, expense) => sum + expense.amount, 0);
    const nonBillableAmount = expenseList
        .filter(e => !e.billable)
        .reduce((sum, expense) => sum + expense.amount, 0);

      setStats({
      totalExpenses: expenseList.length,
        totalAmount,
        unbilledAmount,
        billableAmount,
        nonBillableAmount,
      });
  };

  // Apply filters
  const applyFilters = () => {
    let filtered = [...expenses];


    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(expense =>
        (expense.description && expense.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (expense.vendor && expense.vendor.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (expense.account && expense.account.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (expense.reference && expense.reference.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (expense.category && expense.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Status filter
    if (selectedFilter !== "All") {
      const originalLength = filtered.length;
      switch (selectedFilter) {
        case "Unbilled":
          filtered = filtered.filter(e => {
            const status = e.status?.toString().toLowerCase();
            return status === "unbilled" || status === "unbilled";
          });
          break;
        case "Invoiced":
          filtered = filtered.filter(e => {
            const status = e.status?.toString().toLowerCase();
            return status === "invoiced" || status === "invoiced";
          });
          break;
        case "Reimbursed":
          filtered = filtered.filter(e => {
            const status = e.status?.toString().toLowerCase();
            return status === "reimbursed" || status === "reimbursed";
          });
          break;
        case "Billable":
          filtered = filtered.filter(e => e.billable === true || e.billable === "true");
          break;
        case "Non-Billable":
          filtered = filtered.filter(e => e.billable === false || e.billable === "false");
          break;
        case "With Receipts":
          filtered = filtered.filter(e => e.hasReceipt === true || e.hasReceipt === "true");
          break;
        case "Without Receipts":
          filtered = filtered.filter(e => e.hasReceipt === false || e.hasReceipt === "false");
          break;
      }
    }

    setFilteredExpenses(filtered);
  };

  useEffect(() => {
    calculateStats(expenses);
    applyFilters();
  }, [expenses]);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, selectedFilter]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-menu') && !target.closest('.submenu') && !target.closest('[data-filter-dropdown]') && !filterRef.current?.contains(target)) {
        setShowMoreMenu(false);
        setShowSortMenu(false);
        setShowExportMenu(false);
        setShowColumnMenu(false);
        setShowMainDropdown(false);
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  const handleImportExpenses = async (file: File) => {
    try {
      const importedExpenses = await expenseService.importExpenses(file);
      // Note: This would need to be handled by the parent component
      // For now, just close the modal
      setShowImportModal(false);
    } catch (err) {
      console.error("Error importing expenses:", err);
    }
  };

  const handleExportExpenses = async () => {
    try {
      await expenseService.exportExpenses(filteredExpenses);
    } catch (err) {
      console.error("Error exporting expenses:", err);
    }
  };

  const handleExportCurrentView = async () => {
    try {
      await expenseService.exportExpenses(filteredExpenses);
    } catch (err) {
      console.error("Error exporting current view:", err);
    }
  };

  const handleSortChange = (sortField: string) => {
    setSortBy(sortField);
    setShowSortMenu(false);
    // Apply sorting logic here
  };

  const handleExportOption = (option: string) => {
    setShowExportMenu(false);
    if (option === 'export_all') {
      handleExportExpenses();
    } else if (option === 'export_current') {
      handleExportCurrentView();
    }
  };

  const handleMoreMenuAction = (option: any) => {
    if (option.action) {
      option.action();
    }
    setShowMoreMenu(false);
  };

  // Function to calculate dropdown position
  const calculateDropdownPosition = (buttonRef: React.RefObject<HTMLButtonElement>) => {
    if (!buttonRef.current) return 'right';
    
    const buttonRect = buttonRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const dropdownWidth = 224; // w-56 = 14rem = 224px
    
    // If button is in the right half of screen, open left
    if (buttonRect.left + dropdownWidth > viewportWidth) {
      return 'left';
    }
    
    // If button is in the left half of screen, open right
    return 'right';
  };

  const selectedFilterOption = filterOptions.find(opt => opt.value === selectedFilter);

  return (
    <div className="space-y-0">
      {/* Header - Matching Vendors Section Design */}
      <div className="bg-white rounded-t-lg border border-b-0">
        {/* Main Header */}
        <div className="px-6 py-4 border-b border-gray-200">
      <div className="flex items-center justify-between">
            {/* Left side - Title with dropdown */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  ref={mainDropdownRef}
                  onClick={() => {
                    const position = calculateDropdownPosition(mainDropdownRef);
                    setDropdownPosition(position);
                    setShowMainDropdown(!showMainDropdown);
                  }}
                  className="flex items-center space-x-2 text-lg font-semibold text-gray-900 hover:text-gray-700"
                >
                  <span>All Expenses</span>
                  <ChevronDownIcon className="h-5 w-5" />
                </button>
                {showMainDropdown && (
                  <div className={`absolute top-full mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-10 ${
                    dropdownPosition === 'left' ? 'right-0' : 'left-0'
                  }`}>
                    {mainDropdownOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSelectedFilter(option.value === "all" ? "All" : option.label);
                            setShowMainDropdown(false);
                          }}
                          className={`w-full flex items-center space-x-3 px-4 py-2 text-left text-sm hover:bg-gray-100 ${
                            (option.value === "all" && selectedFilter === "All") || selectedFilter === option.label ? "bg-blue-50 text-blue-700" : "text-gray-700"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{option.label}</span>
                          {((option.value === "all" && selectedFilter === "All") || selectedFilter === option.label) && (
                            <CheckIcon className="h-4 w-4 ml-auto" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right side - Action buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <ArrowPathIcon className="h-4 w-4" />
                <span>Refresh</span>
              </button>
              <button
                onClick={() => window.location.href = '/dashboard/purchases/expenses/record'}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                <PlusIcon className="h-4 w-4" />
                <span>New Expense</span>
              </button>
              <div className="relative">
                <button
                  ref={moreMenuRef}
                  onClick={() => {
                    const position = calculateDropdownPosition(moreMenuRef);
                    setDropdownPosition(position);
                    setShowMoreMenu(!showMoreMenu);
                  }}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                  title="More Options"
                >
                  <EllipsisHorizontalIcon className="h-5 w-5" />
                </button>
                {showMoreMenu && (
                  <div className={`absolute top-full mt-1 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-10 dropdown-menu ${
                    dropdownPosition === 'left' ? 'right-0' : 'left-0'
                  }`}>
                    <div className="py-1">
                      {moreMenuOptions.map((option) => (
                        <div key={option.id}>
                          {option.hasSubmenu ? (
                            <div className="relative">
                      <button
                        onClick={() => {
                                  if (option.id === 'sort') {
                                    setShowSortMenu(!showSortMenu);
                                    setShowExportMenu(false); // Close export menu when opening sort
                                  }
                                  if (option.id === 'export') {
                                    setShowExportMenu(!showExportMenu);
                                    setShowSortMenu(false); // Close sort menu when opening export
                                  }
                                }}
                                className="w-full flex items-center space-x-3 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <option.icon className="h-4 w-4" />
                                <span>{option.label}</span>
                                <ChevronRightIcon className="h-4 w-4 ml-auto" />
                              </button>
                              {option.id === 'sort' && showSortMenu && (
                                <div className={`absolute top-0 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-30 submenu ${
                                  dropdownPosition === 'left' ? 'right-full mr-1' : 'left-full ml-1'
                                }`}>
                                  <div className="py-1">
                                    {option.submenu?.map((subOption) => (
                                      <button
                                        key={subOption.value}
                                        onClick={() => handleSortChange(subOption.value)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                                        {subOption.label}
                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {option.id === 'export' && showExportMenu && (
                                <div className={`absolute top-0 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-30 submenu ${
                                  dropdownPosition === 'left' ? 'right-full mr-1' : 'left-full ml-1'
                                }`}>
                                  <div className="py-1">
                                    {option.submenu?.map((subOption) => (
                      <button
                                        key={subOption.value}
                                        onClick={() => handleExportOption(subOption.value)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                                        {subOption.label}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <button
                              onClick={() => handleMoreMenuAction(option)}
                              className={`w-full flex items-center space-x-3 px-4 py-2 text-left text-sm hover:bg-gray-100 ${
                                option.id === 'import' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                              }`}
                            >
                              <option.icon className="h-4 w-4" />
                              <span>{option.label}</span>
                      </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
        </div>
      </div>

      {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button className="py-4 px-1 border-b-2 border-blue-500 text-blue-600 font-medium text-sm">
              Expenses
            </button>
            <button 
              onClick={() => window.location.href = '/dashboard/purchases/expenses/receipts'}
              className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm"
            >
              Receipts Inbox
            </button>
          </nav>
        </div>
      </div>

      {/* Search and Filter Bar - Matching Vendors Section Design */}
      <div className="bg-white border-l border-r border-gray-200 p-3">
          <div className="flex items-center space-x-4">
          <div className="relative flex-1">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
              placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

          {/* Filter Button */}
            <div className="relative">
              <button
              ref={filterRef}
              onClick={() => {
                setShowFilters(!showFilters);
              }}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
              <FunnelIcon className="h-4 w-4" />
              <span className="text-sm">Filter</span>
              </button>

              {showFilters && (
              <div 
                data-filter-dropdown
                className={`absolute top-full mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 ${
                dropdownPosition === 'left' ? 'right-0' : 'left-0'
              }`}>
                  <div className="p-2">
                    {filterOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.value}
                          onClick={() => {
                            if (option.isCustom) {
                              // Navigate to custom view page
                              router.push('/dashboard/purchases/expenses/custom-view');
                            } else {
                              setSelectedFilter(option.value);
                              setShowFilters(false);
                            }
                          }}
                          className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-md hover:bg-gray-50 ${
                            option.isCustom ? "text-blue-600 border-t border-gray-200 mt-1 pt-3" :
                            selectedFilter === option.value ? "bg-blue-50 text-blue-700" : "text-gray-700"
                          }`}
                        >
                          <Icon className={`h-4 w-4 ${option.isCustom ? "text-blue-600" : ""}`} />
                          <span className={`text-sm ${option.isCustom ? "text-blue-600 font-medium" : ""}`}>{option.label}</span>
                          {selectedFilter === option.value && !option.isCustom && (
                            <CheckIcon className="h-4 w-4 ml-auto" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
          </div>

          {/* Upload Expense Button */}
              <button
                onClick={() => window.location.href = '/dashboard/purchases/expenses/import'}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <DocumentArrowUpIcon className="h-4 w-4" />
                <span className="text-sm">Upload Expense</span>
                <ChevronDownIcon className="h-4 w-4" />
              </button>
            </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-3">
            <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-600" />
            <span className="text-gray-600">Loading expenses...</span>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-red-800">{error}</span>
            <button
              onClick={() => window.location.reload()}
              className="ml-auto text-red-600 hover:text-red-800 underline"
            >
              Retry
            </button>
          </div>
        </div>
      ) : filteredExpenses.length === 0 ? (
        /* Empty State - Matching Zoho Books Design */
        <div className="space-y-4">
          {/* Main Empty State Card */}
          <div className="bg-white rounded-lg border p-8 text-center">
            <div className="max-w-md mx-auto">
              {/* Video Tutorial Card */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="relative">
                  <div className="w-full h-32 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                        <PlayIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="text-lg font-semibold text-gray-900">How to record and manage expenses</div>
                        <div className="text-sm text-gray-600">Learn the basics of expense management</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Time To Manage Your Expenses!
              </h2>
              <p className="text-gray-600 mb-6">
                Create and manage expenses that are part of your organization's operating costs.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => window.location.href = '/dashboard/purchases/expenses/record'}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  RECORD EXPENSE
                </button>
                <button
                  onClick={() => window.location.href = '/dashboard/purchases/expenses/import'}
                  className="px-6 py-3 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Import Expenses
                </button>
              </div>
            </div>
          </div>

          {/* Expense Workflow Diagram */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Life cycle of an Expense</h3>
            <div className="flex items-center justify-center space-x-4 overflow-x-auto">
              <div className="flex flex-col items-center space-y-2 min-w-0">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <DocumentIcon className="h-6 w-6 text-gray-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">EXPENSE INCURRED</span>
              </div>
              
              <div className="text-gray-400">→</div>
              
              <div className="flex flex-col items-center space-y-2 min-w-0">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">RECORD EXPENSE</span>
              </div>
              
              <div className="text-gray-400">→</div>
              
              <div className="flex space-x-4">
                <div className="flex flex-col items-center space-y-2 min-w-0">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">BILLABLE</span>
                </div>
                
                <div className="flex flex-col items-center space-y-2 min-w-0">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <XMarkIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">NON-BILLABLE</span>
                </div>
              </div>
              
              <div className="text-gray-400">→</div>
              
              <div className="flex flex-col items-center space-y-2 min-w-0">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <DocumentTextIcon className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">CONVERT TO INVOICE</span>
              </div>
              
              <div className="text-gray-400">→</div>
              
              <div className="flex flex-col items-center space-y-2 min-w-0">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">GET REIMBURSED</span>
              </div>
            </div>
          </div>

          {/* Features List */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">In the Expenses module, you can:</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <CheckIcon className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <span className="text-gray-700">Record a single expense or record expenses in bulk.</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckIcon className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <span className="text-gray-700">Set mileage rates and record expenses based on the distance travelled.</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckIcon className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <span className="text-gray-700">Convert an expense into an invoice to get it reimbursed.</span>
              </div>
            </div>
          </div>

          {/* Promotional Banner */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <DocumentIcon className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Try our advanced travel and expense reporting software
                  </h3>
                  <p className="text-gray-600 mt-1">
                    Manage employee travel and expenses, simplify mileage reimbursements, and streamline card expenses. 
                    Leverage integration to expedite expense account reconciliation.{" "}
                    <a href="#" className="text-blue-600 hover:underline">Learn More</a>
                  </p>
                </div>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                Buy Expense Claim Addon
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Expense Table View - Matching Vendors Design */
        <div className="bg-white rounded-b-lg border border-t-0">
          {/* Bulk Actions Bar - Only show when items are selected */}
          {selectedExpenseIds.length > 0 && (
            <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
              <div className="flex items-center space-x-3">
                <button
                  onClick={onBulkImport}
                  className="group px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                >
                  <div className="flex items-center space-x-2">
                    <PencilSquareIcon className="w-4 h-4 text-blue-600" />
                    <span>Bulk Import</span>
                  </div>
                </button>
                <button
                  onClick={onBulkExport}
                  className="group px-3 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 hover:border-emerald-300 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  title="Export"
                >
                  <div className="flex items-center space-x-2">
                    <DownloadIcon className="w-4 h-4" />
                    <span>Export</span>
                  </div>
                </button>
                <button
                  onClick={onBulkDelete}
                  className="group px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/30"
                >
                  <div className="flex items-center space-x-2">
                    <TrashIcon className="w-4 h-4 text-red-600" />
                    <span>Delete</span>
                  </div>
                </button>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                  {selectedExpenseIds.length} Selected
                </span>
                <button
                  onClick={onClearSelection}
                  className="group p-2 text-orange-600 hover:text-orange-700 bg-orange-50 border border-orange-200 hover:bg-orange-100 hover:border-orange-300 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                  title="Clear Selection"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Table Header */}
          <div className="px-6 py-2 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">
                All Expenses ({filteredExpenses.length})
              </h3>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {isCollapsed ? (
              /* Collapsed View - Compact List */
              <div className="divide-y divide-gray-200">
                {filteredExpenses.map((expense) => (
                  <div
                    key={expense._id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedExpenseId === expense._id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => onExpenseSelect(expense)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          checked={selectedExpenseIds.includes(expense._id)}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            e.stopPropagation();
                            if (e.target.checked) {
                              onBulkSelectionChange([...selectedExpenseIds, expense._id]);
                            } else {
                              onBulkSelectionChange(selectedExpenseIds.filter(id => id !== expense._id));
                            }
                          }}
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {expense.account}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(expense.date).toLocaleDateString('en-GB')} • {expense.vendor}
                          </div>
                          <div className="text-xs text-gray-500 uppercase">
                            {expense.status}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatCurrency(expense.amount)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Full Table View */
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={selectedExpenseIds.length === filteredExpenses.length && filteredExpenses.length > 0}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          e.stopPropagation();
                          if (e.target.checked) {
                            onBulkSelectionChange(filteredExpenses.map(expense => expense._id));
                          } else {
                            onBulkSelectionChange([]);
                          }
                        }}
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      DATE
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      EXPENSE ACCOUNT
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      REFERENCE#
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      VENDOR NAME
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      PAID THROUGH
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CUSTOMER NAME
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      STATUS
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      AMOUNT
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredExpenses.map((expense) => (
                    <tr
                      key={expense._id}
                      className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedExpenseId === expense._id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => onExpenseSelect(expense)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          checked={selectedExpenseIds.includes(expense._id)}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            e.stopPropagation();
                            if (e.target.checked) {
                              onBulkSelectionChange([...selectedExpenseIds, expense._id]);
                            } else {
                              onBulkSelectionChange(selectedExpenseIds.filter(id => id !== expense._id));
                            }
                          }}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(expense.date).toLocaleDateString('en-GB')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                          {expense.account}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {expense.reference || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {expense.vendor}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {expense.paidThrough || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {expense.customer || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs text-gray-500 uppercase">
                          {expense.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {formatCurrency(expense.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {showImportModal && (
        <ImportExpensesModal
          onClose={() => setShowImportModal(false)}
          onSubmit={handleImportExpenses}
        />
      )}
    </div>
  );
}
