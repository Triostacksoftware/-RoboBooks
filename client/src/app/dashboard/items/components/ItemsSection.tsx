/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronDownIcon,
  PlusIcon,
  EllipsisVerticalIcon,
  FunnelIcon,
  StarIcon,
  XMarkIcon,
  PencilIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

interface Item {
  _id: string;
  type: "Goods" | "Service";
  name: string;
  unit: string;
  hsnCode?: string;
  sacCode?: string;
  salesEnabled: boolean;
  purchaseEnabled: boolean;
  sellingPrice?: number;
  costPrice?: number;
  salesAccount: string;
  purchaseAccount: string;
  salesDescription?: string;
  purchaseDescription?: string;
  preferredVendor?: string;
  description?: string;
  intraGST?: number;
  interGST?: number;
  sku?: string;
  barcode?: string;
  category?: string;
  brand?: string;
  currentStock?: number;
  reorderPoint?: number;
  gstRate?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const filters = [
  "All",
  "Active",
  "Inactive",
  "Sales",
  "Purchases",
  "Services",
  "Robo CRM",
];

export default function ItemsSection() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [moreActionsOpen, setMoreActionsOpen] = useState(false);
  const [exportSubmenuOpen, setExportSubmenuOpen] = useState(false);
  const [selectedView, setSelectedView] = useState("All Items");
  const [activeHeader, setActiveHeader] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "transactions" | "history"
  >("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Item>>({});

  const dropdownRef = useRef<HTMLDivElement>(null);
  const moreActionsRef = useRef<HTMLDivElement>(null);

  // Fetch items from backend
  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL + "/api/items",
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const result = await response.json();

      if (response.ok) {
        setItems(result.data || []);
      } else {
        setError(result.message || "Failed to fetch items");
      }
    } catch (error) {
      console.error("Error fetching items:", error);
      setError("Failed to fetch items. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Load items on component mount
  useEffect(() => {
    fetchItems();
  }, []);

  // Close all dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
      if (
        moreActionsRef.current &&
        !moreActionsRef.current.contains(event.target as Node)
      ) {
        setMoreActionsOpen(false);
        setExportSubmenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleHeaderClick = (key: string) => {
    setActiveHeader((prev) => (prev === key ? null : key));
  };

  const handleActionClick = (action: string) => {
    console.log(`Action clicked: ${action}`);
    setMoreActionsOpen(false);
    setExportSubmenuOpen(false);
  };

  const handleItemClick = (item: Item) => {
    setSelectedItem(item);
    setEditFormData(item);
    setIsEditing(false);
  };

  const closeItemDetails = () => {
    setSelectedItem(null);
  };

  const formatPrice = (price?: number) => {
    if (!price) return "-";
    return `₹${price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
  };

  const getGstCode = (item: Item) => {
    return item.type === "Goods" ? item.hsnCode : item.sacCode;
  };

  const getItemType = (item: Item) => {
    if (item.salesEnabled && item.purchaseEnabled) {
      return "Sales and Purchase Items";
    } else if (item.salesEnabled) {
      return "Sales Items";
    } else if (item.purchaseEnabled) {
      return "Purchase Items";
    }
    return "Non-Inventory Items";
  };

  const getGSTDisplay = (item: Item) => {
    const intraRate = item.intraGST || 0;
    const interRate = item.interGST || 0;

    if (intraRate > 0 && interRate > 0) {
      return `GST ${intraRate}% + IGST ${interRate}%`;
    } else if (intraRate > 0) {
      return `GST ${intraRate}%`;
    } else if (interRate > 0) {
      return `IGST ${interRate}%`;
    }
    return "No GST";
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedItem) return;

    // Validate GST equality before saving
    if (editFormData.intraGST !== editFormData.interGST) {
      showToast("IntraGST and InterGST must be equal", "error");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/items/${selectedItem._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editFormData),
        }
      );

      if (response.ok) {
        const updatedItem = await response.json();
        setSelectedItem(updatedItem.data);
        setEditFormData(updatedItem.data);
        setIsEditing(false);
        showToast("Item updated successfully", "success");
        // Refresh the items list
        fetchItems();
      } else {
        console.error("Failed to update item");
        showToast("Failed to update item", "error");
      }
    } catch (error) {
      console.error("Error updating item:", error);
      showToast("Error updating item", "error");
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditFormData(selectedItem || {});
  };

  const handleEditInputChange = (field: keyof Item, value: any) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditInputChangeForGST = (
    field: "intraGST" | "interGST",
    value: number
  ) => {
    const newEditData = { ...editFormData, [field]: value };
    setEditFormData(newEditData);

    // Real-time validation for GST equality
    if (field === "intraGST" && newEditData.interGST !== value) {
      showToast("IntraGST and InterGST must be equal", "error");
    } else if (field === "interGST" && newEditData.intraGST !== value) {
      showToast("IntraGST and InterGST must be equal", "error");
    }
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

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render minimal list item
  const renderMinimalListItem = (item: Item) => (
    <div
      key={item._id}
      className={`p-4 cursor-pointer transition-colors ${
        selectedItem?._id === item._id
          ? "bg-blue-50 border-r-2 border-blue-500"
          : "hover:bg-gray-100"
      }`}
      onClick={() => handleItemClick(item)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            className="accent-blue-500"
            onClick={(e) => e.stopPropagation()}
          />
          <div>
            <span className="font-medium text-gray-900">{item.name}</span>
            {item.sku && (
              <div className="text-xs text-gray-500">{item.sku}</div>
            )}
          </div>
        </div>
        <span className="text-sm font-medium text-gray-600">
          {formatPrice(item.sellingPrice)}
        </span>
      </div>
    </div>
  );

  // Render table row
  const renderTableRow = (item: Item) => {
    const isSelected = selectedItem && selectedItem._id === item._id;
    return (
      <tr
        key={item._id}
        className={`border-t hover:bg-gray-50 cursor-pointer ${
          isSelected ? "bg-blue-50 border-r-2 border-blue-500" : ""
        }`}
        onClick={() => handleItemClick(item)}
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">{item.name}</span>
            {item.sku && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {item.sku}
              </span>
            )}
          </div>
        </td>
        <td className="px-4 py-3 text-sm">{item.purchaseDescription || "-"}</td>
        <td className="px-4 py-3 text-sm">{formatPrice(item.costPrice)}</td>
        <td className="px-4 py-3 text-sm">{item.description || "-"}</td>
        <td className="px-4 py-3 text-sm">{formatPrice(item.sellingPrice)}</td>
        <td className="px-4 py-3 text-sm">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              getGSTDisplay(item) === "No GST"
                ? "bg-gray-100 text-gray-600"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {getGSTDisplay(item)}
          </span>
        </td>
        <td className="px-4 py-3 text-sm">{item.unit || "-"}</td>
      </tr>
    );
  };

  if (loading) {
    return (
      <section className="w-full h-full overflow-auto bg-white text-sm">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600">Loading items...</span>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full h-full overflow-auto bg-white text-sm">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 mb-2">Error loading items</div>
            <div className="text-gray-600 text-sm mb-4">{error}</div>
            <button
              onClick={fetchItems}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full h-full overflow-auto bg-white text-sm">
      {/* Main Content Area */}
      <div className="flex h-full">
        {/* Left Panel - Items List/Table */}
        <div
          className={`${
            selectedItem ? "w-1/3" : "w-full"
          } border-r border-gray-200`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900">
                Active Items
              </h2>
              <ChevronDownIcon className="h-4 w-4 text-gray-500" />
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/items/new"
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm inline-block no-underline"
                title="Add New Item"
              >
                + New
              </Link>
              <button
                className="p-2 hover:bg-gray-100 rounded-md"
                title="More Actions"
              >
                <EllipsisVerticalIcon className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-4 bg-white border-b border-gray-200">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search in Items (/)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Items Content - Table or Minimal List */}
          {selectedItem ? (
            // Minimal List View when item is selected
            <div className="flex-1 overflow-y-auto">
              {filteredItems.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No items found
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredItems.map(renderMinimalListItem)}
                </div>
              )}
            </div>
          ) : (
            // Full Table View when no item is selected
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-gray-50 text-xs text-gray-600 uppercase border-b">
                  <tr>
                    <th className="px-4 py-3 cursor-pointer">
                      <button
                        onClick={() => handleHeaderClick("name")}
                        className={`flex items-center gap-2 ${
                          activeHeader === "name"
                            ? "text-blue-600 font-semibold"
                            : ""
                        }`}
                      >
                        <FunnelIcon className="h-4 w-4" />
                        <input
                          type="checkbox"
                          className="accent-blue-500"
                          aria-label="Select all items"
                          title="Select all items"
                        />
                        <span>NAME</span>
                      </button>
                    </th>
                    {[
                      {
                        key: "purchaseDescription",
                        label: "PURCHASE DESCRIPTION",
                      },
                      { key: "purchaseRate", label: "PURCHASE RATE" },
                      { key: "description", label: "DESCRIPTION" },
                      { key: "rate", label: "RATE" },
                      { key: "gst", label: "GST/IGST" },
                      { key: "unit", label: "USAGE UNIT" },
                    ].map(({ key, label }) => (
                      <th key={key} className="px-4 py-3 cursor-pointer">
                        <button
                          onClick={() => handleHeaderClick(key)}
                          className={`uppercase ${
                            activeHeader === key
                              ? "text-blue-600 font-semibold"
                              : ""
                          }`}
                        >
                          {label}
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center py-16 text-gray-500 text-base font-medium"
                      >
                        No items found. Create your first item to get started.
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map(renderTableRow)
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Panel - Item Details */}
        {selectedItem && (
          <div className="w-2/3 bg-white">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900">
                {selectedItem.name}
              </h1>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSaveEdit}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                      title="Save"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="border border-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-50"
                      title="Cancel"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleEditClick}
                    className="p-2 hover:bg-gray-100 rounded-md"
                    title="Edit"
                  >
                    <PencilIcon className="w-5 h-5 text-gray-600" />
                  </button>
                )}
                <button
                  className="p-2 hover:bg-gray-100 rounded-md"
                  title="More"
                >
                  <EllipsisVerticalIcon className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={closeItemDetails}
                  className="p-2 hover:bg-gray-100 rounded-md"
                  title="Close"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              {[
                { key: "overview", label: "Overview" },
                { key: "transactions", label: "Transactions" },
                { key: "history", label: "History" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === key
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === "overview" && (
                <div className="space-y-8">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-900">
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-2 gap-6 text-sm">
                      <div className="col-span-2">
                        <span className="text-gray-500">Item Name:</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.name || selectedItem.name || ""}
                            onChange={(e) =>
                              handleEditInputChange("name", e.target.value)
                            }
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter item name"
                          />
                        ) : (
                          <p className="font-medium mt-1">
                            {selectedItem.name}
                          </p>
                        )}
                      </div>
                      <div>
                        <span className="text-gray-500">Item Type:</span>
                        {isEditing ? (
                          <select
                            value={editFormData.type || selectedItem.type}
                            onChange={(e) =>
                              handleEditInputChange("type", e.target.value)
                            }
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="Goods">Goods</option>
                            <option value="Service">Service</option>
                          </select>
                        ) : (
                          <p className="font-medium mt-1">
                            {getItemType(selectedItem)}
                          </p>
                        )}
                      </div>
                      <div>
                        <span className="text-gray-500">Unit:</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.unit || selectedItem.unit || ""}
                            onChange={(e) =>
                              handleEditInputChange("unit", e.target.value)
                            }
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        ) : (
                          <p className="font-medium mt-1">
                            {selectedItem.unit || "pcs"}
                          </p>
                        )}
                      </div>
                      <div>
                        <span className="text-gray-500">
                          {selectedItem.type === "Goods"
                            ? "HSN Code:"
                            : "SAC Code:"}
                        </span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={
                              selectedItem.type === "Goods"
                                ? editFormData.hsnCode ||
                                  selectedItem.hsnCode ||
                                  ""
                                : editFormData.sacCode ||
                                  selectedItem.sacCode ||
                                  ""
                            }
                            onChange={(e) =>
                              handleEditInputChange(
                                selectedItem.type === "Goods"
                                  ? "hsnCode"
                                  : "sacCode",
                                e.target.value
                              )
                            }
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            maxLength={selectedItem.type === "Goods" ? 8 : 6}
                            placeholder={
                              selectedItem.type === "Goods"
                                ? "Enter HSN code (e.g., 9401)"
                                : "Enter SAC code (e.g., 998314)"
                            }
                          />
                        ) : (
                          <p className="font-medium mt-1">
                            {getGstCode(selectedItem) || "-"}
                          </p>
                        )}
                      </div>
                      <div>
                        <span className="text-gray-500">Status:</span>
                        <p className="font-medium mt-1">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              selectedItem.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {selectedItem.isActive ? "Active" : "Inactive"}
                          </span>
                        </p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500">Description:</span>
                        {isEditing ? (
                          <textarea
                            value={
                              editFormData.description ||
                              selectedItem.description ||
                              ""
                            }
                            onChange={(e) =>
                              handleEditInputChange(
                                "description",
                                e.target.value
                              )
                            }
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows={3}
                            placeholder="Enter general description..."
                          />
                        ) : (
                          <p className="font-medium mt-1">
                            {selectedItem.description || "-"}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Sales Information */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <input
                          type="checkbox"
                          checked={
                            editFormData.salesEnabled !== undefined
                              ? editFormData.salesEnabled
                              : selectedItem.salesEnabled
                          }
                          onChange={(e) =>
                            handleEditInputChange(
                              "salesEnabled",
                              e.target.checked
                            )
                          }
                          className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                        />
                      ) : null}
                      <h3 className="text-sm font-medium text-gray-900">
                        Sales Information
                      </h3>
                    </div>
                    {(isEditing
                      ? editFormData.salesEnabled !== undefined
                        ? editFormData.salesEnabled
                        : selectedItem.salesEnabled
                      : selectedItem.salesEnabled) && (
                      <div className="space-y-3 text-sm">
                        <div>
                          <span className="text-gray-500">Selling Price:</span>
                          {isEditing ? (
                            <input
                              type="number"
                              value={
                                editFormData.sellingPrice ||
                                selectedItem.sellingPrice ||
                                ""
                              }
                              onChange={(e) =>
                                handleEditInputChange(
                                  "sellingPrice",
                                  parseFloat(e.target.value)
                                )
                              }
                              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              step="0.01"
                              min="0"
                            />
                          ) : (
                            <p className="font-medium mt-1">
                              {formatPrice(selectedItem.sellingPrice)}
                            </p>
                          )}
                        </div>
                        <div>
                          <span className="text-gray-500">Sales Account:</span>
                          {isEditing ? (
                            <select
                              value={
                                editFormData.salesAccount ||
                                selectedItem.salesAccount
                              }
                              onChange={(e) =>
                                handleEditInputChange(
                                  "salesAccount",
                                  e.target.value
                                )
                              }
                              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="Sales">Sales</option>
                              <option value="Services">Services</option>
                              <option value="Other Income">Other Income</option>
                            </select>
                          ) : (
                            <p className="font-medium mt-1">
                              {selectedItem.salesAccount}
                            </p>
                          )}
                        </div>
                        <div>
                          <span className="text-gray-500">Description:</span>
                          {isEditing ? (
                            <textarea
                              value={
                                editFormData.salesDescription ||
                                selectedItem.salesDescription ||
                                ""
                              }
                              onChange={(e) =>
                                handleEditInputChange(
                                  "salesDescription",
                                  e.target.value
                                )
                              }
                              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              rows={3}
                            />
                          ) : (
                            <p className="font-medium mt-1">
                              {selectedItem.salesDescription ||
                                "Metal card with engraved design"}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Purchase Information */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <input
                          type="checkbox"
                          checked={
                            editFormData.purchaseEnabled !== undefined
                              ? editFormData.purchaseEnabled
                              : selectedItem.purchaseEnabled
                          }
                          onChange={(e) =>
                            handleEditInputChange(
                              "purchaseEnabled",
                              e.target.checked
                            )
                          }
                          className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                        />
                      ) : null}
                      <h3 className="text-sm font-medium text-gray-900">
                        Purchase Information
                      </h3>
                    </div>
                    {(isEditing
                      ? editFormData.purchaseEnabled !== undefined
                        ? editFormData.purchaseEnabled
                        : selectedItem.purchaseEnabled
                      : selectedItem.purchaseEnabled) && (
                      <div className="space-y-3 text-sm">
                        <div>
                          <span className="text-gray-500">Cost Price:</span>
                          {isEditing ? (
                            <input
                              type="number"
                              value={
                                editFormData.costPrice ||
                                selectedItem.costPrice ||
                                ""
                              }
                              onChange={(e) =>
                                handleEditInputChange(
                                  "costPrice",
                                  parseFloat(e.target.value)
                                )
                              }
                              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              step="0.01"
                              min="0"
                            />
                          ) : (
                            <p className="font-medium mt-1">
                              {formatPrice(selectedItem.costPrice)}
                            </p>
                          )}
                        </div>
                        <div>
                          <span className="text-gray-500">
                            Purchase Account:
                          </span>
                          {isEditing ? (
                            <select
                              value={
                                editFormData.purchaseAccount ||
                                selectedItem.purchaseAccount
                              }
                              onChange={(e) =>
                                handleEditInputChange(
                                  "purchaseAccount",
                                  e.target.value
                                )
                              }
                              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="Cost of Goods Sold">
                                Cost of Goods Sold
                              </option>
                              <option value="Purchase">Purchase</option>
                              <option value="Expenses">Expenses</option>
                            </select>
                          ) : (
                            <p className="font-medium mt-1">
                              {selectedItem.purchaseAccount}
                            </p>
                          )}
                        </div>
                        <div>
                          <span className="text-gray-500">Description:</span>
                          {isEditing ? (
                            <textarea
                              value={
                                editFormData.purchaseDescription ||
                                selectedItem.purchaseDescription ||
                                ""
                              }
                              onChange={(e) =>
                                handleEditInputChange(
                                  "purchaseDescription",
                                  e.target.value
                                )
                              }
                              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              rows={3}
                            />
                          ) : (
                            <p className="font-medium mt-1">
                              {selectedItem.purchaseDescription ||
                                "Very eye appealing."}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Additional Information */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-900">
                      Additional Information
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-gray-500">Preferred Vendor:</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={
                              editFormData.preferredVendor ||
                              selectedItem.preferredVendor ||
                              ""
                            }
                            onChange={(e) =>
                              handleEditInputChange(
                                "preferredVendor",
                                e.target.value
                              )
                            }
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        ) : (
                          <p className="font-medium mt-1">
                            {selectedItem.preferredVendor || "-"}
                          </p>
                        )}
                      </div>
                      <div>
                        <span className="text-gray-500">Current Stock:</span>
                        {isEditing ? (
                          <input
                            type="number"
                            value={
                              editFormData.currentStock ||
                              selectedItem.currentStock ||
                              0
                            }
                            onChange={(e) =>
                              handleEditInputChange(
                                "currentStock",
                                parseInt(e.target.value)
                              )
                            }
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            min="0"
                          />
                        ) : (
                          <p className="font-medium mt-1">
                            {selectedItem.currentStock || 0}
                          </p>
                        )}
                      </div>
                      <div>
                        <span className="text-gray-500">Reorder Point:</span>
                        {isEditing ? (
                          <input
                            type="number"
                            value={
                              editFormData.reorderPoint ||
                              selectedItem.reorderPoint ||
                              0
                            }
                            onChange={(e) =>
                              handleEditInputChange(
                                "reorderPoint",
                                parseInt(e.target.value)
                              )
                            }
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            min="0"
                          />
                        ) : (
                          <p className="font-medium mt-1">
                            {selectedItem.reorderPoint || 0}
                          </p>
                        )}
                      </div>
                      <div>
                        <span className="text-gray-500">GST Rate:</span>
                        {isEditing ? (
                          <input
                            type="number"
                            value={
                              editFormData.gstRate || selectedItem.gstRate || 18
                            }
                            onChange={(e) =>
                              handleEditInputChange(
                                "gstRate",
                                parseFloat(e.target.value)
                              )
                            }
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            min="0"
                            max="100"
                            step="0.01"
                          />
                        ) : (
                          <p className="font-medium mt-1">
                            {selectedItem.gstRate || 18}%
                          </p>
                        )}
                      </div>
                      <div>
                        <span className="text-gray-500">GST Type:</span>
                        {isEditing ? (
                          <div className="mt-2 space-y-2">
                            <label className="flex items-center gap-2 text-sm">
                              <span>IntraGST (%)</span>
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={
                                  editFormData.intraGST !== undefined
                                    ? editFormData.intraGST
                                    : selectedItem.intraGST || 0
                                }
                                onChange={(e) =>
                                  handleEditInputChangeForGST(
                                    "intraGST",
                                    Number(e.target.value)
                                  )
                                }
                                className="w-24 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                              <span>InterGST (%)</span>
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={
                                  editFormData.interGST !== undefined
                                    ? editFormData.interGST
                                    : selectedItem.interGST || 0
                                }
                                onChange={(e) =>
                                  handleEditInputChangeForGST(
                                    "interGST",
                                    Number(e.target.value)
                                  )
                                }
                                className="w-24 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </label>
                          </div>
                        ) : (
                          <p className="font-medium mt-1">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                getGSTDisplay(selectedItem) === "No GST"
                                  ? "bg-gray-100 text-gray-600"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {getGSTDisplay(selectedItem)}
                            </span>
                          </p>
                        )}
                      </div>
                      <div>
                        <span className="text-gray-500">SKU:</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.sku || selectedItem.sku || ""}
                            onChange={(e) =>
                              handleEditInputChange("sku", e.target.value)
                            }
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        ) : (
                          <p className="font-medium mt-1">
                            {selectedItem.sku || "-"}
                          </p>
                        )}
                      </div>
                      <div>
                        <span className="text-gray-500">Barcode:</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={
                              editFormData.barcode || selectedItem.barcode || ""
                            }
                            onChange={(e) =>
                              handleEditInputChange("barcode", e.target.value)
                            }
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        ) : (
                          <p className="font-medium mt-1">
                            {selectedItem.barcode || "-"}
                          </p>
                        )}
                      </div>
                      <div>
                        <span className="text-gray-500">Category:</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={
                              editFormData.category ||
                              selectedItem.category ||
                              ""
                            }
                            onChange={(e) =>
                              handleEditInputChange("category", e.target.value)
                            }
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        ) : (
                          <p className="font-medium mt-1">
                            {selectedItem.category || "-"}
                          </p>
                        )}
                      </div>
                      <div>
                        <span className="text-gray-500">Brand:</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={
                              editFormData.brand || selectedItem.brand || ""
                            }
                            onChange={(e) =>
                              handleEditInputChange("brand", e.target.value)
                            }
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        ) : (
                          <p className="font-medium mt-1">
                            {selectedItem.brand || "-"}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* System Information */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-900">
                      System Information
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-gray-500">Created By:</span>
                        <p className="font-medium mt-1">system</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Created On:</span>
                        <p className="font-medium mt-1">
                          {new Date(selectedItem.createdAt).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Last Modified By:</span>
                        <p className="font-medium mt-1">system</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Last Modified On:</span>
                        <p className="font-medium mt-1">
                          {new Date(selectedItem.updatedAt).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "transactions" && (
                <div className="space-y-4">
                  {/* Filters */}
                  <div className="flex gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Filter By:
                      </label>
                      <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                        <option>Quotes</option>
                        <option>Invoices</option>
                        <option>Bills</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status:
                      </label>
                      <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                        <option>All</option>
                        <option>Draft</option>
                        <option>Sent</option>
                        <option>Paid</option>
                      </select>
                    </div>
                  </div>

                  {/* No Data Message */}
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">There are no quotes</p>
                  </div>
                </div>
              )}

              {activeTab === "history" && (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            DATE
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            DETAILS
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            06/08/2025 12:13 PM
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            created by - Try
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
