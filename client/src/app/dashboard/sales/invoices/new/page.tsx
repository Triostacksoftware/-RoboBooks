"use client";

import React, { useState, useEffect } from "react";
import {
  XMarkIcon,
  Cog6ToothIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  InformationCircleIcon,
  PencilIcon,
  QrCodeIcon,
  CheckIcon,
  PlusIcon,
  PaperClipIcon,
  ArrowPathIcon,
  QuestionMarkCircleIcon,
  BellIcon,
  ChatBubbleLeftRightIcon,
  UserCircleIcon,
  CalendarIcon,
  ListBulletIcon,
} from "@heroicons/react/24/outline";

interface Customer {
  firstName: string;
  _id: string;
  name: string;
  email: string;
  phone?: string;
  lastName: string;
}

interface InvoiceItem {
  id: number;
  details: string;
  quantity: string;
  rate: string;
  amount: string;
}

const NewInvoiceForm = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    invoiceNumber: "INV-000001",
    orderNumber: "",
    invoiceDate: "06/08/2025",
    terms: "Due on Receipt",
    dueDate: "06/08/2025",
    salesperson: "",
    subject: "",
    items: [
      {
        id: 1,
        details: "",
        quantity: "1.00",
        rate: "0.00",
        amount: "0.00",
      },
    ],
    subTotal: "0.00",
    discount: "0",
    discountAmount: "0.00",
    taxType: "TDS",
    taxAmount: "-0.00",
    adjustment: "0.00",
    total: "0.00",
    customerNotes: "Thanks for your business.",
    termsConditions: "",
    files: [],
  });

  // Fetch customers from backend
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch(
          process.env.NEXT_PUBLIC_BACKEND_URL + "/api/customers"
        );
        if (response.ok) {
          const responseData = await response.json();
          console.log("Raw API response:", responseData);
          // Handle the response structure: {success: true, data: [...]}
          const customersData = responseData.data || responseData;
          console.log("Customers data:", customersData);
          // Filter out any undefined/null customers and ensure they have required fields
          const validCustomers = Array.isArray(customersData)
            ? customersData.filter(
                (customer) =>
                  customer &&
                  customer._id &&
                  customer.firstName &&
                  customer.email
              )
            : [];
          console.log("Valid customers:", validCustomers);
          setCustomers(validCustomers);
        } else {
          console.error("Error fetching customers:", response.status);
          setCustomers([]);
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
        setCustomers([]);
      }
    };

    fetchCustomers();
  }, []);

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: prev.items.length + 1,
          details: "",
          quantity: "1.00",
          rate: "0.00",
          amount: "0.00",
        },
      ],
    }));
  };

  const removeItem = (id: number) => {
    if (formData.items.length > 1) {
      setFormData((prev) => ({
        ...prev,
        items: prev.items.filter((item) => item.id !== id),
      }));
    }
  };

  const updateItem = (id: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const filteredCustomers = (customers || []).filter(
    (customer) =>
      customer &&
      customer.firstName &&
      customer.email &&
      (customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCustomerDropdown(false);
    setSearchTerm(customer.firstName + " " + customer.lastName);
  };

  const handleSaveInvoice = async () => {
    try {
      const invoiceData = {
        ...formData,
        customerId: selectedCustomer?._id,
        customerName: selectedCustomer?.name,
      };

      const response = await fetch("http://localhost:5000/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invoiceData),
      });

      if (response.ok) {
        console.log("Invoice saved successfully");
        // Redirect to invoices list or show success message
      } else {
        console.error("Error saving invoice");
      }
    } catch (error) {
      console.error("Error saving invoice:", error);
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">New Invoice</h1>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <Cog6ToothIcon className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              {/* Customer Details Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name*
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Select or add a customer"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowCustomerDropdown(true);
                    }}
                    onFocus={() => setShowCustomerDropdown(true)}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                    <ChevronDownIcon className="h-4 w-4 text-gray-400 ml-1" />
                  </div>

                  {/* Customer Dropdown */}
                  {showCustomerDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredCustomers.map((customer) => (
                        <div
                          key={customer._id}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleCustomerSelect(customer)}
                        >
                          <div className="font-medium">
                            {customer.firstName + customer.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {customer.email}
                          </div>
                        </div>
                      ))}
                      {filteredCustomers.length === 0 && (
                        <div className="px-4 py-2 text-gray-500">
                          No customers found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Invoice Details Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invoice#
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.invoiceNumber}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      readOnly
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <Cog6ToothIcon className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order Number
                  </label>
                  <input
                    type="text"
                    placeholder=""
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.orderNumber}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        orderNumber: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invoice Date*
                  </label>
                  <input
                    type="text"
                    value={formData.invoiceDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        invoiceDate: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Terms
                  </label>
                  <div className="relative">
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                      value={formData.terms}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          terms: e.target.value,
                        }))
                      }
                    >
                      <option>Due on Receipt</option>
                      <option>Net 15</option>
                      <option>Net 30</option>
                      <option>Net 60</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date
                  </label>
                  <input
                    type="text"
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        dueDate: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salesperson
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Select or Add Salesperson"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.salesperson}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          salesperson: e.target.value,
                        }))
                      }
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center">
                      Subject
                      <InformationCircleIcon className="h-4 w-4 text-gray-400 ml-1" />
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Let your customer know what this Invoice is for"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          subject: e.target.value,
                        }))
                      }
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <PencilIcon className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Item Table Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Item Table
                  </h3>
                  <div className="flex space-x-2">
                    <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                      <QrCodeIcon className="h-4 w-4 mr-2" />
                      Scan Item
                    </button>
                    <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                      <CheckIcon className="h-4 w-4 mr-2" />
                      Bulk Actions
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ITEM DETAILS
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          QUANTITY
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          RATE
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          AMOUNT
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {formData.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="text"
                              placeholder="Type or click to select an item."
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              value={item.details}
                              onChange={(e) =>
                                updateItem(item.id, "details", e.target.value)
                              }
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              value={item.quantity}
                              onChange={(e) =>
                                updateItem(item.id, "quantity", e.target.value)
                              }
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              value={item.rate}
                              onChange={(e) =>
                                updateItem(item.id, "rate", e.target.value)
                              }
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              value={item.amount}
                              onChange={(e) =>
                                updateItem(item.id, "amount", e.target.value)
                              }
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={addItem}
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add New Row
                    <ChevronDownIcon className="h-4 w-4 ml-2" />
                  </button>
                  <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Items in Bulk
                  </button>
                </div>
              </div>

              {/* Summary Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  {/* Customer Notes */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Notes
                    </label>
                    <div className="relative">
                      <textarea
                        rows={4}
                        placeholder="Thanks for your business."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.customerNotes}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            customerNotes: e.target.value,
                          }))
                        }
                      />
                      <div className="absolute bottom-2 right-2">
                        <PencilIcon className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Will be displayed on the invoice
                    </p>
                  </div>

                  {/* Terms & Conditions */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Terms & Conditions
                    </label>
                    <div className="relative">
                      <textarea
                        rows={4}
                        placeholder="Enter the terms and conditions of your business to be displayed in your transaction"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.termsConditions}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            termsConditions: e.target.value,
                          }))
                        }
                      />
                      <div className="absolute bottom-2 right-2">
                        <PencilIcon className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Attach Files */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Attach File(s) to Invoice
                    </label>
                    <div className="flex items-center space-x-2">
                      <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                        <PaperClipIcon className="h-4 w-4 mr-2" />
                        Upload File
                        <ChevronDownIcon className="h-4 w-4 ml-2" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      You can upload a maximum of 10 files, 10MB each
                    </p>
                  </div>

                  {/* Payment Gateway Promotion */}
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-900">
                          Want to get paid faster?
                        </p>
                        <p className="text-sm text-blue-700 mt-1">
                          Configure payment gateways and receive payments
                          online.{" "}
                          <button className="text-blue-600 hover:text-blue-800 underline">
                            Set up Payment Gateway
                          </button>
                        </p>
                      </div>
                      <div className="text-xs text-blue-600">WA</div>
                    </div>
                  </div>
                </div>

                {/* Summary Sidebar */}
                <div className="lg:col-span-1">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Summary
                    </h3>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Sub Total</span>
                        <span className="text-sm font-medium">
                          ₹{formData.subTotal}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Discount</span>
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                            value={formData.discount}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                discount: e.target.value,
                              }))
                            }
                          />
                          <span className="text-sm">%</span>
                          <span className="text-sm font-medium">
                            ₹{formData.discountAmount}
                          </span>
                        </div>
                      </div>

                      <div className="border-t pt-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <input
                            type="radio"
                            id="tds"
                            name="taxType"
                            value="TDS"
                            checked={formData.taxType === "TDS"}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                taxType: e.target.value,
                              }))
                            }
                          />
                          <label
                            htmlFor="tds"
                            className="text-sm text-gray-600"
                          >
                            TDS
                          </label>
                          <input
                            type="radio"
                            id="tcs"
                            name="taxType"
                            value="TCS"
                            checked={formData.taxType === "TCS"}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                taxType: e.target.value,
                              }))
                            }
                          />
                          <label
                            htmlFor="tcs"
                            className="text-sm text-gray-600"
                          >
                            TCS
                          </label>
                        </div>
                        <div className="relative">
                          <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md">
                            <option>Select a Tax</option>
                          </select>
                          <span className="absolute right-3 top-2 text-sm text-gray-500">
                            {formData.taxAmount}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Adjustment
                        </span>
                        <div className="flex items-center space-x-1">
                          <input
                            type="text"
                            className="w-20 px-2 py-1 text-sm border border-dashed border-gray-300 rounded"
                            value={formData.adjustment}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                adjustment: e.target.value,
                              }))
                            }
                          />
                          <QuestionMarkCircleIcon className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>

                      <div className="border-t pt-3">
                        <div className="flex justify-between">
                          <span className="text-lg font-semibold">
                            Total (₹)
                          </span>
                          <span className="text-lg font-semibold">
                            ₹{formData.total}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              Save as Draft
            </button>
            <button
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              onClick={handleSaveInvoice}
            >
              Save and Send
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              Cancel
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Make Recurring
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-2 text-sm text-gray-600">
          <span>Total Amount: ₹{formData.total}</span>
          <span className="ml-4">Total Quantity: {formData.items.length}</span>
        </div>
      </div>

      {/* Right Sidebar Icons */}
      <div className="fixed right-0 top-1/2 transform -translate-y-1/2 bg-white border-l border-gray-200 p-2 space-y-2">
        <button className="relative p-2 text-gray-400 hover:text-gray-600">
          <BellIcon className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            1
          </span>
        </button>
        <button className="p-2 text-gray-400 hover:text-gray-600">
          <ChatBubbleLeftRightIcon className="h-5 w-5" />
        </button>
        <button className="p-2 text-gray-400 hover:text-gray-600">
          <ListBulletIcon className="h-5 w-5" />
        </button>
        <button className="p-2 text-gray-400 hover:text-gray-600">
          <CalendarIcon className="h-5 w-5" />
        </button>
        <button className="p-2 text-gray-400 hover:text-gray-600">
          <Cog6ToothIcon className="h-5 w-5" />
        </button>
        <button className="p-2 text-gray-400 hover:text-gray-600">
          <ChevronDownIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default NewInvoiceForm;
