"use client";

import React, { useState, useEffect } from "react";
import ModuleAccessGuard from "@/components/ModuleAccessGuard";
import {
  Search,
  Filter,
  Plus,
  Download,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  User,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import Link from "next/link";

interface CreditNote {
  id: string;
  creditNoteNumber: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  status: "draft" | "sent" | "paid" | "cancelled";
  date: string;
  dueDate: string;
  description: string;
  items: Array<{
    name: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
}

const mockCreditNotes: CreditNote[] = [
  {
    id: "1",
    creditNoteNumber: "CN-2024-001",
    customerName: "Acme Corporation",
    customerEmail: "accounts@acme.com",
    amount: 2500.0,
    status: "sent",
    date: "2024-01-15",
    dueDate: "2024-02-15",
    description: "Credit for damaged goods returned",
    items: [
      { name: "Product A", quantity: 2, rate: 500, amount: 1000 },
      { name: "Product B", quantity: 3, rate: 500, amount: 1500 },
    ],
  },
  {
    id: "2",
    creditNoteNumber: "CN-2024-002",
    customerName: "Tech Solutions Ltd",
    customerEmail: "finance@techsolutions.com",
    amount: 1800.0,
    status: "paid",
    date: "2024-01-10",
    dueDate: "2024-02-10",
    description: "Credit for late delivery compensation",
    items: [{ name: "Service Package", quantity: 1, rate: 1800, amount: 1800 }],
  },
  {
    id: "3",
    creditNoteNumber: "CN-2024-003",
    customerName: "Global Industries",
    customerEmail: "payments@global.com",
    amount: 3200.0,
    status: "draft",
    date: "2024-01-20",
    dueDate: "2024-02-20",
    description: "Credit for quality issues",
    items: [{ name: "Premium Product", quantity: 2, rate: 1600, amount: 3200 }],
  },
];

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  sent: "bg-blue-100 text-blue-800",
  paid: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusIcons = {
  draft: Clock,
  sent: FileText,
  paid: CheckCircle,
  cancelled: AlertCircle,
};

function CreditNotesPage() {
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>(mockCreditNotes);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [selectedCreditNotes, setSelectedCreditNotes] = useState<string[]>([]);

  const filteredCreditNotes = creditNotes.filter((creditNote) => {
    const matchesSearch =
      creditNote.creditNoteNumber
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      creditNote.customerName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      creditNote.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || creditNote.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalAmount = filteredCreditNotes.reduce(
    (sum, note) => sum + note.amount,
    0
  );
  const paidAmount = filteredCreditNotes
    .filter((note) => note.status === "paid")
    .reduce((sum, note) => sum + note.amount, 0);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCreditNotes(filteredCreditNotes.map((note) => note.id));
    } else {
      setSelectedCreditNotes([]);
    }
  };

  const handleSelectCreditNote = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedCreditNotes([...selectedCreditNotes, id]);
    } else {
      setSelectedCreditNotes(
        selectedCreditNotes.filter((noteId) => noteId !== id)
      );
    }
  };

  const handleDeleteSelected = () => {
    setCreditNotes(
      creditNotes.filter((note) => !selectedCreditNotes.includes(note.id))
    );
    setSelectedCreditNotes([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Credit Notes</h1>
            <p className="text-gray-600 mt-2">
              Manage and track your credit notes
            </p>
          </div>
          <Link
            href="/dashboard/sales/credit-notes/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Credit Note
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Credit Notes
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredCreditNotes.length}
              </p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalAmount)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Paid Amount</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(paidAmount)}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Pending Amount
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalAmount - paidAmount)}
              </p>
            </div>
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search credit notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedCreditNotes.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <p className="text-blue-800">
              {selectedCreditNotes.length} credit note(s) selected
            </p>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Send Selected
              </button>
              <button
                onClick={handleDeleteSelected}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Credit Notes Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedCreditNotes.length ===
                        filteredCreditNotes.length &&
                      filteredCreditNotes.length > 0
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Credit Note
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCreditNotes.map((creditNote) => {
                const StatusIcon = statusIcons[creditNote.status];
                return (
                  <tr key={creditNote.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedCreditNotes.includes(creditNote.id)}
                        onChange={(e) =>
                          handleSelectCreditNote(
                            creditNote.id,
                            e.target.checked
                          )
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {creditNote.creditNoteNumber}
                        </div>
                        <div className="text-sm text-gray-500">
                          {creditNote.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {creditNote.customerName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {creditNote.customerEmail}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        ${creditNote.amount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          statusColors[creditNote.status]
                        }`}
                      >
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {creditNote.status.charAt(0).toUpperCase() +
                          creditNote.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(creditNote.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(creditNote.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/sales/credit-notes/${creditNote.id}`}
                          className="text-blue-600 hover:text-blue-900 p-1"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/dashboard/sales/credit-notes/${creditNote.id}/edit`}
                          className="text-gray-600 hover:text-gray-900 p-1"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button className="text-red-600 hover:text-red-900 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900 p-1">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredCreditNotes.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No credit notes found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filters."
                : "Get started by creating a new credit note."}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <div className="mt-6">
                <Link
                  href="/dashboard/sales/credit-notes/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Credit Note
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredCreditNotes.length > 0 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-6 rounded-lg shadow-sm border">
          <div className="flex-1 flex justify-between sm:hidden">
            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Previous
            </button>
            <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to{" "}
                <span className="font-medium">
                  {filteredCreditNotes.length}
                </span>{" "}
                of{" "}
                <span className="font-medium">
                  {filteredCreditNotes.length}
                </span>{" "}
                results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  Previous
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  1
                </button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Wrapped with access guard
const CreditNotesPageWithGuard = () => (
  <ModuleAccessGuard moduleName="Sales">
    <CreditNotesPage />
  </ModuleAccessGuard>
);

export default CreditNotesPageWithGuard;
