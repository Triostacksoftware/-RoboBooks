'use client';

import { useState } from 'react';
import { Customer, Invoice } from '@/lib/services/customerInvoiceService';

interface CustomerInvoiceDataDemoProps {
  customers: Customer[];
  invoices: Invoice[];
  customersLoading: boolean;
  invoicesLoading: boolean;
  customersError: string | null;
  invoicesError: string | null;
}

export default function CustomerInvoiceDataDemo({
  customers,
  invoices,
  customersLoading,
  invoicesLoading,
  customersError,
  invoicesError
}: CustomerInvoiceDataDemoProps) {
  const [activeTab, setActiveTab] = useState<'customers' | 'invoices'>('customers');

  if (customersLoading || invoicesLoading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading data...</p>
      </div>
    );
  }

  if (customersError || invoicesError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-red-800 mb-2">Data Loading Errors</h3>
          {customersError && (
            <p className="text-red-700 mb-2">
              <strong>Customers:</strong> {customersError}
            </p>
          )}
          {invoicesError && (
            <p className="text-red-700">
              <strong>Invoices:</strong> {invoicesError}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Customer & Invoice Data</h2>
        <p className="text-gray-600">
          This component demonstrates the data fetched from the customer and invoice databases.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('customers')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'customers'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Customers ({customers.length})
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'invoices'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Invoices ({invoices.length})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'customers' && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Database</h3>
          {customers.length === 0 ? (
            <p className="text-gray-500">No customers found.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {customers.slice(0, 9).map((customer) => (
                <div key={customer._id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 truncate">
                        {customer.displayName}
                      </h4>
                      <p className="text-sm text-gray-500">{customer.email}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      customer.customerType === 'Business' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {customer.customerType}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    {customer.companyName && (
                      <p><span className="font-medium">Company:</span> {customer.companyName}</p>
                    )}
                    {customer.workPhone && (
                      <p><span className="font-medium">Phone:</span> {customer.workPhone}</p>
                    )}
                    <p><span className="font-medium">Balance:</span> ₹{customer.receivables.toFixed(2)}</p>
                    <p><span className="font-medium">Credits:</span> ₹{customer.unusedCredits.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {customers.length > 9 && (
            <p className="text-sm text-gray-500 mt-4 text-center">
              Showing 9 of {customers.length} customers
            </p>
          )}
        </div>
      )}

      {activeTab === 'invoices' && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Invoice Database</h3>
          {invoices.length === 0 ? (
            <p className="text-gray-500">No invoices found.</p>
          ) : (
            <div className="space-y-4">
              {invoices.slice(0, 10).map((invoice) => (
                <div key={invoice._id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {invoice.invoiceNumber}
                      </h4>
                      <p className="text-sm text-gray-500">{invoice.customerName}</p>
                    </div>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                      invoice.status === 'Paid' ? 'bg-green-100 text-green-800' :
                      invoice.status === 'Unpaid' ? 'bg-red-100 text-red-800' :
                      invoice.status === 'Draft' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {invoice.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Date</p>
                      <p className="font-medium">{new Date(invoice.invoiceDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Due Date</p>
                      <p className="font-medium">{new Date(invoice.dueDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total</p>
                      <p className="font-medium">₹{invoice.total.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Balance</p>
                      <p className="font-medium">₹{invoice.balanceDue.toFixed(2)}</p>
                    </div>
                  </div>
                  {invoice.items.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-sm text-gray-500 mb-2">Items:</p>
                      <div className="space-y-1">
                        {invoice.items.slice(0, 3).map((item, index) => (
                          <div key={index} className="text-sm text-gray-600">
                            {item.details} - Qty: {item.quantity} × ₹{item.rate}
                          </div>
                        ))}
                        {invoice.items.length > 3 && (
                          <p className="text-xs text-gray-400">
                            +{invoice.items.length - 3} more items
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {invoices.length > 10 && (
            <p className="text-sm text-gray-500 mt-4 text-center">
              Showing 10 of {invoices.length} invoices
            </p>
          )}
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Database Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{customers.length}</p>
            <p className="text-sm text-gray-600">Total Customers</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{invoices.length}</p>
            <p className="text-sm text-gray-600">Total Invoices</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {customers.filter(c => c.customerType === 'Business').length}
            </p>
            <p className="text-sm text-gray-600">Business Customers</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">
              {invoices.filter(i => i.status === 'Unpaid').length}
            </p>
            <p className="text-sm text-gray-600">Unpaid Invoices</p>
          </div>
        </div>
      </div>
    </div>
  );
}
