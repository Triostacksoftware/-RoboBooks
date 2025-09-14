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
} from "@heroicons/react/24/outline";
import { Payment, paymentService } from "@/services/paymentService";
import { formatCurrency } from "@/utils/currency";
import PaymentsList from "./PaymentsList";

const filters = ["All", "Pending", "Completed", "Failed", "Cancelled"];

interface PaymentsMadeSectionProps {
  payments?: Payment[];
  selectedPaymentId?: string;
  onPaymentSelect?: (payment: Payment) => void;
  isCollapsed?: boolean;
}

export default function PaymentsMadeSection({ 
  payments: propPayments, 
  selectedPaymentId, 
  onPaymentSelect,
  isCollapsed = false 
}: PaymentsMadeSectionProps) {
  const [payments, setPayments] = useState<Payment[]>(propPayments || []);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(!propPayments);
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

  // Fetch payments from backend
  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const paymentsData = await paymentService.getPayments();
      setPayments(paymentsData);
    } catch (error) {
      console.error("Error fetching payments:", error);
      setError("Failed to fetch payments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Load payments on component mount
  useEffect(() => {
    if (!propPayments) {
      fetchPayments();
    } else {
      setPayments(propPayments);
      setLoading(false);
    }
  }, [propPayments]);

  // Update filtered payments when payments or search changes
  useEffect(() => {
    applyFilters();
  }, [payments, searchTerm, selectedFilter]);

  // Filter options matching Expenses Design
  const filterOptions = [
    { value: "all", label: "All Payments", icon: StarIcon },
    { value: "pending", label: "Pending", icon: ClockIcon },
    { value: "completed", label: "Completed", icon: CheckIcon },
    { value: "failed", label: "Failed", icon: XCircleIcon },
    { value: "cancelled", label: "Cancelled", icon: XMarkIcon },
  ];

  // Column options for sorting
  const columnOptions = [
    { value: "date", label: "Date" },
    { value: "vendor_name", label: "Vendor Name" },
    { value: "amount", label: "Amount" },
    { value: "status", label: "Status" },
    { value: "payment_method", label: "Payment Method" },
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
        { value: "amount", label: "Amount" },
        { value: "status", label: "Status" },
        { value: "payment-method", label: "Payment Method" },
        { value: "created", label: "Created Date" },
      ]
    },
    { id: "import", label: "Import Payments", icon: ArrowDownTrayIconSolid },
    { 
      id: "export", 
      label: "Export", 
      icon: ArrowUpTrayIconSolid, 
      hasSubmenu: true,
      submenu: [
        { value: "export-payments", label: "Export Payments" },
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
    let filtered = payments;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(payment =>
        payment.paymentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (selectedFilter !== "all") {
      filtered = filtered.filter(payment => payment.status === selectedFilter);
    }

    setFilteredPayments(filtered);
  };

  const handlePaymentClick = (payment: Payment) => {
    if (onPaymentSelect) {
      onPaymentSelect(payment);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [payments, searchTerm, selectedFilter]);

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
        window.location.href = '/dashboard/purchases/payments-made/import';
        break;
      case 'preferences':
        console.log('Preferences clicked');
        break;
      case 'custom-fields':
        console.log('Custom fields clicked');
        break;
      case 'refresh':
        fetchPayments();
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
                  <span>{filterOptions.find(opt => opt.value === selectedFilter)?.label || "All Payments"}</span>
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
                onClick={() => window.location.href = '/dashboard/purchases/payments-made/new'}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                <PlusIcon className="h-4 w-4" />
                <span>New Payment</span>
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
              Payments Made
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
              placeholder="Search payments..."
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

          {/* Upload Payment Button */}
          <button
            onClick={() => window.location.href = '/dashboard/purchases/payments-made/import'}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <DocumentArrowUpIcon className="h-4 w-4" />
            <span className="text-sm">Upload Payment</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-3">
            <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-600" />
            <span className="text-gray-600">Loading payments...</span>
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
      ) : filteredPayments.length === 0 ? (
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
                        <div className="text-lg font-semibold text-gray-900">How to manage payments</div>
                        <div className="text-sm text-gray-600">Learn the basics of payment management</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Time To Manage Your Payments!
              </h2>
              <p className="text-gray-600 mb-6">
                Record and manage payments to track your expenses and vendor relationships.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => window.location.href = '/dashboard/purchases/payments-made/new'}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  NEW PAYMENT
                </button>
                <button
                  onClick={() => window.location.href = '/dashboard/purchases/payments-made/import'}
                  className="px-6 py-3 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Import Payments
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Payments List View */
        <PaymentsList
          payments={filteredPayments}
          selectedPaymentId={selectedPaymentId}
          onEdit={(payment: any) => console.log("Edit payment:", payment)}
          onDelete={(paymentId: string) => console.log("Delete payment:", paymentId)}
          onPaymentClick={handlePaymentClick}
          isCollapsed={isCollapsed}
        />
      )}
    </div>
  );
}