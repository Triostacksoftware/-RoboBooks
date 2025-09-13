/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  InformationCircleIcon,
  DocumentArrowUpIcon,
} from "@heroicons/react/24/outline";
import { vendorService } from "@/services/vendorService";
import { toast } from "react-hot-toast";

interface VendorFormData {
  name: string;
  gstin: string;
  companyName: string;
  displayName: string;
  email: string;
  workPhone: string;
  mobile: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  contactPersons: Array<{
    name: string;
    email: string;
    phone: string;
    designation: string;
  }>;
  pan: string;
  msmeRegistered: boolean;
  currency: string;
  openingBalance: string;
  paymentTerms: string;
  enablePortal: boolean;
  portalLanguage: string;
  documents: File[];
  reportingTags: string[];
  remarks: string;
}

export default function NewVendorForm() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "details" | "address" | "contacts" | "other" | "reporting" | "remarks"
  >("details");
  const [formData, setFormData] = useState<VendorFormData>({
    name: "",
    gstin: "",
    companyName: "",
    displayName: "",
    email: "",
    workPhone: "",
    mobile: "",
    address: {
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
    contactPersons: [
      {
        name: "",
        email: "",
        phone: "",
        designation: "",
      },
    ],
    pan: "",
    msmeRegistered: false,
    currency: "INR- Indian Rupee",
    openingBalance: "",
    paymentTerms: "Due on Receipt",
    enablePortal: false,
    portalLanguage: "English",
    documents: [],
    reportingTags: [],
    remarks: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddressChange = (
    type: "address" | "shippingAddress",
    field: string,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value,
      },
    }));
  };

  const handleContactPersonChange = (
    index: number,
    field: string,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      contactPersons: prev.contactPersons.map((person, i) =>
        i === index ? { ...person, [field]: value } : person
      ),
    }));
  };

  const addContactPerson = () => {
    setFormData((prev) => ({
      ...prev,
      contactPersons: [
        ...prev.contactPersons,
        {
          name: "",
          email: "",
          phone: "",
          designation: "",
        },
      ],
    }));
  };

  const removeContactPerson = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      contactPersons: prev.contactPersons.filter((_, i) => i !== index),
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData((prev) => ({
      ...prev,
      documents: [...prev.documents, ...files],
    }));
  };

  const removeDocument = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const vendorData = {
        name: formData.displayName || formData.name,
        gstin: formData.gstin,
        companyName: formData.companyName,
        email: formData.email,
        phone: formData.mobile || formData.workPhone,
        address: `${formData.address.street}, ${formData.address.city}, ${formData.address.state}, ${formData.address.country} ${formData.address.zipCode}`,
        contactInfo: `${formData.email} | ${
          formData.mobile || formData.workPhone
        }`,
        type: formData.type,
        pan: formData.pan,
        msmeRegistered: formData.msmeRegistered,
        currency: formData.currency,
        openingBalance: parseFloat(formData.openingBalance) || 0,
        paymentTerms: formData.paymentTerms,
        enablePortal: formData.enablePortal,
        portalLanguage: formData.portalLanguage,
        contactPersons: formData.contactPersons,
        billingAddress: formData.address,
        shippingAddress: formData.shippingAddress,
        reportingTags: formData.reportingTags,
        remarks: formData.remarks,
        // Add missing required field 'displayName' to vendorData
      };

      await vendorService.createVendor({
        ...vendorData,
        displayName: formData.displayName || formData.name,
      });

      // Use toast notification for success update instead of alert
      toast.success("Vendor created successfully!");
      router.push("/dashboard/vendors");
    } catch (err: any) {
      console.error("Error creating vendor:", err);
      setError(err.message || "Failed to create vendor. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "details", name: "Other Details" },
    { id: "address", name: "Address" },
    { id: "contacts", name: "Contact Persons" },
    { id: "other", name: "Custom Fields" },
    { id: "reporting", name: "Reporting Tags" },
    { id: "remarks", name: "Remarks" },
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Customers
        </button>
        <h1 className="text-2xl font-bold text-gray-900">New Customer</h1>
      </div>

      {/* Prefill Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
        <div className="flex items-start">
          <InformationCircleIcon className="h-5 w-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            Prefill Customer details from the GST portal using the
            Customer&rsquo;s GSTIN.{" "}
            <button className="text-blue-600 hover:text-blue-800 font-medium">
              Prefill
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Primary Contact Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <InformationCircleIcon className="h-5 w-5 text-gray-400 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">
              Primary Contact
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Salutation
              </label>
              <select
                value={formData.salutation}
                onChange={(e) =>
                  handleInputChange("salutation", e.target.value)
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Mr.">Mr.</option>
                <option value="Mrs.">Mrs.</option>
                <option value="Ms.">Ms.</option>
                <option value="Dr.">Dr.</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Company Details */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) =>
                  handleInputChange("companyName", e.target.value)
                }
                placeholder="Company Name"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Name *
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) =>
                    handleInputChange("displayName", e.target.value)
                  }
                  placeholder="Select or type to add"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <InformationCircleIcon className="h-5 w-5 text-gray-400 ml-2" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="flex items-center">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Email Address"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <InformationCircleIcon className="h-5 w-5 text-gray-400 ml-2" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GSTIN
              </label>
              <input
                type="text"
                value={formData.gstin}
                onChange={(e) => handleInputChange("gstin", e.target.value)}
                placeholder="GSTIN"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center mb-4">
            <InformationCircleIcon className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-700">Phone</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center mb-2">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm text-gray-700">Work Phone</span>
              </label>
              <input
                type="tel"
                value={formData.workPhone}
                onChange={(e) => handleInputChange("workPhone", e.target.value)}
                placeholder="Work Phone"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="flex items-center mb-2">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm text-gray-700">Mobile</span>
              </label>
              <input
                type="tel"
                value={formData.mobile}
                onChange={(e) => handleInputChange("mobile", e.target.value)}
                placeholder="Mobile"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "details" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      PAN
                    </label>
                    <input
                      type="text"
                      value={formData.pan}
                      onChange={(e) => handleInputChange("pan", e.target.value)}
                      placeholder="PAN"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.msmeRegistered}
                        onChange={(e) =>
                          handleInputChange("msmeRegistered", e.target.checked)
                        }
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">
                        This vendor is MSME registered
                      </span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Currency
                    </label>
                    <select
                      value={formData.currency}
                      onChange={(e) =>
                        handleInputChange("currency", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="INR- Indian Rupee">
                        INR- Indian Rupee
                      </option>
                      <option value="USD- US Dollar">USD- US Dollar</option>
                      <option value="EUR- Euro">EUR- Euro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Opening Balance
                    </label>
                    <input
                      type="number"
                      value={formData.openingBalance}
                      onChange={(e) =>
                        handleInputChange("openingBalance", e.target.value)
                      }
                      placeholder="0"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Terms
                    </label>
                    <select
                      value={formData.paymentTerms}
                      onChange={(e) =>
                        handleInputChange("paymentTerms", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Due on Receipt">Due on Receipt</option>
                      <option value="Net 15">Net 15</option>
                      <option value="Net 30">Net 30</option>
                      <option value="Net 45">Net 45</option>
                      <option value="Net 60">Net 60</option>
                    </select>
                  </div>
                  <div>{/* Empty div to maintain grid layout */}</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.enablePortal}
                        onChange={(e) =>
                          handleInputChange("enablePortal", e.target.checked)
                        }
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">
                        Allow portal access for this vendor
                      </span>
                    </label>
                    <div className="flex items-center mt-1">
                      <span className="text-sm text-gray-500">
                        Enable Portal?
                      </span>
                      <InformationCircleIcon className="h-4 w-4 text-gray-400 ml-1" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Portal Language
                    </label>
                    <select
                      value={formData.portalLanguage}
                      onChange={(e) =>
                        handleInputChange("portalLanguage", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Spanish">Spanish</option>
                    </select>
                  </div>
                </div>

                {/* Documents Section */}
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Documents
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <button
                        type="button"
                        onClick={() =>
                          document.getElementById("file-upload")?.click()
                        }
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <DocumentArrowUpIcon className="h-4 w-4 mr-2" />
                        Upload File ▼
                      </button>
                      <input
                        id="file-upload"
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      You can upload a maximum of 10 files, 10MB each
                    </p>

                    {/* Display uploaded files */}
                    {formData.documents.length > 0 && (
                      <div className="space-y-2">
                        {formData.documents.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded"
                          >
                            <span className="text-sm text-gray-700">
                              {file.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeDocument(index)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Add more details link */}
                <div className="pt-2">
                  <button
                    type="button"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Add more details
                  </button>
                </div>
              </div>
            )}

            {activeTab === "address" && (
              <div className="space-y-6">
                {/* Billing Address */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Billing Address
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Street
                      </label>
                      <input
                        type="text"
                        value={formData.address.street}
                        onChange={(e) =>
                          handleAddressChange(
                            "address",
                            "street",
                            e.target.value
                          )
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={formData.address.city}
                        onChange={(e) =>
                          handleAddressChange("address", "city", e.target.value)
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        value={formData.address.state}
                        onChange={(e) =>
                          handleAddressChange(
                            "address",
                            "state",
                            e.target.value
                          )
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        value={formData.address.country}
                        onChange={(e) =>
                          handleAddressChange(
                            "address",
                            "country",
                            e.target.value
                          )
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      value={formData.address.zipCode}
                      onChange={(e) =>
                        handleAddressChange(
                          "address",
                          "zipCode",
                          e.target.value
                        )
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Shipping Address
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Street
                      </label>
                      <input
                        type="text"
                        value={formData.shippingAddress.street}
                        onChange={(e) =>
                          handleAddressChange(
                            "shippingAddress",
                            "street",
                            e.target.value
                          )
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={formData.shippingAddress.city}
                        onChange={(e) =>
                          handleAddressChange(
                            "shippingAddress",
                            "city",
                            e.target.value
                          )
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        value={formData.shippingAddress.state}
                        onChange={(e) =>
                          handleAddressChange(
                            "shippingAddress",
                            "state",
                            e.target.value
                          )
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        value={formData.shippingAddress.country}
                        onChange={(e) =>
                          handleAddressChange(
                            "shippingAddress",
                            "country",
                            e.target.value
                          )
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      value={formData.shippingAddress.zipCode}
                      onChange={(e) =>
                        handleAddressChange(
                          "shippingAddress",
                          "zipCode",
                          e.target.value
                        )
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "contacts" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Contact Persons
                  </h3>
                  <button
                    type="button"
                    onClick={addContactPerson}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                  >
                    Add Contact Person
                  </button>
                </div>

                {formData.contactPersons.map((person, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 mb-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-md font-medium text-gray-900">
                        Contact Person {index + 1}
                      </h4>
                      {formData.contactPersons.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeContactPerson(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          value={person.name}
                          onChange={(e) =>
                            handleContactPersonChange(
                              index,
                              "name",
                              e.target.value
                            )
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={person.email}
                          onChange={(e) =>
                            handleContactPersonChange(
                              index,
                              "email",
                              e.target.value
                            )
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={person.phone}
                          onChange={(e) =>
                            handleContactPersonChange(
                              index,
                              "phone",
                              e.target.value
                            )
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Designation
                        </label>
                        <input
                          type="text"
                          value={person.designation}
                          onChange={(e) =>
                            handleContactPersonChange(
                              index,
                              "designation",
                              e.target.value
                            )
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "other" && (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  Custom fields functionality coming soon.
                </p>
              </div>
            )}

            {activeTab === "reporting" && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Reporting Tags
                </h3>
                <p className="text-sm text-gray-600">
                  Add tags to categorize and filter vendors in reports.
                </p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
                  <input
                    type="text"
                    placeholder="Enter tags separated by commas"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {activeTab === "remarks" && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Remarks</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Notes
                  </label>
                  <textarea
                    value={formData.remarks}
                    onChange={(e) =>
                      handleInputChange("remarks", e.target.value)
                    }
                    rows={4}
                    placeholder="Add any additional notes about this vendor..."
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Customer Owner Section */}
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">
            Customer Owner: Assign a user as the customer owner to provide
            access only to the data of this customer.{" "}
            <button className="text-blue-600 hover:text-blue-800">
              Learn More
            </button>
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
