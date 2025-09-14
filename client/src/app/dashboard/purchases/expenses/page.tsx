"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ExpensesSection from "./components/ExpensesSection";
import ExpenseDetailsPanel from "./[id]/components/ExpenseDetailsPanel";
import { expenseService, Expense } from "@/services/expenseService";

const ExpensesPage = () => {
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load expenses
  useEffect(() => {
    const loadExpenses = async () => {
      try {
        setLoading(true);
        const data = await expenseService.getExpenses();
        setExpenses(data);
      } catch (err) {
        console.error("Error loading expenses:", err);
        setError("Failed to load expenses");
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
    </div>
  );
};

export default ExpensesPage;
