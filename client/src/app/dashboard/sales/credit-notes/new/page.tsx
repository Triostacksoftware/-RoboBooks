"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, X, Settings, Info, ChevronDown, Search } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string;
}

interface Salesperson {
  id: string;
  name: string;
}

interface Item {
  id: string;
  name: string;
  description?: string;
}

interface CreditNoteItem {
  id: string;
  itemDetails: string;
  account: string;
  quantity: number;
  rate: number;
  amount: number;
}

const NewCreditNotePage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [customerName, setCustomerName] = useState('');
  const [creditNoteNumber, setCreditNoteNumber] = useState('CN-00001');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [creditNoteDate, setCreditNoteDate] = useState(new Date().toISOString().split('T')[0]);
  const [salesperson, setSalesperson] = useState('');
  const [subject, setSubject] = useState('');
  const [items, setItems] = useState<CreditNoteItem[]>([
    {
      id: '1',
      itemDetails: '',
      account: '',
      quantity: 1,
      rate: 0,
      amount: 0
    }
  ]);
  
  // Summary state
  const [subTotal, setSubTotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState('percentage');
  const [tdsType, setTdsType] = useState('TDS');
  const [selectedTax, setSelectedTax] = useState('');
  const [tdsAmount, setTdsAmount] = useState(0);
  const [adjustment, setAdjustment] = useState(0);
  const [total, setTotal] = useState(0);

  // Mock data
  const [customers] = useState<Customer[]>([
    { id: '1', name: 'ABC Company Ltd', email: 'contact@abc.com' },
    { id: '2', name: 'XYZ Corporation', email: 'info@xyz.com' },
    { id: '3', name: 'DEF Industries', email: 'sales@def.com' }
  ]);

  const [salespeople] = useState<Salesperson[]>([
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Jane Smith' },
    { id: '3', name: 'Mike Johnson' }
  ]);

  const [accounts] = useState([
    'Sales',
    'Service Revenue',
    'Product Returns',
    'Discounts',
    'Other Income'
  ]);

  // Calculate totals when items change
  useEffect(() => {
    const newSubTotal = items.reduce((sum, item) => sum + item.amount, 0);
    setSubTotal(newSubTotal);
    
    const discountAmount = discountType === 'percentage' 
      ? (newSubTotal * discount / 100) 
      : discount;
    
    const newTotal = newSubTotal - discountAmount - tdsAmount + adjustment;
    setTotal(newTotal);
  }, [items, discount, discountType, tdsAmount, adjustment]);

  // Update item amount when quantity or rate changes
  const updateItemAmount = (id: string, quantity: number, rate: number) => {
    setItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, quantity, rate, amount: quantity * rate }
        : item
    ));
  };

  // Add new item row
  const addItemRow = () => {
    const newItem: CreditNoteItem = {
      id: Date.now().toString(),
      itemDetails: '',
      account: '',
      quantity: 1,
      rate: 0,
      amount: 0
    };
    setItems(prev => [...prev, newItem]);
  };

  // Remove item row
  const removeItemRow = (id: string) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  // Handle form submission
  const handleSubmit = async (status: 'draft' | 'open') => {
    setLoading(true);
    
    try {
      // Here you would typically send the data to your API
      const creditNoteData = {
        customerName,
        creditNoteNumber,
        referenceNumber,
        creditNoteDate,
        salesperson,
        subject,
        items,
        subTotal,
        discount,
        discountType,
        tdsType,
        selectedTax,
        tdsAmount,
        adjustment,
        total,
        status
      };
      
      console.log('Credit Note Data:', creditNoteData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message (using toast as per user preference)
      // You can integrate with your toast system here
      
      // Redirect to credit notes list
      router.push('/dashboard/sales/credit-notes');
    } catch (error) {
      console.error('Error creating credit note:', error);
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-2xl font-bold text-gray-900">New Credit Note</h1>
            <p className="text-gray-600 mt-1">Create a new credit note for customer refunds or credits</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Details */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Select or add a customer"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                    <Search className="w-4 h-4 text-gray-400" />
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Credit Note Details */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Credit Note Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Credit Note# <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={creditNoteNumber}
                    onChange={(e) => setCreditNoteNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  />
                  <Settings className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reference#
                </label>
                <input
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Credit Note Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={creditNoteDate}
                  onChange={(e) => setCreditNoteDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Salesperson */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Salesperson</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Salesperson
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={salesperson}
                  onChange={(e) => setSalesperson(e.target.value)}
                  placeholder="Select or Add Salesperson"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                />
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Subject */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Subject</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                Subject
                <Info className="w-4 h-4 text-gray-400 ml-2" />
              </label>
              <textarea
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Let your customer know what this Credit Note is for"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Item Table */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Item Table</h2>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Bulk Actions
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ITEM DETAILS</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ACCOUNT</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">QUANTITY</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">RATE (₹)</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">AMOUNT</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={item.id} className="border-b">
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={item.itemDetails}
                          onChange={(e) => setItems(prev => prev.map(i => 
                            i.id === item.id ? { ...i, itemDetails: e.target.value } : i
                          ))}
                          placeholder="Type or click to select an item."
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <div className="relative">
                          <input
                            type="text"
                            value={item.account}
                            onChange={(e) => setItems(prev => prev.map(i => 
                              i.id === item.id ? { ...i, account: e.target.value } : i
                            ))}
                            placeholder="Select an account"
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent pr-6"
                          />
                          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItemAmount(item.id, parseFloat(e.target.value) || 0, item.rate)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          value={item.rate}
                          onChange={(e) => updateItemAmount(item.id, item.quantity, parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          value={item.amount}
                          readOnly
                          className="w-full px-2 py-1 border border-gray-300 rounded bg-gray-50"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => removeItemRow(item.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 space-x-3">
              <button
                onClick={addItemRow}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                + Add New Row
              </button>
              <button className="text-blue-600 hover:text-blue-700 font-medium">
                + Add Items in Bulk
              </button>
            </div>
          </div>
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border p-6 sticky top-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Sub Total</span>
                <span className="font-medium">₹{subTotal.toFixed(2)}</span>
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Discount</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="percentage">%</option>
                    <option value="amount">₹</option>
                  </select>
                </div>
                <div className="text-right text-sm text-gray-500 mt-1">
                  ₹{discountType === 'percentage' ? (subTotal * discount / 100).toFixed(2) : discount.toFixed(2)}
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">TDS / TCS</label>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="TDS"
                        checked={tdsType === 'TDS'}
                        onChange={(e) => setTdsType(e.target.value)}
                        className="mr-1"
                      />
                      TDS
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="TCS"
                        checked={tdsType === 'TCS'}
                        onChange={(e) => setTdsType(e.target.value)}
                        className="mr-1"
                      />
                      TCS
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={selectedTax}
                      onChange={(e) => setSelectedTax(e.target.value)}
                      placeholder="Select a Tax"
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent pr-6"
                    />
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    - ₹{tdsAmount.toFixed(2)}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1 flex items-center">
                  Adjustment
                  <Info className="w-3 h-3 text-gray-400 ml-1" />
                </label>
                <input
                  type="number"
                  value={adjustment}
                  onChange={(e) => setAdjustment(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              <button
                onClick={() => handleSubmit('draft')}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save as Draft'}
              </button>
              <button
                onClick={() => handleSubmit('open')}
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save as Open'}
              </button>
              <button
                onClick={() => router.back()}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewCreditNotePage;
