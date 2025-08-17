"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { vendorService, Vendor } from "@/services/vendorService";

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
  type: "business" | "individual";
  salutation: string;
  firstName: string;
  lastName: string;
  pan: string;
  msmeRegistered: boolean;
  currency: string;
  openingBalance: string;
  paymentTerms: string;
  tds: string;
  enablePortal: boolean;
  portalLanguage: string;
}

interface EditVendorFormProps {
  vendorId: string;
}

export default function EditVendorForm({ vendorId }: EditVendorFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "details" | "address" | "contacts" | "other"
  >("details");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    type: "business",
    salutation: "Mr.",
    firstName: "",
    lastName: "",
    pan: "",
    msmeRegistered: false,
    currency: "INR- Indian Rupee",
    openingBalance: "",
    paymentTerms: "Due on Receipt",
    tds: "",
    enablePortal: false,
    portalLanguage: "English",
  });

  // Load vendor data on component mount
  useEffect(() => {
    const loadVendor = async () => {
      try {
        setLoading(true);
        setError(null);
        const vendor = await vendorService.getVendorById(vendorId);

        setFormData({
          name: vendor.name || "",
          gstin: vendor.gstin || "",
          companyName: vendor.companyName || "",
          displayName: vendor.displayName || "",
          email: vendor.email || "",
          workPhone: vendor.workPhone || "",
          mobile: vendor.mobile || "",
          address: {
            street: vendor.billingAddress?.street || "",
            city: vendor.billingAddress?.city || "",
            state: vendor.billingAddress?.state || "",
            country: vendor.billingAddress?.country || "India",
            zipCode: vendor.billingAddress?.zipCode || "",
          },
          shippingAddress: {
            street: vendor.shippingAddress?.street || "",
            city: vendor.shippingAddress?.city || "",
            state: vendor.shippingAddress?.state || "",
            country: vendor.shippingAddress?.country || "India",
            zipCode: vendor.shippingAddress?.zipCode || "",
          },
          contactPersons:
            vendor.contactPersons?.length > 0
              ? vendor.contactPersons
              : [{ name: "", email: "", phone: "", designation: "" }],
          type: vendor.type || "business",
          salutation: vendor.salutation || "Mr.",
          firstName: vendor.firstName || "",
          lastName: vendor.lastName || "",
          pan: vendor.pan || "",
          msmeRegistered: vendor.msmeRegistered || false,
          currency: vendor.currency || "INR- Indian Rupee",
          openingBalance: vendor.openingBalance?.toString() || "",
          paymentTerms: vendor.paymentTerms || "Due on Receipt",
          tds: vendor.tds || "",
          enablePortal: vendor.enablePortal || false,
          portalLanguage: vendor.portalLanguage || "English",
        });
      } catch (error) {
        console.error("Error loading vendor:", error);
        setError("Failed to load vendor data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (vendorId) {
      loadVendor();
    }
  }, [vendorId]);

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
        { name: "", email: "", phone: "", designation: "" },
      ],
    }));
  };

  const removeContactPerson = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      contactPersons: prev.contactPersons.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      const vendorData = {
        name: formData.name,
        gstin: formData.gstin,
        companyName: formData.companyName,
        displayName: formData.displayName,
        email: formData.email,
        workPhone: formData.workPhone,
        mobile: formData.mobile,
        billingAddress: formData.address,
        shippingAddress: formData.shippingAddress,
        contactPersons: formData.contactPersons.filter(
          (person) => person.name.trim() !== ""
        ),
        type: formData.type,
        salutation: formData.salutation,
        firstName: formData.firstName,
        lastName: formData.lastName,
        pan: formData.pan,
        msmeRegistered: formData.msmeRegistered,
        currency: formData.currency,
        openingBalance: parseFloat(formData.openingBalance) || 0,
        paymentTerms: formData.paymentTerms,
        tds: formData.tds,
        enablePortal: formData.enablePortal,
        portalLanguage: formData.portalLanguage,
      };

      await vendorService.updateVendor(vendorId, vendorData);

      // Show success message and redirect
      // Using toast notification instead of alert
      const event = new CustomEvent("showToast", {
        detail: {
          message: "Vendor updated successfully!",
          type: "success",
        },
      });
      window.dispatchEvent(event);
      router.push("/dashboard/purchases/vendors");
    } catch (error) {
      console.error("Error updating vendor:", error);
      setError("Failed to update vendor. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push("/dashboard/purchases/vendors")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Vendors
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push("/dashboard/purchases/vendors")}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Vendors
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Vendor</h1>
              <p className="text-sm text-gray-500">
                Update vendor information and details
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: "details", label: "Details" },
              { id: "address", label: "Address" },
              { id: "contacts", label: "Contacts" },
              { id: "other", label: "Other" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === "details" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vendor Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GSTIN *
                </label>
                <input
                  type="text"
                  value={formData.gstin}
                  onChange={(e) => handleInputChange("gstin", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) =>
                    handleInputChange("companyName", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Name *
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) =>
                    handleInputChange("displayName", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Work Phone
                </label>
                <input
                  type="tel"
                  value={formData.workPhone}
                  onChange={(e) =>
                    handleInputChange("workPhone", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile
                </label>
                <input
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => handleInputChange("mobile", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PAN
                </label>
                <input
                  type="text"
                  value={formData.pan}
                  onChange={(e) => handleInputChange("pan", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {activeTab === "address" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Billing Address
                </h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street
                </label>
                <input
                  type="text"
                  value={formData.address.street}
                  onChange={(e) =>
                    handleAddressChange("address", "street", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={formData.address.city}
                  onChange={(e) =>
                    handleAddressChange("address", "city", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <input
                  type="text"
                  value={formData.address.state}
                  onChange={(e) =>
                    handleAddressChange("address", "state", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  value={formData.address.country}
                  onChange={(e) =>
                    handleAddressChange("address", "country", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP Code
                </label>
                <input
                  type="text"
                  value={formData.address.zipCode}
                  onChange={(e) =>
                    handleAddressChange("address", "zipCode", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <h3 className="text-lg font-medium text-gray-900 mb-4 mt-8">
                  Shipping Address
                </h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {activeTab === "contacts" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Contact Persons
                </h3>
                <button
                  type="button"
                  onClick={addContactPerson}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Contact Person
                </button>
              </div>

              {formData.contactPersons.map((person, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-md font-medium text-gray-900">
                      Contact Person {index + 1}
                    </h4>
                    {formData.contactPersons.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeContactPerson(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "other" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vendor Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange("type", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="business">Business</option>
                  <option value="individual">Individual</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) =>
                    handleInputChange("currency", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="INR- Indian Rupee">INR- Indian Rupee</option>
                  <option value="USD- US Dollar">USD- US Dollar</option>
                  <option value="EUR- Euro">EUR- Euro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Opening Balance
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.openingBalance}
                  onChange={(e) =>
                    handleInputChange("openingBalance", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Terms
                </label>
                <select
                  value={formData.paymentTerms}
                  onChange={(e) =>
                    handleInputChange("paymentTerms", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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
                  TDS
                </label>
                <input
                  type="text"
                  value={formData.tds}
                  onChange={(e) => handleInputChange("tds", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="msmeRegistered"
                  checked={formData.msmeRegistered}
                  onChange={(e) =>
                    handleInputChange("msmeRegistered", e.target.checked)
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="msmeRegistered"
                  className="ml-2 block text-sm text-gray-900"
                >
                  MSME Registered
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enablePortal"
                  checked={formData.enablePortal}
                  onChange={(e) =>
                    handleInputChange("enablePortal", e.target.checked)
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="enablePortal"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Enable Portal
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.push("/dashboard/purchases/vendors")}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Updating..." : "Update Vendor"}
          </button>
        </div>
      </form>
    </div>
  );
}
