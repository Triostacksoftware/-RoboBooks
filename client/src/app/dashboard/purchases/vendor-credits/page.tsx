"use client";

import React, { useState, useEffect } from "react";
import ModuleAccessGuard from "@/components/ModuleAccessGuard";
import { useRouter } from "next/navigation";
import VendorCreditsSection from './components/VendorCreditsSection';
import BulkImportModal from "@/components/modals/BulkImportModal";
import BulkExportModal from "@/components/modals/BulkExportModal";
import { VendorCredit, vendorCreditService } from "@/services/vendorCreditService";

const VendorCreditsPage = () => {
  const router = useRouter();
  const [vendorCredits, setVendorCredits] = useState<VendorCredit[]>([]);
  const [selectedVendorCredit, setSelectedVendorCredit] = useState<VendorCredit | null>(null);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVendorCreditIds, setSelectedVendorCreditIds] = useState<string[]>([]);

  // Load vendor credits
  useEffect(() => {
    const loadVendorCredits = async () => {
      try {
        setLoading(true);
        const data = await vendorCreditService.getVendorCredits();
        setVendorCredits(data);
      } catch (err) {
        console.error("Error loading vendor credits:", err);
        setError("Failed to load vendor credits");
      } finally {
        setLoading(false);
      }
    };

    loadVendorCredits();
  }, []);

  const handleVendorCreditSelect = (vendorCredit: VendorCredit) => {
    setSelectedVendorCredit(vendorCredit);
    setShowRightPanel(true);
    // Update URL without page reload
    router.push(`/dashboard/purchases/vendor-credits?credit=${vendorCredit._id}`, { scroll: false });
  };

  const handleCloseRightPanel = () => {
    setShowRightPanel(false);
    setSelectedVendorCredit(null);
    router.push("/dashboard/purchases/vendor-credits", { scroll: false });
  };

  const handleVendorCreditUpdate = (updatedVendorCredit: VendorCredit) => {
    setVendorCredits(prev => 
      prev.map(credit => 
        credit._id === updatedVendorCredit._id ? updatedVendorCredit : credit
      )
    );
    if (selectedVendorCredit?._id === updatedVendorCredit._id) {
      setSelectedVendorCredit(updatedVendorCredit);
    }
  };

  const handleVendorCreditDelete = (creditId: string) => {
    setVendorCredits(prev => prev.filter(credit => credit._id !== creditId));
    if (selectedVendorCredit?._id === creditId) {
      setSelectedVendorCredit(null);
      setShowRightPanel(false);
      router.push("/dashboard/purchases/vendor-credits", { scroll: false });
    }
  };

  const handleBulkSelectionChange = (selectedIds: string[]) => {
    setSelectedVendorCreditIds(selectedIds);
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
    if (confirm(`Are you sure you want to delete ${selectedVendorCreditIds.length} vendor credits?`)) {
      // TODO: Implement bulk delete functionality
      console.log("Bulk delete for vendor credits:", selectedVendorCreditIds);
      setSelectedVendorCreditIds([]);
    }
  };

  const handleClearSelection = () => {
    setSelectedVendorCreditIds([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      {/* Main Content */}
      <div className="flex h-full">
        {/* Left Panel - Vendor Credits List */}
        <div
          className={`transition-all duration-300 ${
            showRightPanel ? "w-[30%]" : "w-full"
          }`}
        >
          <VendorCreditsSection
            vendorCredits={vendorCredits}
            selectedVendorCreditId={selectedVendorCredit?._id}
            onVendorCreditSelect={handleVendorCreditSelect}
            isCollapsed={showRightPanel}
            selectedVendorCreditIds={selectedVendorCreditIds}
            onBulkSelectionChange={handleBulkSelectionChange}
            onBulkImport={handleBulkImport}
            onBulkExport={handleBulkExport}
            onBulkDelete={handleBulkDelete}
            onClearSelection={handleClearSelection}
          />
        </div>

        {/* Right Panel - Vendor Credit Details */}
        {showRightPanel && selectedVendorCredit && (
          <div className="w-[70%] border-l border-gray-200 bg-white transition-all duration-300 ease-in-out overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedVendorCredit.creditNumber}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Credit Information
                  </h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Credit Number</dt>
                      <dd className="text-sm text-gray-900">{selectedVendorCredit.creditNumber}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Vendor</dt>
                      <dd className="text-sm text-gray-900">{selectedVendorCredit.vendorName}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Credit Date</dt>
                      <dd className="text-sm text-gray-900">
                        {new Date(selectedVendorCredit.creditDate).toLocaleDateString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Reason</dt>
                      <dd className="text-sm text-gray-900">{selectedVendorCredit.reason}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Description</dt>
                      <dd className="text-sm text-gray-900">{selectedVendorCredit.description || "No description"}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Status</dt>
                      <dd className="text-sm text-gray-900">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                          selectedVendorCredit.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                          selectedVendorCredit.status === 'issued' ? 'bg-blue-100 text-blue-800' :
                          selectedVendorCredit.status === 'applied' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {selectedVendorCredit.status.charAt(0).toUpperCase() + selectedVendorCredit.status.slice(1)}
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Financial Summary
                  </h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Total Amount</dt>
                      <dd className="text-sm text-gray-900 font-semibold">
                        ${selectedVendorCredit.amount}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Applied Amount</dt>
                      <dd className="text-sm text-gray-900">
                        ${selectedVendorCredit.appliedAmount}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Remaining Amount</dt>
                      <dd className="text-sm text-gray-900 font-semibold">
                        ${selectedVendorCredit.remainingAmount}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Currency</dt>
                      <dd className="text-sm text-gray-900">{selectedVendorCredit.currency}</dd>
                    </div>
                    {selectedVendorCredit.billNumber && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Related Bill</dt>
                        <dd className="text-sm text-gray-900">{selectedVendorCredit.billNumber}</dd>
                      </div>
                    )}
                    {selectedVendorCredit.reference && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Reference</dt>
                        <dd className="text-sm text-gray-900">{selectedVendorCredit.reference}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={handleCloseRightPanel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={async () => {
                    if (confirm("Are you sure you want to delete this vendor credit?")) {
                      try {
                        await vendorCreditService.deleteVendorCredit(selectedVendorCredit._id);
                        handleVendorCreditDelete(selectedVendorCredit._id);
                        const event = new CustomEvent("showToast", {
                          detail: {
                            message: "Vendor credit deleted successfully!",
                            type: "success",
                          },
                        });
                        window.dispatchEvent(event);
                      } catch (error) {
                        console.error("Error deleting vendor credit:", error);
                        const event = new CustomEvent("showToast", {
                          detail: {
                            message: "Failed to delete vendor credit. Please try again.",
                            type: "error",
                          },
                        });
                        window.dispatchEvent(event);
                      }
                    }
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
                >
                  Delete Vendor Credit
                </button>
                {selectedVendorCredit.status === 'issued' && (
                  <button
                    onClick={async () => {
                      try {
                        await vendorCreditService.updateVendorCreditStatus(selectedVendorCredit._id, 'applied');
                        const updatedCredit = { ...selectedVendorCredit, status: 'applied' as const };
                        handleVendorCreditUpdate(updatedCredit);
                        const event = new CustomEvent("showToast", {
                          detail: {
                            message: "Vendor credit marked as applied!",
                            type: "success",
                          },
                        });
                        window.dispatchEvent(event);
                      } catch (error) {
                        console.error("Error updating vendor credit status:", error);
                        const event = new CustomEvent("showToast", {
                          detail: {
                            message: "Failed to update vendor credit status. Please try again.",
                            type: "error",
                          },
                        });
                        window.dispatchEvent(event);
                      }
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
                  >
                    Mark as Applied
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Import Modal */}
      {showBulkImportModal && (
        <BulkImportModal
          selectedIds={selectedVendorCreditIds}
          type="vendor-credits"
          onClose={closeBulkImportModal}
        />
      )}

      {/* Bulk Export Modal */}
      {showBulkExportModal && (
        <BulkExportModal
          selectedIds={selectedVendorCreditIds}
          selectedData={vendorCredits.filter(vc => selectedVendorCreditIds.includes(vc._id))}
          type="vendor-credits"
          onClose={closeBulkExportModal}
        />
      )}
    </div>
  );
};

// Wrapped with access guard
const VendorCreditsPageWithGuard = () => (
  <ModuleAccessGuard moduleName="Purchases">
    <VendorCreditsPage />
  </ModuleAccessGuard>
);

export default VendorCreditsPageWithGuard;
