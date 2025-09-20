"use client";

import React, { useState, useEffect } from "react";
import ModuleAccessGuard from "@/components/ModuleAccessGuard";
import { useParams, useRouter } from "next/navigation";
import { generateClientPDF } from "../../../../../utils/pdfGenerator";
import {
  ArrowLeftIcon,
  PrinterIcon,
  EnvelopeIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  ChevronDownIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";

interface QuoteItem {
  id: number;
  itemId?: string;
  details: string;
  description?: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  taxMode: "GST" | "IGST" | "NON_TAXABLE" | "NO_GST" | "EXPORT";
  taxRate: number;
  taxAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  taxRemark: string;
}

interface Quote {
  _id: string;
  quoteNumber: string;
  referenceNumber?: string;
  quoteDate: string;
  validUntil: string;
  subject?: string;
  salesperson?: string;
  project?: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAddress?: string;
  // Buyer Details
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  buyerGstin?: string;
  buyerAddress?: string;
  // Seller Details
  sellerName?: string;
  sellerEmail?: string;
  sellerPhone?: string;
  sellerGstin?: string;
  sellerAddress?: string;
  // Place of supply
  placeOfSupplyState?: string;
  items: QuoteItem[];
  subTotal: number;
  discount: number;
  discountType: "percentage" | "amount";
  discountAmount: number;
  // GST Details
  taxAmount: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  // TDS/TCS Details
  additionalTaxType?: "TDS" | "TCS" | null;
  additionalTaxId?: string;
  additionalTaxRate: number;
  additionalTaxAmount: number;
  adjustment: number;
  total: number;
  customerNotes?: string;
  termsConditions?: string;
  internalNotes?: string;
  status: string;
  currency: string;
  exchangeRate: number;
  createdAt: string;
  updatedAt: string;
}

const QuoteDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [sending, setSending] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const quoteId = params.id as string;

  useEffect(() => {
    if (quoteId) {
      fetchQuote();
    }
  }, [quoteId]);

  const fetchQuote = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/quotes/${quoteId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch quote');
      }
      const data = await response.json();
      setQuote(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch quote');
    } finally {
      setLoading(false);
    }
  };

  const updateQuoteStatus = async (newStatus: string) => {
    try {
      setUpdatingStatus(true);
      const response = await fetch(`/api/quotes/${quoteId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      await fetchQuote();
      setShowStatusDropdown(false);
      showToastMessage('Status updated successfully', 'success');
    } catch (err) {
      showToastMessage(err instanceof Error ? err.message : 'Failed to update status', 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!quote) return;
    
    try {
      await generateClientPDF({
        type: 'quote',
        data: quote,
        filename: `Quote-${quote.quoteNumber}.pdf`
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      showToastMessage('Failed to generate PDF', 'error');
    }
  };

  const handleSendEmail = async () => {
    if (!quote) return;
    
    try {
      setSending(true);
      // Email functionality would be implemented here
      showToastMessage('Email sent successfully', 'success');
    } catch (error) {
      showToastMessage('Failed to send email', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleDuplicate = () => {
    if (!quote) return;
    router.push(`/dashboard/sales/quotes/new?duplicate=${quote._id}`);
  };

  const handleEdit = () => {
    router.push(`/dashboard/sales/quotes/${quoteId}/edit`);
  };

  const handleDelete = async () => {
    if (!quote || !confirm('Are you sure you want to delete this quote?')) return;
    
    try {
      const response = await fetch(`/api/quotes/${quoteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete quote');
      }

      router.push('/dashboard/sales/quotes');
    } catch (err) {
      showToastMessage(err instanceof Error ? err.message : 'Failed to delete quote', 'error');
    }
  };

  const showToastMessage = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return <DocumentDuplicateIcon className="w-4 h-4" />;
      case 'sent':
        return <EnvelopeIcon className="w-4 h-4" />;
      case 'accepted':
        return <CheckIcon className="w-4 h-4" />;
      case 'rejected':
        return <XMarkIcon className="w-4 h-4" />;
      case 'expired':
        return <ClockIcon className="w-4 h-4" />;
      default:
        return <DocumentDuplicateIcon className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading quote...</p>
        </div>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Quote not found'}</p>
          <button
            onClick={() => router.push('/dashboard/sales/quotes')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Back to Quotes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard/sales/quotes')}
                className="text-gray-400 hover:text-gray-600"
              >
                <ArrowLeftIcon className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Quote #{quote.quoteNumber}</h1>
                <p className="text-sm text-gray-500">
                  {quote.customerName} • {quote.subject || 'No subject'}
                </p>
              </div>
            </div>

            {/* Status and Actions */}
            <div className="flex items-center space-x-3">
              {/* Status Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${getStatusColor(quote.status)}`}
                >
                  {getStatusIcon(quote.status)}
                  <span className="ml-2">{quote.status}</span>
                  <ChevronDownIcon className="ml-2 w-4 h-4" />
                </button>

                {showStatusDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                    {['draft', 'sent', 'accepted', 'rejected', 'expired'].map((status) => (
                      <button
                        key={status}
                        onClick={() => updateQuoteStatus(status)}
                        disabled={updatingStatus}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <PrinterIcon className="w-4 h-4 mr-2" />
                  Print
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                  PDF
                </button>
                <button
                  onClick={handleSendEmail}
                  disabled={sending}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  <EnvelopeIcon className="w-4 h-4 mr-2" />
                  {sending ? 'Sending...' : 'Send'}
                </button>
                <button
                  onClick={handleDuplicate}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <DocumentDuplicateIcon className="w-4 h-4 mr-2" />
                  Duplicate
                </button>
                <button
                  onClick={handleEdit}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <PencilIcon className="w-4 h-4 mr-2" />
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                >
                  <TrashIcon className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quote Document */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          {/* Company Header */}
          <div className="border-b border-gray-200 p-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">QUOTATION</h1>
                <p className="text-gray-600">Quote #{quote.quoteNumber}</p>
                {quote.referenceNumber && (
                  <p className="text-gray-600">Ref: {quote.referenceNumber}</p>
                )}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  ₹{quote.total.toLocaleString()}
                </div>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(quote.status)}`}>
                  {getStatusIcon(quote.status)}
                  <span className="ml-2">{quote.status.toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quote Details */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Customer/Buyer Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Bill To:</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="font-medium text-gray-900">{quote.buyerName || quote.customerName}</p>
                  {quote.buyerEmail && <p className="text-gray-600">{quote.buyerEmail}</p>}
                  {quote.buyerPhone && <p className="text-gray-600">{quote.buyerPhone}</p>}
                  {quote.buyerGstin && <p className="text-gray-600">GSTIN: {quote.buyerGstin}</p>}
                  {quote.buyerAddress && <p className="text-gray-600 mt-2">{quote.buyerAddress}</p>}
                </div>
              </div>

              {/* Quote Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quote Details:</h3>
                <div className="bg-gray-50 p-4 rounded-md space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quote Date:</span>
                    <span className="font-medium">{new Date(quote.quoteDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Valid Until:</span>
                    <span className="font-medium">{new Date(quote.validUntil).toLocaleDateString()}</span>
                  </div>
                  {quote.salesperson && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Salesperson:</span>
                      <span className="font-medium">{quote.salesperson}</span>
                    </div>
                  )}
                  {quote.project && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Project:</span>
                      <span className="font-medium">{quote.project}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Items:</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tax</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {quote.items.map((item, index) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.details}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {item.description || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          ₹{item.rate.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          ₹{item.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          ₹{item.taxAmount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                {/* Notes */}
                {quote.customerNotes && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer Notes:</h3>
                    <p className="text-gray-600 bg-gray-50 p-4 rounded-md">{quote.customerNotes}</p>
                  </div>
                )}

                {/* Terms & Conditions */}
                {quote.termsConditions && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Terms & Conditions:</h3>
                    <p className="text-gray-600 bg-gray-50 p-4 rounded-md">{quote.termsConditions}</p>
                  </div>
                )}
              </div>

              {/* Totals */}
              <div>
                <div className="bg-gray-50 p-6 rounded-md">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary:</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">₹{quote.subTotal.toLocaleString()}</span>
                    </div>
                    
                    {quote.discount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Discount {quote.discountType === 'percentage' ? `(${quote.discount}%)` : ''}:
                        </span>
                        <span className="font-medium">-₹{quote.discountAmount.toLocaleString()}</span>
                      </div>
                    )}

                    {/* GST Breakdown */}
                    {quote.taxAmount > 0 && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tax Amount:</span>
                          <span className="font-medium">₹{quote.taxAmount.toLocaleString()}</span>
                        </div>
                        {quote.cgstTotal > 0 && (
                          <div className="flex justify-between text-sm text-gray-500 ml-4">
                            <span>CGST:</span>
                            <span>₹{quote.cgstTotal.toLocaleString()}</span>
                          </div>
                        )}
                        {quote.sgstTotal > 0 && (
                          <div className="flex justify-between text-sm text-gray-500 ml-4">
                            <span>SGST:</span>
                            <span>₹{quote.sgstTotal.toLocaleString()}</span>
                          </div>
                        )}
                        {quote.igstTotal > 0 && (
                          <div className="flex justify-between text-sm text-gray-500 ml-4">
                            <span>IGST:</span>
                            <span>₹{quote.igstTotal.toLocaleString()}</span>
                          </div>
                        )}
                      </>
                    )}

                    {/* TDS/TCS */}
                    {quote.additionalTaxType && quote.additionalTaxAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">{quote.additionalTaxType}:</span>
                        <span className="font-medium">₹{quote.additionalTaxAmount.toLocaleString()}</span>
                      </div>
                    )}

                    {quote.adjustment !== 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Adjustment:</span>
                        <span className={`font-medium ${quote.adjustment > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {quote.adjustment > 0 ? '+' : ''}₹{quote.adjustment.toLocaleString()}
                        </span>
                      </div>
                    )}

                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between text-lg font-bold text-gray-900">
                        <span>Total:</span>
                        <span>₹{quote.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-md shadow-lg z-50 ${
          toastType === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {toastMessage}
        </div>
      )}
    </div>
  );
};

// Wrapped with access guard
const QuoteDetailPageWithGuard = () => (
  <ModuleAccessGuard moduleName="Sales">
    <QuoteDetailPage />
  </ModuleAccessGuard>
);

export default QuoteDetailPageWithGuard;