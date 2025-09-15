"use client";

import React, { useState, useEffect } from 'react';
import RecurringExpensesSection from './components/RecurringExpensesSection';
import BulkImportModal from "@/components/modals/BulkImportModal";
import BulkExportModal from "@/components/modals/BulkExportModal";
import { RecurringExpense, recurringExpenseService } from '@/services/recurringExpenseService';

const RecurringExpensesPage = () => {
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([]);
  const [selectedRecurringExpense, setSelectedRecurringExpense] = useState<RecurringExpense | null>(null);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedRecurringExpenseIds, setSelectedRecurringExpenseIds] = useState<string[]>([]);

  // Fetch recurring expenses on component mount
  useEffect(() => {
    const fetchRecurringExpenses = async () => {
      try {
        setLoading(true);
        const expensesData = await recurringExpenseService.getRecurringExpenses();
        setRecurringExpenses(expensesData);
      } catch (error) {
        console.error('Error fetching recurring expenses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecurringExpenses();
  }, []);

  const handleRecurringExpenseSelect = (expense: RecurringExpense) => {
    setSelectedRecurringExpense(expense);
    setShowRightPanel(true);
  };

  const handleCloseRightPanel = () => {
    setShowRightPanel(false);
    setSelectedRecurringExpense(null);
  };

  const handleRecurringExpenseUpdate = (updatedExpense: RecurringExpense) => {
    setRecurringExpenses(recurringExpenses.map(e => e._id === updatedExpense._id ? updatedExpense : e));
    setSelectedRecurringExpense(updatedExpense);
  };

  const handleRecurringExpenseDelete = (expenseId: string) => {
    setRecurringExpenses(recurringExpenses.filter(e => e._id !== expenseId));
    setShowRightPanel(false);
    setSelectedRecurringExpense(null);
  };

  const handleBulkSelectionChange = (selectedIds: string[]) => {
    setSelectedRecurringExpenseIds(selectedIds);
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
    if (confirm(`Are you sure you want to delete ${selectedRecurringExpenseIds.length} recurring expenses?`)) {
      // TODO: Implement bulk delete functionality
      console.log("Bulk delete for recurring expenses:", selectedRecurringExpenseIds);
      setSelectedRecurringExpenseIds([]);
    }
  };

  const handleClearSelection = () => {
    setSelectedRecurringExpenseIds([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <div className="flex h-full">
        {/* Left Panel - Recurring Expenses List */}
        <div className={`transition-all duration-300 ${showRightPanel ? 'w-1/3' : 'w-full'}`}>
          <RecurringExpensesSection
            recurringExpenses={recurringExpenses}
            selectedRecurringExpenseId={selectedRecurringExpense?._id}
            onRecurringExpenseSelect={handleRecurringExpenseSelect}
            isCollapsed={showRightPanel}
            selectedRecurringExpenseIds={selectedRecurringExpenseIds}
            onBulkSelectionChange={handleBulkSelectionChange}
            onBulkImport={handleBulkImport}
            onBulkExport={handleBulkExport}
            onBulkDelete={handleBulkDelete}
            onClearSelection={handleClearSelection}
          />
        </div>

        {/* Right Panel - Recurring Expense Details */}
        {showRightPanel && selectedRecurringExpense && (
        <div className="w-2/3 border-l border-gray-200 bg-white">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedRecurringExpense.name}
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

            {/* Recurring Expense Details Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Recurring Expense Information
                </h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Name</dt>
                    <dd className="text-sm text-gray-900">{selectedRecurringExpense.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Description</dt>
                    <dd className="text-sm text-gray-900">{selectedRecurringExpense.description || 'No description'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Amount</dt>
                    <dd className="text-sm text-gray-900">
                      {new Intl.NumberFormat('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                      }).format(selectedRecurringExpense.amount)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Frequency</dt>
                    <dd className="text-sm text-gray-900">
                      {selectedRecurringExpense.frequency.charAt(0).toUpperCase() + selectedRecurringExpense.frequency.slice(1)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Category</dt>
                    <dd className="text-sm text-gray-900">{selectedRecurringExpense.category}</dd>
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
                      {new Date(selectedRecurringExpense.startDate).toLocaleDateString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">End Date</dt>
                    <dd className="text-sm text-gray-900">
                      {selectedRecurringExpense.endDate ? new Date(selectedRecurringExpense.endDate).toLocaleDateString() : 'No end date'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Next Due</dt>
                    <dd className="text-sm text-gray-900">
                      {selectedRecurringExpense.nextDue ? new Date(selectedRecurringExpense.nextDue).toLocaleDateString() : 'N/A'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="text-sm text-gray-900">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedRecurringExpense.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedRecurringExpense.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Processed Occurrences</dt>
                    <dd className="text-sm text-gray-900">
                      {selectedRecurringExpense.processedOccurrences || 0} / {selectedRecurringExpense.totalOccurrences || '∞'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-end space-x-3">
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete this recurring expense?')) {
                    handleRecurringExpenseDelete(selectedRecurringExpense._id);
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
              >
                Delete Recurring Expense
              </button>
              <button
                onClick={() => window.location.href = `/dashboard/purchases/recurring-expenses/${selectedRecurringExpense._id}/edit`}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                Edit Recurring Expense
              </button>
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Bulk Import Modal */}
      {showBulkImportModal && (
        <BulkImportModal
          selectedIds={selectedRecurringExpenseIds}
          type="recurring-expenses"
          onClose={closeBulkImportModal}
        />
      )}

      {/* Bulk Export Modal */}
      {showBulkExportModal && (
        <BulkExportModal
          selectedIds={selectedRecurringExpenseIds}
          selectedData={recurringExpenses.filter(re => selectedRecurringExpenseIds.includes(re._id))}
          type="recurring-expenses"
          onClose={closeBulkExportModal}
        />
      )}
    </div>
  );
};

export default RecurringExpensesPage;
