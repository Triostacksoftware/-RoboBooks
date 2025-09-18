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
  PaperAirplaneIcon,
  CheckIcon,
  XMarkIcon as XIcon,
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
import { PurchaseOrder, purchaseOrderService } from "@/services/purchaseOrderService";
import { preferencesService } from "@/services/preferencesService";
import { formatCurrency } from "@/utils/currency";
import ImportPurchaseOrdersModal from "./ImportPurchaseOrdersModal";

interface PurchaseOrdersSectionProps {
  purchaseOrders?: PurchaseOrder[];
  selectedPurchaseOrderId?: string;
  onPurchaseOrderSelect?: (purchaseOrder: PurchaseOrder) => void;
  isCollapsed?: boolean;
  selectedPurchaseOrderIds: string[];
  onBulkSelectionChange: (selectedIds: string[]) => void;
  onBulkImport: () => void;
  onBulkExport: () => void;
  onBulkDelete: () => void;
  onClearSelection: () => void;
}

const filters = ["All", "Draft", "Sent", "Approved", "Partially Received", "Received", "Cancelled"];

// Handler functions (defined before menu options to avoid hoisting issues)
// These will be properly defined inside the component

// Main dropdown options (All Purchase Orders dropdown)
const mainDropdownOptions = [
  { value: "all", label: "All Purchase Orders", icon: StarIcon },
  { value: "draft", label: "Draft", icon: PencilIcon },
  { value: "sent", label: "Sent", icon: PaperAirplaneIcon },
  { value: "approved", label: "Approved", icon: CheckIcon },
  { value: "partially_received", label: "Partially Received", icon: CheckIcon },
  { value: "received", label: "Received", icon: CheckIcon },
  { value: "cancelled", label: "Cancelled", icon: XMarkIcon },
  { value: "overdue", label: "Overdue", icon: XIcon },
];

// More menu options - Will be defined inside component with proper state access

