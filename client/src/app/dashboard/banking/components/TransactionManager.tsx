"use client";

import React, { useState, useEffect } from "react";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  BanknotesIcon,
  ArrowDownTrayIcon,
  Squares2X2Icon,
  DocumentArrowDownIcon,
  Cog6ToothIcon,
  ChevronDownIcon,
  DocumentIcon,
  TableCellsIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline";
import TransactionCategorizationModal from "./TransactionCategorizationModal";
import ManualTransactionModal from "./ManualTransactionModal";
import { useBanking } from "@/contexts/BankingContext";
import { useToast } from "@/contexts/ToastContext";

interface Transaction {
  _id: string;
  description: string;
  amount: number;
  type: "credit" | "debit";
  category?: string;
  subcategory?: string;
  date: string;
  accountId: string;
  status: "reconciled" | "pending" | "cancelled";
  referenceNumber?: string;
  payee?: string;
  userId: string;
  importSource?: string;
  importBatchId?: string;
  isReconciled: boolean;
  withdrawals?: number;
  deposits?: number;
}

export default function TransactionManager() {
  const { addToast, removeToastsByType } = useToast();
  const { transactions, accounts, users, loading, errors, refreshTransactions, reconcileTransaction, deleteTransaction } = useBanking();
  
  // State for bulk operations
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  // State for edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  
  // State for loading states
  const [isExporting, setIsExporting] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(30);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDateRange, setSelectedDateRange] = useState("all");
  const [selectedUser, setSelectedUser] = useState("all");
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [showCategorizationModal, setShowCategorizationModal] = useState(false);
  const [transactionForCategorization, setTransactionForCategorization] =
    useState<Transaction | null>(null);
  const [showManualTransactionModal, setShowManualTransactionModal] = useState(false);

  const categories = [
    "all",
    "Office Supplies",
    "Transportation",
    "Software",
    "Client Payments",
    "Utilities",
    "Marketing",
  ];
  const statuses = ["all", "reconciled", "pending", "unreconciled"];
  const dateRanges = [
    { value: "7", label: "Last 7 days" },
    { value: "30", label: "Last 30 days" },
    { value: "90", label: "Last 90 days" },
    { value: "365", label: "Last year" },
    { value: "all", label: "Show All" },
    { value: "custom", label: "Custom range" },
  ];

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.account.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAccount = selectedAccount === "" || transaction.accountId === selectedAccount;
    const matchesCategory =
      selectedCategory === "all" || transaction.category === selectedCategory;
    const matchesStatus =
      selectedStatus === "all" || transaction.status === selectedStatus;
    const matchesUser = 
      selectedUser === "all" || 
      (selectedUser === "manual" && !transaction.importSource) ||
      transaction.userId === selectedUser;

    // Date range filtering
    const matchesDateRange = selectedDateRange === "all" || (() => {
      const transactionDate = new Date(transaction.date);
      const now = new Date();
      const daysDiff = Math.abs(Math.floor((now.getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24)));
      return daysDiff <= parseInt(selectedDateRange);
    })();

    return matchesSearch && matchesAccount && matchesCategory && matchesStatus && matchesUser && matchesDateRange;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedAccount, selectedCategory, selectedStatus, selectedUser, selectedDateRange]);

  // Refresh transactions when component mounts
  useEffect(() => {
    refreshTransactions();
  }, [refreshTransactions]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showExportDropdown) {
        const target = event.target as Element;
        if (!target.closest('.export-dropdown-container')) {
          setShowExportDropdown(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportDropdown]);

  // Keyboard navigation for pagination
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle pagination shortcuts when not in input fields
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (totalPages <= 1) return;

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          setCurrentPage(Math.max(1, currentPage - 1));
          break;
        case 'ArrowRight':
          event.preventDefault();
          setCurrentPage(Math.min(totalPages, currentPage + 1));
          break;
        case 'Home':
          event.preventDefault();
          setCurrentPage(1);
          break;
        case 'End':
          event.preventDefault();
          setCurrentPage(totalPages);
          break;
        case 'PageUp':
          event.preventDefault();
          setCurrentPage(Math.max(1, currentPage - 10));
          break;
        case 'PageDown':
          event.preventDefault();
          setCurrentPage(Math.min(totalPages, currentPage + 10));
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentPage, totalPages]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "reconciled":
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case "pending":
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case "unreconciled":
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "reconciled":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "unreconciled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleTransactionClick = (transaction: Transaction) => {
    setTransactionForCategorization(transaction);
    setShowCategorizationModal(true);
  };

  const handleModalSave = (data: Record<string, string>) => {
    console.log("Saving transaction data:", data);
    // Here you would typically make an API call to save the categorization
    setShowCategorizationModal(false);
    setTransactionForCategorization(null);
  };

  // Bulk operations handlers
  const handleSelectTransaction = (transactionId: string) => {
    setSelectedTransactions(prev => 
      prev.includes(transactionId) 
        ? prev.filter(id => id !== transactionId)
        : [...prev, transactionId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTransactions.length === filteredTransactions.length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(filteredTransactions.map(t => t._id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTransactions.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedTransactions.length} transactions?`)) {
      return;
    }

    try {
      addToast({
        type: 'info',
        title: 'Processing...',
        message: `Deleting ${selectedTransactions.length} transactions...`,
        duration: 0
      });

      // Delete transactions one by one
      for (const transactionId of selectedTransactions) {
        await deleteTransaction(transactionId);
      }

      removeToastsByType('info');
      addToast({
        title: "Success",
        message: `Successfully deleted ${selectedTransactions.length} transactions`,
        type: "success",
        duration: 3000,
      });

      setSelectedTransactions([]);
      setShowBulkActions(false);
    } catch (err: any) {
      removeToastsByType('info');
      addToast({
        title: "Error",
        message: "Failed to delete some transactions",
        type: "error",
        duration: 5000,
      });
    }
  };

  const handleBulkReconcile = async () => {
    if (selectedTransactions.length === 0) return;

    try {
      addToast({
        type: 'info',
        title: 'Processing...',
        message: `Reconciling ${selectedTransactions.length} transactions...`,
        duration: 0
      });

      // Reconcile transactions one by one
      for (const transactionId of selectedTransactions) {
        await reconcileTransaction(transactionId);
      }

      removeToastsByType('info');
      addToast({
        title: "Success",
        message: `Successfully reconciled ${selectedTransactions.length} transactions`,
        type: "success",
        duration: 3000,
      });

      setSelectedTransactions([]);
      setShowBulkActions(false);
    } catch (err: any) {
      removeToastsByType('info');
      addToast({
        title: "Error",
        message: "Failed to reconcile some transactions",
        type: "error",
        duration: 5000,
      });
    }
  };

  const handleExport = async (format: 'csv' | 'excel' | 'pdf' = 'csv') => {
    if (filteredTransactions.length === 0) {
      addToast({
        title: 'No Data',
        message: 'No transactions to export',
        type: 'warning',
        duration: 3000,
      });
      return;
    }

    try {
      setIsExporting(true);
      setShowExportDropdown(false);
      
      // Show processing toast
      addToast({
        type: 'info',
        title: 'Processing...',
        message: `Preparing ${format.toUpperCase()} export...`,
        duration: 0
      });

      // Simulate processing time for better UX
      await new Promise(resolve => setTimeout(resolve, 500));

      const timestamp = new Date().toISOString().split('T')[0];
      
      if (format === 'csv') {
        await exportToCSV(timestamp);
      } else if (format === 'excel') {
        await exportToExcel(timestamp);
      } else if (format === 'pdf') {
        await exportToPDF(timestamp);
      }

      // Remove processing toast
      removeToastsByType('info');

      addToast({
        title: "Success",
        message: `Exported ${filteredTransactions.length} transactions to ${format.toUpperCase()}`,
        type: "success",
        duration: 3000,
      });
    } catch (error) {
      removeToastsByType('info');
      addToast({
        title: "Error",
        message: `Failed to export transactions to ${format.toUpperCase()}`,
        type: "error",
        duration: 5000,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportToCSV = async (timestamp: string) => {
    const exportData = filteredTransactions.map(transaction => {
      const account = accounts.find(acc => acc._id === transaction.accountId);
      return {
        'Transaction ID': transaction._id,
        'Date': new Date(transaction.date).toLocaleDateString(),
        'Description': transaction.description,
        'Payee': transaction.payee || '',
        'Reference Number': transaction.referenceNumber || '',
        'Amount': transaction.amount,
        'Type': transaction.type,
        'Category': transaction.category || 'Uncategorized',
        'Account': account?.name || 'Unknown Account',
        'Status': transaction.status,
        'Import Source': transaction.importSource || 'Manual'
      };
    });

    const headers = Object.keys(exportData[0]);
    const csvContent = [
      headers.join(','),
      ...exportData.map(row => 
        headers.map(header => {
          const value = row[header];
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadFile(blob, `transactions_${timestamp}.csv`);
  };

  const exportToExcel = async (timestamp: string) => {
    // Create Excel-friendly format with separate debit/credit columns
    const headers = ['Date', 'Time', 'Description', 'Reference', 'Debit (₹)', 'Credit (₹)', 'Account', 'Category', 'Status', 'Import Source'];
    const csvContent = [
      headers.join('\t'), // Use tab separator for better Excel compatibility
      ...filteredTransactions.map(txn => {
        const isCredit = txn.type === "credit";
        const isDebit = txn.type === "debit" || txn.type === "withdrawal";
        const displayAmount = Math.abs(txn.amount);
        const date = new Date(txn.date);
        const account = accounts.find(acc => acc._id === txn.accountId);
        
        return [
          date.toLocaleDateString('en-IN'),
          date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          `"${(txn.description || 'Imported Transaction').replace(/"/g, '""')}"`,
          txn.referenceNumber || '',
          isDebit ? displayAmount : '',
          isCredit ? displayAmount : '',
          account?.name || 'Unknown Account',
          txn.category || 'Uncategorized',
          txn.status || 'pending',
          txn.importSource || 'Manual'
        ].join('\t');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    downloadFile(blob, `transactions_${timestamp}.xls`);
  };

  const exportToPDF = async (timestamp: string) => {
    // Create new PDF document
    const doc = new jsPDF('landscape', 'mm', 'a4');
    
    // Add title and header information
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Bank Transactions Export', 14, 20);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 14, 30);
    doc.text(`Total Transactions: ${filteredTransactions.length}`, 14, 35);
    
    // Prepare table data
    const tableData = filteredTransactions.map(txn => {
      const isCredit = txn.type === "credit";
      const isDebit = txn.type === "debit" || txn.type === "withdrawal";
      const displayAmount = Math.abs(txn.amount);
      const account = accounts.find(acc => acc._id === txn.accountId);
      
      return [
        new Date(txn.date).toLocaleDateString('en-IN'),
        txn.description || 'Imported Transaction',
        txn.referenceNumber || 'N/A',
        isDebit ? `₹${displayAmount.toLocaleString('en-IN')}` : '-',
        isCredit ? `₹${displayAmount.toLocaleString('en-IN')}` : '-',
        account?.name || 'Unknown Account',
        txn.category || 'Uncategorized',
        txn.status || 'pending'
      ];
    });
    
    // Define table columns
    const columns = [
      'Date',
      'Description', 
      'Reference',
      'Debit (₹)',
      'Credit (₹)',
      'Account',
      'Category',
      'Status'
    ];
    
    // Add table to PDF
    (doc as any).autoTable({
      head: [columns],
      body: tableData,
      startY: 45,
      styles: {
        fontSize: 8,
        cellPadding: 3,
        overflow: 'linebreak',
        halign: 'left'
      },
      headStyles: {
        fillColor: [66, 139, 202], // Blue header
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 20 }, // Date
        1: { cellWidth: 40 }, // Description
        2: { halign: 'center', cellWidth: 25 }, // Reference
        3: { halign: 'right', cellWidth: 25 }, // Debit
        4: { halign: 'right', cellWidth: 25 }, // Credit
        5: { cellWidth: 30 }, // Account
        6: { halign: 'center', cellWidth: 25 }, // Category
        7: { halign: 'center', cellWidth: 20 } // Status
      },
      margin: { left: 14, right: 14 },
      tableWidth: 'auto'
    });
    
    // Add footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
    }
    
    // Save the PDF
    doc.save(`transactions_${timestamp}.pdf`);
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Transaction management handlers
  const handleEditTransaction = async (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (updatedData: Partial<Transaction>) => {
    if (!editingTransaction) return;

    try {
      addToast({
        type: 'info',
        title: 'Processing...',
        message: 'Updating transaction...',
        duration: 0
      });

      // Here you would call the update API
      // await updateTransaction(editingTransaction._id, updatedData);
      
      removeToastsByType('info');
      addToast({
        title: "Success",
        message: "Transaction updated successfully",
        type: "success",
        duration: 3000,
      });

      setShowEditModal(false);
      setEditingTransaction(null);
      refreshTransactions(); // Refresh the list
    } catch (err: any) {
      removeToastsByType('info');
      addToast({
        title: "Error",
        message: "Failed to update transaction",
        type: "error",
        duration: 5000,
      });
    }
  };

  const handleDeleteTransaction = async (transaction: Transaction) => {
    if (!confirm("Are you sure you want to delete this transaction?")) {
      return;
    }

    try {
      // Remove any existing processing toasts
      removeToastsByType('info');
      
      // Show processing toast
      addToast({
        type: 'info',
        title: 'Processing...',
        message: `Deleting transaction: ${transaction.description}`,
        duration: 0 // Don't auto-dismiss processing toast
      });
      
      await deleteTransaction(transaction._id);
      
      // Remove processing toast
      removeToastsByType('info');
      
      // Show success toast
      addToast({
        title: "Success",
        message: "Transaction deleted successfully",
        type: "success",
        duration: 3000,
      });
    } catch (err: any) {
      console.error("Error deleting transaction:", err);
      // Remove processing toast on error
      removeToastsByType('info');
      addToast({
        title: "Error",
        message: "Failed to delete transaction",
        type: "error",
        duration: 3000,
      });
    }
  };

  const handleReconcileTransaction = async (transaction: Transaction) => {
    try {
      // Remove any existing processing toasts
      removeToastsByType('info');
      
      // Show processing toast
      addToast({
        type: 'info',
        title: 'Processing...',
        message: `Reconciling transaction: ${transaction.description}`,
        duration: 0 // Don't auto-dismiss processing toast
      });
      
      await reconcileTransaction(transaction.id.toString());
      
      // Remove processing toast
      removeToastsByType('info');
      
      // Show success toast
      addToast({
        title: "Success",
        message: "Transaction reconciled successfully",
        type: "success",
        duration: 3000,
      });
    } catch (err: any) {
      console.error("Error reconciling transaction:", err);
      // Remove processing toast on error
      removeToastsByType('info');
      addToast({
        title: "Error",
        message: "Failed to reconcile transaction",
        type: "error",
        duration: 3000,
      });
    }
  };

  if (loading.transactions) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (errors.transactions) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
          <p className="text-red-700">{errors.transactions}</p>
        </div>
        <button
          onClick={refreshTransactions}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <BanknotesIcon className="h-5 w-5 text-gray-400" />
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Accounts</option>
              {accounts.map((account) => (
                <option key={account._id} value={account._id}>
                  {account.name} - {account.bankName || "N/A"}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {dateRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>

           <div className="flex items-center gap-2">
             <select
               value={selectedStatus}
               onChange={(e) => setSelectedStatus(e.target.value)}
               className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
             >
               {statuses.map((status) => (
                 <option key={status} value={status}>
                   {status === "all"
                     ? "All Status"
                     : status.charAt(0).toUpperCase() + status.slice(1)}
                 </option>
               ))}
             </select>
           </div>

           <div className="flex items-center gap-2">
             <select
               value={selectedUser}
               onChange={(e) => setSelectedUser(e.target.value)}
               className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
             >
               <option value="all">All Users</option>
               <option value="manual">Manual Entry</option>
               {users && users.map((user) => (
                 <option key={user._id} value={user._id}>
                   {user.name || user.email}
                 </option>
               ))}
             </select>
           </div>

          {/* Clear Filters Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedAccount("");
                setSelectedCategory("all");
                setSelectedStatus("all");
                setSelectedDateRange("30");
                setSelectedUser("all");
              }}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center text-sm text-gray-600">
             <div className="flex items-center gap-2">
               <span>{filteredTransactions.length} transactions found</span>
               {selectedAccount && (
                 <>
                   <span className="text-gray-500">•</span>
                   <span className="text-blue-600 font-medium">
                     for {accounts.find(acc => acc._id === selectedAccount)?.name || "Selected Account"}
                   </span>
                 </>
               )}
               {selectedUser !== "all" && (
                 <>
                   <span className="text-gray-500">•</span>
                   <span className="text-purple-600 font-medium">
                     by {selectedUser === "manual" ? "Manual Entry" : users?.find(u => u._id === selectedUser)?.name || "Selected User"}
                   </span>
                 </>
               )}
             </div>
            <div className="flex gap-4">
              {selectedAccount && (
                <span className="text-green-600 font-medium">
                  Balance: ₹{accounts.find(acc => acc._id === selectedAccount)?.balance.toLocaleString() || "0"}
                </span>
              )}
              <span>
                Total: ₹
                {filteredTransactions
                  .reduce((sum, t) => sum + t.amount, 0)
                  .toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span>
                Credits: ₹
                {filteredTransactions
                  .filter((t) => t.type === "credit")
                  .reduce((sum, t) => sum + Math.abs(t.amount), 0)
                  .toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span>
                Debits: ₹
                {filteredTransactions
                  .filter((t) => t.type === "debit" || t.type === "withdrawal")
                  .reduce((sum, t) => sum + Math.abs(t.amount), 0)
                  .toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Transactions
            </h3>
            <div className="flex gap-3">
              {/* Manual Transaction Button */}
              <button
                onClick={() => setShowManualTransactionModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <BanknotesIcon className="h-4 w-4" />
                Add Manual Transaction
              </button>
              
              <div className="relative export-dropdown-container">
                <button 
                  onClick={() => setShowExportDropdown(!showExportDropdown)}
                  disabled={isExporting}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 hover:border-green-300 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExporting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-600 border-t-transparent"></div>
                      Exporting...
                    </>
                  ) : (
                    <>
                      <DocumentArrowDownIcon className="h-4 w-4" />
                Export
                      <ChevronDownIcon className="h-4 w-4" />
                    </>
                  )}
              </button>

                {/* Export Dropdown Menu */}
                {showExportDropdown && !isExporting && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="py-1">
                      <button
                        onClick={() => handleExport('csv')}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      >
                        <TableCellsIcon className="h-4 w-4 text-green-600" />
                        <span>Export as CSV</span>
                      </button>
                      <button
                        onClick={() => handleExport('excel')}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      >
                        <DocumentIcon className="h-4 w-4 text-blue-600" />
                        <span>Export as Excel</span>
                      </button>
                      <button
                        onClick={() => handleExport('pdf')}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      >
                        <DocumentTextIcon className="h-4 w-4 text-red-600" />
                        <span>Export as PDF</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <button 
                onClick={() => setShowBulkActions(!showBulkActions)}
                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-lg transition-all duration-200 shadow-sm hover:shadow-md ${
                  showBulkActions 
                    ? 'text-blue-700 bg-blue-100 border-blue-300 hover:bg-blue-200' 
                    : 'text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300'
                }`}
              >
                <Squares2X2Icon className="h-4 w-4" />
                Bulk Actions
                {selectedTransactions.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 text-xs font-medium text-blue-800 bg-blue-200 rounded-full">
                    {selectedTransactions.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions Panel */}
        {showBulkActions && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 p-6">
              <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={selectedTransactions.length === filteredTransactions.length && filteredTransactions.length > 0}
                      onChange={handleSelectAll}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-2 border-gray-300 rounded-md hover:border-blue-400 transition-all duration-200 cursor-pointer"
                    />
                    {selectedTransactions.length > 0 && selectedTransactions.length < filteredTransactions.length && (
                      <div className="absolute -top-1 -right-1 h-3 w-3 bg-blue-600 rounded-full border-2 border-white animate-pulse"></div>
                    )}
                  </div>
                  <label 
                    onClick={handleSelectAll}
                    className="text-sm font-medium text-gray-700 cursor-pointer hover:text-blue-600 transition-colors duration-200"
                  >
                    {selectedTransactions.length === filteredTransactions.length ? 'Deselect All' : 'Select All'}
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm">
                    <Squares2X2Icon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      <span className="text-blue-600 font-semibold">{selectedTransactions.length}</span>
                      <span className="text-gray-500"> of </span>
                      <span className="text-gray-900 font-semibold">{filteredTransactions.length}</span>
                      <span className="text-gray-500"> selected</span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleBulkReconcile}
                  disabled={selectedTransactions.length === 0}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-green-600 rounded-lg hover:bg-green-700 hover:border-green-700 disabled:bg-gray-300 disabled:border-gray-300 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <CheckCircleIcon className="h-4 w-4" />
                  Reconcile Selected
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={selectedTransactions.length === 0}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-red-600 rounded-lg hover:bg-red-700 hover:border-red-700 disabled:bg-gray-300 disabled:border-gray-300 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <TrashIcon className="h-4 w-4" />
                  Delete Selected
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Transactions Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {showBulkActions && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="relative">
                      <input
                        type="checkbox"
                        checked={selectedTransactions.length === currentTransactions.length && currentTransactions.length > 0}
                        onChange={() => {
                          if (selectedTransactions.length === currentTransactions.length) {
                            // Deselect all current page transactions
                            setSelectedTransactions(prev => 
                              prev.filter(id => !currentTransactions.some(t => t._id === id))
                            );
                          } else {
                            // Select all current page transactions
                            const currentPageIds = currentTransactions.map(t => t._id);
                            setSelectedTransactions(prev => {
                              const newSelection = [...prev];
                              currentPageIds.forEach(id => {
                                if (!newSelection.includes(id)) {
                                  newSelection.push(id);
                                }
                              });
                              return newSelection;
                            });
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                  </div>
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Txn ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reference
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Debit (₹)
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Credit (₹)
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount (₹)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentTransactions.map((transaction) => {
                  const account = accounts.find(acc => acc._id === transaction.accountId);
                  const user = users.find(u => u._id === transaction.userId);
                  // Fix the debit/credit logic - prioritize type field over amount
                  const isCredit = transaction.type === "credit";
                  const isDebit = transaction.type === "debit" || transaction.type === "withdrawal";
                  const displayAmount = Math.abs(transaction.amount);
                  const formattedDate = new Date(transaction.date).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  });
                  const formattedTime = new Date(transaction.date).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <tr
                      key={transaction._id}
                      className={`hover:bg-gray-50 transition-colors duration-200 ${
                        selectedTransactions.includes(transaction._id) ? 'bg-blue-50' : ''
                      } ${!showBulkActions ? 'cursor-pointer' : ''}`}
                      onClick={() => {
                        if (!showBulkActions) {
                          handleTransactionClick(transaction);
                        }
                      }}
                    >
                      {showBulkActions && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={selectedTransactions.includes(transaction._id)}
                              onChange={() => handleSelectTransaction(transaction._id)}
                              onClick={(e) => e.stopPropagation()}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            {selectedTransactions.includes(transaction._id) && (
                              <div className="absolute -top-1 -right-1 h-3 w-3 bg-blue-600 rounded-full border-2 border-white animate-pulse"></div>
                            )}
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-gray-900">
                          {transaction._id?.slice(-8) || 'N/A'}
                     </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formattedDate}
                  </div>
                        <div className="text-xs text-gray-500">
                          {formattedTime}
                </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.description || 'Imported Transaction'}
                  </div>
                        {transaction.payee && (
                          <div className="text-xs text-gray-500">
                            Payee: {transaction.payee}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {transaction.referenceNumber || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {isDebit ? (
                          <div className="text-sm font-semibold text-red-600">
                            ₹{displayAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-400">-</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {isCredit ? (
                          <div className="text-sm font-semibold text-green-600">
                            ₹{displayAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-400">-</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className={`text-sm font-semibold ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.amount >= 0 ? '+' : ''}₹{displayAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-xs text-gray-500">
                          {transaction.type}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {account?.name || 'Unknown Account'}
                        </div>
                        {transaction.importSource && (
                          <div className="text-xs text-blue-600">
                            via {transaction.importSource.toUpperCase()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.category === 'uncategorized' 
                            ? 'bg-gray-100 text-gray-600' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {transaction.category || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        transaction.status
                      )}`}
                    >
                          {getStatusIcon(transaction.status)}
                      {transaction.status}
                    </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTransaction(transaction);
                      }}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 group"
                            title="View Details"
                    >
                            <EyeIcon className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditTransaction(transaction);
                      }}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 group"
                            title="Edit Transaction"
                    >
                            <PencilIcon className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTransaction(transaction);
                      }}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 group"
                            title="Delete Transaction"
                    >
                            <TrashIcon className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                    </button>
                  </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
                </div>
              </div>

        {/* Advanced Minimalistic Pagination */}
        {filteredTransactions.length > 0 && (
          <div className="bg-white border-t border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Results Summary */}
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {startIndex + 1}-{Math.min(endIndex, filteredTransactions.length)} of {filteredTransactions.length.toLocaleString()}
                </span>
                {totalPages > 1 && (
                  <span className="text-xs text-gray-500">
                    Page {currentPage} of {totalPages.toLocaleString()}
                  </span>
                )}
            </div>

              {/* Smart Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center space-x-2">
                  {/* Previous Button */}
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
                  >
                    ←
                  </button>

                  {/* Smart Page Numbers */}
                  {(() => {
                    const pages = [];
                    const maxVisible = 5;
                    const showEllipsis = totalPages > maxVisible + 2;

                    if (totalPages <= maxVisible + 2) {
                      // Show all pages if total is small
                      for (let i = 1; i <= totalPages; i++) {
                        pages.push(i);
                      }
                    } else {
                      // Smart pagination algorithm
                      const start = Math.max(1, currentPage - 2);
                      const end = Math.min(totalPages, currentPage + 2);

                      // Always show first page
                      if (start > 1) {
                        pages.push(1);
                        if (start > 2) pages.push('...');
                      }

                      // Show pages around current
                      for (let i = start; i <= end; i++) {
                        pages.push(i);
                      }

                      // Always show last page
                      if (end < totalPages) {
                        if (end < totalPages - 1) pages.push('...');
                        pages.push(totalPages);
                      }
                    }

                    return pages.map((page, index) => {
                      if (page === '...') {
                        return (
                          <span key={`ellipsis-${index}`} className="px-2 py-1 text-gray-400">
                            ...
                          </span>
                        );
                      }

                      const isCurrent = page === currentPage;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page as number)}
                          className={`inline-flex items-center px-3 py-1.5 text-sm font-medium border rounded-md transition-colors duration-150 ${
                            isCurrent
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    });
                  })()}

                  {/* Next Button */}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
                  >
                    →
                  </button>

                  {/* Quick Jump for Large Datasets */}
                  {totalPages > 10 && (
                    <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-gray-200">
                      <span className="text-xs text-gray-500">Go to:</span>
                      <input
                        type="number"
                        min="1"
                        max={totalPages}
                        value={currentPage}
                        onChange={(e) => {
                          const page = parseInt(e.target.value);
                          if (page >= 1 && page <= totalPages) {
                            setCurrentPage(page);
                          }
                        }}
                        className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const page = parseInt((e.target as HTMLInputElement).value);
                            if (page >= 1 && page <= totalPages) {
                              setCurrentPage(page);
                            }
                          }
                        }}
                      />
                      <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        First
                      </button>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Last
                      </button>
        </div>
                  )}
                </div>
              )}

              {/* Items Per Page */}
              <div className="text-xs text-gray-500">
                30/page
              </div>
            </div>

            {/* Minimal Progress Indicator for Large Datasets */}
            {totalPages > 50 && (
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div 
                    className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${(currentPage / totalPages) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Transaction Details
              </h3>
              <button
                onClick={() => setSelectedTransaction(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Description
                </label>
                <p className="text-gray-900">
                  {selectedTransaction.description || "Transaction"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Amount
                  </label>
                  <p
                    className={`font-semibold ${
                      selectedTransaction.type === "credit" || selectedTransaction.amount >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {selectedTransaction.type === "credit" || selectedTransaction.amount >= 0 ? "+" : "-"}₹
                    {Math.abs(selectedTransaction.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Type
                  </label>
                  <p className="text-gray-900">
                    {selectedTransaction.type === "credit" ? "Credit" : "Debit"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Category
                  </label>
                  <p className="text-gray-900">
                    {selectedTransaction.category || "Uncategorized"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Account
                  </label>
                  <p className="text-gray-900">
                    {accounts.find(acc => acc._id === selectedTransaction.accountId)?.name || "Unknown Account"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Date
                  </label>
                  <p className="text-gray-900">
                    {new Date(selectedTransaction.date).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Status
                  </label>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedTransaction.status)}
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        selectedTransaction.status
                      )}`}
                    >
                      {selectedTransaction.status}
                    </span>
                  </div>
                </div>

                {selectedTransaction.referenceNumber && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Reference Number
                    </label>
                    <p className="text-gray-900 font-mono text-sm">
                      {selectedTransaction.referenceNumber}
                    </p>
                  </div>
                )}

                {selectedTransaction.payee && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Payee
                    </label>
                    <p className="text-gray-900">
                      {selectedTransaction.payee}
                    </p>
                  </div>
                )}

                {selectedTransaction.subcategory && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Subcategory
                    </label>
                    <p className="text-gray-900">
                      {selectedTransaction.subcategory}
                    </p>
                  </div>
                )}

                {selectedTransaction.importSource && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Import Source
                    </label>
                    <p className="text-gray-900">
                      {selectedTransaction.importSource.toUpperCase()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                Edit Transaction
              </button>
              <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                Reconcile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Categorization Modal */}
      <TransactionCategorizationModal
        isOpen={showCategorizationModal}
        onClose={() => {
          setShowCategorizationModal(false);
          setTransactionForCategorization(null);
        }}
        transaction={transactionForCategorization}
        onSave={handleModalSave}
      />

      {/* Edit Transaction Modal */}
      {showEditModal && editingTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Edit Transaction
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingTransaction(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  defaultValue={editingTransaction.description}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  defaultValue={editingTransaction.amount}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  defaultValue={editingTransaction.category || ''}
                  placeholder="Enter category"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Payee
                </label>
                <input
                  type="text"
                  defaultValue={editingTransaction.payee || ''}
                  placeholder="Enter payee"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Reference Number
                </label>
                <input
                  type="text"
                  defaultValue={editingTransaction.referenceNumber || ''}
                  placeholder="Enter reference number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  const form = document.querySelector('form') || document;
                  const formData = new FormData(form as HTMLFormElement);
                  
                  // Get values from inputs (simplified approach)
                  const inputs = document.querySelectorAll('input');
                  const updatedData = {
                    description: inputs[0]?.value || editingTransaction.description,
                    amount: parseFloat(inputs[1]?.value || '0'),
                    category: inputs[2]?.value || editingTransaction.category,
                    payee: inputs[3]?.value || editingTransaction.payee,
                    referenceNumber: inputs[4]?.value || editingTransaction.referenceNumber,
                  };
                  
                  handleSaveEdit(updatedData);
                }}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingTransaction(null);
                }}
                className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Transaction Modal */}
      <ManualTransactionModal
        isOpen={showManualTransactionModal}
        onClose={() => setShowManualTransactionModal(false)}
      />
    </div>
  );
}
