/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
import { Vendor, vendorService } from "@/services/vendorService";

const filters = ["All", "Active", "Inactive", "Business", "Individual"];

export default function VendorsSection() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [moreActionsOpen, setMoreActionsOpen] = useState(false);
  const [exportSubmenuOpen, setExportSubmenuOpen] = useState(false);
  const [selectedView, setSelectedView] = useState("All Vendors");
  const [activeHeader, setActiveHeader] = useState<string | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "comments" | "transactions" | "mails" | "statement"
  >("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const dropdownRef = useRef<HTMLDivElement>(null);
  const moreActionsRef = useRef<HTMLDivElement>(null);

  // Fetch vendors from backend
  const fetchVendors = async () => {
    try {
      setLoading(true);
      setError(null);
      const vendorsData = await vendorService.getVendors();
      setVendors(vendorsData);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      setError("Failed to fetch vendors. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Load vendors on component mount
  useEffect(() => {
    fetchVendors();
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
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleHeaderClick = (key: string) => {
    setActiveHeader(activeHeader === key ? null : key);
  };

  const handleActionClick = (action: string) => {
    console.log("Action clicked:", action);
    setMoreActionsOpen(false);
  };

  const handleVendorClick = (vendor: Vendor) => {
    setSelectedVendor(vendor);
  };

  const closeVendorDetails = () => {
    setSelectedVendor(null);
  };

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return "₹0.00";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const getVendorType = (vendor: Vendor) => {
    return vendor.type || "Business";
  };

  const getVendorName = (vendor: Vendor) => {
    if (vendor.companyName) {
      return vendor.companyName;
    }
    return vendor.name;
  };

  const renderMinimalListItem = (vendor: Vendor) => (
    <div
      key={vendor._id}
      className="flex items-center justify-between p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
      onClick={() => handleVendorClick(vendor)}
    >
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-blue-600 font-semibold text-sm">
            {getVendorName(vendor).charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{getVendorName(vendor)}</h3>
          <p className="text-sm text-gray-500">{vendor.email || "No email"}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-gray-900">
          {formatCurrency(vendor.payables || 0)}
        </p>
        <p className="text-xs text-gray-500">{getVendorType(vendor)}</p>
      </div>
    </div>
  );

  const renderTableRow = (vendor: Vendor) => (
    <tr
      key={vendor._id}
      className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
      onClick={() => handleVendorClick(vendor)}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-blue-600 font-semibold text-xs">
              {getVendorName(vendor).charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">
              {getVendorName(vendor)}
            </div>
            <div className="text-sm text-gray-500">{vendor.gstin}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {vendor.companyName || getVendorName(vendor)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {vendor.email || "No email"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {vendor.phone || "No phone"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {formatCurrency(vendor.payables || 0)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {formatCurrency(vendor.unusedCredits || 0)}
      </td>
    </tr>
  );

  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch =
      vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (vendor.email &&
        vendor.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (vendor.gstin &&
        vendor.gstin.toLowerCase().includes(searchQuery.toLowerCase()));

    if (selectedView === "All Vendors") return matchesSearch;
    if (selectedView === "Active")
      return matchesSearch && vendor.status !== "inactive";
    if (selectedView === "Inactive")
      return matchesSearch && vendor.status === "inactive";
    if (selectedView === "Business")
      return matchesSearch && vendor.type === "business";
    if (selectedView === "Individual")
      return matchesSearch && vendor.type === "individual";

    return matchesSearch;
  });

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
            onClick={fetchVendors}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 text-lg font-semibold text-gray-900 hover:text-gray-700"
              >
                <span>{selectedView}</span>
                <ChevronDownIcon className="h-5 w-5" />
              </button>
              {dropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  {filters.map((filter) => (
                    <button
                      key={filter}
                      onClick={() => {
                        setSelectedView(
                          filter + (filter === "All" ? " Vendors" : "")
                        );
                        setDropdownOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {filter + (filter === "All" ? " Vendors" : "")}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchVendors}
              className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              <svg
                className="h-4 w-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>
            <Link
              href="/dashboard/purchases/vendors/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              New Vendor
            </Link>
            <div className="relative" ref={moreActionsRef}>
              <button
                onClick={() => setMoreActionsOpen(!moreActionsOpen)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <EllipsisVerticalIcon className="h-5 w-5" />
              </button>
              {moreActionsOpen && (
                <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  <button
                    onClick={() => handleActionClick("export")}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Export
                  </button>
                  <button
                    onClick={() => handleActionClick("import")}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Import
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search vendors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <button className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900">
            <FunnelIcon className="h-4 w-4" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Vendors List */}
      <div className="px-6 py-4">
        {vendors.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <PlusIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No vendors yet
            </h3>
            <p className="text-gray-500 mb-6">
              Get started by adding your first vendor to track purchases and
              expenses.
            </p>
            <Link
              href="/dashboard/purchases/vendors/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Your First Vendor
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payables (BCY)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unused Credits (BCY)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredVendors.map(renderTableRow)}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Vendor Details Modal */}
      {selectedVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {getVendorName(selectedVendor)}
                </h2>
                <button
                  onClick={closeVendorDetails}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Vendor Information
                  </h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Name
                      </dt>
                      <dd className="text-sm text-gray-900">
                        {selectedVendor.name}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        GSTIN
                      </dt>
                      <dd className="text-sm text-gray-900">
                        {selectedVendor.gstin}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Email
                      </dt>
                      <dd className="text-sm text-gray-900">
                        {selectedVendor.email || "Not provided"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Phone
                      </dt>
                      <dd className="text-sm text-gray-900">
                        {selectedVendor.phone || "Not provided"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Address
                      </dt>
                      <dd className="text-sm text-gray-900">
                        {selectedVendor.address || "Not provided"}
                      </dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Financial Summary
                  </h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Total Payables
                      </dt>
                      <dd className="text-sm text-gray-900">
                        {formatCurrency(selectedVendor.payables || 0)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Unused Credits
                      </dt>
                      <dd className="text-sm text-gray-900">
                        {formatCurrency(selectedVendor.unusedCredits || 0)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Vendor Type
                      </dt>
                      <dd className="text-sm text-gray-900">
                        {getVendorType(selectedVendor)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Status
                      </dt>
                      <dd className="text-sm text-gray-900">
                        {selectedVendor.status || "Active"}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={closeVendorDetails}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={async () => {
                  if (confirm("Are you sure you want to delete this vendor?")) {
                    try {
                      await vendorService.deleteVendor(selectedVendor._id);
                      setVendors(
                        vendors.filter((v) => v._id !== selectedVendor._id)
                      );
                      closeVendorDetails();
                      // Using toast notification instead of alert
                      const event = new CustomEvent("showToast", {
                        detail: {
                          message: "Vendor deleted successfully!",
                          type: "success",
                        },
                      });
                      window.dispatchEvent(event);
                    } catch (error) {
                      console.error("Error deleting vendor:", error);
                      // Using toast notification instead of alert
                      const event = new CustomEvent("showToast", {
                        detail: {
                          message: "Failed to delete vendor. Please try again.",
                          type: "error",
                        },
                      });
                      window.dispatchEvent(event);
                    }
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
              >
                Delete Vendor
              </button>
              <Link
                href={`/dashboard/purchases/vendors/${selectedVendor._id}/edit`}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                Edit Vendor
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
