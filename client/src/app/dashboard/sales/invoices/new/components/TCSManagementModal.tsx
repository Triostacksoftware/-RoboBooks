"use client";

import React, { useState, useEffect } from "react";
import { XMarkIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useToast } from "../../../../../../contexts/ToastContext";
import Swal from "sweetalert2";
import Select from "react-select";

interface TCSRecord {
  _id: string;
  name: string;
  rate: number;
  natureOfCollection: string;
  section?: string;
  status: "Active" | "Inactive";
  isHigherRate: boolean;
  applicableFrom?: string;
  applicableTo?: string;
}

interface TCSManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void; // Callback to refresh the TCS list
}

// TCS Section Options
const TCS_SECTIONS = [
  {
    value: "Section 206C(1)",
    label: "206C(1) – Alcoholic liquor for human consumption",
    category: "Liquor",
  },
  {
    value: "Section 206C(1)",
    label: "206C(1) – Tendu leaves",
    category: "Forest Products",
  },
  {
    value: "Section 206C(1)",
    label: "206C(1) – Timber obtained under a forest lease",
    category: "Forest Products",
  },
  {
    value: "Section 206C(1)",
    label: "206C(1) – Timber obtained otherwise than under a forest lease",
    category: "Forest Products",
  },
  {
    value: "Section 206C(1)",
    label:
      "206C(1) – Any other forest produce (not being timber or tendu leaves)",
    category: "Forest Products",
  },
  {
    value: "Section 206C(1)",
    label: "206C(1) – Scrap",
    category: "Scrap & Materials",
  },
  {
    value: "Section 206C(1)",
    label: "206C(1) – Minerals (coal, lignite, iron ore)",
    category: "Minerals",
  },
  {
    value: "Section 206C(1C) [6CF]",
    label: "206C(1C) [6CF] – Parking lot",
    category: "Infrastructure",
  },
  {
    value: "Section 206C(1C) [6CG]",
    label: "206C(1C) [6CG] – Toll plaza",
    category: "Infrastructure",
  },
  {
    value: "Section 206C(1C) [6CH]",
    label: "206C(1C) [6CH] – Mine or quarry",
    category: "Mining",
  },
  {
    value: "Section 206C(1F) [6CL]",
    label: "206C(1F) [6CL] – Sale of motor vehicle (above threshold value)",
    category: "Vehicles",
  },
  {
    value: "Section 206C(1G)",
    label: "206C(1G) – Overseas remittance under LRS",
    category: "Foreign Exchange",
  },
  {
    value: "Section 206C(1G)",
    label: "206C(1G) – Sale of overseas tour program package",
    category: "Travel & Tourism",
  },
  {
    value: "Section 206C(1H)",
    label:
      "206C(1H) – Sale of goods (other than those specified above) exceeding turnover & value limits",
    category: "General Sales",
  },
  {
    value: "6CMA",
    label: "6CMA – Sale of wrist watch",
    category: "Luxury Goods",
  },
  {
    value: "6CF",
    label: "6CF – Parking lots",
    category: "Infrastructure",
  },
  {
    value: "6CG",
    label: "6CG – Toll plaza",
    category: "Infrastructure",
  },
  {
    value: "6CH",
    label: "6CH – Mine or quarry",
    category: "Mining",
  },
  {
    value: "6CL",
    label: "6CL – Sale of motor vehicle",
    category: "Vehicles",
  },
  {
    value: "6CMA",
    label: "6CMA – Sale of wrist watch (example commodity-specific code)",
    category: "Luxury Goods",
  },
  {
    value: "6CMH",
    label: "6CMH – Sale of sportswear and equipment (golf kit, ski-wear, etc.)",
    category: "Sports & Recreation",
  },
  {
    value: "6CMI",
    label: "6CMI – Sale of home theatre system",
    category: "Electronics",
  },
  {
    value: "6CMJ",
    label:
      "6CMJ – Sale of horse for horse racing in race clubs and horse for polo",
    category: "Sports & Recreation",
  },
  {
    value: "6CO",
    label: "6CO – Purchase of overseas tour program package",
    category: "Travel & Tourism",
  },
  {
    value: "6CP",
    label: "6CP – Educational loan taken from financial institution (Sec 80E)",
    category: "Education",
  },
  {
    value: "6CQ",
    label:
      "6CQ – Remittance under LRS for purposes other than purchase of overseas tour program package or educational loan",
    category: "Foreign Exchange",
  },
  {
    value: "6CR",
    label: "6CR – Sale of goods (Section 206C(1H))",
    category: "General Sales",
  },
];

