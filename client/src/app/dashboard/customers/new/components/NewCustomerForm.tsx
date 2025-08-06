/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

interface CustomerFormData {
  customerType: "Business" | "Individual";
  salutation: string;
  firstName: string;
  lastName: string;
  companyName: string;
  displayName: string;
  email: string;
  workPhone: string;
  mobile: string;
  pan: string;
  currency: string;
  openingBalance: string;
  paymentTerms: string;
  portalEnabled: boolean;
  portalLanguage: string;
  billingAddress: {
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
}

const initialFormData: CustomerFormData = {
  customerType: "Business",
  salutation: "Mr.",
  firstName: "",
  lastName: "",
  companyName: "",
  displayName: "",
  email: "",
  workPhone: "",
  mobile: "",
  pan: "",
  currency: "INR",
  openingBalance: "0",
  paymentTerms: "Due on Receipt",
  portalEnabled: false,
  portalLanguage: "English",
  billingAddress: {
    street: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
  },
  shippingAddress: {
    street: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
  },
  contactPersons: [],
};

export default function NewCustomerForm() {
  const [formData, setFormData] = useState<CustomerFormData>(initialFormData);
  const [activeTab, setActiveTab] = useState("otherDetails");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddressChange = (
    type: "billing" | "shipping",
    field: string,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [`${type}Address`]: {
        ...(prev[`${type}Address` as keyof CustomerFormData] as any),
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

  const showToast = (message: string, type: "success" | "error") => {
    // Create toast element
    const toast = document.createElement("div");
    toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all duration-300 transform translate-x-full ${
      type === "success" ? "bg-green-500" : "bg-red-500"
    }`;
    toast.textContent = message;

    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
      toast.classList.remove("translate-x-full");
    }, 100);

    // Remove after 3 seconds
    setTimeout(() => {
      toast.classList.add("translate-x-full");
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL + "/api/customers",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();

      if (response.ok) {
        showToast("Customer created successfully!", "success");
        // Redirect to customers page after a short delay
        setTimeout(() => {
          router.push("/dashboard/customers");
        }, 1000);
      } else {
        setError(result.message || "Failed to create customer");
        showToast(result.message || "Failed to create customer", "error");
      }
    } catch (error) {
      console.error("Error creating customer:", error);
      setError("Failed to create customer. Please try again.");
      showToast("Failed to create customer. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key: "otherDetails", label: "Other Details" },
    { key: "address", label: "Address" },
    { key: "contactPersons", label: "Contact Persons" },
    { key: "customFields", label: "Custom Fields" },
    { key: "reportingTags", label: "Reporting Tags" },
    { key: "remarks", label: "Remarks" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 p-2 hover:bg-gray-100 rounded-md"
              >
                <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">New Customer</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Prefill Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <InformationCircleIcon className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-blue-800 text-sm">
                Prefill Customer details from the GST portal using the
                Customer&rsquo;s GSTIN.{" "}
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Prefill
                </button>
              </span>
            </div>
          </div>

          {/* Customer Type */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="space-y-4">
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  Customer Type
                  <InformationCircleIcon className="w-4 h-4 text-gray-400 ml-1" />
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="customerType"
                      value="Business"
                      checked={formData.customerType === "Business"}
                      onChange={(e) =>
                        handleInputChange("customerType", e.target.value)
                      }
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Business</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="customerType"
                      value="Individual"
                      checked={formData.customerType === "Individual"}
                      onChange={(e) =>
                        handleInputChange("customerType", e.target.value)
                      }
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Individual</span>
                  </label>
                </div>
              </div>

              {/* Primary Contact */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  Primary Contact
                  <InformationCircleIcon className="w-4 h-4 text-gray-400 ml-1" />
                </label>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <select
                      value={formData.salutation}
                      onChange={(e) =>
                        handleInputChange("salutation", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                      <option value="Mr.">Mr.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Ms.">Ms.</option>
                      <option value="Dr.">Dr.</option>
                      <option value="Prof.">Prof.</option>
                    </select>
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Company Details */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Company Name
                </label>
                <input
                  type="text"
                  placeholder="Company Name"
                  value={formData.companyName}
                  onChange={(e) =>
                    handleInputChange("companyName", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  Display Name*
                  <InformationCircleIcon className="w-4 h-4 text-gray-400 ml-1" />
                </label>
                <input
                  type="text"
                  placeholder="Select or type to add"
                  value={formData.displayName}
                  onChange={(e) =>
                    handleInputChange("displayName", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  required
                />
              </div>

              {/* Contact Information */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  Email Address
                  <InformationCircleIcon className="w-4 h-4 text-gray-400 ml-1" />
                </label>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  required
                />
              </div>

              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  Phone
                  <InformationCircleIcon className="w-4 h-4 text-gray-400 ml-1" />
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center text-sm text-gray-600 mb-1">
                      <input type="checkbox" className="mr-2" />
                      Work Phone
                    </label>
                    <input
                      type="tel"
                      placeholder="Work Phone"
                      value={formData.workPhone}
                      onChange={(e) =>
                        handleInputChange("workPhone", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="flex items-center text-sm text-gray-600 mb-1">
                      <input type="checkbox" className="mr-2" />
                      Mobile
                    </label>
                    <input
                      type="tel"
                      placeholder="Mobile"
                      value={formData.mobile}
                      onChange={(e) =>
                        handleInputChange("mobile", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.key
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === "otherDetails" && (
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      PAN
                    </label>
                    <input
                      type="text"
                      placeholder="PAN"
                      value={formData.pan}
                      onChange={(e) => handleInputChange("pan", e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Currency
                    </label>
                    <select
                      value={formData.currency}
                      onChange={(e) =>
                        handleInputChange("currency", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                      <option value="INR">INR- Indian Rupee</option>
                      <option value="USD">USD- US Dollar</option>
                      <option value="EUR">EUR- Euro</option>
                      <option value="GBP">GBP- British Pound</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Opening Balance
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={formData.openingBalance}
                      onChange={(e) =>
                        handleInputChange("openingBalance", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Payment Terms
                    </label>
                    <select
                      value={formData.paymentTerms}
                      onChange={(e) =>
                        handleInputChange("paymentTerms", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                      <option value="Due on Receipt">Due on Receipt</option>
                      <option value="Net 15">Net 15</option>
                      <option value="Net 30">Net 30</option>
                      <option value="Net 45">Net 45</option>
                      <option value="Net 60">Net 60</option>
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      Enable Portal?
                      <InformationCircleIcon className="w-4 h-4 text-gray-400 ml-1" />
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.portalEnabled}
                        onChange={(e) =>
                          handleInputChange("portalEnabled", e.target.checked)
                        }
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">
                        Allow portal access for this customer
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Portal Language
                    </label>
                    <select
                      value={formData.portalLanguage}
                      onChange={(e) =>
                        handleInputChange("portalLanguage", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Documents
                    </label>
                    <button
                      type="button"
                      className="border border-gray-300 rounded-md px-4 py-2 text-sm hover:bg-gray-50"
                    >
                      Upload File ▼
                    </button>
                    <p className="text-xs text-gray-500 mt-1">
                      You can upload a maximum of 10 files, 10MB each
                    </p>
                  </div>

                  <div>
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
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Billing Address
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Street
                        </label>
                        <input
                          type="text"
                          value={formData.billingAddress.street}
                          onChange={(e) =>
                            handleAddressChange(
                              "billing",
                              "street",
                              e.target.value
                            )
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          City
                        </label>
                        <input
                          type="text"
                          value={formData.billingAddress.city}
                          onChange={(e) =>
                            handleAddressChange(
                              "billing",
                              "city",
                              e.target.value
                            )
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          State
                        </label>
                        <input
                          type="text"
                          value={formData.billingAddress.state}
                          onChange={(e) =>
                            handleAddressChange(
                              "billing",
                              "state",
                              e.target.value
                            )
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Country
                        </label>
                        <input
                          type="text"
                          value={formData.billingAddress.country}
                          onChange={(e) =>
                            handleAddressChange(
                              "billing",
                              "country",
                              e.target.value
                            )
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          ZIP Code
                        </label>
                        <input
                          type="text"
                          value={formData.billingAddress.zipCode}
                          onChange={(e) =>
                            handleAddressChange(
                              "billing",
                              "zipCode",
                              e.target.value
                            )
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Shipping Address
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Street
                        </label>
                        <input
                          type="text"
                          value={formData.shippingAddress.street}
                          onChange={(e) =>
                            handleAddressChange(
                              "shipping",
                              "street",
                              e.target.value
                            )
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          City
                        </label>
                        <input
                          type="text"
                          value={formData.shippingAddress.city}
                          onChange={(e) =>
                            handleAddressChange(
                              "shipping",
                              "city",
                              e.target.value
                            )
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          State
                        </label>
                        <input
                          type="text"
                          value={formData.shippingAddress.state}
                          onChange={(e) =>
                            handleAddressChange(
                              "shipping",
                              "state",
                              e.target.value
                            )
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Country
                        </label>
                        <input
                          type="text"
                          value={formData.shippingAddress.country}
                          onChange={(e) =>
                            handleAddressChange(
                              "shipping",
                              "country",
                              e.target.value
                            )
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          ZIP Code
                        </label>
                        <input
                          type="text"
                          value={formData.shippingAddress.zipCode}
                          onChange={(e) =>
                            handleAddressChange(
                              "shipping",
                              "zipCode",
                              e.target.value
                            )
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "contactPersons" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">
                      Contact Persons
                    </h3>
                    <button
                      type="button"
                      onClick={addContactPerson}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
                    >
                      Add Contact Person
                    </button>
                  </div>

                  {formData.contactPersons.map((person, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 space-y-4"
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="text-md font-medium text-gray-900">
                          Contact Person {index + 1}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeContactPerson(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">
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
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">
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
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">
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
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">
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
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {formData.contactPersons.length === 0 && (
                    <p className="text-gray-500 text-center py-8">
                      No contact persons added yet.
                    </p>
                  )}
                </div>
              )}

              {activeTab === "customFields" && (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    Custom fields functionality coming soon.
                  </p>
                </div>
              )}

              {activeTab === "reportingTags" && (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    Reporting tags functionality coming soon.
                  </p>
                </div>
              )}

              {activeTab === "remarks" && (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    Remarks functionality coming soon.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Customer Owner Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">
              Customer Owner: Assign a user as the customer owner to provide
              access only to the data of this customer.{" "}
              <button
                type="button"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Learn More
              </button>
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md text-sm font-medium"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
