"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BillsSection from "./components/BillsSection";
import BillDetailsPanel from "./components/BillDetailsPanel";
import BulkImportModal from "@/components/modals/BulkImportModal";
import BulkExportModal from "@/components/modals/BulkExportModal";
import { Bill, billService } from "@/services/billService";

const BillsPage = () => {
  const router = useRouter();
  const [bills, setBills] = useState<Bill[]>([]);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBillIds, setSelectedBillIds] = useState<string[]>([]);

  // Load bills
  useEffect(() => {
    const loadBills = async () => {
      try {
        setLoading(true);
        const data = await billService.getBills();
        setBills(data);
      } catch (err) {
        console.error("Error loading bills:", err);
        setError("Failed to load bills");
      } finally {
        setLoading(false);
      }
    };

    loadBills();
  }, []);

  const handleBillSelect = (bill: Bill) => {
    setSelectedBill(bill);
    setShowRightPanel(true);
    // Update URL without page reload
    router.push(`/dashboard/purchases/bills?bill=${bill._id}`, { scroll: false });
  };

  const handleCloseRightPanel = () => {
    setShowRightPanel(false);
    setSelectedBill(null);
    router.push("/dashboard/purchases/bills", { scroll: false });
  };

  const handleBillUpdate = (updatedBill: Bill) => {
    setBills(prev => 
      prev.map(bill => 
        bill._id === updatedBill._id ? updatedBill : bill
      )
    );
    if (selectedBill?._id === updatedBill._id) {
      setSelectedBill(updatedBill);
    }
  };

  const handleBillDelete = (billId: string) => {
    setBills(prev => prev.filter(bill => bill._id !== billId));
    if (selectedBill?._id === billId) {
      setSelectedBill(null);
      setShowRightPanel(false);
      router.push("/dashboard/purchases/bills", { scroll: false });
    }
  };

  const handleBulkSelectionChange = (selectedIds: string[]) => {
    setSelectedBillIds(selectedIds);
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
    if (confirm(`Are you sure you want to delete ${selectedBillIds.length} bills?`)) {
      // TODO: Implement bulk delete functionality
      console.log("Bulk delete for bills:", selectedBillIds);
      setSelectedBillIds([]);
    }
  };

  const handleClearSelection = () => {
    setSelectedBillIds([]);
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
        {/* Left Panel - Bills List */}
        <div
          className={`transition-all duration-300 ${
            showRightPanel ? "w-[30%]" : "w-full"
          }`}
        >
          <BillsSection
            bills={bills}
            selectedBillId={selectedBill?._id}
            onBillSelect={handleBillSelect}
            isCollapsed={showRightPanel}
            selectedBillIds={selectedBillIds}
            onBulkSelectionChange={handleBulkSelectionChange}
            onBulkImport={handleBulkImport}
            onBulkExport={handleBulkExport}
            onBulkDelete={handleBulkDelete}
            onClearSelection={handleClearSelection}
          />
        </div>

        {/* Right Panel - Bill Details */}
        {showRightPanel && selectedBill && (
          <div className="w-[70%] border-l border-gray-200 bg-white transition-all duration-300 ease-in-out overflow-hidden">
            <BillDetailsPanel
              bill={selectedBill}
              onClose={handleCloseRightPanel}
              onUpdate={handleBillUpdate}
              onDelete={handleBillDelete}
            />
          </div>
        )}
      </div>

      {/* Bulk Import Modal */}
      {showBulkImportModal && (
        <BulkImportModal
          selectedIds={selectedBillIds}
          type="bills"
          onClose={closeBulkImportModal}
        />
      )}

      {/* Bulk Export Modal */}
      {showBulkExportModal && (
        <BulkExportModal
          selectedIds={selectedBillIds}
          selectedData={bills.filter(bill => selectedBillIds.includes(bill._id))}
          type="bills"
          onClose={closeBulkExportModal}
        />
      )}
    </div>
  );
};

export default BillsPage;
