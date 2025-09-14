"use client";

import React, { useState, useEffect } from 'react';
import VendorsSection from './components/VendorsSection';
import { Vendor, vendorService } from '@/services/vendorService';

const VendorsPage = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch vendors on component mount
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setLoading(true);
        const vendorsData = await vendorService.getVendors();
        setVendors(vendorsData);
      } catch (error) {
        console.error('Error fetching vendors:', error);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Left Panel - Vendors List */}
      <div className={`transition-all duration-300 ${showRightPanel ? 'w-1/3' : 'w-full'}`}>
        <VendorsSection
          vendors={vendors}
          selectedVendorId={selectedVendor?._id}
          onVendorSelect={handleVendorSelect}
          isCollapsed={showRightPanel}
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
  );
};

export default VendorsPage;
