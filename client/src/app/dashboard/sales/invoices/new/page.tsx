"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  XMarkIcon,
  ChevronDownIcon,
  CheckIcon,
  PaperClipIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

import CustomerDetails from "./components/CustomerDetails";
import InvoiceDetails from "./components/InvoiceDetails";
import ItemsTable from "./components/ItemsTable";
import InvoiceSummary from "./components/InvoiceSummary";
import TDSManagementModal from "./components/TDSManagementModal";
import TCSManagementModal from "./components/TCSManagementModal";
import { Customer } from "@/services/customerService";

interface TDSRecord {
  _id: string;
  name: string;
  rate: number;
  section: string;
  status: "Active" | "Inactive";
}

interface TCSRecord {
  _id: string;
  name: string;
  rate: number;
  natureOfCollection: string;
  section?: string;
  status: "Active" | "Inactive";
}

type TaxMode = "GST" | "IGST" | "NON_TAXABLE" | "NO_GST" | "EXPORT";
interface InvoiceItem {
  id: number;
  itemId: string;
  details: string;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  taxMode: TaxMode;
  taxRate: number;
  taxAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  taxRemark: string;
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

  // TDS/TCS State
  const [tdsRecords, setTdsRecords] = useState<TDSRecord[]>([]);
  const [tcsRecords, setTcsRecords] = useState<TCSRecord[]>([]);
  const [isLoadingTaxes, setIsLoadingTaxes] = useState(false);
  const [showTDSModal, setShowTDSModal] = useState(false);
  const [showTCSModal, setShowTCSModal] = useState(false);

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
        rate: 10000.0, // Set default amount for testing
        amount: 100000.0, // 10 × 10000 = 100000
        taxMode: "IGST" as TaxMode, // Use IGST for inter-state
        taxRate: 18,
        taxAmount: 0,
        cgst: 0,
        sgst: 0,
        igst: 0,
        taxRemark: "",
      } as InvoiceItem,
    ],
    subTotal: 0.0,
    discount: 0,
    discountType: "percentage" as "percentage" | "amount",
    discountAmount: 0.0,
    taxType: "GST",
    taxRate: 18,
    taxAmount: 0.0,
    cgstTotal: 0.0,
    sgstTotal: 0.0,
    igstTotal: 0.0,
    // TDS/TCS fields
    additionalTaxType: null as "TDS" | "TCS" | null,
    additionalTaxId: "",
    additionalTaxRate: 0,
    additionalTaxAmount: 0.0,
    adjustment: 0.0,
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
    // Address blocks
    billingAddress: {
      street: "",
      city: "",
      state: "",
      country: "India",
      zipCode: "",
    } as {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      zipCode?: string;
    },
    shippingAddress: {
      street: "",
      city: "",
      state: "",
      country: "India",
      zipCode: "",
    } as {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      zipCode?: string;
    },
    placeOfSupplyState: "" as string | undefined,
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
    pinCode: "560001",
  });

  // Local toast notifications
  const [toasts, setToasts] = useState<
    { id: number; message: string; type: "success" | "error" | "info" }[]
  >([]);
  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  const extractStateName = (value: string) => {
    if (!value) return "";
    const parts = value.split("-");
    return (parts[1] || parts[0]).trim();
  };

  // Enhanced GST calculation with proper distribution
  const calculateItemTax = (
    amount: number,
    taxMode: TaxMode,
    taxRate: number
  ) => {
    if (!amount || amount <= 0) {
      return { cgst: 0, sgst: 0, igst: 0, taxAmount: 0 };
    }

    // Handle different tax modes
    if (taxMode === "NON_TAXABLE" || taxMode === "NO_GST") {
      return { cgst: 0, sgst: 0, igst: 0, taxAmount: 0 };
    }

    if (taxMode === "EXPORT") {
      // Export is 0% GST
      return { cgst: 0, sgst: 0, igst: 0, taxAmount: 0 };
    }

    // For GST and IGST modes
    if (taxMode === "GST" || taxMode === "IGST") {
      const companyState = extractStateName(companySettings.state);
      const placeOfSupply = formData.placeOfSupplyState || companyState;

      // Check if same state (intra-state)
      const isSameState =
        companyState.toLowerCase() === placeOfSupply.toLowerCase();

      if (isSameState) {
        // Same state: Divide GST into CGST and SGST (50% each)
        const halfTax = (amount * taxRate) / 100 / 2;
        return {
          cgst: halfTax,
          sgst: halfTax,
          igst: 0,
          taxAmount: halfTax * 2,
        };
      } else {
        // Different state: Use IGST (100%)
        const igst = (amount * taxRate) / 100;
        return {
          cgst: 0,
          sgst: 0,
          igst,
          taxAmount: igst,
        };
      }
    }

    // Default case
    return { cgst: 0, sgst: 0, igst: 0, taxAmount: 0 };
  };

  // Function to automatically update place of supply based on shipping address
  const updatePlaceOfSupplyFromShipping = (shippingState: string) => {
    const companyState = extractStateName(companySettings.state);
    const isSameState =
      companyState.toLowerCase() === shippingState.toLowerCase();

    setFormData((prev) => ({
      ...prev,
      placeOfSupplyState: shippingState,
    }));

    // Show toast notification about GST rule application
    if (isSameState) {
      showToast(
        `Same state detected: CGST + SGST will be applied (${companyState} → ${shippingState})`,
        "info"
      );
    } else {
      showToast(
        `Different state detected: IGST will be applied (${companyState} → ${shippingState})`,
        "info"
      );
    }

    // Don't automatically recalculate - let user update items manually
    // setTimeout(recalculateAllTotals, 0);
  };

  // Function to handle shipping address updates with automatic GST rule application
  const handleShippingAddressUpdate = (field: string, value: string) => {
    setFormData((prev) => {
      const updatedShippingAddress = {
        ...prev.shippingAddress,
        [field]: value,
      };

      // Place of supply remains fixed to office state, no automatic updates

      return {
        ...prev,
        shippingAddress: updatedShippingAddress,
      };
    });
  };

  // Function to recalculate all totals when tax rate/place changes
  const recalculateAllTotals = () => {
    setFormData((prev) => {
      // First calculate subtotal and discount
      const subTotal = prev.items.reduce(
        (sum, item) => sum + (item.amount || 0),
        0
      );
      const discountAmount =
        prev.discountType === "percentage"
          ? (subTotal * prev.discount) / 100
          : prev.discount;

      // Calculate GST on (subtotal - discount)
      const taxableAmount = subTotal - discountAmount;

      // Update items with GST calculated on proportional discounted amounts
      const updatedItems: InvoiceItem[] = prev.items.map((item) => {
        // Ensure all GST/IGST items have 18% tax rate
        let rate = 0;
        if (item.taxMode === "GST" || item.taxMode === "IGST") {
          rate = item.taxRate || 18; // Default to 18% if not set
        }

        // Calculate proportional discount for this item
        const itemProportion = subTotal > 0 ? (item.amount || 0) / subTotal : 0;
        const itemDiscountAmount = discountAmount * itemProportion;
        const itemTaxableAmount = (item.amount || 0) - itemDiscountAmount;

        const taxes = calculateItemTax(
          itemTaxableAmount,
          item.taxMode as TaxMode,
          rate
        );

        return { ...(item as InvoiceItem), taxRate: rate, ...taxes };
      });

      // Calculate GST totals
      const cgstTotal = updatedItems.reduce((sum, i) => sum + (i.cgst || 0), 0);
      const sgstTotal = updatedItems.reduce((sum, i) => sum + (i.sgst || 0), 0);
      const igstTotal = updatedItems.reduce((sum, i) => sum + (i.igst || 0), 0);
      const totalGSTTax = cgstTotal + sgstTotal + igstTotal;

      // Calculate TDS/TCS on (subtotal - discount) BEFORE GST
      let additionalTaxAmount = 0;
      if (prev.additionalTaxType && prev.additionalTaxRate > 0) {
        const baseAmountForAdditionalTax = subTotal - discountAmount;
        additionalTaxAmount =
          (baseAmountForAdditionalTax * prev.additionalTaxRate) / 100;
      }

      // Calculate final total
      // TDS is subtracted (negative), TCS is added (positive)
      const adjustedAdditionalTax =
        prev.additionalTaxType === "TDS"
          ? -additionalTaxAmount
          : additionalTaxAmount;

      const total =
        subTotal -
        discountAmount +
        totalGSTTax +
        adjustedAdditionalTax +
        (prev.adjustment || 0);

      return {
        ...prev,
        items: updatedItems,
        subTotal,
        discountAmount,
        taxAmount: totalGSTTax,
        cgstTotal,
        sgstTotal,
        igstTotal,
        additionalTaxAmount,
        total,
      };
    });
  };

  // Determine intra vs inter-state with enhanced logic
  const isIntraState = () => {
    const companyState = extractStateName(companySettings.state);
    const placeOfSupply = formData.placeOfSupplyState || companyState;
    if (!companyState || !placeOfSupply) return true;
    return companyState.toLowerCase() === placeOfSupply.toLowerCase();
  };

  // Get GST distribution info
  const getGSTDistributionInfo = () => {
    const companyState = extractStateName(companySettings.state);
    const placeOfSupply = formData.placeOfSupplyState || companyState;
    const isSameState =
      companyState.toLowerCase() === placeOfSupply.toLowerCase();

    return {
      isSameState,
      companyState,
      placeOfSupply,
      distribution: isSameState ? "CGST + SGST" : "IGST",
      explanation: isSameState
        ? `Same state (${companyState}): GST divided into CGST and SGST`
        : `Different states (${companyState} → ${placeOfSupply}): Using IGST`,
    };
  };

  // Fetch customers from backend and check for pre-selected customer
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch(
          process.env.NEXT_PUBLIC_BACKEND_URL + "/api/customers",
          {
            credentials: "include",
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
                    foundCustomer.workPhone ||
                    foundCustomer.mobile ||
                    "",
                  buyerAddress: foundCustomer.billingAddress
                    ? `${foundCustomer.billingAddress.street || ""}, ${
                        foundCustomer.billingAddress.city || ""
                      }, ${foundCustomer.billingAddress.state || ""}`.trim()
                    : "",
                  billingAddress: {
                    street: foundCustomer.billingAddress?.street || "",
                    city: foundCustomer.billingAddress?.city || "",
                    state: foundCustomer.billingAddress?.state || "",
                    country: foundCustomer.billingAddress?.country || "India",
                    zipCode: foundCustomer.billingAddress?.zipCode || "",
                  },
                  shippingAddress: {
                    street: foundCustomer.shippingAddress?.street || "",
                    city: foundCustomer.shippingAddress?.city || "",
                    state: foundCustomer.shippingAddress?.state || "",
                    country: foundCustomer.shippingAddress?.country || "India",
                    zipCode: foundCustomer.shippingAddress?.zipCode || "",
                  },
                  placeOfSupplyState:
                    foundCustomer.shippingAddress?.state ||
                    extractStateName(companySettings.state), // Set to shipping state
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
            credentials: "include",
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
  }, [companySettings.state]);

  // Load TDS and TCS records on component mount
  useEffect(() => {
    loadTdsRecords();
    loadTcsRecords();
    // Trigger initial GST calculation
    setTimeout(() => recalculateAllTotals(), 100);
  }, []);

  // Set default place of supply from company settings
  useEffect(() => {
    if (!formData.placeOfSupplyState && companySettings.state) {
      const defaultState = extractStateName(companySettings.state);
      setFormData((prev) => ({
        ...prev,
        placeOfSupplyState: defaultState,
      }));
    }
  }, [companySettings.state, formData.placeOfSupplyState]);

  // Separate function to recalculate only totals (recalculates GST on discounted amount but preserves item-level GST distribution)
  const recalculateOnlyTotals = () => {
    setFormData((prev) => {
      const subTotal = prev.items.reduce(
        (sum, item) => sum + (item.amount || 0),
        0
      );
      const discountAmount =
        prev.discountType === "percentage"
          ? (subTotal * prev.discount) / 100
          : prev.discount;

      // Recalculate GST on (subtotal - discount) with proportional distribution
      const taxableAmount = subTotal - discountAmount;

      // Update items with GST calculated on proportional discounted amounts
      const updatedItems = prev.items.map((item) => {
        // Ensure all GST/IGST items have 18% tax rate
        let rate = 0;
        if (item.taxMode === "GST" || item.taxMode === "IGST") {
          rate = item.taxRate || 18; // Default to 18% if not set
        }

        // Calculate proportional discount for this item
        const itemProportion = subTotal > 0 ? (item.amount || 0) / subTotal : 0;
        const itemDiscountAmount = discountAmount * itemProportion;
        const itemTaxableAmount = (item.amount || 0) - itemDiscountAmount;

        const taxes = calculateItemTax(
          itemTaxableAmount,
          item.taxMode as TaxMode,
          rate
        );
        return { ...item, ...taxes };
      });

      // Calculate GST totals from updated items
      const cgstTotal = updatedItems.reduce((sum, i) => sum + (i.cgst || 0), 0);
      const sgstTotal = updatedItems.reduce((sum, i) => sum + (i.sgst || 0), 0);
      const igstTotal = updatedItems.reduce((sum, i) => sum + (i.igst || 0), 0);
      const totalGSTTax = cgstTotal + sgstTotal + igstTotal;

      // Calculate TDS/TCS on (subtotal - discount) BEFORE GST
      let additionalTaxAmount = 0;
      if (prev.additionalTaxType && prev.additionalTaxRate > 0) {
        const baseAmountForAdditionalTax = subTotal - discountAmount;
        additionalTaxAmount =
          (baseAmountForAdditionalTax * prev.additionalTaxRate) / 100;
      }

      const adjustedAdditionalTax =
        prev.additionalTaxType === "TDS"
          ? -additionalTaxAmount
          : additionalTaxAmount;

      const total =
        subTotal -
        discountAmount +
        totalGSTTax +
        adjustedAdditionalTax +
        prev.adjustment;

      return {
        ...prev,
        items: updatedItems,
        subTotal,
        discountAmount,
        cgstTotal,
        sgstTotal,
        igstTotal,
        taxAmount: totalGSTTax,
        additionalTaxAmount,
        total,
      };
    });
  };

  // Recalculate totals when TDS/TCS or adjustment changes (WITHOUT GST recalculation)
  useEffect(() => {
    recalculateOnlyTotals();
  }, [
    formData.additionalTaxType,
    formData.additionalTaxRate,
    formData.adjustment,
  ]);

  // Recalculate ALL totals INCLUDING GST when place of supply OR discount changes
  useEffect(() => {
    recalculateAllTotals();
  }, [formData.placeOfSupplyState, formData.discount, formData.discountType]);

  // Load TDS records
  const loadTdsRecords = async () => {
    try {
      setIsLoadingTaxes(true);
      const response = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL + "/api/tds/active",
        {
          credentials: "include",
        }
      );
      if (response.ok) {
        const result = await response.json();
        setTdsRecords(result.data || []);
      }
    } catch (error) {
      console.error("Error loading TDS records:", error);
    } finally {
      setIsLoadingTaxes(false);
    }
  };

  // Load TCS records
  const loadTcsRecords = async () => {
    try {
      setIsLoadingTaxes(true);
      const response = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL + "/api/tcs/active",
        {
          credentials: "include",
        }
      );
      if (response.ok) {
        const result = await response.json();
        setTcsRecords(result.data || []);
      }
    } catch (error) {
      console.error("Error loading TCS records:", error);
    } finally {
      setIsLoadingTaxes(false);
    }
  };

  const addItem = () => {
    const companyState = extractStateName(companySettings.state);
    const placeOfSupply = formData.placeOfSupplyState || companyState;
    const isSameState =
      companyState.toLowerCase() === placeOfSupply.toLowerCase();
    const defaultTaxMode = isSameState ? "GST" : "IGST";

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
          taxMode: defaultTaxMode as TaxMode,
          taxRate: 18, // Always default to 18%
          taxAmount: 0,
          cgst: 0,
          sgst: 0,
          igst: 0,
          taxRemark: "",
        } as InvoiceItem,
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

  const updateItem = (id: number, field: string, value: string | number) => {
    setFormData((prev) => {
      const updatedItems: InvoiceItem[] = prev.items.map((item) => {
        if (item.id !== id) return item;
        const updatedItem: InvoiceItem = {
          ...(item as InvoiceItem),
          [field]: value,
        } as InvoiceItem;

        // Normalize numeric fields
        if (field === "quantity" || field === "rate" || field === "amount") {
          const qty =
            Number(field === "quantity" ? value : updatedItem.quantity) || 0;
          const rate = Number(field === "rate" ? value : updatedItem.rate) || 0;
          updatedItem.amount =
            field === "amount" ? Number(value) || 0 : qty * rate;
        }

        // Handle tax mode updates
        if (field === "taxMode") {
          const newMode = value as TaxMode;
          // If user selects GST/IGST, automatically apply the appropriate one based on state
          if (newMode === "GST" || newMode === "IGST") {
            const companyState = extractStateName(companySettings.state);
            const placeOfSupply = prev.placeOfSupplyState || companyState;
            const isSameState =
              companyState.toLowerCase() === placeOfSupply.toLowerCase();
            updatedItem.taxMode = isSameState ? "GST" : "IGST";
          } else {
            updatedItem.taxMode = newMode;
          }
        }

        // Determine tax based on effective tax mode
        const effectiveTaxMode = updatedItem.taxMode;
        let rateToUse = 0;

        if (effectiveTaxMode === "GST" || effectiveTaxMode === "IGST") {
          rateToUse = Number(updatedItem.taxRate ?? prev.taxRate) || 0;
        }

        const taxes = calculateItemTax(
          updatedItem.amount || 0,
          effectiveTaxMode as TaxMode,
          rateToUse
        );

        updatedItem.cgst = taxes.cgst;
        updatedItem.sgst = taxes.sgst;
        updatedItem.igst = taxes.igst;
        updatedItem.taxAmount = taxes.taxAmount;
        updatedItem.taxRate = rateToUse;

        return updatedItem;
      });

      // Recalculate totals
      const subTotal = updatedItems.reduce(
        (sum: number, i: InvoiceItem) => sum + (i.amount || 0),
        0
      );
      const discountAmount =
        prev.discountType === "percentage"
          ? (subTotal * prev.discount) / 100
          : prev.discount;

      // Recalculate GST on (subtotal - discount) with proportional distribution
      const finalUpdatedItems = updatedItems.map((item) => {
        // Ensure all GST/IGST items have 18% tax rate
        let itemRate = 0;
        if (item.taxMode === "GST" || item.taxMode === "IGST") {
          itemRate = item.taxRate || 18; // Default to 18% if not set
        }

        // Calculate proportional discount for this item
        const itemProportion = subTotal > 0 ? (item.amount || 0) / subTotal : 0;
        const itemDiscountAmount = discountAmount * itemProportion;
        const itemTaxableAmount = (item.amount || 0) - itemDiscountAmount;

        const taxes = calculateItemTax(
          itemTaxableAmount,
          item.taxMode as TaxMode,
          itemRate
        );
        return { ...item, ...taxes };
      });

      const cgstTotal = finalUpdatedItems.reduce(
        (sum: number, i: InvoiceItem) => sum + (i.cgst || 0),
        0
      );
      const sgstTotal = finalUpdatedItems.reduce(
        (sum: number, i: InvoiceItem) => sum + (i.sgst || 0),
        0
      );
      const igstTotal = finalUpdatedItems.reduce(
        (sum: number, i: InvoiceItem) => sum + (i.igst || 0),
        0
      );
      const totalTax = cgstTotal + sgstTotal + igstTotal;
      const total =
        subTotal - discountAmount + totalTax + (prev.adjustment || 0);

      return {
        ...prev,
        items: finalUpdatedItems,
        subTotal,
        discountAmount,
        taxAmount: totalTax,
        cgstTotal,
        sgstTotal,
        igstTotal,
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
    setFormData((prev) => ({
      ...prev,
      buyerName: customer.firstName + " " + customer.lastName,
      buyerEmail: customer.email,
      buyerPhone: customer.workPhone || customer.mobile || "",
      buyerAddress: customer.billingAddress
        ? `${customer.billingAddress.street || ""}, ${
            customer.billingAddress.city || ""
          }, ${customer.billingAddress.state || ""}`.trim()
        : "",
      billingAddress: {
        street: customer.billingAddress?.street || "",
        city: customer.billingAddress?.city || "",
        state: customer.billingAddress?.state || "",
        country: customer.billingAddress?.country || "India",
        zipCode: customer.billingAddress?.zipCode || "",
      },
      shippingAddress: {
        street: customer.shippingAddress?.street || "",
        city: customer.shippingAddress?.city || "",
        state: customer.shippingAddress?.state || "",
        country: customer.shippingAddress?.country || "India",
        zipCode: customer.shippingAddress?.zipCode || "",
      },
      placeOfSupplyState:
        customer.shippingAddress?.state ||
        extractStateName(companySettings.state), // Set to shipping state
    }));
    // Don't automatically recalculate - let user update items manually
    // setTimeout(recalculateAllTotals, 0);
  };

  const handleSaveInvoice = async (asDraft = false) => {
    try {
      if (!selectedCustomer) {
        showToast("Please select a customer", "error");
        return;
      }

      // Remove undefined fields and ensure proper data types
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { project: _unusedProject, ...formDataWithoutProject } = formData;

      const invoiceData = {
        ...formDataWithoutProject,
        customerId: selectedCustomer._id,
        customerName:
          selectedCustomer.firstName + " " + selectedCustomer.lastName,
        customerEmail: selectedCustomer.email,
        customerPhone: selectedCustomer.workPhone || selectedCustomer.mobile || "",
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
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(invoiceData),
        }
      );

      const result = await response.json();

      if (response.ok) {
        console.log("Invoice saved successfully", result);
        showToast(
          `Invoice ${
            asDraft ? "saved as draft" : "created and sent"
          } successfully!`,
          "success"
        );
        setTimeout(() => router.push("/dashboard/sales/invoices"), 800);
      } else {
        console.error("Error saving invoice:", result.error);
        showToast(`Error: ${result.error}`, "error");
      }
    } catch (error) {
      console.error("Error saving invoice:", error);
      showToast("Error saving invoice. Please try again.", "error");
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      {/* Ultra Compact Header */}
      <div className="bg-white border-b border-gray-200 px-3 py-2">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">New Invoice</h1>
          <div className="flex items-center space-x-1">
            <button
              className="p-1 text-gray-400 hover:text-gray-600"
              onClick={() => router.push("/dashboard/sales/invoices")}
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Compact Customer Pre-selected Notification */}
      {showCustomerPreSelected && (
        <div className="bg-green-50 border border-green-200 px-3 py-1.5">
          <div className="flex items-center">
            <CheckIcon className="h-3 w-3 text-green-600 mr-1.5" />
            <p className="text-green-800 text-xs">
              Customer has been pre-selected from the customer details page.
            </p>
          </div>
        </div>
      )}

      {/* Ultra Compact Main Form */}
      <div className="p-3 pb-16">
        <div className="max-w-full space-y-3">
          {/* Customer Details */}
          <CustomerDetails
            customers={customers}
            selectedCustomer={selectedCustomer}
            searchTerm={searchTerm}
            showCustomerDropdown={showCustomerDropdown}
            onCustomerSelect={handleCustomerSelect}
            onSearchChange={setSearchTerm}
            onDropdownToggle={setShowCustomerDropdown}
            onPlaceOfSupplyChange={(selectedState) => {
              const companyState = extractStateName(companySettings.state);
              const isSameState =
                companyState.toLowerCase() === selectedState.toLowerCase();

              // Show toast notification about GST rule application
              if (selectedState) {
                if (isSameState) {
                  showToast(
                    `Same state: CGST + SGST will be applied (${companyState} → ${selectedState})`,
                    "info"
                  );
                } else {
                  showToast(
                    `Different state: IGST will be applied (${companyState} → ${selectedState})`,
                    "info"
                  );
                }
              }

              // Don't automatically recalculate - let user update items manually
              // setTimeout(recalculateAllTotals, 0);
            }}
            companyState={extractStateName(companySettings.state)}
            formData={{
              billingAddress: formData.billingAddress,
              shippingAddress: formData.shippingAddress,
              placeOfSupplyState: formData.placeOfSupplyState,
            }}
            onFormDataChange={(data) => {
              setFormData((prev) => ({
                ...prev,
                billingAddress: data.billingAddress || prev.billingAddress,
                shippingAddress: data.shippingAddress || prev.shippingAddress,
                // Update place of supply based on shipping address
                placeOfSupplyState:
                  data.shippingAddress?.state || prev.placeOfSupplyState,
              }));

              // Trigger GST recalculation when shipping address changes
              if (
                data.shippingAddress?.state &&
                data.shippingAddress.state !== formData.placeOfSupplyState
              ) {
                setTimeout(recalculateAllTotals, 100);
              }
            }}
          />

          {/* Invoice Details */}
          <InvoiceDetails formData={formData} onFormDataChange={setFormData} />

          {/* Items Table */}
          <ItemsTable
            items={formData.items}
            onAddItem={addItem}
            onRemoveItem={removeItem}
            onUpdateItem={updateItem}
            isIntraState={isIntraState}
          />

          {/* Summary and Additional Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div className="lg:col-span-2 space-y-3">
              {/* Customer Notes */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                <h2 className="text-sm font-semibold text-gray-900 mb-2">
                  Additional Details
                </h2>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Customer Notes
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Thanks for your business."
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      value={formData.customerNotes}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          customerNotes: e.target.value,
                        }))
                      }
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Will be displayed on the invoice
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Terms & Conditions
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Enter the terms and conditions of your business to be displayed in your transaction"
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      value={formData.termsConditions}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          termsConditions: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Attach File(s) to Invoice
                    </label>
                    <button className="flex items-center px-2 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                      <PaperClipIcon className="h-3 w-3 mr-1.5" />
                      Upload File
                      <ChevronDownIcon className="h-3 w-3 ml-1.5" />
                    </button>
                    <p className="text-xs text-gray-500 mt-1">
                      You can upload a maximum of 10 files, 10MB each
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Gateway Promotion */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-blue-900">
                      Want to get paid faster?
                    </p>
                    <p className="text-xs text-blue-700 mt-0.5">
                      Configure payment gateways and receive payments online.{" "}
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
              <InvoiceSummary
                formData={formData}
                onFormDataChange={(data) =>
                  setFormData((prev) => ({
                    ...prev,
                    ...data,
                  }))
                }
                isIntraState={isIntraState}
                tdsRecords={tdsRecords}
                tcsRecords={tcsRecords}
                isLoadingTaxes={isLoadingTaxes}
                onManageTDS={() => setShowTDSModal(true)}
                onManageTCS={() => setShowTCSModal(true)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Ultra Compact Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-3 py-2 shadow-lg">
        <div className="max-w-full flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => handleSaveInvoice(true)}
            >
              Save as Draft
            </button>
            <button
              className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => handleSaveInvoice(false)}
            >
              Save and Send
            </button>
            <button
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => router.push("/dashboard/sales/invoices")}
            >
              Cancel
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <div className="text-sm text-gray-600">
              <span className="font-medium">
                Total: ₹{(formData.total || 0).toFixed(2)}
              </span>
              <span className="ml-2 text-gray-500">
                Items: {formData.items.length}
              </span>
            </div>
            <button className="flex items-center px-2 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <ArrowPathIcon className="h-3 w-3 mr-1" />
              Make Recurring
            </button>
          </div>
        </div>
      </div>

      {/* Compact Toasts */}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-3 py-2 rounded-lg shadow-lg text-white text-xs font-medium max-w-sm ${
              t.type === "success"
                ? "bg-emerald-600 border-l-4 border-emerald-500"
                : t.type === "error"
                ? "bg-red-600 border-l-4 border-red-500"
                : "bg-gray-800 border-l-4 border-gray-700"
            } transform transition-all duration-300 ease-in-out`}
          >
            {t.message}
          </div>
        ))}
      </div>

      {/* Management Modals */}
      <TDSManagementModal
        isOpen={showTDSModal}
        onClose={() => setShowTDSModal(false)}
        onUpdate={() => {
          loadTdsRecords();
        }}
      />

      <TCSManagementModal
        isOpen={showTCSModal}
        onClose={() => setShowTCSModal(false)}
        onUpdate={() => {
          loadTcsRecords();
        }}
      />
    </div>
  );
};

export default NewInvoiceForm;
