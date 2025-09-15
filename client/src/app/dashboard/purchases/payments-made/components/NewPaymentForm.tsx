"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { paymentService } from "@/services/paymentService";
import { vendorService } from "@/services/vendorService";

interface PaymentFormData {
  vendorId: string;
  vendorName: string;
  billId: string;
  billNumber: string;
  paymentDate: string;
  amount: number;
  paymentMethod: 'cash' | 'check' | 'bank_transfer' | 'credit_card' | 'other';
  reference: string;
  notes: string;
  currency: string;
  bankAccount: string;
  checkNumber: string;
}

export default function NewPaymentForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<PaymentFormData>({
    vendorId: "",
    vendorName: "",
    billId: "",
    billNumber: "",
    paymentDate: new Date().toISOString().split('T')[0],
    amount: 0,
    paymentMethod: "bank_transfer",
    reference: "",
    notes: "",
    currency: "INR",
    bankAccount: "",
    checkNumber: "",
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

    if (formData.amount <= 0) {
      setError('"amount" must be greater than 0');
      setLoading(false);
      return;
    }

    try {
      const paymentData = {
        vendorId: formData.vendorId,
        billId: formData.billId || undefined,
        paymentDate: formData.paymentDate,
        amount: formData.amount,
        paymentMethod: formData.paymentMethod,
        reference: formData.reference || undefined,
        notes: formData.notes || undefined,
        currency: formData.currency,
        bankAccount: formData.bankAccount || undefined,
        checkNumber: formData.checkNumber || undefined,
      };

      await paymentService.createPayment(paymentData);
      const event = new CustomEvent("showToast", {
        detail: {
          message: "Payment recorded successfully!",
          type: "success",
        },
      });
      window.dispatchEvent(event);
      router.push("/dashboard/purchases/payments-made");
    } catch (err: any) {
      console.error("Error creating payment:", err);
      setError(err.message || "Failed to create payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push("/dashboard/purchases/payments-made")}
          className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Payments Made
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Record New Payment</h1>
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
                Bill Number
              </label>
              <input
                type="text"
                value={formData.billNumber}
                onChange={(e) => handleInputChange("billNumber", e.target.value)}
                placeholder="Enter bill number (optional)"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Date *
              </label>
              <input
                type="date"
                value={formData.paymentDate}
                onChange={(e) => handleInputChange("paymentDate", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => handleInputChange("amount", parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method *
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => handleInputChange("paymentMethod", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="cash">Cash</option>
                <option value="check">Check</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="credit_card">Credit Card</option>
                <option value="other">Other</option>
              </select>
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

        {/* Payment Method Specific Fields */}
        {formData.paymentMethod === 'check' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Check Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Check Number *
                </label>
                <input
                  type="text"
                  value={formData.checkNumber}
                  onChange={(e) => handleInputChange("checkNumber", e.target.value)}
                  placeholder="Enter check number"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {(formData.paymentMethod === 'bank_transfer' || formData.paymentMethod === 'credit_card') && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Bank Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Account
                </label>
                <input
                  type="text"
                  value={formData.bankAccount}
                  onChange={(e) => handleInputChange("bankAccount", e.target.value)}
                  placeholder="Enter bank account details"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Reference and Notes */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reference
              </label>
              <input
                type="text"
                value={formData.reference}
                onChange={(e) => handleInputChange("reference", e.target.value)}
                placeholder="Enter reference number or ID"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Enter any additional notes"
              rows={3}
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
            {loading ? "Recording..." : "Record Payment"}
          </button>
        </div>
      </form>
    </div>
  );
}
