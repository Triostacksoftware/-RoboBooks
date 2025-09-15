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
  PauseIcon,
} from "@heroicons/react/24/outline";
import { RecurringBill, recurringBillService } from "@/services/recurringBillService";
import { formatCurrency } from "@/utils/currency";

interface RecurringBillsSectionProps {
  recurringBills?: RecurringBill[];
  selectedRecurringBillId?: string;
  onRecurringBillSelect?: (recurringBill: RecurringBill) => void;
  isCollapsed?: boolean;
}

export default function RecurringBillsSection({ 
  recurringBills: propRecurringBills, 
  selectedRecurringBillId, 
  onRecurringBillSelect,
  isCollapsed = false 
}: RecurringBillsSectionProps) {
  const [recurringBills, setRecurringBills] = useState<RecurringBill[]>(propRecurringBills || []);
  const [filteredRecurringBills, setFilteredRecurringBills] = useState<RecurringBill[]>([]);
  const [loading, setLoading] = useState(!propRecurringBills);
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

  // Fetch recurring bills from backend
  const fetchRecurringBills = async () => {
    try {
      setLoading(true);
      setError(null);
      const billsData = await recurringBillService.getRecurringBills();
      setRecurringBills(billsData);
    } catch (error) {
      console.error("Error fetching recurring bills:", error);
      setError("Failed to fetch recurring bills. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Load recurring bills on component mount
  useEffect(() => {
    if (!propRecurringBills) {
      fetchRecurringBills();
    } else {
      setRecurringBills(propRecurringBills);
      setLoading(false);
    }
  }, [propRecurringBills]);

  // Update filtered recurring bills when recurring bills or search changes
  useEffect(() => {
    applyFilters();
  }, [recurringBills, searchTerm, selectedFilter]);

  // Filter options matching Expenses Design
  const filterOptions = [
    { value: "all", label: "All Recurring Bills", icon: StarIcon },
    { value: "active", label: "Active", icon: CheckIcon },
    { value: "inactive", label: "Inactive", icon: XMarkIcon },
    { value: "daily", label: "Daily", icon: ClockIcon },
    { value: "weekly", label: "Weekly", icon: ClockIcon },
    { value: "monthly", label: "Monthly", icon: ClockIcon },
    { value: "quarterly", label: "Quarterly", icon: ClockIcon },
    { value: "yearly", label: "Yearly", icon: ClockIcon },
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
        { value: "name", label: "Name" },
        { value: "vendor", label: "Vendor Name" },
        { value: "amount", label: "Amount" },
        { value: "frequency", label: "Frequency" },
        { value: "next-due", label: "Next Due Date" },
        { value: "status", label: "Status" },
        { value: "created", label: "Created Date" },
      ]
    },
    { id: "import", label: "Import Recurring Bills", icon: ArrowDownTrayIconSolid },
    { 
      id: "export", 
      label: "Export", 
      icon: ArrowUpTrayIconSolid, 
      hasSubmenu: true,
      submenu: [
        { value: "export-bills", label: "Export Recurring Bills" },
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
    let filtered = recurringBills;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(bill =>
        bill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.frequency.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (bill.category && bill.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Status filter
    if (selectedFilter !== "all") {
      if (selectedFilter === "active") {
        filtered = filtered.filter(bill => bill.isActive);
      } else if (selectedFilter === "inactive") {
        filtered = filtered.filter(bill => !bill.isActive);
      } else {
        filtered = filtered.filter(bill => bill.frequency === selectedFilter);
      }
    }

    setFilteredRecurringBills(filtered);
  };

  const handleRecurringBillClick = (bill: RecurringBill) => {
    if (onRecurringBillSelect) {
      onRecurringBillSelect(bill);
    }
  };

  const handleMoreMenuAction = (option: any) => {
    switch (option.id) {
      case 'all':
        setSelectedFilter('all');
        break;
      case 'import':
        window.location.href = '/dashboard/purchases/recurring-bills/import';
        break;
      case 'preferences':
        console.log('Preferences clicked');
        break;
      case 'custom-fields':
        console.log('Custom fields clicked');
        break;
      case 'refresh':
        fetchRecurringBills();
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

  const getFrequencyColor = (frequency: string) => {
    const colors = {
      daily: 'bg-red-100 text-red-800',
      weekly: 'bg-orange-100 text-orange-800',
      monthly: 'bg-blue-100 text-blue-800',
      quarterly: 'bg-purple-100 text-purple-800',
      yearly: 'bg-green-100 text-green-800',
    };
    return colors[frequency as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center space-y-3">
          <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading recurring bills...</span>
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
            onClick={fetchRecurringBills}
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
                  <span>{filterOptions.find(opt => opt.value === selectedFilter)?.label || "All Recurring Bills"}</span>
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
                onClick={fetchRecurringBills}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <ArrowPathIcon className="h-4 w-4" />
                <span>Refresh</span>
              </button>
              <button
                onClick={() => window.location.href = '/dashboard/purchases/recurring-bills/new'}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                <PlusIcon className="h-4 w-4" />
                <span>New Recurring Bill</span>
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
              Recurring Bills
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
              placeholder="Search recurring bills..."
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

          {/* Upload Recurring Bill Button */}
          <button
            onClick={() => window.location.href = '/dashboard/purchases/recurring-bills/import'}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <DocumentArrowUpIcon className="h-4 w-4" />
            <span className="text-sm">Upload Recurring Bill</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      {filteredRecurringBills.length === 0 ? (
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
                        <div className="text-lg font-semibold text-gray-900">How to manage recurring bills</div>
                        <div className="text-sm text-gray-600">Learn the basics of recurring bill management</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Time To Manage Your Recurring Bills!
              </h2>
              <p className="text-gray-600 mb-6">
                Create and manage recurring bills to automate your regular payments.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => window.location.href = '/dashboard/purchases/recurring-bills/new'}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  NEW RECURRING BILL
                </button>
                <button
                  onClick={() => window.location.href = '/dashboard/purchases/recurring-bills/import'}
                  className="px-6 py-3 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Import Recurring Bills
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Recurring Bills List View */
        <div className="bg-white rounded-b-lg border border-t-0">
          {isCollapsed ? (
            /* Compact List View */
            <div className="divide-y divide-gray-200">
              {filteredRecurringBills.map((bill) => (
                <div
                  key={bill._id}
                  className="flex items-center space-x-4 p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleRecurringBillClick(bill)}
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {bill.name}
                      </span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-500">{bill.frequency}</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        bill.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {bill.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatCurrency(bill.amount)}
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
                      <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Frequency
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Next Due
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
                  {filteredRecurringBills.map((bill) => (
                    <tr
                      key={bill._id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleRecurringBillClick(bill)}
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
                              {bill.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {bill.name}
                            </div>
                            <div className="text-sm text-gray-500">{bill.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {bill.vendorName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(bill.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getFrequencyColor(bill.frequency)}`}>
                          {bill.frequency.charAt(0).toUpperCase() + bill.frequency.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(bill.nextDueDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          bill.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {bill.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Toggle active functionality
                            }}
                            className={`p-1 rounded ${
                              bill.isActive 
                                ? 'text-red-600 hover:text-red-800' 
                                : 'text-green-600 hover:text-green-800'
                            }`}
                            title={bill.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {bill.isActive ? (
                              <PauseIcon className="h-4 w-4" />
                            ) : (
                              <PlayIcon className="h-4 w-4" />
                            )}
                          </button>
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
    </div>
  );
}
