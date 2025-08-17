"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Printer, Download, MoreVertical, Eye, Trash2, FileText, Calendar, User, DollarSign } from 'lucide-react';
import Link from 'next/link';

interface CreditNoteItem {
  id: string;
  itemDetails: string;
  account: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface CreditNote {
  id: string;
  creditNoteNumber: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  date: string;
  referenceNumber?: string;
  salesperson?: string;
  subject?: string;
  items: CreditNoteItem[];
  subTotal: number;
  discount: number;
  discountType: 'percentage' | 'amount';
  tdsType: 'TDS' | 'TCS';
  selectedTax?: string;
  tdsAmount: number;
  adjustment: number;
  total: number;
  status: 'draft' | 'open' | 'void';
  notes?: string;
  terms?: string;
}

const CreditNoteDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const [creditNote, setCreditNote] = useState<CreditNote | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - in real app, fetch from API
    const mockCreditNote: CreditNote = {
      id: params.id as string,
      creditNoteNumber: 'CN-00001',
      customerName: 'ABC Company Ltd',
      customerEmail: 'contact@abc.com',
      customerAddress: '123 Business Street, Mumbai, Maharashtra 400001',
      date: '2025-08-11',
      referenceNumber: 'REF-001',
      salesperson: 'John Doe',
      subject: 'Product return - Damaged goods',
      items: [
        {
          id: '1',
          itemDetails: 'Laptop Computer - Dell XPS 13',
          account: 'Product Returns',
          quantity: 1,
          rate: 15000,
          amount: 15000
        }
      ],
      subTotal: 15000,
      discount: 0,
      discountType: 'percentage',
      tdsType: 'TDS',
      selectedTax: 'TDS on Services',
      tdsAmount: 0,
      adjustment: 0,
      total: 15000,
      status: 'open',
      notes: 'Customer returned the laptop due to manufacturing defect. Full refund issued.',
      terms: 'Credit note valid for 30 days from date of issue.'
    };

    setTimeout(() => {
      setCreditNote(mockCreditNote);
      setLoading(false);
    }, 1000);
  }, [params.id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'void': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!creditNote) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Credit Note not found</h2>
          <p className="text-gray-600 mt-2">The credit note you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{creditNote.creditNoteNumber}</h1>
            <p className="text-gray-600 mt-1">Credit Note Details</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(creditNote.status)}`}>
            {creditNote.status.charAt(0).toUpperCase() + creditNote.status.slice(1)}
          </span>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
              <Printer className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
              <Download className="w-4 h-4" />
            </button>
            <Link
              href={`/dashboard/sales/credit-notes/${creditNote.id}/edit`}
              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg"
            >
              <Edit className="w-4 h-4" />
            </Link>
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Credit Note Header */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Credit Note</h2>
                  <p className="text-gray-600">{creditNote.creditNoteNumber}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(creditNote.total)}</div>
                <div className="text-sm text-gray-600">Total Amount</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Customer Information</h3>
                <div className="space-y-2">
                  <div>
                    <div className="font-medium text-gray-900">{creditNote.customerName}</div>
                    <div className="text-sm text-gray-600">{creditNote.customerEmail}</div>
                    <div className="text-sm text-gray-600">{creditNote.customerAddress}</div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Credit Note Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">{formatDate(creditNote.date)}</span>
                  </div>
                  {creditNote.referenceNumber && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reference:</span>
                      <span className="font-medium">{creditNote.referenceNumber}</span>
                    </div>
                  )}
                  {creditNote.salesperson && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Salesperson:</span>
                      <span className="font-medium">{creditNote.salesperson}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Subject */}
          {creditNote.subject && (
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Subject</h3>
              <p className="text-gray-900">{creditNote.subject}</p>
            </div>
          )}

          {/* Items Table */}
          <div className="bg-white rounded-lg border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Items</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {creditNote.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.itemDetails}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.account}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(item.rate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes and Terms */}
          {(creditNote.notes || creditNote.terms) && (
            <div className="bg-white rounded-lg border p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {creditNote.notes && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Notes</h3>
                    <p className="text-gray-900">{creditNote.notes}</p>
                  </div>
                )}
                {creditNote.terms && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Terms</h3>
                    <p className="text-gray-900">{creditNote.terms}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Sub Total</span>
                <span className="font-medium">{formatCurrency(creditNote.subTotal)}</span>
              </div>
              
              {creditNote.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-medium">
                    {creditNote.discountType === 'percentage' ? `${creditNote.discount}%` : formatCurrency(creditNote.discount)}
                  </span>
                </div>
              )}
              
              {creditNote.tdsAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{creditNote.tdsType}</span>
                  <span className="font-medium">-{formatCurrency(creditNote.tdsAmount)}</span>
                </div>
              )}
              
              {creditNote.adjustment !== 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Adjustment</span>
                  <span className="font-medium">{formatCurrency(creditNote.adjustment)}</span>
                </div>
              )}
              
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(creditNote.total)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Send to Customer
              </button>
              <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                Download PDF
              </button>
              <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                Print
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditNoteDetailPage;
