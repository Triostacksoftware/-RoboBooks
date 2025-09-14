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
} from "@heroicons/react/24/outline";
import { Bill, billService } from "@/services/billService";
import { formatCurrency } from "@/utils/currency";
import BillsList from "./BillsList";

const filters = ["All", "Draft", "Sent", "Received", "Overdue", "Paid", "Cancelled"];

interface BillsSectionProps {
  bills?: Bill[];
  selectedBillId?: string;
  onBillSelect?: (bill: Bill) => void;
  isCollapsed?: boolean;
}

export default function BillsSection({ 
  bills: propBills, 
  selectedBillId, 
  onBillSelect,
  isCollapsed = false 
}: BillsSectionProps) {
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
  const moreMenuRef = useRef<HTMLButtonElement>(null);
  const mainDropdownRef = useRef<HTMLButtonElement>(null);
  const filterRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

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
    { value: "all", label: "All Bills", icon: StarIcon },
    { value: "draft", label: "Draft", icon: PencilIcon },
    { value: "sent", label: "Sent", icon: ClockIcon },
    { value: "received", label: "Received", icon: CheckIcon },
    { value: "overdue", label: "Overdue", icon: ExclamationTriangleIcon },
    { value: "paid", label: "Paid", icon: CheckIcon },
    { value: "cancelled", label: "Cancelled", icon: XMarkIcon },
  ];

  // Filter options matching Zoho Books
  const filterOptions = [
    { value: "all", label: "All Bills", icon: StarIcon },
    { value: "draft", label: "Draft", icon: PencilIcon },
    { value: "sent", label: "Sent", icon: ClockIcon },
    { value: "received", label: "Received", icon: CheckIcon },
    { value: "overdue", label: "Overdue", icon: ExclamationTriangleIcon },
    { value: "paid", label: "Paid", icon: CheckIcon },
    { value: "cancelled", label: "Cancelled", icon: XMarkIcon },
  ];

  // Column options for sorting
  const columnOptions = [
    { value: "date", label: "Date" },
    { value: "vendor_name", label: "Vendor Name" },
    { value: "total_amount", label: "Total Amount" },
    { value: "status", label: "Status" },
    { value: "due_date", label: "Due Date" },
  ];

  // More menu options - Matching Expenses Design
  const moreMenuOptions = [
    { id: "all", label: "All", icon: StarIcon },
    { 
      id: "sort", 
      label: "Sort by", 
      icon: ChevronDownIcon, 
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
    { id: "import", label: "Import Bills", icon: ArrowDownTrayIconSolid },
    { 
      id: "export", 
      label: "Export", 
      icon: ArrowUpTrayIconSolid, 
      hasSubmenu: true,
      submenu: [
        { value: "export-bills", label: "Export Bills" },
        { value: "export-current", label: "Export Current View" },
      ]
    },
    { id: "preferences", label: "Preferences", icon: ClockIcon },
    { id: "custom-fields", label: "Manage Custom Fields", icon: ClipboardDocumentListIcon },
    { id: "refresh", label: "Refresh List", icon: RefreshIcon },
    { id: "reset-columns", label: "Reset Column Width", icon: ArrowPathIcon },
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
      if (!target.closest('.dropdown-menu')) {
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

  const handleMoreMenuAction = (option: any) => {
    switch (option.id) {
      case 'all':
        setSelectedFilter('all');
        break;
      case 'import':
        window.location.href = '/dashboard/purchases/bills/import';
        break;
      case 'preferences':
        console.log('Preferences clicked');
        break;
      case 'custom-fields':
        console.log('Custom fields clicked');
        break;
      case 'refresh':
        fetchBills();
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
    <div className="space-y-6">
      {/* Header - Matching Vendors Section Design */}
      <div className="bg-white rounded-lg border">
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
                  <span>{filterOptions.find(opt => opt.value === selectedFilter)?.label || "All Bills"}</span>
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
              Bills
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
        />
      )}
    </div>
  );
}