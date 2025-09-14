"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import RecurringBillsSection from './components/RecurringBillsSection';
import { RecurringBill, recurringBillService } from "@/services/recurringBillService";

const RecurringBillsPage = () => {
  const router = useRouter();
  const [recurringBills, setRecurringBills] = useState<RecurringBill[]>([]);
  const [selectedRecurringBill, setSelectedRecurringBill] = useState<RecurringBill | null>(null);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load recurring bills
  useEffect(() => {
    const loadRecurringBills = async () => {
      try {
        setLoading(true);
        const data = await recurringBillService.getRecurringBills();
        setRecurringBills(data);
      } catch (err) {
        console.error("Error loading recurring bills:", err);
        setError("Failed to load recurring bills");
      } finally {
        setLoading(false);
      }
    };

    loadRecurringBills();
  }, []);

  const handleRecurringBillSelect = (recurringBill: RecurringBill) => {
    setSelectedRecurringBill(recurringBill);
    setShowRightPanel(true);
    // Update URL without page reload
    router.push(`/dashboard/purchases/recurring-bills?bill=${recurringBill._id}`, { scroll: false });
  };

  const handleCloseRightPanel = () => {
    setShowRightPanel(false);
    setSelectedRecurringBill(null);
    router.push("/dashboard/purchases/recurring-bills", { scroll: false });
  };

  const handleRecurringBillUpdate = (updatedRecurringBill: RecurringBill) => {
    setRecurringBills(prev => 
      prev.map(bill => 
        bill._id === updatedRecurringBill._id ? updatedRecurringBill : bill
      )
    );
    if (selectedRecurringBill?._id === updatedRecurringBill._id) {
      setSelectedRecurringBill(updatedRecurringBill);
    }
  };

  const handleRecurringBillDelete = (billId: string) => {
    setRecurringBills(prev => prev.filter(bill => bill._id !== billId));
    if (selectedRecurringBill?._id === billId) {
      setSelectedRecurringBill(null);
      setShowRightPanel(false);
      router.push("/dashboard/purchases/recurring-bills", { scroll: false });
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
      {/* Main Content */}
      <div className="flex -mt-6">
        {/* Left Panel - Recurring Bills List */}
        <div
          className={`transition-all duration-300 ${
            showRightPanel ? "w-[30%]" : "w-full"
          }`}
        >
          <RecurringBillsSection
            recurringBills={recurringBills}
            selectedRecurringBillId={selectedRecurringBill?._id}
            onRecurringBillSelect={handleRecurringBillSelect}
            isCollapsed={showRightPanel}
          />
        </div>

        {/* Right Panel - Recurring Bill Details */}
        {showRightPanel && selectedRecurringBill && (
          <div className="w-[70%] border-l border-gray-200 bg-white transition-all duration-300 ease-in-out overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedRecurringBill.name}
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
                    Recurring Bill Information
                  </h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Name</dt>
                      <dd className="text-sm text-gray-900">{selectedRecurringBill.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Description</dt>
                      <dd className="text-sm text-gray-900">{selectedRecurringBill.description || "No description"}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Vendor</dt>
                      <dd className="text-sm text-gray-900">{selectedRecurringBill.vendorName}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Amount</dt>
                      <dd className="text-sm text-gray-900">${selectedRecurringBill.amount}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Frequency</dt>
                      <dd className="text-sm text-gray-900">
                        {selectedRecurringBill.frequency.charAt(0).toUpperCase() + selectedRecurringBill.frequency.slice(1)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Category</dt>
                      <dd className="text-sm text-gray-900">{selectedRecurringBill.category}</dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Schedule Details
                  </h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Start Date</dt>
                      <dd className="text-sm text-gray-900">
                        {new Date(selectedRecurringBill.startDate).toLocaleDateString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">End Date</dt>
                      <dd className="text-sm text-gray-900">
                        {selectedRecurringBill.endDate ? new Date(selectedRecurringBill.endDate).toLocaleDateString() : 'No end date'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Next Due Date</dt>
                      <dd className="text-sm text-gray-900">
                        {new Date(selectedRecurringBill.nextDueDate).toLocaleDateString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Status</dt>
                      <dd className="text-sm text-gray-900">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          selectedRecurringBill.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedRecurringBill.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Processed Occurrences</dt>
                      <dd className="text-sm text-gray-900">
                        {selectedRecurringBill.processedOccurrences || 0} / {selectedRecurringBill.totalOccurrences || '∞'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Account</dt>
                      <dd className="text-sm text-gray-900">{selectedRecurringBill.account}</dd>
                    </div>
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
                    if (confirm("Are you sure you want to delete this recurring bill?")) {
                      try {
                        await recurringBillService.deleteRecurringBill(selectedRecurringBill._id);
                        handleRecurringBillDelete(selectedRecurringBill._id);
                        const event = new CustomEvent("showToast", {
                          detail: {
                            message: "Recurring bill deleted successfully!",
                            type: "success",
                          },
                        });
                        window.dispatchEvent(event);
                      } catch (error) {
                        console.error("Error deleting recurring bill:", error);
                        const event = new CustomEvent("showToast", {
                          detail: {
                            message: "Failed to delete recurring bill. Please try again.",
                            type: "error",
                          },
                        });
                        window.dispatchEvent(event);
                      }
                    }
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
                >
                  Delete Recurring Bill
                </button>
                <button
                  onClick={async () => {
                    try {
                      await recurringBillService.toggleRecurringBill(selectedRecurringBill._id, !selectedRecurringBill.isActive);
                      const updatedBill = { ...selectedRecurringBill, isActive: !selectedRecurringBill.isActive };
                      handleRecurringBillUpdate(updatedBill);
                      const event = new CustomEvent("showToast", {
                        detail: {
                          message: `Recurring bill ${!selectedRecurringBill.isActive ? 'activated' : 'deactivated'} successfully!`,
                          type: "success",
                        },
                      });
                      window.dispatchEvent(event);
                    } catch (error) {
                      console.error("Error toggling recurring bill:", error);
                      const event = new CustomEvent("showToast", {
                        detail: {
                          message: "Failed to toggle recurring bill. Please try again.",
                          type: "error",
                        },
                      });
                      window.dispatchEvent(event);
                    }
                  }}
                  className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md ${
                    selectedRecurringBill.isActive 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {selectedRecurringBill.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecurringBillsPage;
