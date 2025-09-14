"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

interface ItemFormData {
  type: "Goods" | "Service";
  name: string;
  unit: string;
  hsnCode: string;
  sacCode: string;
  salesEnabled: boolean;
  purchaseEnabled: boolean;
  sellingPrice: string;
  costPrice: string;
  salesAccount: string;
  purchaseAccount: string;
  salesDescription: string;
  purchaseDescription: string;
  preferredVendor: string;
  description: string;
  intraGST: number;
  interGST: number;
  size: string;
  color: string;
  weight: string;
  dimensions: {
    length: string;
    width: string;
    height: string;
  };
}

interface FormErrors {
  name?: string;
  sellingPrice?: string;
  costPrice?: string;
  hsnCode?: string;
  sacCode?: string;
  intraGST?: string;
  interGST?: string;
}

export default function NewItemForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<ItemFormData>({
    type: "Goods",
    name: "",
    unit: "",
    hsnCode: "",
    sacCode: "",
    salesEnabled: true,
    purchaseEnabled: true,
    sellingPrice: "",
    costPrice: "",
    salesAccount: "Sales",
    purchaseAccount: "Cost of Goods Sold",
    salesDescription: "",
    purchaseDescription: "",
    preferredVendor: "",
    description: "",
    intraGST: 0,
    interGST: 0,
    size: "",
    color: "",
    weight: "",
    dimensions: {
      length: "",
      width: "",
      height: "",
    },
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);

  // Autofocus the name field on load
  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  const handleInputChange = (
    field: keyof ItemFormData,
    value: string | boolean | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleGSTInputChange = (
    field: "intraGST" | "interGST",
    value: number
  ) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    // Real-time validation for GST equality
    if (field === "intraGST" && newFormData.interGST !== value) {
      showToast("IntraGST and InterGST must be equal", "error");
    } else if (field === "interGST" && newFormData.intraGST !== value) {
      showToast("IntraGST and InterGST must be equal", "error");
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (formData.salesEnabled && !formData.sellingPrice) {
      newErrors.sellingPrice =
        "Selling price is required when sales is enabled";
    }

    if (formData.purchaseEnabled && !formData.costPrice) {
      newErrors.costPrice = "Cost price is required when purchase is enabled";
    }

    if (formData.type === "Goods" && !formData.hsnCode.trim()) {
      newErrors.hsnCode = "HSN code is required for goods";
    }

    if (formData.type === "Service" && !formData.sacCode.trim()) {
      newErrors.sacCode = "SAC code is required for services";
    }

    // Validate GST rates
    if (formData.intraGST < 0 || formData.intraGST > 100) {
      newErrors.intraGST = "IntraGST rate must be between 0 and 100";
    }

    if (formData.interGST < 0 || formData.interGST > 100) {
      newErrors.interGST = "InterGST rate must be between 0 and 100";
    }

    // Validate that IntraGST and InterGST are equal
    if (formData.intraGST !== formData.interGST) {
      newErrors.intraGST = "IntraGST and InterGST must be equal";
      newErrors.interGST = "IntraGST and InterGST must be equal";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const showToast = (message: string, type: "success" | "error") => {
    // Create toast element
    const toast = document.createElement("div");
    toast.className = `fixed top-4 right-4 z-[9999] px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all duration-300 transform translate-x-full ${
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

  const handleSave = async () => {
    if (!validateForm()) {
      // Show toast for GST validation error
      if (formData.intraGST !== formData.interGST) {
        showToast("IntraGST and InterGST must be equal", "error");
      } else if (
        formData.intraGST < 0 ||
        formData.intraGST > 100 ||
        formData.interGST < 0 ||
        formData.interGST > 100
      ) {
        showToast("GST rates must be between 0 and 100", "error");
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL + "/api/items",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();

      if (response.ok) {
        showToast("Item saved successfully!", "success");
        // Redirect to items page after a short delay
        setTimeout(() => {
          router.push("/dashboard/items");
        }, 1000);
      } else {
        showToast(result.message || "Error saving item", "error");
      }
    } catch (error) {
      console.error("Error saving item:", error);
      showToast("Error saving item. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (formData.name || formData.sellingPrice || formData.costPrice) {
      if (
        confirm("Are you sure you want to cancel? All changes will be lost.")
      ) {
        router.push("/dashboard/items");
      }
    } else {
      router.push("/dashboard/items");
    }
  };

  const getInputClassName = (field: keyof ItemFormData) => {
    const baseClass =
      "border rounded px-3 py-2 w-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
    return errors[field as keyof FormErrors]
      ? `${baseClass} border-red-500 bg-red-50`
      : `${baseClass} border-gray-300 hover:border-gray-400`;
  };

  return (
    <div className="max-w-full bg-white p-6 md:p-8 text-sm shadow-sm border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard/items")}
            className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
          >
            &lt; Back to Items
          </button>
          <h2 className="text-2xl font-semibold text-gray-800">New Item</h2>
        </div>
        <div className="text-sm text-gray-500">
          {formData.type === "Goods" ? "Goods Item" : "Service Item"}
        </div>
      </div>

      {/* Type Selection */}
      <div className="mb-6">
        <label className="font-medium text-gray-700 mb-3 block">Type</label>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="Goods"
              checked={formData.type === "Goods"}
              onChange={() => handleInputChange("type", "Goods")}
              className="text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700">Goods</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="Service"
              checked={formData.type === "Service"}
              onChange={() => handleInputChange("type", "Service")}
              className="text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700">Service</span>
          </label>
        </div>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="font-medium text-red-600 mb-2 block">Name*</label>
          <input
            type="text"
            ref={nameInputRef}
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className={getInputClassName("name")}
            placeholder="Enter item name"
            required
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="font-medium text-gray-700 mb-2 block">Unit</label>
          <select
            value={formData.unit}
            onChange={(e) => handleInputChange("unit", e.target.value)}
            className={getInputClassName("unit")}
          >
            <option value="">Select or type to add</option>
            <option value="Piece">Piece</option>
            <option value="Kg">Kg</option>
            <option value="Liter">Liter</option>
            <option value="Meter">Meter</option>
            <option value="Hour">Hour</option>
            <option value="Day">Day</option>
            <option value="Month">Month</option>
            <option value="Year">Year</option>
          </select>
        </div>
      </div>

      {/* HSN/SAC Code */}
      <div className="mb-6">
        <label className="font-medium text-gray-700 mb-2 block">
          {formData.type === "Goods" ? "HSN Code*" : "SAC Code*"}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={
              formData.type === "Goods" ? formData.hsnCode : formData.sacCode
            }
            onChange={(e) =>
              handleInputChange(
                formData.type === "Goods" ? "hsnCode" : "sacCode",
                e.target.value
              )
            }
            className={`${getInputClassName(
              formData.type === "Goods" ? "hsnCode" : "sacCode"
            )} flex-1`}
            placeholder={
              formData.type === "Goods"
                ? "Enter HSN code (e.g., 9401)"
                : "Enter SAC code (e.g., 998314)"
            }
            maxLength={formData.type === "Goods" ? 8 : 6}
          />
          <button
            type="button"
            className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 text-gray-600"
            title={`Search ${formData.type === "Goods" ? "HSN" : "SAC"} codes`}
          >
            🔍
          </button>
        </div>
        {errors.hsnCode && (
          <p className="text-red-500 text-xs mt-1">{errors.hsnCode}</p>
        )}
        {errors.sacCode && (
          <p className="text-red-500 text-xs mt-1">{errors.sacCode}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          {formData.type === "Goods"
            ? "HSN (Harmonized System of Nomenclature) code is required for GST compliance"
            : "SAC (Services Accounting Code) is required for GST compliance"}
        </p>
      </div>

      {/* GST Options */}
      <div className="mb-6">
        <label className="font-medium text-gray-700 mb-3 block">
          GST Rates
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className={`border rounded-lg p-4 ${
              errors.intraGST
                ? "border-red-500 bg-red-50"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            <label className="block">
              <span className="font-medium text-gray-800 mb-2 block">
                IntraGST (%)
              </span>
              <p className="text-xs text-gray-600 mb-3">
                Within state transactions
              </p>
              <div className="flex gap-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.intraGST}
                  onChange={(e) =>
                    handleGSTInputChange("intraGST", Number(e.target.value))
                  }
                  className={`${getInputClassName("intraGST")} flex-1`}
                  placeholder="0.00"
                />
                <span className="border border-gray-300 rounded-r px-3 py-2 bg-gray-100 text-gray-600 text-sm">
                  %
                </span>
              </div>
            </label>
            {errors.intraGST && (
              <p className="text-red-500 text-xs mt-2">{errors.intraGST}</p>
            )}
          </div>

          <div
            className={`border rounded-lg p-4 ${
              errors.interGST
                ? "border-red-500 bg-red-50"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            <label className="block">
              <span className="font-medium text-gray-800 mb-2 block">
                InterGST (%)
              </span>
              <p className="text-xs text-gray-600 mb-3">
                Inter-state transactions
              </p>
              <div className="flex gap-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.interGST}
                  onChange={(e) =>
                    handleGSTInputChange("interGST", Number(e.target.value))
                  }
                  className={`${getInputClassName("interGST")} flex-1`}
                  placeholder="0.00"
                />
                <span className="border border-gray-300 rounded-r px-3 py-2 bg-gray-100 text-gray-600 text-sm">
                  %
                </span>
              </div>
            </label>
            {errors.interGST && (
              <p className="text-red-500 text-xs mt-2">{errors.interGST}</p>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Enter GST rates as percentages (0-100). Both IntraGST and InterGST
          must be equal for consistency.
        </p>
      </div>

      {/* Sales & Purchase Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Sales Information */}
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              checked={formData.salesEnabled}
              onChange={() =>
                handleInputChange("salesEnabled", !formData.salesEnabled)
              }
              className="text-blue-600 focus:ring-blue-500"
            />
            <h3 className="font-semibold text-gray-800">Sales Information</h3>
          </div>

          {formData.salesEnabled && (
            <div className="space-y-4">
              <div>
                <label className="block text-red-600 mb-2 font-medium">
                  Selling Price*
                </label>
                <div className="flex gap-1">
                  <span className="border border-gray-300 rounded-l px-3 py-2 bg-gray-100 text-gray-600 text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={formData.sellingPrice}
                    onChange={(e) =>
                      handleInputChange("sellingPrice", e.target.value)
                    }
                    className={`${getInputClassName("sellingPrice")} rounded-r`}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
                {errors.sellingPrice && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.sellingPrice}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-red-600 mb-2 font-medium">
                  Account*
                </label>
                <select
                  value={formData.salesAccount}
                  onChange={(e) =>
                    handleInputChange("salesAccount", e.target.value)
                  }
                  className={getInputClassName("salesAccount")}
                >
                  <option value="Sales">Sales</option>
                  <option value="Services">Services</option>
                  <option value="Other Income">Other Income</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.salesDescription}
                  onChange={(e) =>
                    handleInputChange("salesDescription", e.target.value)
                  }
                  className={getInputClassName("salesDescription")}
                  rows={3}
                  placeholder="Enter sales description..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Purchase Information */}
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              checked={formData.purchaseEnabled}
              onChange={() =>
                handleInputChange("purchaseEnabled", !formData.purchaseEnabled)
              }
              className="text-blue-600 focus:ring-blue-500"
            />
            <h3 className="font-semibold text-gray-800">
              Purchase Information
            </h3>
          </div>

          {formData.purchaseEnabled && (
            <div className="space-y-4">
              <div>
                <label className="block text-red-600 mb-2 font-medium">
                  Cost Price*
                </label>
                <div className="flex gap-1">
                  <span className="border border-gray-300 rounded-l px-3 py-2 bg-gray-100 text-gray-600 text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={formData.costPrice}
                    onChange={(e) =>
                      handleInputChange("costPrice", e.target.value)
                    }
                    className={`${getInputClassName("costPrice")} rounded-r`}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
                {errors.costPrice && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.costPrice}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-red-600 mb-2 font-medium">
                  Account*
                </label>
                <select
                  value={formData.purchaseAccount}
                  onChange={(e) =>
                    handleInputChange("purchaseAccount", e.target.value)
                  }
                  className={getInputClassName("purchaseAccount")}
                >
                  <option value="Cost of Goods Sold">Cost of Goods Sold</option>
                  <option value="Purchase">Purchase</option>
                  <option value="Expenses">Expenses</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.purchaseDescription}
                  onChange={(e) =>
                    handleInputChange("purchaseDescription", e.target.value)
                  }
                  className={getInputClassName("purchaseDescription")}
                  rows={3}
                  placeholder="Enter purchase description..."
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Additional Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-gray-700 mb-2 font-medium">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            className={getInputClassName("description")}
            rows={3}
            placeholder="Enter general description..."
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2 font-medium">
            Preferred Vendor
          </label>
          <input
            type="text"
            value={formData.preferredVendor}
            onChange={(e) =>
              handleInputChange("preferredVendor", e.target.value)
            }
            className={getInputClassName("preferredVendor")}
            placeholder="Enter preferred vendor name"
          />
        </div>
      </div>

      {/* Physical Attributes */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Physical Attributes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 mb-2 font-medium">
              Size
            </label>
            <input
              type="text"
              value={formData.size}
              onChange={(e) => handleInputChange("size", e.target.value)}
              className={getInputClassName("size")}
              placeholder="e.g., Small, Medium, Large, 10x10x5"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2 font-medium">
              Color
            </label>
            <input
              type="text"
              value={formData.color}
              onChange={(e) => handleInputChange("color", e.target.value)}
              className={getInputClassName("color")}
              placeholder="e.g., Red, Blue, Black"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2 font-medium">
              Weight (kg)
            </label>
            <input
              type="number"
              value={formData.weight}
              onChange={(e) => handleInputChange("weight", e.target.value)}
              className={getInputClassName("weight")}
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2 font-medium">
              Dimensions (cm)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                value={formData.dimensions.length}
                onChange={(e) => handleInputChange("dimensions", { ...formData.dimensions, length: e.target.value })}
                className={getInputClassName("dimensions")}
                placeholder="Length"
                step="0.01"
                min="0"
              />
              <input
                type="number"
                value={formData.dimensions.width}
                onChange={(e) => handleInputChange("dimensions", { ...formData.dimensions, width: e.target.value })}
                className={getInputClassName("dimensions")}
                placeholder="Width"
                step="0.01"
                min="0"
              />
              <input
                type="number"
                value={formData.dimensions.height}
                onChange={(e) => handleInputChange("dimensions", { ...formData.dimensions, height: e.target.value })}
                className={getInputClassName("dimensions")}
                placeholder="Height"
                step="0.01"
                min="0"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="text-blue-600 text-lg">ℹ️</div>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Inventory Tracking</p>
            <p>
              Do you want to keep track of this item?{" "}
              <span className="font-semibold text-blue-900 cursor-pointer hover:underline">
                Enable Inventory
              </span>{" "}
              to view its stock based on the sales and purchase transactions you
              record for it. Go to{" "}
              <span className="italic font-medium text-blue-900 cursor-pointer hover:underline">
                Settings &gt; Preferences &gt; Items
              </span>{" "}
              and enable inventory.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-start gap-4 pt-4 border-t border-gray-200">
        <button
          onClick={handleSave}
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Saving...
            </>
          ) : (
            "Save"
          )}
        </button>
        <button
          onClick={handleCancel}
          disabled={isSubmitting}
          className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
