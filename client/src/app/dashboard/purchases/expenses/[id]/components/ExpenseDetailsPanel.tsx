"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  PencilIcon,
  DocumentTextIcon,
  PrinterIcon,
  EllipsisHorizontalIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";
import { Expense, expenseService } from "@/services/expenseService";
import { formatCurrency } from "@/utils/currency";

interface ExpenseDetailsPanelProps {
  expense: Expense;
  onClose: () => void;
  onUpdate: (expense: Expense) => void;
  onDelete: (expenseId: string) => void;
}

export default function ExpenseDetailsPanel({
  expense,
  onClose,
  onUpdate,
  onDelete,
}: ExpenseDetailsPanelProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("details");
  const [showMoreActions, setShowMoreActions] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMoreActions) {
        setShowMoreActions(false);
      }
    };

    if (showMoreActions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMoreActions]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "Paid";
      case "pending":
        return "Pending";
      case "draft":
        return "Draft";
      default:
        return status;
    }
  };

  const handleEdit = () => {
    console.log("Edit button clicked, expense ID:", expense._id);
    console.log("Full expense object:", expense);
    router.push(`/dashboard/purchases/expenses/edit/${expense._id}`);
  };

  const handleConvertToInvoice = async () => {
    try {
      // Show loading state
      const button = document.querySelector('[data-action="convert-to-invoice"]') as HTMLButtonElement;
      if (button) {
        button.disabled = true;
        button.textContent = 'Converting...';
      }

      // Call the convert to invoice API
      const response = await fetch(`/api/expenses/${expense._id}/convert-to-invoice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Expense converted to invoice successfully! Invoice ID: ${result.invoiceId}`);
        // Optionally refresh the expense data or redirect
        window.location.reload();
      } else {
        throw new Error('Failed to convert expense to invoice');
      }
    } catch (error) {
      console.error('Error converting to invoice:', error);
      alert('Failed to convert expense to invoice. Please try again.');
    } finally {
      // Reset button state
      const button = document.querySelector('[data-action="convert-to-invoice"]') as HTMLButtonElement;
      if (button) {
        button.disabled = false;
        button.innerHTML = '<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>Convert to Invoice';
      }
    }
  };

  const handleClone = async () => {
    try {
      // Show loading state
      const button = document.querySelector('[data-action="clone"]') as HTMLButtonElement;
      if (button) {
        button.disabled = true;
        button.innerHTML = '<svg class="h-4 w-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Cloning...';
      }

      // Create a clone of the expense data
      const clonedExpenseData = {
        date: new Date().toISOString().split('T')[0], // Set to today's date
        description: `${expense.description} (Copy)`,
        amount: expense.amount,
        vendor: expense.vendor,
        account: expense.account,
        category: expense.category,
        paymentMethod: expense.paymentMethod,
        reference: `${expense.reference}-COPY`,
        notes: expense.notes,
        billable: expense.billable,
        customer: expense.customer,
        project: expense.project,
        hasReceipt: false, // Reset receipt status
        status: 'unbilled' as const
      };

      // Call the expense service to create the clone
      const newExpense = await expenseService.createExpense(clonedExpenseData);
      
      alert(`Expense cloned successfully! New expense ID: ${newExpense._id}`);
      // Refresh the page to show the new expense
      window.location.reload();
    } catch (error) {
      console.error('Error cloning expense:', error);
      alert('Failed to clone expense. Please try again.');
    } finally {
      // Reset button state
      const button = document.querySelector('[data-action="clone"]') as HTMLButtonElement;
      if (button) {
        button.disabled = false;
        button.innerHTML = '<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg><span>Clone</span>';
      }
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this expense? This action cannot be undone.")) {
      try {
        // Show loading state
        const button = document.querySelector('[data-action="delete"]') as HTMLButtonElement;
        if (button) {
          button.disabled = true;
          button.innerHTML = '<svg class="h-4 w-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Deleting...';
        }

        // Call the expense service delete method
        await expenseService.deleteExpense(expense._id);
        
        alert('Expense deleted successfully!');
        // Call the parent's delete handler
        onDelete(expense._id);
      } catch (error) {
        console.error('Error deleting expense:', error);
        alert('Failed to delete expense. Please try again.');
      } finally {
        // Reset button state
        const button = document.querySelector('[data-action="delete"]') as HTMLButtonElement;
        if (button) {
          button.disabled = false;
          button.innerHTML = '<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg><span>Delete</span>';
        }
      }
    }
  };

  const handleViewJournal = () => {
    // Scroll to the journal section in the current page
    const journalSection = document.querySelector('[data-journal-section]');
    if (journalSection) {
      journalSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handlePrint = () => {
    // Create a print-friendly version with only essential data
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Expense Details - ${expense.reference || 'N/A'}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 20px;
            }
            .expense-amount {
              font-size: 24px;
              font-weight: bold;
              color: #dc2626;
              margin: 10px 0;
            }
            .status {
              color: #6b7280;
              font-size: 14px;
              text-transform: uppercase;
            }
            .category-tag {
              background-color: #dbeafe;
              color: #1e40af;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 500;
              display: inline-block;
              margin: 10px 0;
            }
            .details {
              margin: 20px 0;
            }
            .detail-row {
              margin: 8px 0;
              display: flex;
            }
            .detail-label {
              font-weight: 500;
              color: #6b7280;
              width: 120px;
            }
            .detail-value {
              color: #111827;
            }
            .journal-section {
              margin-top: 30px;
              border-top: 1px solid #e5e7eb;
              padding-top: 20px;
            }
            .journal-title {
              font-size: 18px;
              font-weight: 600;
              margin-bottom: 10px;
              color: #374151;
            }
            .currency-note {
              font-size: 14px;
              color: #6b7280;
              margin-bottom: 15px;
            }
            .currency-tag {
              background-color: #10b981;
              color: white;
              padding: 2px 8px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: 500;
              margin-left: 5px;
            }
            .journal-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            .journal-table th {
              background-color: #f3f4f6;
              padding: 12px;
              text-align: left;
              font-size: 12px;
              font-weight: 600;
              color: #374151;
              text-transform: uppercase;
              border-bottom: 1px solid #d1d5db;
            }
            .journal-table th:nth-child(2),
            .journal-table th:nth-child(3) {
              text-align: right;
            }
            .journal-table td {
              padding: 12px;
              border-bottom: 1px solid #e5e7eb;
              font-size: 14px;
              color: #374151;
            }
            .journal-table td:nth-child(2),
            .journal-table td:nth-child(3) {
              text-align: right;
            }
            .journal-table .totals-row {
              border-top: 2px solid #374151;
              font-weight: 600;
            }
            .journal-table .totals-row td:first-child {
              border-top: 2px solid #374151;
            }
            .journal-table .totals-row td:nth-child(2),
            .journal-table .totals-row td:nth-child(3) {
              border-top: 2px solid #374151;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Expense Details</h1>
            <div class="expense-amount">
              ₹${expense.amount.toFixed(2)} on ${new Date(expense.date).toLocaleDateString()}
            </div>
            <div class="status">${expense.status.toUpperCase()}</div>
            ${expense.category ? `<div class="category-tag">${expense.category}</div>` : ''}
          </div>

          <div class="details">
            <div class="detail-row">
              <div class="detail-label">Paid Through:</div>
              <div class="detail-value">${expense.paymentMethod || 'Not specified'}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Ref #:</div>
              <div class="detail-value">${expense.reference || 'No reference'}</div>
            </div>
            ${expense.customer ? `
            <div class="detail-row">
              <div class="detail-label">Customer:</div>
              <div class="detail-value">${expense.customer}</div>
            </div>
            ` : ''}
            <div class="detail-row">
              <div class="detail-label">Paid To:</div>
              <div class="detail-value">${expense.vendor || 'No vendor'}</div>
            </div>
          </div>

          <div class="journal-section">
            <div class="journal-title">Journal</div>
            <div class="currency-note">
              Amount is displayed in your base currency 
              <span class="currency-tag">INR</span>
            </div>
            <table class="journal-table">
              <thead>
                <tr>
                  <th>ACCOUNT</th>
                  <th>DEBIT</th>
                  <th>CREDIT</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Job Costing</td>
                  <td>${expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td>0.00</td>
                </tr>
                <tr>
                  <td>Petty Cash</td>
                  <td>0.00</td>
                  <td>${expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
                <tr class="totals-row">
                  <td></td>
                  <td>${expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td>${expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };



  return (
    <div className="h-full w-full max-w-none flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <h2 className="text-lg font-semibold text-gray-900">Expense Details</h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab("comments")}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            title="Comments & History"
          >
            <ChatBubbleLeftRightIcon className="h-5 w-5" />
          </button>
          <button
            onClick={onClose}
            className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
            title="Close"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Action Buttons Section */}
      <div className="px-4 py-3 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center space-x-2 relative">
          <button
            onClick={handleEdit}
            className="inline-flex items-center px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 font-medium text-sm"
          >
            <PencilIcon className="w-4 h-4 mr-2" />
            Edit
          </button>
          <button
            onClick={handleConvertToInvoice}
            data-action="convert-to-invoice"
            className="inline-flex items-center px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 font-medium text-sm"
          >
            <DocumentTextIcon className="w-4 h-4 mr-2" />
            Convert to Invoice
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 font-medium text-sm"
          >
            <PrinterIcon className="w-4 h-4 mr-2" />
            Print
          </button>
            <button
              onClick={() => setShowMoreActions(!showMoreActions)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            title="More options"
            >
            <EllipsisHorizontalIcon className="h-5 w-5" />
            </button>
        </div>
      </div>

      {/* More Actions Dropdown - Positioned absolutely */}
            {showMoreActions && (
        <div className="absolute right-4 top-20 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowMoreActions(false);
                handleClone();
                    }}
              data-action="clone"
              className="w-full flex items-center space-x-3 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  >
              <DocumentDuplicateIcon className="h-4 w-4" />
              <span>Clone</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowMoreActions(false);
                handleDelete();
                    }}
              data-action="delete"
              className="w-full flex items-center space-x-3 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  >
              <TrashIcon className="h-4 w-4" />
              <span>Delete</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowMoreActions(false);
                handleViewJournal();
                    }}
              className="w-full flex items-center space-x-3 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  >
              <BookOpenIcon className="h-4 w-4" />
              <span>View Journal</span>
                  </button>
                </div>
              </div>
            )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === "details" && (
          <div className="space-y-6">
            {/* Expense Amount and Status */}
            <div className="mb-6">
              <p className="text-gray-500 text-sm mb-2">Expense Amount</p>
              <p className="text-red-600 text-2xl font-bold">
                ₹{expense.amount.toFixed(2)} on {new Date(expense.date).toLocaleDateString()}
              </p>
              <p className="text-gray-500 text-sm mt-1 uppercase">{expense.status}</p>
            </div>

            {/* Category Tag */}
            {expense.category && (
              <div className="mb-6">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {expense.category}
                </span>
              </div>
            )}

            {/* Key Details */}
            <div className="space-y-4 mb-6">
                <div>
                <p className="text-gray-500 text-sm">Paid Through</p>
                <p className="text-gray-900 font-medium">{expense.paymentMethod || "Not specified"}</p>
                </div>
                <div>
                <p className="text-gray-500 text-sm">Ref #</p>
                <p className="text-gray-900 font-medium">{expense.reference || "No reference"}</p>
                </div>
              {expense.customer && (
                <div>
                  <p className="text-gray-500 text-sm">Customer</p>
                  <p className="text-blue-600 font-medium hover:underline cursor-pointer">{expense.customer}</p>
                </div>
              )}
                <div>
                <p className="text-gray-500 text-sm">Paid To</p>
                <p className="text-blue-600 font-medium hover:underline cursor-pointer">{expense.vendor || "No vendor"}</p>
                {expense.vendor && expense.vendor.includes(" ") && (
                  <p className="text-blue-600 font-medium hover:underline cursor-pointer">{expense.vendor.split(" ")[1]}</p>
                )}
              </div>
            </div>

            {/* Journal Section */}
            <div className="border-t border-gray-200 pt-6" data-journal-section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Journal</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-4">
                  Amount is displayed in your base currency <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">INR</span>
                </p>
                
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACCOUNT</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">DEBIT</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">CREDIT</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{expense.category || "Job Costing"}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">{expense.amount.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">0.00</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{expense.paymentMethod || "Petty Cash"}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">0.00</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">{expense.amount.toFixed(2)}</td>
                      </tr>
                      <tr className="bg-gray-50 font-semibold">
                        <td className="px-4 py-3 text-sm text-gray-900">Totals</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">{expense.amount.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">{expense.amount.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                  </div>
                  </div>
                </div>
              </div>
            )}

      </div>

    </div>
  );
}
