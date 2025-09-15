"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PurchaseOrdersSection from "./components/PurchaseOrdersSection";
import PurchaseOrderDetailsPanel from "./components/PurchaseOrderDetailsPanel";
import BulkImportModal from "@/components/modals/BulkImportModal";
import BulkExportModal from "@/components/modals/BulkExportModal";
import { PurchaseOrder, purchaseOrderService } from "@/services/purchaseOrderService";

const PurchaseOrdersPage = () => {
  const router = useRouter();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState<PurchaseOrder | null>(null);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPurchaseOrderIds, setSelectedPurchaseOrderIds] = useState<string[]>([]);

  useEffect(() => {
    const loadPurchaseOrders = async () => {
      try {
        setLoading(true);
        const data = await purchaseOrderService.getPurchaseOrders();
        setPurchaseOrders(data);
      } catch (err) {
        console.error("Error loading purchase orders:", err);
        setError("Failed to load purchase orders");
      } finally {
        setLoading(false);
      }
    };
    loadPurchaseOrders();
  }, []);

  const handlePurchaseOrderSelect = (purchaseOrder: PurchaseOrder) => {
    setSelectedPurchaseOrder(purchaseOrder);
    setShowRightPanel(true);
    router.push(`/dashboard/purchases/purchase-orders?order=${purchaseOrder._id}`, { scroll: false });
  };

  const handleCloseRightPanel = () => {
    setShowRightPanel(false);
    setSelectedPurchaseOrder(null);
    router.push("/dashboard/purchases/purchase-orders", { scroll: false });
  };

  const handlePurchaseOrderUpdate = (updatedPurchaseOrder: PurchaseOrder) => {
    setPurchaseOrders(prev => 
      prev.map(order => 
        order._id === updatedPurchaseOrder._id ? updatedPurchaseOrder : order
      )
    );
    if (selectedPurchaseOrder?._id === updatedPurchaseOrder._id) {
      setSelectedPurchaseOrder(updatedPurchaseOrder);
    }
  };

  const handlePurchaseOrderDelete = (orderId: string) => {
    setPurchaseOrders(prev => prev.filter(order => order._id !== orderId));
    if (selectedPurchaseOrder?._id === orderId) {
      setSelectedPurchaseOrder(null);
      setShowRightPanel(false);
      router.push("/dashboard/purchases/purchase-orders", { scroll: false });
    }
  };

  const handleBulkSelectionChange = (selectedIds: string[]) => {
    setSelectedPurchaseOrderIds(selectedIds);
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
    if (confirm(`Are you sure you want to delete ${selectedPurchaseOrderIds.length} purchase orders?`)) {
      // TODO: Implement bulk delete functionality
      console.log("Bulk delete for purchase orders:", selectedPurchaseOrderIds);
      setSelectedPurchaseOrderIds([]);
    }
  };

  const handleClearSelection = () => {
    setSelectedPurchaseOrderIds([]);
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
      <div className="flex h-full">
        <div
          className={`transition-all duration-300 ${
            showRightPanel ? "w-[30%]" : "w-full"
          }`}
        >
          <PurchaseOrdersSection
            purchaseOrders={purchaseOrders}
            selectedPurchaseOrderId={selectedPurchaseOrder?._id}
            onPurchaseOrderSelect={handlePurchaseOrderSelect}
            isCollapsed={showRightPanel}
            selectedPurchaseOrderIds={selectedPurchaseOrderIds}
            onBulkSelectionChange={handleBulkSelectionChange}
            onBulkImport={handleBulkImport}
            onBulkExport={handleBulkExport}
            onBulkDelete={handleBulkDelete}
            onClearSelection={handleClearSelection}
          />
        </div>

        {showRightPanel && selectedPurchaseOrder && (
          <div className="w-[70%] border-l border-gray-200 bg-white transition-all duration-300 ease-in-out overflow-hidden">
            <PurchaseOrderDetailsPanel
              purchaseOrder={selectedPurchaseOrder}
              onClose={handleCloseRightPanel}
              onUpdate={handlePurchaseOrderUpdate}
              onDelete={handlePurchaseOrderDelete}
            />
          </div>
        )}
      </div>

      {/* Bulk Import Modal */}
      {showBulkImportModal && (
        <BulkImportModal
          selectedIds={selectedPurchaseOrderIds}
          type="purchase-orders"
          onClose={closeBulkImportModal}
        />
      )}

      {/* Bulk Export Modal */}
      {showBulkExportModal && (
        <BulkExportModal
          selectedIds={selectedPurchaseOrderIds}
          selectedData={purchaseOrders.filter(po => selectedPurchaseOrderIds.includes(po._id))}
          type="purchase-orders"
          onClose={closeBulkExportModal}
        />
      )}
    </div>
  );
};

export default PurchaseOrdersPage;
