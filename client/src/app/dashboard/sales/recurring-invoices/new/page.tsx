/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CustomerDetails from "../../invoices/new/components/CustomerDetails";
import RecurringInvoiceDetails from "./components/RecurringInvoiceDetails";
import RecurrenceSettings from "./components/RecurrenceSettings";
import ItemsTable from "../../invoices/new/components/ItemsTable";
import InvoiceSummary from "../../invoices/new/components/InvoiceSummary";
import TDSManagementModal from "../../invoices/new/components/TDSManagementModal";
import TCSManagementModal from "../../invoices/new/components/TCSManagementModal";
import { Customer } from "@/services/customerService";

interface TDSRecord {
  _id: string;
  name: string;
  rate: number;
  description: string;
}

interface TCSRecord {
  _id: string;
  name: string;
  rate: number;
  description: string;
}

interface InvoiceItem {
  id: number;
  itemId: string;
  details: string;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  taxMode: "GST" | "IGST" | "NON_TAXABLE" | "NO_GST" | "EXPORT";
  taxRate: number;
  taxAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  taxRemark: string;
}

interface ItemDetails {
  name?: string;
  sku?: string;
  sellingPrice?: number;
  unit?: string;
  description?: string;
  category?: string;
  brand?: string;
  hsnCode?: string;
  sacCode?: string;
  gstRate?: number;
}

