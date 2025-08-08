"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  mobile?: string;
  workPhone?: string;
  billingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
}

const NewInvoiceForm = () => {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCustomerPreSelected, setShowCustomerPreSelected] = useState(false);

  const [formData, setFormData] = useState({
    invoiceNumber: "INV-000001",
    orderNumber: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    terms: "Due on Receipt",
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    salesperson: "",
    subject: "",
    project: "",
    items: [
      {
        id: 1,
        itemId: "",
        details: "",
        description: "",
        quantity: 1.0,
        unit: "pcs",
        rate: 0.0,
        amount: 0.0,
        taxRate: 0,
        taxAmount: 0,
      },
    ],
    subTotal: 0.0,
    discount: 0,
    discountType: "percentage",
    discountAmount: 0.0,
    taxType: "GST",
    taxRate: 18,
    taxAmount: 0.0,
    shippingCharges: 0.0,
    adjustment: 0.0,
    roundOff: 0.0,
    total: 0.0,
    paymentTerms: "",
    paymentMethod: "",
    customerNotes: "Thanks for your business.",
    termsConditions: "",
    internalNotes: "",
    files: [],
    currency: "INR",
    exchangeRate: 1,
    // Buyer Details
    buyerName: "",
    buyerEmail: "",
    buyerPhone: "",
    buyerGstin: "",
    buyerAddress: "",
    // Seller Details
    sellerName: "",
    sellerEmail: "",
    sellerPhone: "",
    sellerGstin: "",
    sellerAddress: "",
  });

  // Company settings state
  const [companySettings, setCompanySettings] = useState({
    companyName: "ROBOBOOKS SOLUTIONS",
    address: "123 Business Street, Tech Park, Bangalore",
    phone: "+91 98765 43210",
    email: "info@robobooks.com",
    gstin: "29ABCDE1234F1Z5",
    state: "29-Karnataka",
    website: "www.robobooks.com",
  });

  const [showCompanySettings, setShowCompanySettings] = useState(false);

  // Fetch customers from backend and check for pre-selected customer
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch(
          process.env.NEXT_PUBLIC_BACKEND_URL + "/api/customers",
          {
            credentials: 'include',
            headers: {
              "Content-Type": "application/json",
            },
          }
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

          // Check if there's a pre-selected customer from sessionStorage
          const storedCustomerData = sessionStorage.getItem(
            "selectedCustomerForInvoice"
          );
          if (storedCustomerData) {
            try {
              const customerData = JSON.parse(storedCustomerData);
              console.log("Pre-selected customer data:", customerData);

              // Find the customer in the fetched customers list
              const foundCustomer = validCustomers.find(
                (customer) => customer._id === customerData._id
              );

              if (foundCustomer) {
                // Pre-select the customer
                setSelectedCustomer(foundCustomer);
                setSearchTerm(
                  foundCustomer.firstName + " " + foundCustomer.lastName
                );
                setShowCustomerPreSelected(true);

                // Update form data with customer details
                setFormData((prev) => ({
                  ...prev,
                  buyerName:
                    foundCustomer.firstName + " " + foundCustomer.lastName,
                  buyerEmail: foundCustomer.email,
                  buyerPhone:
                    foundCustomer.phone ||
                    foundCustomer.mobile ||
                    foundCustomer.workPhone ||
                    "",
                  buyerAddress: foundCustomer.billingAddress
                    ? `${foundCustomer.billingAddress.street || ""}, ${
                        foundCustomer.billingAddress.city || ""
                      }, ${foundCustomer.billingAddress.state || ""}`.trim()
                    : "",
                }));

                // Hide notification after 3 seconds
                setTimeout(() => {
                  setShowCustomerPreSelected(false);
                }, 3000);
              }

              // Clear the stored data after using it
              sessionStorage.removeItem("selectedCustomerForInvoice");
            } catch (error) {
              console.error("Error parsing stored customer data:", error);
              sessionStorage.removeItem("selectedCustomerForInvoice");
            }
          }
        } else {
          console.error("Error fetching customers:", response.status);
          setCustomers([]);
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
        setCustomers([]);
      }
    };

    const fetchNextInvoiceNumber = async () => {
      try {
        const response = await fetch(
          process.env.NEXT_PUBLIC_BACKEND_URL + "/api/invoices/next-number",
          {
            credentials: 'include',
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data.invoiceNumber) {
            setFormData((prev) => ({
              ...prev,
              invoiceNumber: result.data.invoiceNumber,
            }));
          }
        } else {
          console.error("Error fetching next invoice number:", response.status);
        }
      } catch (error) {
        console.error("Error fetching next invoice number:", error);
      }
    };

    fetchCustomers();
    fetchNextInvoiceNumber();
  }, []);

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: prev.items.length + 1,
          itemId: "",
          details: "",
          description: "",
          quantity: 1.0,
          unit: "pcs",
          rate: 0.0,
          amount: 0.0,
          taxRate: prev.taxRate || 18,
          taxAmount: 0,
        },
      ],
    }));
  };

  // Function to recalculate all totals when tax rate changes
  const recalculateAllTotals = () => {
    setFormData((prev) => {
      const updatedItems = prev.items.map((item) => ({
        ...item,
        taxRate: prev.taxRate,
        taxAmount: ((item.amount || 0) * prev.taxRate) / 100,
      }));

      const subTotal = updatedItems.reduce(
        (sum, item) => sum + (item.amount || 0),
        0
      );
      const discountAmount =
        prev.discountType === "percentage"
          ? (subTotal * prev.discount) / 100
          : prev.discount;
      const totalTax = updatedItems.reduce(
        (sum, item) => sum + (item.taxAmount || 0),
        0
      );
      const total =
        subTotal -
        discountAmount +
        totalTax +
        (prev.shippingCharges || 0) +
        (prev.adjustment || 0) +
        (prev.roundOff || 0);

      return {
        ...prev,
        items: updatedItems,
        subTotal,
        discountAmount,
        taxAmount: totalTax,
        total,
      };
    });
  };

  const removeItem = (id: number) => {
    if (formData.items.length > 1) {
      setFormData((prev) => ({
        ...prev,
        items: prev.items.filter((item) => item.id !== id),
      }));
    }
  };

  const updateItem = (id: number, field: string, value: string | number) => {
    setFormData((prev) => {
      const updatedItems = prev.items.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };

          // Auto-calculate amount when quantity or rate changes
          if (field === "quantity" || field === "rate") {
            const qty =
              field === "quantity" ? Number(value) || 0 : item.quantity || 0;
            const rate = field === "rate" ? Number(value) || 0 : item.rate || 0;
            updatedItem.amount = qty * rate;
            // Use the current tax rate from the form
            updatedItem.taxRate = prev.taxRate || 0;
            updatedItem.taxAmount =
              (updatedItem.amount * (prev.taxRate || 0)) / 100;
          }

          return updatedItem;
        }
        return item;
      });

      // Recalculate totals
      const subTotal = updatedItems.reduce(
        (sum, item) => sum + (item.amount || 0),
        0
      );
      const discountAmount =
        prev.discountType === "percentage"
          ? (subTotal * prev.discount) / 100
          : prev.discount;
      const totalTax = updatedItems.reduce(
        (sum, item) => sum + (item.taxAmount || 0),
        0
      );
      const total =
        subTotal -
        discountAmount +
        totalTax +
        (prev.shippingCharges || 0) +
        (prev.adjustment || 0) +
        (prev.roundOff || 0);

      return {
        ...prev,
        items: updatedItems,
        subTotal,
        discountAmount,
        taxAmount: totalTax,
        total,
      };
    });
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

  const handleSaveInvoice = async (asDraft = false) => {
    try {
      if (!selectedCustomer) {
        alert("Please select a customer");
        return;
      }

      // Remove undefined fields and ensure proper data types
      const { project, ...formDataWithoutProject } = formData;

      const invoiceData = {
        ...formDataWithoutProject,
        customerId: selectedCustomer._id,
        customerName:
          selectedCustomer.firstName + " " + selectedCustomer.lastName,
        customerEmail: selectedCustomer.email,
        customerPhone: selectedCustomer.phone,
        status: asDraft ? "Draft" : "Sent",
        invoiceDate: new Date(formData.invoiceDate),
        dueDate: new Date(formData.dueDate),
        // Clean up items - remove empty itemId fields
        items: formData.items.map((item) => ({
          ...item,
          itemId: item.itemId || undefined,
        })),
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/invoices`,
        {
          method: "POST",
          credentials: 'include',
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(invoiceData),
        }
      );

      const result = await response.json();

      if (response.ok) {
        console.log("Invoice saved successfully", result);
        alert(
          `Invoice ${
            asDraft ? "saved as draft" : "created and sent"
          } successfully!`
        );
        // Redirect to invoices list
        window.location.href = "/dashboard/sales/invoices";
      } else {
        console.error("Error saving invoice:", result.error);
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Error saving invoice:", error);
      alert("Error saving invoice. Please try again.");
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">New Invoice</h1>
          <div className="flex items-center space-x-2">
            <button
              className="p-2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowCompanySettings(!showCompanySettings)}
            >
              <Cog6ToothIcon className="h-5 w-5" />
            </button>
            <button
              className="p-2 text-gray-400 hover:text-gray-600"
              onClick={() => router.push("/dashboard/sales/invoices")}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Customer Pre-selected Notification */}
      {showCustomerPreSelected && (
        <div className="bg-green-50 border border-green-200 px-6 py-3">
          <div className="flex items-center">
            <CheckIcon className="h-5 w-5 text-green-600 mr-2" />
            <p className="text-green-800 text-sm">
              Customer has been pre-selected from the customer details page.
            </p>
          </div>
        </div>
      )}

      {/* Company Settings Modal */}
      {showCompanySettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Company Settings
              </h2>
              <button
                onClick={() => setShowCompanySettings(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={companySettings.companyName}
                  onChange={(e) =>
                    setCompanySettings((prev) => ({
                      ...prev,
                      companyName: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  rows={3}
                  value={companySettings.address}
                  onChange={(e) =>
                    setCompanySettings((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={companySettings.phone}
                    onChange={(e) =>
                      setCompanySettings((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={companySettings.email}
                    onChange={(e) =>
                      setCompanySettings((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GSTIN
                  </label>
                  <input
                    type="text"
                    value={companySettings.gstin}
                    onChange={(e) =>
                      setCompanySettings((prev) => ({
                        ...prev,
                        gstin: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={companySettings.state}
                    onChange={(e) =>
                      setCompanySettings((prev) => ({
                        ...prev,
                        state: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="text"
                  value={companySettings.website}
                  onChange={(e) =>
                    setCompanySettings((prev) => ({
                      ...prev,
                      website: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCompanySettings(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowCompanySettings(false)}
                className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

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

              {/* Buyer Details Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Buyer Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Buyer Name
                    </label>
                    <input
                      type="text"
                      value={formData.buyerName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          buyerName: e.target.value,
                        }))
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
                      value={formData.buyerEmail}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          buyerEmail: e.target.value,
                        }))
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
                      value={formData.buyerPhone}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          buyerPhone: e.target.value,
                        }))
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
                      value={formData.buyerGstin}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          buyerGstin: e.target.value,
                        }))
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
                      rows={3}
                      value={formData.buyerAddress}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          buyerAddress: e.target.value,
                        }))
                      }
                      placeholder="Enter buyer address"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Seller Details Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Seller Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Seller Name
                    </label>
                    <input
                      type="text"
                      value={formData.sellerName || companySettings.companyName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          sellerName: e.target.value,
                        }))
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
                      value={formData.sellerEmail || companySettings.email}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          sellerEmail: e.target.value,
                        }))
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
                      value={formData.sellerPhone || companySettings.phone}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          sellerPhone: e.target.value,
                        }))
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
                      value={formData.sellerGstin || companySettings.gstin}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          sellerGstin: e.target.value,
                        }))
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
                      rows={3}
                      value={formData.sellerAddress || companySettings.address}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          sellerAddress: e.target.value,
                        }))
                      }
                      placeholder="Enter seller address"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
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
                    type="date"
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
                    type="date"
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
                          ₹{(formData.subTotal || 0).toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Discount</span>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            step="0.01"
                            className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                            value={formData.discount}
                            onChange={(e) => {
                              const discount = parseFloat(e.target.value) || 0;
                              const discountAmount =
                                formData.discountType === "percentage"
                                  ? (formData.subTotal * discount) / 100
                                  : discount;
                              const total =
                                formData.subTotal -
                                discountAmount +
                                formData.taxAmount +
                                formData.shippingCharges +
                                formData.adjustment +
                                formData.roundOff;
                              setFormData((prev) => ({
                                ...prev,
                                discount: discount,
                                discountAmount: discountAmount,
                                total: total,
                              }));
                            }}
                          />
                          <select
                            className="text-sm border border-gray-300 rounded px-1"
                            value={formData.discountType}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                discountType: e.target.value as
                                  | "percentage"
                                  | "amount",
                              }))
                            }
                          >
                            <option value="percentage">%</option>
                            <option value="amount">₹</option>
                          </select>
                          <span className="text-sm font-medium">
                            ₹{(formData.discountAmount || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="border-t pt-3">
                        <div className="mb-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tax Type
                          </label>
                          <select
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                            value={formData.taxType}
                            onChange={(e) => {
                              setFormData((prev) => ({
                                ...prev,
                                taxType: e.target.value,
                              }));
                              setTimeout(recalculateAllTotals, 0);
                            }}
                          >
                            <option value="GST">GST</option>
                            <option value="IGST">IGST</option>
                            <option value="CGST">CGST</option>
                            <option value="SGST">SGST</option>
                            <option value="TDS">TDS</option>
                            <option value="TCS">TCS</option>
                          </select>
                        </div>
                        <div className="mb-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tax Rate (%)
                          </label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              step="0.01"
                              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md"
                              value={formData.taxRate}
                              onChange={(e) => {
                                const taxRate = parseFloat(e.target.value) || 0;
                                setFormData((prev) => ({
                                  ...prev,
                                  taxRate,
                                }));
                                setTimeout(recalculateAllTotals, 0);
                              }}
                            />
                            <span className="text-sm text-gray-500">%</span>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">
                            Tax Amount
                          </span>
                          <span className="text-sm font-medium">
                            ₹{(formData.taxAmount || 0).toFixed(2)}
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
                                adjustment: parseFloat(e.target.value) || 0,
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
                            ₹{(formData.total || 0).toFixed(2)}
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
            <button
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              onClick={() => handleSaveInvoice(true)}
            >
              Save as Draft
            </button>
            <button
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              onClick={() => handleSaveInvoice(false)}
            >
              Save and Send
            </button>
            <button
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              onClick={() => router.push("/dashboard/sales/invoices")}
            >
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
          <span>Total Amount: ₹{(formData.total || 0).toFixed(2)}</span>
          <span className="ml-4">Total Quantity: {formData.items.length}</span>
        </div>
      </div>
    </div>
  );
};

export default NewInvoiceForm;
