'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  PlusIcon, 
  EllipsisVerticalIcon, 
  ChevronDownIcon,
  FunnelIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  Cog6ToothIcon,
  PlusCircleIcon,
  StarIcon,
  ComputerDesktopIcon,
  ArrowPathIcon,
  ArrowsPointingOutIcon
} from '@heroicons/react/24/outline';
import NewCustomViewModal from './NewCustomViewModal';
import CustomerInvoiceService, { Customer, Invoice } from '@/lib/services/customerInvoiceService';

interface PaymentsReceivedHeaderProps {
  onNewPayment: () => void;
  hasPayments: boolean;
  onToggleCollapse?: () => void;
  isCollapsed?: boolean;
  containerWidth?: string; // Add container width prop
  onRefresh?: () => Promise<void>; // Add refresh callback prop
  isRefreshing?: boolean; // Add refreshing state prop
  autoRefresh?: boolean; // Add auto-refresh toggle prop
  onToggleAutoRefresh?: (enabled: boolean) => void; // Add auto-refresh toggle callback
}

export default function PaymentsReceivedHeader({ 
  onNewPayment, 
  hasPayments, 
  onToggleCollapse, 
  isCollapsed = false,
  containerWidth = 'full',
  onRefresh,
  isRefreshing = false,
  autoRefresh = false,
  onToggleAutoRefresh
}: PaymentsReceivedHeaderProps) {
  const [showViewDropdown, setShowViewDropdown] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showImportDropdown, setShowImportDropdown] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [showCustomViewModal, setShowCustomViewModal] = useState(false);
  const [currentView, setCurrentView] = useState('All Payments');
  const [currentSortBy, setCurrentSortBy] = useState('Date');
  const [localIsRefreshing, setLocalIsRefreshing] = useState(false);
  const [showCustomFieldsModal, setShowCustomFieldsModal] = useState(false);
  const [showOnlinePaymentsModal, setShowOnlinePaymentsModal] = useState(false);
  
  // Customer and Invoice data states
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [customersError, setCustomersError] = useState<string | null>(null);
  const [invoicesError, setInvoicesError] = useState<string | null>(null);
  
  const moreActionsRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const importDropdownRef = useRef<HTMLDivElement>(null);

  // Fetch customers and invoices on component mount
  useEffect(() => {
    fetchCustomers();
    fetchInvoices();
  }, []);

  // Fetch customers from customer database
  const fetchCustomers = async () => {
    try {
      setCustomersLoading(true);
      setCustomersError(null);
      const response = await CustomerInvoiceService.getCustomers({
        status: 'active',
        limit: 100 // Fetch more customers for better coverage
      });
      setCustomers(response.data || []);
      console.log('✅ Fetched customers:', response.data?.length || 0);
    } catch (error) {
      console.error('❌ Error fetching customers:', error);
      setCustomersError(error instanceof Error ? error.message : 'Failed to fetch customers');
      setCustomers([]);
    } finally {
      setCustomersLoading(false);
    }
  };

  // Fetch invoices from invoice database
  const fetchInvoices = async () => {
    try {
      setInvoicesLoading(true);
      setInvoicesError(null);
      const response = await CustomerInvoiceService.getInvoices();
      setInvoices(response.data || []);
      console.log('✅ Fetched invoices:', response.data?.length || 0);
    } catch (error) {
      console.error('❌ Error fetching invoices:', error);
      setInvoicesError(error instanceof Error ? error.message : 'Failed to fetch invoices');
      setInvoices([]);
    } finally {
      setInvoicesLoading(false);
    }
  };

  // Refresh both customers and invoices
  const refreshData = async () => {
    await Promise.all([fetchCustomers(), fetchInvoices()]);
  };
  
  // Determine responsive sizing based on container width and collapse state
  const getResponsiveSizing = () => {
    if (isCollapsed) {
      return {
        titleSize: 'text-lg',
        iconSize: 'h-4 w-4',
        buttonPadding: 'p-2',
        spacing: 'space-x-3',
        titleText: 'All Received Pa...',
        showFullTitle: false
      };
    }
    
    // Responsive sizing based on container width
    if (containerWidth === 'w-[25%]' || containerWidth === '25%') {
      return {
        titleSize: 'text-sm',
        iconSize: 'h-4 w-4',
        buttonPadding: 'px-2 py-1.5',
        spacing: 'space-x-2',
        titleText: 'All Received...',
        showFullTitle: false
      };
    } else if (containerWidth === 'w-[50%]' || containerWidth === '50%') {
      return {
        titleSize: 'text-lg',
        iconSize: 'h-5 w-5',
        buttonPadding: 'px-3 py-2',
        spacing: 'space-x-3',
        titleText: 'All Received Payments',
        showFullTitle: true
      };
    } else {
      // Full width
      return {
        titleSize: 'text-2xl',
        iconSize: 'h-6 w-6',
        buttonPadding: 'px-4 py-2.5',
        spacing: 'space-x-3',
        titleText: 'All Received Payments',
        showFullTitle: true
      };
    }
  };
  
  const responsiveSizing = getResponsiveSizing();

  const viewOptions = [
    'All Payments',
    '+ New Custom View'
  ];

  const sortOptions = [
    'Created Time',
    'Last Modified Time',
    'Date',
    'Payment #',
    'Customer Name',
    'Mode',
    'Amount',
    'Unused Amount'
  ];

  const handleViewChange = (option: string) => {
    if (option === '+ New Custom View') {
      setShowCustomViewModal(true);
    } else {
      setCurrentView(option);
    }
    setShowViewDropdown(false);
  };

  const handleSortByChange = (option: string) => {
    setCurrentSortBy(option);
    setShowSortDropdown(false);
  };

  const handleCustomViewCreated = (customView: any) => {
    console.log('Custom view created:', customView);
    // Here you can add the custom view to your views list
    setShowCustomViewModal(false);
  };

  const handleRefreshList = async () => {
    if (onRefresh) {
      setLocalIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error('Failed to refresh:', error);
      } finally {
        setLocalIsRefreshing(false);
      }
    } else {
      // Fallback to local refresh simulation
      setLocalIsRefreshing(true);
      try {
        // Simulate API call to refresh data
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Refreshing payments list...');
      } catch (error) {
        console.error('Failed to refresh:', error);
      } finally {
        setLocalIsRefreshing(false);
      }
    }
  };

  const handleToggleAutoRefresh = () => {
    if (onToggleAutoRefresh) {
      onToggleAutoRefresh(!autoRefresh);
    }
  };

  const handleResetColumnWidth = () => {
    // Reset all column widths to default
    console.log('Resetting column widths...');
    // You can add a callback prop to notify the parent component
    // onResetColumns && onResetColumns();
  };

  const handleExportPayments = () => {
    console.log('Exporting payments...');
    // Here you would implement the export functionality
    // You can add a callback prop to notify the parent component
    // onExportPayments && onExportPayments();
  };

  const handleManageCustomFields = () => {
    setShowCustomFieldsModal(true);
    setShowMoreActions(false);
  };

  const handleOnlinePayments = () => {
    setShowOnlinePaymentsModal(true);
    setShowMoreActions(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreActionsRef.current && !moreActionsRef.current.contains(event.target as Node)) {
        setShowMoreActions(false);
        setShowSortDropdown(false);
        setShowImportDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Log data status for debugging
  useEffect(() => {
    if (customers.length > 0) {
      console.log(`📊 Loaded ${customers.length} customers from database`);
    }
    if (invoices.length > 0) {
      console.log(`📄 Loaded ${invoices.length} invoices from database`);
    }
  }, [customers.length, invoices.length]);

  // Use the prop value if available, otherwise use local state
  const refreshing = isRefreshing || localIsRefreshing;

  return (
    <div className="bg-white transition-all duration-300 ease-in-out">
      {/* Data Status Indicator */}
      <div className="px-6 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span className={`flex items-center ${customersLoading ? 'text-blue-600' : customersError ? 'text-red-600' : 'text-green-600'}`}>
              {customersLoading ? (
                <ArrowPathIcon className="h-4 w-4 animate-spin mr-1" />
              ) : customersError ? (
                <span className="text-red-500 mr-1">⚠️</span>
              ) : (
                <span className="text-green-500 mr-1">✓</span>
              )}
              Customers: {customersLoading ? 'Loading...' : customersError ? 'Error' : `${customers.length} loaded`}
            </span>
            <span className={`flex items-center ${invoicesLoading ? 'text-blue-600' : invoicesError ? 'text-red-600' : 'text-green-600'}`}>
              {invoicesLoading ? (
                <ArrowPathIcon className="h-4 w-4 animate-spin mr-1" />
              ) : invoicesError ? (
                <span className="text-red-500 mr-1">⚠️</span>
              ) : (
                <span className="text-green-500 mr-1">✓</span>
              )}
              Invoices: {invoicesLoading ? 'Loading...' : invoicesError ? 'Error' : `${invoices.length} loaded`}
            </span>
          </div>
          <button
            onClick={refreshData}
            disabled={customersLoading || invoicesLoading}
            className="text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            <ArrowPathIcon className={`h-4 w-4 ${customersLoading || invoicesLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {isCollapsed ? (
        /* Compact Collapsed Header */
        <div className={`px-4 py-2 ${containerWidth === 'w-[25%]' ? 'px-2' : ''}`}>
          <div className="flex items-center justify-between">
            {/* Left Side - Compact Title and View Dropdown */}
            <div className={`flex items-center ${responsiveSizing.spacing}`}>
              <div className="relative">
                <button
                  onClick={() => setShowViewDropdown(!showViewDropdown)}
                  className={`flex items-center space-x-2 ${responsiveSizing.titleSize} font-semibold text-gray-900 hover:text-blue-600 focus:outline-none transition-colors duration-200 group`}
                >
                  <span 
                    className={`text-gray-800 ${!responsiveSizing.showFullTitle ? 'truncate max-w-[120px]' : ''}`}
                    title={!responsiveSizing.showFullTitle ? "All Received Payments" : undefined}
                  >
                    {responsiveSizing.titleText}
                  </span>
                  <ChevronDownIcon className={`${responsiveSizing.iconSize} text-blue-600 transition-transform duration-200 ${showViewDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showViewDropdown && (
                  <div className="absolute z-20 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 ring-1 ring-black ring-opacity-5">
                    <div className="py-2">
                      {viewOptions.map((option) => (
                        <button
                          key={option}
                          onClick={() => handleViewChange(option)}
                          className="flex items-center justify-between w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                        >
                          <span className="font-medium">{option}</span>
                          {option === 'All Payments' && (
                            <StarIcon className="h-4 w-4 text-yellow-500" />
                          )}
                          {option === '+ New Custom View' && (
                            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                              <PlusIcon className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side - Compact Actions */}
            <div className={`flex items-center ${responsiveSizing.spacing}`}>

              {/* More Actions Menu */}
              <div className="relative" ref={moreActionsRef}>
                <button
                  onClick={() => setShowMoreActions(!showMoreActions)}
                  className={`inline-flex items-center ${responsiveSizing.buttonPadding} text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  <EllipsisVerticalIcon className={responsiveSizing.iconSize} />
                </button>

                {showMoreActions && (
                  <div className={`absolute z-20 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 ring-1 ring-black ring-opacity-5 ${
                    isCollapsed ? 'left-0' : 'right-0'
                  }`}>
                    <div className="py-2">
                      {/* Auto-refresh toggle */}
                      <button 
                        onClick={handleToggleAutoRefresh}
                        className={`flex items-center w-full px-4 py-3 text-sm transition-colors duration-150 ${
                          autoRefresh 
                            ? 'text-white bg-green-600 hover:bg-green-700' 
                            : 'text-gray-700 hover:text-white hover:bg-blue-600'
                        }`}
                      >
                        <ArrowPathIcon className={`mr-3 h-4 w-4 ${
                          autoRefresh ? 'animate-spin' : ''
                        }`} />
                        {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
                      </button>

                      {/* Sort by */}
                      <div className="relative group">
                        <button
                          onMouseEnter={() => setShowSortDropdown(true)}
                          onMouseLeave={() => {
                            // Add a small delay to allow moving to submenu
                            setTimeout(() => {
                              if (!sortDropdownRef.current?.matches(':hover')) {
                                setShowSortDropdown(false);
                              }
                            }, 100);
                          }}
                          className="flex items-center justify-between w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                        >
                          <span className="flex items-center">
                            <FunnelIcon className="mr-3 h-4 w-4" />
                            Sort by
                          </span>
                          <ChevronDownIcon className="h-4 w-4" />
                        </button>
                        
                        {/* Sort By Submenu */}
                        {showSortDropdown && (
                          <div 
                            ref={sortDropdownRef}
                            onMouseEnter={() => setShowSortDropdown(true)}
                            onMouseLeave={() => setShowSortDropdown(false)}
                            className={`absolute top-0 w-48 bg-white rounded-lg shadow-lg border border-gray-200 ${
                              isCollapsed ? 'left-full ml-1' : 'right-full mr-1'
                            }`}
                          >
                            <div className="py-2">
                              {sortOptions.map((option) => (
                                <button
                                  key={option}
                                  onClick={() => handleSortByChange(option)}
                                  className={`flex items-center justify-between w-full px-4 py-3 text-sm transition-colors duration-150 ${
                                    currentSortBy === option 
                                      ? 'text-white bg-blue-600' 
                                      : 'text-gray-700 hover:text-white hover:bg-blue-600'
                                  }`}
                                >
                                  <span>{option}</span>
                                  {currentSortBy === option && (
                                    <ChevronDownIcon className="h-4 w-4 text-white" />
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Import */}
                      <div className="relative group">
                        <button
                          onMouseEnter={() => setShowImportDropdown(true)}
                          onMouseLeave={() => {
                            // Add a small delay to allow moving to submenu
                            setTimeout(() => {
                              if (!importDropdownRef.current?.matches(':hover')) {
                                setShowImportDropdown(false);
                              }
                            }, 100);
                          }}
                          className={`flex items-center justify-between w-full px-4 py-3 text-sm transition-colors duration-150 ${
                            showImportDropdown 
                              ? 'text-white bg-blue-600' 
                              : 'text-gray-700 hover:text-gray-50'
                          }`}
                        >
                          <span className="flex items-center">
                            <ArrowDownTrayIcon className={`mr-3 h-4 w-4 ${
                              showImportDropdown ? 'text-white' : 'text-gray-600'
                            }`} />
                            Import
                          </span>
                          <ChevronDownIcon className="h-4 w-4" />
                        </button>
                        
                        {/* Import Submenu */}
                        {showImportDropdown && (
                          <div 
                            ref={importDropdownRef}
                            onMouseEnter={() => setShowImportDropdown(true)}
                            onMouseLeave={() => setShowImportDropdown(false)}
                            className={`absolute top-0 w-48 bg-white rounded-lg shadow-lg border border-gray-200 ${
                              isCollapsed ? 'left-full ml-1' : 'right-full mr-1'
                            }`}
                          >
                            <div className="py-2">
                              <button className="block w-full text-left px-4 py-3 text-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-150">
                                Import Payments
                              </button>
                              <button className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150">
                                Import Applied Excess Payments
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Export Payments */}
                      <button 
                        onClick={handleExportPayments}
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:text-white hover:bg-blue-600 transition-colors duration-150"
                      >
                        <ArrowUpTrayIcon className="mr-3 h-4 w-4" />
                        Export Payments
                      </button>

                      {/* Manage Custom Fields */}
                      <button 
                        onClick={handleManageCustomFields}
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:text-white hover:bg-blue-600 transition-colors duration-150"
                      >
                        <Cog6ToothIcon className="mr-3 h-4 w-4" />
                        Manage Custom Fields
                      </button>

                      {/* Online Payments */}
                      <button 
                        onClick={handleOnlinePayments}
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:text-white hover:bg-blue-600 transition-colors duration-150"
                      >
                        <ComputerDesktopIcon className="mr-3 h-4 w-4" />
                        Online Payments
                      </button>

                      {/* Reset Column Width */}
                      <button 
                        onClick={handleResetColumnWidth}
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:text-white hover:bg-blue-600 transition-colors duration-150"
                      >
                        <ArrowsPointingOutIcon className="mr-3 h-4 w-4" />
                        Reset Column Width
                      </button>

                      {/* Refresh List */}
                      <button 
                        onClick={handleRefreshList}
                        disabled={refreshing}
                        className={`flex items-center w-full px-4 py-3 text-sm transition-colors duration-150 ${
                          refreshing 
                            ? 'text-gray-400 cursor-not-allowed' 
                            : 'text-gray-700 hover:text-white hover:bg-blue-600'
                        }`}
                      >
                        <ArrowPathIcon className={`mr-3 h-4 w-4 ${
                          refreshing ? 'animate-spin' : ''
                        }`} />
                        {refreshing ? 'Refreshing...' : 'Refresh List'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Full Header */
        <div className={`px-6 py-4 ${containerWidth === 'w-[25%]' ? 'px-3 py-2' : ''}`}>
          <div className="flex items-center justify-between">
            {/* Left Side - Title and View Dropdown */}
            <div className={`flex items-center ${responsiveSizing.spacing}`}>
              <div className="relative">
                <button
                  onClick={() => setShowViewDropdown(!showViewDropdown)}
                  className={`flex items-center space-x-2 ${responsiveSizing.titleSize} font-bold text-gray-900 hover:text-blue-600 focus:outline-none transition-colors duration-200 group`}
                >
                  <span 
                    className={`text-gray-800 ${!responsiveSizing.showFullTitle ? 'truncate max-w-[120px]' : ''}`}
                    title={!responsiveSizing.showFullTitle ? "All Received Payments" : undefined}
                  >
                    {responsiveSizing.titleText}
                  </span>
                  <ChevronDownIcon className={`${responsiveSizing.iconSize} text-blue-600 transition-transform duration-200 ${showViewDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showViewDropdown && (
                  <div className="absolute z-20 mt-3 w-56 bg-white rounded-xl shadow-lg border border-gray-200 ring-1 ring-black ring-opacity-5">
                    <div className="py-2">
                      {viewOptions.map((option) => (
                        <button
                          key={option}
                          onClick={() => handleViewChange(option)}
                          className="flex items-center justify-between w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                        >
                          <span className="font-medium">{option}</span>
                          {option === 'All Payments' && (
                            <StarIcon className="h-4 w-4 text-yellow-500" />
                          )}
                          {option === '+ New Custom View' && (
                            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                              <PlusIcon className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side - Actions */}
            <div className={`flex items-center ${responsiveSizing.spacing}`}>

              {/* More Actions Menu */}
              <div className="relative" ref={moreActionsRef}>
                <button
                  onClick={() => setShowMoreActions(!showMoreActions)}
                  className={`inline-flex items-center ${responsiveSizing.buttonPadding} text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  <EllipsisVerticalIcon className={responsiveSizing.iconSize} />
                </button>

                {showMoreActions && (
                  <div className={`absolute z-20 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 ring-1 ring-black ring-opacity-5 ${
                    isCollapsed ? 'left-0' : 'right-0'
                  }`}>
                    <div className="py-2">
                      {/* Auto-refresh toggle */}
                      <button 
                        onClick={handleToggleAutoRefresh}
                        className={`flex items-center w-full px-4 py-3 text-sm transition-colors duration-150 ${
                          autoRefresh 
                            ? 'text-white bg-green-600 hover:bg-green-700' 
                            : 'text-gray-700 hover:text-white hover:bg-blue-600'
                        }`}
                      >
                        <ArrowPathIcon className={`mr-3 h-4 w-4 ${
                          autoRefresh ? 'animate-spin' : ''
                        }`} />
                        {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
                      </button>

                      {/* Sort by */}
                      <div className="relative group">
                        <button
                          onMouseEnter={() => setShowSortDropdown(true)}
                          onMouseLeave={() => {
                            // Add a small delay to allow moving to submenu
                            setTimeout(() => {
                              if (!sortDropdownRef.current?.matches(':hover')) {
                                setShowSortDropdown(false);
                              }
                            }, 100);
                          }}
                          className="flex items-center justify-between w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                        >
                          <span className="flex items-center">
                            <FunnelIcon className="mr-3 h-4 w-4" />
                            Sort by
                          </span>
                          <ChevronDownIcon className="h-4 w-4" />
                        </button>
                        
                        {/* Sort By Submenu */}
                        {showSortDropdown && (
                          <div 
                            ref={sortDropdownRef}
                            onMouseEnter={() => setShowSortDropdown(true)}
                            onMouseLeave={() => setShowSortDropdown(false)}
                            className={`absolute top-0 w-48 bg-white rounded-lg shadow-lg border border-gray-200 ${
                              isCollapsed ? 'left-full ml-1' : 'right-full mr-1'
                            }`}
                          >
                            <div className="py-2">
                              {sortOptions.map((option) => (
                                <button
                                  key={option}
                                  onClick={() => handleSortByChange(option)}
                                  className={`flex items-center justify-between w-full px-4 py-3 text-sm transition-colors duration-150 ${
                                    currentSortBy === option 
                                      ? 'text-white bg-blue-600' 
                                      : 'text-gray-700 hover:text-white hover:bg-blue-600'
                                  }`}
                                >
                                  <span>{option}</span>
                                  {currentSortBy === option && (
                                    <ChevronDownIcon className="h-4 w-4 text-white" />
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Import */}
                      <div className="relative group">
                        <button
                          onMouseEnter={() => setShowImportDropdown(true)}
                          onMouseLeave={() => {
                            // Add a small delay to allow moving to submenu
                            setTimeout(() => {
                              if (!importDropdownRef.current?.matches(':hover')) {
                                setShowImportDropdown(false);
                              }
                            }, 100);
                          }}
                          className={`flex items-center justify-between w-full px-4 py-3 text-sm transition-colors duration-150 ${
                            showImportDropdown 
                              ? 'text-white bg-blue-600' 
                              : 'text-gray-700 hover:text-gray-50'
                          }`}
                        >
                          <span className="flex items-center">
                            <ArrowDownTrayIcon className={`mr-3 h-4 w-4 ${
                              showImportDropdown ? 'text-white' : 'text-gray-600'
                            }`} />
                            Import
                          </span>
                          <ChevronDownIcon className="h-4 w-4" />
                        </button>
                        
                        {/* Import Submenu */}
                        {showImportDropdown && (
                          <div 
                            ref={importDropdownRef}
                            onMouseEnter={() => setShowImportDropdown(true)}
                            onMouseLeave={() => setShowImportDropdown(false)}
                            className={`absolute top-0 w-48 bg-white rounded-lg shadow-lg border border-gray-200 ${
                              isCollapsed ? 'left-full ml-1' : 'right-full mr-1'
                            }`}
                          >
                            <div className="py-2">
                              <button className="block w-full text-left px-4 py-3 text-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-150">
                                Import Payments
                              </button>
                              <button className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150">
                                Import Applied Excess Payments
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Export Payments */}
                      <button 
                        onClick={handleExportPayments}
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:text-white hover:bg-blue-600 transition-colors duration-150"
                      >
                        <ArrowUpTrayIcon className="mr-3 h-4 w-4" />
                        Export Payments
                      </button>

                      {/* Manage Custom Fields */}
                      <button 
                        onClick={handleManageCustomFields}
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:text-white hover:bg-blue-600 transition-colors duration-150"
                      >
                        <Cog6ToothIcon className="mr-3 h-4 w-4" />
                        Manage Custom Fields
                      </button>

                      {/* Online Payments */}
                      <button 
                        onClick={handleOnlinePayments}
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:text-white hover:bg-blue-600 transition-colors duration-150"
                      >
                        <ComputerDesktopIcon className="mr-3 h-4 w-4" />
                        Online Payments
                      </button>

                      {/* Reset Column Width */}
                      <button 
                        onClick={handleResetColumnWidth}
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:text-white hover:bg-blue-600 transition-colors duration-150"
                      >
                        <ArrowsPointingOutIcon className="mr-3 h-4 w-4" />
                        Reset Column Width
                      </button>

                      {/* Refresh List */}
                      <button 
                        onClick={handleRefreshList}
                        disabled={refreshing}
                        className={`flex items-center w-full px-4 py-3 text-sm transition-colors duration-150 ${
                          refreshing 
                            ? 'text-gray-400 cursor-not-allowed' 
                            : 'text-gray-700 hover:text-white hover:bg-blue-600'
                        }`}
                      >
                        <ArrowPathIcon className={`mr-3 h-4 w-4 ${
                          refreshing ? 'animate-spin' : ''
                        }`} />
                        {refreshing ? 'Refreshing...' : 'Refresh List'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom View Modal */}
      {showCustomViewModal && (
        <NewCustomViewModal
          onClose={() => setShowCustomViewModal(false)}
          onCustomViewCreated={handleCustomViewCreated}
        />
      )}

      {/* Custom Fields Modal */}
      {showCustomFieldsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Manage Custom Fields</h3>
              <button
                onClick={() => setShowCustomFieldsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-gray-600">Configure custom fields for your payments to track additional information.</p>
              <div className="flex space-x-3">
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Add Field
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                  Import Fields
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Online Payments Modal */}
      {showOnlinePaymentsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Online Payments</h3>
              <button
                onClick={() => setShowOnlinePaymentsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-gray-600">Configure online payment gateways and settings for your business.</p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <input type="checkbox" id="stripe" className="rounded border-gray-300" />
                  <label htmlFor="stripe" className="text-gray-700">Stripe</label>
                </div>
                <div className="flex items-center justify-between">
                  <input type="checkbox" id="paypal" className="rounded border-gray-300" />
                  <label htmlFor="paypal" className="text-gray-700">PayPal</label>
                </div>
                <div className="flex items-center justify-between">
                  <input type="checkbox" id="razorpay" className="rounded border-gray-300" />
                  <label htmlFor="razorpay" className="text-gray-700">Razorpay</label>
                </div>
              </div>
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
