"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ChevronDownIcon,
  XMarkIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { createPortal } from "react-dom";
import { organizationService } from "../../../../services/organizationService";

// --- Helper hooks & portal ---
function useKey(key: string, callback: () => void, when = true) {
  useEffect(() => {
    if (!when) return;
    function handler(e: KeyboardEvent) {
      if (e.key === key) callback();
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [key, callback, when]);
}

function Portal({ children }: { children: React.ReactNode }) {
  return createPortal(children, document.body);
}

// --- Data model ---
interface Org {
  id: string;
  name: string;
  tier: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface AddOrgFormData {
  name: string;
  tier: "Standard" | "Premium" | "Enterprise";
}

// --- Component ---
export default function OrgSwitcher() {
  const [open, setOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [organizations, setOrganizations] = useState<Org[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeOrg, setActiveOrg] = useState<Org | null>(null);
  const [addFormData, setAddFormData] = useState<AddOrgFormData>({
    name: "",
    tier: "Standard",
  });
  const ref = useRef<HTMLDivElement>(null);

  // Load organizations on component mount
  useEffect(() => {
    loadOrganizations();
  }, []);

  // close on Escape
  useKey(
    "Escape",
    () => {
      setOpen(false);
      setShowAddForm(false);
    },
    open || showAddForm
  );

  // close on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setShowAddForm(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  // Load organizations from API
  const loadOrganizations = async () => {
    setLoading(true);
    try {
      const response = await organizationService.getOrganizations();
      setOrganizations(response.data || []);

      // Find active organization
      const active = response.data?.find((org: Org) => org.active);
      setActiveOrg(active || null);
    } catch (error) {
      console.error("Failed to load organizations:", error);
      setOrganizations([]);
      setActiveOrg(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle organization selection
  const handleOrgSelect = async (org: Org) => {
    try {
      await organizationService.setActiveOrganization(org.id);

      // Update local state
      setOrganizations((prev) =>
        prev.map((o) => ({ ...o, active: o.id === org.id }))
      );
      setActiveOrg(org);
      setOpen(false);

      // Optionally reload the page to reflect changes
      window.location.reload();
    } catch (error) {
      console.error("Failed to set active organization:", error);
    }
  };

  // Handle add organization form submission
  const handleAddOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addFormData.name.trim()) return;

    setLoading(true);
    try {
      const response = await organizationService.createOrganization({
        name: addFormData.name.trim(),
        tier: addFormData.tier,
        active: organizations.length === 0, // Make first org active
      });

      // Add to local state
      const newOrg = response.data;
      setOrganizations((prev) => [...prev, newOrg]);

      // If this is the first org, make it active
      if (organizations.length === 0) {
        setActiveOrg(newOrg);
      }

      // Reset form and close
      setAddFormData({ name: "", tier: "Standard" });
      setShowAddForm(false);
    } catch (error) {
      console.error("Failed to create organization:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleFormChange = (field: keyof AddOrgFormData, value: string) => {
    setAddFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <>
      {/* trigger */}
      <div className="relative inline-block">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center text-white text-sm font-medium hover:text-gray-200 transition"
        >
          <span>{activeOrg?.name || "Select Organization"}</span>
          <ChevronDownIcon
            className={`w-4 h-4 ml-1 transition-transform ${
              open ? "rotate-180" : "rotate-0"
            }`}
          />
        </button>
      </div>

      {/* panel */}
      {open && (
        <Portal>
          {/* backdrop */}
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setOpen(false)}
          />

          {/* slide-out */}
          <div
            ref={ref}
            className="fixed right-0 top-14 z-50 w-80 h-[calc(100%-3.5rem)] bg-white rounded-l-2xl shadow-2xl flex flex-col"
          >
            {/* header */}
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">
                Organizations
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded hover:bg-gray-100"
              >
                <XMarkIcon className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Add Organization button */}
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-5 py-3 text-sm text-blue-700 hover:bg-blue-50 border-b"
            >
              <PlusIcon className="w-4 h-4" />
              Add Organization
            </button>

            {/* list */}
            <div className="flex-1 overflow-auto px-5 py-4 space-y-3">
              {loading ? (
                <div className="text-center py-8">
                  <div className="text-sm text-gray-500">
                    Loading organizations...
                  </div>
                </div>
              ) : organizations.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-sm text-gray-500">
                    No organizations found
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Click "Add Organization" to get started
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-sm font-medium text-gray-600">
                    My Organizations
                  </div>
                  <div className="space-y-2">
                    {organizations.map((org) => (
                      <div
                        key={org.id}
                        className={clsx(
                          "flex items-center justify-between p-3 rounded-lg border transition cursor-pointer",
                          org.active
                            ? "bg-blue-50 border-blue-200 hover:bg-blue-100"
                            : "border-gray-200 hover:bg-gray-50"
                        )}
                        onClick={() => handleOrgSelect(org)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            {org.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-800">
                              {org.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              Organization ID: {org.id} · {org.tier}
                            </span>
                          </div>
                        </div>
                        {org.active && (
                          <CheckCircleIcon className="w-5 h-5 text-sky-600" />
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </Portal>
      )}

      {/* Add Organization Form Modal */}
      {showAddForm && (
        <Portal>
          {/* backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowAddForm(false)}
          />

          {/* modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
              {/* header */}
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-800">
                  Add New Organization
                </h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="p-2 rounded hover:bg-gray-100"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* form */}
              <form onSubmit={handleAddOrganization} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={addFormData.name}
                    onChange={(e) => handleFormChange("name", e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter organization name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tier
                  </label>
                  <select
                    value={addFormData.tier}
                    onChange={(e) =>
                      handleFormChange(
                        "tier",
                        e.target.value as "Standard" | "Premium" | "Enterprise"
                      )
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Premium">Premium</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </div>

                {/* footer */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !addFormData.name.trim()}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? "Creating..." : "Create Organization"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Portal>
      )}
    </>
  );
}
