"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/contexts/ToastContext";
import ModuleAccessGuard from "@/components/ModuleAccessGuard";
import ExpensesSection from "./components/ExpensesSection";
import ExpenseDetailsPanel from "./[id]/components/ExpenseDetailsPanel";
import ExpenseHistoryPanel from "./[id]/components/ExpenseHistoryPanel";
import BulkImportModal from "@/components/modals/BulkImportModal";
import BulkExportModal from "@/components/modals/BulkExportModal";
import { expenseService, Expense } from "@/services/expenseService";

const ExpensesPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showMixedResultsToast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedExpenseIds, setSelectedExpenseIds] = useState<string[]>([]);

  // Load expenses
  useEffect(() => {
    const loadExpenses = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await expenseService.getExpenses();
        setExpenses(data);
        
        // Show consolidated toast with count
        showMixedResultsToast(data.length, 0, "expenses");
      } catch (err: any) {
        console.error("Error loading expenses:", err);
        setError("Failed to load expenses");
        
        // Show consolidated error toast
        showMixedResultsToast(0, 1, "expenses");
      } finally {
        setLoading(false);
      }
    };

    loadExpenses();
  }, []);

  // Handle URL parameters for expense selection and history opening
  useEffect(() => {
    const expenseId = searchParams.get('expense');
    const openHistory = searchParams.get('openHistory');
    
    if (expenseId && expenses.length > 0) {
      const expense = expenses.find(exp => exp._id === expenseId);
      if (expense) {
        setSelectedExpense(expense);
        setShowRightPanel(true);
      }
    } else if (openHistory === 'true' && expenses.length > 0) {
      // If openHistory is true, select the first expense and open history panel
      const firstExpense = expenses[0];
      if (firstExpense) {
        setSelectedExpense(firstExpense);
        setShowRightPanel(true);
        setShowHistoryPanel(true);
      }
    }
  }, [searchParams, expenses]);

  const handleExpenseSelect = (expense: Expense) => {
    setSelectedExpense(expense);
    setShowRightPanel(true);
    // Update URL without page reload
    router.push(`/dashboard/purchases/expenses?expense=${expense._id}`, { scroll: false });
  };

  const handleCloseRightPanel = () => {
    setShowRightPanel(false);
    setShowHistoryPanel(false);
    setSelectedExpense(null);
    router.push("/dashboard/purchases/expenses", { scroll: false });
  };

  const handleOpenHistory = () => {
    setShowHistoryPanel(true);
  };

  const handleCloseHistory = () => {
    setShowHistoryPanel(false);
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

  const handleExpenseCreate = (newExpense: Expense) => {
    setExpenses(prev => [newExpense, ...prev]);
  };

  const refreshExpenses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await expenseService.getExpenses();
      setExpenses(data);
    } catch (err: any) {
      console.error("Error refreshing expenses:", err);
      setError("Failed to refresh expenses");
    } finally {
      setLoading(false);
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
          className={`transition-all duration-300 flex-shrink-0 ${
            showRightPanel && showHistoryPanel ? "w-[25%]" :
            showRightPanel ? "w-[35%]" : "w-full"
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

        {/* Middle Panel - Expense Details */}
        {showRightPanel && selectedExpense && (
          <div className={`border-l border-gray-200 bg-white transition-all duration-300 ease-in-out overflow-hidden flex-shrink-0 ${
            showHistoryPanel ? "w-[40%]" : "w-[65%]"
          }`}>
            <ExpenseDetailsPanel
              expense={selectedExpense}
              onClose={handleCloseRightPanel}
              onUpdate={handleExpenseUpdate}
              onDelete={handleExpenseDelete}
              onCreate={handleExpenseCreate}
              onRefresh={refreshExpenses}
              onOpenHistory={handleOpenHistory}
            />
          </div>
        )}

        {/* Right Panel - Expense History */}
        {showHistoryPanel && selectedExpense && (
          <div className="w-[35%] border-l border-gray-200 bg-white transition-all duration-300 ease-in-out overflow-hidden flex-shrink-0">
            <ExpenseHistoryPanel
              expense={selectedExpense}
              onClose={handleCloseHistory}
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