const TCSManagementModal: React.FC<TCSManagementModalProps> = ({
  isOpen,
  onClose,
  onUpdate,
}) => {
  const [tcsRecords, setTcsRecords] = useState<TCSRecord[]>([]);
  const [natureOptions, setNatureOptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingRecord, setEditingRecord] = useState<TCSRecord | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    rate: "",
    natureOfCollection: "",
    section: "",
    status: "Active" as "Active" | "Inactive",
    isHigherRate: false,
    applicableFrom: "",
    applicableTo: "",
  });

  // Debug logging
  useEffect(() => {
    console.log("TCS Modal mounted, TCS_SECTIONS length:", TCS_SECTIONS.length);
    console.log("React Select import test:", typeof Select);
    if (TCS_SECTIONS.length > 0) {
      console.log("First TCS section:", TCS_SECTIONS[0]);
    }
  }, []);

  // Load TCS records
  const loadTCSRecords = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL + "/api/tcs",
        {
          credentials: "include",
        }
      );
      if (response.ok) {
        const result = await response.json();
        setTcsRecords(result.data || []);
      } else {
        showToast("Failed to load TCS records", "error");
      }
    } catch (error) {
      console.error("Error loading TCS records:", error);
      showToast("Error loading TCS records", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Load nature of collection options
  const loadNatureOptions = async () => {
    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL + "/api/tcs/nature-options",
        {
          credentials: "include",
        }
      );
      if (response.ok) {
        const result = await response.json();
        setNatureOptions(result.data || []);
      }
    } catch (error) {
      console.error("Error loading nature options:", error);
    }
  };

  // Save TCS record
  const saveTCSRecord = async () => {
    try {
      const url = editingRecord
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tcs/${editingRecord._id}`
        : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tcs`;
      const method = editingRecord ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: formData.name,
          rate: parseFloat(formData.rate),
          natureOfCollection: formData.natureOfCollection,
          section: formData.section || undefined,
          status: formData.status,
          isHigherRate: formData.isHigherRate,
          applicableFrom: formData.applicableFrom || undefined,
          applicableTo: formData.applicableTo || undefined,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        showToast(result.message || "TCS record saved successfully", "success");
        setShowForm(false);
        setEditingRecord(null);
        resetForm();
        loadTCSRecords();
        onUpdate(); // Refresh the parent component's TCS list
      } else {
        const error = await response.json();
        showToast(error.error || "Failed to save TCS record", "error");
      }
    } catch (error) {
      console.error("Error saving TCS record:", error);
      showToast("Error saving TCS record", "error");
    }
  };

  // Delete TCS record
  const deleteTCSRecord = async (id: string) => {
    const result = await Swal.fire({
      title: "Delete TCS Record?",
      text: "Are you sure you want to delete this TCS record? This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      customClass: {
        container: "swal-z-index",
      },
      backdrop: `rgba(0,0,0,0.4)`,
      allowOutsideClick: false,
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tcs/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.ok) {
        await Swal.fire({
          title: "Deleted!",
          text: "TCS record has been deleted successfully.",
          icon: "success",
          confirmButtonColor: "#10b981",
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            container: "swal-z-index",
          },
          backdrop: `rgba(0,0,0,0.4)`,
        });
        loadTCSRecords();
        onUpdate(); // Refresh the parent component's TCS list
      } else {
        const error = await response.json();
        showToast(error.error || "Failed to delete TCS record", "error");
      }
    } catch (error) {
      console.error("Error deleting TCS record:", error);
      showToast("Error deleting TCS record", "error");
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      rate: "",
      natureOfCollection: "",
      section: "",
      status: "Active",
      isHigherRate: false,
      applicableFrom: "",
      applicableTo: "",
    });
  };

  // Handle edit
  const handleEdit = (record: TCSRecord) => {
    setEditingRecord(record);
    setFormData({
      name: record.name,
      rate: record.rate.toString(),
      natureOfCollection: record.natureOfCollection,
      section: record.section || "",
      status: record.status,
      isHigherRate: record.isHigherRate,
      applicableFrom: record.applicableFrom
        ? record.applicableFrom.split("T")[0]
        : "",
      applicableTo: record.applicableTo
        ? record.applicableTo.split("T")[0]
        : "",
    });
    setShowForm(true);
  };

  // Handle add new
  const handleAddNew = () => {
    setEditingRecord(null);
    resetForm();
    setShowForm(true);
  };

  // Load records when modal opens
  useEffect(() => {
    if (isOpen) {
      loadTCSRecords();
      loadNatureOptions();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center tds-tcs-modal">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Manage TCS</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          {!showForm ? (
            <>
              {/* Action Buttons */}
              <div className="flex justify-between mb-6">
                <button
                  onClick={handleAddNew}
                  className="flex items-center px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add New TCS
                </button>
              </div>

              {/* TCS Records Table */}
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border px-3 py-2 text-left text-sm font-medium">
                        Name
                      </th>
                      <th className="border px-3 py-2 text-left text-sm font-medium">
                        Rate (%)
                      </th>
                      <th className="border px-3 py-2 text-left text-sm font-medium">
                        Nature of Collection
                      </th>
                      <th className="border px-3 py-2 text-left text-sm font-medium">
                        Section
                      </th>
                      <th className="border px-3 py-2 text-left text-sm font-medium">
                        Status
                      </th>
                      <th className="border px-3 py-2 text-left text-sm font-medium">
                        Higher Rate
                      </th>
                      <th className="border px-3 py-2 text-left text-sm font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tcsRecords.map((record) => (
                      <tr key={record._id} className="hover:bg-gray-50">
                        <td className="border px-3 py-2 text-sm">
                          {record.name}
                        </td>
                        <td className="border px-3 py-2 text-sm">
                          {record.rate}%
                        </td>
                        <td className="border px-3 py-2 text-sm">
                          {record.natureOfCollection}
                        </td>
                        <td className="border px-3 py-2 text-sm">
                          {record.section || "-"}
                        </td>
                        <td className="border px-3 py-2 text-sm">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              record.status === "Active"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {record.status}
                          </span>
                        </td>
                        <td className="border px-3 py-2 text-sm">
                          {record.isHigherRate ? "Yes" : "No"}
                        </td>
                        <td className="border px-3 py-2 text-sm">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(record)}
                              className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs hover:bg-blue-200"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteTCSRecord(record._id)}
                              className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs hover:bg-red-200"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {tcsRecords.length === 0 && !isLoading && (
                  <div className="text-center py-8 text-gray-500">
                    No TCS records found. Click &ldquo;Add New TCS&rdquo; to get
                    started.
                  </div>
                )}
              </div>
            </>
          ) : (
            // Form
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-100">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {editingRecord
                      ? "✏️ Edit TCS Record"
                      : "✨ Add New TCS Record"}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {editingRecord
                      ? "Update the TCS record details"
                      : "Create a new TCS collection record"}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingRecord(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 hover:bg-white p-2 rounded-full transition-all duration-200"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📝 Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 shadow-sm hover:shadow-md"
                    placeholder="e.g., Sale of Goods"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📊 Rate (%) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={formData.rate}
                      onChange={(e) =>
                        setFormData({ ...formData, rate: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 shadow-sm hover:shadow-md pr-8"
                      placeholder="e.g., 1"
                    />
                    <span className="absolute right-3 top-3 text-gray-500 text-sm">
                      %
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📋 Section *
                  </label>
                  <Select
                    key="tcs-section-select-key"
                    instanceId="tcs-section-select"
                    value={
                      TCS_SECTIONS.find(
                        (option) => option.value === formData.section
                      ) || null
                    }
                    onChange={(selectedOption) => {
                      console.log("TCS Section selected:", selectedOption);
                      setFormData({
                        ...formData,
                        section: selectedOption?.value || "",
                      });
                    }}
                    options={TCS_SECTIONS}
                    placeholder="Select TCS Section..."
                    isSearchable
                    isClearable
                    className="react-select-container"
                    classNamePrefix="react-select"
                    styles={{
                      control: (provided, state) => ({
                        ...provided,
                        minHeight: "42px",
                        border: `1px solid ${
                          state.isFocused ? "#10b981" : "#d1d5db"
                        }`,
                        borderRadius: "8px",
                        boxShadow: state.isFocused
                          ? "0 0 0 3px rgba(16, 185, 129, 0.1)"
                          : "none",
                        "&:hover": {
                          borderColor: "#10b981",
                        },
                      }),
                      valueContainer: (provided) => ({
                        ...provided,
                        padding: "8px 12px",
                      }),
                      placeholder: (provided) => ({
                        ...provided,
                        color: "#9ca3af",
                      }),
                      option: (provided, state) => ({
                        ...provided,
                        backgroundColor: state.isSelected
                          ? "#10b981"
                          : state.isFocused
                          ? "#ecfdf5"
                          : "white",
                        color: state.isSelected ? "white" : "#374151",
                        cursor: "pointer",
                        padding: "10px 12px",
                        "&:active": {
                          backgroundColor: state.isSelected
                            ? "#10b981"
                            : "#d1fae5",
                        },
                      }),
                                             menu: (provided) => ({
                         ...provided,
                         zIndex: 1000,
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        boxShadow:
                          "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                      }),
                      menuList: (provided) => ({
                        ...provided,
                        maxHeight: "200px",
                        padding: "4px",
                      }),
                      dropdownIndicator: (provided) => ({
                        ...provided,
                        color: "#6b7280",
                        "&:hover": {
                          color: "#10b981",
                        },
                      }),
                      clearIndicator: (provided) => ({
                        ...provided,
                        color: "#6b7280",
                        "&:hover": {
                          color: "#ef4444",
                        },
                      }),
                    }}
                    formatOptionLabel={({ label, category }) => (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-900 mr-2 flex-1 truncate">
                          {label}
                        </span>
                        <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md font-medium">
                          {category}
                        </span>
                      </div>
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    🏷️ Nature of Collection *
                  </label>
                  <select
                    value={formData.natureOfCollection}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        natureOfCollection: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <option value="">Select Nature of Collection</option>
                    {natureOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    🔄 Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as "Active" | "Inactive",
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <option value="Active">✅ Active</option>
                    <option value="Inactive">❌ Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📅 Applicable From
                  </label>
                  <input
                    type="date"
                    value={formData.applicableFrom}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        applicableFrom: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 shadow-sm hover:shadow-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📅 Applicable To
                  </label>
                  <input
                    type="date"
                    value={formData.applicableTo}
                    onChange={(e) =>
                      setFormData({ ...formData, applicableTo: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 shadow-sm hover:shadow-md"
                  />
                </div>
              </div>

              <div className="flex items-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <input
                  type="checkbox"
                  id="isHigherRate"
                  checked={formData.isHigherRate}
                  onChange={(e) =>
                    setFormData({ ...formData, isHigherRate: e.target.checked })
                  }
                  className="mr-3 h-4 w-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <label
                  htmlFor="isHigherRate"
                  className="text-sm font-medium text-gray-700"
                >
                  ⚡ Higher TCS Rate (Special circumstances)
                </label>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingRecord(null);
                    resetForm();
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
                >
                  ❌ Cancel
                </button>
                <button
                  onClick={saveTCSRecord}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transform hover:scale-105"
                  disabled={
                    !formData.name ||
                    !formData.rate ||
                    !formData.natureOfCollection
                  }
                >
                  {editingRecord ? "✏️ Update TCS" : "✨ Create TCS"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TCSManagementModal;
