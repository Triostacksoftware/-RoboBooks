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
  StarIcon,
  XMarkIcon,
  PencilIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  DocumentArrowUpIcon,
  ChevronRightIcon,
  CheckIcon,
  PlayIcon,
  DocumentIcon,
  DocumentTextIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowDownTrayIcon as DownloadIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon as ArrowDownTrayIconSolid,
  ArrowUpTrayIcon as ArrowUpTrayIconSolid,
  ClipboardDocumentListIcon,
  ArrowPathIcon as RefreshIcon,
  Cog6ToothIcon,
  ArrowsUpDownIcon,
} from "@heroicons/react/24/outline";
import { Vendor, vendorService } from "@/services/vendorService";
import { preferencesService } from "@/services/preferencesService";
import { formatCurrency } from "@/utils/currency";
import ImportVendorsModal from "./ImportVendorsModal";

interface VendorsSectionProps {
  vendors?: Vendor[];
  selectedVendorId?: string;
  onVendorSelect?: (vendor: Vendor) => void;
  isCollapsed?: boolean;
  selectedVendorIds: string[];
  onBulkSelectionChange: (selectedIds: string[]) => void;
  onBulkImport: () => void;
  onBulkExport: () => void;
  onBulkDelete: () => void;
  onClearSelection: () => void;
}

const filters = ["All", "Active", "Inactive", "Business", "Individual"];

const filterOptions = [
  { value: "all", label: "All Vendors", icon: StarIcon },
  { value: "active", label: "Active", icon: CheckIcon },
  { value: "inactive", label: "Inactive", icon: XMarkIcon },
  { value: "business", label: "Business", icon: DocumentIcon },
  { value: "individual", label: "Individual", icon: PencilIcon },
];

// Main dropdown options (All Vendors dropdown)
const mainDropdownOptions = [
  { value: "all", label: "All Vendors", icon: StarIcon },
  { value: "active", label: "Active", icon: CheckIcon },
  { value: "inactive", label: "Inactive", icon: XMarkIcon },
  { value: "business", label: "Business", icon: DocumentIcon },
  { value: "individual", label: "Individual", icon: PencilIcon },
  { value: "with-balance", label: "With Balance", icon: DocumentTextIcon },
  { value: "without-balance", label: "Without Balance", icon: XMarkIcon },
];


