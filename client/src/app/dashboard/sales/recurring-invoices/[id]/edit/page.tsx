"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import CustomerDetails from "../../../../invoices/new/components/CustomerDetails";
import RecurringInvoiceDetails from "../../new/components/RecurringInvoiceDetails";
import RecurrenceSettings from "../../new/components/RecurrenceSettings";
import ItemsTable from "../../../../invoices/new/components/ItemsTable";
import InvoiceSummary from "../../../../invoices/new/components/InvoiceSummary";
import TDSManagementModal from "../../../../invoices/new/components/TDSManagementModal";
import TCSManagementModal from "../../../../invoices/new/components/TCSManagementModal";

interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  gstin: string;
}

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
  itemId: string;
  details: string;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  taxRate: number;
  taxAmount: number;
}

const EditRecurringInvoicePage = () => {
  const params = useParams();
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
  const [loading, setLoading] = useState(true);

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

    // Items
    items: [
      {
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
    if (params.id) {
      fetchRecurringInvoice(params.id as string);
    }
    fetchCustomers();
    fetchTaxes();
  }, [params.id]);

  const fetchRecurringInvoice = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/recurring-invoices/${id}`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        const data = result.data;
        
        // Convert the data to match our form structure
        setFormData({
          profileName: data.profileName || "",
          frequency: data.frequency || "monthly",
          startDate: data.startDate ? new Date(data.startDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
          endDate: data.endDate ? new Date(data.endDate).toISOString().split("T")[0] : "",
          neverExpires: data.neverExpires || false,
          customerId: data.customerId?._id || data.customerId || "",
          customerName: data.customerName || "",
          customerEmail: data.customerEmail || "",
          customerPhone: data.customerPhone || "",
          customerAddress: data.customerAddress || "",
          buyerName: data.buyerName || "",
          buyerEmail: data.buyerEmail || "",
          buyerPhone: data.buyerPhone || "",
          buyerGstin: data.buyerGstin || "",
          buyerAddress: data.buyerAddress || "",
          sellerName: data.sellerName || "",
          sellerEmail: data.sellerEmail || "",
          sellerPhone: data.sellerPhone || "",
          sellerGstin: data.sellerGstin || "",
          sellerAddress: data.sellerAddress || "",
          orderNumber: data.orderNumber || "",
          terms: data.terms || "Due on Receipt",
          salesperson: data.salesperson || "",
          subject: data.subject || "",
          items: data.items?.length > 0 ? data.items.map((item: any) => ({
            itemId: item.itemId || "",
            details: item.details || "",
            description: item.description || "",
            quantity: item.quantity || 1.0,
            unit: item.unit || "pcs",
            rate: item.rate || 0.0,
            amount: item.amount || 0.0,
            taxRate: item.taxRate || 0,
            taxAmount: item.taxAmount || 0,
          })) : [{
            itemId: "",
            details: "",
            description: "",
            quantity: 1.0,
            unit: "pcs",
            rate: 0.0,
            amount: 0.0,
            taxRate: 0,
            taxAmount: 0,
          }],
          subTotal: data.subTotal || 0.0,
          discount: data.discount || 0,
          discountType: data.discountType || "percentage",
          discountAmount: data.discountAmount || 0.0,
          taxAmount: data.taxAmount || 0.0,
          cgstTotal: data.cgstTotal || 0.0,
          sgstTotal: data.sgstTotal || 0.0,
          igstTotal: data.igstTotal || 0.0,
          additionalTaxType: data.additionalTaxType || null,
          additionalTaxId: data.additionalTaxId || "",
          additionalTaxRate: data.additionalTaxRate || 0,
          additionalTaxAmount: data.additionalTaxAmount || 0.0,
          adjustment: data.adjustment || 0.0,
          total: data.total || 0.0,
          customerNotes: data.customerNotes || "Thanks for your business.",
          termsConditions: data.termsConditions || "",
          internalNotes: data.internalNotes || "",
        });
      } else {
        showToastMessage("Failed to fetch recurring invoice", "error");
      }
    } catch (error) {
      console.error("Error fetching recurring invoice:", error);
      showToastMessage("Failed to fetch recurring invoice", "error");
    } finally {
      setLoading(false);
    }
  };

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
    setFormData((prev) => ({
      ...prev,
      customerId: customer._id,
      customerName: `${customer.firstName} ${customer.lastName}`,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      customerAddress: customer.address,
      buyerName: `${customer.firstName} ${customer.lastName}`,
      buyerEmail: customer.email,
      buyerPhone: customer.phone,
      buyerGstin: customer.gstin,
      buyerAddress: customer.address,
    }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
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
    }));
  };

  const removeItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    setFormData((prev) => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };

      // Recalculate amount
      if (field === "quantity" || field === "rate") {
        const item = newItems[index];
        item.amount = item.quantity * item.rate;
        item.taxAmount = (item.amount * item.taxRate) / 100;
      }

      return { ...prev, items: newItems };
    });
  };

  const handleItemSelect = (index: number, itemId: string, itemDetails: any) => {
    updateItem(index, "itemId", itemId);
    updateItem(index, "details", itemDetails.name);
    updateItem(index, "description", itemDetails.description || "");
    updateItem(index, "rate", itemDetails.sellingPrice || 0);
    updateItem(index, "unit", itemDetails.unit || "pcs");
    updateItem(index, "taxRate", itemDetails.gstRate || 0);
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
  }, [formData.items, formData.discount, formData.discountType, formData.additionalTaxRate, formData.adjustment]);

  const handleUpdateRecurringInvoice = async () => {
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
        showToastMessage("End date is required when not set to never expire", "error");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/recurring-invoices/${params.id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        const result = await response.json();
        showToastMessage("Recurring invoice updated successfully", "success");
        router.push(`/dashboard/sales/recurring-invoices/${params.id}`);
      } else {
        const errorData = await response.json();
        showToastMessage(errorData.message || "Failed to update recurring invoice", "error");
      }
    } catch (error) {
      console.error("Error updating recurring invoice:", error);
      showToastMessage("Failed to update recurring invoice", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Edit Recurring Invoice
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Update recurring invoice profile
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => router.push(`/dashboard/sales/recurring-invoices/${params.id}`)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateRecurringInvoice}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Update Recurring Invoice
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
              formData={formData}
              onFormDataChange={setFormData}
              onCustomerSelect={handleCustomerSelect}
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
              onItemSelect={handleItemSelect}
              onUpdateItem={updateItem}
              onAddItem={addItem}
              onRemoveItem={removeItem}
            />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1">
            <InvoiceSummary
              formData={formData}
              onFormDataChange={setFormData}
              tdsRecords={tdsRecords}
              tcsRecords={tcsRecords}
              isLoadingTaxes={isLoadingTaxes}
              onShowTDSModal={() => setShowTDSModal(true)}
              onShowTCSModal={() => setShowTCSModal(true)}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <TDSManagementModal
        isOpen={showTDSModal}
        onClose={() => setShowTDSModal(false)}
        onTDSSelected={(tds) => {
          setFormData((prev) => ({
            ...prev,
            additionalTaxType: "TDS",
            additionalTaxId: tds._id,
            additionalTaxRate: tds.rate,
          }));
          setShowTDSModal(false);
        }}
        tdsRecords={tdsRecords}
      />

      <TCSManagementModal
        isOpen={showTCSModal}
        onClose={() => setShowTCSModal(false)}
        onTCSSelected={(tcs) => {
          setFormData((prev) => ({
            ...prev,
            additionalTaxType: "TCS",
            additionalTaxId: tcs._id,
            additionalTaxRate: tcs.rate,
          }));
          setShowTCSModal(false);
        }}
        tcsRecords={tcsRecords}
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

export default EditRecurringInvoicePage;
