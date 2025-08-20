"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  XMarkIcon,
  ChevronDownIcon,
  CheckIcon,
  PaperClipIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

import CustomerDetails from "./components/CustomerDetails";
import QuoteDetails from "./components/QuoteDetails";
import ItemsTable from "./components/ItemsTable";
import QuoteSummary from "./components/QuoteSummary";
import TDSManagementModal from "./components/TDSManagementModal";
import TCSManagementModal from "./components/TCSManagementModal";

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
  shippingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
}

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

interface QuoteItem {
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

const NewQuoteForm = () => {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCustomerPreSelected, setShowCustomerPreSelected] = useState(false);

  // TDS/TCS State
  const [tdsRecords, setTdsRecords] = useState<TDSRecord[]>([]);
  const [tcsRecords, setTcsRecords] = useState<TCSRecord[]>([]);
  const [isLoadingTaxes, setIsLoadingTaxes] = useState(false);
  const [showTDSModal, setShowTDSModal] = useState(false);
  const [showTCSModal, setShowTCSModal] = useState(false);
  
  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Backend status removed

  const [formData, setFormData] = useState({
    quoteNumber: "QT-000001",
    referenceNumber: "",
    quoteDate: new Date().toISOString().split("T")[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    terms: "Due on Receipt",
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
        rate: 10000.0,
        amount: 100000.0,
        taxMode: "IGST" as TaxMode,
        taxRate: 18,
        taxAmount: 0,
        cgst: 0,
        sgst: 0,
        igst: 0,
        taxRemark: "",
      } as QuoteItem,
    ] as QuoteItem[],
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
    customerNotes: "Thanks for your business.",
    termsConditions: "",
    internalNotes: "",
    files: [],
    // Signature upload fields
    enableSignature: false,
    signatureFile: null as File | null,
    signaturePreview: "",
    currency: "INR",
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

  // File size validation helper
  const validateFileSize = (file: File, maxSizeMB: number = 5) => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      showToast(`File size must be less than ${maxSizeMB}MB`, "error");
      return false;
    }
    return true;
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

