"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  XMarkIcon,
  ChevronDownIcon,
  CheckIcon,
  PaperClipIcon,
  ArrowPathIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  ChevronUpIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

import CustomerDetails from "./components/CustomerDetails";
import InvoiceDetails from "./components/InvoiceDetails";
import ItemsTable from "../../invoices/new/components/ItemsTable";
import InvoiceSummary from "../../invoices/new/components/InvoiceSummary";
import TDSManagementModal from "../../invoices/new/components/TDSManagementModal";
import TCSManagementModal from "../../invoices/new/components/TCSManagementModal";
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

interface FormData {
  invoiceNumber: string;
  reference: string;
  invoiceDate: string;
  terms: string;
  dueDate: string;
  salesperson: string;
  deliveryMethod: string;
  subject: string;
  project: string;
  items: InvoiceItem[];
  subTotal: number;
  discount: number;
  discountType: "percentage" | "amount";
  discountAmount: number;
  taxAmount: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  additionalTaxType: "TDS" | "TCS" | null;
  additionalTaxId: string;
  additionalTaxRate: number;
  additionalTaxAmount: number;
  adjustment: number;
  total: number;
  paymentTerms: string;
  paymentMethod: string;
  customerNotes: string;
  termsConditions: string;
  internalNotes: string;
  files: File[];
  currency: string;
  exchangeRate: number;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  buyerGstin: string;
  buyerAddress: string;
  billingAddress: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  shippingAddress: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  placeOfSupplyState?: string;
  taxMode: TaxMode;
  taxType: string;
  taxRate: number;
  sellerName: string;
  sellerEmail: string;
  sellerPhone: string;
  sellerGstin: string;
  sellerAddress: string;
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
  taxMode: TaxMode;
  taxRate: number;
  taxAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  taxRemark: string;
}

