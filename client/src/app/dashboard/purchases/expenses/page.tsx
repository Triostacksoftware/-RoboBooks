"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/contexts/ToastContext";
import ModuleAccessGuard from "@/components/ModuleAccessGuard";
import ExpensesSection from "./components/ExpensesSection";
import ExpenseDetailsPanel from "./[id]/components/ExpenseDetailsPanel";
import BulkImportModal from "@/components/modals/BulkImportModal";
import BulkExportModal from "@/components/modals/BulkExportModal";
import { expenseService, Expense } from "@/services/expenseService";

const ExpensesPage = () => {
  const router = useRouter();
  const { addToast, removeToastsByType } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedExpenseIds, setSelectedExpenseIds] = useState<string[]>([]);

  // Load expenses
  useEffect(() => {
    const loadExpenses = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Remove any existing processing toasts
        removeToastsByType('info');
        
        // Show processing toast
        addToast({
          type: 'info',
          title: 'Loading...',
          message: 'Fetching expenses from server...',
          duration: 0 // Don't auto-dismiss processing toast
        });
        
        const data = await expenseService.getExpenses();
        setExpenses(data);
        
        // Remove processing toast
        removeToastsByType('info');
        
        // Show success toast (only if there were no expenses before)
        if (expenses.length === 0) {
          addToast({
            title: "Success",
            message: `Loaded ${data.length} expenses successfully`,
            type: "success",
            duration: 2000,
          });
        }
      } catch (err: any) {
        console.error("Error loading expenses:", err);
        setError("Failed to load expenses");
        
        // Remove processing toast on error
        removeToastsByType('info');
        
        addToast({
          title: "Error",
          message: "Failed to load expenses",
          type: "error",
          duration: 5000,
        });
      } finally {
        setLoading(false);
      }
    };

    loadExpenses();
  }, []);

  const handleExpenseSelect = (expense: Expense) => {
    setSelectedExpense(expense);
    setShowRightPanel(true);
    // Update URL without page reload
    router.push(`/dashboard/purchases/expenses?expense=${expense._id}`, { scroll: false });
  };

  const handleCloseRightPanel = () => {
    setShowRightPanel(false);
    setSelectedExpense(null);
    router.push("/dashboard/purchases/expenses", { scroll: false });
  };

  const handleExpenseUpdate = (updatedExpense: Expense) => {
    setExpenses(prev => 
      prev.map(expense => 
        expense._id === updatedExpense._id ? updatedExpense : expense
      )
    );
    if (selectedExpense?._id === updatedExpense._id) {
      setSelectedExpense(updatedExpense);
    }
  };

  const handleExpenseDelete = (expenseId: string) => {
    setExpenses(prev => prev.filter(expense => expense._id !== expenseId));
    if (selectedExpense?._id === expenseId) {
      setSelectedExpense(null);
      setShowRightPanel(false);
      router.push("/dashboard/purchases/expenses", { scroll: false });
    }
  };

  const handleBulkSelectionChange = (selectedIds: string[]) => {
    setSelectedExpenseIds(selectedIds);
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
    if (confirm(`Are you sure you want to delete ${selectedExpenseIds.length} expenses?`)) {
      // TODO: Implement bulk delete functionality
      console.log("Bulk delete for expenses:", selectedExpenseIds);
      setSelectedExpenseIds([]);
    }
  };

  const handleClearSelection = () => {
    setSelectedExpenseIds([]);
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
        {/* Left Panel - Expenses List */}
        <div
          className={`transition-all duration-300 ${
            showRightPanel ? "w-[30%]" : "w-full"
          }`}
        >
          <ExpensesSection
            expenses={expenses}
            selectedExpenseId={selectedExpense?._id}
            onExpenseSelect={handleExpenseSelect}
            isCollapsed={showRightPanel}
            selectedExpenseIds={selectedExpenseIds}
            onBulkSelectionChange={handleBulkSelectionChange}
            onBulkImport={handleBulkImport}
            onBulkExport={handleBulkExport}
            onBulkDelete={handleBulkDelete}
            onClearSelection={handleClearSelection}
          />
        </div>

        {/* Right Panel - Expense Details */}
        {showRightPanel && selectedExpense && (
          <div className="w-[70%] border-l border-gray-200 bg-white transition-all duration-300 ease-in-out overflow-hidden">
            <ExpenseDetailsPanel
              expense={selectedExpense}
              onClose={handleCloseRightPanel}
              onUpdate={handleExpenseUpdate}
              onDelete={handleExpenseDelete}
            />
          </div>
        )}
      </div>

      {/* Bulk Import Modal */}
      {showBulkImportModal && (
        <BulkImportModal
          selectedIds={selectedExpenseIds}
          type="expenses"
          onClose={closeBulkImportModal}
        />
      )}

      {/* Bulk Export Modal */}
      {showBulkExportModal && (
        <BulkExportModal
          selectedIds={selectedExpenseIds}
          selectedData={expenses.filter(expense => selectedExpenseIds.includes(expense._id))}
          type="expenses"
          onClose={closeBulkExportModal}
        />
      )}
    </div>
  );
};

// Wrapped with access guard
const ExpensesPageWithGuard = () => (
  <ModuleAccessGuard moduleName="Purchases">
    <ExpensesPage />
  </ModuleAccessGuard>
);

export default ExpensesPageWithGuard;
