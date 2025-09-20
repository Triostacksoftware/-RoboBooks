"use client";

import React, { useState, useEffect, useRef } from "react";
import ModuleAccessGuard from "@/components/ModuleAccessGuard";
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
  
  // File upload states
  const [showUploadFilesDropdown, setShowUploadFilesDropdown] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    signature: null as { fileName: string; filePath: string; fileSize: number } | null,
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

  // Handle click outside dropdown for file upload
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

  // File upload handlers
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFiles = (files: File[]) => {
    // Clear previous errors
    setUploadErrors([]);

    // Check if files array is empty
    if (!files || files.length === 0) {
      return;
    }

    // Check total file count
    const currentFileCount = formData.files.length;
    const newFileCount = files.length;
    const totalFiles = currentFileCount + newFileCount;

    if (totalFiles > 10) {
      setUploadErrors([`You can upload a maximum of 10 files. Currently have ${currentFileCount} files, trying to add ${newFileCount} more.`]);
      return;
    }

    // Validate each file
    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach((file) => {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        errors.push(`${file.name}: File size exceeds 10MB limit`);
        return;
      }

      // Check file type
      const allowedTypes = [
        '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', 
        '.jpg', '.jpeg', '.png', '.gif'
      ];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!allowedTypes.includes(fileExtension)) {
        errors.push(`${file.name}: File type not supported`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      setUploadErrors(errors);
    }

    if (validFiles.length > 0) {
      setFormData((prev) => ({
        ...prev,
        files: [...prev.files, ...validFiles]
      }));
    }

    // Close dropdown after successful upload
    if (validFiles.length > 0) {
      setShowUploadFilesDropdown(false);
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

  const handleMakeRecurring = () => {
    console.log("Make Recurring button clicked");
    showToast("Make Recurring feature coming soon!", "info");
  };

  const handleSaveInvoice = async (asDraft = false) => {
    console.log("Save Invoice button clicked", { asDraft, selectedCustomer });
    
    // Show initial processing toast
    showToast(
      asDraft ? "Saving invoice as draft..." : "Creating and sending invoice...", 
      "info"
    );
    
    try {
      if (!selectedCustomer) {
        console.log("No customer selected");
        showToast("Please select a customer", "error");
        return;
      }
      
      console.log("Customer selected:", selectedCustomer);

      // Upload files first if any
      let uploadedFiles = [];
      if (formData.files.length > 0) {
        showToast(`📁 Uploading ${formData.files.length} file(s)...`, "info");
        
        for (const file of formData.files) {
          try {
            const uploadFormData = new FormData();
            uploadFormData.append('document', file);
            uploadFormData.append('title', `Invoice Attachment - ${file.name}`);
            uploadFormData.append('description', `File attached to invoice`);
            uploadFormData.append('documentType', 'invoice');
            uploadFormData.append('category', 'financial');

            console.log(`Uploading file: ${file.name}`);
            const uploadResponse = await fetch(
              `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/documents/upload`,
              {
                method: "POST",
                credentials: "include",
                body: uploadFormData,
              }
            );

            if (uploadResponse.ok) {
              const uploadResult = await uploadResponse.json();
              uploadedFiles.push({
                fileName: file.name,
                filePath: uploadResult.data.filePath,
                fileSize: file.size,
                uploadedAt: new Date(),
              });
            } else {
              console.error(`Failed to upload file: ${file.name}, status: ${uploadResponse.status}`);
              showToast(`❌ Failed to upload: ${file.name}`, "error");
            }
          } catch (error) {
            console.error(`Error uploading file ${file.name}:`, error);
            showToast(`❌ Upload error: ${file.name}`, "error");
          }
        }
        
        // Show success message after all files uploaded
        if (uploadedFiles.length > 0) {
          showToast(`✅ Successfully uploaded ${uploadedFiles.length} file(s)`, "success");
        }
      }

      // Add signature file to uploaded files if it exists
      if (formData.signature) {
        uploadedFiles.push({
          fileName: formData.signature.fileName,
          filePath: formData.signature.filePath,
          fileSize: formData.signature.fileSize,
          uploadedAt: new Date(),
          isSignature: true,
        });
        showToast("✅ Signature file included", "success");
      }

      // Remove undefined fields and ensure proper data types
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { project: _unusedProject, files: _unusedFiles, ...formDataWithoutProject } = formData;

      // Helper function to clean ObjectId fields
      const cleanObjectIdField = (value: string | null | undefined): string | null => {
        if (!value || value.trim() === "") return null;
        return value;
      };

      const invoiceData = {
        ...formDataWithoutProject,
        customerId: selectedCustomer._id,
        customerName:
          selectedCustomer.firstName + " " + selectedCustomer.lastName,
        customerEmail: selectedCustomer.email,
        customerPhone:
          selectedCustomer.workPhone || selectedCustomer.mobile || "",
        status: asDraft ? "Draft" : "Sent",
        invoiceDate: new Date(formData.invoiceDate),
        dueDate: new Date(formData.dueDate),
        files: uploadedFiles, // Use uploaded file metadata
        // Clean up ObjectId fields - convert empty strings to null
        additionalTaxId: cleanObjectIdField(formData.additionalTaxId),
        // Clean up items - remove empty itemId fields
        items: formData.items.map((item) => ({
          ...item,
          itemId: item.itemId || undefined,
        })),
      };

      console.log('Saving invoice with data:', invoiceData);
      console.log('Signature data:', formData.signature);
      console.log('Uploaded files:', uploadedFiles);

      // Get a fresh invoice number to avoid duplicates
      console.log("Getting fresh invoice number...");
      let freshInvoiceNumber = invoiceData.invoiceNumber;
      
      try {
        const invoiceNumberResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/invoices/next-number`,
          {
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        
        if (invoiceNumberResponse.ok) {
          const invoiceNumberResult = await invoiceNumberResponse.json();
          if (invoiceNumberResult.success && invoiceNumberResult.data.invoiceNumber) {
            freshInvoiceNumber = invoiceNumberResult.data.invoiceNumber;
            console.log("Using fresh invoice number:", freshInvoiceNumber);
          }
        } else {
          console.log("Failed to get fresh invoice number, using timestamp-based number");
          // Fallback: use timestamp-based number
          const timestamp = Date.now();
          freshInvoiceNumber = `INV-${timestamp}`;
        }
      } catch (error) {
        console.log("Error getting fresh invoice number, using timestamp-based number:", error);
        // Fallback: use timestamp-based number
        const timestamp = Date.now();
        freshInvoiceNumber = `INV-${timestamp}`;
      }

      // Update invoice data with fresh number
      invoiceData.invoiceNumber = freshInvoiceNumber;
      console.log("Final invoice number:", freshInvoiceNumber);

      // Show processing message
      showToast("🔄 Processing invoice data...", "info");

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const invoiceUrl = `${backendUrl}/api/invoices`;
      console.log('Backend URL:', backendUrl);
      console.log('Invoice URL:', invoiceUrl);

      const response = await fetch(invoiceUrl, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invoiceData),
      });

      console.log('Invoice response status:', response.status);
      console.log('Invoice response headers:', response.headers);
      
      const result = await response.json();
      console.log('Invoice response result:', result);

      if (response.ok) {
        console.log("Invoice saved successfully", result);
        showToast(
          `✅ Invoice ${
            asDraft ? "saved as draft" : "created and sent"
          } successfully! Invoice #${result.invoiceNumber || 'N/A'}`,
          "success"
        );
        setTimeout(() => router.push("/dashboard/sales/invoices"), 1500);
      } else {
        console.error("Error saving invoice:", result.error);
        showToast(
          `❌ Failed to ${asDraft ? "save draft" : "create invoice"}: ${result.error || 'Unknown error'}`,
          "error"
        );
      }
    } catch (error) {
      console.error("Error saving invoice:", error);
      showToast(
        `❌ Error ${asDraft ? "saving draft" : "creating invoice"}: ${error instanceof Error ? error.message : 'Please try again'}`,
        "error"
      );
    }
  };

  return (
    <div className="flex-1 bg-gray-50 flex flex-col">
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
                type="button"
                onClick={() => {
                  router.push("/dashboard/sales/invoices");
                }}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                title="Go back to Invoices"
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

      {/* Main Form Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 pb-4">
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
              orderNumber: formData.orderNumber,
              invoiceDate: formData.invoiceDate,
              terms: formData.terms,
              dueDate: formData.dueDate,
              salesperson: formData.salesperson,
            }}
            onFormDataChange={(data) => {
              setFormData((prev) => ({
                ...prev,
                invoiceNumber: data.invoiceNumber || prev.invoiceNumber,
                orderNumber: data.orderNumber || prev.orderNumber,
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
                      placeholder="Enter invoice subject"
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
                      Will be displayed on the invoice
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
                      Attach File(s) to Invoice
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
                        type="button"
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
                                type="button"
                                onClick={() => removeFile(index)}
                                className="p-1 text-red-500 hover:text-red-700"
                              >
                                <XMarkIcon className="h-3 w-3" />
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Upload Signature
                    </label>
                    {formData.signature ? (
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg border">
                          <img
                            src={formData.signature.filePath}
                            alt="Signature"
                            className="h-8 w-16 object-contain"
                          />
                          <span className="text-sm text-gray-600">
                            {formData.signature.fileName}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, signature: null }))}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            console.log('File input change event triggered');
                            console.log('Event target:', e.target);
                            console.log('Files:', e.target.files);
                            console.log('Files length:', e.target.files?.length);
                            
                            const file = e.target.files?.[0];
                            console.log('File input change event:', e.target.files);
                            console.log('Selected file:', file);
                            
                            if (file) {
                              console.log('Starting signature upload for file:', file.name, file.size, file.type);
                              
                              // Validate file type
                              if (!file.type.startsWith('image/')) {
                                showToast('Please select an image file (PNG, JPG, GIF, WebP)', 'error');
                                return;
                              }
                              
                              // Validate file size (2MB limit)
                              if (file.size > 2 * 1024 * 1024) {
                                showToast('File size too large. Maximum size is 2MB.', 'error');
                                return;
                              }
                              
                              try {
                                // Create FormData for file upload
                                const formData = new FormData();
                                formData.append('signature', file);
                                
                                const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
                                const uploadUrl = `${backendUrl}/api/documents/upload-signature`;
                                console.log('Backend URL:', backendUrl);
                                console.log('Uploading to URL:', uploadUrl);
                                
                                const response = await fetch(uploadUrl, {
                                  method: 'POST',
                                  credentials: 'include',
                                  body: formData,
                                });
                                
                                console.log('Upload response status:', response.status);
                                console.log('Upload response headers:', response.headers);
                                
                                if (response.ok) {
                                  const result = await response.json();
                                  console.log('Signature upload result:', result);
                                  
                                  // Create a URL for the uploaded file
                                  const fileUrl = result.data?.url?.startsWith('http') 
                                    ? result.data.url 
                                    : `${backendUrl}${result.data?.url}`;
                                  console.log('Constructed file URL:', fileUrl);
                                  
                                  setFormData(prev => ({
                                    ...prev,
                                    signature: {
                                      fileName: file.name,
                                      filePath: fileUrl,
                                      fileSize: file.size,
                                      signatureId: result.data?.id
                                    }
                                  }));
                                  
                                  showToast('Signature uploaded successfully!', 'success');
                                  
                                  // Reset the file input to allow selecting the same file again
                                  e.target.value = '';
                                } else {
                                  const error = await response.json();
                                  console.error('Signature upload error response:', error);
                                  showToast(`Error uploading signature: ${error.message}`, 'error');
                                  
                                  // Reset the file input on error too
                                  e.target.value = '';
                                }
                              } catch (error) {
                                console.error('Error uploading signature:', error);
                                showToast('Error uploading signature. Please try again.', 'error');
                                
                                // Reset the file input on error
                                e.target.value = '';
                              }
                            } else {
                              console.log('No file selected');
                            }
                          }}
                          className="hidden"
                          id="signature-upload"
                        />
                        <label
                          htmlFor="signature-upload"
                          className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                          <PaperClipIcon className="h-3 w-3 mr-1.5" />
                          Upload Signature
                        </label>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Upload a digital signature for the invoice. Recommended: PNG or JPG format.
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


      {/* Bottom Action Bar - Fixed at bottom of page */}
      <div className="bg-white border-t border-gray-200 px-3 py-1.5 shadow-lg">
        <div className="max-w-full flex items-center justify-between transition-all duration-300 ease-in-out">
          {/* Left Section - Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:border-gray-300 transition-all duration-200 whitespace-nowrap shadow-sm hover:shadow-md"
              onClick={() => handleSaveInvoice(true)}
            >
              Save as Draft
            </button>
            <button
              type="button"
              className="px-4 py-1 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 whitespace-nowrap shadow-lg hover:shadow-xl transform hover:scale-105"
              onClick={() => handleSaveInvoice(false)}
            >
              Save and Send
            </button>
            <button
              type="button"
              className="px-3 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 whitespace-nowrap shadow-sm hover:shadow-md"
              onClick={() => router.push("/dashboard/sales/invoices")}
            >
              Cancel
            </button>
          </div>

          {/* Right Section - Summary and Additional Actions */}
          <div className="flex items-center space-x-2">
            {/* Invoice Summary Card */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg px-3 py-1 shadow-sm">
              <div className="text-xs font-semibold text-gray-800">
                Invoice Summary
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <div className="text-gray-600">
                  <span className="font-bold text-gray-900 text-sm">
                    ₹{(formData.total || 0).toFixed(2)}
                  </span>
                </div>
                <div className="w-px h-3 bg-gray-300"></div>
                <div className="text-gray-500">
                  <span className="font-medium">{formData.items.length}</span> items
                </div>
              </div>
            </div>

            {/* Make Recurring Button */}
            <button 
              type="button"
              onClick={handleMakeRecurring}
              className="flex items-center px-3 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 whitespace-nowrap shadow-sm hover:shadow-md group"
            >
              <ArrowPathIcon className="h-3 w-3 mr-1 text-gray-500 group-hover:text-gray-700 transition-colors" />
              <span className="hidden sm:inline">Make Recurring</span>
              <span className="sm:hidden">Recurring</span>
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
                  Invoice Details
                </h3>
                <div className="w-8"></div> {/* Spacer for centering */}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invoice Number
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
                    Order Number
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    Invoice Date
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

// Wrapped with access guard
const NewInvoiceFormWithGuard = () => (
  <ModuleAccessGuard moduleName="Sales">
    <NewInvoiceForm />
  </ModuleAccessGuard>
);

export default NewInvoiceFormWithGuard;
