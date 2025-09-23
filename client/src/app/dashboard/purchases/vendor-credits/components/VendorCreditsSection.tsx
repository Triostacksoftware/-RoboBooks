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
  XCircleIcon,
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
import { VendorCredit, vendorCreditService } from "@/services/vendorCreditService";
import { formatCurrency } from "@/utils/currency";
import ImportVendorCreditsModal from "../import/components/ImportVendorCreditsModal";

interface VendorCreditsSectionProps {
  vendorCredits?: VendorCredit[];
  selectedVendorCreditId?: string;
  onVendorCreditSelect?: (vendorCredit: VendorCredit) => void;
  isCollapsed?: boolean;
  selectedVendorCreditIds: string[];
  onBulkSelectionChange: (selectedIds: string[]) => void;
  onBulkImport: () => void;
  onBulkExport: () => void;
  onBulkDelete: () => void;
  onClearSelection: () => void;
}

export default function VendorCreditsSection({ 
  vendorCredits: propVendorCredits, 
  selectedVendorCreditId, 
  onVendorCreditSelect,
  isCollapsed = false,
  selectedVendorCreditIds,
  onBulkSelectionChange,
  onBulkImport,
  onBulkExport,
  onBulkDelete,
  onClearSelection
}: VendorCreditsSectionProps) {
  const [vendorCredits, setVendorCredits] = useState<VendorCredit[]>(propVendorCredits || []);
  const [filteredVendorCredits, setFilteredVendorCredits] = useState<VendorCredit[]>([]);
  const [loading, setLoading] = useState(!propVendorCredits);
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
  const router = useRouter();

  // Fetch vendor credits from backend
  const fetchVendorCredits = async () => {
    try {
      setLoading(true);
      setError(null);
      const creditsData = await vendorCreditService.getVendorCredits();
      setVendorCredits(creditsData);
    } catch (error) {
      console.error("Error fetching vendor credits:", error);
      setError("Failed to fetch vendor credits. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Load vendor credits on component mount
  useEffect(() => {
    if (!propVendorCredits) {
      fetchVendorCredits();
    } else {
      setVendorCredits(propVendorCredits);
      setLoading(false);
    }
  }, [propVendorCredits]);

  // Update filtered vendor credits when vendor credits or search changes
  useEffect(() => {
    applyFilters();
  }, [vendorCredits, searchTerm, selectedFilter]);

  // Main dropdown options (All Vendor Credits dropdown)
  const mainDropdownOptions = [
    { value: "all", label: "All Vendor Credits", icon: StarIcon, isCustom: false },
    { value: "draft", label: "Draft", icon: PencilIcon, isCustom: false },
    { value: "issued", label: "Issued", icon: ClockIcon, isCustom: false },
    { value: "applied", label: "Applied", icon: CheckIcon, isCustom: false },
    { value: "refunded", label: "Refunded", icon: CurrencyDollarIcon, isCustom: false },
    { value: "cancelled", label: "Cancelled", icon: XCircleIcon, isCustom: false },
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
        { value: "credit-number", label: "Credit Number" },
        { value: "vendor", label: "Vendor Name" },
        { value: "amount", label: "Amount" },
        { value: "credit-date", label: "Credit Date" },
        { value: "status", label: "Status" },
        { value: "created", label: "Created Date" },
      ]
    },
    {
      id: "import",
      label: "Import Vendor Credits",
      icon: ArrowDownTrayIconSolid,
      action: () => handleImportVendorCreditsClick()
    },
    {
      id: "export",
      label: "Export",
      icon: ArrowUpTrayIconSolid,
      hasSubmenu: true,
      submenu: [
        { label: "Export Vendor Credits", value: "export_all" },
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
    let filtered = vendorCredits;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(credit =>
        credit.creditNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        credit.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        credit.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        credit.reason.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (selectedFilter !== "all") {
      filtered = filtered.filter(credit => credit.status === selectedFilter);
    }

    setFilteredVendorCredits(filtered);
  };

  const handleVendorCreditClick = (credit: VendorCredit) => {
    if (onVendorCreditSelect) {
      onVendorCreditSelect(credit);
    }
  };


  const handleSortChange = (sortValue: string) => {
    console.log('Sort by:', sortValue);
    setShowSortMenu(false);
  };

  const handleExportOption = (exportValue: string) => {
    console.log('Export:', exportValue);
    setShowExportMenu(false);
  };

  // Additional handler functions for comprehensive menu
  const handleImportVendorCreditsClick = () => {
    setShowImportModal(true);
    setShowMoreMenu(false);
  };

  const handleImportVendorCredits = async (importedCredits: VendorCredit[]) => {
    try {
      setVendorCredits(prev => [...prev, ...importedCredits]);
      setShowImportModal(false);
    } catch (error) {
      console.error('Error importing vendor credits:', error);
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

  const handlePreferences = () => {
    router.push('/dashboard/settings/preferences/vendor-credits');
    setShowMoreMenu(false);
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      await fetchVendorCredits();
      setShowMoreMenu(false);
    } catch (error) {
      console.error('Error refreshing vendor credits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetColumns = () => {
    window.location.reload();
    setShowMoreMenu(false);
  };

  const handleExport = async (exportType: string) => {
    try {
      setShowExportMenu(false);
      
      if (exportType === 'export_all') {
        await handleExportOption('export-credits');
      } else if (exportType === 'export_current') {
        await handleExportOption('export-current');
      }
    } catch (error) {
      console.error('Error exporting vendor credits:', error);
    }
  };

  const handleMoreMenuAction = (option: any) => {
    if (option.action) {
      option.action();
    }
    setShowMoreMenu(false);
  };

  // Hover handlers for submenus
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

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      issued: 'bg-blue-100 text-blue-800',
      applied: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-purple-100 text-purple-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <PencilIcon className="h-4 w-4" />;
      case 'issued':
        return <ClockIcon className="h-4 w-4" />;
      case 'applied':
        return <CheckIcon className="h-4 w-4" />;
      case 'cancelled':
        return <XCircleIcon className="h-4 w-4" />;
      case 'refunded':
        return <CurrencyDollarIcon className="h-4 w-4" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center space-y-3">
          <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading vendor credits...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <span className="text-red-800">{error}</span>
          <button
            onClick={fetchVendorCredits}
            className="ml-auto text-red-600 hover:text-red-800 underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* Header - Matching Expenses Design */}
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
                  <span>{mainDropdownOptions.find(opt => opt.value === selectedFilter)?.label || "All Vendor Credits"}</span>
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
                              setSelectedFilter(option.value);
                              setShowMainDropdown(false);
                            }}
                            className={`w-full flex items-center space-x-3 px-4 py-2 text-left rounded-md hover:bg-gray-50 ${
                              selectedFilter === option.value ? "bg-blue-50 text-blue-700" : "text-gray-700"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                            <span className="text-sm">{option.label}</span>
                            {selectedFilter === option.value && (
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
                onClick={fetchVendorCredits}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <ArrowPathIcon className="h-4 w-4" />
                <span>Refresh</span>
              </button>
              <button
                onClick={() => window.location.href = '/dashboard/purchases/vendor-credits/new'}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                <PlusIcon className="h-4 w-4" />
                <span>New Vendor Credit</span>
              </button>
              <div className="relative dropdown-menu" ref={moreMenuRef}>
                <button
                  onClick={() => {
                    const position = calculateDropdownPosition(moreMenuRef);
                    setDropdownPosition(position);
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
                                        onClick={() => handleExportOption(subOption.value)}
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
                              onClick={() => handleMoreMenuAction(option)}
                              className={`w-full flex items-center space-x-3 px-4 py-2 text-left text-sm hover:bg-blue-600 hover:text-white ${
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
              Vendor Credits
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
              placeholder="Search vendor credits..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Button */}
          <div className="relative">
            <button
              ref={filterRef}
              data-filter-dropdown
              onClick={() => {
                const position = calculateDropdownPosition(filterRef);
                setDropdownPosition(position);
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
                  <button 
                    onClick={() => {
                      router.push('/dashboard/purchases/vendor-credits/custom-view');
                      setShowFilters(false);
                    }}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-left rounded-md hover:bg-gray-50 text-blue-600"
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span className="text-sm">New Custom View</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Upload Vendor Credit Button */}
          <button
            onClick={() => window.location.href = '/dashboard/purchases/vendor-credits/import'}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <DocumentArrowUpIcon className="h-4 w-4" />
            <span className="text-sm">Upload Vendor Credit</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      {filteredVendorCredits.length === 0 ? (
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
                        <div className="text-lg font-semibold text-gray-900">How to create a vendor credit</div>
                        <div className="text-sm text-gray-600">Learn the basics of vendor credit management</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                You deserve some credit too.
              </h2>
              <p className="text-gray-600 mb-6">
                Create vendor credits and apply them to multiple bills when buying stuff from your vendor.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => window.location.href = '/dashboard/purchases/vendor-credits/new'}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  CREATE VENDOR CREDITS
                </button>
                <button
                  onClick={() => window.location.href = '/dashboard/purchases/vendor-credits/import'}
                  className="px-6 py-3 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Import Vendor Credits
                </button>
              </div>
            </div>
          </div>

          {/* Lifecycle Diagram - Similar to Zoho Books */}
          <div className="bg-white rounded-lg border p-8">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                Life cycle of a Vendor Credit
              </h3>
              
              {/* Lifecycle Flowchart */}
              <div className="flex flex-col lg:flex-row items-center justify-center space-y-4 lg:space-y-0 lg:space-x-8 mb-8">
                {/* Step 1 */}
                <div className="flex flex-col items-center">
                  <div className="w-48 h-16 bg-blue-100 rounded-lg flex items-center justify-center border-2 border-blue-200">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-blue-800">PRODUCT RETURNED / CANCELLED</span>
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col items-center">
                  <div className="w-48 h-16 bg-green-100 rounded-lg flex items-center justify-center border-2 border-green-200">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-green-800">CREDIT NOTE RECEIVED</span>
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col items-center">
                  <div className="w-48 h-16 bg-green-100 rounded-lg flex items-center justify-center border-2 border-green-200">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-green-800">RECORD VENDOR CREDITS</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Branching Paths */}
              <div className="flex flex-col lg:flex-row items-center justify-center space-y-4 lg:space-y-0 lg:space-x-8">
                {/* Branch Label */}
                <div className="flex items-center">
                  <div className="w-32 h-8 bg-gray-100 rounded flex items-center justify-center border border-gray-200">
                    <span className="text-xs font-medium text-gray-600">MARK AS OPEN</span>
                  </div>
                </div>

                {/* Branch Arrow */}
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" strokeDasharray="5,5" />
                  </svg>
                </div>

                {/* Upper Path */}
                <div className="flex flex-col items-center">
                  <div className="w-48 h-16 bg-green-100 rounded-lg flex items-center justify-center border-2 border-green-200">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-green-800">APPLY TO FUTURE BILLS</span>
                    </div>
                  </div>
                </div>

                {/* Lower Path */}
                <div className="flex flex-col items-center">
                  <div className="w-48 h-16 bg-blue-100 rounded-lg flex items-center justify-center border-2 border-blue-200">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-blue-800">RECORD REFUND</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Explanation Text */}
              <div className="mt-8 text-center">
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  In the Vendor Credits module, you can:
                </h4>
                <div className="space-y-2 text-left max-w-2xl mx-auto">
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-700">Record credits when you receive a credit note from your vendor.</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-700">Apply vendor credits to bill payments in the future.</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-700">Record refunds for your vendor credits.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Vendor Credits List View */
        <div className="bg-white rounded-b-lg border border-t-0">
          {/* Bulk Actions Bar - Only show when items are selected */}
          {selectedVendorCreditIds.length > 0 && (
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
                  {selectedVendorCreditIds.length} Selected
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

          {isCollapsed ? (
            /* Compact List View */
            <div className="divide-y divide-gray-200">
              {filteredVendorCredits.map((credit) => (
                <div
                  key={credit._id}
                  className="flex items-center space-x-4 p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleVendorCreditClick(credit)}
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={selectedVendorCreditIds.includes(credit._id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      if (e.target.checked) {
                        onBulkSelectionChange([...selectedVendorCreditIds, credit._id]);
                      } else {
                        onBulkSelectionChange(selectedVendorCreditIds.filter(id => id !== credit._id));
                      }
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {credit.creditNumber}
                      </span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-500">{credit.vendorName}</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(credit.status)}`}>
                        {getStatusIcon(credit.status)}
                        <span className="ml-1">
                          {credit.status.charAt(0).toUpperCase() + credit.status.slice(1)}
                        </span>
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatCurrency(credit.amount)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Full Table View */
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input 
                        type="checkbox" 
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={selectedVendorCreditIds.length === filteredVendorCredits.length && filteredVendorCredits.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            onBulkSelectionChange(filteredVendorCredits.map(credit => credit._id));
                          } else {
                            onBulkSelectionChange([]);
                          }
                        }}
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Credit Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Credit Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applied Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Remaining
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredVendorCredits.map((credit) => (
                    <tr
                      key={credit._id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleVendorCreditClick(credit)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          checked={selectedVendorCreditIds.includes(credit._id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            if (e.target.checked) {
                              onBulkSelectionChange([...selectedVendorCreditIds, credit._id]);
                            } else {
                              onBulkSelectionChange(selectedVendorCreditIds.filter(id => id !== credit._id));
                            }
                          }}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {credit.creditNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{credit.vendorName}</div>
                        {credit.billNumber && (
                          <div className="text-sm text-gray-500">Bill: {credit.billNumber}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(credit.creditDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(credit.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(credit.appliedAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(credit.remainingAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(credit.status)}`}>
                          {getStatusIcon(credit.status)}
                          <span className="ml-1">
                            {credit.status.charAt(0).toUpperCase() + credit.status.slice(1)}
                          </span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Edit functionality
                            }}
                            className="p-1 text-gray-600 hover:text-gray-800"
                            title="Edit"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Import Modal */}
      <ImportVendorCreditsModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportSuccess={handleImportVendorCredits}
      />
    </div>
  );
}