const NewRecurringInvoicePage = () => {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [tdsRecords, setTdsRecords] = useState<TDSRecord[]>([]);
  const [tcsRecords, setTcsRecords] = useState<TCSRecord[]>([]);
  const [isLoadingTaxes, setIsLoadingTaxes] = useState(false);
  const [showTDSModal, setShowTDSModal] = useState(false);
  const [showTCSModal, setShowTCSModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  const [formData, setFormData] = useState({
    // Recurrence Settings
    profileName: "",
    frequency: "monthly",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    neverExpires: false,

    // Customer Information
    customerId: "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",
    buyerName: "",
    buyerEmail: "",
    buyerPhone: "",
    buyerGstin: "",
    buyerAddress: "",
    sellerName: "",
    sellerEmail: "",
    sellerPhone: "",
    sellerGstin: "",
    sellerAddress: "",

    // Invoice Details
    orderNumber: "",
    terms: "Due on Receipt",
    salesperson: "",
    subject: "",

    // Address Information
    billingAddress: {
      street: "",
      city: "",
      state: "",
      country: "India",
      zipCode: "",
    },
    shippingAddress: {
      street: "",
      city: "",
      state: "",
      country: "India",
      zipCode: "",
    },
    placeOfSupplyState: "",

    // Items
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
        taxMode: "GST",
        taxRate: 0,
        taxAmount: 0,
        cgst: 0,
        sgst: 0,
        igst: 0,
        taxRemark: "",
      },
    ] as InvoiceItem[],

    // Summary
    subTotal: 0.0,
    discount: 0,
    discountType: "percentage" as "percentage" | "amount",
    discountAmount: 0.0,
    taxAmount: 0.0,
    cgstTotal: 0.0,
    sgstTotal: 0.0,
    igstTotal: 0.0,
    additionalTaxType: null as "TDS" | "TCS" | null,
    additionalTaxId: "",
    additionalTaxRate: 0,
    additionalTaxAmount: 0.0,
    adjustment: 0.0,
    total: 0.0,

    // Notes
    customerNotes: "Thanks for your business.",
    termsConditions: "",
    internalNotes: "",
  });

  useEffect(() => {
    fetchCustomers();
    fetchTaxes();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/customers`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setCustomers(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const fetchTaxes = async () => {
    try {
      setIsLoadingTaxes(true);
      const [tdsResponse, tcsResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tds/active`, {
          credentials: "include",
        }),
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tcs/active`, {
          credentials: "include",
        }),
      ]);

      if (tdsResponse.ok) {
        const tdsResult = await tdsResponse.json();
        setTdsRecords(tdsResult.data || []);
      }

      if (tcsResponse.ok) {
        const tcsResult = await tcsResponse.json();
        setTcsRecords(tcsResult.data || []);
      }
    } catch (error) {
      console.error("Error fetching taxes:", error);
    } finally {
      setIsLoadingTaxes(false);
    }
  };

  const showToastMessage = (message: string, type: "success" | "error") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData((prev) => ({
      ...prev,
      customerId: customer._id,
      customerName: `${customer.firstName} ${customer.lastName}`,
      customerEmail: customer.email,
      customerPhone: customer.mobile || customer.workPhone || "",
      customerAddress: customer.billingAddress?.street || "",
      buyerName: `${customer.firstName} ${customer.lastName}`,
      buyerEmail: customer.email,
      buyerPhone: customer.mobile || customer.workPhone || "",
      buyerGstin: customer.pan || "",
      buyerAddress: customer.billingAddress?.street || "",
    }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: Math.max(...prev.items.map((item) => item.id), 0) + 1,
          itemId: "",
          details: "",
          description: "",
          quantity: 1.0,
          unit: "pcs",
          rate: 0.0,
          amount: 0.0,
          taxMode: "GST",
          taxRate: 0,
          taxAmount: 0,
          cgst: 0,
          sgst: 0,
          igst: 0,
          taxRemark: "",
        },
      ],
    }));
  };

  const removeItem = (id: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };

  const updateItem = (id: number, field: string, value: string | number) => {
    setFormData((prev) => {
      const newItems = prev.items.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };

          // Recalculate amount
          if (field === "quantity" || field === "rate") {
            updatedItem.amount = updatedItem.quantity * updatedItem.rate;
            updatedItem.taxAmount =
              (updatedItem.amount * updatedItem.taxRate) / 100;
            updatedItem.cgst = updatedItem.taxAmount / 2;
            updatedItem.sgst = updatedItem.taxAmount / 2;
            updatedItem.igst = 0;
          }

          return updatedItem;
        }
        return item;
      });

      return { ...prev, items: newItems };
    });
  };

  const handleItemSelect = (
    id: number,
    itemId: string,
    itemDetails: ItemDetails
  ) => {
    updateItem(id, "itemId", itemId);
    updateItem(id, "details", itemDetails.name || "");
    updateItem(id, "description", itemDetails.description || "");
    updateItem(id, "rate", itemDetails.sellingPrice || 0);
    updateItem(id, "unit", itemDetails.unit || "pcs");
    updateItem(id, "taxRate", itemDetails.gstRate || 0);
  };

  const calculateItemTax = (item: InvoiceItem) => {
    const amount = item.quantity * item.rate;
    const taxAmount = (amount * item.taxRate) / 100;
    return { amount, taxAmount };
  };

  const recalculateAllTotals = () => {
    let subTotal = 0;
    let totalTax = 0;

    formData.items.forEach((item) => {
      const { amount, taxAmount } = calculateItemTax(item);
      subTotal += amount;
      totalTax += taxAmount;
    });

    const discountAmount =
      formData.discountType === "percentage"
        ? (subTotal * formData.discount) / 100
        : formData.discount;

    const taxableAmount = subTotal - discountAmount;
    const cgstTotal = totalTax / 2;
    const sgstTotal = totalTax / 2;
    const igstTotal = 0; // For inter-state transactions

    const additionalTaxAmount =
      (taxableAmount * formData.additionalTaxRate) / 100;

    const total =
      taxableAmount + totalTax + additionalTaxAmount + formData.adjustment;

    setFormData((prev) => ({
      ...prev,
      subTotal,
      discountAmount,
      taxAmount: totalTax,
      cgstTotal,
      sgstTotal,
      igstTotal,
      additionalTaxAmount,
      total,
    }));
  };

  useEffect(() => {
    recalculateAllTotals();
  }, [
    formData.items,
    formData.discount,
    formData.discountType,
    formData.additionalTaxRate,
    formData.adjustment,
  ]);

  const isIntraState = () => {
    // Simple logic - you can enhance this based on your requirements
    return formData.billingAddress.state === formData.shippingAddress.state;
  };

  const handleSaveRecurringInvoice = async () => {
    try {
      // Validate required fields
      if (!formData.profileName.trim()) {
        showToastMessage("Profile name is required", "error");
        return;
      }

      if (!formData.customerId) {
        showToastMessage("Please select a customer", "error");
        return;
      }

      if (!formData.startDate) {
        showToastMessage("Start date is required", "error");
        return;
      }

      if (!formData.neverExpires && !formData.endDate) {
        showToastMessage(
          "End date is required when not set to never expire",
          "error"
        );
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/recurring-invoices`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        const result = await response.json();
        showToastMessage("Recurring invoice created successfully", "success");
        router.push("/dashboard/sales/recurring-invoices");
      } else {
        const errorData = await response.json();
        showToastMessage(
          errorData.message || "Failed to create recurring invoice",
          "error"
        );
      }
    } catch (error) {
      console.error("Error creating recurring invoice:", error);
      showToastMessage("Failed to create recurring invoice", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                New Recurring Invoice
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Create a recurring invoice profile
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() =>
                  router.push("/dashboard/sales/recurring-invoices")
                }
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRecurringInvoice}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Save Recurring Invoice
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Details */}
            <CustomerDetails
              customers={customers}
              selectedCustomer={
                customers.find((c) => c._id === formData.customerId) || null
              }
              searchTerm=""
              showCustomerDropdown={false}
              onCustomerSelect={handleCustomerSelect}
              onSearchChange={() => {}}
              onDropdownToggle={() => {}}
              formData={{
                billingAddress: {
                  street: formData.customerAddress || "",
                  city: "",
                  state: "",
                  country: "India",
                  zipCode: "",
                },
                shippingAddress: {
                  street: formData.customerAddress || "",
                  city: "",
                  state: "",
                  country: "India",
                  zipCode: "",
                },
                placeOfSupplyState: "",
              }}
              onFormDataChange={(data) => {
                setFormData((prev) => ({
                  ...prev,
                  customerAddress: data.billingAddress?.street || "",
                }));
              }}
            />

            {/* Recurring Invoice Details */}
            <RecurringInvoiceDetails
              formData={formData}
              onFormDataChange={setFormData}
            />

            {/* Recurrence Settings */}
            <RecurrenceSettings
              formData={formData}
              onFormDataChange={setFormData}
            />

            {/* Items Table */}
            <ItemsTable
              items={formData.items}
              onItemSelect={(id, itemId, itemDetails) =>
                handleItemSelect(id, itemId, itemDetails)
              }
              onUpdateItem={(id, field, value) => updateItem(id, field, value)}
              onAddItem={addItem}
              onRemoveItem={(id) => removeItem(id)}
              isIntraState={isIntraState}
            />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1">
            <InvoiceSummary
              formData={{
                subTotal: formData.subTotal,
                discount: formData.discount,
                discountType: formData.discountType,
                discountAmount: formData.discountAmount,
                taxAmount: formData.taxAmount,
                cgstTotal: formData.cgstTotal,
                sgstTotal: formData.sgstTotal,
                igstTotal: formData.igstTotal,
                additionalTaxType: formData.additionalTaxType,
                additionalTaxId: formData.additionalTaxId,
                additionalTaxRate: formData.additionalTaxRate,
                additionalTaxAmount: formData.additionalTaxAmount,
                adjustment: formData.adjustment,
                total: formData.total,
                items: formData.items.map((item, index) => ({
                  id: index,
                  itemId: item.itemId,
                  details: item.details,
                  description: item.description,
                  quantity: item.quantity,
                  unit: item.unit,
                  rate: item.rate,
                  amount: item.amount,
                  taxMode: "GST" as const,
                  taxRate: item.taxRate,
                  taxAmount: item.taxAmount,
                  cgst: item.taxAmount / 2,
                  sgst: item.taxAmount / 2,
                  igst: 0,
                  taxRemark: "",
                })),
              }}
              onFormDataChange={(data) => {
                setFormData((prev) => ({
                  ...prev,
                  subTotal: data.subTotal,
                  discount: data.discount,
                  discountType: data.discountType,
                  discountAmount: data.discountAmount,
                  taxAmount: data.taxAmount,
                  cgstTotal: data.cgstTotal,
                  sgstTotal: data.sgstTotal,
                  igstTotal: data.igstTotal,
                  additionalTaxType: data.additionalTaxType,
                  additionalTaxId: data.additionalTaxId,
                  additionalTaxRate: data.additionalTaxRate,
                  additionalTaxAmount: data.additionalTaxAmount,
                  adjustment: data.adjustment,
                  total: data.total,
                }));
              }}
              isIntraState={() => true}
              tdsRecords={tdsRecords.map((tds) => ({
                ...tds,
                section: "",
                status: "Active" as const,
              }))}
              tcsRecords={tcsRecords.map((tcs) => ({
                ...tcs,
                natureOfCollection: "",
                status: "Active" as const,
              }))}
              isLoadingTaxes={isLoadingTaxes}
              onManageTDS={() => setShowTDSModal(true)}
              onManageTCS={() => setShowTCSModal(true)}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <TDSManagementModal
        isOpen={showTDSModal}
        onClose={() => setShowTDSModal(false)}
        onUpdate={() => {
          fetchTaxes();
          setShowTDSModal(false);
        }}
      />

      <TCSManagementModal
        isOpen={showTCSModal}
        onClose={() => setShowTCSModal(false)}
        onUpdate={() => {
          fetchTaxes();
          setShowTCSModal(false);
        }}
      />

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-50">
          <div
            className={`px-4 py-2 rounded-md shadow-lg ${
              toastType === "success"
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {toastMessage}
          </div>
        </div>
      )}
    </div>
  );
};

export default NewRecurringInvoicePage;
