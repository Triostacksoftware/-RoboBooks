/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronDownIcon,
  PlusIcon,
  EllipsisHorizontalIcon,
  FunnelIcon,
  XMarkIcon,
  PencilIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  StarIcon,
  DocumentTextIcon,
  ReceiptRefundIcon,
  CurrencyDollarIcon,
  DocumentIcon,
  ArrowsUpDownIcon,
  ArrowDownTrayIcon as ArrowDownTrayIconSolid,
  ArrowUpTrayIcon as ArrowUpTrayIconSolid,
  ClipboardDocumentListIcon,
  ArrowPathIcon as RefreshIcon,
  DocumentArrowUpIcon,
  ChevronRightIcon,
  PlayIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowDownTrayIcon as DownloadIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { Bill, billService } from "@/services/billService";
import { formatCurrency } from "@/utils/currency";
import BillsList from "./BillsList";
import ImportBillsModal from "../import/components/ImportBillsModal";

const filters = ["All", "Draft", "Sent", "Received", "Overdue", "Paid", "Cancelled"];

interface BillsSectionProps {
  bills?: Bill[];
  selectedBillId?: string;
  onBillSelect?: (bill: Bill) => void;
  isCollapsed?: boolean;
  selectedBillIds: string[];
  onBulkSelectionChange: (selectedIds: string[]) => void;
  onBulkImport: () => void;
  onBulkExport: () => void;
  onBulkDelete: () => void;
  onClearSelection: () => void;
}

