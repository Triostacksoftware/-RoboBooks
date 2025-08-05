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
  PresentationChartBarIcon,
  UsersIcon,
  MusicalNoteIcon,
  DocumentChartBarIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/solid";
import {
  ComputerDesktopIcon,
  ChatBubbleLeftEllipsisIcon,
  DevicePhoneMobileIcon,
  VideoCameraIcon,
  CheckBadgeIcon,
  PencilIcon,
  BoltIcon,
  InboxStackIcon,
  PlayCircleIcon,
  ShareIcon,
  LockClosedIcon,
  FolderIcon,
  BookOpenIcon,
  FunnelIcon,
  ChartBarIcon,
  DocumentDuplicateIcon,
  CubeTransparentIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

import { ReceiptPercentIcon } from "@heroicons/react/24/outline";

interface AppEntry {
  id: string;
  name: string;
  description: string;
  category: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const APPS: AppEntry[] = [
  // Finance Apps (unchanged)
  {
    id: "expense",
    name: "Robo Expense",
    description: "Expense Reporting Software",
    category: "Finance Apps",
    Icon: ReceiptPercentIcon,
  },
  {
    id: "billing",
    name: "Robo Billing",
    description: "End-to-end Billing Solution",
    category: "Finance Apps",
    Icon: CurrencyRupeeIcon,
  },
  {
    id: "inventory",
    name: "Robo Inventory",
    description: "Order & Inventory Management Software",
    category: "Finance Apps",
    Icon: ShoppingBagIcon,
  },
  {
    id: "checkout",
    name: "Robo Checkout",
    description: "One-time and recurring payments software",
    category: "Finance Apps",
    Icon: ChartPieIcon,
  },
  {
    id: "commerce",
    name: "Robo Commerce",
    description: "E-commerce software",
    category: "Finance Apps",
    Icon: ShoppingBagIcon,
  },
  {
    id: "payroll",
    name: "Robo Payroll",
    description: "Simplified Payroll Management Software",
    category: "Finance Apps",
    Icon: ReceiptPercentIcon,
  },

  // Email & Collaboration (unchanged)
  {
    id: "notebook",
    name: "Notebook",
    description: "...",
    category: "Email and Collaboration",
    Icon: ComputerDesktopIcon,
  },
  {
    id: "mail",
    name: "Mail",
    description: "...",
    category: "Email and Collaboration",
    Icon: InboxIcon,
  },
  {
    id: "cliq",
    name: "Cliq",
    description: "...",
    category: "Email and Collaboration",
    Icon: UsersIcon,
  },

  // Sales (newly expanded)
  {
    id: "crm",
    name: "Robo CRM",
    description: "...",
    category: "Sales",
    Icon: PresentationChartBarIcon,
  },
  {
    id: "salesiq",
    name: "SalesIQ",
    description: "...",
    category: "Sales",
    Icon: DocumentChartBarIcon,
  },
  {
    id: "salesinbox",
    name: "SalesInbox",
    description: "...",
    category: "Sales",
    Icon: ChartBarIcon,
  },
  {
    id: "bigin",
    name: "Bigin",
    description: "...",
    category: "Sales",
    Icon: FunnelIcon,
  },
  {
    id: "bigmeet",
    name: "Bookings",
    description: "...",
    category: "Sales",
    Icon: CalendarDaysIcon,
  },
  {
    id: "commerce_s",
    name: "Commerce (Sales)",
    description: "...",
    category: "Sales",
    Icon: ShoppingBagIcon,
  },

  // Marketing (newly expanded)
  {
    id: "sites",
    name: "Sites",
    description: "...",
    category: "Marketing",
    Icon: CubeTransparentIcon,
  },
  {
    id: "campaigns",
    name: "Campaigns",
    description: "...",
    category: "Marketing",
    Icon: MusicalNoteIcon,
  },
  {
    id: "survey",
    name: "Survey",
    description: "...",
    category: "Marketing",
    Icon: DocumentDuplicateIcon,
  },
  {
    id: "backstage",
    name: "Backstage",
    description: "...",
    category: "Marketing",
    Icon: UsersIcon,
  },
  {
    id: "forms",
    name: "Forms",
    description: "...",
    category: "Marketing",
    Icon: DocumentTextIcon,
  },
  {
    id: "marketinghub",
    name: "MarketingHub",
    description: "...",
    category: "Marketing",
    Icon: FunnelIcon,
  },
  {
    id: "pagesense",
    name: "PageSense",
    description: "...",
    category: "Marketing",
    Icon: EyeIcon,
  },
  {
    id: "social",
    name: "Social",
    description: "...",
    category: "Marketing",
    Icon: ShareIcon,
  },

  // Help Desk, HR, Business Process (unchanged)…
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [otherCat, setOtherCat] = useState<string>("Email and Collaboration");
  const [showDropdown, setShowDropdown] = useState(false);

  // close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

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
      {/* backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      {/* panel */}
      <div className="fixed top-14 right-0 bottom-0 w-[90vw] max-w-[480px] bg-white shadow-2xl flex flex-col z-50 rounded-tl-2xl">
        {/* header + search */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">All Robo Apps</h2>
          <div className="flex items-center space-x-3">
            {!searchOpen ? (
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
                aria-label="Open search"
              >
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-600" />
              </button>
            ) : (
              <div className="flex items-center space-x-2 border border-blue-500 rounded-full px-3 py-1">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-40 bg-transparent placeholder-gray-400 focus:outline-none"
                />
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSearchOpen(false);
                  }}
                  className="p-1 hover:bg-gray-200 rounded-full"
                  aria-label="Close search"
                >
                  <XMarkIcon className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
              aria-label="Close panel"
            >
              <XMarkIcon className="w-5 h-5 text-red-500" />
            </button>
          </div>
        </div>

        {/* content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-8">
          {/* Finance Apps */}
          <section>
            <h3 className="text-xs font-medium text-gray-500 uppercase mb-3">
              Finance Apps
            </h3>
            <div className="space-y-4">
              {financeApps.map((app) => {
                const colourMap: Record<string, string> = {
                  expense: "#EC5D5D",
                  billing: "#377DFF",
                  inventory: "#00A300",
                  checkout: "#F9B849",
                  commerce: "#5E5CE6",
                  payroll: "#26A69A",
                };
                return (
                  <a
                    key={app.id}
                    href={`/${app.id}`}
                    className="
            relative flex items-center justify-between
            p-4 border border-gray-200 rounded-2xl bg-white
            hover:shadow-xl hover:-translate-y-1 transition
            group
          "
                  >
                    <div className="flex items-center space-x-4">
                      <app.Icon
                        className="w-6 h-6"
                        style={{ color: colourMap[app.id] }}
                      />
                      <div>
                        <div className="font-semibold text-gray-900">
                          {app.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {app.description}
                        </div>
                      </div>
                    </div>
                    <ChevronRightIcon
                      className="
              absolute right-4 top-1/2 -translate-y-1/2
              w-5 h-5 text-blue-600
              opacity-0 group-hover:opacity-100
              transition-opacity
            "
                    />
                  </a>
                );
              })}
            </div>
          </section>

          {/* ————— Other Apps ————— */}
          <section>
            {/* toggle button + dropdown */}
            <div className="relative mb-3">
              <button
                onClick={() => setShowDropdown((v) => !v)}
                className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 transition mb-8"
              >
                Other Apps
                {showDropdown ? (
                  <ChevronUpIcon className="w-4 h-4 ml-1" />
                ) : (
                  <ChevronDownIcon className="w-4 h-4 ml-1" />
                )}
              </button>

              {showDropdown && (
                <ul className="absolute top-full left-0 mt-1 w-60 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
                  {OTHER_CATEGORIES.map((cat) => (
                    <li key={cat}>
                      <button
                        onClick={() => {
                          setOtherCat(cat);
                          setShowDropdown(false);
                          setSearchTerm("");
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm transition
                          ${
                            cat === otherCat
                              ? "bg-blue-100 text-gray-900"
                              : "text-gray-700 hover:bg-blue-50"
                          }`}
                      >
                        {cat}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* fixed “Email and Collaboration” header */}
            <div className="text-xs font-semibold text-gray-500 uppercase mb-7">
              Email and Collaboration
            </div>

            {/* 4-column grid of 15 icons */}
            <div className="grid grid-cols-4 gap-4 py-2">
              {[
                {
                  Icon: ComputerDesktopIcon,
                  label: "Notebook",
                  href: "/notebook",
                  color: "#1DBF73",
                }, // green
                {
                  Icon: VideoCameraIcon,
                  label: "Meeting",
                  href: "/meeting",
                  color: "#5E5CE6",
                }, // indigo
                {
                  Icon: CheckBadgeIcon,
                  label: "Projects",
                  href: "/projects",
                  color: "#EC5D5D",
                }, // red
                {
                  Icon: PencilIcon,
                  label: "Sign",
                  href: "/sign",
                  color: "#F0B100",
                }, // yellow
                {
                  Icon: BoltIcon,
                  label: "Sprints",
                  href: "/sprints",
                  color: "#6F52BC",
                }, // purple
                {
                  Icon: InboxStackIcon,
                  label: "TeamInbox",
                  href: "/teaminbox",
                  color: "#E02F44",
                }, // dark red
                {
                  Icon: InboxIcon,
                  label: "Mail",
                  href: "/mail",
                  color: "#377DFF",
                }, // blue
                {
                  Icon: ChatBubbleLeftEllipsisIcon,
                  label: "Cliq",
                  href: "/cliq",
                  color: "#26A69A",
                }, // teal
                {
                  Icon: Squares2X2Icon,
                  label: "Sheet",
                  href: "/sheet",
                  color: "#00A300",
                }, // bright green
                {
                  Icon: PlayCircleIcon,
                  label: "Show",
                  href: "/show",
                  color: "#FF4D4F",
                }, // coral
                {
                  Icon: DocumentTextIcon,
                  label: "Writer",
                  href: "/writer",
                  color: "#FF5F3B",
                }, // orange
                {
                  Icon: ShareIcon,
                  label: "Connect",
                  href: "/connect",
                  color: "#F9B849",
                }, // gold
                {
                  Icon: LockClosedIcon,
                  label: "Vault",
                  href: "/vault",
                  color: "#902BBE",
                }, // violet
                {
                  Icon: FolderIcon,
                  label: "WorkDrive",
                  href: "/workdrive",
                  color: "#35C4E4",
                }, // sky-blue
                {
                  Icon: BookOpenIcon,
                  label: "Learn",
                  href: "/learn",
                  color: "#EC5D5D",
                }, // red
              ].map(({ Icon, label, href, color }) => (
                <a
                  key={label}
                  href={href}
                  className="
        flex flex-col items-center p-3
        bg-white border border-gray-200 rounded-2xl
        hover:shadow-lg hover:-translate-y-0.5
        transition-transform transition-shadow group
      "
                >
                  <Icon className="w-8 h-8 mb-1.5" style={{ color }} />
                  <span className="text-sm font-medium text-gray-900 text-center">
                    {label}
                  </span>
                </a>
              ))}
            </div>
          </section>
          {/* ————— Sales Apps ————— */}
          <section>
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">
              Sales
            </h3>
            <div className="grid grid-cols-4 gap-4">
              {APPS.filter((a) => a.category === "Sales").map((app) => {
                const colorMap: Record<string, string> = {
                  crm: "#377DFF",
                  salesiq: "#EC5D5D",
                  salesinbox: "#00A300",
                  bigin: "#F9B849",
                  bigmeet: "#5E5CE6",
                  commerce_s: "#26A69A",
                };
                const color = colorMap[app.id] || "#4B5563";

                return (
                  <a
                    key={app.id}
                    href={`/${app.id}`}
                    className="
            flex flex-col items-center
            p-4 bg-white border border-gray-200
            rounded-2xl hover:shadow-lg hover:-translate-y-0.5
            transition-transform transition-shadow
          "
                  >
                    <app.Icon className="w-8 h-8 mb-2" style={{ color }} />
                    <span className="text-sm font-medium text-gray-900">
                      {app.name}
                    </span>
                  </a>
                );
              })}
            </div>
          </section>

          {/* ————— Marketing Apps ————— */}
          <section>
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">
              Marketing
            </h3>
            <div className="grid grid-cols-4 gap-4">
              {APPS.filter((a) => a.category === "Marketing").map((app) => {
                const colorMap: Record<string, string> = {
                  sites: "#1DBF73",
                  campaigns: "#EC5D5D",
                  survey: "#FF5F3B",
                  backstage: "#6F52BC",
                  forms: "#00A300",
                  marketinghub: "#F0B100",
                  pagesense: "#377DFF",
                  social: "#902BBE",
                };
                const color = colorMap[app.id] || "#4B5563";

                return (
                  <a
                    key={app.id}
                    href={`/${app.id}`}
                    className="
            flex flex-col items-center
            p-4 bg-white border border-gray-200
            rounded-2xl hover:shadow-lg hover:-translate-y-0.5
            transition-transform transition-shadow
          "
                  >
                    <app.Icon className="w-8 h-8 mb-2" style={{ color }} />
                    <span className="text-sm font-medium text-gray-900">
                      {app.name}
                    </span>
                  </a>
                );
              })}
            </div>
          </section>

          {/* ————— Help Desk & Customer Support ————— */}
          <section>
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">
              Help Desk and Customer Support
            </h3>
            <div className="grid grid-cols-4 gap-4 py-2">
              {[
                {
                  Icon: ChatBubbleLeftEllipsisIcon,
                  label: "Desk",
                  color: "#00A300",
                  href: "/desk",
                },
                {
                  Icon: DevicePhoneMobileIcon,
                  label: "Lens",
                  color: "#EC5D5D",
                  href: "/lens",
                },
                {
                  Icon: CheckBadgeIcon,
                  label: "Assist",
                  color: "#377DFF",
                  href: "/assist",
                },
              ].map(({ Icon, label, color, href }) => (
                <a
                  key={label}
                  href={href}
                  className="flex flex-col items-center p-3 bg-white border border-gray-200 rounded-2xl hover:shadow-lg hover:-translate-y-0.5 transition"
                >
                  <Icon className="w-6 h-6 mb-1.5" style={{ color }} />
                  <span className="text-sm font-medium text-gray-900 text-center">
                    {label}
                  </span>
                </a>
              ))}
            </div>
          </section>

          {/* ————— Human Resources ————— */}
          <section>
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">
              Human Resources
            </h3>
            <div className="grid grid-cols-4 gap-4 py-2">
              {[
                {
                  Icon: UsersIcon,
                  label: "People",
                  color: "#6F52BC",
                  href: "/people",
                },
                {
                  Icon: PresentationChartBarIcon,
                  label: "Recruit",
                  color: "#EC5D5D",
                  href: "/recruit",
                },
              ].map(({ Icon, label, color, href }) => (
                <a
                  key={label}
                  href={href}
                  className="flex flex-col items-center p-3 bg-white border border-gray-200 rounded-2xl hover:shadow-lg hover:-translate-y-0.5 transition"
                >
                  <Icon className="w-6 h-6 mb-1.5" style={{ color }} />
                  <span className="text-sm font-medium text-gray-900 text-center">
                    {label}
                  </span>
                </a>
              ))}
            </div>
          </section>

          {/* ————— Business Process ————— */}
          <section>
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">
              Business Process
            </h3>
            <div className="grid grid-cols-4 gap-4 py-2">
              {[
                {
                  Icon: ChartPieIcon,
                  label: "Analytics",
                  color: "#EC5D5D",
                  href: "/analytics",
                },
                {
                  Icon: CubeTransparentIcon,
                  label: "Creator",
                  color: "#377DFF",
                  href: "/creator",
                },
                {
                  Icon: ChartBarIcon,
                  label: "Flow",
                  color: "#00A300",
                  href: "/flow",
                },
                {
                  Icon: DocumentDuplicateIcon,
                  label: "Qntrl",
                  color: "#FF5F3B",
                  href: "/qntrl",
                },
                {
                  Icon: InboxStackIcon,
                  label: "DataPrep",
                  color: "#6F52BC",
                  href: "/dataprep",
                },
                {
                  Icon: BoltIcon,
                  label: "RPA",
                  color: "#F9B849",
                  href: "/rpa",
                },
              ].map(({ Icon, label, color, href }) => (
                <a
                  key={label}
                  href={href}
                  className="flex flex-col items-center p-3 bg-white border border-gray-200 rounded-2xl hover:shadow-lg hover:-translate-y-0.5 transition"
                >
                  <Icon className="w-6 h-6 mb-1.5" style={{ color }} />
                  <span className="text-sm font-medium text-gray-900 text-center">
                    {label}
                  </span>
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
