"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  XMarkIcon,
  BuildingLibraryIcon,
  DocumentChartBarIcon,
  BanknotesIcon,
  ShoppingBagIcon,
  InboxIcon,
  TagIcon,
  BellIcon,
  BoltIcon,
  CubeTransparentIcon,
  ChartBarIcon,
  ShareIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

type Link = { label: string; to: string };

interface Category {
  id: string;
  title: string;
  color: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  links: Link[];
}

const CATEGORIES: Category[] = [
  {
    id: "org",
    title: "Organization",
    color: "#1DBF73",
    Icon: BuildingLibraryIcon,
    links: [
      { label: "Profile", to: "/settings/organization/profile" },
      { label: "Branding", to: "/settings/organization/branding" },
      { label: "Custom Domain", to: "/settings/organization/domain" },
      { label: "Locations", to: "/settings/organization/locations" },
      { label: "Currencies", to: "/settings/organization/currencies" },
      { label: "Opening Balances", to: "/settings/organization/balances" },
      {
        label: "Manage Subscription",
        to: "/settings/organization/subscription",
      },
    ],
  },
  {
    id: "tax",
    title: "Taxes & Compliance",
    color: "#EC5D5D",
    Icon: DocumentChartBarIcon,
    links: [
      { label: "Profile", to: "/settings/organization/profile" },
      { label: "Branding", to: "/settings/organization/branding" },
      { label: "Custom Domain", to: "/settings/organization/domain" },
      { label: "Locations", to: "/settings/organization/locations" },
      { label: "Currencies", to: "/settings/organization/currencies" },
      { label: "Opening Balances", to: "/settings/organization/balances" },
      {
        label: "Manage Subscription",
        to: "/settings/organization/subscription",
      },
    ],
  },
  {
    id: "prefs",
    title: "Preferences",
    color: "#FFB238",
    Icon: BanknotesIcon,
    links: [
      { label: "Profile", to: "/settings/organization/profile" },
      { label: "Branding", to: "/settings/organization/branding" },
      { label: "Custom Domain", to: "/settings/organization/domain" },
      { label: "Locations", to: "/settings/organization/locations" },
      { label: "Currencies", to: "/settings/organization/currencies" },
      { label: "Opening Balances", to: "/settings/organization/balances" },
      {
        label: "Manage Subscription",
        to: "/settings/organization/subscription",
      },
    ],
  },
  {
    id: "sales",
    title: "Sales",
    color: "#377DFF",
    Icon: ShoppingBagIcon,
    links: [
      { label: "Profile", to: "/settings/organization/profile" },
      { label: "Branding", to: "/settings/organization/branding" },
      { label: "Custom Domain", to: "/settings/organization/domain" },
      { label: "Locations", to: "/settings/organization/locations" },
      { label: "Currencies", to: "/settings/organization/currencies" },
      { label: "Opening Balances", to: "/settings/organization/balances" },
      {
        label: "Manage Subscription",
        to: "/settings/organization/subscription",
      },
    ],
  },
  {
    id: "purchases",
    title: "Purchases",
    color: "#00A300",
    Icon: InboxIcon,
    links: [
      { label: "Profile", to: "/settings/organization/profile" },
      { label: "Branding", to: "/settings/organization/branding" },
      { label: "Custom Domain", to: "/settings/organization/domain" },
      { label: "Locations", to: "/settings/organization/locations" },
      { label: "Currencies", to: "/settings/organization/currencies" },
      { label: "Opening Balances", to: "/settings/organization/balances" },
      {
        label: "Manage Subscription",
        to: "/settings/organization/subscription",
      },
    ],
  },

  // ← NEW BELOW (and we removed the old "Help Desk & Customer Support")
  {
    id: "items",
    title: "Items",
    color: "#EC5D5D",
    Icon: InboxIcon,
    links: [
      { label: "Profile", to: "/settings/organization/profile" },
      { label: "Branding", to: "/settings/organization/branding" },
      { label: "Custom Domain", to: "/settings/organization/domain" },
      { label: "Locations", to: "/settings/organization/locations" },
      { label: "Currencies", to: "/settings/organization/currencies" },
      { label: "Opening Balances", to: "/settings/organization/balances" },
      {
        label: "Manage Subscription",
        to: "/settings/organization/subscription",
      },
    ],
  },
  {
    id: "onlinePayments",
    title: "Online Payments",
    color: "#F9B849",
    Icon: BanknotesIcon,
    links: [
      { label: "Profile", to: "/settings/organization/profile" },
      { label: "Branding", to: "/settings/organization/branding" },
      { label: "Custom Domain", to: "/settings/organization/domain" },
      { label: "Locations", to: "/settings/organization/locations" },
      { label: "Currencies", to: "/settings/organization/currencies" },
      { label: "Opening Balances", to: "/settings/organization/balances" },
      {
        label: "Manage Subscription",
        to: "/settings/organization/subscription",
      },
    ],
  },
  {
    id: "customisation",
    title: "Customisation",
    color: "#FFB238",
    Icon: TagIcon,
    links: [
      { label: "Profile", to: "/settings/organization/profile" },
      { label: "Branding", to: "/settings/organization/branding" },
      { label: "Custom Domain", to: "/settings/organization/domain" },
      { label: "Locations", to: "/settings/organization/locations" },
      { label: "Currencies", to: "/settings/organization/currencies" },
      { label: "Opening Balances", to: "/settings/organization/balances" },
      {
        label: "Manage Subscription",
        to: "/settings/organization/subscription",
      },
    ],
  },
  {
    id: "reminders",
    title: "Reminders & Notifications",
    color: "#377DFF",
    Icon: BellIcon,
    links: [
      { label: "Profile", to: "/settings/organization/profile" },
      { label: "Branding", to: "/settings/organization/branding" },
      { label: "Custom Domain", to: "/settings/organization/domain" },
      { label: "Locations", to: "/settings/organization/locations" },
      { label: "Currencies", to: "/settings/organization/currencies" },
      { label: "Opening Balances", to: "/settings/organization/balances" },
      {
        label: "Manage Subscription",
        to: "/settings/organization/subscription",
      },
    ],
  },
  {
    id: "automation",
    title: "Automation",
    color: "#EC5D5D",
    Icon: BoltIcon,
    links: [
      { label: "Profile", to: "/settings/organization/profile" },
      { label: "Branding", to: "/settings/organization/branding" },
      { label: "Custom Domain", to: "/settings/organization/domain" },
      { label: "Locations", to: "/settings/organization/locations" },
      { label: "Currencies", to: "/settings/organization/currencies" },
      { label: "Opening Balances", to: "/settings/organization/balances" },
      {
        label: "Manage Subscription",
        to: "/settings/organization/subscription",
      },
    ],
  },
  {
    id: "customModules",
    title: "Custom Modules",
    color: "#5E5CE6",
    Icon: CubeTransparentIcon,
    links: [
      { label: "Profile", to: "/settings/organization/profile" },
      { label: "Branding", to: "/settings/organization/branding" },
      { label: "Custom Domain", to: "/settings/organization/domain" },
      { label: "Locations", to: "/settings/organization/locations" },
      { label: "Currencies", to: "/settings/organization/currencies" },
      { label: "Opening Balances", to: "/settings/organization/balances" },
      {
        label: "Manage Subscription",
        to: "/settings/organization/subscription",
      },
    ],
  },
  {
    id: "developerData",
    title: "Developer & Data",
    color: "#377DFF",
    Icon: ChartBarIcon,
    links: [
      { label: "Profile", to: "/settings/organization/profile" },
      { label: "Branding", to: "/settings/organization/branding" },
      { label: "Custom Domain", to: "/settings/organization/domain" },
      { label: "Locations", to: "/settings/organization/locations" },
      { label: "Currencies", to: "/settings/organization/currencies" },
      { label: "Opening Balances", to: "/settings/organization/balances" },
      {
        label: "Manage Subscription",
        to: "/settings/organization/subscription",
      },
    ],
  },
  {
    id: "integrations",
    title: "Integrations & Marketplace",
    color: "#26A69A",
    Icon: ShareIcon,
    links: [
      { label: "Profile", to: "/settings/organization/profile" },
      { label: "Branding", to: "/settings/organization/branding" },
      { label: "Custom Domain", to: "/settings/organization/domain" },
      { label: "Locations", to: "/settings/organization/locations" },
      { label: "Currencies", to: "/settings/organization/currencies" },
      { label: "Opening Balances", to: "/settings/organization/balances" },
      {
        label: "Manage Subscription",
        to: "/settings/organization/subscription",
      },
    ],
  },
];