export default function BillsSection({ 
  bills: propBills, 
  selectedBillId, 
  onBillSelect,
  isCollapsed = false,
  selectedBillIds,
  onBulkSelectionChange,
  onBulkImport,
  onBulkExport,
  onBulkDelete,
  onClearSelection
}: BillsSectionProps) {
  const router = useRouter();
  const [bills, setBills] = useState<Bill[]>(propBills || []);
  const [filteredBills, setFilteredBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(!propBills);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [showMainDropdown, setShowMainDropdown] = useState(false);
  const [sortBy, setSortBy] = useState('created_time');
  const [sortOrder, setSortOrder] = useState('desc');
  const [dropdownPosition, setDropdownPosition] = useState<'left' | 'right'>('right');
  const [hoveredSubmenu, setHoveredSubmenu] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const mainDropdownRef = useRef<HTMLButtonElement>(null);
  const filterRef = useRef<HTMLButtonElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch bills from backend
  const fetchBills = async () => {
    try {
      setLoading(true);
      setError(null);
      const billsData = await billService.getBills();
      setBills(billsData);
    } catch (error) {
      console.error("Error fetching bills:", error);
      setError("Failed to fetch bills. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Load bills on component mount
  useEffect(() => {
    if (!propBills) {
      fetchBills();
    } else {
      setBills(propBills);
      setLoading(false);
    }
  }, [propBills]);

  // Update filtered bills when bills or search changes
  useEffect(() => {
    applyFilters();
  }, [bills, searchTerm, selectedFilter]);


  // Main dropdown options (All Bills dropdown)
  const mainDropdownOptions = [
    { value: "all", label: "All Bills", icon: StarIcon, isCustom: false },
    { value: "draft", label: "Draft", icon: PencilIcon, isCustom: false },
    { value: "sent", label: "Sent", icon: ClockIcon, isCustom: false },
    { value: "received", label: "Received", icon: CheckIcon, isCustom: false },
    { value: "overdue", label: "Overdue", icon: ExclamationTriangleIcon, isCustom: false },
    { value: "paid", label: "Paid", icon: CheckIcon, isCustom: false },
    { value: "cancelled", label: "Cancelled", icon: XMarkIcon, isCustom: false },
    { value: "custom", label: "New Custom View", icon: PlusIcon, isCustom: true },
  ];

  // Column options for sorting
  const columnOptions = [
    { value: "date", label: "Date" },
    { value: "vendor_name", label: "Vendor Name" },
    { value: "total_amount", label: "Total Amount" },
    { value: "status", label: "Status" },
    { value: "due_date", label: "Due Date" },
  ];

  // More menu options - Comprehensive like other sections
  const moreMenuOptions = [
    {
      id: "all",
      label: "All",
      icon: StarIcon,
      action: () => {
        setSelectedFilter("all");
        setShowMoreMenu(false);
      }
    },
    {
      id: "sort",
      label: "Sort by",
      icon: ArrowsUpDownIcon,
      hasSubmenu: true,
      submenu: [
        { value: "date", label: "Date" },
        { value: "vendor", label: "Vendor Name" },
        { value: "amount", label: "Total Amount" },
        { value: "status", label: "Status" },
        { value: "due-date", label: "Due Date" },
        { value: "created", label: "Created Date" },
      ]
    },
    {
      id: "import",
      label: "Import Bills",
      icon: ArrowDownTrayIconSolid,
      action: () => handleImportBillsClick()
    },
    {
      id: "export",
      label: "Export",
      icon: ArrowUpTrayIconSolid,
      hasSubmenu: true,
      submenu: [
        { label: "Export Bills", value: "export_all" },
        { label: "Export Current View", value: "export_current" },
      ]
    },
    {
      id: "preferences",
      label: "Preferences",
      icon: Cog6ToothIcon,
      action: () => handlePreferences()
    },
    {
      id: "custom_fields",
      label: "Manage Custom Fields",
      icon: ClipboardDocumentListIcon,
      action: () => handleCustomFields()
    },
    {
      id: "refresh",
      label: "Refresh List",
      icon: RefreshIcon,
      action: () => handleRefresh()
    },
    {
      id: "reset_columns",
      label: "Reset Column Width",
      icon: ArrowPathIcon,
      action: () => handleResetColumns()
    },
  ];

  // Apply filters
  const applyFilters = () => {
    let filtered = bills;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(bill =>
        bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.status.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (selectedFilter !== "all") {
      filtered = filtered.filter(bill => bill.status === selectedFilter);
    }

    setFilteredBills(filtered);
  };

  const handleBillClick = (bill: Bill) => {
    if (onBillSelect) {
      onBillSelect(bill);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [bills, searchTerm, selectedFilter]);

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
        setHoveredSubmenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);


  const handleSortChange = (sortValue: string) => {
    console.log('Sort by:', sortValue);
    setShowSortMenu(false);
  };

  const handleExportOption = (exportValue: string) => {
    console.log('Export:', exportValue);
    setShowExportMenu(false);
  };

  // Additional handler functions for comprehensive menu
  const handleImportBillsClick = () => {
    setShowImportModal(true);
    setShowMoreMenu(false);
  };

  const handleImportBills = async (importedBills: Bill[]) => {
    try {
      setBills(prevBills => [...prevBills, ...importedBills]);
      setShowImportModal(false);
    } catch (error) {
      console.error('Error importing bills:', error);
    }
  };

  const handleCustomFields = async () => {
    try {
      router.push('/dashboard/settings/custom-fields');
      setShowMoreMenu(false);
    } catch (error) {
      console.error('Error navigating to custom fields:', error);
    }
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      await fetchBills();
      setShowMoreMenu(false);
    } catch (error) {
      console.error('Error refreshing bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetColumns = () => {
    console.log('Reset columns clicked');
    setShowMoreMenu(false);
  };



  const handleSubmenuHover = (optionId: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setHoveredSubmenu(optionId);
    if (optionId === 'sort') {
      setShowSortMenu(true);
      setShowExportMenu(false);
    } else if (optionId === 'export') {
      setShowExportMenu(true);
      setShowSortMenu(false);
    }
  };

  const handleSubmenuLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredSubmenu(null);
      setShowSortMenu(false);
      setShowExportMenu(false);
    }, 200);
  };

  const calculateDropdownPosition = (): 'left' | 'right' => {
    if (moreMenuRef.current) {
      const rect = moreMenuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const dropdownWidth = 200; // Approximate dropdown width
      const submenuWidth = 200; // Approximate submenu width
      
      // Check if main dropdown would overflow
      if (rect.right + dropdownWidth > viewportWidth) {
        return 'left';
      }
      
      // Check if submenu would overflow when positioned to the right
      if (rect.right + dropdownWidth + submenuWidth > viewportWidth) {
        return 'left';
      }
      
      return 'right';
    }
    return 'right'; // Default fallback
  };

  const handlePreferences = () => {
    try {
      // Navigate to a general preferences page or bills-specific preferences
      router.push('/dashboard/settings/preferences');
      setShowMoreMenu(false);
    } catch (error) {
      console.error('Error navigating to preferences:', error);
      // Fallback to a more general settings page
      router.push('/dashboard/settings');
      setShowMoreMenu(false);
    }
  };

  const handleExport = async (exportType: string) => {
    try {
      setShowExportMenu(false);
      
      if (exportType === 'export_all') {
        await handleExportOption('export-bills');
      } else if (exportType === 'export_current') {
        await handleExportOption('export-current');
      }
    } catch (error) {
      console.error('Error exporting bills:', error);
    }
  };

  const handleMoreMenuAction = (option: any) => {
    if (option.action) {
      option.action();
    }
    setShowMoreMenu(false);
  };

  // Hover handlers for submenus



  const selectedFilterOption = mainDropdownOptions.find(opt => opt.value === selectedFilter);

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
                    setDropdownPosition(calculateDropdownPosition());
                    setShowMainDropdown(!showMainDropdown);
                  }}
                  className="flex items-center space-x-2 text-lg font-semibold text-gray-900 hover:text-gray-700"
                >
                  <span>{mainDropdownOptions.find(opt => opt.value === selectedFilter)?.label || "All Bills"}</span>
                  <ChevronDownIcon className="h-5 w-5" />
                </button>
                {showMainDropdown && (
                  <div className={`absolute top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10 ${
                    dropdownPosition === 'left' ? 'right-0' : 'left-0'
                  }`}>
                    <div className="py-1">
                      {mainDropdownOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <button
                            key={option.value}
                            onClick={() => {
                              if (option.isCustom) {
                                router.push('/dashboard/purchases/bills/custom-view');
                              } else {
                                setSelectedFilter(option.value);
                                setShowMainDropdown(false);
                              }
                            }}
                            className={`w-full flex items-center space-x-3 px-4 py-2 text-left rounded-md hover:bg-gray-50 ${
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
                onClick={() => window.location.href = '/dashboard/purchases/bills/new'}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                <PlusIcon className="h-4 w-4" />
                <span>New Bill</span>
              </button>
              <div className="relative dropdown-menu" ref={moreMenuRef}>
                <button
                  onClick={() => {
                    setDropdownPosition(calculateDropdownPosition());
                    setShowMoreMenu(!showMoreMenu);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <EllipsisHorizontalIcon className="h-5 w-5" />
                </button>
                {showMoreMenu && (
                  <div className={`absolute top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10 ${
                    dropdownPosition === 'left' ? 'right-0' : 'left-0'
                  }`}>
                    <div className="py-1">
                      {moreMenuOptions.map((option) => (
                        <div key={option.id}>
                          {option.hasSubmenu ? (
                            <div 
                              className="relative"
                              onMouseEnter={() => handleSubmenuHover(option.id)}
                              onMouseLeave={handleSubmenuLeave}
                            >
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
                                className="w-full flex items-center space-x-3 px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-600 hover:text-white"
                              >
                                <option.icon className="h-4 w-4" />
                                <span>{option.label}</span>
                                <ChevronRightIcon className="h-4 w-4 ml-auto" />
                              </button>
                              {option.id === 'sort' && showSortMenu && (
                                <div 
                                  className={`absolute top-0 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-30 submenu ${
                                    dropdownPosition === 'left' ? 'right-full mr-1' : 'left-full ml-1'
                                  }`}>
                                  <div className="py-1">
                                    {option.submenu?.map((subOption) => (
                                      <button
                                        key={subOption.value}
                                        onClick={() => handleSortChange(subOption.value)}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-600 hover:text-white"
                                      >
                                        {subOption.label}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {option.id === 'export' && showExportMenu && (
                                <div 
                                  className={`absolute top-0 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-30 submenu ${
                                    dropdownPosition === 'left' ? 'right-full mr-1' : 'left-full ml-1'
                                  }`}>
                                  <div className="py-1">
                                    {option.submenu?.map((subOption) => (
                                      <button
                                        key={subOption.value}
                                        onClick={() => handleExport(subOption.value)}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-600 hover:text-white"
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
                              onClick={() => option.action && option.action()}
                              className="w-full flex items-center space-x-3 px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-600 hover:text-white"
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
              Bills
            </button>
          </nav>
        </div>
      </div>

      {/* Search and Filter Bar - Matching Expenses Design */}
      <div className="bg-white border-l border-r border-gray-200 p-3">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search bills..."
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
                setDropdownPosition(calculateDropdownPosition());
                setShowFilters(!showFilters);
              }}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <FunnelIcon className="h-4 w-4" />
              <span className="text-sm">Filter</span>
            </button>
            
            {showFilters && (
              <div className={`absolute top-full mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10 ${
                dropdownPosition === 'left' ? 'right-0' : 'left-0'
              }`}>
                <div className="p-2">
                  {mainDropdownOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => {
                          if (option.isCustom) {
                            router.push('/dashboard/purchases/bills/custom-view');
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
                  <div className="border-t border-gray-200 mt-2 pt-2">
                    <button className="w-full flex items-center space-x-3 px-3 py-2 text-left rounded-md hover:bg-gray-50 text-blue-600">
                      <PlusIcon className="h-4 w-4" />
                      <span className="text-sm">New Custom View</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Upload Bill Button */}
          <button
            onClick={() => window.location.href = '/dashboard/purchases/bills/import'}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <DocumentArrowUpIcon className="h-4 w-4" />
            <span className="text-sm">Upload Bill</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-3">
            <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-600" />
            <span className="text-gray-600">Loading bills...</span>
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
      ) : filteredBills.length === 0 ? (
        /* Empty State - Matching Zoho Books Design */
        <div className="space-y-8">
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
                        <div className="text-lg font-semibold text-gray-900">How to manage bills</div>
                        <div className="text-sm text-gray-600">Learn the basics of bill management</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Time To Manage Your Bills!
              </h2>
              <p className="text-gray-600 mb-6">
                Create and manage bills to track your expenses and payments.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => window.location.href = '/dashboard/purchases/bills/new'}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  NEW BILL
                </button>
                <button
                  onClick={() => window.location.href = '/dashboard/purchases/bills/import'}
                  className="px-6 py-3 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Import Bills
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Bills List View */
        <BillsList
          bills={filteredBills}
          selectedBillId={selectedBillId}
          onEdit={(bill: any) => console.log("Edit bill:", bill)}
          onDelete={(billId: string) => console.log("Delete bill:", billId)}
          onBillClick={handleBillClick}
          isCollapsed={isCollapsed}
          selectedBillIds={selectedBillIds}
          onBulkSelectionChange={onBulkSelectionChange}
        onBulkImport={onBulkImport}
        onBulkExport={onBulkExport}
          onBulkDelete={onBulkDelete}
          onClearSelection={onClearSelection}
        />
      )}
      
      {/* Import Modal */}
      <ImportBillsModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportSuccess={handleImportBills}
      />
    </div>
  );
}
