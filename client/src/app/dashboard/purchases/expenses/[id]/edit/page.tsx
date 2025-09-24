"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon,
  DocumentArrowUpIcon,
} from "@heroicons/react/24/outline";
import { api } from "../../../../../../lib/api";
import { formatCurrency } from "../../../../../../utils/currency";

interface Account {
  _id: string;
  name: string;
  type: string;
}

interface Vendor {
  _id: string;
  name: string;
  email: string;
}

interface Customer {
  _id: string;
  name: string;
  email: string;
}

interface Project {
  _id: string;
  name: string;
  description: string;
}

interface Expense {
  _id: string;
  date: string;
  expenseAccount: {
    _id: string;
    name: string;
    type: string;
  };
  amount: number;
  taxAmount: number;
  totalAmount: number;
  paidThrough: {
    _id: string;
    name: string;
    type: string;
  };
  vendor?: {
    _id: string;
    name: string;
    email: string;
  };
  customer?: {
    _id: string;
    name: string;
    email: string;
  };
  invoiceNumber?: string;
  referenceNumber?: string;
  notes?: string;
  category: string;
  status: "draft" | "pending" | "approved" | "rejected" | "paid";
  receipts: Array<{
    _id: string;
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
  }>;
  tags: string[];
  reportingTags: string[];
  mileage?: {
    distance: number;
    rate: number;
    totalAmount: number;
  };
  isRecurring: boolean;
  recurringPattern?: {
    frequency: string;
    interval: number;
    endDate?: string;
  };
  project?: {
    _id: string;
    name: string;
    description: string;
  };
}

interface AccountsResponse {
  success: boolean;
  data: Account[];
}

interface VendorsResponse {
  success: boolean;
  data: Vendor[];
}

interface CustomersResponse {
  success: boolean;
  data: Customer[];
}

interface ProjectsResponse {
  success: boolean;
  data: Project[];
}

interface ExpenseResponse {
  success: boolean;
  data: Expense;
}

const categories = [
  { value: "travel", label: "Travel" },
  { value: "meals", label: "Meals" },
  { value: "supplies", label: "Supplies" },
  { value: "equipment", label: "Equipment" },
  { value: "office", label: "Office" },
  { value: "marketing", label: "Marketing" },
  { value: "utilities", label: "Utilities" },
  { value: "rent", label: "Rent" },
  { value: "insurance", label: "Insurance" },
  { value: "other", label: "Other" },
];