export default function SettingsPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  // bounding-box state for header/sidebar/utils
  const [layout, setLayout] = useState<null | {
    header: DOMRect;
    sidebar: DOMRect;
    utils: DOMRect;
  }>(null);

  // search term state
  const [searchTerm, setSearchTerm] = useState("");

  // on open, grab the three regions
  useEffect(() => {
    if (!open) return;
    const headerEl = document.querySelector("[data-settings-header]");
    const sideEl = document.querySelector("[data-settings-sidebar]");
    const utilEl = document.querySelector("[data-settings-utils]");
    if (headerEl && sideEl && utilEl) {
      setLayout({
        header: headerEl.getBoundingClientRect(),
        sidebar: sideEl.getBoundingClientRect(),
        utils: utilEl.getBoundingClientRect(),
      });
    }
  }, [open]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/20 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* positioned between header, sidebar, utils */}
          {layout && (
            <motion.div
              className="absolute bg-white z-50 flex flex-col"
              style={{
                top: layout.header.bottom + "px",
                left: layout.sidebar.right + "px",
                right: layout.utils.width + "px",
                bottom: "0",
              }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
            >
              {/* header */}
              <header className="flex items-center justify-between px-8 py-4 border-b">
                <h2 className="text-2xl font-semibold">All Settings</h2>
                {/* ——— Search Your Settings Section ——— */}
                <div className="px-8 pb-4">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="🔍 Search your settings"
                    className="
      w-full max-w-md mx-auto
      bg-gray-100 rounded-lg
      px-4 py-2
      placeholder-gray-500
      focus:outline-none focus:ring focus:ring-blue-300
    "
                  />
                </div>

                <button
                  onClick={onClose}
                  aria-label="Close settings"
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                >
                  <XMarkIcon className="w-6 h-6 text-gray-600" />
                </button>
              </header>

              {/* content */}
              <main className="overflow-y-auto p-8 flex-1">
                <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {CATEGORIES.map((cat) => (
                    <motion.div
                      key={cat.id}
                      whileHover={{
                        scale: 1.03,
                        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                      }}
                      className="bg-gray-50 rounded-2xl p-6"
                    >
                      <div className="flex items-center mb-4">
                        <cat.Icon
                          className="w-7 h-7"
                          style={{ color: cat.color }}
                        />
                        <h3 className="ml-3 text-lg font-medium text-gray-900">
                          {cat.title}
                        </h3>
                      </div>
                      <ul className="space-y-2">
                        {cat.links.map((link) => (
                          <li key={link.to}>
                            <a
                              href={link.to}
                              className="
          flex justify-between items-center
          px-3 py-2 rounded-lg  
          hover:bg-blue-600 transition group
        "
                            >
                              <span className="text-gray-800 group-hover:text-white transition">
                                {link.label}
                              </span>
                              <ChevronRightIcon className="w-4 h-4 text-transparent group-hover:text-white     transition" />
                            </a>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
                </div>
              </main>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
