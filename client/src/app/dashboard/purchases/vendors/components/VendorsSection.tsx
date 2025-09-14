/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronDownIcon,
  PlusIcon,
  EllipsisVerticalIcon,
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
} from "@heroicons/react/24/outline";
import { Vendor, vendorService } from "@/services/vendorService";
import { formatCurrency } from "@/utils/currency";

interface VendorsSectionProps {
  vendors?: Vendor[];
  selectedVendorId?: string;
  onVendorSelect?: (vendor: Vendor) => void;
  isCollapsed?: boolean;
}

const filters = ["All", "Active", "Inactive", "Business", "Individual"];

const filterOptions = [
  { value: "all", label: "All Vendors", icon: StarIcon },
  { value: "active", label: "Active", icon: CheckIcon },
  { value: "inactive", label: "Inactive", icon: XMarkIcon },
  { value: "business", label: "Business", icon: DocumentIcon },
  { value: "individual", label: "Individual", icon: PencilIcon },
];

const moreMenuOptions = [
  { id: "all", label: "All", icon: StarIcon },
  { 
    id: "sort", 
    label: "Sort by", 
    icon: ChevronDownIcon, 
    hasSubmenu: true,
    submenu: [
      { value: "name", label: "Name" },
      { value: "company", label: "Company Name" },
      { value: "email", label: "Email" },
      { value: "payables", label: "Payables" },
      { value: "created", label: "Created Date" },
    ]
  },
  { id: "import", label: "Import Vendors", icon: DocumentArrowUpIcon },
  { 
    id: "export", 
    label: "Export", 
    icon: DocumentArrowUpIcon, 
    hasSubmenu: true,
    submenu: [
      { value: "export-vendors", label: "Export Vendors" },
      { value: "export-current", label: "Export Current View" },
    ]
  },
  { id: "preferences", label: "Preferences", icon: PencilIcon },
  { id: "custom-fields", label: "Manage Custom Fields", icon: DocumentIcon },
  { id: "refresh", label: "Refresh List", icon: ArrowPathIcon },
  { id: "reset-columns", label: "Reset Column Width", icon: ArrowPathIcon },
];

export default function VendorsSection({ 
  vendors: propVendors, 
  selectedVendorId, 
  onVendorSelect,
  isCollapsed = false 
}: VendorsSectionProps) {
  const [vendors, setVendors] = useState<Vendor[]>(propVendors || []);
  const [loading, setLoading] = useState(!propVendors);
  const [error, setError] = useState<string | null>(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [showMainDropdown, setShowMainDropdown] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedView, setSelectedView] = useState("All Vendors");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [dropdownPosition, setDropdownPosition] = useState<'left' | 'right'>('right');
  const router = useRouter();

  const moreMenuRef = useRef<HTMLDivElement>(null);
  const mainDropdownRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLButtonElement>(null);

  // Fetch vendors from backend
  const fetchVendors = async () => {
    try {
      setLoading(true);
      setError(null);
      const vendorsData = await vendorService.getVendors();
      setVendors(vendorsData);
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
  }, [vendors, searchTerm, selectedFilter]);

  const applyFilters = () => {
    let filtered = vendors;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((vendor) =>
        vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (vendor.email && vendor.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (vendor.gstin && vendor.gstin.toLowerCase().includes(searchTerm.toLowerCase()))
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
          default:
            return true;
        }
      });
    }

    setFilteredVendors(filtered);
  };

  // Calculate dropdown position
  const calculateDropdownPosition = (ref: React.RefObject<HTMLElement>) => {
    if (!ref.current) return 'right';
    const rect = ref.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const spaceOnRight = viewportWidth - rect.right;
    const spaceOnLeft = rect.left;
    return spaceOnRight < 200 && spaceOnLeft > 200 ? 'left' : 'right';
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-menu') && !target.closest('.submenu')) {
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

  const handleVendorClick = (vendor: Vendor) => {
    if (onVendorSelect) {
      onVendorSelect(vendor);
    }
  };

  const handleMoreMenuAction = (option: any) => {
    switch (option.id) {
      case 'all':
        setSelectedFilter('all');
        break;
      case 'import':
        window.location.href = '/dashboard/purchases/vendors/import';
        break;
      case 'preferences':
        console.log('Preferences clicked');
        break;
      case 'custom-fields':
        console.log('Custom fields clicked');
        break;
      case 'refresh':
        fetchVendors();
        break;
      case 'reset-columns':
        console.log('Reset columns clicked');
        break;
      default:
        console.log('Action clicked:', option.id);
    }
    setShowMoreMenu(false);
  };

  const handleSortChange = (sortValue: string) => {
    console.log('Sort by:', sortValue);
    setShowSortMenu(false);
  };

  const handleExportOption = (exportValue: string) => {
    console.log('Export:', exportValue);
    setShowExportMenu(false);
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
            onClick={(e) => e.stopPropagation()}
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
          onClick={(e) => e.stopPropagation()}
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
    <div className="space-y-6">
      {/* Header - Matching Expenses Design */}
      <div className="bg-white rounded-lg border">
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
                  <EllipsisVerticalIcon className="h-5 w-5" />
                </button>
                {showMoreMenu && (
                  <div className={`absolute top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10 ${
                    dropdownPosition === 'left' ? 'right-0' : 'left-0'
                  }`}>
                    <div className="py-1">
                      {moreMenuOptions.map((option) => (
                        <div key={option.id}>
                          {option.hasSubmenu ? (
                            <div className="relative">
                              <button
                                onClick={() => {
                                  if (option.id === 'sort') setShowSortMenu(!showSortMenu);
                                  if (option.id === 'export') setShowExportMenu(!showExportMenu);
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
              Vendors
            </button>
          </nav>
        </div>
      </div>

      {/* Search and Filter Bar - Matching Expenses Design */}
      <div className="bg-white rounded-lg border p-4">
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
              <div className={`absolute top-full mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10 ${
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
        <div className="bg-white">
          {/* Table Header */}
          <div className="px-6 py-3 border-b border-gray-200">
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
    </div>
  );
}
