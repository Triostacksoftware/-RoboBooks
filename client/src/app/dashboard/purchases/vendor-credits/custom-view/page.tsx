"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CheckIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
  StarIcon,
  ShareIcon,
  DocumentDuplicateIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { VendorCredit, vendorCreditService } from "@/services/vendorCreditService";
import { formatCurrency } from "@/utils/currency";

interface CustomView {
  id: string;
  name: string;
  description: string;
  filters: {
    status?: string[];
    vendor?: string[];
    dateRange?: {
      start: string;
      end: string;
    };
    amountRange?: {
      min: number;
      max: number;
    };
  };
  columns: {
    id: string;
    label: string;
    visible: boolean;
    width?: number;
  }[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  isDefault?: boolean;
  isShared?: boolean;
}

const defaultColumns = [
  { id: 'creditNumber', label: 'Credit Number', visible: true, width: 150 },
  { id: 'vendorName', label: 'Vendor', visible: true, width: 200 },
  { id: 'creditDate', label: 'Credit Date', visible: true, width: 120 },
  { id: 'amount', label: 'Amount', visible: true, width: 120 },
  { id: 'appliedAmount', label: 'Applied Amount', visible: true, width: 120 },
  { id: 'remainingAmount', label: 'Remaining', visible: true, width: 120 },
  { id: 'status', label: 'Status', visible: true, width: 100 },
  { id: 'reason', label: 'Reason', visible: false, width: 150 },
  { id: 'description', label: 'Description', visible: false, width: 200 },
  { id: 'reference', label: 'Reference', visible: false, width: 120 },
  { id: 'billNumber', label: 'Bill Number', visible: false, width: 120 },
  { id: 'createdAt', label: 'Created Date', visible: false, width: 120 },
];

export default function VendorCreditCustomViewPage() {
  const [customViews, setCustomViews] = useState<CustomView[]>([]);
  const [selectedView, setSelectedView] = useState<CustomView | null>(null);
  const [vendorCredits, setVendorCredits] = useState<VendorCredit[]>([]);
  const [filteredCredits, setFilteredCredits] = useState<VendorCredit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingView, setEditingView] = useState<CustomView | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  // Load custom views and vendor credits
  useEffect(() => {
    loadData();
  }, []);

