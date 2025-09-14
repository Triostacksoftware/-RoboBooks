"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PurchaseOrdersSection from "./components/PurchaseOrdersSection";
import PurchaseOrderDetailsPanel from "./components/PurchaseOrderDetailsPanel";
import { PurchaseOrder, purchaseOrderService } from "@/services/purchaseOrderService";

const PurchaseOrdersPage = () => {
  const router = useRouter();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState<PurchaseOrder | null>(null);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    <div className="p-6">
      <div className="flex -mt-6">
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
    </div>
  );
};

export default PurchaseOrdersPage;