export default function PurchaseOrdersSection({ 
  purchaseOrders: propPurchaseOrders, 
  selectedPurchaseOrderId, 
  onPurchaseOrderSelect,
  isCollapsed = false,
  selectedPurchaseOrderIds,
  onBulkSelectionChange,
  onBulkImport,
  onBulkExport,
  onBulkDelete,
  onClearSelection
}: PurchaseOrdersSectionProps) {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(propPurchaseOrders || []);
  const [loading, setLoading] = useState(!propPurchaseOrders);
  const [error, setError] = useState<string | null>(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [showMainDropdown, setShowMainDropdown] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedView, setSelectedView] = useState("All Purchase Orders");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [filteredPurchaseOrders, setFilteredPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [dropdownPosition, setDropdownPosition] = useState<'left' | 'right'>('right');
  const [hoveredSubmenu, setHoveredSubmenu] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('created_time');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showImportModal, setShowImportModal] = useState(false);
  const [purchaseOrdersList, setPurchaseOrdersList] = useState<PurchaseOrder[]>(purchaseOrders || []);
  const router = useRouter();

  const moreMenuRef = useRef<HTMLDivElement>(null);
  const mainDropdownRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLButtonElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // More menu options - Defined inside component with proper state access
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
        { value: "po-number", label: "PO Number" },
        { value: "vendor", label: "Vendor" },
        { value: "amount", label: "Amount" },
        { value: "status", label: "Status" },
        { value: "date", label: "Date" },
        { value: "created", label: "Created Date" },
      ]
    },
    {
      id: "import",
      label: "Import Purchase Orders",
      icon: ArrowDownTrayIconSolid,
      action: () => handleImportPurchaseOrdersClick()
    },
    {
      id: "export",
      label: "Export",
      icon: ArrowUpTrayIconSolid,
      hasSubmenu: true,
      submenu: [
        { label: "Export Purchase Orders", value: "export_all" },
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

  // Fetch purchase orders from backend
  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const ordersData = await purchaseOrderService.getPurchaseOrders();
      setPurchaseOrders(ordersData);
      setPurchaseOrdersList(ordersData);
    } catch (error) {
      console.error("Error fetching purchase orders:", error);
      setError("Failed to fetch purchase orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Load purchase orders on component mount
  useEffect(() => {
    if (!propPurchaseOrders) {
      fetchPurchaseOrders();
    } else {
      setPurchaseOrders(propPurchaseOrders);
      setLoading(false);
    }
  }, [propPurchaseOrders]);

  // Update filtered purchase orders when orders or search changes
  useEffect(() => {
    applyFilters();
  }, [purchaseOrdersList, searchTerm, selectedFilter]);

  const applyFilters = () => {
    let filtered = [...purchaseOrdersList];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((order) =>
        order.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.status.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (selectedFilter !== "all") {
      filtered = filtered.filter((order) => order.status === selectedFilter);
    }

    setFilteredPurchaseOrders(filtered);
  };

  // Calculate dropdown position
  const calculateDropdownPosition = (ref: React.RefObject<HTMLElement | null>) => {
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

  const handlePurchaseOrderClick = (order: PurchaseOrder) => {
    if (onPurchaseOrderSelect) {
      onPurchaseOrderSelect(order);
    }
  };


  const handleSortChange = (sortValue: string) => {
    console.log('Sort by:', sortValue);
    setShowSortMenu(false);
  };

  const handleExportOption = async (exportValue: string) => {
    try {
      let dataToExport = filteredPurchaseOrders;
      
      if (exportValue === 'export-current') {
        // Export current filtered view
        dataToExport = filteredPurchaseOrders;
      } else if (exportValue === 'export-orders') {
        // Export all purchase orders
        dataToExport = purchaseOrders;
      }

      // Prepare data for export
      const exportData = dataToExport.map(order => ({
        'PO Number': order.poNumber || '',
        'Date': order.orderDate ? new Date(order.orderDate).toLocaleDateString() : '',
        'Vendor': order.vendorName || '',
        'Amount': order.totalAmount || 0,
        'Status': order.status || '',
        'Created': order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''
      }));

      // Create CSV content
      const headers = Object.keys(exportData[0] || {});
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => {
            const value = row[header as keyof typeof row];
            // Escape commas and quotes in CSV
            return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
              ? `"${value.replace(/"/g, '""')}"` 
              : value;
          }).join(',')
        )
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `purchase-orders-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log('Export completed:', exportValue);
    } catch (error) {
      console.error('Error exporting purchase orders:', error);
      alert('Error exporting data. Please try again.');
    }
    setShowExportMenu(false);
  };

  // Additional handler functions for comprehensive menu
  const handleImportPurchaseOrdersClick = () => {
    setShowImportModal(true);
    setShowMoreMenu(false);
  };

  const handleImportPurchaseOrders = async (file: File) => {
    try {
      const importedOrders = await purchaseOrderService.importPurchaseOrders(file);
      setPurchaseOrdersList(prev => [...prev, ...importedOrders]);
      setPurchaseOrders(prev => [...prev, ...importedOrders]);
      setShowImportModal(false);
    } catch (err) {
      console.error("Error importing purchase orders:", err);
    }
  };

  const handlePreferences = async () => {
    try {
      // Save current sort preference
      await preferencesService.savePreferences('purchase-orders', {
        defaultSortBy: sortBy,
        defaultSortOrder: 'desc'
      });
      
      // Navigate to purchase orders preferences page
      router.push('/dashboard/settings/preferences/purchase-orders');
      setShowMoreMenu(false);
    } catch (error) {
      console.error('Error saving preferences:', error);
      // Still navigate even if saving fails
      router.push('/dashboard/settings/preferences/purchase-orders');
      setShowMoreMenu(false);
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
      await fetchPurchaseOrders();
      setShowMoreMenu(false);
    } catch (error) {
      console.error('Error refreshing purchase orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetColumns = () => {
    // Reset column widths logic
    window.location.reload();
    setShowMoreMenu(false);
  };

  const handleExport = async (exportType: string) => {
    try {
      setShowExportMenu(false);
      
      if (exportType === 'export_all') {
        await handleExportOption('export-orders');
      } else if (exportType === 'export_current') {
        await handleExportOption('export-current');
      }
    } catch (error) {
      console.error('Error exporting purchase orders:', error);
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


  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      partially_received: 'bg-yellow-100 text-yellow-800',
      received: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <PencilIcon className="h-4 w-4" />;
      case 'sent':
        return <PaperAirplaneIcon className="h-4 w-4" />;
      case 'approved':
        return <CheckIcon className="h-4 w-4" />;
      case 'partially_received':
        return <CheckIcon className="h-4 w-4" />;
      case 'received':
        return <CheckIcon className="h-4 w-4" />;
      case 'cancelled':
        return <XMarkIcon className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const renderMinimalListItem = (order: PurchaseOrder) => (
    <div
      key={order._id}
      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
        selectedPurchaseOrderId === order._id ? 'bg-blue-50' : ''
      }`}
      onClick={() => handlePurchaseOrderClick(order)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={selectedPurchaseOrderIds.includes(order._id)}
            onChange={(e) => {
              e.stopPropagation();
              if (e.target.checked) {
                onBulkSelectionChange([...selectedPurchaseOrderIds, order._id]);
              } else {
                onBulkSelectionChange(selectedPurchaseOrderIds.filter(id => id !== order._id));
              }
            }}
          />
          <div>
            <div className="text-sm font-medium text-gray-900">
              {order.poNumber || 'N/A'}
            </div>
            <div className="text-xs text-gray-500">
              {order.vendorName || 'N/A'} • {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'N/A'}
            </div>
            <div className="text-xs text-gray-500 uppercase">
              {order.status ? order.status.replace('_', ' ') : 'N/A'}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-gray-900">
            {formatCurrency(order.totalAmount || 0)}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTableRow = (order: PurchaseOrder) => (
    <tr
      key={order._id}
      className={`hover:bg-gray-50 cursor-pointer transition-colors ${
        selectedPurchaseOrderId === order._id ? 'bg-blue-50' : ''
      }`}
      onClick={() => handlePurchaseOrderClick(order)}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <input
          type="checkbox"
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          checked={selectedPurchaseOrderIds.includes(order._id)}
          onChange={(e) => {
            e.stopPropagation();
            if (e.target.checked) {
              onBulkSelectionChange([...selectedPurchaseOrderIds, order._id]);
            } else {
              onBulkSelectionChange(selectedPurchaseOrderIds.filter(id => id !== order._id));
            }
          }}
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-blue-600 font-semibold text-xs">
              {order.poNumber?.charAt(0)?.toUpperCase() || 'P'}
            </span>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">
              {order.poNumber || 'N/A'}
            </div>
            <div className="text-sm text-gray-500">{order.vendorName || 'N/A'}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'N/A'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {order.vendorName || 'N/A'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {formatCurrency(order.totalAmount || 0)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
          {order.status ? order.status.replace('_', ' ').toUpperCase() : 'N/A'}
        </span>
      </td>
    </tr>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center space-y-3">
          <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading purchase orders...</span>
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
            onClick={fetchPurchaseOrders}
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
                      {mainDropdownOptions.map((option) => {
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
                onClick={fetchPurchaseOrders}
                className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                Refresh
              </button>
              <Link
                href="/dashboard/purchases/purchase-orders/new"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                New Purchase Order
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
              Purchase Orders
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
              placeholder="Search purchase orders..."
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
                  {mainDropdownOptions.map((option) => {
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

          {/* Upload Purchase Order Button */}
          <button
            onClick={() => window.location.href = '/dashboard/purchases/purchase-orders/import'}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <DocumentArrowUpIcon className="h-4 w-4" />
            <span className="text-sm">Upload Purchase Order</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      {filteredPurchaseOrders.length === 0 ? (
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
                        <div className="text-lg font-semibold text-gray-900">How to manage purchase orders</div>
                        <div className="text-sm text-gray-600">Learn the basics of purchase order management</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Time To Manage Your Purchase Orders!
              </h2>
              <p className="text-gray-600 mb-6">
                Create and manage purchase orders to streamline your procurement process.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => window.location.href = '/dashboard/purchases/purchase-orders/new'}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  NEW PURCHASE ORDER
                </button>
                <button
                  onClick={() => window.location.href = '/dashboard/purchases/purchase-orders/import'}
                  className="px-6 py-3 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Import Purchase Orders
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Purchase Orders Table View - Matching Expenses Design */
        <div className="bg-white rounded-b-lg border border-t-0">
          {/* Bulk Actions Bar - Only show when items are selected */}
          {selectedPurchaseOrderIds.length > 0 && (
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
                  {selectedPurchaseOrderIds.length} Selected
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
                All Purchase Orders ({filteredPurchaseOrders.length})
              </h3>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {isCollapsed ? (
              /* Collapsed View - Compact List */
              <div className="divide-y divide-gray-200">
                {filteredPurchaseOrders.map(renderMinimalListItem)}
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
                        checked={selectedPurchaseOrderIds.length === filteredPurchaseOrders.length && filteredPurchaseOrders.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            onBulkSelectionChange(filteredPurchaseOrders.map(order => order._id));
                          } else {
                            onBulkSelectionChange([]);
                          }
                        }}
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      PO NUMBER
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      DATE
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      VENDOR
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      AMOUNT
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      STATUS
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPurchaseOrders.map(renderTableRow)}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {showImportModal && (
        <ImportPurchaseOrdersModal
          onClose={() => setShowImportModal(false)}
          onSubmit={handleImportPurchaseOrders}
        />
      )}
    </div>
  );
}
