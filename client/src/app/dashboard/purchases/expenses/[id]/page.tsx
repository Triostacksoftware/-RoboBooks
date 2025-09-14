"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ExpenseDetailsPanel from "./components/ExpenseDetailsPanel";
import ExpenseListPanel from "./components/ExpenseListPanel";
import BackButton from "@/components/ui/BackButton";
import { expenseService, Expense } from "@/services/expenseService";

export default function ExpenseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const expenseId = params.id as string;

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load expenses and selected expense
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [expensesData, expenseData] = await Promise.all([
          expenseService.getExpenses(),
          expenseService.getExpenseById(expenseId)
        ]);
        
        setExpenses(expensesData);
        setSelectedExpense(expenseData);
        setShowRightPanel(true);
      } catch (err) {
        console.error("Error loading expense data:", err);
        setError("Failed to load expense data");
      } finally {
        setLoading(false);
      }
    };

    if (expenseId) {
      loadData();
    }
  }, [expenseId]);

  const handleExpenseSelect = (expense: Expense) => {
    setSelectedExpense(expense);
    setShowRightPanel(true);
    // Update URL without page reload
    router.push(`/dashboard/purchases/expenses/${expense._id}`, { scroll: false });
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
    <div>
      {/* Back Button */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <BackButton href="/dashboard/purchases/expenses" label="Back to Expenses" />
      </div>
      
      {/* Main Content */}
      <div className="flex -mt-4">
        {/* Left Panel - Expenses List */}
        <div
          className={`transition-all duration-300 ${
            showRightPanel ? "w-[25%]" : "w-full"
          }`}
        >
          <ExpenseListPanel
            expenses={expenses}
            selectedExpenseId={selectedExpense?._id}
            onExpenseSelect={handleExpenseSelect}
            isCollapsed={showRightPanel}
          />
        </div>

        {/* Right Panel - Expense Details */}
        {showRightPanel && selectedExpense && (
          <div className="w-[75%] border-l border-gray-200 bg-white transition-all duration-300 ease-in-out overflow-hidden">
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
}
