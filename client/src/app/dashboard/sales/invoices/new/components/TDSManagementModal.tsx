"use client";

import React, { useState, useEffect } from "react";
import { XMarkIcon, PlusIcon, CogIcon } from "@heroicons/react/24/outline";
import { useToast } from "../../../../../../contexts/ToastContext";
import Swal from "sweetalert2";
import Select from "react-select";

interface TDSRecord {
  _id: string;
  name: string;
  rate: number;
  section: string;
  status: "Active" | "Inactive";
  isHigherRate: boolean;
  applicableFrom?: string;
  applicableTo?: string;
}

interface TDSManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void; // Callback to refresh the TDS list
}

// TDS Section Options
const TDS_SECTIONS = [
  { value: "Section 192", label: "192 – Salary", category: "Salary" },
  {
    value: "Section 192A",
    label: "192A – Provident Fund withdrawal (taxable)",
    category: "Salary",
  },
  {
    value: "Section 193",
    label: "193 – Interest on securities",
    category: "Interest",
  },
  { value: "Section 194", label: "194 – Dividend", category: "Dividend" },
  {
    value: "Section 194A",
    label: "194A – Interest other than securities",
    category: "Interest",
  },
  {
    value: "Section 194B",
    label: "194B – Winnings from lotteries, puzzles, etc.",
    category: "Winnings",
  },
  {
    value: "Section 194BA",
    label: "194BA – Winnings from online games",
    category: "Winnings",
  },
  {
    value: "Section 194BB",
    label: "194BB – Winnings from horse race",
    category: "Winnings",
  },
  {
    value: "Section 194C",
    label: "194C – Payment to contractors",
    category: "Contractor",
  },
  {
    value: "Section 194D",
    label: "194D – Insurance commission",
    category: "Commission",
  },
  {
    value: "Section 194DA",
    label: "194DA – Payment from life insurance policy",
    category: "Insurance",
  },
  {
    value: "Section 194E",
    label: "194E – Payment to non-resident sportsmen/sports association",
    category: "Non-Resident",
  },
  {
    value: "Section 194H",
    label: "194H – Commission or brokerage",
    category: "Commission",
  },
  { value: "Section 194I", label: "194I – Rent", category: "Rent" },
  {
    value: "Section 194IA",
    label: "194IA – Transfer of immovable property",
    category: "Property",
  },
  {
    value: "Section 194IB",
    label: "194IB – Rent by individuals/HUF",
    category: "Rent",
  },
  {
    value: "Section 194IC",
    label: "194IC – Payment under joint development agreement",
    category: "Property",
  },
  {
    value: "Section 194J",
    label: "194J – Professional/technical fees, royalty",
    category: "Professional",
  },
  {
    value: "Section 194K",
    label: "194K – Income from mutual fund units",
    category: "Investment",
  },
  {
    value: "Section 194LA",
    label: "194LA – Compensation on land/property acquisition",
    category: "Property",
  },
  {
    value: "Section 194LB",
    label: "194LB – Interest from infrastructure debt fund (non-resident)",
    category: "Non-Resident",
  },
  {
    value: "Section 194LBA",
    label: "194LBA – Income from business trust",
    category: "Investment",
  },
  {
    value: "Section 194LBB",
    label: "194LBB – Income from investment fund",
    category: "Investment",
  },
  {
    value: "Section 194LBC",
    label: "194LBC – Income from securitisation trust",
    category: "Investment",
  },
  {
    value: "Section 194LC",
    label: "194LC – Interest to non-resident (foreign currency loan)",
    category: "Non-Resident",
  },
  {
    value: "Section 194LD",
    label: "194LD – Interest on certain bonds/securities (FII/QFI)",
    category: "Investment",
  },
  {
    value: "Section 194M",
    label: "194M – Contract/professional payments by certain individuals/HUFs",
    category: "Professional",
  },
  {
    value: "Section 194N",
    label: "194N – Cash withdrawal above limit",
    category: "Cash",
  },
  {
    value: "Section 194O",
    label: "194O – E-commerce operator payments",
    category: "E-commerce",
  },
  {
    value: "Section 194P",
    label: "194P – For specified senior citizens",
    category: "Senior Citizens",
  },
  {
    value: "Section 194Q",
    label: "194Q – Purchase of goods",
    category: "Purchase",
  },
  {
    value: "Section 194R",
    label: "194R – Benefit/perquisite in business/profession",
    category: "Benefits",
  },
  {
    value: "Section 194S",
    label: "194S – Transfer of virtual digital assets",
    category: "Digital Assets",
  },
];

