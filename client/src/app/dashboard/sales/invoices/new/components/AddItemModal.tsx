import React, { useState } from "react";
import { XMarkIcon, PlusIcon } from "@heroicons/react/24/outline";

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemCreated: (item: any) => void;
}

const AddItemModal: React.FC<AddItemModalProps> = ({
  isOpen,
  onClose,
  onItemCreated,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "Goods",
    unit: "Piece",
    sellingPrice: "",
    description: "",
    category: "",
    gstRate: "18",
    sku: "",
    hsnCode: "",
    sacCode: "",
    useHsnCode: false,
    useSacCode: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Item name is required";
    }

    if (!formData.sellingPrice || parseFloat(formData.sellingPrice) <= 0) {
      newErrors.sellingPrice = "Valid selling price is required";
    }

    if (!formData.unit.trim()) {
      newErrors.unit = "Unit is required";
    }

    if (formData.useHsnCode && !formData.hsnCode.trim()) {
      newErrors.hsnCode = "HSN Code is required when enabled";
    }

    if (formData.useSacCode && !formData.sacCode.trim()) {
      newErrors.sacCode = "SAC Code is required when enabled";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

      const itemData = {
        name: formData.name.trim(),
        type: formData.type,
        unit: formData.unit,
        sellingPrice: parseFloat(formData.sellingPrice),
        description: formData.description.trim(),
        category: formData.category.trim(),
        gstRate: parseInt(formData.gstRate),
        sku: formData.sku.trim(),
        hsnCode: formData.useHsnCode ? formData.hsnCode.trim() : "",
        sacCode: formData.useSacCode ? formData.sacCode.trim() : "",
        salesEnabled: true,
        purchaseEnabled: false,
        salesAccount: "Sales",
        purchaseAccount: "Cost of Goods Sold",
        isActive: true,
      };

      const response = await fetch(`${backendUrl}/api/items`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(itemData),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          onItemCreated(result.data);
          handleClose();
        } else {
          setErrors({ submit: result.message || "Failed to create item" });
        }
      } else {
        const errorData = await response.json();
        setErrors({ submit: errorData.message || "Failed to create item" });
      }
    } catch (error) {
      console.error("Error creating item:", error);
      setErrors({ submit: "Network error. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      type: "Goods",
      unit: "Piece",
      sellingPrice: "",
      description: "",
      category: "",
      gstRate: "18",
      sku: "",
      hsnCode: "",
      sacCode: "",
      useHsnCode: false,
      useSacCode: false,
    });
    setErrors({});
    setIsLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg transform overflow-hidden rounded-xl bg-white shadow-2xl transition-all">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-3">
            <div className="flex items-center space-x-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100">
                <PlusIcon className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Add New Item
                </h3>
                <p className="text-xs text-gray-500">
                  Create a new item for your inventory
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-4">
            <div className="space-y-4">
              {/* Basic Information */}
              <div>
                <h4 className="text-xs font-medium text-gray-900 mb-3">
                  Basic Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Item Name */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Item Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      className={`w-full px-2 py-1.5 border rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.name ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="Enter item name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                    )}
                  </div>

                  {/* Item Type */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Item Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        handleInputChange("type", e.target.value)
                      }
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-colors"
                    >
                      <option value="Goods">Goods</option>
                      <option value="Service">Service</option>
                    </select>
                  </div>

                  {/* Unit */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Unit *
                    </label>
                    <input
                      type="text"
                      value={formData.unit}
                      onChange={(e) =>
                        handleInputChange("unit", e.target.value)
                      }
                      className={`w-full px-2 py-1.5 border rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.unit ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="e.g., Piece, Kg, Hour"
                    />
                    {errors.unit && (
                      <p className="mt-1 text-xs text-red-600">{errors.unit}</p>
                    )}
                  </div>

                  {/* SKU */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      SKU (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => handleInputChange("sku", e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Stock Keeping Unit"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing Information */}
              <div>
                <h4 className="text-xs font-medium text-gray-900 mb-3">
                  Pricing Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Selling Price */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Selling Price (₹) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.sellingPrice}
                      onChange={(e) =>
                        handleInputChange("sellingPrice", e.target.value)
                      }
                      className={`w-full px-2 py-1.5 border rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.sellingPrice
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                      placeholder="0.00"
                    />
                    {errors.sellingPrice && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.sellingPrice}
                      </p>
                    )}
                  </div>

                  {/* GST Rate */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      GST Rate (%)
                    </label>
                    <select
                      value={formData.gstRate}
                      onChange={(e) =>
                        handleInputChange("gstRate", e.target.value)
                      }
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-colors"
                    >
                      <option value="0">0% - Exempt</option>
                      <option value="5">5%</option>
                      <option value="12">12%</option>
                      <option value="18">18%</option>
                      <option value="28">28%</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Tax Codes */}
              <div>
                <h4 className="text-xs font-medium text-gray-900 mb-3">
                  Tax Codes
                </h4>
                <div className="space-y-3">
                  {/* HSN Code */}
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="useHsnCode"
                      checked={formData.useHsnCode}
                      onChange={(e) =>
                        handleInputChange("useHsnCode", e.target.checked)
                      }
                      className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="useHsnCode"
                      className="text-xs font-medium text-gray-700"
                    >
                      Use HSN Code
                    </label>
                  </div>
                  {formData.useHsnCode && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        HSN Code *
                      </label>
                      <input
                        type="text"
                        value={formData.hsnCode}
                        onChange={(e) =>
                          handleInputChange("hsnCode", e.target.value)
                        }
                        className={`w-full px-2 py-1.5 border rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          errors.hsnCode ? "border-red-300" : "border-gray-300"
                        }`}
                        placeholder="e.g., 998314"
                      />
                      {errors.hsnCode && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.hsnCode}
                        </p>
                      )}
                    </div>
                  )}

                  {/* SAC Code */}
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="useSacCode"
                      checked={formData.useSacCode}
                      onChange={(e) =>
                        handleInputChange("useSacCode", e.target.checked)
                      }
                      className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="useSacCode"
                      className="text-xs font-medium text-gray-700"
                    >
                      Use SAC Code
                    </label>
                  </div>
                  {formData.useSacCode && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        SAC Code *
                      </label>
                      <input
                        type="text"
                        value={formData.sacCode}
                        onChange={(e) =>
                          handleInputChange("sacCode", e.target.value)
                        }
                        className={`w-full px-2 py-1.5 border rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          errors.sacCode ? "border-red-300" : "border-gray-300"
                        }`}
                        placeholder="e.g., 998314"
                      />
                      {errors.sacCode && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.sacCode}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <h4 className="text-xs font-medium text-gray-900 mb-3">
                  Additional Information
                </h4>
                <div className="space-y-3">
                  {/* Category */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Category (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) =>
                        handleInputChange("category", e.target.value)
                      }
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="e.g., Electronics, Furniture, Services"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Description (Optional)
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      rows={2}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                      placeholder="Describe your item..."
                    />
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {errors.submit && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-2">
                  <p className="text-xs text-red-600">{errors.submit}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 border-t border-gray-200 px-6 py-3 mt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 border border-transparent rounded hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating...</span>
                  </div>
                ) : (
                  "Create Item"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddItemModal;
