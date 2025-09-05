"use client";

import React, { useState } from "react";
import { Payment } from "@/services/paymentService";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { formatCurrency } from "@/utils/currency";

interface PaymentsReceivedTableProps {
  payments: Payment[];
  onNewPayment: () => void;
  onEditPayment: (payment: Payment) => void;
  onDeletePayment: (paymentId: string) => void;
  onPaymentRowClick: (payment: Payment) => void;
  selectedPaymentId?: string;
  isDeleting?: string | null;
  isCollapsed?: boolean;
}

const PaymentsReceivedTable: React.FC<PaymentsReceivedTableProps> = ({
  payments,
  onNewPayment,
  onEditPayment,
  onDeletePayment,
  onPaymentRowClick,
  selectedPaymentId,
  isDeleting,
  isCollapsed = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<keyof Payment>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);

  const handleSort = (column: keyof Payment) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  const filteredPayments = payments.filter(
    (payment) =>
      payment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.paymentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedPayments = [...filteredPayments].sort((a, b) => {
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortOrder === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPayments(payments.map((p) => p._id));
    } else {
      setSelectedPayments([]);
    }
  };

  const handleSelectPayment = (paymentId: string, checked: boolean) => {
    if (checked) {
      setSelectedPayments([...selectedPayments, paymentId]);
    } else {
      setSelectedPayments(selectedPayments.filter((id) => id !== paymentId));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  const handleEdit = (payment: Payment, e: React.MouseEvent) => {
    e.stopPropagation();
    onEditPayment(payment);
  };

  const handleDelete = (paymentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeletePayment(paymentId);
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 transition-all duration-300 mt-6 ${
        isCollapsed ? "w-full" : "w-full"
      }`}
    >
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Payments Received
            </h2>
            <span className="text-sm text-gray-500">
              ({payments.length} payments)
            </span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm w-64"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200">
              Filter
            </button>
            <button className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200">
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                onClick={() => handleSort("date")}
              >
                Date
                {sortColumn === "date" && (
                  <span className="ml-1">
                    {sortOrder === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                onClick={() => handleSort("paymentNumber")}
              >
                Payment #
                {sortColumn === "paymentNumber" && (
                  <span className="ml-1">
                    {sortOrder === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                onClick={() => handleSort("customerName")}
              >
                Customer
                {sortColumn === "customerName" && (
                  <span className="ml-1">
                    {sortOrder === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                onClick={() => handleSort("invoiceNumber")}
              >
                Invoice #
                {sortColumn === "invoiceNumber" && (
                  <span className="ml-1">
                    {sortOrder === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                onClick={() => handleSort("mode")}
              >
                Mode
                {sortColumn === "mode" && (
                  <span className="ml-1">
                    {sortOrder === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                onClick={() => handleSort("amount")}
              >
                Amount
                {sortColumn === "amount" && (
                  <span className="ml-1">
                    {sortOrder === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedPayments.map((payment) => (
              <tr
                key={payment._id}
                onClick={() => onPaymentRowClick(payment)}
                className={`hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${
                  selectedPaymentId === payment._id
                    ? "bg-blue-50 border-l-4 border-l-blue-500"
                    : ""
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedPayments.includes(payment._id)}
                    onChange={(e) =>
                      handleSelectPayment(payment._id, e.target.checked)
                    }
                    onClick={(e) => e.stopPropagation()}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(payment.date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  {payment.paymentNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {payment.customerName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {payment.invoiceNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      payment.mode === "Cash"
                        ? "bg-green-100 text-green-800"
                        : payment.mode === "Bank Transfer"
                        ? "bg-blue-100 text-blue-800"
                        : payment.mode === "Cheque"
                        ? "bg-yellow-100 text-yellow-800"
                        : payment.mode === "Credit Card"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {payment.mode}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  {formatCurrency(payment.amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => handleEdit(payment, e)}
                      className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      title="Edit"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(payment._id, e)}
                      disabled={isDeleting === payment._id}
                      className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50"
                      title="Delete"
                    >
                      {isDeleting === payment._id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      ) : (
                        <TrashIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {sortedPayments.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📄</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No payments found
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm
              ? "Try adjusting your search terms."
              : "Get started by creating your first payment."}
          </p>
          {!searchTerm && (
            <button
              onClick={onNewPayment}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Create Payment
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PaymentsReceivedTable;
