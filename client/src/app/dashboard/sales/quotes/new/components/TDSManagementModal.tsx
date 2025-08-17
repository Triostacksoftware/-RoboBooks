"use client";

import React, { useState, useEffect } from "react";
import { XMarkIcon, PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

interface TDSRecord {
  _id: string;
  name: string;
  rate: number;
  section: string;
  status: "Active" | "Inactive";
}

interface TDSManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const TDSManagementModal: React.FC<TDSManagementModalProps> = ({
  isOpen,
  onClose,
  onUpdate,
}) => {
  const [records, setRecords] = useState<TDSRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<TDSRecord | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    rate: 0,
    section: "",
  });

  useEffect(() => {
    if (isOpen) {
      loadTDSRecords();
    }
  }, [isOpen]);

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
        setRecords(result.data || []);
      }
    } catch (error) {
      console.error("Error loading TDS records:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingRecord
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tds/${editingRecord._id}`
        : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tds`;

      const response = await fetch(url, {
        method: editingRecord ? "PUT" : "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          status: "Active",
        }),
      });

      if (response.ok) {
        setShowForm(false);
        setEditingRecord(null);
        setFormData({ name: "", rate: 0, section: "" });
        onUpdate();
        loadTDSRecords();
      }
    } catch (error) {
      console.error("Error saving TDS record:", error);
    }
  };

  const handleEdit = (record: TDSRecord) => {
    setEditingRecord(record);
    setFormData({
      name: record.name,
      rate: record.rate,
      section: record.section,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this TDS record?")) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tds/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.ok) {
        onUpdate();
        loadTDSRecords();
      }
    } catch (error) {
      console.error("Error deleting TDS record:", error);
    }
  };

  const handleSeedData = async () => {
    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL + "/api/tds/seed",
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (response.ok) {
        onUpdate();
        loadTDSRecords();
      }
    } catch (error) {
      console.error("Error seeding TDS data:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            TDS Management
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSeedData}
              className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              Seed Data
            </button>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          {!showForm ? (
            <>
              {/* Add New Button */}
              <div className="mb-4">
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add New TDS Record
                </button>
              </div>

              {/* Records Table */}
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading TDS records...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-3 font-medium text-gray-700">
                          Name
                        </th>
                        <th className="text-left py-2 px-3 font-medium text-gray-700">
                          Rate (%)
                        </th>
                        <th className="text-left py-2 px-3 font-medium text-gray-700">
                          Section
                        </th>
                        <th className="text-left py-2 px-3 font-medium text-gray-700">
                          Status
                        </th>
                        <th className="text-left py-2 px-3 font-medium text-gray-700">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((record) => (
                        <tr
                          key={record._id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-2 px-3">{record.name}</td>
                          <td className="py-2 px-3">{record.rate}%</td>
                          <td className="py-2 px-3">{record.section}</td>
                          <td className="py-2 px-3">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                record.status === "Active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {record.status}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEdit(record)}
                                className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(record._id)}
                                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  TDS Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rate (%)
                </label>
                <input
                  type="number"
                  value={formData.rate}
                  onChange={(e) =>
                    setFormData({ ...formData, rate: Number(e.target.value) })
                  }
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section
                </label>
                <input
                  type="text"
                  value={formData.section}
                  onChange={(e) =>
                    setFormData({ ...formData, section: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingRecord(null);
                    setFormData({ name: "", rate: 0, section: "" });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingRecord ? "Update" : "Create"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default TDSManagementModal;