  // Apply filters based on selected view
  useEffect(() => {
    if (selectedView && vendorCredits.length > 0) {
      applyFilters();
    }
  }, [selectedView, vendorCredits, searchTerm]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load vendor credits
      const credits = await vendorCreditService.getVendorCredits();
      setVendorCredits(credits);
      
      // Load custom views (for now, we'll use localStorage)
      const savedViews = localStorage.getItem('vendorCreditCustomViews');
      if (savedViews) {
        const views = JSON.parse(savedViews);
        setCustomViews(views);
        if (views.length > 0) {
          setSelectedView(views[0]);
        }
      } else {
        // Create default view
        const defaultView: CustomView = {
          id: 'default',
          name: 'All Vendor Credits',
          description: 'Default view showing all vendor credits',
          filters: {},
          columns: defaultColumns,
          sortBy: 'createdAt',
          sortOrder: 'desc',
          isDefault: true,
        };
        setCustomViews([defaultView]);
        setSelectedView(defaultView);
        localStorage.setItem('vendorCreditCustomViews', JSON.stringify([defaultView]));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    if (!selectedView) return;

    let filtered = [...vendorCredits];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(credit =>
        credit.creditNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        credit.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        credit.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        credit.reason.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (selectedView.filters.status && selectedView.filters.status.length > 0) {
      filtered = filtered.filter(credit => selectedView.filters.status!.includes(credit.status));
    }

    // Apply vendor filter
    if (selectedView.filters.vendor && selectedView.filters.vendor.length > 0) {
      filtered = filtered.filter(credit => selectedView.filters.vendor!.includes(credit.vendorName));
    }

    // Apply date range filter
    if (selectedView.filters.dateRange) {
      const { start, end } = selectedView.filters.dateRange;
      filtered = filtered.filter(credit => {
        const creditDate = new Date(credit.creditDate);
        return creditDate >= new Date(start) && creditDate <= new Date(end);
      });
    }

    // Apply amount range filter
    if (selectedView.filters.amountRange) {
      const { min, max } = selectedView.filters.amountRange;
      filtered = filtered.filter(credit => credit.amount >= min && credit.amount <= max);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (selectedView.sortBy) {
        case 'creditNumber':
          aValue = a.creditNumber;
          bValue = b.creditNumber;
          break;
        case 'vendorName':
          aValue = a.vendorName;
          bValue = b.vendorName;
          break;
        case 'creditDate':
          aValue = new Date(a.creditDate);
          bValue = new Date(b.creditDate);
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
      }

      if (selectedView.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredCredits(filtered);
  };

  const saveCustomView = (view: CustomView) => {
    const updatedViews = [...customViews];
    const existingIndex = updatedViews.findIndex(v => v.id === view.id);
    
    if (existingIndex >= 0) {
      updatedViews[existingIndex] = view;
    } else {
      updatedViews.push(view);
    }
    
    setCustomViews(updatedViews);
    localStorage.setItem('vendorCreditCustomViews', JSON.stringify(updatedViews));
    setSelectedView(view);
    setShowCreateModal(false);
    setShowEditModal(false);
    setEditingView(null);
  };

  const deleteCustomView = (viewId: string) => {
    if (confirm('Are you sure you want to delete this custom view?')) {
      const updatedViews = customViews.filter(v => v.id !== viewId);
      setCustomViews(updatedViews);
      localStorage.setItem('vendorCreditCustomViews', JSON.stringify(updatedViews));
      
      if (selectedView?.id === viewId) {
        setSelectedView(updatedViews[0] || null);
      }
    }
  };

  const duplicateCustomView = (view: CustomView) => {
    const newView: CustomView = {
      ...view,
      id: Date.now().toString(),
      name: `${view.name} (Copy)`,
      isDefault: false,
    };
    saveCustomView(newView);
  };

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
        return <CalendarIcon className="h-4 w-4" />;
      case 'applied':
        return <CheckIcon className="h-4 w-4" />;
      case 'cancelled':
        return <XMarkIcon className="h-4 w-4" />;
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
          <span className="text-gray-600">Loading custom views...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Custom Views</h1>
              <p className="text-gray-600">Create and manage custom views for vendor credits</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4" />
            <span>New Custom View</span>
          </button>
        </div>
      </div>

      {/* Custom Views List */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Saved Views</h2>
        </div>
        <div className="p-6">
          {customViews.length === 0 ? (
            <div className="text-center py-8">
              <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No custom views yet</h3>
              <p className="text-gray-600 mb-4">Create your first custom view to get started</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Custom View
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customViews.map((view) => (
                <div
                  key={view.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedView?.id === view.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedView(view)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <StarIcon className="h-4 w-4 text-yellow-500" />
                      <h3 className="font-medium text-gray-900">{view.name}</h3>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingView(view);
                          setShowEditModal(true);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateCustomView(view);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <DocumentDuplicateIcon className="h-4 w-4" />
                      </button>
                      {!view.isDefault && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteCustomView(view.id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{view.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{filteredCredits.length} credits</span>
                    <div className="flex items-center space-x-2">
                      {view.isShared && (
                        <div className="flex items-center space-x-1">
                          <ShareIcon className="h-3 w-3" />
                          <span>Shared</span>
                        </div>
                      )}
                      <span>Sort: {view.sortBy}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Selected View Details and Data */}
      {selectedView && (
        <div className="bg-white rounded-lg border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{selectedView.name}</h2>
                <p className="text-gray-600">{selectedView.description}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setEditingView(selectedView);
                    setShowEditModal(true);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <Cog6ToothIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="p-6 border-b border-gray-200">
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
            </div>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {selectedView.columns
                    .filter(col => col.visible)
                    .map((column) => (
                      <th
                        key={column.id}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        style={{ width: column.width }}
                      >
                        {column.label}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCredits.map((credit) => (
                  <tr key={credit._id} className="hover:bg-gray-50">
                    {selectedView.columns
                      .filter(col => col.visible)
                      .map((column) => (
                        <td key={column.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {column.id === 'creditNumber' && (
                            <div className="font-medium">{credit.creditNumber}</div>
                          )}
                          {column.id === 'vendorName' && (
                            <div>
                              <div className="font-medium">{credit.vendorName}</div>
                              {credit.billNumber && (
                                <div className="text-gray-500">Bill: {credit.billNumber}</div>
                              )}
                            </div>
                          )}
                          {column.id === 'creditDate' && (
                            <div>{new Date(credit.creditDate).toLocaleDateString()}</div>
                          )}
                          {column.id === 'amount' && (
                            <div className="font-medium">{formatCurrency(credit.amount)}</div>
                          )}
                          {column.id === 'appliedAmount' && (
                            <div>{formatCurrency(credit.appliedAmount)}</div>
                          )}
                          {column.id === 'remainingAmount' && (
                            <div>{formatCurrency(credit.remainingAmount)}</div>
                          )}
                          {column.id === 'status' && (
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(credit.status)}`}>
                              {getStatusIcon(credit.status)}
                              <span className="ml-1">
                                {credit.status.charAt(0).toUpperCase() + credit.status.slice(1)}
                              </span>
                            </span>
                          )}
                          {column.id === 'reason' && (
                            <div>{credit.reason}</div>
                          )}
                          {column.id === 'description' && (
                            <div>{credit.description}</div>
                          )}
                          {column.id === 'reference' && (
                            <div>{credit.reference}</div>
                          )}
                          {column.id === 'billNumber' && (
                            <div>{credit.billNumber}</div>
                          )}
                          {column.id === 'createdAt' && (
                            <div>{new Date(credit.createdAt).toLocaleDateString()}</div>
                          )}
                        </td>
                      ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCredits.length === 0 && (
            <div className="text-center py-8">
              <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No vendor credits found</h3>
              <p className="text-gray-600">Try adjusting your filters or search terms</p>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <CustomViewModal
          view={editingView}
          onSave={saveCustomView}
          onClose={() => {
            setShowCreateModal(false);
            setShowEditModal(false);
            setEditingView(null);
          }}
        />
      )}
    </div>
  );
}

// Custom View Modal Component
interface CustomViewModalProps {
  view?: CustomView | null;
  onSave: (view: CustomView) => void;
  onClose: () => void;
}

function CustomViewModal({ view, onSave, onClose }: CustomViewModalProps) {
  const [formData, setFormData] = useState<CustomView>({
    id: view?.id || Date.now().toString(),
    name: view?.name || '',
    description: view?.description || '',
    filters: view?.filters || {},
    columns: view?.columns || defaultColumns,
    sortBy: view?.sortBy || 'createdAt',
    sortOrder: view?.sortOrder || 'desc',
    isDefault: view?.isDefault || false,
    isShared: view?.isShared || false,
  });

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('Please enter a view name');
      return;
    }
    onSave(formData);
  };

  const toggleColumn = (columnId: string) => {
    setFormData(prev => ({
      ...prev,
      columns: prev.columns.map(col =>
        col.id === columnId ? { ...col, visible: !col.visible } : col
      )
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {view ? 'Edit Custom View' : 'Create Custom View'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              View Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter view name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Enter description"
            />
          </div>

          {/* Filters */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {['draft', 'issued', 'applied', 'cancelled', 'refunded'].map(status => (
                    <label key={status} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.filters.status?.includes(status) || false}
                        onChange={(e) => {
                          const currentStatuses = formData.filters.status || [];
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              filters: {
                                ...prev.filters,
                                status: [...currentStatuses, status]
                              }
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              filters: {
                                ...prev.filters,
                                status: currentStatuses.filter(s => s !== status)
                              }
                            }));
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm capitalize">{status}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Columns */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Columns</h3>
            <div className="space-y-2">
              {formData.columns.map((column) => (
                <div key={column.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={column.visible}
                      onChange={() => toggleColumn(column.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-900">{column.label}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <EyeIcon className={`h-4 w-4 ${column.visible ? 'text-blue-600' : 'text-gray-400'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sorting */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Sorting</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={formData.sortBy}
                  onChange={(e) => setFormData(prev => ({ ...prev, sortBy: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="createdAt">Created Date</option>
                  <option value="creditNumber">Credit Number</option>
                  <option value="vendorName">Vendor Name</option>
                  <option value="creditDate">Credit Date</option>
                  <option value="amount">Amount</option>
                  <option value="status">Status</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order
                </label>
                <select
                  value={formData.sortOrder}
                  onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: e.target.value as 'asc' | 'desc' }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {view ? 'Update View' : 'Create View'}
          </button>
        </div>
      </div>
    </div>
  );
}