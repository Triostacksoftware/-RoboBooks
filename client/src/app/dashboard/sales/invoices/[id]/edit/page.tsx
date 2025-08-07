"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
  PrinterIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";

interface InvoiceItem {
  itemId: string;
  details: string;
  quantity: number;
  rate: number;
  amount: number;
  taxRate: number;
  taxAmount: number;
  unit: string;
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  invoiceDate: string;
  dueDate: string;
  orderNumber: string;
  project: string;
  items: InvoiceItem[];
  subTotal: number;
  discount: number;
  discountType: string;
  discountAmount: number;
  taxAmount: number;
  taxRate: number;
  shippingCharges: number;
  adjustment: number;
  roundOff: number;
  total: number;
  amountPaid: number;
  balanceDue: number;
  paymentTerms: string;
  paymentMethod: string;
  termsConditions: string;
  internalNotes: string;
  status: string;
  currency: string;
  exchangeRate: number;
  // Buyer Details
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  buyerGstin: string;
  buyerAddress: string;
  // Seller Details
  sellerName: string;
  sellerEmail: string;
  sellerPhone: string;
  sellerGstin: string;
  sellerAddress: string;
}

const EditInvoicePage = () => {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [companySettings, setCompanySettings] = useState({
    companyName: "ROBOBOOKS SOLUTIONS",
    companyAddress: "123 Business Street, Tech Park, Bangalore",
    companyPhone: "+91 98765 43210",
    companyGstin: "29ABCDE1234F1Z5",
    companyEmail: "info@robobooks.com",
  });

  useEffect(() => {
    if (params.id) {
      fetchInvoice();
    }
  }, [params.id]);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/invoices/${params.id}`
      );

      if (response.ok) {
        const result = await response.json();
        const invoiceData = result.data || result;
        setInvoice(invoiceData);
      } else {
        console.error("Error fetching invoice:", response.status);
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch invoice",
        });
      }
    } catch (error) {
      console.error("Error fetching invoice:", error);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch invoice",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (!invoice) return;
    setInvoice((prev) => ({ ...prev!, [field]: value }));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    if (!invoice) return;
    const updatedItems = [...invoice.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    // Recalculate item amount and tax
    const item = updatedItems[index];
    item.amount = (item.quantity || 0) * (item.rate || 0);
    item.taxAmount = (item.amount * (item.taxRate || 0)) / 100;

    setInvoice((prev) => ({ ...prev!, items: updatedItems }));
    recalculateAllTotals(updatedItems);
  };

  const addItem = () => {
    if (!invoice) return;
    const newItem: InvoiceItem = {
      itemId: "",
      details: "",
      quantity: 1,
      rate: 0,
      amount: 0,
      taxRate: 18,
      taxAmount: 0,
      unit: "Nos",
    };
    setInvoice((prev) => ({ ...prev!, items: [...prev!.items, newItem] }));
  };

  const removeItem = (index: number) => {
    if (!invoice) return;
    const updatedItems = invoice.items.filter((_, i) => i !== index);
    setInvoice((prev) => ({ ...prev!, items: updatedItems }));
    recalculateAllTotals(updatedItems);
  };

  const recalculateAllTotals = (items: InvoiceItem[]) => {
    if (!invoice) return;

    const subTotal = items.reduce((sum, item) => {
      return sum + (item.quantity || 0) * (item.rate || 0);
    }, 0);

    const discountAmount =
      invoice.discountType === "percentage"
        ? (subTotal * (invoice.discount || 0)) / 100
        : invoice.discount || 0;

    const taxAmount = items.reduce((sum, item) => {
      return sum + (item.taxAmount || 0);
    }, 0);

    const total =
      subTotal -
      discountAmount +
      taxAmount +
      (invoice.shippingCharges || 0) +
      (invoice.adjustment || 0) +
      (invoice.roundOff || 0);

    const balanceDue = total - (invoice.amountPaid || 0);

    setInvoice((prev) => ({
      ...prev!,
      subTotal: parseFloat(subTotal.toFixed(2)),
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      taxAmount: parseFloat(taxAmount.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      balanceDue: parseFloat(balanceDue.toFixed(2)),
    }));
  };

  const handleSaveInvoice = async () => {
    if (!invoice) return;

    try {
      setSaving(true);

      // Clean up empty fields
      const cleanedInvoice = {
        ...invoice,
        items: invoice.items.filter((item) => item.details.trim() !== ""),
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/invoices/${params.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(cleanedInvoice),
        }
      );

      if (response.ok) {
        await Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Invoice updated successfully!",
          timer: 2000,
          showConfirmButton: false,
        });
        router.push(`/dashboard/sales/invoices/${params.id}`);
      } else {
        const errorData = await response.json();
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: `Failed to update invoice: ${
            errorData.error || "Unknown error"
          }`,
        });
      }
    } catch (error) {
      console.error("Error updating invoice:", error);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update invoice",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="text-center text-red-600 p-8">
          <p>Invoice not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() =>
                router.push(`/dashboard/sales/invoices/${params.id}`)
              }
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Edit Invoice #{invoice.invoiceNumber}
              </h1>
              <p className="text-sm text-gray-500">
                {invoice.customerName || invoice.buyerName}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() =>
                router.push(`/dashboard/sales/invoices/${params.id}`)
              }
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <EyeIcon className="h-4 w-4 mr-2" />
              View
            </button>
            <button
              onClick={() =>
                router.push(`/dashboard/sales/invoices/${params.id}/print`)
              }
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <PrinterIcon className="h-4 w-4 mr-2" />
              Print
            </button>
            <button
              onClick={handleSaveInvoice}
              disabled={saving}
              className={`flex items-center px-4 py-2 text-sm font-medium text-white rounded-md ${
                saving
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Invoice Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Invoice Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice Number
                </label>
                <input
                  type="text"
                  value={invoice.invoiceNumber}
                  onChange={(e) =>
                    handleInputChange("invoiceNumber", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Number
                </label>
                <input
                  type="text"
                  value={invoice.orderNumber || ""}
                  onChange={(e) =>
                    handleInputChange("orderNumber", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice Date
                </label>
                <input
                  type="date"
                  value={
                    invoice.invoiceDate
                      ? new Date(invoice.invoiceDate)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    handleInputChange("invoiceDate", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={
                    invoice.dueDate
                      ? new Date(invoice.dueDate).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) => handleInputChange("dueDate", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Buyer Details Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Buyer Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buyer Name
                </label>
                <input
                  type="text"
                  value={invoice.buyerName || ""}
                  onChange={(e) =>
                    handleInputChange("buyerName", e.target.value)
                  }
                  placeholder="Enter buyer name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buyer Email
                </label>
                <input
                  type="email"
                  value={invoice.buyerEmail || ""}
                  onChange={(e) =>
                    handleInputChange("buyerEmail", e.target.value)
                  }
                  placeholder="Enter buyer email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buyer Phone
                </label>
                <input
                  type="text"
                  value={invoice.buyerPhone || ""}
                  onChange={(e) =>
                    handleInputChange("buyerPhone", e.target.value)
                  }
                  placeholder="Enter buyer phone"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buyer GSTIN
                </label>
                <input
                  type="text"
                  value={invoice.buyerGstin || ""}
                  onChange={(e) =>
                    handleInputChange("buyerGstin", e.target.value)
                  }
                  placeholder="Enter buyer GSTIN"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buyer Address
                </label>
                <textarea
                  value={invoice.buyerAddress || ""}
                  onChange={(e) =>
                    handleInputChange("buyerAddress", e.target.value)
                  }
                  placeholder="Enter buyer address"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Seller Details Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Seller Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seller Name
                </label>
                <input
                  type="text"
                  value={invoice.sellerName || companySettings.companyName}
                  onChange={(e) =>
                    handleInputChange("sellerName", e.target.value)
                  }
                  placeholder="Enter seller name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seller Email
                </label>
                <input
                  type="email"
                  value={invoice.sellerEmail || companySettings.companyEmail}
                  onChange={(e) =>
                    handleInputChange("sellerEmail", e.target.value)
                  }
                  placeholder="Enter seller email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seller Phone
                </label>
                <input
                  type="text"
                  value={invoice.sellerPhone || companySettings.companyPhone}
                  onChange={(e) =>
                    handleInputChange("sellerPhone", e.target.value)
                  }
                  placeholder="Enter seller phone"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seller GSTIN
                </label>
                <input
                  type="text"
                  value={invoice.sellerGstin || companySettings.companyGstin}
                  onChange={(e) =>
                    handleInputChange("sellerGstin", e.target.value)
                  }
                  placeholder="Enter seller GSTIN"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seller Address
                </label>
                <textarea
                  value={
                    invoice.sellerAddress || companySettings.companyAddress
                  }
                  onChange={(e) =>
                    handleInputChange("sellerAddress", e.target.value)
                  }
                  placeholder="Enter seller address"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Items</h2>
              <button
                onClick={addItem}
                className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Item
              </button>
            </div>
            <div className="space-y-4">
              {invoice.items.map((item, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Item Description
                      </label>
                      <input
                        type="text"
                        value={item.details}
                        onChange={(e) =>
                          handleItemChange(index, "details", e.target.value)
                        }
                        placeholder="Enter item description"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity
                      </label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "quantity",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rate
                      </label>
                      <input
                        type="number"
                        value={item.rate}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "rate",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tax Rate (%)
                      </label>
                      <input
                        type="number"
                        value={item.taxRate}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "taxRate",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={() => removeItem(index)}
                        className="p-2 text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Amount
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm">
                        ₹{item.amount.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tax Amount
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm">
                        ₹{item.taxAmount.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Total
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm font-medium">
                        ₹{(item.amount + item.taxAmount).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Type
                  </label>
                  <select
                    value={invoice.discountType || "amount"}
                    onChange={(e) =>
                      handleInputChange("discountType", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="amount">Amount</option>
                    <option value="percentage">Percentage</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount
                  </label>
                  <input
                    type="number"
                    value={invoice.discount || 0}
                    onChange={(e) =>
                      handleInputChange(
                        "discount",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shipping Charges
                  </label>
                  <input
                    type="number"
                    value={invoice.shippingCharges || 0}
                    onChange={(e) =>
                      handleInputChange(
                        "shippingCharges",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adjustment
                  </label>
                  <input
                    type="number"
                    value={invoice.adjustment || 0}
                    onChange={(e) =>
                      handleInputChange(
                        "adjustment",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Sub Total:</span>
                  <span className="text-sm font-medium">
                    ₹{invoice.subTotal?.toFixed(2) || "0.00"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Discount:</span>
                  <span className="text-sm font-medium">
                    ₹{invoice.discountAmount?.toFixed(2) || "0.00"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tax Amount:</span>
                  <span className="text-sm font-medium">
                    ₹{invoice.taxAmount?.toFixed(2) || "0.00"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Shipping:</span>
                  <span className="text-sm font-medium">
                    ₹{invoice.shippingCharges?.toFixed(2) || "0.00"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Adjustment:</span>
                  <span className="text-sm font-medium">
                    ₹{invoice.adjustment?.toFixed(2) || "0.00"}
                  </span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-lg font-semibold">
                      ₹{invoice.total?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Terms & Conditions
            </h2>
            <textarea
              value={invoice.termsConditions || ""}
              onChange={(e) =>
                handleInputChange("termsConditions", e.target.value)
              }
              placeholder="Enter terms and conditions"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditInvoicePage;
