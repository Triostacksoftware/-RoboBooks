"use client";

import React, { useState, useEffect } from 'react';
import { useToast } from "@/contexts/ToastContext";
import ModuleAccessGuard from "@/components/ModuleAccessGuard";
import VendorsSection from './components/VendorsSection';
import BulkImportModal from "@/components/modals/BulkImportModal";
import BulkExportModal from "@/components/modals/BulkExportModal";
import { Vendor, vendorService } from '@/services/vendorService';

const VendorsPage = () => {
  const { addToast, removeToastsByType } = useToast();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedVendorIds, setSelectedVendorIds] = useState<string[]>([]);

  // Fetch vendors on component mount
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setLoading(true);
        
        // Remove any existing processing toasts
        removeToastsByType('info');
        
        // Show processing toast
        addToast({
          type: 'info',
          title: 'Loading...',
          message: 'Fetching vendors from server...',
          duration: 0 // Don't auto-dismiss processing toast
        });
        
        const vendorsData = await vendorService.getVendors();
        setVendors(vendorsData);
        
        // Remove processing toast
        removeToastsByType('info');
        
        // Show success toast (only if there were no vendors before)
        if (vendors.length === 0) {
          addToast({
            title: "Success",
            message: `Loaded ${vendorsData.length} vendors successfully`,
            type: "success",
            duration: 2000,
          });
        }
      } catch (error: any) {
        console.error('Error fetching vendors:', error);
        
        // Remove processing toast on error
        removeToastsByType('info');
        
        addToast({
          title: "Error",
          message: "Failed to load vendors",
          type: "error",
          duration: 5000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, []);

  const handleVendorSelect = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setShowRightPanel(true);
  };

  const handleCloseRightPanel = () => {
    setShowRightPanel(false);
    setSelectedVendor(null);
  };

  const handleVendorUpdate = (updatedVendor: Vendor) => {
    setVendors(vendors.map(v => v._id === updatedVendor._id ? updatedVendor : v));
    setSelectedVendor(updatedVendor);
  };

  const handleVendorDelete = (vendorId: string) => {
    setVendors(vendors.filter(v => v._id !== vendorId));
    setShowRightPanel(false);
    setSelectedVendor(null);
  };

  const handleBulkSelectionChange = (selectedIds: string[]) => {
    setSelectedVendorIds(selectedIds);
  };

  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [showBulkExportModal, setShowBulkExportModal] = useState(false);

  const handleBulkImport = () => {
    setShowBulkImportModal(true);
  };

  const handleBulkExport = () => {
    setShowBulkExportModal(true);
  };

  const closeBulkImportModal = () => {
    setShowBulkImportModal(false);
  };

  const closeBulkExportModal = () => {
    setShowBulkExportModal(false);
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedVendorIds.length} vendors?`)) {
      // TODO: Implement bulk delete functionality
      console.log("Bulk delete for vendors:", selectedVendorIds);
      setSelectedVendorIds([]);
    }
  };

  const handleClearSelection = () => {
    setSelectedVendorIds([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <div className="flex h-full">
        {/* Left Panel - Vendors List */}
        <div className={`transition-all duration-300 ${showRightPanel ? 'w-1/3' : 'w-full'}`}>
          <VendorsSection
            vendors={vendors}
            selectedVendorId={selectedVendor?._id}
            onVendorSelect={handleVendorSelect}
            isCollapsed={showRightPanel}
            selectedVendorIds={selectedVendorIds}
            onBulkSelectionChange={handleBulkSelectionChange}
            onBulkImport={handleBulkImport}
            onBulkExport={handleBulkExport}
            onBulkDelete={handleBulkDelete}
            onClearSelection={handleClearSelection}
          />
        </div>

      {/* Right Panel - Vendor Details */}
      {showRightPanel && selectedVendor && (
        <div className="w-2/3 border-l border-gray-200 bg-white">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedVendor.companyName || selectedVendor.name}
              </h2>
              <button
                onClick={handleCloseRightPanel}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Vendor Details Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Vendor Information
                </h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Name</dt>
                    <dd className="text-sm text-gray-900">{selectedVendor.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">GSTIN</dt>
                    <dd className="text-sm text-gray-900">{selectedVendor.gstin || 'Not provided'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="text-sm text-gray-900">{selectedVendor.email || 'Not provided'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Phone</dt>
                    <dd className="text-sm text-gray-900">{selectedVendor.phone || 'Not provided'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Address</dt>
                    <dd className="text-sm text-gray-900">{selectedVendor.address || 'Not provided'}</dd>
                  </div>
                </dl>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Financial Summary
                </h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Total Payables</dt>
                    <dd className="text-sm text-gray-900">
                      {new Intl.NumberFormat('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                      }).format(selectedVendor.payables || 0)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Unused Credits</dt>
                    <dd className="text-sm text-gray-900">
                      {new Intl.NumberFormat('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                      }).format(selectedVendor.unusedCredits || 0)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Vendor Type</dt>
                    <dd className="text-sm text-gray-900">{selectedVendor.type || 'Business'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="text-sm text-gray-900">{selectedVendor.status || 'Active'}</dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-end space-x-3">
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete this vendor?')) {
                    handleVendorDelete(selectedVendor._id);
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
              >
                Delete Vendor
              </button>
              <button
                onClick={() => window.location.href = `/dashboard/purchases/vendors/${selectedVendor._id}/edit`}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                Edit Vendor
              </button>
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Bulk Import Modal */}
      {showBulkImportModal && (
        <BulkImportModal
          selectedIds={selectedVendorIds}
          type="vendors"
          onClose={closeBulkImportModal}
        />
      )}

      {/* Bulk Export Modal */}
      {showBulkExportModal && (
        <BulkExportModal
          selectedIds={selectedVendorIds}
          selectedData={vendors.filter(vendor => selectedVendorIds.includes(vendor._id))}
          type="vendors"
          onClose={closeBulkExportModal}
        />
      )}
    </div>
  );
};

// Wrapped with access guard
const VendorsPageWithGuard = () => (
  <ModuleAccessGuard moduleName="Purchases">
    <VendorsPage />
  </ModuleAccessGuard>
);

export default VendorsPageWithGuard;
