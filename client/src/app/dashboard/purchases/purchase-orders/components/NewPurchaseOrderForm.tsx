"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { purchaseOrderService } from "@/services/purchaseOrderService";
import { vendorService } from "@/services/vendorService";
import { itemService } from "@/services/itemService";

interface PurchaseOrderItem {
  itemId: string;
  itemName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
}

interface PurchaseOrderFormData {
  vendorId: string;
  vendorName: string;
  orderDate: string;
  expectedDeliveryDate: string;
  notes: string;
  terms: string;
  currency: string;
  items: PurchaseOrderItem[];
}

export default function NewPurchaseOrderForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<PurchaseOrderFormData>({
    vendorId: "",
    vendorName: "",
    orderDate: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: "",
    notes: "",
    terms: "Net 30",
    currency: "INR",
    items: [{
      itemId: "",
      itemName: "",
      description: "",
      quantity: 1,
      unitPrice: 0,
      taxRate: 0,
    }],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vendors, setVendors] = useState<any[]>([]);
  const [showVendorDropdown, setShowVendorDropdown] = useState(false);
  const [vendorSearchTerm, setVendorSearchTerm] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [showItemDropdowns, setShowItemDropdowns] = useState<{[key: number]: boolean}>({});
  const [itemSearchTerms, setItemSearchTerms] = useState<{[key: number]: string}>({});

  // Load vendors and items on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [vendorsData, itemsData] = await Promise.all([
          vendorService.getVendors(),
          itemService.getActiveItems()
        ]);
        setVendors(vendorsData);
        setItems(itemsData);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    loadData();
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

  const handleItemSelect = (index: number, item: any) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((formItem, i) => 
        i === index ? {
          ...formItem,
          itemId: item._id,
          itemName: item.name,
          description: item.description || '',
          unitPrice: item.unitPrice || 0,
          taxRate: item.taxRate || 0
        } : formItem
      ),
    }));
    setItemSearchTerms(prev => ({ ...prev, [index]: item.name }));
    setShowItemDropdowns(prev => ({ ...prev, [index]: false }));
  };

  // Handle manual item entry (when user types but doesn't select from dropdown)
  const handleItemNameChange = (index: number, value: string) => {
    setItemSearchTerms(prev => ({ ...prev, [index]: value }));
    setShowItemDropdowns(prev => ({ ...prev, [index]: true }));
    
    // If user is typing manually, clear the itemId and set itemName
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((formItem, i) => 
        i === index ? {
          ...formItem,
          itemId: "", // Clear itemId for manual entry
          itemName: value, // Set itemName to what user typed
        } : formItem
      ),
    }));
  };

  const getFilteredItems = (index: number) => {
    const searchTerm = itemSearchTerms[index] || '';
    return items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.vendor-dropdown-container')) {
        setShowVendorDropdown(false);
      }
      if (!target.closest('.item-dropdown-container')) {
        setShowItemDropdowns({});
      }
    };

    if (showVendorDropdown || Object.values(showItemDropdowns).some(Boolean)) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showVendorDropdown, showItemDropdowns]);

  const handleItemChange = (index: number, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          itemId: "",
          itemName: "",
          description: "",
          quantity: 1,
          unitPrice: 0,
          taxRate: 0,
        },
      ],
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData((prev) => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }));
    }
  };

  const calculateItemTotal = (item: PurchaseOrderItem) => {
    const subtotal = item.quantity * item.unitPrice;
    const taxAmount = subtotal * (item.taxRate / 100);
    return subtotal + taxAmount;
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => 
      sum + (item.quantity * item.unitPrice), 0
    );
    const taxAmount = formData.items.reduce((sum, item) => 
      sum + (item.quantity * item.unitPrice * (item.taxRate / 100)), 0
    );
    return {
      subtotal,
      taxAmount,
      total: subtotal + taxAmount,
    };
  };

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

    if (formData.items.some(item => !item.itemId && !item.itemName.trim())) {
      setError('Please select an item or enter an item name for all rows');
      setLoading(false);
      return;
    }

    try {
      const orderData = {
        vendorId: formData.vendorId,
        orderDate: formData.orderDate,
        expectedDeliveryDate: formData.expectedDeliveryDate || undefined,
        notes: formData.notes,
        terms: formData.terms,
        items: formData.items.map(item => ({
          itemId: item.itemId,
          itemName: item.itemName,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate,
        })),
        currency: formData.currency,
      };

      await purchaseOrderService.createPurchaseOrder(orderData);
      const event = new CustomEvent("showToast", {
        detail: {
          message: "Purchase order created successfully!",
          type: "success",
        },
      });
      window.dispatchEvent(event);
      router.push("/dashboard/purchases/purchase-orders");
    } catch (err: any) {
      console.error("Error creating purchase order:", err);
      setError(err.message || "Failed to create purchase order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotals();

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push("/dashboard/purchases/purchase-orders")}
          className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Purchase Orders
        </button>
        <h1 className="text-2xl font-bold text-gray-900">New Purchase Order</h1>
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

        {/* Order Details */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Order Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order Date *
              </label>
              <input
                type="date"
                value={formData.orderDate}
                onChange={(e) => handleInputChange("orderDate", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expected Delivery Date
              </label>
              <input
                type="date"
                value={formData.expectedDeliveryDate}
                onChange={(e) => handleInputChange("expectedDeliveryDate", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Terms
              </label>
              <select
                value={formData.terms}
                onChange={(e) => handleInputChange("terms", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Due on Receipt">Due on Receipt</option>
                <option value="Net 15">Net 15</option>
                <option value="Net 30">Net 30</option>
                <option value="Net 45">Net 45</option>
                <option value="Net 60">Net 60</option>
              </select>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Items</h2>
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Item
            </button>
          </div>

          <div className="space-y-4">
            {formData.items.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-md font-medium text-gray-900">
                    Item {index + 1}
                  </h3>
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="relative item-dropdown-container">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Item Name *
                      {item.itemId ? (
                        <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                          Selected
                        </span>
                      ) : item.itemName.trim() ? (
                        <span className="ml-2 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                          Manual Entry
                        </span>
                      ) : null}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={itemSearchTerms[index] || ''}
                        onChange={(e) => handleItemNameChange(index, e.target.value)}
                        onFocus={() => setShowItemDropdowns(prev => ({ ...prev, [index]: true }))}
                        placeholder="Search and select item or type manually"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <MagnifyingGlassIcon className="h-4 w-4 absolute right-3 top-3 text-gray-400" />
                      
                      {/* Item Dropdown */}
                      {showItemDropdowns[index] && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                          {getFilteredItems(index).length > 0 ? (
                            getFilteredItems(index).map((itemOption) => (
                              <div
                                key={itemOption._id}
                                onClick={() => handleItemSelect(index, itemOption)}
                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                              >
                                <div className="font-medium text-gray-900">
                                  {itemOption.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {itemOption.type} • ₹{itemOption.unitPrice}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="px-3 py-2 text-gray-500 text-sm">
                              <div className="mb-2">No items found</div>
                              <div className="text-xs text-blue-600">
                                You can type manually to create a new item entry
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value) || 1)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Price *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, "unitPrice", parseFloat(e.target.value) || 0)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={item.taxRate}
                      onChange={(e) => handleItemChange(index, "taxRate", parseFloat(e.target.value) || 0)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={item.description}
                    onChange={(e) => handleItemChange(index, "description", e.target.value)}
                    placeholder="Enter item description"
                    rows={2}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="mt-2 text-right">
                  <span className="text-sm font-medium text-gray-900">
                    Total: {formData.currency} {calculateItemTotal(item).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Subtotal:</span>
              <span className="text-sm font-medium">{formData.currency} {totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Tax Amount:</span>
              <span className="text-sm font-medium">{formData.currency} {totals.taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2">
              <span className="text-sm font-medium text-gray-900">Total:</span>
              <span className="text-sm font-bold text-gray-900">{formData.currency} {totals.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Enter any additional notes or instructions"
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
            {loading ? "Creating..." : "Create Purchase Order"}
          </button>
        </div>
      </form>
    </div>
  );
}
