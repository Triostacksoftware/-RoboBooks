'use client';

import { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  Cog6ToothIcon,
  ChevronDownIcon,
  UserIcon,
  DocumentTextIcon,
  CalendarIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  HashtagIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';
import { Customer } from '@/services/customerService';
import { Invoice } from '@/services/invoiceService';
import { BankAccount } from '@/services/bankingService';
import { CreatePaymentRequest } from '@/services/paymentService';

interface NewPaymentModalProps {
  onClose: () => void;
  onPaymentCreated: (payment: CreatePaymentRequest) => void;
  isEditing?: boolean;
  initialData?: any;
  customers: Customer[];
  invoices: Invoice[];
  bankAccounts: BankAccount[];
  isSubmitting?: boolean;
}

export default function NewPaymentModal({ 
  onClose, 
  onPaymentCreated, 
  isEditing = false, 
  initialData, 
  customers, 
  invoices, 
  bankAccounts,
  isSubmitting = false
}: NewPaymentModalProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showInvoiceDropdown, setShowInvoiceDropdown] = useState(false);
  const [showPaymentModeDropdown, setShowPaymentModeDropdown] = useState(false);
  const [showBankAccountDropdown, setShowBankAccountDropdown] = useState(false);
  
  const [formData, setFormData] = useState({
    customerId: initialData?.customer?._id || '',
    customerName: initialData?.customerName || '',
    invoiceId: initialData?.invoice?._id || '',
    invoiceNumber: initialData?.invoiceNumber || '',
    paymentDate: initialData?.date || new Date().toISOString().split('T')[0],
    paymentMode: initialData?.mode || 'Cash',
    amount: initialData?.amount?.toString() || '',
    referenceNumber: initialData?.referenceNumber || '',
    bankAccountId: initialData?.bankAccount?._id || '',
    chequeNumber: initialData?.chequeNumber || '',
    transactionId: initialData?.transactionId || '',
    notes: initialData?.notes || '',
    unusedAmount: initialData?.unusedAmount?.toString() || '0'
  });

  // Reset form when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      setFormData({
        customerId: initialData.customer?._id || '',
        customerName: initialData.customerName || '',
        invoiceId: initialData.invoice?._id || '',
        invoiceNumber: initialData.invoiceNumber || '',
        paymentDate: initialData.date || new Date().toISOString().split('T')[0],
        paymentMode: initialData.mode || 'Cash',
        amount: initialData.amount?.toString() || '',
        referenceNumber: initialData.referenceNumber || '',
        bankAccountId: initialData.bankAccount?._id || '',
        chequeNumber: initialData.chequeNumber || '',
        transactionId: initialData.transactionId || '',
        notes: initialData.notes || '',
        unusedAmount: initialData.unusedAmount?.toString() || '0'
      });
    }
  }, [initialData]);

  const paymentModes = [
    'Cash',
    'Bank Transfer',
    'Cheque',
    'Credit Card',
    'UPI',
    'Debit Card',
    'Online Payment',
    'Other'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCustomerSelect = (customer: Customer) => {
    console.log('Customer selected:', customer);
    setFormData(prev => ({
      ...prev,
      customerId: customer._id,
      customerName: customer.displayName
    }));
    setShowCustomerDropdown(false);
  };

  const handleInvoiceSelect = (invoice: Invoice) => {
    console.log('Invoice selected:', invoice);
    setFormData(prev => ({
      ...prev,
      invoiceId: invoice._id,
      invoiceNumber: invoice.invoiceNumber
    }));
    setShowInvoiceDropdown(false);
  };

  const handleBankAccountSelect = (bankAccount: BankAccount) => {
    setFormData(prev => ({
      ...prev,
      bankAccountId: bankAccount._id
    }));
    setShowBankAccountDropdown(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Debug logging
    console.log('Form data before submission:', formData);
    
    // Validate required fields
    if (!formData.customerId || !formData.invoiceId || !formData.amount || !formData.paymentMode) {
      console.log('Validation failed:', {
        customerId: formData.customerId,
        invoiceId: formData.invoiceId,
        amount: formData.amount,
        paymentMode: formData.paymentMode
      });
      alert('Please fill in all required fields: Customer, Invoice, Amount, and Payment Mode');
      return;
    }
    
    const paymentData: CreatePaymentRequest = {
      customerId: formData.customerId,
      invoiceId: formData.invoiceId,
      amount: parseFloat(formData.amount),
      mode: formData.paymentMode,
      referenceNumber: formData.referenceNumber || undefined,
      bankAccountId: formData.bankAccountId || undefined,
      chequeNumber: formData.chequeNumber || undefined,
      transactionId: formData.transactionId || undefined,
      notes: formData.notes || undefined,
      date: formData.paymentDate,
      unusedAmount: parseFloat(formData.unusedAmount) || 0
    };

    console.log('Payment data being sent:', paymentData);
    onPaymentCreated(paymentData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Edit Payment' : 'New Payment'}
            </h2>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                showSettings 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Cog6ToothIcon className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Main Form */}
          <div className="flex-1 p-6 overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* First Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Name */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.customerName}
                      placeholder="Select customer"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                        !formData.customerId ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50'
                      }`}
                      required
                      readOnly
                    />
                    <button
                      type="button"
                      onClick={() => setShowCustomerDropdown(!showCustomerDropdown)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <ChevronDownIcon className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {showCustomerDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                      {customers.map((customer) => (
                        <button
                          key={customer._id}
                          type="button"
                          onClick={() => handleCustomerSelect(customer)}
                          className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                        >
                          {customer.displayName}
                        </button>
                      ))}
                    </div>
                  )}
                  {!formData.customerId && (
                    <p className="text-red-500 text-sm mt-1">Please select a customer</p>
                  )}
                </div>

                {/* Invoice Number */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invoice Number *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.invoiceNumber}
                      placeholder="Select invoice"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                        !formData.invoiceId ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50'
                      }`}
                      required
                      readOnly
                    />
                    <button
                      type="button"
                      onClick={() => setShowInvoiceDropdown(!showInvoiceDropdown)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <ChevronDownIcon className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {showInvoiceDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                      {invoices.map((invoice) => (
                        <button
                          key={invoice._id}
                          type="button"
                          onClick={() => handleInvoiceSelect(invoice)}
                          className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                        >
                          {invoice.invoiceNumber} - ${invoice.totalAmount}
                        </button>
                      ))}
                    </div>
                  )}
                  {!formData.invoiceId && (
                    <p className="text-red-500 text-sm mt-1">Please select an invoice</p>
                  )}
                </div>
              </div>

              {/* Second Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Payment Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Date *
                  </label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      value={formData.paymentDate}
                      onChange={(e) => handleInputChange('paymentDate', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      required
                    />
                  </div>
                </div>

                {/* Payment Mode */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Mode *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.paymentMode}
                      onChange={(e) => handleInputChange('paymentMode', e.target.value)}
                      placeholder="Select payment mode"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                        !formData.paymentMode ? 'border-red-300' : 'border-gray-300'
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPaymentModeDropdown(!showPaymentModeDropdown)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <ChevronDownIcon className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {showPaymentModeDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                      {paymentModes.map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => {
                            handleInputChange('paymentMode', mode);
                            setShowPaymentModeDropdown(false);
                          }}
                          className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  )}
                  {!formData.paymentMode && (
                    <p className="text-red-500 text-sm mt-1">Please select a payment mode</p>
                  )}
                </div>
              </div>

              {/* Third Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount *
                  </label>
                  <div className="relative">
                    <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => handleInputChange('amount', e.target.value)}
                      placeholder="0.00"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                        !formData.amount || parseFloat(formData.amount) <= 0 ? 'border-red-300' : 'border-gray-300'
                      }`}
                      required
                    />
                  </div>
                  {(!formData.amount || parseFloat(formData.amount) <= 0) && (
                    <p className="text-red-500 text-sm mt-1">Please enter a valid amount</p>
                  )}
                </div>

                {/* Unused Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unused Amount
                  </label>
                  <div className="relative">
                    <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      step="0.01"
                      value={formData.unusedAmount}
                      onChange={(e) => handleInputChange('unusedAmount', e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    />
                  </div>
                </div>
              </div>

              {/* Fourth Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Reference Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reference Number
                  </label>
                  <div className="relative">
                    <DocumentIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.referenceNumber}
                      onChange={(e) => handleInputChange('referenceNumber', e.target.value)}
                      placeholder="Transaction reference"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    />
                  </div>
                </div>

                {/* Bank Account (for Bank Transfer/Cheque) */}
                {(formData.paymentMode === 'Bank Transfer' || formData.paymentMode === 'Cheque') && (
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bank Account
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={bankAccounts.find(acc => acc._id === formData.bankAccountId)?.accountName || ''}
                        placeholder="Select bank account"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        readOnly
                      />
                      <button
                        type="button"
                        onClick={() => setShowBankAccountDropdown(!showBankAccountDropdown)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <ChevronDownIcon className="w-5 h-5" />
                      </button>
                    </div>
                    
                    {showBankAccountDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                        {bankAccounts.map((account) => (
                          <button
                            key={account._id}
                            type="button"
                            onClick={() => handleBankAccountSelect(account)}
                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                          >
                            {account.accountName} - {account.accountNumber}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Fifth Row - Additional Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cheque Number (for Cheque payments) */}
                {formData.paymentMode === 'Cheque' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cheque Number
                    </label>
                    <input
                      type="text"
                      value={formData.chequeNumber}
                      onChange={(e) => handleInputChange('chequeNumber', e.target.value)}
                      placeholder="Cheque number"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    />
                  </div>
                )}

                {/* Transaction ID (for online payments) */}
                {(formData.paymentMode === 'Credit Card' || formData.paymentMode === 'UPI' || formData.paymentMode === 'Online Payment') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transaction ID
                    </label>
                    <input
                      type="text"
                      value={formData.transactionId}
                      onChange={(e) => handleInputChange('transactionId', e.target.value)}
                      placeholder="Transaction ID"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    />
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Additional notes..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3 pt-4 pb-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Processing...' : (isEditing ? 'Update Payment' : 'Create Payment')}
                </button>
              </div>
            </form>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="w-80 border-l border-gray-200 bg-gray-50 p-6 overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Payment Mode
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>Cash</option>
                    <option>Bank Transfer</option>
                    <option>Cheque</option>
                    <option>Credit Card</option>
                    <option>UPI</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Auto-generate Payment Number
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Enabled</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Send Payment Receipt
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Automatically</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Custom Fields</h4>
                  <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
                    Manage Custom Fields
                  </button>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">PDF Template</h4>
                  <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
                    Customize Template
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
