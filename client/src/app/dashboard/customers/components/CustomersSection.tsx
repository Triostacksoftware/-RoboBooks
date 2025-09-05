/* eslint-disable react/jsx-no-undef */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronDownIcon,
  EllipsisVerticalIcon,
  FunnelIcon,
  XMarkIcon,
  PencilIcon,
  MagnifyingGlassIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { Customer } from "@/services/customerService";
import BulkUploadModal from "./BulkUploadModal";
import { ArrowUpTrayIcon } from "@heroicons/react/24/solid";
import { formatCurrency } from "@/utils/currency";

export default function CustomersSection() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeHeader, setActiveHeader] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<
    "overview" | "comments" | "transactions" | "mails" | "statement"
  >("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [bulkUploadModalOpen, setBulkUploadModalOpen] = useState(false);
  const router = useRouter();

  // Fetch customers from backend
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL + "/api/customers",
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const result = await response.json();

      if (response.ok) {
        setCustomers(result.data || []);
      } else {
        setError(result.message || "Failed to fetch customers");
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      setError("Failed to fetch customers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Load customers on component mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleHeaderClick = (key: string) => {
    setActiveHeader(activeHeader === key ? null : key);
  };

  const handleCustomerClick = (customer: Customer) => {
    setSelectedCustomer(customer);
  };

  const closeCustomerDetails = () => {
    setSelectedCustomer(null);
  };


  const getCustomerType = (customer: Customer) => {
    return customer.customerType;
  };

  const getCustomerName = (customer: Customer) => {
    return customer.displayName || `${customer.firstName} ${customer.lastName}`;
  };

  // Filter customers based on search query
  const filteredCustomers = customers.filter((customer) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      customer.displayName.toLowerCase().includes(query) ||
      customer.firstName.toLowerCase().includes(query) ||
      customer.lastName.toLowerCase().includes(query) ||
      (customer.companyName &&
        customer.companyName.toLowerCase().includes(query)) ||
      customer.email.toLowerCase().includes(query)
    );
  });

  // Render minimal list item (when customer is selected)
  const renderMinimalListItem = (customer: Customer) => (
    <div
      key={customer._id}
      className={`p-4 hover:bg-gray-50 cursor-pointer border-l-4 ${
        selectedCustomer && selectedCustomer._id === customer._id
          ? "border-blue-500 bg-blue-50"
          : "border-transparent"
      }`}
      onClick={() => handleCustomerClick(customer)}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-medium text-sm">
                {customer.firstName.charAt(0)}
                {customer.lastName.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {getCustomerName(customer)}
              </p>
              <p className="text-xs text-gray-500 truncate">{customer.email}</p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">
            {formatCurrency(customer.receivables)}
          </p>
          <p className="text-xs text-gray-500">{getCustomerType(customer)}</p>
        </div>
      </div>
    </div>
  );

  // Render table row
  const renderTableRow = (customer: Customer) => {
    const isSelected =
      selectedCustomer && selectedCustomer._id === customer._id;
    return (
      <tr
        key={customer._id}
        className={`border-t hover:bg-gray-50 cursor-pointer ${
          isSelected ? "bg-blue-50 border-r-2 border-blue-500" : ""
        }`}
        onClick={() => handleCustomerClick(customer)}
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">
              {getCustomerName(customer)}
            </span>
            {customer.companyName && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {customer.companyName}
              </span>
            )}
          </div>
        </td>
        <td className="px-4 py-3 text-sm">{customer.companyName || "-"}</td>
        <td className="px-4 py-3 text-sm">{customer.email}</td>
        <td className="px-4 py-3 text-sm">
          {customer.workPhone || customer.mobile || "-"}
        </td>
        <td className="px-4 py-3 text-sm">
          {formatCurrency(customer.receivables)}
        </td>
        <td className="px-4 py-3 text-sm">
          {formatCurrency(customer.unusedCredits)}
        </td>
      </tr>
    );
  };

  if (loading) {
    return (
      <section className="w-full h-full overflow-auto bg-white text-sm">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600">Loading customers...</span>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full h-full overflow-auto bg-white text-sm">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 mb-2">Error loading customers</div>
            <div className="text-gray-600 text-sm mb-4">{error}</div>
            <button
              onClick={fetchCustomers}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full h-full overflow-auto bg-white text-sm">
      {/* Main Content Area */}
      <div className="flex h-full">
        {/* Left Panel - Customers List/Table */}
        <div
          className={`${
            selectedCustomer ? "w-1/3" : "w-full"
          } border-r border-gray-200`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center gap-4">
              {/* Back Button */}
              <button
                onClick={() => router.push("/dashboard")}
                className="flex items-center gap-2 px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200 text-gray-700 hover:text-gray-900"
                aria-label="Go back to Dashboard"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                <span className="text-sm font-medium">Back</span>
              </button>

              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-900">
                  Active Customers
                </h2>
                <ChevronDownIcon className="h-4 w-4 text-gray-500" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/customers/new"
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm inline-block no-underline"
                title="Add New Customer"
              >
                + New
              </Link>
              <button
                onClick={() => setBulkUploadModalOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                title="Bulk Upload Customers"
              >
                <ArrowUpTrayIcon className="w-4 h-4" />
                Bulk Upload
              </button>
              <button
                className="p-2 hover:bg-gray-100 rounded-md"
                title="More Actions"
              >
                <EllipsisVerticalIcon className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-4 bg-white border-b border-gray-200">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search in Customers (/)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Customers Content - Table or Minimal List */}
          {selectedCustomer ? (
            // Minimal List View when customer is selected
            <div className="flex-1 overflow-y-auto">
              {filteredCustomers.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No customers found
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredCustomers.map(renderMinimalListItem)}
                </div>
              )}
            </div>
          ) : (
            // Full Table View when no customer is selected
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-gray-50 text-xs text-gray-600 uppercase border-b">
                  <tr>
                    <th className="px-4 py-3 cursor-pointer">
                      <button
                        onClick={() => handleHeaderClick("name")}
                        className={`flex items-center gap-2 ${
                          activeHeader === "name"
                            ? "text-blue-600 font-semibold"
                            : ""
                        }`}
                      >
                        <FunnelIcon className="h-4 w-4" />
                        <input
                          type="checkbox"
                          className="accent-blue-500"
                          aria-label="Select all customers"
                          title="Select all customers"
                        />
                        <span>NAME</span>
                      </button>
                    </th>
                    {[
                      { key: "companyName", label: "COMPANY NAME" },
                      { key: "email", label: "EMAIL" },
                      { key: "phone", label: "WORK PHONE" },
                      { key: "receivables", label: "RECEIVABLES (BCY)" },
                      { key: "unusedCredits", label: "UNUSED CREDITS (BCY)" },
                    ].map(({ key, label }) => (
                      <th key={key} className="px-4 py-3 cursor-pointer">
                        <button
                          onClick={() => handleHeaderClick(key)}
                          className={`uppercase ${
                            activeHeader === key
                              ? "text-blue-600 font-semibold"
                              : ""
                          }`}
                        >
                          {label}
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-16 text-gray-500 text-base font-medium"
                      >
                        No customers found. Create your first customer to get
                        started.
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map(renderTableRow)
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Panel - Customer Details */}
        {selectedCustomer && (
          <div className="w-2/3 bg-white">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900">
                {getCustomerName(selectedCustomer)}
              </h1>
              <div className="flex items-center gap-2">
                <button
                  className="p-2 hover:bg-gray-100 rounded-md"
                  title="Edit"
                >
                  <PencilIcon className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  className="p-2 hover:bg-gray-100 rounded-md"
                  title="More"
                >
                  <EllipsisVerticalIcon className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={closeCustomerDetails}
                  className="p-2 hover:bg-gray-100 rounded-md"
                  title="Close"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              {[
                { key: "overview", label: "Overview" },
                { key: "comments", label: "Comments" },
                { key: "transactions", label: "Transactions" },
                { key: "mails", label: "Mails" },
                { key: "statement", label: "Statement" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === key
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === "overview" && (
                <div className="space-y-8">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {getCustomerName(selectedCustomer)}
                    </h3>
                    {selectedCustomer.companyName && (
                      <p className="text-gray-600">
                        {selectedCustomer.companyName}
                      </p>
                    )}
                  </div>

                  {/* Contact Details */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-medium">
                          {selectedCustomer.firstName.charAt(0)}
                          {selectedCustomer.lastName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {getCustomerName(selectedCustomer)}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {selectedCustomer.email}
                        </p>
                      </div>
                      <div className="ml-auto flex gap-2">
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          Invite to Portal
                        </button>
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          Send Email
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <svg
                            className="w-4 h-4 text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Address Section */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">ADDRESS</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">
                          Billing Address
                        </h5>
                        {selectedCustomer.billingAddress &&
                        selectedCustomer.billingAddress.street ? (
                          <div className="text-sm text-gray-600">
                            <p>{selectedCustomer.billingAddress.street}</p>
                            <p>
                              {selectedCustomer.billingAddress.city},{" "}
                              {selectedCustomer.billingAddress.state}
                            </p>
                            <p>
                              {selectedCustomer.billingAddress.country}{" "}
                              {selectedCustomer.billingAddress.zipCode}
                            </p>
                          </div>
                        ) : (
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            No Billing Address - New Address
                          </button>
                        )}
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">
                          Shipping Address
                        </h5>
                        {selectedCustomer.shippingAddress &&
                        selectedCustomer.shippingAddress.street ? (
                          <div className="text-sm text-gray-600">
                            <p>{selectedCustomer.shippingAddress.street}</p>
                            <p>
                              {selectedCustomer.shippingAddress.city},{" "}
                              {selectedCustomer.shippingAddress.state}
                            </p>
                            <p>
                              {selectedCustomer.shippingAddress.country}{" "}
                              {selectedCustomer.shippingAddress.zipCode}
                            </p>
                          </div>
                        ) : (
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            No Shipping Address - New Address
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Other Details */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">OTHER DETAILS</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                      <div>
                        <span className="text-gray-500">Customer Type:</span>
                        <p className="font-medium mt-1">
                          {getCustomerType(selectedCustomer)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Default Currency:</span>
                        <p className="font-medium mt-1">
                          {selectedCustomer.currency}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Portal Status:</span>
                        <p className="font-medium mt-1">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              selectedCustomer.portalEnabled
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {selectedCustomer.portalEnabled
                              ? "Enabled"
                              : "Disabled"}
                          </span>
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Portal Language:</span>
                        <p className="font-medium mt-1">
                          {selectedCustomer.portalLanguage}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Contact Persons */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">
                      CONTACT PERSONS
                    </h4>
                    {selectedCustomer.contactPersons &&
                    selectedCustomer.contactPersons.length > 0 ? (
                      <div className="space-y-3">
                        {selectedCustomer.contactPersons.map(
                          (person, index) => (
                            <div key={index} className="border rounded-lg p-3">
                              <div className="text-sm">
                                <span className="text-gray-500">Name:</span>
                                <p className="font-medium mt-1">
                                  {person.name}
                                </p>
                              </div>
                              <div className="text-sm mt-2">
                                <span className="text-gray-500">Email:</span>
                                <p className="font-medium mt-1">
                                  {person.email}
                                </p>
                              </div>
                              <div className="text-sm mt-2">
                                <span className="text-gray-500">Phone:</span>
                                <p className="font-medium mt-1">
                                  {person.phone}
                                </p>
                              </div>
                              <div className="text-sm mt-2">
                                <span className="text-gray-500">
                                  Designation:
                                </span>
                                <p className="font-medium mt-1">
                                  {person.designation}
                                </p>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500">No contact persons found.</p>
                    )}
                  </div>

                  {/* Customer Portal Information */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-green-600 text-lg">🛡️</div>
                      <div className="text-sm text-green-800">
                        <p className="font-medium mb-1">Customer Portal</p>
                        <p>
                          Customer Portal allows your customers to keep track of
                          all the transactions between them and your business.{" "}
                          <button className="text-green-700 hover:text-green-900 font-medium">
                            Learn More
                          </button>
                        </p>
                        <button className="mt-3 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                          Enable Portal
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* What's Next */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">
                      WHAT&#39;S NEXT?
                    </h4>
                    <p className="text-sm text-gray-600">
                      Create an invoice or a quote and send it to your customer.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          // Navigate to new invoice page with customer details
                          const customerData = {
                            _id: selectedCustomer._id,
                            firstName: selectedCustomer.firstName,
                            lastName: selectedCustomer.lastName,
                            email: selectedCustomer.email,
                            phone:
                              selectedCustomer.mobile ||
                              selectedCustomer.workPhone,
                            name: getCustomerName(selectedCustomer),
                          };

                          // Store customer data in sessionStorage for the new invoice page
                          sessionStorage.setItem(
                            "selectedCustomerForInvoice",
                            JSON.stringify(customerData)
                          );

                          // Navigate to new invoice page
                          router.push("/dashboard/sales/invoices/new");
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                      >
                        New Invoice
                      </button>
                      <button
                        onClick={() => {
                          // Navigate to new quote page with customer details
                          const customerData = {
                            _id: selectedCustomer._id,
                            firstName: selectedCustomer.firstName,
                            lastName: selectedCustomer.lastName,
                            email: selectedCustomer.email,
                            phone:
                              selectedCustomer.mobile ||
                              selectedCustomer.workPhone,
                            name: getCustomerName(selectedCustomer),
                          };

                          // Store customer data in sessionStorage for the new quote page
                          sessionStorage.setItem(
                            "selectedCustomerForQuote",
                            JSON.stringify(customerData)
                          );

                          // Navigate to new quote page
                          router.push("/dashboard/sales/quotes/new");
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                      >
                        New Quote
                      </button>
                    </div>
                  </div>

                  {/* Payment Terms */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">
                      Payment due period
                    </h4>
                    <p className="text-sm text-gray-600">
                      {selectedCustomer.paymentTerms}
                    </p>
                  </div>

                  {/* Receivables */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Receivables</h4>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-gray-500">CURRENCY:</span>
                        <p className="font-medium mt-1">
                          {selectedCustomer.currency} -{" "}
                          {selectedCustomer.currency === "INR"
                            ? "Indian Rupee"
                            : "Currency"}
                        </p>
                      </div>
                      <div>
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          Enter Opening Balance
                        </button>
                      </div>
                      <div>
                        <span className="text-gray-500">
                          OUTSTANDING RECEIVABLES:
                        </span>
                        <p className="font-medium mt-1">
                          {formatCurrency(selectedCustomer.receivables)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">UNUSED CREDITS:</span>
                        <p className="font-medium mt-1">
                          {formatCurrency(selectedCustomer.unusedCredits)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Income Chart */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Income</h4>
                    <p className="text-xs text-gray-500">
                      This chart is displayed in the organization&#39;s base
                      currency.
                    </p>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h5 className="font-medium text-gray-900">Income</h5>
                        <div className="flex gap-2">
                          <select className="text-xs border border-gray-300 rounded px-2 py-1">
                            <option>Last 6 Months</option>
                          </select>
                          <select className="text-xs border border-gray-300 rounded px-2 py-1">
                            <option>Accrual</option>
                          </select>
                        </div>
                      </div>

                      {/* Chart Container with Axes */}
                      <div className="bg-white rounded border p-4 relative">
                        {/* Y-axis labels */}
                        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 w-8">
                          <span>5K</span>
                          <span>4K</span>
                          <span>3K</span>
                          <span>2K</span>
                          <span>1K</span>
                          <span>0</span>
                        </div>

                        {/* Chart Area */}
                        <div className="ml-8 h-32 relative">
                          {/* Grid Lines */}
                          <div className="absolute inset-0 flex flex-col justify-between">
                            {[0, 1, 2, 3, 4, 5].map((line) => (
                              <div
                                key={line}
                                className="border-b border-gray-100 h-0"
                              ></div>
                            ))}
                          </div>

                          {/* Chart Bars (empty for now) */}
                          <div className="absolute bottom-0 left-0 right-0 flex justify-between items-end px-2">
                            {[
                              "Feb 2025",
                              "Mar 2025",
                              "Apr 2025",
                              "May 2025",
                              "Jun 2025",
                              "Jul 2025",
                              "Aug 2025",
                            ].map((month) => (
                              <div
                                key={month}
                                className="flex flex-col items-center"
                              >
                                <div
                                  className="w-6 bg-gray-200 rounded-t"
                                  style={{ height: "4px" }}
                                ></div>
                                <span className="text-xs text-gray-500 mt-1">
                                  {month}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-2 text-left">
                        <p className="text-sm text-gray-600">
                          Total Income (Last 6 Months) - {formatCurrency(0)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Activity Timeline */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">
                      ACTIVITY TIMELINE
                    </h4>
                    <div className="relative">
                      {/* Timeline Line */}
                      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-blue-200"></div>

                      {/* Timeline Items */}
                      <div className="space-y-6">
                        {/* Timeline Item 1 */}
                        <div className="relative flex items-start">
                          {/* Timeline Dot */}
                          <div className="absolute left-4 top-2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-sm"></div>

                          {/* Timeline Content */}
                          <div className="ml-12 flex-1">
                            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                              <div className="flex justify-between items-start mb-2">
                                <h5 className="font-medium text-gray-900">
                                  Contact person added
                                </h5>
                                <span className="text-xs text-gray-500">
                                  06/08/2025 01:05 PM
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">
                                Contact person {selectedCustomer.firstName} has
                                been created by{" "}
                                {getCustomerName(selectedCustomer)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Timeline Item 2 */}
                        <div className="relative flex items-start">
                          {/* Timeline Dot */}
                          <div className="absolute left-4 top-2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-sm"></div>

                          {/* Timeline Content */}
                          <div className="ml-12 flex-1">
                            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                              <div className="flex justify-between items-start mb-2">
                                <h5 className="font-medium text-gray-900">
                                  Contact added
                                </h5>
                                <span className="text-xs text-gray-500">
                                  06/08/2025 01:05 PM
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">
                                Contact created by{" "}
                                {getCustomerName(selectedCustomer)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Record Info */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">RECORD INFO</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">
                          06/08/2025 01:05 PM
                        </span>
                        <span className="text-gray-900">
                          Contact person added
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Contact person {selectedCustomer.firstName} has been
                        created by {getCustomerName(selectedCustomer)}
                      </p>

                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">
                          06/08/2025 01:05 PM
                        </span>
                        <span className="text-gray-900">Contact added</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Contact created by {getCustomerName(selectedCustomer)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "transactions" && (
                <div className="space-y-6">
                  {/* Go to transactions dropdown */}
                  <div className="flex justify-between items-center">
                    <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                      <option>Go to transactions</option>
                    </select>
                  </div>

                  {/* Invoices Section */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-gray-900">Invoices</h4>
                      <div className="flex gap-2">
                        <select className="border border-gray-300 rounded-md px-2 py-1 text-xs">
                          <option>Status: All</option>
                        </select>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">
                          + New
                        </button>
                      </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg">
                      <table className="min-w-full">
                        <thead className="bg-gray-50 text-xs text-gray-600 uppercase">
                          <tr>
                            <th className="px-4 py-3 text-left">DATE</th>
                            <th className="px-4 py-3 text-left">
                              INVOICE NUMBER
                            </th>
                            <th className="px-4 py-3 text-left">
                              ORDER NUMBER
                            </th>
                            <th className="px-4 py-3 text-left">AMOUNT</th>
                            <th className="px-4 py-3 text-left">BALANCE DUE</th>
                            <th className="px-4 py-3 text-left">STATUS</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td
                              colSpan={6}
                              className="px-4 py-8 text-center text-gray-500"
                            >
                              There are no invoices - Add Now
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Customer Payments Section */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-gray-900">
                        Customer Payments
                      </h4>
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">
                        + New
                      </button>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg">
                      <table className="min-w-full">
                        <thead className="bg-gray-50 text-xs text-gray-600 uppercase">
                          <tr>
                            <th className="px-4 py-3 text-left">DATE</th>
                            <th className="px-4 py-3 text-left">
                              PAYMENT NUMBER
                            </th>
                            <th className="px-4 py-3 text-left">
                              REFERENCE NUMBER
                            </th>
                            <th className="px-4 py-3 text-left">
                              PAYMENT MODE
                            </th>
                            <th className="px-4 py-3 text-left">AMOUNT</th>
                            <th className="px-4 py-3 text-left">
                              UNUSED AMOUNT
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td
                              colSpan={6}
                              className="px-4 py-8 text-center text-gray-500"
                            >
                              No payments have been received or recorded yet. -
                              Add Now
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Quotes Section */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-gray-900">Quotes</h4>
                      <div className="flex gap-2">
                        <select className="border border-gray-300 rounded-md px-2 py-1 text-xs">
                          <option>Status: All</option>
                        </select>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">
                          + New
                        </button>
                      </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg">
                      <table className="min-w-full">
                        <thead className="bg-gray-50 text-xs text-gray-600 uppercase">
                          <tr>
                            <th className="px-4 py-3 text-left">DATE</th>
                            <th className="px-4 py-3 text-left">QUOTE#</th>
                            <th className="px-4 py-3 text-left">
                              REFERENCE NUMBER
                            </th>
                            <th className="px-4 py-3 text-left">AMOUNT</th>
                            <th className="px-4 py-3 text-left">STATUS</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td
                              colSpan={5}
                              className="px-4 py-8 text-center text-gray-500"
                            >
                              There are no quotes - Add New
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Collapsed Sections */}
                  <div className="space-y-2">
                    {[
                      "Sales Orders",
                      "Delivery Challans",
                      "Recurring Invoices",
                      "Expenses",
                      "Recurring Expenses",
                      "Projects",
                      "Journals",
                      "Bills",
                      "Credit Notes",
                    ].map((section) => (
                      <div
                        key={section}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-900">
                            {section}
                          </span>
                        </div>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">
                          + New
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "comments" && (
                <div className="space-y-4">
                  {/* Comment Input Section */}
                  <div className="space-y-4">
                    {/* Formatting Options */}
                    <div className="flex gap-2">
                      <button className="px-3 py-1 border border-gray-300 rounded text-sm font-bold hover:bg-gray-50">
                        B
                      </button>
                      <button className="px-3 py-1 border border-gray-300 rounded text-sm italic hover:bg-gray-50">
                        I
                      </button>
                      <button className="px-3 py-1 border border-gray-300 rounded text-sm underline hover:bg-gray-50">
                        U
                      </button>
                    </div>

                    {/* Comment Textarea */}
                    <textarea
                      placeholder="Add a comment..."
                      className="w-full h-32 p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />

                    {/* Add Comment Button */}
                    <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm">
                      Add Comment
                    </button>
                  </div>

                  {/* All Comments Section */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">ALL COMMENTS</h4>
                    <hr className="border-gray-200" />
                    <div className="text-center py-12">
                      <p className="text-gray-500 text-lg">No comments yet.</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "mails" && (
                <div className="space-y-4">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium text-gray-900">
                        System Mails
                      </h4>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1">
                        Link Email account
                        <ChevronDownIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-center py-8">
                      <div className="text-orange-500 text-2xl mb-2">▲</div>
                      <p className="text-gray-500 text-lg">No emails sent.</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "statement" && (
                <div className="space-y-4">
                  {/* Statement Header */}
                  <div className="flex justify-between items-center">
                    <div className="flex gap-4">
                      <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                        <option>This Month</option>
                      </select>
                      <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                        <option>Filter By: All</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="p-2 hover:bg-gray-100 rounded-md"
                        title="Print"
                      >
                        <svg
                          className="w-4 h-4 text-gray-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                          />
                        </svg>
                      </button>
                      <button
                        className="p-2 hover:bg-gray-100 rounded-md"
                        title="Download"
                      >
                        <svg
                          className="w-4 h-4 text-gray-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </button>
                      <button
                        className="p-2 hover:bg-gray-100 rounded-md"
                        title="Email"
                      >
                        <svg
                          className="w-4 h-4 text-gray-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </button>
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm">
                        Send Email
                      </button>
                    </div>
                  </div>

                  {/* Customer Statement */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="space-y-6">
                      {/* Statement Header */}
                      <div className="space-y-2">
                        <h2 className="text-xl font-bold text-gray-900">
                          Customer Statement for{" "}
                          {getCustomerName(selectedCustomer)}
                        </h2>
                        <p className="text-sm text-gray-600">
                          From 01/08/2025 To 31/08/2025
                        </p>
                      </div>

                      {/* Recipient and Company Info */}
                      <div className="flex justify-between">
                        <div>
                          <p className="text-sm text-gray-600">
                            To {getCustomerName(selectedCustomer)}
                          </p>
                        </div>
                        <div className="text-right text-sm text-gray-600">
                          <p>Your Company Name</p>
                          <p>Your State</p>
                          <p>Your Country</p>
                          <p>contact@yourcompany.com</p>
                        </div>
                      </div>

                      {/* Statement of Accounts */}
                      <div className="space-y-2">
                        <h3 className="text-lg font-bold text-gray-900 underline">
                          Statement of Accounts
                        </h3>
                        <p className="text-sm text-gray-600">
                          01/08/2025 To 31/08/2025
                        </p>
                      </div>

                      {/* Account Summary */}
                      <div className="bg-gray-100 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-3">
                          Account Summary
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Opening Balance
                            </span>
                            <span className="font-medium">₹ 0.00</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Invoiced Amount
                            </span>
                            <span className="font-medium">₹ 0.00</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Amount Received
                            </span>
                            <span className="font-medium">₹ 0.00</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Balance Due</span>
                            <span className="font-medium">₹ 0.00</span>
                          </div>
                        </div>
                      </div>

                      {/* Transactions Table */}
                      <div className="space-y-2">
                        <table className="min-w-full">
                          <thead className="bg-gray-700 text-white text-xs">
                            <tr>
                              <th className="px-4 py-2 text-left">Date</th>
                              <th className="px-4 py-2 text-left">
                                Transactions
                              </th>
                              <th className="px-4 py-2 text-left">Details</th>
                              <th className="px-4 py-2 text-left">Amount</th>
                              <th className="px-4 py-2 text-left">Payments</th>
                              <th className="px-4 py-2 text-left">Balance</th>
                            </tr>
                          </thead>
                          <tbody className="text-sm">
                            <tr className="border-b border-gray-200">
                              <td className="px-4 py-2">01/08/2025</td>
                              <td className="px-4 py-2 font-medium">
                                ***Opening Balance***
                              </td>
                              <td className="px-4 py-2"></td>
                              <td className="px-4 py-2">0.00</td>
                              <td className="px-4 py-2">0.00</td>
                              <td className="px-4 py-2 font-medium">₹ 0.00</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Final Balance */}
                      <div className="border-t border-gray-200 pt-4">
                        <div className="flex justify-between font-medium">
                          <span>Balance Due</span>
                          <span>₹ 0.00</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bulk Upload Modal */}
      <BulkUploadModal
        isOpen={bulkUploadModalOpen}
        onClose={() => setBulkUploadModalOpen(false)}
        onSuccess={() => {
          setBulkUploadModalOpen(false);
          fetchCustomers(); // Refresh the customer list
        }}
      />
    </section>
  );
}