const TDSManagementModal: React.FC<TDSManagementModalProps> = ({
  isOpen,
  onClose,
  onUpdate,
}) => {
  const [tdsRecords, setTdsRecords] = useState<TDSRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingRecord, setEditingRecord] = useState<TDSRecord | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    rate: "",
    section: "",
    status: "Active" as "Active" | "Inactive",
    isHigherRate: false,
    applicableFrom: "",
    applicableTo: "",
  });

  // Debug logging
  useEffect(() => {
    console.log("TDS Modal mounted, TDS_SECTIONS length:", TDS_SECTIONS.length);
    console.log("React Select import test:", typeof Select);
    if (TDS_SECTIONS.length > 0) {
      console.log("First TDS section:", TDS_SECTIONS[0]);
    }
  }, []);

  // Load TDS records
  const loadTDSRecords = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL + "/api/tds",
        {
          credentials: "include",
        }
      );
      if (response.ok) {
        const result = await response.json();
        setTdsRecords(result.data || []);
      } else {
        showToast("Failed to load TDS records", "error");
      }
    } catch (error) {
      console.error("Error loading TDS records:", error);
      showToast("Error loading TDS records", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Load default TDS records
  const seedDefaultTDS = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL + "/api/tds/seed",
        {
          method: "POST",
          credentials: "include",
        }
      );
      if (response.ok) {
        const result = await response.json();
        showToast(result.message || "Default TDS records created", "success");
        loadTDSRecords();
      } else {
        const error = await response.json();
        showToast(error.error || "Failed to seed TDS records", "error");
      }
    } catch (error) {
      console.error("Error seeding TDS records:", error);
      showToast("Error seeding TDS records", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Save TDS record
  const saveTDSRecord = async () => {
    try {
      const url = editingRecord
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tds/${editingRecord._id}`
        : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tds`;
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
          section: formData.section,
          status: formData.status,
          isHigherRate: formData.isHigherRate,
          applicableFrom: formData.applicableFrom || undefined,
          applicableTo: formData.applicableTo || undefined,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        showToast(result.message || "TDS record saved successfully", "success");
        setShowForm(false);
        setEditingRecord(null);
        resetForm();
        loadTDSRecords();
        onUpdate(); // Refresh the parent component's TDS list
      } else {
        const error = await response.json();
        showToast(error.error || "Failed to save TDS record", "error");
      }
    } catch (error) {
      console.error("Error saving TDS record:", error);
      showToast("Error saving TDS record", "error");
    }
  };

  // Delete TDS record
  const deleteTDSRecord = async (id: string) => {
    const result = await Swal.fire({
      title: "Delete TDS Record?",
      text: "Are you sure you want to delete this TDS record? This action cannot be undone.",
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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tds/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.ok) {
        await Swal.fire({
          title: "Deleted!",
          text: "TDS record has been deleted successfully.",
          icon: "success",
          confirmButtonColor: "#10b981",
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            container: "swal-z-index",
          },
          backdrop: `rgba(0,0,0,0.4)`,
        });
        loadTDSRecords();
        onUpdate(); // Refresh the parent component's TDS list
      } else {
        const error = await response.json();
        showToast(error.error || "Failed to delete TDS record", "error");
      }
    } catch (error) {
      console.error("Error deleting TDS record:", error);
      showToast("Error deleting TDS record", "error");
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      rate: "",
      section: "",
      status: "Active",
      isHigherRate: false,
      applicableFrom: "",
      applicableTo: "",
    });
  };

  // Handle edit
  const handleEdit = (record: TDSRecord) => {
    setEditingRecord(record);
    setFormData({
      name: record.name,
      rate: record.rate.toString(),
      section: record.section,
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
      loadTDSRecords();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center tds-tcs-modal">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Manage TDS</h2>
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
                  className="flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add New TDS
                </button>
                <button
                  onClick={seedDefaultTDS}
                  className="flex items-center px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={isLoading}
                >
                  <CogIcon
                    className={`h-5 w-5 mr-2 ${
                      isLoading ? "animate-spin" : ""
                    }`}
                  />
                  {isLoading ? "Loading..." : "Load Default TDS"}
                </button>
              </div>

              {/* TDS Records Table */}
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
                    {tdsRecords.map((record) => (
                      <tr key={record._id} className="hover:bg-gray-50">
                        <td className="border px-3 py-2 text-sm">
                          {record.name}
                        </td>
                        <td className="border px-3 py-2 text-sm">
                          {record.rate}%
                        </td>
                        <td className="border px-3 py-2 text-sm">
                          {record.section}
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
                              onClick={() => deleteTDSRecord(record._id)}
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
                {tdsRecords.length === 0 && !isLoading && (
                  <div className="text-center py-8 text-gray-500">
                    No TDS records found. Click &ldquo;Load Default TDS&rdquo;
                    to get started.
                  </div>
                )}
              </div>
            </>
          ) : (
            // Form
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {editingRecord
                      ? "✏️ Edit TDS Record"
                      : "✨ Add New TDS Record"}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {editingRecord
                      ? "Update the TDS record details"
                      : "Create a new TDS deduction record"}
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
                    placeholder="e.g., Professional Fees"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md pr-8"
                      placeholder="e.g., 10"
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
                    key="tds-section-select-key"
                    instanceId="tds-section-select"
                    value={
                      TDS_SECTIONS.find(
                        (option) => option.value === formData.section
                      ) || null
                    }
                    onChange={(selectedOption) => {
                      console.log("TDS Section selected:", selectedOption);
                      setFormData({
                        ...formData,
                        section: selectedOption?.value || "",
                      });
                    }}
                    options={TDS_SECTIONS}
                    placeholder="Select TDS Section..."
                    isSearchable
                    isClearable
                    className="react-select-container"
                    classNamePrefix="react-select"
                    styles={{
                      control: (provided, state) => ({
                        ...provided,
                        minHeight: "42px",
                        border: `1px solid ${
                          state.isFocused ? "#3b82f6" : "#d1d5db"
                        }`,
                        borderRadius: "8px",
                        boxShadow: state.isFocused
                          ? "0 0 0 3px rgba(59, 130, 246, 0.1)"
                          : "none",
                        "&:hover": {
                          borderColor: "#3b82f6",
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
                          ? "#3b82f6"
                          : state.isFocused
                          ? "#eff6ff"
                          : "white",
                        color: state.isSelected ? "white" : "#374151",
                        cursor: "pointer",
                        padding: "10px 12px",
                        "&:active": {
                          backgroundColor: state.isSelected
                            ? "#3b82f6"
                            : "#dbeafe",
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
                          color: "#3b82f6",
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
                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-md font-medium">
                          {category}
                        </span>
                      </div>
                    )}
                  />
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
                  />
                </div>
              </div>

              <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                <input
                  type="checkbox"
                  id="isHigherRate"
                  checked={formData.isHigherRate}
                  onChange={(e) =>
                    setFormData({ ...formData, isHigherRate: e.target.checked })
                  }
                  className="mr-3 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="isHigherRate"
                  className="text-sm font-medium text-gray-700"
                >
                  ⚡ Higher TDS Rate (Special circumstances)
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
                  onClick={saveTDSRecord}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transform hover:scale-105"
                  disabled={
                    !formData.name || !formData.rate || !formData.section
                  }
                >
                  {editingRecord ? "✏️ Update TDS" : "✨ Create TDS"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TDSManagementModal;
