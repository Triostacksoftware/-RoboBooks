"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  DocumentArrowUpIcon,
  XMarkIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { api } from "@/lib/api";
import { formatCurrency } from "@/utils/currency";
import ModuleAccessGuard from "@/components/ModuleAccessGuard";

interface Vendor {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

interface Item {
  _id: string;
  name: string;
  description?: string;
  unit?: string;
  rate?: number;
}

interface Account {
  _id: string;
  name: string;
  type: string;
}

interface Tax {
  _id: string;
  name: string;
  rate: number;
}

interface VendorsResponse {
  success: boolean;
  data: Vendor[];
}

interface ItemsResponse {
  success: boolean;
  data: Item[];
}

interface AccountsResponse {
  success: boolean;
  data: Account[];
}

interface TaxesResponse {
  success: boolean;
  data: Tax[];
}

interface PurchaseOrderItem {
  item: string;
  description: string;
  account: string;
  quantity: number;
  rate: number;
  amount: number;
  discount: number;
  tax: string;
  taxAmount: number;
  totalAmount: number;
}

export default function NewPurchaseOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const [formData, setFormData] = useState({
    referenceNumber: "",
    date: new Date().toISOString().split("T")[0],
    deliveryDate: "",
    vendor: "",
    deliveryAddress: {
      type: "organization",
      name: "",
      address: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
      phone: "",
      email: "",
    },
    shipmentPreference: "",
    paymentTerms: "Due on Receipt",
    items: [
      {
        item: "",
        description: "",
        account: "",
        quantity: 1,
        rate: 0,
        amount: 0,
        discount: 0,
        tax: "",
        taxAmount: 0,
        totalAmount: 0,
      },
    ] as PurchaseOrderItem[],
    subTotal: 0,
    discount: {
      type: "percentage",
      value: 0,
      amount: 0,
    },
    tax: {
      type: "TDS",
      taxId: "",
      amount: 0,
    },
    adjustment: 0,
    totalAmount: 0,
    customerNotes: "",
    termsAndConditions: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [vendorsRes, itemsRes, accountsRes, taxesRes] = await Promise.all([
        api<VendorsResponse>("/api/vendors"),
        api<ItemsResponse>("/api/items"),
        api<AccountsResponse>("/api/accounts"),
        api<TaxesResponse>("/api/taxes"),
      ]);

      if (vendorsRes.success) setVendors(vendorsRes.data);
      if (itemsRes.success) setItems(itemsRes.data);
      if (accountsRes.success) setAccounts(accountsRes.data);
      if (taxesRes.success) setTaxes(taxesRes.data);
    } catch (error) {
      console.error("Error fetching initial data:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name.startsWith("deliveryAddress.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        deliveryAddress: {
          ...prev.deliveryAddress,
          [field]: value,
        },
      }));
    } else if (name.startsWith("discount.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        discount: {
          ...prev.discount,
          [field]: type === "number" ? parseFloat(value) || 0 : value,
        },
      }));
    } else if (name.startsWith("tax.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        tax: {
          ...prev.tax,
          [field]: type === "number" ? parseFloat(value) || 0 : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Calculate amount
    if (field === "quantity" || field === "rate") {
      const quantity = field === "quantity" ? value : newItems[index].quantity;
      const rate = field === "rate" ? value : newItems[index].rate;
      newItems[index].amount = quantity * rate;
    }

    // Calculate total amount
    newItems[index].totalAmount =
      newItems[index].amount -
      newItems[index].discount +
      newItems[index].taxAmount;

    setFormData((prev) => ({ ...prev, items: newItems }));
    calculateTotals(newItems);
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          item: "",
          description: "",
          account: "",
          quantity: 1,
          rate: 0,
          amount: 0,
          discount: 0,
          tax: "",
          taxAmount: 0,
          totalAmount: 0,
        },
      ],
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, items: newItems }));
      calculateTotals(newItems);
    }
  };

  const calculateTotals = (items: PurchaseOrderItem[]) => {
    const subTotal = items.reduce((sum, item) => sum + item.amount, 0);
    const totalDiscount = items.reduce((sum, item) => sum + item.discount, 0);
    const totalTax = items.reduce((sum, item) => sum + item.taxAmount, 0);
    const totalAmount =
      subTotal - totalDiscount + totalTax + formData.adjustment;

    setFormData((prev) => ({
      ...prev,
      subTotal,
      totalAmount,
    }));
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files).filter((file) => {
      const isValidType =
        file.type.startsWith("image/") || file.type === "application/pdf";
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      return isValidType && isValidSize;
    });

    setUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.vendor) newErrors.vendor = "Vendor is required";
    if (!formData.deliveryAddress.name)
      newErrors["deliveryAddress.name"] = "Delivery name is required";
    if (!formData.deliveryAddress.address)
      newErrors["deliveryAddress.address"] = "Delivery address is required";
    if (!formData.deliveryAddress.city)
      newErrors["deliveryAddress.city"] = "City is required";
    if (!formData.deliveryAddress.state)
      newErrors["deliveryAddress.state"] = "State is required";
    if (!formData.deliveryAddress.country)
      newErrors["deliveryAddress.country"] = "Country is required";

    // Validate items
    formData.items.forEach((item, index) => {
      if (!item.item) newErrors[`items.${index}.item`] = "Item is required";
      if (!item.account)
        newErrors[`items.${index}.account`] = "Account is required";
      if (item.quantity <= 0)
        newErrors[`items.${index}.quantity`] =
          "Quantity must be greater than 0";
      if (item.rate < 0)
        newErrors[`items.${index}.rate`] = "Rate cannot be negative";
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      const submitData = {
        ...formData,
        items: formData.items.map((item) => ({
          ...item,
          quantity: parseFloat(item.quantity.toString()),
          rate: parseFloat(item.rate.toString()),
          amount: parseFloat(item.amount.toString()),
          discount: parseFloat(item.discount.toString()),
          taxAmount: parseFloat(item.taxAmount.toString()),
          totalAmount: parseFloat(item.totalAmount.toString()),
        })),
        subTotal: parseFloat(formData.subTotal.toString()),
        totalAmount: parseFloat(formData.totalAmount.toString()),
        adjustment: parseFloat(formData.adjustment.toString()),
      };

      const response = await api("/api/purchase-orders", {
        method: "POST",
        body: JSON.stringify(submitData),
      });

      if (response.success) {
        // Upload files if any
        if (uploadedFiles.length > 0) {
          const formData = new FormData();
          uploadedFiles.forEach((file) => {
            formData.append("attachment", file);
          });

          await api(`/api/purchase-orders/${response.data._id}/attachments`, {
            method: "POST",
            body: formData,
          });
        }

        router.push("/dashboard/purchases/purchase-orders");
      }
    } catch (error) {
      console.error("Error creating purchase order:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            New Purchase Order
          </h1>
          <p className="text-gray-600">Create a new purchase order</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Basic Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vendor Name *
                  </label>
                  <select
                    name="vendor"
                    value={formData.vendor}
                    onChange={handleInputChange}
                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.vendor ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select a Vendor</option>
                    {vendors.map((vendor) => (
                      <option key={vendor._id} value={vendor._id}>
                        {vendor.name}
                      </option>
                    ))}
                  </select>
                  {errors.vendor && (
                    <p className="text-red-500 text-sm mt-1">{errors.vendor}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reference #
                  </label>
                  <input
                    type="text"
                    name="referenceNumber"
                    value={formData.referenceNumber}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Reference number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Date
                  </label>
                  <input
                    type="date"
                    name="deliveryDate"
                    value={formData.deliveryDate}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Terms
                  </label>
                  <select
                    name="paymentTerms"
                    value={formData.paymentTerms}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Due on Receipt">Due on Receipt</option>
                    <option value="Net 15">Net 15</option>
                    <option value="Net 30">Net 30</option>
                    <option value="Net 45">Net 45</option>
                    <option value="Net 60">Net 60</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shipment Preference
                  </label>
                  <input
                    type="text"
                    name="shipmentPreference"
                    value={formData.shipmentPreference}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Shipment preference"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Delivery Address *
              </h2>

              <div className="space-y-4">
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="deliveryAddress.type"
                      value="organization"
                      checked={formData.deliveryAddress.type === "organization"}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Organization
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="deliveryAddress.type"
                      value="customer"
                      checked={formData.deliveryAddress.type === "customer"}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Customer</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      name="deliveryAddress.name"
                      value={formData.deliveryAddress.name}
                      onChange={handleInputChange}
                      className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors["deliveryAddress.name"]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Delivery name"
                    />
                    {errors["deliveryAddress.name"] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors["deliveryAddress.name"]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="text"
                      name="deliveryAddress.phone"
                      value={formData.deliveryAddress.phone}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Phone number"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address *
                    </label>
                    <textarea
                      name="deliveryAddress.address"
                      value={formData.deliveryAddress.address}
                      onChange={handleInputChange}
                      rows={2}
                      className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors["deliveryAddress.address"]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Delivery address"
                    />
                    {errors["deliveryAddress.address"] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors["deliveryAddress.address"]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="deliveryAddress.city"
                      value={formData.deliveryAddress.city}
                      onChange={handleInputChange}
                      className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors["deliveryAddress.city"]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="City"
                    />
                    {errors["deliveryAddress.city"] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors["deliveryAddress.city"]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      name="deliveryAddress.state"
                      value={formData.deliveryAddress.state}
                      onChange={handleInputChange}
                      className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors["deliveryAddress.state"]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="State"
                    />
                    {errors["deliveryAddress.state"] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors["deliveryAddress.state"]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country *
                    </label>
                    <input
                      type="text"
                      name="deliveryAddress.country"
                      value={formData.deliveryAddress.country}
                      onChange={handleInputChange}
                      className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors["deliveryAddress.country"]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Country"
                    />
                    {errors["deliveryAddress.country"] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors["deliveryAddress.country"]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      name="deliveryAddress.zipCode"
                      value={formData.deliveryAddress.zipCode}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="ZIP code"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Item Table */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">
                  Item Table
                </h2>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={addItem}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Add Row
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item Details
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Account
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Qty
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rate
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formData.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <div className="space-y-2">
                            <select
                              value={item.item}
                              onChange={(e) =>
                                handleItemChange(index, "item", e.target.value)
                              }
                              className={`w-full border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                                errors[`items.${index}.item`]
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                            >
                              <option value="">Select an item</option>
                              {items.map((itemOption) => (
                                <option
                                  key={itemOption._id}
                                  value={itemOption._id}
                                >
                                  {itemOption.name}
                                </option>
                              ))}
                            </select>
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "description",
                                  e.target.value
                                )
                              }
                              className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="Description"
                            />
                          </div>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <select
                            value={item.account}
                            onChange={(e) =>
                              handleItemChange(index, "account", e.target.value)
                            }
                            className={`w-full border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                              errors[`items.${index}.account`]
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                          >
                            <option value="">Select account</option>
                            {accounts.map((account) => (
                              <option key={account._id} value={account._id}>
                                {account.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">
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
                            className={`w-20 border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                              errors[`items.${index}.quantity`]
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">
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
                            className={`w-24 border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                              errors[`items.${index}.rate`]
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatCurrency(item.amount)}
                          </div>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-900"
                            disabled={formData.items.length === 1}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Notes and Terms */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Additional Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Notes
                  </label>
                  <textarea
                    name="customerNotes"
                    value={formData.customerNotes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Will be displayed on purchase order"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Terms & Conditions
                  </label>
                  <textarea
                    name="termsAndConditions"
                    value={formData.termsAndConditions}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter the terms and conditions of your business to be displayed in your transaction"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Summary
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">
                    Sub Total
                  </span>
                  <span className="text-sm text-gray-900">
                    {formatCurrency(formData.subTotal)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">
                    Discount
                  </span>
                  <span className="text-sm text-gray-900">
                    {formatCurrency(formData.discount.amount)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Tax</span>
                  <span className="text-sm text-gray-900">
                    {formatCurrency(formData.tax.amount)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">
                    Adjustment
                  </span>
                  <span className="text-sm text-gray-900">
                    {formatCurrency(formData.adjustment)}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-base font-medium text-gray-900">
                      Total
                    </span>
                    <span className="text-base font-medium text-gray-900">
                      {formatCurrency(formData.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* File Attachments */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Attach File(s) to Purchase Order
              </h2>

              <div
                className={`border-2 border-dashed rounded-lg p-4 text-center ${
                  dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <DocumentArrowUpIcon className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  Drag and drop files here
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  You can upload a maximum of 10 files, 10MB each
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 cursor-pointer"
                >
                  Upload File
                </label>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <span className="text-sm text-gray-700 truncate">
                        {file.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <CheckIcon className="h-4 w-4 mr-2" />
                  Save and Send
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

// Wrapped with access guard
const NewPurchaseOrderPageWithGuard = () => (
  <ModuleAccessGuard moduleName="Purchases">
    <NewPurchaseOrderPage />
  </ModuleAccessGuard>
);

export default NewPurchaseOrderPageWithGuard;
