/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import PaymentsReceivedEmpty from "./components/PaymentsReceivedEmpty";
import PaymentsReceivedTable from "./components/PaymentsReceivedTable";
import PaymentsReceivedHeader from "./components/PaymentsReceivedHeader";
import NewPaymentModal from "./components/NewPaymentModal";
import PaymentDetailsPanel from "./components/PaymentDetailsPanel";
import {
  paymentService,
  Payment,
  CreatePaymentRequest,
} from "@/services/paymentService";
import { customerService, Customer } from "@/services/customerService";
import { invoiceService, Invoice } from "@/services/invoiceService";
import { bankAccountService, BankAccount } from "@/services/bankAccountService";
import {
  paymentsRealTimeService,
  PaymentUpdate,
} from "@/services/realTimeService";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function PaymentsReceivedPage() {
  const [hasPayments, setHasPayments] = useState(true);
  const [showNewPaymentModal, setShowNewPaymentModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);

  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real-time refresh states
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds default

  // Real-time connection states
  const [realTimeStatus, setRealTimeStatus] = useState<
    "disconnected" | "connecting" | "connected" | "reconnecting"
  >("disconnected");
  const [lastRealTimeMessage, setLastRealTimeMessage] = useState<Date | null>(
    null
  );

  // Related data for dropdowns
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);

  // Refs for managing intervals and timeouts
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastDataHashRef = useRef<string>("");
  const realTimeUnsubscribeRef = useRef<(() => void) | null>(null);

  // Generate a hash of the current data to detect changes
  const generateDataHash = useCallback((data: Payment[]) => {
    if (!data || data.length === 0) return "empty";
    return JSON.stringify(
      data.map((p) => ({
        _id: p._id,
        updatedAt: p.updatedAt,
        status: p.status,
        amount: p.amount,
      }))
    );
  }, []);

  // Check if data has changed
  const hasDataChanged = useCallback(
    (newData: Payment[]) => {
      const newHash = generateDataHash(newData);
      const hasChanged = newHash !== lastDataHashRef.current;
      if (hasChanged) {
        lastDataHashRef.current = newHash;
      }
      return hasChanged;
    },
    [generateDataHash]
  );

  // Handle real-time payment updates
  const handleRealTimeUpdate = useCallback(
    (update: PaymentUpdate) => {
      console.log("📨 Real-time payment update received:", update);
      setLastRealTimeMessage(new Date());

      switch (update.type) {
        case "payment_created":
          // Add new payment to the list
          setPayments((prev) => [update.payment, ...prev]);
          setHasPayments(true);
          break;

        case "payment_updated":
          // Update existing payment
          setPayments((prev) =>
            prev.map((p) => (p._id === update.payment._id ? update.payment : p))
          );

          // Update selected payment if it's the one being updated
          if (selectedPayment?._id === update.payment._id) {
            setSelectedPayment(update.payment);
          }
          break;

        case "payment_deleted":
          // Remove deleted payment
          setPayments((prev) =>
            prev.filter((p) => p._id !== update.payment._id)
          );

          // Clear selection if deleted payment was selected
          if (selectedPayment?._id === update.payment._id) {
            setSelectedPayment(null);
            setShowRightPanel(false);
          }

          // Check if we still have payments
          setHasPayments((prev) => {
            const remainingPayments = payments.filter(
              (p) => p._id !== update.payment._id
            );
            return remainingPayments.length > 0;
          });
          break;
      }

      // Update last refresh time
      setLastRefreshTime(new Date());
    },
    [selectedPayment]
  );

  // Setup real-time connection
  const setupRealTimeConnection = useCallback(async () => {
    try {
      console.log("🔌 Setting up real-time connection...");
      setRealTimeStatus("connecting");

      // Subscribe to payment updates
      const unsubscribe = paymentsRealTimeService.subscribe(
        "payment_update",
        handleRealTimeUpdate
      );
      realTimeUnsubscribeRef.current = unsubscribe;

      // Connect to real-time service
      await paymentsRealTimeService.connect();
      setRealTimeStatus("connected");

      console.log("✅ Real-time connection established");
    } catch (error) {
      console.error("❌ Failed to setup real-time connection:", error);
      setRealTimeStatus("disconnected");

      // Fallback to polling if real-time fails
      console.log("🔄 Falling back to polling mode");
      handleToggleAutoRefresh(true);
    }
  }, [handleRealTimeUpdate, autoRefresh]);

  // Fetch payments with real-time optimization
  const fetchPayments = useCallback(
    async (isSilent = false) => {
      try {
        if (!isSilent) {
          setIsRefreshing(true);
        }
        setError(null);

        console.log("🔍 Fetching payments...");
        console.log(
          "🔍 Current token:",
          typeof window !== "undefined"
            ? localStorage.getItem("token")
            : "No window"
        );

        const response = await paymentService.getPayments();

        console.log("🔍 API Response:", response);
        console.log("🔍 Response data:", response.data);

        // Handle both response structures for backward compatibility
        const paymentsData = response.data?.data || response.data || [];
        console.log("🔍 Extracted payments data:", paymentsData);
        console.log("🔍 Is array:", Array.isArray(paymentsData));
        console.log(
          "🔍 Data length:",
          Array.isArray(paymentsData) ? paymentsData.length : "Not an array"
        );

        const newPayments = Array.isArray(paymentsData) ? paymentsData : [];

        // Check if data has actually changed
        if (hasDataChanged(newPayments)) {
          setPayments(newPayments);
          setHasPayments(newPayments.length > 0);
          setLastRefreshTime(new Date());

          if (!isSilent) {
            console.log("🔄 Data updated - new payments detected");
          }
        } else if (!isSilent) {
          console.log("🔄 Data unchanged - no updates needed");
        }

        console.log("🔍 Final payments state:", newPayments);
        console.log("🔍 Has payments:", newPayments.length > 0);

        // Always set loading to false when data is fetched successfully
        setIsLoading(false);
      } catch (err: any) {
        console.error("❌ Failed to fetch payments:", err);
        console.error("❌ Error response:", err.response);
        console.error("❌ Error status:", err.response?.status);
        console.error("❌ Error data:", err.response?.data);
        console.error("❌ Error message:", err.message);

        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to load payments. Please try again.";
        setError(errorMessage);
        setHasPayments(false);
        // Set empty arrays as fallback to prevent further errors
        setPayments([]);
        // Set loading to false on error as well
        setIsLoading(false);
      } finally {
        if (!isSilent) {
          setIsRefreshing(false);
        }
      }
    },
    [hasDataChanged]
  );

  // Fetch related data
  const fetchRelatedData = useCallback(async () => {
    try {
      // Fetch customers, invoices, and bank accounts in parallel
      const [customersResponse, invoicesResponse, bankAccountsResponse] =
        await Promise.allSettled([
          customerService.getCustomers(),
          invoiceService.getInvoices(),
          bankAccountService.getBankAccounts(),
        ]);

      // Handle successful responses
      if (customersResponse.status === "fulfilled") {
        const customersData =
          customersResponse.value.data?.data ||
          customersResponse.value.data ||
          [];
        setCustomers(Array.isArray(customersData) ? customersData : []);
      } else {
        console.warn("Failed to fetch customers:", customersResponse.reason);
        setCustomers([]);
      }

      if (invoicesResponse.status === "fulfilled") {
        const invoicesData =
          invoicesResponse.value.data?.data ||
          invoicesResponse.value.data ||
          [];
        setInvoices(Array.isArray(invoicesData) ? invoicesData : []);
      } else {
        console.warn("Failed to fetch invoices:", invoicesResponse.reason);
        setInvoices([]);
      }

      if (bankAccountsResponse.status === "fulfilled") {
        const bankAccountsData =
          bankAccountsResponse.value.data?.data ||
          bankAccountsResponse.value.data ||
          [];
        setBankAccounts(
          Array.isArray(bankAccountsData) ? bankAccountsData : []
        );
      } else {
        console.warn(
          "Failed to fetch bank accounts:",
          bankAccountsResponse.reason
        );
        setBankAccounts([]);
      }
    } catch (err: any) {
      console.error("Failed to fetch related data:", err);
      // Don't set error here as it's not critical for the main functionality
      // But log it for debugging and set empty arrays as fallback
      const errorMessage = err.response?.data?.message || err.message;
      console.warn("Related data fetch warning:", errorMessage);
      setCustomers([]);
      setInvoices([]);
      setBankAccounts([]);
    }
  }, []);

  // Handle auto-refresh toggle
  const handleToggleAutoRefresh = useCallback(
    (enabled: boolean) => {
      setAutoRefresh(enabled);

      if (enabled) {
        console.log("🔄 Auto-refresh enabled - starting interval");
        // Start the refresh interval
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
        refreshIntervalRef.current = setInterval(() => {
          console.log("🔄 Auto-refresh triggered");
          fetchPayments(true); // Silent refresh
        }, refreshInterval);
      } else {
        console.log("🔄 Auto-refresh disabled - stopping interval");
        // Stop the refresh interval
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
          refreshIntervalRef.current = null;
        }
      }
    },
    [fetchPayments, refreshInterval]
  );

  // Handle manual refresh
  const handleRefresh = useCallback(async () => {
    console.log("🔄 Manual refresh triggered");
    await fetchPayments(false); // Non-silent refresh
    await fetchRelatedData(); // Also refresh related data
  }, [fetchPayments, fetchRelatedData]);

  // Setup auto-refresh interval when component mounts
  useEffect(() => {
    if (autoRefresh) {
      handleToggleAutoRefresh(true);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh, handleToggleAutoRefresh]);

  // Setup real-time connection on mount
  useEffect(() => {
    // Try to setup real-time connection, but don't block the UI
    const initRealTime = async () => {
      try {
        await setupRealTimeConnection();
      } catch (error) {
        console.warn(
          "Real-time connection failed, continuing with polling mode"
        );
        // Enable auto-refresh as fallback
        setAutoRefresh(true);
      }
    };

    initRealTime();

    return () => {
      // Cleanup real-time connection
      if (realTimeUnsubscribeRef.current) {
        realTimeUnsubscribeRef.current();
      }
      paymentsRealTimeService.disconnect();
    };
  }, [setupRealTimeConnection]);

  // Fetch payments on component mount
  useEffect(() => {
    console.log("🔄 useEffect triggered - fetching payments and related data");
    console.log("🔄 Component mounted, calling fetchPayments()");
    fetchPayments();
    fetchRelatedData();
  }, [fetchPayments, fetchRelatedData]);

  // Monitor localStorage changes
  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem("token");
      console.log(
        "🔑 Token check - Current token:",
        token ? `${token.substring(0, 20)}...` : "No token"
      );
    };

    // Check token on mount
    checkToken();

    // Check token every 2 seconds to see if it's being cleared
    const interval = setInterval(checkToken, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleNewPayment = () => {
    setShowNewPaymentModal(true);
  };

  const handleCloseModal = () => {
    setShowNewPaymentModal(false);
    setShowEditModal(false);
    setEditingPayment(null);
  };

  const handlePaymentCreated = async (paymentData: CreatePaymentRequest) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const newPayment = await paymentService.createPayment(paymentData);

      // Handle response structure for backward compatibility
      const payment = newPayment.data;
      if (payment) {
        setPayments([payment, ...payments]);
        setHasPayments(true);
        setShowNewPaymentModal(false);

        // Refresh related data to ensure consistency
        await fetchRelatedData();

        // Update last refresh time
        setLastRefreshTime(new Date());
      } else {
        throw new Error("Invalid payment response structure");
      }
    } catch (err: any) {
      console.error("Failed to create payment:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to create payment. Please try again.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPayment = (payment: Payment) => {
    setEditingPayment(payment);
    setShowEditModal(true);
  };

  const handlePaymentUpdated = async (updatedPayment: CreatePaymentRequest) => {
    if (!editingPayment) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await paymentService.updatePayment(
        editingPayment._id,
        updatedPayment
      );

      // Handle response structure for backward compatibility
      const updatedPaymentData = response.data;
      if (updatedPaymentData) {
        setPayments(
          payments.map((p) =>
            p._id === updatedPaymentData._id ? updatedPaymentData : p
          )
        );
        setShowEditModal(false);
        setEditingPayment(null);

        // Update selected payment if it's the one being edited
        if (selectedPayment?._id === updatedPaymentData._id) {
          setSelectedPayment(updatedPaymentData);
        }

        // Refresh related data to ensure consistency
        await fetchRelatedData();

        // Update last refresh time
        setLastRefreshTime(new Date());
      } else {
        throw new Error("Invalid update response structure");
      }
    } catch (err: any) {
      console.error("Failed to update payment:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to update payment. Please try again.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this payment? This action cannot be undone."
      )
    ) {
      setIsDeleting(paymentId);

      try {
        setError(null);
        await paymentService.deletePayment(paymentId);

        setPayments(payments.filter((p) => p._id !== paymentId));

        // Clear selection if deleted payment was selected
        if (selectedPayment?._id === paymentId) {
          setSelectedPayment(null);
          setShowRightPanel(false);
        }

        if (payments.length === 1) {
          setHasPayments(false);
        }

        console.log("Payment deleted successfully");

        // Update last refresh time
        setLastRefreshTime(new Date());
      } catch (error: any) {
        console.error("Failed to delete payment:", error);
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to delete payment. Please try again.";
        setError(errorMessage);
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const handlePaymentRowClick = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowRightPanel(true);
  };

  const handleCloseRightPanel = () => {
    setShowRightPanel(false);
    setSelectedPayment(null);
  };

  const toggleHeader = () => {
    setIsHeaderCollapsed(!isHeaderCollapsed);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payments...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchPayments()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Collapsible Header */}
        <div
          className={`transition-all duration-300 ease-in-out ${
            isHeaderCollapsed ? "h-16" : "h-auto"
          }`}
        >
          <div
            className={`transition-all duration-300 ${
              showRightPanel ? "w-[25%]" : "w-full"
            }`}
          >
            <PaymentsReceivedHeader
              onNewPayment={handleNewPayment}
              hasPayments={hasPayments}
              onToggleCollapse={toggleHeader}
              isCollapsed={isHeaderCollapsed}
              containerWidth={showRightPanel ? "w-[25%]" : "w-full"}
              onRefresh={handleRefresh}
              isRefreshing={isRefreshing}
              autoRefresh={autoRefresh}
              onToggleAutoRefresh={handleToggleAutoRefresh}
            />
          </div>
        </div>

        {/* Real-time status indicator */}
        {(autoRefresh || realTimeStatus === "connected") && (
          <div className="bg-blue-50 border-b border-blue-200 px-6 py-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    realTimeStatus === "connected"
                      ? "bg-green-500 animate-pulse"
                      : "bg-blue-500"
                  }`}
                ></div>
                <span className="text-blue-700">
                  {realTimeStatus === "connected"
                    ? "Real-time updates enabled"
                    : "Auto-refresh enabled"}
                </span>
                {lastRefreshTime && (
                  <span className="text-blue-600">
                    Last updated: {lastRefreshTime.toLocaleTimeString()}
                  </span>
                )}
                {realTimeStatus === "connected" && lastRealTimeMessage && (
                  <span className="text-green-600">
                    Last real-time: {lastRealTimeMessage.toLocaleTimeString()}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {realTimeStatus === "connected" ? (
                  <span className="text-green-600">
                    Real-time connection active
                  </span>
                ) : (
                  <>
                    <span className="text-blue-600">
                      Refresh interval: {refreshInterval / 1000}s
                    </span>
                    <button
                      onClick={() =>
                        setRefreshInterval((prev) =>
                          prev === 30000 ? 60000 : 30000
                        )
                      }
                      className="text-blue-600 hover:text-blue-800 text-xs underline"
                    >
                      {refreshInterval === 30000
                        ? "Switch to 1min"
                        : "Switch to 30s"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {!hasPayments ? (
          <PaymentsReceivedEmpty onNewPayment={handleNewPayment} />
        ) : (
          <div className="flex -mt-4">
            {/* Left Panel - Payments Table */}
            <div
              className={`transition-all duration-300 ${
                showRightPanel ? "w-[25%]" : "w-full"
              }`}
            >
              <PaymentsReceivedTable
                payments={payments}
                onNewPayment={handleNewPayment}
                onEditPayment={handleEditPayment}
                onDeletePayment={handleDeletePayment}
                onPaymentRowClick={handlePaymentRowClick}
                selectedPaymentId={selectedPayment?._id}
                isDeleting={isDeleting}
                isCollapsed={showRightPanel}
              />
            </div>

            {/* Right Panel - Payment Details */}
            {showRightPanel && selectedPayment && (
              <div className="w-[75%] border-l border-gray-200 bg-white transition-all duration-300 ease-in-out overflow-hidden">
                <PaymentDetailsPanel
                  payment={selectedPayment}
                  onClose={handleCloseRightPanel}
                  onEdit={handleEditPayment}
                  onDelete={handleDeletePayment}
                />
              </div>
            )}
          </div>
        )}

        {showNewPaymentModal && (
          <NewPaymentModal
            onClose={handleCloseModal}
            onPaymentCreated={handlePaymentCreated}
            customers={customers}
            invoices={invoices}
            bankAccounts={bankAccounts}
            isSubmitting={isSubmitting}
          />
        )}

        {showEditModal && editingPayment && (
          <NewPaymentModal
            onClose={handleCloseModal}
            onPaymentCreated={handlePaymentUpdated}
            isEditing={true}
            initialData={editingPayment}
            customers={customers}
            invoices={invoices}
            bankAccounts={bankAccounts}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}