export default function EditExpensePage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expense, setExpense] = useState<Expense | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const [formData, setFormData] = useState({
    date: "",
    expenseAccount: "",
    amount: "",
    paidThrough: "",
    vendor: "",
    customer: "",
    invoiceNumber: "",
    referenceNumber: "",
    notes: "",
    taxAmount: "",
    taxRate: "",
    isTaxInclusive: false,
    project: "",
    category: "other",
    tags: "",
    reportingTags: "",
    isRecurring: false,
    recurringPattern: {
      frequency: "monthly",
      interval: 1,
      endDate: "",
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (params.id) {
      fetchExpense(params.id as string);
      fetchInitialData();
    }
  }, [params.id]);

  const fetchExpense = async (id: string) => {
    try {
      setLoading(true);
      const response = await api<ExpenseResponse>(`/api/expenses/${id}`);

      if (response.success) {
        const expenseData = response.data;
        setExpense(expenseData);
        setFormData({
          date: expenseData.date.split("T")[0],
          expenseAccount: expenseData.expenseAccount._id,
          amount: expenseData.amount.toString(),
          paidThrough: expenseData.paidThrough._id,
          vendor: expenseData.vendor?._id || "",
          customer: expenseData.customer?._id || "",
          invoiceNumber: expenseData.invoiceNumber || "",
          referenceNumber: expenseData.referenceNumber || "",
          notes: expenseData.notes || "",
          taxAmount: expenseData.taxAmount.toString(),
          taxRate: expenseData.taxRate?.toString() || "",
          isTaxInclusive: expenseData.isTaxInclusive || false,
          project: expenseData.project?._id || "",
          category: expenseData.category,
          tags: expenseData.tags.join(", "),
          reportingTags: expenseData.reportingTags.join(", "),
          isRecurring: expenseData.isRecurring,
          recurringPattern: expenseData.recurringPattern || {
            frequency: "monthly",
            interval: 1,
            endDate: "",
          },
        });
      }
    } catch (error) {
      console.error("Error fetching expense:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInitialData = async () => {
    try {
      const [accountsRes, vendorsRes, customersRes, projectsRes] =
        await Promise.all([
          api<AccountsResponse>("/api/accounts"),
          api<VendorsResponse>("/api/vendors"),
          api<CustomersResponse>("/api/customers"),
          api<ProjectsResponse>("/api/projects"),
        ]);

      if (accountsRes.success) setAccounts(accountsRes.data);
      if (vendorsRes.success) setVendors(vendorsRes.data);
      if (customersRes.success) setCustomers(customersRes.data);
      if (projectsRes.success) setProjects(projectsRes.data);
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

    if (name.startsWith("recurringPattern.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        recurringPattern: {
          ...prev.recurringPattern,
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

    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.expenseAccount)
      newErrors.expenseAccount = "Expense account is required";
    if (!formData.amount || parseFloat(formData.amount) <= 0)
      newErrors.amount = "Amount must be greater than 0";
    if (!formData.paidThrough)
      newErrors.paidThrough = "Paid through account is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !expense) return;

    try {
      setSaving(true);

      const submitData = {
        ...formData,
        amount: parseFloat(formData.amount),
        taxAmount: parseFloat(formData.taxAmount) || 0,
        taxRate: parseFloat(formData.taxRate) || 0,
        tags: formData.tags
          ? formData.tags.split(",").map((tag) => tag.trim())
          : [],
        reportingTags: formData.reportingTags
          ? formData.reportingTags.split(",").map((tag) => tag.trim())
          : [],
        recurringPattern: formData.isRecurring
          ? formData.recurringPattern
          : undefined,
      };

      const response = await api(`/api/expenses/${expense._id}`, {
        method: "PUT",
        body: JSON.stringify(submitData),
      });

      if (response.success) {
        // Upload new files if any
        if (uploadedFiles.length > 0) {
          const formData = new FormData();
          uploadedFiles.forEach((file) => {
            formData.append("receipt", file);
          });

          await api(`/api/expenses/${expense._id}/receipts`, {
            method: "POST",
            body: formData,
          });
        }

        router.push(`/dashboard/purchases/expenses/${expense._id}`);
      }
    } catch (error) {
      console.error("Error updating expense:", error);
    } finally {
      setSaving(false);
    }
  };

  const calculateTotalAmount = () => {
    const amount = parseFloat(formData.amount) || 0;
    const taxAmount = parseFloat(formData.taxAmount) || 0;
    return amount + taxAmount;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading expense...</p>
        </div>
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Expense not found</h3>
        <p className="text-gray-500 mt-2">
          The expense you're trying to edit doesn't exist.
        </p>
        <button
          onClick={() => router.push("/dashboard/purchases/expenses")}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Back to Expenses
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Expense</h1>
          <p className="text-gray-600">Update expense details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Expense Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.date ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.date && (
                    <p className="text-red-500 text-sm mt-1">{errors.date}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expense Account *
                  </label>
                  <select
                    name="expenseAccount"
                    value={formData.expenseAccount}
                    onChange={handleInputChange}
                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.expenseAccount
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">Select an account</option>
                    {accounts.map((account) => (
                      <option key={account._id} value={account._id}>
                        {account.name}
                      </option>
                    ))}
                  </select>
                  {errors.expenseAccount && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.expenseAccount}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      ₹
                    </span>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className={`w-full border rounded-md pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.amount ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.amount && (
                    <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Paid Through *
                  </label>
                  <select
                    name="paidThrough"
                    value={formData.paidThrough}
                    onChange={handleInputChange}
                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.paidThrough ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select an account</option>
                    {accounts.map((account) => (
                      <option key={account._id} value={account._id}>
                        {account.name}
                      </option>
                    ))}
                  </select>
                  {errors.paidThrough && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.paidThrough}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vendor
                  </label>
                  <select
                    name="vendor"
                    value={formData.vendor}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a vendor</option>
                    {vendors.map((vendor) => (
                      <option key={vendor._id} value={vendor._id}>
                        {vendor.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Invoice #
                  </label>
                  <input
                    type="text"
                    name="invoiceNumber"
                    value={formData.invoiceNumber}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Invoice number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer
                  </label>
                  <select
                    name="customer"
                    value={formData.customer}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a customer</option>
                    {customers.map((customer) => (
                      <option key={customer._id} value={customer._id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project
                  </label>
                  <select
                    name="project"
                    value={formData.project}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a project</option>
                    {projects.map((project) => (
                      <option key={project._id} value={project._id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  maxLength={500}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Max. 500 characters"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.notes.length}/500 characters
                </p>
              </div>
            </div>

            {/* Tax Information */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Tax Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    name="taxRate"
                    value={formData.taxRate}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    max="100"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tax Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      ₹
                    </span>
                    <input
                      type="number"
                      name="taxAmount"
                      value={formData.taxAmount}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className="w-full border border-gray-300 rounded-md pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Amount
                  </label>
                  <div className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-900">
                    {formatCurrency(calculateTotalAmount())}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isTaxInclusive"
                    checked={formData.isTaxInclusive}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Tax inclusive
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Receipt Upload */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Receipts
              </h2>

              {/* Existing Receipts */}
              {expense.receipts.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Existing Receipts
                  </h3>
                  <div className="space-y-2">
                    {expense.receipts.map((receipt) => (
                      <div
                        key={receipt._id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <span className="text-sm text-gray-700 truncate">
                          {receipt.originalName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {(receipt.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload New Receipts */}
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center ${
                  dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  Drag and drop additional receipts here
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Maximum file size allowed is 10MB
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
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 cursor-pointer"
                >
                  Upload Files
                </label>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h3 className="text-sm font-medium text-gray-700">
                    New Receipts
                  </h3>
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

            {/* Recurring Options */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Recurring
              </h2>

              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isRecurring"
                    checked={formData.isRecurring}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Make this a recurring expense
                  </span>
                </label>

                {formData.isRecurring && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Frequency
                      </label>
                      <select
                        name="recurringPattern.frequency"
                        value={formData.recurringPattern.frequency}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Interval
                      </label>
                      <input
                        type="number"
                        name="recurringPattern.interval"
                        value={formData.recurringPattern.interval}
                        onChange={handleInputChange}
                        min="1"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        name="recurringPattern.endDate"
                        value={formData.recurringPattern.endDate}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>
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
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <CheckIcon className="h-4 w-4 mr-2" />
                  Update Expense
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
