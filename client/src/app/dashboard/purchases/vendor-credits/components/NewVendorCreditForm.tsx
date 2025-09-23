"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { vendorCreditService } from "@/services/vendorCreditService";
import { vendorService } from "@/services/vendorService";

interface VendorCreditItem {
  itemName: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
}

interface VendorCreditFormData {
  vendorId: string;
  vendorName: string;
  creditDate: string;
  amount: number;
  reason: string;
  description: string;
  currency: string;
  reference: string;
  billId: string;
  billNumber: string;
  items: VendorCreditItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
}

export default function NewVendorCreditForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<VendorCreditFormData>({
    vendorId: "",
    vendorName: "",
    creditDate: new Date().toISOString().split('T')[0],
    amount: 0,
    reason: "",
    description: "",
    currency: "INR",
    reference: "",
    billId: "",
    billNumber: "",
    items: [{
      itemName: "",
      description: "",
      quantity: 1,
      rate: 0,
      amount: 0,
      taxRate: 0,
      taxAmount: 0,
      totalAmount: 0
    }],
    subtotal: 0,
    taxAmount: 0,
    discountAmount: 0,
    discountType: 'fixed',
    discountValue: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vendors, setVendors] = useState<any[]>([]);
  const [showVendorDropdown, setShowVendorDropdown] = useState(false);
  const [vendorSearchTerm, setVendorSearchTerm] = useState("");

  // Load vendors on component mount
  useEffect(() => {
    const loadVendors = async () => {
      try {
        const vendorsData = await vendorService.getVendors();
        setVendors(vendorsData);
      } catch (error) {
        console.error("Error loading vendors:", error);
      }
    };
    loadVendors();
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleVendorSelect = (vendor: any) => {
    setFormData((prev) => ({
      ...prev,
      vendorId: vendor._id,
      vendorName: vendor.displayName || vendor.name,
    }));
    setVendorSearchTerm(vendor.displayName || vendor.name);
    setShowVendorDropdown(false);
  };

  const filteredVendors = vendors.filter(vendor =>
    (vendor.displayName || vendor.name).toLowerCase().includes(vendorSearchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.vendor-dropdown-container')) {
        setShowVendorDropdown(false);
      }
    };

    if (showVendorDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showVendorDropdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate required fields
    if (!formData.vendorId) {
      setError('Please select a vendor');
      setLoading(false);
      return;
    }

    if (!formData.reason.trim()) {
      setError('"reason" is required');
      setLoading(false);
      return;
    }

    // Validate items
    const validItems = formData.items.filter(item => item.itemName.trim() && item.quantity > 0 && item.rate > 0);
    if (validItems.length === 0) {
      setError('Please add at least one valid item');
      setLoading(false);
      return;
    }

    // Calculate totals
    const subtotal = validItems.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = validItems.reduce((sum, item) => sum + item.taxAmount, 0);
    const totalAmount = subtotal + taxAmount - formData.discountAmount;

    if (totalAmount <= 0) {
      setError('Total amount must be greater than 0');
      setLoading(false);
      return;
    }

    try {
      const creditData = {
        vendorId: formData.vendorId,
        creditDate: formData.creditDate,
        amount: totalAmount,
        reason: formData.reason,
        description: formData.description || undefined,
        currency: formData.currency,
        reference: formData.reference || undefined,
        billId: formData.billId || undefined,
        items: validItems,
        subtotal,
        taxAmount,
        discountAmount: formData.discountAmount,
        discountType: formData.discountType,
        discountValue: formData.discountValue,
      };

      await vendorCreditService.createVendorCredit(creditData);
      const event = new CustomEvent("showToast", {
        detail: {
          message: "Vendor credit created successfully!",
          type: "success",
        },
      });
      window.dispatchEvent(event);
      router.push("/dashboard/purchases/vendor-credits");
    } catch (err: any) {
      console.error("Error creating vendor credit:", err);
      setError(err.message || "Failed to create vendor credit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const reasons = [
    "Return/Refund",
    "Overpayment",
    "Discount",
    "Adjustment",
    "Error Correction",
    "Warranty Claim",
    "Other"
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push("/dashboard/purchases/vendor-credits")}
          className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Vendor Credits
        </button>
        <h1 className="text-2xl font-bold text-gray-900">New Vendor Credit</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Vendor Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Vendor Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative vendor-dropdown-container">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={vendorSearchTerm}
                  onChange={(e) => {
                    setVendorSearchTerm(e.target.value);
                    setShowVendorDropdown(true);
                  }}
                  onFocus={() => setShowVendorDropdown(true)}
                  placeholder="Search and select vendor"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <MagnifyingGlassIcon className="h-4 w-4 absolute right-3 top-3 text-gray-400" />
                
                {/* Vendor Dropdown */}
                {showVendorDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredVendors.length > 0 ? (
                      filteredVendors.map((vendor) => (
                        <div
                          key={vendor._id}
                          onClick={() => handleVendorSelect(vendor)}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-gray-900">
                            {vendor.displayName || vendor.name}
                          </div>
                          {vendor.email && (
                            <div className="text-sm text-gray-500">{vendor.email}</div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-gray-500 text-sm">
                        No vendors found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) => handleInputChange("currency", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="INR">INR - Indian Rupee</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
              </select>
            </div>
          </div>
        </div>

        {/* Credit Details */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Credit Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Credit Date *
              </label>
              <input
                type="date"
                value={formData.creditDate}
                onChange={(e) => handleInputChange("creditDate", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason *
              </label>
              <select
                value={formData.reason}
                onChange={(e) => handleInputChange("reason", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select reason</option>
                {reasons.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reference
              </label>
              <input
                type="text"
                value={formData.reference}
                onChange={(e) => handleInputChange("reference", e.target.value)}
                placeholder="Enter reference number"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Line Items</h2>
            <button
              type="button"
              onClick={() => {
                const newItem: VendorCreditItem = {
                  itemName: "",
                  description: "",
                  quantity: 1,
                  rate: 0,
                  amount: 0,
                  taxRate: 0,
                  taxAmount: 0,
                  totalAmount: 0
                };
                setFormData(prev => ({
                  ...prev,
                  items: [...prev.items, newItem]
                }));
              }}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Item
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item Name
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Qty
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rate
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tax %
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tax Amount
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {formData.items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.itemName}
                        onChange={(e) => {
                          const newItems = [...formData.items];
                          newItems[index].itemName = e.target.value;
                          setFormData(prev => ({ ...prev, items: newItems }));
                        }}
                        className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Item name"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => {
                          const newItems = [...formData.items];
                          newItems[index].description = e.target.value;
                          setFormData(prev => ({ ...prev, items: newItems }));
                        }}
                        className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Description"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) => {
                          const newItems = [...formData.items];
                          newItems[index].quantity = parseFloat(e.target.value) || 0;
                          newItems[index].amount = newItems[index].quantity * newItems[index].rate;
                          newItems[index].taxAmount = (newItems[index].amount * newItems[index].taxRate) / 100;
                          newItems[index].totalAmount = newItems[index].amount + newItems[index].taxAmount;
                          setFormData(prev => ({ ...prev, items: newItems }));
                        }}
                        className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.rate}
                        onChange={(e) => {
                          const newItems = [...formData.items];
                          newItems[index].rate = parseFloat(e.target.value) || 0;
                          newItems[index].amount = newItems[index].quantity * newItems[index].rate;
                          newItems[index].taxAmount = (newItems[index].amount * newItems[index].taxRate) / 100;
                          newItems[index].totalAmount = newItems[index].amount + newItems[index].taxAmount;
                          setFormData(prev => ({ ...prev, items: newItems }));
                        }}
                        className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.amount}
                        onChange={(e) => {
                          const newItems = [...formData.items];
                          newItems[index].amount = parseFloat(e.target.value) || 0;
                          newItems[index].taxAmount = (newItems[index].amount * newItems[index].taxRate) / 100;
                          newItems[index].totalAmount = newItems[index].amount + newItems[index].taxAmount;
                          setFormData(prev => ({ ...prev, items: newItems }));
                        }}
                        className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.taxRate}
                        onChange={(e) => {
                          const newItems = [...formData.items];
                          newItems[index].taxRate = parseFloat(e.target.value) || 0;
                          newItems[index].taxAmount = (newItems[index].amount * newItems[index].taxRate) / 100;
                          newItems[index].totalAmount = newItems[index].amount + newItems[index].taxAmount;
                          setFormData(prev => ({ ...prev, items: newItems }));
                        }}
                        className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.taxAmount}
                        readOnly
                        className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm bg-gray-50"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.totalAmount}
                        readOnly
                        className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm bg-gray-50"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (formData.items.length > 1) {
                            const newItems = formData.items.filter((_, i) => i !== index);
                            setFormData(prev => ({ ...prev, items: newItems }));
                          }
                        }}
                        className="text-red-600 hover:text-red-800 text-sm"
                        disabled={formData.items.length === 1}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="mt-6 flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Subtotal:</span>
                <span className="text-sm font-medium">
                  ₹{formData.items.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tax:</span>
                <span className="text-sm font-medium">
                  ₹{formData.items.reduce((sum, item) => sum + item.taxAmount, 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Discount:</span>
                <span className="text-sm font-medium">
                  ₹{formData.discountAmount.toFixed(2)}
                </span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-900">Total:</span>
                  <span className="text-sm font-bold">
                    ₹{(formData.items.reduce((sum, item) => sum + item.totalAmount, 0) - formData.discountAmount).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Discount Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Discount</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Type
              </label>
              <select
                value={formData.discountType}
                onChange={(e) => {
                  const newDiscountType = e.target.value as 'percentage' | 'fixed';
                  setFormData(prev => ({
                    ...prev,
                    discountType: newDiscountType,
                    discountAmount: newDiscountType === 'percentage' 
                      ? (prev.items.reduce((sum, item) => sum + item.totalAmount, 0) * prev.discountValue) / 100
                      : prev.discountValue
                  }));
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="fixed">Fixed Amount</option>
                <option value="percentage">Percentage</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Value
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.discountValue}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  setFormData(prev => ({
                    ...prev,
                    discountValue: value,
                    discountAmount: prev.discountType === 'percentage' 
                      ? (prev.items.reduce((sum, item) => sum + item.totalAmount, 0) * value) / 100
                      : value
                  }));
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={formData.discountType === 'percentage' ? '0.00' : '0.00'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Amount
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.discountAmount}
                readOnly
                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50"
              />
            </div>
          </div>
        </div>

        {/* Related Bill */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Related Bill (Optional)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bill Number
              </label>
              <input
                type="text"
                value={formData.billNumber}
                onChange={(e) => handleInputChange("billNumber", e.target.value)}
                placeholder="Enter bill number"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter detailed description of the credit"
              rows={4}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create Vendor Credit"}
          </button>
        </div>
      </form>
    </div>
  );
}