const NewSalesOrderForm = () => {
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
  
  // File upload states
  const [showUploadFilesDropdown, setShowUploadFilesDropdown] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<FormData>({
    invoiceNumber: "INV-000001",
    reference: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    terms: "Due on Receipt",
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    salesperson: "",
    deliveryMethod: "",
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
    taxMode: "GST" as TaxMode,
    taxType: "GST",
    taxRate: 18,
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

  // Modal states
  const [showInvoiceDetailsModal, setShowInvoiceDetailsModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [isHeaderMinimized, setIsHeaderMinimized] = useState(true);

  // Local toast notifications
  const [toasts, setToasts] = useState<
    { id: number; message: string; type: "success" | "error" | "info" }[]
  >([]);
  const [lastToastMessage, setLastToastMessage] = useState<string>("");

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    // Prevent duplicate toast messages
    if (message === lastToastMessage) {
      return;
    }

    setLastToastMessage(message);
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);

    // Clear the last toast message after a delay to allow future toasts
    setTimeout(() => {
      setLastToastMessage("");
    }, 1000);
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
                    foundCustomer.workPhone || foundCustomer.mobile || "",
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
          process.env.NEXT_PUBLIC_BACKEND_URL + "/api/sales-orders/next-number",
          {
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data.salesOrderNumber) {
            setFormData((prev) => ({
              ...prev,
              invoiceNumber: result.data.salesOrderNumber,
            }));
          }
        } else {
          console.error(
            "Error fetching next sales order number:",
            response.status
          );
        }
      } catch (error) {
        console.error("Error fetching next sales order number:", error);
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUploadFilesDropdown(false);
        setIsDragOver(false);
      }
    };

    if (showUploadFilesDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUploadFilesDropdown]);

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
          itemRate = item.taxRate || 18;
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

  const handleCustomerSelect = (customer: Customer | null) => {
    if (customer) {
      setSelectedCustomer(customer);
      setShowCustomerDropdown(false);
      setSearchTerm(customer.firstName + " " + customer.lastName);

      // Update form data with customer details
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

      // Show toast notification about customer selection
      showToast(
        `Customer "${customer.firstName} ${customer.lastName}" selected successfully!`,
        "success"
      );

      // Trigger GST recalculation after a short delay to ensure state updates
      setTimeout(() => {
        recalculateAllTotals();
      }, 100);
    } else {
      // Clear customer selection
      setSelectedCustomer(null);
      setShowCustomerDropdown(false);
      setSearchTerm("");

      // Clear form data related to customer
      setFormData((prev) => ({
        ...prev,
        buyerName: "",
        buyerEmail: "",
        buyerPhone: "",
        buyerAddress: "",
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
      }));

      showToast("Customer selection cleared", "info");
    }
  };

  // File upload handlers
  const validateFile = (file: File): string | null => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif'
    ];

    if (file.size > maxSize) {
      return `File ${file.name} is too large. Maximum size is 10MB.`;
    }

    if (!allowedTypes.includes(file.type)) {
      return `File ${file.name} has an unsupported format.`;
    }

    return null;
  };

  const handleFiles = (files: File[]) => {
    // Clear previous errors
    setUploadErrors([]);

    // Check if files array is empty
    if (!files || files.length === 0) {
      setUploadErrors(["No files selected"]);
      return;
    }

    // Check file count limit
    if (formData.files.length + files.length > 10) {
      setUploadErrors(["Maximum 10 files allowed"]);
      return;
    }

    const errors: string[] = [];
    const validFiles: File[] = [];

    // Validate each file
    files.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        errors.push(error);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      setUploadErrors(errors);
      if (validFiles.length === 0) {
        showToast("No valid files to upload", "error");
        return;
      }
    }

    // Add valid files to form data
    setFormData((prev) => ({
      ...prev,
      files: [...prev.files, ...validFiles]
    }));

    setShowUploadFilesDropdown(false);
    setIsDragOver(false);
    
    if (validFiles.length > 0) {
      showToast(`${validFiles.length} file(s) added successfully`, "success");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const removeFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const openFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      console.error("File input ref is not available");
      showToast("File input not available. Please try again.", "error");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSaveInvoice = async (asDraft = false) => {
    try {
      if (!selectedCustomer || !selectedCustomer._id) {
        showToast("Please select a customer", "error");
        return;
      }

      // Remove undefined fields and ensure proper data types
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { project: _unusedProject, ...formDataWithoutProject } = formData;

      const salesOrderData = {
        ...formDataWithoutProject,
        customerId: selectedCustomer._id,
        customerName:
          selectedCustomer.firstName + " " + selectedCustomer.lastName,
        customerEmail: selectedCustomer.email,
        customerPhone:
          selectedCustomer.workPhone || selectedCustomer.mobile || "",
        status: asDraft ? "Draft" : "Sent",
        orderDate: new Date(formData.invoiceDate),
        deliveryDate: new Date(formData.dueDate),
        salesOrderNumber: formData.invoiceNumber,
        reference: formData.reference,
        salesperson: formData.salesperson,
        deliveryMethod: formData.deliveryMethod,
        // Clean up items - remove empty itemId fields
        items: formData.items.map((item) => ({
          ...item,
          itemId: item.itemId || undefined,
        })),
      };

      let response;

      try {
        // Check if we have files to upload
        const hasFiles = formData.files && formData.files.length > 0;

        if (hasFiles) {
          console.log("📁 Files detected, using FormData for upload");

          // Create FormData for file uploads
          const formDataToSend = new FormData();

          // Add the sales order data as JSON string
          formDataToSend.append("salesOrderData", JSON.stringify(salesOrderData));

          // Add files
          formData.files.forEach((file, index) => {
            formDataToSend.append("files", file);
            console.log(`📎 Adding file ${index + 1}:`, file.name);
          });

          // Send with FormData
          response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/sales-orders`,
            {
              method: "POST",
              credentials: "include",
              body: formDataToSend,
            }
          );
        } else {
          console.log("📄 No files, sending as JSON");

          // Send as regular JSON
          response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/sales-orders`,
            {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(salesOrderData),
            }
          );
        }
      } catch (error) {
        console.error("Error in file upload preparation:", error);
        showToast("Error preparing file upload. Please try again.", "error");
        return;
      }

      const result = await response.json();

      if (response.ok) {
        console.log("Sales order saved successfully", result);
        showToast(
          `Sales order ${
            asDraft ? "saved as draft" : "created and sent"
          } successfully!`,
          "success"
        );
        setTimeout(() => router.push("/dashboard/sales/sales-orders"), 800);
      } else {
        console.error("Error saving sales order:", result.error);
        showToast(`Error: ${result.error}`, "error");
      }
    } catch (error) {
      console.error("Error saving sales order:", error);
      showToast("Error saving sales order. Please try again.", "error");
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      {/* Company Header Section - Collapsible */}
      <div className="bg-white border-b border-gray-200">
        <div
          className={`transition-all duration-300 ease-in-out ${
            isHeaderMinimized ? "p-2" : "p-4"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push("/dashboard/sales/sales-orders")}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                title="Go back to Sales Orders"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {companySettings.companyName}
                </h1>
                <p className="text-sm text-gray-600">
                  GSTIN: {companySettings.gstin}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsHeaderMinimized(!isHeaderMinimized)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title={
                isHeaderMinimized
                  ? "Expand Company Details"
                  : "Minimize Company Details"
              }
            >
              {isHeaderMinimized ? (
                <ChevronDownIcon className="h-5 w-5" />
              ) : (
                <ChevronUpIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          {!isHeaderMinimized && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start space-x-2">
                <MapPinIcon className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-gray-900 font-medium">Address</p>
                  <p className="text-gray-600">{companySettings.address}</p>
                  <p className="text-gray-600">
                    {companySettings.state} - {companySettings.pinCode}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <PhoneIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{companySettings.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{companySettings.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <GlobeAltIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">
                    {companySettings.website}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Customer Pre-selected Notification */}
      {showCustomerPreSelected && (
        <div className="bg-green-50 border border-green-200 px-4 py-2">
          <div className="flex items-center">
            <CheckIcon className="h-4 w-4 text-green-600 mr-2" />
            <p className="text-green-800 text-sm">
              Customer has been pre-selected from the customer details page.
            </p>
          </div>
        </div>
      )}

      {/* Main Form Content */}
      <div className="p-4 pb-20">
        <div className="max-w-full space-y-4">
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

              // Only show toast if the state has actually changed
              if (
                selectedState &&
                selectedState !== formData.placeOfSupplyState
              ) {
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
                placeOfSupplyState:
                  data.placeOfSupplyState ||
                  data.shippingAddress?.state ||
                  prev.placeOfSupplyState,
              }));

              // Trigger GST recalculation when place of supply changes
              if (
                data.placeOfSupplyState &&
                data.placeOfSupplyState !== formData.placeOfSupplyState
              ) {
                setTimeout(recalculateAllTotals, 100);
              }
            }}
          />

          {/* Invoice Details */}
          <InvoiceDetails
            formData={{
              invoiceNumber: formData.invoiceNumber,
              reference: formData.reference,
              invoiceDate: formData.invoiceDate,
              terms: formData.terms,
              dueDate: formData.dueDate,
              salesperson: formData.salesperson,
            }}
            onFormDataChange={(data) => {
              setFormData((prev) => ({
                ...prev,
                invoiceNumber: data.invoiceNumber || prev.invoiceNumber,
                reference: data.reference || prev.reference,
                invoiceDate: data.invoiceDate || prev.invoiceDate,
                terms: data.terms || prev.terms,
                dueDate: data.dueDate || prev.dueDate,
                salesperson: data.salesperson || prev.salesperson,
              }));
            }}
          />

          {/* Items Table */}
          <ItemsTable
            items={formData.items}
            onAddItem={addItem}
            onRemoveItem={removeItem}
            onUpdateItem={updateItem}
            onItemSelect={(id, itemId, itemDetails) => {
              setFormData((prev) => {
                const updatedItems = prev.items.map((item) => {
                  if (item.id !== id) return item;

                  return {
                    ...item,
                    itemId: itemId,
                    details: itemDetails.name || "",
                    description: itemDetails.description || "",
                    rate: itemDetails.sellingPrice || 0,
                    unit: itemDetails.unit || "pcs",
                    amount:
                      (item.quantity || 1) * (itemDetails.sellingPrice || 0),
                    taxRate: itemDetails.gstRate || item.taxRate || 18,
                  };
                });

                const subTotal = updatedItems.reduce(
                  (sum: number, i: InvoiceItem) => sum + (i.amount || 0),
                  0
                );
                const discountAmount =
                  prev.discountType === "percentage"
                    ? (subTotal * prev.discount) / 100
                    : prev.discount;

                const finalUpdatedItems = updatedItems.map((item) => {
                  let itemRate = 0;
                  if (item.taxMode === "GST" || item.taxMode === "IGST") {
                    itemRate = item.taxRate || 18;
                  }

                  const itemProportion =
                    subTotal > 0 ? (item.amount || 0) / subTotal : 0;
                  const itemDiscountAmount = discountAmount * itemProportion;
                  const itemTaxableAmount =
                    (item.amount || 0) - itemDiscountAmount;

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
            }}
            isIntraState={isIntraState}
          />

          {/* Additional Details and Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Additional Details - Left Side */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Additional Details
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      placeholder="Enter sales order subject"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          subject: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Method
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.deliveryMethod}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          deliveryMethod: e.target.value,
                        }))
                      }
                    >
                      <option value="">Select Delivery Method</option>
                      <option value="Standard Delivery">
                        Standard Delivery
                      </option>
                      <option value="Express Delivery">Express Delivery</option>
                      <option value="Pickup">Pickup</option>
                      <option value="Courier">Courier</option>
                      <option value="Hand Delivery">Hand Delivery</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Notes
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Thanks for your business."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.customerNotes}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          customerNotes: e.target.value,
                        }))
                      }
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Will be displayed on the sales order
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Terms & Conditions
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Enter the terms and conditions of your business to be displayed in your transaction"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Attach File(s) to Sales Order
                    </label>
                    
                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif"
                      onChange={(e) => {
                        if (e.target.files) {
                          handleFiles(Array.from(e.target.files));
                        }
                      }}
                      className="hidden"
                    />

                    {/* Upload Button with Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                      <button 
                        onClick={() => setShowUploadFilesDropdown(!showUploadFilesDropdown)}
                        className={`flex items-center px-3 py-2 text-sm font-medium border rounded-lg transition-colors ${
                          showUploadFilesDropdown 
                            ? 'text-blue-700 bg-blue-50 border-blue-300' 
                            : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <PaperClipIcon className="h-4 w-4 mr-2" />
                        Upload File
                        <ChevronDownIcon className={`h-4 w-4 ml-2 transition-transform ${
                          showUploadFilesDropdown ? 'rotate-180' : ''
                        }`} />
                      </button>
                      
                      {showUploadFilesDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                          <button
                            onClick={openFileInput}
                            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-200 flex items-center"
                          >
                            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            Choose Files
                          </button>
                          <div
                            className={`px-3 py-4 text-center text-sm transition-colors ${
                              isDragOver 
                                ? 'bg-blue-50 text-blue-600 border-2 border-dashed border-blue-300' 
                                : 'text-gray-500 hover:bg-gray-50 border-2 border-dashed border-transparent'
                            }`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                          >
                            <svg className="h-6 w-6 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            Or drag and drop files here
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Upload Errors */}
                    {uploadErrors.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {uploadErrors.map((error, index) => (
                          <p key={index} className="text-xs text-red-600">
                            {error}
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Uploaded Files List */}
                    {formData.files.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs text-gray-600 font-medium">
                          Uploaded Files ({formData.files.length}/10):
                        </p>
                        <div className="space-y-1">
                          {formData.files.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded text-xs">
                              <div className="flex items-center space-x-2">
                                <PaperClipIcon className="h-3 w-3 text-gray-500" />
                                <span className="text-gray-700 truncate max-w-[200px]">
                                  {file.name}
                                </span>
                                <span className="text-gray-500">
                                  ({formatFileSize(file.size)})
                                </span>
                              </div>
                              <button
                                onClick={() => removeFile(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-gray-500 mt-1">
                      You can upload a maximum of 10 files, 10MB each
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Gateway Promotion */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Want to get paid faster?
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      Configure payment gateways and receive payments online.{" "}
                      <button className="text-blue-600 hover:text-blue-800 underline">
                        Set up Payment Gateway
                      </button>
                    </p>
                  </div>
                  <div className="text-sm text-blue-600">WA</div>
                </div>
              </div>
            </div>

            {/* Bill Calculation - Right Side */}
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

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 shadow-lg">
        <div className="max-w-full flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => handleSaveInvoice(true)}
            >
              Save as Draft
            </button>
            <button
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => handleSaveInvoice(false)}
            >
              Save and Send
            </button>
            <button
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => router.push("/dashboard/sales/sales-orders")}
            >
              Cancel
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-600">
              <span className="font-medium">
                Total: ₹{(formData.total || 0).toFixed(2)}
              </span>
              <span className="ml-2 text-gray-500">
                Items: {formData.items.length}
              </span>
            </div>
            <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Make Recurring
            </button>
          </div>
        </div>
      </div>

      {/* Invoice Details Modal */}
      {showInvoiceDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center invoice-details-modal">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => setShowInvoiceDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
                <h3 className="text-lg font-semibold text-gray-900">
                  Sales Order Details
                </h3>
                <div className="w-8"></div> {/* Spacer for centering */}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sales Order Number
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.invoiceNumber}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        invoiceNumber: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reference
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.reference}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        reference: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sales Order Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.invoiceDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        invoiceDate: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Terms
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.terms}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        terms: e.target.value,
                      }))
                    }
                  >
                    <option value="Due on Receipt">Due on Receipt</option>
                    <option value="Net 15">Net 15</option>
                    <option value="Net 30">Net 30</option>
                    <option value="Net 45">Net 45</option>
                    <option value="Net 60">Net 60</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salesperson
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.salesperson}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        salesperson: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Method
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.deliveryMethod}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        deliveryMethod: e.target.value,
                      }))
                    }
                  >
                    <option value="">Select Delivery Method</option>
                    <option value="Standard Delivery">Standard Delivery</option>
                    <option value="Express Delivery">Express Delivery</option>
                    <option value="Pickup">Pickup</option>
                    <option value="Courier">Courier</option>
                    <option value="Hand Delivery">Hand Delivery</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        dueDate: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowInvoiceDetailsModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowInvoiceDetailsModal(false)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 space-y-2 toast-notifications">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium max-w-sm ${
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

export default NewSalesOrderForm;
