/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import {
  DocumentTextIcon,
  PlusIcon,
  XMarkIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

interface Salesperson {
  _id: string;
  name: string;
  email: string;
}

interface InvoiceDetailsProps {
  formData: {
    invoiceNumber: string;
    reference: string;
    invoiceDate: string;
    terms: string;
    dueDate: string;
    salesperson: string;
  };
  onFormDataChange: (data: any) => void;
}

const InvoiceDetails: React.FC<InvoiceDetailsProps> = ({
  formData,
  onFormDataChange,
}) => {
  const [showSalespersonModal, setShowSalespersonModal] = useState(false);
  const [salespersons, setSalespersons] = useState<Salesperson[]>([]);
  const [showSalespersonDropdown, setShowSalespersonDropdown] = useState(false);
  const [newSalesperson, setNewSalesperson] = useState({ name: "", email: "" });

  // Fetch salespersons on component mount
  useEffect(() => {
    fetchSalespersons();
  }, []);

  const fetchSalespersons = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/salespersons`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        const result = await response.json();
        setSalespersons(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching salespersons:", error);
    }
  };

  const handleAddSalesperson = async () => {
    if (!newSalesperson.name || !newSalesperson.email) {
      alert("Please fill in both name and email");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/salespersons`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newSalesperson),
        }
      );

      if (response.ok) {
        const result = await response.json();
        setSalespersons([...salespersons, result.data]);
        onFormDataChange({ salesperson: result.data.name });
        setNewSalesperson({ name: "", email: "" });
        setShowSalespersonModal(false);
      } else {
        alert("Failed to add salesperson");
      }
    } catch (error) {
      console.error("Error adding salesperson:", error);
      alert("Error adding salesperson");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <DocumentTextIcon className="h-5 w-5 mr-2" />
        Sales Order Details
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sales Order Number
          </label>
          <input
            type="text"
            value={formData.invoiceNumber}
            onChange={(e) =>
              onFormDataChange({ invoiceNumber: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reference
          </label>
          <input
            type="text"
            value={formData.reference}
            onChange={(e) => onFormDataChange({ reference: e.target.value })}
            placeholder="Enter reference number"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sales Order Date
          </label>
          <input
            type="date"
            value={formData.invoiceDate}
            onChange={(e) => onFormDataChange({ invoiceDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Terms
          </label>
          <select
            value={formData.terms}
            onChange={(e) => onFormDataChange({ terms: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <div className="relative">
            <div
              onClick={() =>
                setShowSalespersonDropdown(!showSalespersonDropdown)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white cursor-pointer flex items-center justify-between hover:border-gray-400 transition-colors"
            >
              <span
                className={
                  formData.salesperson ? "text-gray-900" : "text-gray-500"
                }
              >
                {formData.salesperson || "Select or Add Salesperson"}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSalespersonModal(true);
                  }}
                  className="p-1 text-blue-600 hover:text-blue-800"
                  title="Add New Salesperson"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
                <ChevronDownIcon className="h-4 w-4 text-gray-400" />
              </div>
            </div>

            {showSalespersonDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                <div className="p-2 border-b border-gray-200">
                  <input
                    type="text"
                    placeholder="Search salesperson..."
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div
                  className="px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                  onClick={() => {
                    onFormDataChange({ salesperson: "" });
                    setShowSalespersonDropdown(false);
                  }}
                >
                  Clear Selection
                </div>
                <div
                  className="px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 cursor-pointer border-b border-gray-100 flex items-center"
                  onClick={() => {
                    setShowSalespersonModal(true);
                    setShowSalespersonDropdown(false);
                  }}
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  New Salesperson
                </div>
                {salespersons.map((person) => (
                  <div
                    key={person._id}
                    className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onClick={() => {
                      onFormDataChange({ salesperson: person.name });
                      setShowSalespersonDropdown(false);
                    }}
                  >
                    <div className="font-medium">{person.name}</div>
                    <div className="text-xs text-gray-500">{person.email}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Due Date
          </label>
          <input
            type="date"
            value={formData.dueDate}
            onChange={(e) => onFormDataChange({ dueDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Salesperson Management Modal */}
      {showSalespersonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Manage Salespersons
                </h3>
                <button
                  onClick={() => setShowSalespersonModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name*
                  </label>
                  <input
                    type="text"
                    value={newSalesperson.name}
                    onChange={(e) =>
                      setNewSalesperson({
                        ...newSalesperson,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter salesperson name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email*
                  </label>
                  <input
                    type="email"
                    value={newSalesperson.email}
                    onChange={(e) =>
                      setNewSalesperson({
                        ...newSalesperson,
                        email: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter salesperson email"
                  />
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Salespersons
                  </h4>
                  <div className="max-h-40 overflow-y-auto">
                    {salespersons.map((person) => (
                      <div
                        key={person._id}
                        className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                      >
                        <div>
                          <div className="font-medium text-sm">
                            {person.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {person.email}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowSalespersonModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSalesperson}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Save and Select
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceDetails;
