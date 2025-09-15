"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PaymentsMadeSection from "./components/PaymentsMadeSection";
import PaymentDetailsPanel from "./components/PaymentDetailsPanel";
import BulkImportModal from "@/components/modals/BulkImportModal";
import BulkExportModal from "@/components/modals/BulkExportModal";
import { Payment, paymentService } from "@/services/paymentService";

const PaymentsMadePage = () => {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPaymentIds, setSelectedPaymentIds] = useState<string[]>([]);

  // Load payments
  useEffect(() => {
    const loadPayments = async () => {
      try {
        setLoading(true);
        const data = await paymentService.getPayments();
        setPayments(data);
      } catch (err) {
        console.error("Error loading payments:", err);
        setError("Failed to load payments");
      } finally {
        setLoading(false);
      }
    };

    loadPayments();
  }, []);

  const handlePaymentSelect = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowRightPanel(true);
    // Update URL without page reload
    router.push(`/dashboard/purchases/payments-made?payment=${payment._id}`, { scroll: false });
  };

  const handleCloseRightPanel = () => {
    setShowRightPanel(false);
    setSelectedPayment(null);
    router.push("/dashboard/purchases/payments-made", { scroll: false });
  };

  const handlePaymentUpdate = (updatedPayment: Payment) => {
    setPayments(prev => 
      prev.map(payment => 
        payment._id === updatedPayment._id ? updatedPayment : payment
      )
    );
    if (selectedPayment?._id === updatedPayment._id) {
      setSelectedPayment(updatedPayment);
    }
  };

  const handlePaymentDelete = (paymentId: string) => {
    setPayments(prev => prev.filter(payment => payment._id !== paymentId));
    if (selectedPayment?._id === paymentId) {
      setSelectedPayment(null);
      setShowRightPanel(false);
      router.push("/dashboard/purchases/payments-made", { scroll: false });
    }
  };

  const handleBulkSelectionChange = (selectedIds: string[]) => {
    setSelectedPaymentIds(selectedIds);
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
    if (confirm(`Are you sure you want to delete ${selectedPaymentIds.length} payments?`)) {
      // TODO: Implement bulk delete functionality
      console.log("Bulk delete for payments:", selectedPaymentIds);
      setSelectedPaymentIds([]);
    }
  };

  const handleClearSelection = () => {
    setSelectedPaymentIds([]);
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
        {/* Left Panel - Payments List */}
        <div
          className={`transition-all duration-300 ${
            showRightPanel ? "w-[30%]" : "w-full"
          }`}
        >
          <PaymentsMadeSection
            payments={payments}
            selectedPaymentId={selectedPayment?._id}
            onPaymentSelect={handlePaymentSelect}
            isCollapsed={showRightPanel}
            selectedPaymentIds={selectedPaymentIds}
            onBulkSelectionChange={handleBulkSelectionChange}
            onBulkImport={handleBulkImport}
            onBulkExport={handleBulkExport}
            onBulkDelete={handleBulkDelete}
            onClearSelection={handleClearSelection}
          />
        </div>

        {/* Right Panel - Payment Details */}
        {showRightPanel && selectedPayment && (
          <div className="w-[70%] border-l border-gray-200 bg-white transition-all duration-300 ease-in-out overflow-hidden">
            <PaymentDetailsPanel
              payment={selectedPayment}
              onClose={handleCloseRightPanel}
              onUpdate={handlePaymentUpdate}
              onDelete={handlePaymentDelete}
            />
          </div>
        )}
      </div>

      {/* Bulk Import Modal */}
      {showBulkImportModal && (
        <BulkImportModal
          selectedIds={selectedPaymentIds}
          type="payments"
          onClose={closeBulkImportModal}
        />
      )}

      {/* Bulk Export Modal */}
      {showBulkExportModal && (
        <BulkExportModal
          selectedIds={selectedPaymentIds}
          selectedData={payments.filter(payment => selectedPaymentIds.includes(payment._id))}
          type="payments"
          onClose={closeBulkExportModal}
        />
      )}
    </div>
  );
};

export default PaymentsMadePage;