  // Function to recalculate all totals when tax rate/place changes
  const recalculateAllTotals = () => {
    setFormData((prev) => {
      // First calculate subtotal and discount
      const subTotal = (prev.items || []).reduce(
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
      const updatedItems: QuoteItem[] = (prev.items || []).map((item) => {
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

        return { ...(item as QuoteItem), taxRate: rate, ...taxes };
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

  // Call recalculateAllTotals only once when component mounts
  useEffect(() => {
    // Initial calculation when component mounts
    const initialCalculation = () => {
      setFormData((prev) => {
        // First calculate subtotal and discount
        const subTotal = (prev.items || []).reduce(
          (sum, item) => sum + (item.amount || 0),
          0
        );
        const discountAmount =
          prev.discountType === "percentage"
            ? (subTotal * prev.discount) / 100
            : prev.discount;

        // Update items with GST calculated on proportional discounted amounts
        const updatedItems: QuoteItem[] = (prev.items || []).map((item) => {
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

          return { ...(item as QuoteItem), taxRate: rate, ...taxes };
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

    initialCalculation();
  }, []); // Empty dependency array - only run once on mount

  // Handle recalculation when form values change (prevent infinite loops)
  const isInitialMount = useRef(true);
  const prevFormData = useRef({
    discount: formData.discount,
    discountType: formData.discountType,
    additionalTaxType: formData.additionalTaxType,
    additionalTaxRate: formData.additionalTaxRate,
    adjustment: formData.adjustment,
    placeOfSupplyState: formData.placeOfSupplyState
  });

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Only recalculate if relevant values actually changed (excluding items to prevent infinite loops)
    const hasRelevantChanges = 
      prevFormData.current.discount !== formData.discount ||
      prevFormData.current.discountType !== formData.discountType ||
      prevFormData.current.additionalTaxType !== formData.additionalTaxType ||
      prevFormData.current.additionalTaxRate !== formData.additionalTaxRate ||
      prevFormData.current.adjustment !== formData.adjustment ||
      prevFormData.current.placeOfSupplyState !== formData.placeOfSupplyState;

    if (hasRelevantChanges) {
      recalculateAllTotals();
      prevFormData.current = {
        discount: formData.discount,
        discountType: formData.discountType,
        additionalTaxType: formData.additionalTaxType,
        additionalTaxRate: formData.additionalTaxRate,
        adjustment: formData.adjustment,
        placeOfSupplyState: formData.placeOfSupplyState
      };
    }
  }, [formData.discount, formData.discountType, formData.additionalTaxType, formData.additionalTaxRate, formData.adjustment, formData.placeOfSupplyState]);

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

  // Fetch customers from backend
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
          const customersData = responseData.data || responseData;
          const validCustomers = Array.isArray(customersData)
            ? customersData.filter(
                (customer) =>
                  customer &&
                  customer._id &&
                  customer.firstName &&
                  customer.email
              )
            : [];
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
    loadTdsRecords();
    loadTcsRecords();
    // Remove the setTimeout call to prevent conflicts
    // setTimeout(() => recalculateAllTotals(), 100);
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
  }, [companySettings.state]); // Remove formData.placeOfSupplyState from dependencies

  // Ensure items array is always defined
  useEffect(() => {
    if (!formData.items || formData.items.length === 0) {
      setFormData((prev) => ({
        ...prev,
        items: [
          {
            id: 1,
            itemId: "",
            details: "",
            description: "",
            quantity: 1.0,
            unit: "pcs",
            rate: 10000.0,
            amount: 100000.0,
            taxMode: "IGST" as TaxMode,
            taxRate: 18,
            taxAmount: 0,
            cgst: 0,
            sgst: 0,
            igst: 0,
            taxRemark: "",
          } as QuoteItem,
        ],
      }));
    }
  }, [formData.items]);

  // Show immediate alert about backend status
  useEffect(() => {
    console.log("🚨 SHOWING IMMEDIATE BACKEND STATUS ALERT");
    alert("🔧 Backend Status Check: The system is checking if your backend server is running. Look for the blue status panel below.");
  }, []);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        console.log("🔐 Checking authentication status...");
        const response = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + "/api/auth/check", {
          method: "GET",
          credentials: "include",
          signal: AbortSignal.timeout(5000),
        });
        
        if (response.status === 401) {
          console.log("❌ Authentication failed on page load");
          showToast("Your session has expired. Please log in again.", "error");
          
          // Clear authentication data
          localStorage.removeItem('user');
          sessionStorage.clear();
          
          // Redirect to login
          setTimeout(() => {
            router.push("/signin");
          }, 2000);
        } else {
          console.log("✅ Authentication check passed on page load");
        }
      } catch (error) {
        console.log("🔐 Authentication check failed on page load:", error);
      }
    };

    checkAuthStatus();
  }, []);

  // Backend status check removed

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
        ...(prev.items || []),
        {
          id: (prev.items?.length || 0) + 1,
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
        } as QuoteItem,
      ],
    }));
  };

  const removeItem = (id: number) => {
    if (formData.items && formData.items.length > 1) {
      setFormData((prev) => ({
        ...prev,
        items: (prev.items || []).filter((item) => item.id !== id),
      }));
    }
  };

  const updateItem = (id: number, field: string, value: string | number) => {
    setFormData((prev) => {
      const updatedItems: QuoteItem[] = (prev.items || []).map((item) => {
        if (item.id !== id) return item;
        const updatedItem: QuoteItem = {
          ...(item as QuoteItem),
          [field]: value,
        } as QuoteItem;

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
      const subTotal = (updatedItems || []).reduce(
        (sum: number, i: QuoteItem) => sum + (i.amount || 0),
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

      const cgstTotal = (finalUpdatedItems || []).reduce(
        (sum: number, i: QuoteItem) => sum + (i.cgst || 0),
        0
      );
      const sgstTotal = (finalUpdatedItems || []).reduce(
        (sum: number, i: QuoteItem) => sum + (i.sgst || 0),
        0
      );
      const igstTotal = (finalUpdatedItems || []).reduce(
        (sum: number, i: QuoteItem) => sum + (i.igst || 0),
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
      buyerPhone: customer.phone || customer.mobile || customer.workPhone || "",
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
  };

  const handleSaveQuote = async (asDraft = false) => {
    try {
      // Prevent multiple submissions
      if (isSubmitting) {
        return;
      }
      
      setIsSubmitting(true);
      
      // Check if user is authenticated
      try {
        const authCheck = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + "/api/auth/check", {
          method: "GET",
          credentials: "include",
          signal: AbortSignal.timeout(5000),
        });
        
        if (authCheck.status === 401) {
          console.log("🔐 Authentication check failed - session expired");
          
          // Try to refresh the session first
          try {
            console.log("🔄 Attempting to refresh session...");
            const refreshResponse = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + "/api/auth/refresh", {
              method: "POST",
              credentials: "include",
              signal: AbortSignal.timeout(5000),
            });
            
            if (refreshResponse.ok) {
              console.log("✅ Session refreshed successfully");
              showToast("Session refreshed successfully", "success");
            } else {
              console.log("❌ Session refresh failed, redirecting to login");
              showToast("Your session has expired. Please log in again.", "error");
              setIsSubmitting(false);
              
              // Clear authentication data
              localStorage.removeItem('user');
              sessionStorage.clear();
              
              // Redirect to login
              setTimeout(() => {
                router.push("/signin");
              }, 1000);
              return;
            }
          } catch (refreshError) {
            console.log("❌ Session refresh failed:", refreshError);
            showToast("Your session has expired. Please log in again.", "error");
            setIsSubmitting(false);
            
            // Clear authentication data
            localStorage.removeItem('user');
            sessionStorage.clear();
            
            // Redirect to login
            setTimeout(() => {
              router.push("/signin");
            }, 1000);
            return;
          }
        }
        
        console.log("✅ Authentication check passed");
      } catch (authError) {
        console.log("🔐 Auth check failed, continuing with quote save...", authError);
      }
      
      if (!selectedCustomer) {
        showToast("Please select a customer", "error");
        setIsSubmitting(false);
        return;
      }

      // Validate customer has required phone number
      if (!selectedCustomer.phone && !selectedCustomer.mobile && !selectedCustomer.workPhone) {
        showToast("Customer must have at least one phone number", "error");
        setIsSubmitting(false);
        return;
      }

      // Validate required fields
      if (!formData.quoteNumber?.trim()) {
        showToast("Quote number is required", "error");
        setIsSubmitting(false);
        return;
      }

      if (!formData.quoteDate) {
        showToast("Quote date is required", "error");
        setIsSubmitting(false);
        return;
      }

      if (!formData.items || formData.items.length === 0) {
        showToast("At least one item is required", "error");
        setIsSubmitting(false);
        return;
      }

      // Validate items have required fields
      const invalidItems = formData.items.filter(item => !item.details?.trim() || !item.rate || item.rate <= 0);
      if (invalidItems.length > 0) {
        showToast("Please fill in all required item fields (details and rate)", "error");
        setIsSubmitting(false);
        return;
      }

      // Additional validation for critical fields
      console.log("🔍 Validation Check:");
      console.log("✅ Customer:", selectedCustomer ? "Selected" : "Missing");
      console.log("✅ Quote Number:", formData.quoteNumber ? "Present" : "Missing");
      console.log("✅ Quote Date:", formData.quoteDate ? "Present" : "Missing");
      console.log("✅ Items:", formData.items?.length || 0, "items");
      console.log("✅ Total Amount:", formData.total || 0);
      
      // Validate file sizes
      if (formData.signatureFile && formData.enableSignature) {
        const signatureSizeMB = formData.signatureFile.size / (1024 * 1024);
        if (signatureSizeMB > 5) {
          showToast("Signature file is too large. Maximum size is 5MB.", "error");
          setIsSubmitting(false);
          return;
        }
        console.log("📝 Signature file size:", signatureSizeMB.toFixed(2), "MB");
      }
      
      if (formData.files && formData.files.length > 0) {
        for (let i = 0; i < formData.files.length; i++) {
          const file = formData.files[i];
          const fileSizeMB = file.size / (1024 * 1024);
          if (fileSizeMB > 10) {
            showToast(`File "${file.name}" is too large. Maximum size is 10MB.`, "error");
            setIsSubmitting(false);
            return;
          }
          console.log(`📎 File ${i + 1} size:`, fileSizeMB.toFixed(2), "MB");
        }
      }
      
      // Check if any critical data is missing
      if (!formData.quoteNumber?.trim()) {
        showToast("Quote number is required", "error");
        setIsSubmitting(false);
        return;
      }
      
      if (!formData.quoteDate) {
        showToast("Quote date is required", "error");
        setIsSubmitting(false);
        return;
      }
      
      if (!formData.items || formData.items.length === 0) {
        showToast("At least one item is required", "error");
        setIsSubmitting(false);
        return;
      }

      const quoteData = {
        customerId: selectedCustomer._id,
        customerName: selectedCustomer.firstName + " " + selectedCustomer.lastName,
        customerEmail: selectedCustomer.email,
        customerPhone: selectedCustomer.phone || selectedCustomer.mobile || selectedCustomer.workPhone || "Not provided",
        customerAddress: selectedCustomer.billingAddress
          ? `${selectedCustomer.billingAddress?.street || ""}, ${
              selectedCustomer.billingAddress?.city || ""
            }, ${selectedCustomer.billingAddress?.state || ""}`.trim()
          : "",
        
        // Buyer Details (same as customer for now)
        buyerName: selectedCustomer.firstName + " " + selectedCustomer.lastName,
        buyerEmail: selectedCustomer.email,
        buyerPhone: selectedCustomer.phone || selectedCustomer.mobile || selectedCustomer.workPhone || "Not provided",
        buyerAddress: selectedCustomer.billingAddress
          ? `${selectedCustomer.billingAddress?.street || ""}, ${
              selectedCustomer.billingAddress?.city || ""
            }, ${selectedCustomer.billingAddress?.state || ""}`.trim()
          : "",
        
        // Seller Details (from company settings)
        sellerName: companySettings.companyName,
        sellerEmail: companySettings.email,
        sellerPhone: companySettings.phone,
        sellerGstin: companySettings.gstin,
        sellerAddress: companySettings.address,
        
        // Quote Details
        quoteNumber: formData.quoteNumber?.trim() || "",
        quoteDate: new Date(formData.quoteDate || new Date().toISOString().split("T")[0]),
        validUntil: new Date(formData.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]),
        subject: formData.subject || "",
        terms: formData.terms || "Due on Receipt",
        
        // Items with essential data only (reduce payload size)
        items: (formData.items || []).map((item) => ({
          itemId: item.itemId || "",
          details: item.details || "",
          description: item.description || "",
          quantity: item.quantity || 0,
          unit: item.unit || "pcs",
          rate: item.rate || 0,
          amount: item.amount || 0,
          taxMode: item.taxMode || "IGST",
          taxRate: item.taxRate || 18,
          taxAmount: item.taxAmount || 0,
          cgst: item.cgst || 0,
          sgst: item.sgst || 0,
          igst: item.igst || 0
          // Removed taxRemark to reduce payload size
        })),
        
        // Summary with full tax breakdown
        subTotal: formData.subTotal || 0,
        discount: formData.discount || 0,
        discountType: formData.discountType || "percentage",
        discountAmount: formData.discountAmount || 0,
        taxType: formData.taxType || "GST",
        taxRate: formData.taxRate || 18,
        taxAmount: formData.taxAmount || 0,
        cgstTotal: formData.cgstTotal || 0,
        sgstTotal: formData.sgstTotal || 0,
        igstTotal: formData.igstTotal || 0,
        
        // TDS/TCS fields
        additionalTaxType: formData.additionalTaxType || null,
        additionalTaxId: formData.additionalTaxId || "",
        additionalTaxRate: formData.additionalTaxRate || 0,
        additionalTaxAmount: formData.additionalTaxAmount || 0,
        
        adjustment: formData.adjustment || 0,
        total: formData.total || 0,
        
        // Additional fields - Keep only essential text data
        customerNotes: formData.customerNotes || "",
        termsConditions: formData.termsConditions || "",
        internalNotes: formData.internalNotes || "",
        files: [], // Don't send file data in JSON payload
        // Signature fields - Don't send large image data
        enableSignature: formData.enableSignature || false,
        signatureFile: formData.signatureFile ? {
          name: formData.signatureFile.name,
          size: formData.signatureFile.size,
          type: formData.signatureFile.type
        } : null, // Send file metadata only
        signaturePreview: "", // Don't send actual image data
        currency: formData.currency || "INR",
        
        // Address blocks
        billingAddress: formData.billingAddress || {},
        shippingAddress: formData.shippingAddress || {},
        placeOfSupplyState: formData.placeOfSupplyState || "",
        
        status: asDraft ? 'draft' : 'sent'
      };

      // Check if backend URL is configured
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      console.log("Using backend URL:", backendUrl);
      
      // Debug: Log the data being sent
      console.log("🚀 Sending quote data:", JSON.stringify(quoteData, null, 2));
      console.log("🌐 API URL:", backendUrl + "/api/quotes");
      console.log("🔑 Customer ID:", selectedCustomer._id);
      console.log("📅 Quote Date:", formData.quoteDate);
      console.log("📝 Items Count:", formData.items?.length);
      console.log("💰 Total Amount:", formData.total);
      
        // Check payload size to prevent "entity too large" errors
        const payloadSize = JSON.stringify(quoteData).length;
        console.log("📏 Payload size:", payloadSize, "bytes (~", Math.round(payloadSize / 1024), "KB)");
        
        if (payloadSize > 100000) { // 100KB limit
          console.warn("⚠️ Payload is large, may cause backend issues");
          showToast("Warning: Quote data is large, some fields may be truncated", "info");
        }
        
        // Log file information
        if (formData.signatureFile && formData.enableSignature) {
          console.log("📝 Signature file:", formData.signatureFile.name, "(", (formData.signatureFile.size / 1024).toFixed(1), "KB)");
        }
        
        if (formData.files && formData.files.length > 0) {
          console.log("📎 Attached files:", formData.files.length, "files");
          formData.files.forEach((file, index) => {
            console.log(`  ${index + 1}. ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
          });
        }
      
      if (!backendUrl) {
        showToast("Backend URL not configured. Please check environment variables.", "error");
        setIsSubmitting(false);
        return;
      }

      // Check if we're in development mode and try alternative ports
      let finalBackendUrl = backendUrl;
      if (process.env.NODE_ENV === 'development' && backendUrl === 'http://localhost:5000') {
        // Try common development ports
        const testPorts = [5000, 3001, 8000, 8080];
        let foundPort = null;
        
        for (const port of testPorts) {
          try {
            const testUrl = `http://localhost:${port}`;
            console.log(`Testing port ${port}...`);
            const testResponse = await fetch(`${testUrl}/api/quotes`, {
              method: "GET",
              credentials: "include",
              signal: AbortSignal.timeout(3000),
            });
            if (testResponse.status !== 404) {
              foundPort = port;
              console.log(`Found backend on port ${port}`);
              break;
            }
          } catch (error) {
            console.log(`Port ${port} not responding`);
          }
        }
        
        if (foundPort) {
          finalBackendUrl = `http://localhost:${foundPort}`;
          console.log(`Using backend URL: ${finalBackendUrl}`);
        } else {
          console.warn("No backend found on common ports. Using default URL.");
        }
      }

      // Also try a simple health check
      try {
        const healthResponse = await fetch(finalBackendUrl + "/", {
          method: "GET",
          signal: AbortSignal.timeout(3000),
        });
        console.log("Backend health check:", healthResponse.status);
      } catch (healthError) {
        console.warn("Backend health check failed:", healthError);
      }

      // Test backend connectivity
      try {
        console.log("🧪 Testing backend connectivity to:", finalBackendUrl + "/api/quotes");
        const testResponse = await fetch(finalBackendUrl + "/api/quotes", {
          method: "GET",
          credentials: "include",
          signal: AbortSignal.timeout(5000), // 5 second timeout for test
        });
        console.log("🧪 Backend connectivity test:", testResponse.status);
        
        if (testResponse.status === 401) {
          console.log("🔐 Authentication failed - redirecting to login");
          showToast("Your session has expired. Please log in again.", "error");
          setIsSubmitting(false);
          
          // Clear any stored authentication data
          localStorage.removeItem('user');
          sessionStorage.clear();
          
          // Redirect to login page
          setTimeout(() => {
            router.push("/signin");
          }, 1000);
          return;
        }
        
        // Also test with a simple POST to see if the endpoint accepts data
        console.log("🧪 Testing POST endpoint with minimal data...");
        try {
          const testPostResponse = await fetch(finalBackendUrl + "/api/quotes", {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              test: true,
              message: "Testing endpoint connectivity"
            }),
            signal: AbortSignal.timeout(5000),
          });
          console.log("🧪 Test POST response:", testPostResponse.status, testPostResponse.statusText);
        } catch (testPostError) {
          console.log("🧪 Test POST failed:", testPostError);
        }
      } catch (testError) {
        console.error("Backend connectivity test failed:", testError);
        if (testError.name === 'AbortError') {
          showToast("Backend server is not responding. Please check if the server is running.", "error");
        } else {
          showToast("Cannot connect to backend server. Please check if the server is running.", "error");
        }
        
        // Offer to save locally as fallback
        const saveLocally = window.confirm(
          "Backend server is not reachable. Would you like to save this quote locally for now? You can sync it later when the server is back online."
        );
        
        if (saveLocally) {
          try {
            const localQuotes = JSON.parse(localStorage.getItem('localQuotes') || '[]');
            const quoteWithId = {
              ...quoteData,
              id: Date.now(),
              savedAt: new Date().toISOString(),
              status: 'local-draft'
            };
            localQuotes.push(quoteWithId);
            localStorage.setItem('localQuotes', JSON.stringify(localQuotes));
            
            showToast("Quote saved locally! You can sync it when the server is back online.", "success");
            setIsSubmitting(false);
            setTimeout(() => router.push("/dashboard/sales/quotes"), 800);
            return;
          } catch (localError) {
            console.error("Error saving locally:", localError);
            showToast("Failed to save locally. Please try again.", "error");
            setIsSubmitting(false);
            return;
          }
        }
        
        setIsSubmitting(false);
        return;
      }

      let response;
      
      try {
        // Check if we have files to upload (signature or other files)
        const hasFiles = (formData.signatureFile && formData.enableSignature) || (formData.files && formData.files.length > 0);
        
        if (hasFiles) {
          console.log("📁 Files detected, using FormData for upload");
          
          // Create FormData for file uploads
          const formDataToSend = new FormData();
          
          // Add the quote data as JSON string
          formDataToSend.append('quoteData', JSON.stringify(quoteData));
          
          // Add signature file if enabled
          if (formData.signatureFile && formData.enableSignature) {
            formDataToSend.append('signature', formData.signatureFile);
            console.log("📝 Adding signature file:", formData.signatureFile.name);
          }
          
          // Add other files
          if (formData.files && formData.files.length > 0) {
            formData.files.forEach((file, index) => {
              formDataToSend.append('files', file);
              console.log(`📎 Adding file ${index + 1}:`, file.name);
            });
          }
          
          // Send with FormData
          response = await fetch(
            finalBackendUrl + "/api/quotes",
            {
              method: "POST",
              credentials: "include",
              body: formDataToSend,
              signal: AbortSignal.timeout(30000), // 30 second timeout
            }
          );
        } else {
          console.log("📄 No files, sending as JSON");
          
          // Send as regular JSON
          response = await fetch(
            finalBackendUrl + "/api/quotes",
            {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(quoteData),
              signal: AbortSignal.timeout(30000), // 30 second timeout
            }
          );
        }

        // Debug: Log the response
        console.log("📡 Response status:", response.status);
        console.log("📡 Response status text:", response.statusText);
        console.log("📡 Response headers:", response.headers);
        console.log("📡 Response URL:", response.url);

        let result;
        try {
          const responseText = await response.text();
          console.log("Raw response text:", responseText);
          
          if (responseText.trim()) {
            result = JSON.parse(responseText);
          } else {
            result = {};
          }
        } catch (parseError) {
          console.error("Error parsing response:", parseError);
          console.log("Response was not valid JSON");
          showToast("Error: Invalid response from server", "error");
          setIsSubmitting(false);
          return;
        }

        // Debug: Log the result
        console.log("Response result:", result);

        if (response.ok) {
          console.log("Quote saved successfully", result);
          showToast(
            `Quote ${
              asDraft ? "saved as draft" : "created and sent"
            } successfully!`,
            "success"
          );
          setIsSubmitting(false);
          setTimeout(() => router.push("/dashboard/sales/quotes"), 800);
        } else {
          const errorMessage = result.error || result.message || result.details || `HTTP ${response.status}: ${response.statusText}`;
          console.error("Error saving quote:", errorMessage);
          console.error("Full error response:", result);
          showToast(`Error: ${errorMessage}`, "error");
          setIsSubmitting(false);
        }
      } catch (fetchError) {
        console.error("Fetch error:", fetchError);
        showToast("Network error: Unable to connect to server", "error");
        setIsSubmitting(false);
        return;
      }
    } catch (error) {
      console.error("Error saving quote:", error);
      showToast("Error saving quote. Please try again.", "error");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Back Button */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/dashboard/sales/quotes")}
                className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
              >
                ← Back to Quotes
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">New Quote</h1>
                <p className="text-sm text-gray-600">Create a new quote for your customer</p>
                {/* Backend status indicator removed */}
                {/* Backend status removed */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        <div className="space-y-6">
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
                  data.shippingAddress?.state || prev.placeOfSupplyState,
              }));

              if (
                data.shippingAddress?.state &&
                data.shippingAddress.state !== formData.placeOfSupplyState
              ) {
                setTimeout(recalculateAllTotals, 100);
              }
            }}
          />

          {/* Quote Details */}
          <QuoteDetails 
            formData={formData} 
            onFormDataChange={(data) => 
              setFormData((prev) => ({ ...prev, ...data }))
            } 
          />

          {/* Items Table */}
          <ItemsTable
            items={formData.items || []}
            onAddItem={addItem}
            onRemoveItem={removeItem}
            onUpdateItem={updateItem}
            isIntraState={isIntraState()}
          />

          {/* Summary and Additional Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Notes */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Additional Details
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Notes
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Thanks for your business."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      value={formData.customerNotes}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          customerNotes: e.target.value,
                        }))
                      }
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Will be displayed on the quote
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Terms & Conditions
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Enter the terms and conditions of your business to be displayed in your quote"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
                      Attach File(s) to Quote
                    </label>
                    <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                      <PaperClipIcon className="h-4 w-4 mr-2" />
                      Upload File
                      <ChevronDownIcon className="h-4 w-4 ml-2" />
                    </button>
                    <p className="text-xs text-gray-500 mt-1">
                      You can upload a maximum of 10 files, 10MB each
                    </p>
                  </div>

                  {/* Signature Status Indicator */}
                  {formData.enableSignature && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${
                            formData.signatureFile ? 'bg-green-500' : 'bg-yellow-500'
                          }`}></div>
                          <span className="text-sm font-medium text-gray-700">
                            Signature Upload Status
                          </span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          formData.signatureFile 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {formData.signatureFile ? 'Uploaded' : 'Pending'}
                        </span>
                      </div>
                      {formData.signatureFile && (
                        <div className="mt-2 text-xs text-gray-600">
                          <span className="font-medium">File:</span> {formData.signatureFile.name}
                          <span className="ml-2 text-gray-500">
                            ({(formData.signatureFile.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enable Signature Upload
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="enableSignature"
                        checked={formData.enableSignature}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            enableSignature: e.target.checked,
                          }))
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="enableSignature" className="text-sm text-gray-700">
                        Enable signature upload for the customer
                      </label>
                    </div>
                  </div>

                  {formData.enableSignature && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Signature
                      </label>
                      <div className="space-y-3">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (validateFileSize(file)) {
                                setFormData((prev) => ({
                                  ...prev,
                                  signatureFile: file,
                                }));
                                
                                // Create preview for image files
                                if (file.type.startsWith('image/')) {
                                  const reader = new FileReader();
                                  reader.onload = (e) => {
                                    setFormData((prev) => ({
                                      ...prev,
                                      signaturePreview: e.target?.result as string,
                                    }));
                                  };
                                  reader.readAsDataURL(file);
                                } else {
                                  setFormData((prev) => ({
                                    ...prev,
                                    signaturePreview: "",
                                  }));
                                }
                              }
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                        <p className="text-xs text-gray-500">
                          Supported formats: JPG, PNG, GIF, PDF (Max size: 5MB)
                        </p>
                        
                        {/* Signature Preview */}
                        {formData.signaturePreview && (
                          <div className="mt-3">
                            <label className="block text-xs font-medium text-gray-700 mb-2">
                              Signature Preview:
                            </label>
                            <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                              <img 
                                src={formData.signaturePreview} 
                                alt="Signature Preview" 
                                className="max-w-full h-20 object-contain"
                              />
                            </div>
                          </div>
                        )}
                        
                        {/* Remove Signature Button */}
                        {formData.signatureFile && (
                          <button
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                signatureFile: null,
                                signaturePreview: "",
                              }));
                            }}
                            className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            Remove Signature
                          </button>
                        )}
                      </div>
                    </div>
                  )}
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

            {/* Summary Sidebar */}
            <div className="lg:col-span-1">
              <QuoteSummary
                formData={formData}
                onFormDataChange={(data) =>
                  setFormData((prev) => ({
                    ...prev,
                    ...data,
                  }))
                }
                isIntraState={isIntraState()}
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
      <div className="bg-white border-t border-gray-200 px-4 py-4 mt-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isSubmitting
                  ? 'text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => handleSaveQuote(true)}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save as Draft'}
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isSubmitting
                  ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                  : 'text-white bg-blue-600 hover:bg-blue-700'
              }`}
              onClick={() => handleSaveQuote(false)}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save and Send'}
            </button>
            <button
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => router.push("/dashboard/sales/quotes")}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">
                Total: ₹{(formData.total || 0).toFixed(2)}
              </span>
              <span className="ml-2 text-gray-500">
                Items: {formData.items?.length || 0}
              </span>
            </div>
            <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Make Recurring
            </button>
          </div>
        </div>
        
        {/* Backend status footer removed */}
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

export default NewQuoteForm;