export default function VendorsSection({ 
  vendors: propVendors, 
  selectedVendorId, 
  onVendorSelect,
  isCollapsed = false,
  selectedVendorIds,
  onBulkSelectionChange,
  onBulkImport,
  onBulkExport,
  onBulkDelete,
  onClearSelection
}: VendorsSectionProps) {
  const [vendors, setVendors] = useState<Vendor[]>(propVendors || []);
  const [loading, setLoading] = useState(!propVendors);
  const [error, setError] = useState<string | null>(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [showMainDropdown, setShowMainDropdown] = useState(false);
  const [hoveredSubmenu, setHoveredSubmenu] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [sortBy, setSortBy] = useState('created_time');
  const [sortOrder, setSortOrder] = useState('desc');
  const [dropdownPosition, setDropdownPosition] = useState<'left' | 'right'>('right');
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const moreMenuRef = useRef<HTMLButtonElement>(null);
  const mainDropdownRef = useRef<HTMLButtonElement>(null);
  const filterRef = useRef<HTMLButtonElement>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedView, setSelectedView] = useState("All Vendors");
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [vendorsList, setVendorsList] = useState<Vendor[]>(vendors || []);
  const router = useRouter();

  // Fetch vendors from backend
  const fetchVendors = async () => {
    try {
      setLoading(true);
      setError(null);
      const vendorsData = await vendorService.getVendors();
      setVendors(vendorsData);
      setVendorsList(vendorsData);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      setError("Failed to fetch vendors. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Load vendors on component mount
  useEffect(() => {
    if (!propVendors) {
      fetchVendors();
    } else {
      setVendors(propVendors);
      setLoading(false);
    }
  }, [propVendors]);

  // Update filtered vendors when vendors or search changes
  useEffect(() => {
    applyFilters();
  }, [vendorsList, searchTerm, selectedFilter]);

  const applyFilters = () => {
    let filtered = [...vendorsList];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((vendor) =>
        vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (vendor.email && vendor.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (vendor.gstin && vendor.gstin.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (vendor.companyName && vendor.companyName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply status filter
    if (selectedFilter !== "all") {
      filtered = filtered.filter((vendor) => {
        switch (selectedFilter) {
          case "active":
            return vendor.status !== "inactive";
          case "inactive":
            return vendor.status === "inactive";
          case "business":
            return vendor.type === "business";
          case "individual":
            return vendor.type === "individual";
          case "with-balance":
            return (vendor.payables || 0) > 0;
          case "without-balance":
            return (vendor.payables || 0) === 0;
          default:
            return true;
        }
      });
    }

    setFilteredVendors(filtered);
  };

  // Handler functions for menu actions
  const handleImportVendorsClick = () => {
    setShowImportModal(true);
    setShowMoreMenu(false);
  };

  const handleImportVendors = async (file: File) => {
    try {
      const importedVendors = await vendorService.importVendors(file);
      setVendorsList(prev => [...prev, ...importedVendors]);
      setVendors(prev => [...prev, ...importedVendors]);
      setShowImportModal(false);
    } catch (err) {
      console.error("Error importing vendors:", err);
    }
  };

  const handleExportVendors = async () => {
    try {
      await vendorService.exportVendors(vendorsList);
    } catch (err) {
      console.error("Error exporting vendors:", err);
    }
  };

  const handleExportCurrentView = async () => {
    try {
      await vendorService.exportVendors(filteredVendors);
    } catch (err) {
      console.error("Error exporting current view:", err);
    }
  };

  const handleSortChange = async (sortField: string) => {
    try {
      setSortBy(sortField);
      
      // Map sort values to actual field names
      const sortFieldMap: { [key: string]: string } = {
        'name': 'name',
        'company': 'companyName',
        'email': 'email',
        'payables': 'payables',
        'created': 'createdAt'
      };

      const actualField = sortFieldMap[sortField] || 'createdAt';
      
      // Update local state with sorted vendors
      setVendorsList(prev => {
        const sorted = [...prev].sort((a, b) => {
          let aValue = a[actualField as keyof Vendor];
          let bValue = b[actualField as keyof Vendor];
          
          // Handle different data types
          if (actualField === 'payables') {
            aValue = Number(aValue) || 0;
            bValue = Number(bValue) || 0;
          } else if (actualField === 'createdAt') {
            aValue = new Date(aValue as string).getTime();
            bValue = new Date(bValue as string).getTime();
          } else {
            aValue = String(aValue || '').toLowerCase();
            bValue = String(bValue || '').toLowerCase();
          }
          
          if (aValue < bValue) return -1;
          if (aValue > bValue) return 1;
          return 0;
        });
        
        return sorted;
      });

      // Save sort preference to localStorage
      localStorage.setItem('vendors-sort', sortField);
      
      console.log('Sorted by:', sortField);
    } catch (error) {
      console.error('Error sorting vendors:', error);
    }
    setShowSortMenu(false);
  };

  const handleExport = async (exportType: string) => {
    try {
      setShowExportMenu(false);
      
      if (exportType === 'export_all') {
        await handleExportVendors();
      } else if (exportType === 'export_current') {
        await handleExportCurrentView();
      }
    } catch (error) {
      console.error('Error exporting vendors:', error);
    }
  };

  const handlePreferences = async () => {
    try {
      // Save current sort preference
      await preferencesService.savePreferences('vendors', {
        defaultSortBy: sortBy,
        defaultSortOrder: 'desc'
      });
      
      // Navigate to vendors preferences page
      router.push('/dashboard/settings/preferences/vendors');
      setShowMoreMenu(false);
    } catch (error) {
      console.error('Error saving preferences:', error);
      // Still navigate even if saving fails
      router.push('/dashboard/settings/preferences/vendors');
      setShowMoreMenu(false);
    }
  };

  const handleCustomFields = async () => {
    try {
      // Navigate to custom fields management page
      router.push('/dashboard/settings/custom-fields');
      setShowMoreMenu(false);
    } catch (error) {
      console.error('Error navigating to custom fields:', error);
    }
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      await fetchVendors();
      setShowMoreMenu(false);
    } catch (error) {
      console.error('Error refreshing vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetColumns = () => {
    // Reset column widths to default
    localStorage.removeItem('vendors-column-widths');
    // Trigger a re-render to apply default column widths
    window.location.reload();
    setShowMoreMenu(false);
  };

  const handleExportOption = (option: string) => {
    handleExport(option);
  };

  const handleMoreMenuAction = (option: any) => {
    if (option.action) {
      option.action();
    }
    setShowMoreMenu(false);
  };

  // More menu options - Matching Zoho Books exactly
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
        { value: "name", label: "Name" },
        { value: "company", label: "Company Name" },
        { value: "email", label: "Email" },
        { value: "payables", label: "Payables" },
        { value: "created", label: "Created Date" },
      ]
    },
    {
      id: "import",
      label: "Import Vendors",
      icon: ArrowDownTrayIconSolid,
      action: () => handleImportVendorsClick()
    },
    {
      id: "export",
      label: "Export",
      icon: ArrowUpTrayIconSolid,
      hasSubmenu: true,
      submenu: [
        { label: "Export Vendors", value: "export_all" },
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

  // Hover handlers for submenus
  const handleSubmenuHover = (optionId: string) => {
    // Clear any existing timeout
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
    // Add a delay before closing to allow moving to submenu
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredSubmenu(null);
      setShowSortMenu(false);
      setShowExportMenu(false);
    }, 200);
  };

  // Calculate dropdown position
  const calculateDropdownPosition = (ref: React.RefObject<HTMLElement>) => {
    if (!ref.current) return 'right';
    const rect = ref.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    return rect.right > viewportWidth - 200 ? 'left' : 'right';
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
      // Cleanup timeout on unmount
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const handleVendorClick = (vendor: Vendor) => {
    if (onVendorSelect) {
      onVendorSelect(vendor);
    }
  };




  const getVendorType = (vendor: Vendor) => {
    return vendor.type || "Business";
  };

  const getVendorName = (vendor: Vendor) => {
    if (vendor.companyName) {
      return vendor.companyName;
    }
    return vendor.name;
  };

  const renderMinimalListItem = (vendor: Vendor) => (
    <div
      key={vendor._id}
      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
        selectedVendorId === vendor._id ? 'bg-blue-50' : ''
      }`}
      onClick={() => handleVendorClick(vendor)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={selectedVendorIds.includes(vendor._id)}
            onChange={(e) => {
              e.stopPropagation();
              if (e.target.checked) {
                onBulkSelectionChange([...selectedVendorIds, vendor._id]);
              } else {
                onBulkSelectionChange(selectedVendorIds.filter(id => id !== vendor._id));
              }
            }}
          />
          <div>
            <div className="text-sm font-medium text-gray-900">
              {getVendorName(vendor)}
            </div>
            <div className="text-xs text-gray-500">
              {vendor.email || "No email"} • {getVendorType(vendor)}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-gray-900">
            {formatCurrency(vendor.payables || 0)}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTableRow = (vendor: Vendor) => (
    <tr
      key={vendor._id}
      className={`hover:bg-gray-50 cursor-pointer transition-colors ${
        selectedVendorId === vendor._id ? 'bg-blue-50' : ''
      }`}
      onClick={() => handleVendorClick(vendor)}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <input
          type="checkbox"
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          checked={selectedVendorIds.includes(vendor._id)}
          onChange={(e) => {
            e.stopPropagation();
            if (e.target.checked) {
              onBulkSelectionChange([...selectedVendorIds, vendor._id]);
            } else {
              onBulkSelectionChange(selectedVendorIds.filter(id => id !== vendor._id));
            }
          }}
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-blue-600 font-semibold text-xs">
              {getVendorName(vendor).charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">
              {getVendorName(vendor)}
            </div>
            <div className="text-sm text-gray-500">{vendor.gstin}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {vendor.companyName || getVendorName(vendor)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {vendor.email || "No email"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {vendor.phone || "No phone"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {formatCurrency(vendor.payables || 0)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {formatCurrency(vendor.unusedCredits || 0)}
      </td>
    </tr>
  );


  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center space-y-3">
          <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading vendors...</span>
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
            onClick={fetchVendors}
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
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative dropdown-menu" ref={mainDropdownRef}>
                <button
                  onClick={() => {
                    const position = calculateDropdownPosition(mainDropdownRef);
                    setDropdownPosition(position);
                    setShowMainDropdown(!showMainDropdown);
                  }}
                  className="flex items-center space-x-2 text-lg font-semibold text-gray-900 hover:text-gray-700"
                >
                  <span>{selectedView}</span>
                  <ChevronDownIcon className="h-5 w-5" />
                </button>
                {showMainDropdown && (
                  <div className={`absolute top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10 ${
                    dropdownPosition === 'left' ? 'right-0' : 'left-0'
                  }`}>
                    <div className="py-1">
                      {filterOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <button
                            key={option.value}
                            onClick={() => {
                              setSelectedView(option.label);
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
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchVendors}
                className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                Refresh
              </button>
              <Link
                href="/dashboard/purchases/vendors/new"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                New Vendor
              </Link>
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
                  <div className={`absolute top-full mt-1 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-10 dropdown-menu ${
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
              Vendors
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
              placeholder="Search vendors..."
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
                          setSelectedFilter(option.value);
                          setShowFilters(false);
                        }}
                        className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-md hover:bg-gray-50 ${
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

          {/* Upload Vendor Button */}
          <button
            onClick={() => window.location.href = '/dashboard/purchases/vendors/import'}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <DocumentArrowUpIcon className="h-4 w-4" />
            <span className="text-sm">Upload Vendor</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      {filteredVendors.length === 0 ? (
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
                        <div className="text-lg font-semibold text-gray-900">How to manage vendors</div>
                        <div className="text-sm text-gray-600">Learn the basics of vendor management</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Time To Manage Your Vendors!
              </h2>
              <p className="text-gray-600 mb-6">
                Create and manage vendors to track purchases and expenses.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => window.location.href = '/dashboard/purchases/vendors/new'}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  NEW VENDOR
                </button>
                <button
                  onClick={() => window.location.href = '/dashboard/purchases/vendors/import'}
                  className="px-6 py-3 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Import Vendors
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Vendor Table View - Matching Expenses Design */
        <div className="bg-white rounded-b-lg border border-t-0">
          {/* Bulk Actions Bar - Only show when items are selected */}
          {selectedVendorIds.length > 0 && (
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
                  {selectedVendorIds.length} Selected
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
                All Vendors ({filteredVendors.length})
              </h3>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {isCollapsed ? (
              /* Collapsed View - Compact List */
              <div className="divide-y divide-gray-200">
                {filteredVendors.map(renderMinimalListItem)}
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
                        checked={selectedVendorIds.length === filteredVendors.length && filteredVendors.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            onBulkSelectionChange(filteredVendors.map(vendor => vendor._id));
                          } else {
                            onBulkSelectionChange([]);
                          }
                        }}
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NAME
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      COMPANY NAME
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      EMAIL
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      PHONE
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      PAYABLES (BCY)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      UNUSED CREDITS (BCY)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredVendors.map(renderTableRow)}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {showImportModal && (
        <ImportVendorsModal
          onClose={() => setShowImportModal(false)}
          onSubmit={handleImportVendors}
        />
      )}
    </div>
  );
}
