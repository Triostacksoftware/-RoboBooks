// client/src/app/dashboard/components/header/AllZohoAppsPanel.tsx
"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  XMarkIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import {
  ChartPieIcon,
  InboxIcon,
  Squares2X2Icon,
  ShoppingBagIcon,
  CurrencyRupeeIcon,
} from "@heroicons/react/24/solid";
import { ReceiptPercentIcon } from "@heroicons/react/24/outline";

interface AppEntry {
  id: string;
  name: string;
  description: string;
  category: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const APPS: AppEntry[] = [
  {
    id: "expense",
    name: "Zoho Expense",
    description: "Expense Reporting Software",
    category: "Finance Apps",
    Icon: ReceiptPercentIcon,
  },
  {
    id: "billing",
    name: "Zoho Billing",
    description: "End-to-end Billing Solution",
    category: "Finance Apps",
    Icon: CurrencyRupeeIcon,
  },
  {
    id: "inventory",
    name: "Zoho Inventory",
    description: "Order & Inventory Management Software",
    category: "Finance Apps",
    Icon: ShoppingBagIcon,
  },
  {
    id: "checkout",
    name: "Zoho Checkout",
    description: "One-time & recurring payments software",
    category: "Finance Apps",
    Icon: ChartPieIcon,
  },
  {
    id: "crm",
    name: "Zoho CRM",
    description: "Customer Relationship Management",
    category: "Sales",
    Icon: InboxIcon,
  },
  {
    id: "projects",
    name: "Zoho Projects",
    description: "Project Management Software",
    category: "Project Management",
    Icon: Squares2X2Icon,
  },
  // …add more apps here…
];

const OTHER_CATEGORIES = Array.from(
  new Set(
    APPS.filter((a) => a.category !== "Finance Apps").map((a) => a.category)
  )
);

export default function AllZohoAppsPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [otherCat, setOtherCat] = useState(OTHER_CATEGORIES[0]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  // filter by category & search
  const financeApps = APPS.filter(
    (a) =>
      a.category === "Finance Apps" &&
      a.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const otherApps = APPS.filter(
    (a) =>
      a.category === otherCat &&
      a.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return createPortal(
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed top-14 right-0 bottom-0 w-[90vw] max-w-[400px] bg-white shadow-2xl flex flex-col z-50">
        {/* HEADER + COLLAPSIBLE SEARCH */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-lg font-medium">All Zoho Apps</h2>
          <div className="flex items-center space-x-2">
            {!searchOpen ? (
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
                aria-label="Open search"
              >
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-600" />
              </button>
            ) : (
              <div className="flex items-center border border-blue-500 rounded-full px-3 py-1 bg-white transition">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="ml-2 w-36 bg-transparent placeholder-gray-400 focus:outline-none"
                />
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSearchOpen(false);
                  }}
                  className="ml-2 p-1 hover:bg-gray-200 rounded-full transition"
                  aria-label="Close search"
                >
                  <XMarkIcon className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition"
              aria-label="Close panel"
            >
              <XMarkIcon className="w-5 h-5 text-red-500" />
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-6">
          {/* Finance Apps */}
          <section>
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Finance Apps
            </h3>
            <div className="space-y-3">
              {financeApps.map((app) => (
                <a
                  key={app.id}
                  href={`/${app.id}`}
                  className="
          relative 
          flex items-center justify-between
          bg-white border border-gray-200 rounded-lg p-4
          hover:bg-blue-50 transition
          group
        "
                >
                  {/* Left icon + text */}
                  <div className="flex items-center space-x-3">
                    <app.Icon className="w-6 h-6 text-blue-600" />
                    <div>
                      <div className="font-medium text-gray-800">
                        {app.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {app.description}
                      </div>
                    </div>
                  </div>

                  {/* Chevron appears only on hover */}
                  <ChevronRightIcon
                    className="
            absolute right-4 top-1/2 -translate-y-1/2
            w-5 h-5 text-blue-600
            opacity-0 group-hover:opacity-100
            transition-opacity
          "
                  />
                </a>
              ))}
            </div>
          </section>

          {/* Other Apps */}
          <section>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-gray-500 uppercase">
                Other Apps
              </h3>
              <button
                onClick={() => setShowDropdown((v) => !v)}
                className="flex items-center text-sm text-gray-700 hover:text-gray-900 transition"
              >
                <span>{otherCat}</span>
                {showDropdown ? (
                  <ChevronUpIcon className="w-4 h-4 ml-1" />
                ) : (
                  <ChevronDownIcon className="w-4 h-4 ml-1" />
                )}
              </button>
            </div>

            {showDropdown && (
              <ul className="mt-1 bg-white border border-gray-200 rounded shadow-sm text-sm">
                {OTHER_CATEGORIES.map((cat) => (
                  <li key={cat}>
                    <button
                      onClick={() => {
                        setOtherCat(cat);
                        setShowDropdown(false);
                      }}
                      className={`block w-full text-left px-3 py-2 hover:bg-blue-50 ${
                        cat === otherCat ? "bg-blue-100 font-medium" : ""
                      } transition`}
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-4 grid grid-cols-2 gap-3">
              {otherApps.map((app) => (
                <a
                  key={app.id}
                  href={`/${app.id}`}
                  className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <app.Icon className="w-6 h-6 text-green-600" />
                  <div>
                    <div className="font-medium text-gray-800">{app.name}</div>
                    <div className="text-xs text-gray-500">
                      {app.description}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>,
    document.body
  );
}
