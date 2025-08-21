// src/app/dashboard/components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  HomeIcon,
  CubeIcon,
  BanknotesIcon,
  ShoppingCartIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  UserCircleIcon,
  ChartBarIcon,
  FolderIcon,
  CurrencyRupeeIcon,
  Cog6ToothIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  PlusIcon,
  ArrowRightOnRectangleIcon,
  // submenu icons
  UserGroupIcon,
  DocumentTextIcon,
  DocumentDuplicateIcon,
  TruckIcon,
  CreditCardIcon,
  ClipboardDocumentCheckIcon,
  ChartPieIcon,
  RectangleStackIcon,
  LockClosedIcon,
  BookOpenIcon,
  ArrowPathIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import { useModulePreferences } from "../../../contexts/ModulePreferenceContext";

type Leaf = {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

type Node = {
  id: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  href?: string;
  children?: Leaf[];
};

const NAV: Node[] = [
  { id: "home", label: "Home", icon: HomeIcon, href: "/dashboard" },
  { id: "items", label: "Items", icon: CubeIcon, href: "/dashboard/items" },
  {
    id: "banking",
    label: "Banking",
    icon: BanknotesIcon,
    href: "/dashboard/banking",
  },

  {
    id: "sales",
    label: "Sales",
    icon: ShoppingCartIcon,
    children: [
      {
        id: "customers",
        label: "Customers",
        href: "/dashboard/customers",
        icon: UserGroupIcon,
      },
      {
        id: "quotes",
        label: "Quotes",
        href: "/dashboard/sales/quotes",
        icon: DocumentDuplicateIcon,
      },
      {
        id: "sales-orders",
        label: "Sales Orders",
        href: "/dashboard/sales/sales-orders",
        icon: ClipboardDocumentListIcon,
      },
      {
        id: "delivery",
        label: "Delivery Challans",
        href: "/dashboard/sales/delivery-challans",
        icon: TruckIcon,
      },
      {
        id: "invoices",
        label: "Invoices",
        href: "/dashboard/sales/invoices",
        icon: DocumentTextIcon,
      },
      {
        id: "payments-received",
        label: "Payments Received",
        href: "/dashboard/sales/payments-received",
        icon: BanknotesIcon,
      },
      {
        id: "recurring-invoices",
        label: "Recurring Invoices",
        href: "/dashboard/sales/recurring-invoices",
        icon: ArrowPathIcon,
      },
      {
        id: "credit-notes",
        label: "Credit Notes",
        href: "/dashboard/sales/credit-notes",
        icon: CreditCardIcon,
      },
    ],
  },

  {
    id: "purchases",
    label: "Purchases",
    icon: ClipboardDocumentListIcon,
    children: [
      {
        id: "vendors",
        label: "Vendors",
        href: "/dashboard/purchases/vendors",
        icon: UserGroupIcon,
      },
      {
        id: "expenses",
        label: "Expenses",
        href: "/dashboard/purchases/expenses",
        icon: BanknotesIcon,
      },
      {
        id: "recurring-expenses",
        label: "Recurring Expenses",
        href: "/dashboard/purchases/recurring-expenses",
        icon: ArrowPathIcon,
      },
      {
        id: "purchase-orders",
        label: "Purchase Orders",
        href: "/dashboard/purchases/purchase-orders",
        icon: ClipboardDocumentListIcon,
      },
      {
        id: "bills",
        label: "Bills",
        href: "/dashboard/purchases/bills",
        icon: DocumentTextIcon,
      },
      {
        id: "payments-made",
        label: "Payments Made",
        href: "/dashboard/purchases/payments-made",
        icon: BanknotesIcon,
      },
      {
        id: "recurring-bills",
        label: "Recurring Bills",
        href: "/dashboard/purchases/recurring-bills",
        icon: ArrowPathIcon,
      },
      {
        id: "vendor-credits",
        label: "Vendor Credits",
        href: "/dashboard/purchases/vendor-credits",
        icon: CreditCardIcon,
      },
    ],
  },

  {
    id: "time",
    label: "Time Tracking",
    icon: ClockIcon,
    children: [
      {
        id: "projects",
        label: "Projects",
        href: "/dashboard/time/projects",
        icon: FolderIcon,
      },
      {
        id: "timesheet",
        label: "Timesheet",
        href: "/dashboard/time/timesheet",
        icon: ClipboardDocumentCheckIcon,
      },
    ],
  },

  {
    id: "accountant",
    label: "Accountant",
    icon: UserCircleIcon,
    children: [
      {
        id: "profit-loss",
        label: "Profit & Loss Report",
        href: "/dashboard/accountant/profit-loss",
        icon: ChartBarIcon,
      },
      {
        id: "balance-sheet",
        label: "Balance Sheet",
        href: "/dashboard/accountant/balance-sheet",
        icon: ChartBarIcon,
      },
      {
        id: "manual-journals",
        label: "Manual Journals",
        href: "/dashboard/accountant/manual-journals",
        icon: BookOpenIcon,
      },
      {
        id: "bulk-update",
        label: "Bulk Update",
        href: "/dashboard/accountant/bulk-update",
        icon: ArrowPathIcon,
      },
      {
        id: "currency",
        label: "Currency Adjustments",
        href: "/dashboard/accountant/currency-adjustments",
        icon: CurrencyRupeeIcon,
      },
      {
        id: "coa",
        label: "Chart of Accounts",
        href: "/dashboard/accountant/chart-of-accounts",
        icon: RectangleStackIcon,
      },
      {
        id: "budgets",
        label: "Budgets",
        href: "/dashboard/accountant/budgets",
        icon: ChartPieIcon,
      },
      {
        id: "lock",
        label: "Transaction Locking",
        href: "/dashboard/accountant/transaction-locking",
        icon: LockClosedIcon,
      },
    ],
  },

  {
    id: "reports",
    label: "Reports",
    icon: ChartBarIcon,
    href: "/dashboard/reports",
  },
  {
    id: "documents",
    label: "Documents",
    icon: FolderIcon,
    href: "/dashboard/documents",
  },
  {
    id: "help-support",
    label: "Help & Support",
    icon: QuestionMarkCircleIcon,
    href: "/dashboard/help-support",
  },
  {
    id: "configure",
    label: "Configure Features list",
    icon: Cog6ToothIcon,
    href: "/dashboard/configure",
  },
];

const cn = (...xs: (string | false | undefined)[]) =>
  xs.filter(Boolean).join(" ");

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const { isModuleEnabled } = useModulePreferences();
  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState<Record<string, boolean>>({
    sales: false,
    purchases: false,
    time: false,
    accountant: false,
  });

  // Auto-expand sales section when on customers page - REMOVED to keep sections closed by default

  // Flyout state (collapsed)
  const [flyId, setFlyId] = useState<string | null>(null);
  const [flyPos, setFlyPos] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });
  const containerRef = useRef<HTMLDivElement>(null);

  // ---- Close-delay (prevents flicker across the gap) ----
  const closeTimer = useRef<number | null>(null);
  const clearClose = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const scheduleClose = (ms = 180) => {
    clearClose();
    closeTimer.current = window.setTimeout(() => setFlyId(null), ms);
  };
  useEffect(() => {
    const closeAll = () => setFlyId(null);
    window.addEventListener("resize", closeAll);
    window.addEventListener("scroll", closeAll, true);
    return () => {
      window.removeEventListener("resize", closeAll);
      window.removeEventListener("scroll", closeAll, true);
    };
  }, []);

  const activeTopId = useMemo(() => {
    const seg = pathname?.split("/")[2];
    if (!seg) return "home";

    // Special handling for customers route - it should highlight Sales section
    if (pathname?.startsWith("/dashboard/customers")) {
      return "sales";
    }

    return NAV.find((n) => n.id === seg)?.id ?? "home";
  }, [pathname]);

  function openFlyout(id: string, e: React.MouseEvent) {
    if (!collapsed) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const left =
      (containerRef.current?.getBoundingClientRect().right ?? rect.right) + 4; // small gap
    const top = rect.top;
    clearClose();
    setFlyPos({ top, left });
    setFlyId(id);
  }

  const onPlus = (label: string) => {
    // Hook your create action here
    console.log("Create new:", label);
  };

  // Handle navigation
  const handleNavigation = (href: string) => {
    // Navigate to the new route
    router.push(href);
  };

  return (
    <aside
      data-settings-sidebar
      ref={containerRef}
      className={cn(
        "h-full bg-white border-r flex flex-col transition-all duration-300 ease-in-out",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Brand */}
      <div
        className={cn(
          "px-4 py-4 flex items-center gap-3 border-b relative",
          collapsed && "justify-center"
        )}
      >
        <div className="h-8 w-8 rounded-md bg-sky-600 text-white grid place-items-center font-bold">
          B
        </div>
        {!collapsed && <div className="text-xl font-semibold">Books</div>}
        
        {/* Sidebar collapse button - positioned at top right of brand section */}
        <div className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-1/2">
          <button
            onClick={() => {
              setFlyId(null);
              setCollapsed((v) => !v);
            }}
            className="h-8 w-8 rounded-l-lg bg-white border border-gray-300 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center shadow-md z-10"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRightIcon className="h-4 w-4 text-gray-700" />
            ) : (
              <ChevronLeftIcon className="h-4 w-4 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Nav list */}
      <div className="flex-1 overflow-y-auto px-2 pt-3">
        {NAV.filter((node) => isModuleEnabled(node.id)).map((node) => {
          const Icon = node.icon;
          const isActive = activeTopId === node.id;
          const hasChildren = !!node.children?.length;

          // Expanded
          if (!collapsed) {
            return (
              <div key={node.id} className="mb-1">
                {hasChildren ? (
                  <button
                    onClick={() =>
                      setOpen((p) => ({ ...p, [node.id]: !p[node.id] }))
                    }
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg border-l-4",
                      isActive
                        ? "border-blue-500 bg-blue-50 text-blue-800"
                        : "border-transparent hover:bg-gray-50 hover:ring-1 hover:ring-gray-100"
                    )}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="flex-1 text-left truncate">{node.label}</span>
                    {open[node.id] ? (
                      <ChevronDownIcon className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    ) : (
                      <ChevronRightIcon className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => node.href && handleNavigation(node.href)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg border-l-4",
                      isActive
                        ? "border-blue-500 bg-blue-50 text-blue-800"
                        : "border-transparent hover:bg-gray-50 hover:ring-1 hover:ring-gray-100"
                    )}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="flex-1 text-left truncate">{node.label}</span>
                  </button>
                )}

                {/* Submenu */}
                {hasChildren && (
                  <div
                    className={cn(
                      "overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ml-9",
                      open[node.id]
                        ? "max-h-[800px] opacity-100"
                        : "max-h-0 opacity-0"
                    )}
                  >
                    <ul className="py-1">
                      {node
                        .children!.filter((leaf) => isModuleEnabled(leaf.id))
                        .map((leaf) => {
                          const selected = pathname?.startsWith(leaf.href);
                          const LeafIcon = leaf.icon;
                          return (
                            <li key={leaf.id}>
                              <button
                                onClick={() => handleNavigation(leaf.href)}
                                className={cn(
                                  "group w-full flex items-center justify-between pr-3 py-2 rounded-md border-l-4",
                                  selected
                                    ? "border-blue-500 text-blue-800"
                                    : "border-transparent text-gray-700 hover:text-gray-900"
                                )}
                              >
                                <span className="flex items-center min-w-0 flex-1">
                                  <LeafIcon className="h-4 w-4 mr-2 opacity-0 -translate-x-1 transition-all duration-150 group-hover:opacity-100 group-hover:translate-x-0 flex-shrink-0" />
                                  <span className="truncate">{leaf.label}</span>
                                </span>
                                <div
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onPlus(leaf.label);
                                  }}
                                  className="opacity-0 scale-95 transition-all duration-150 group-hover:opacity-100 group-hover:scale-100 inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-white cursor-pointer"
                                  aria-label={`Create new ${leaf.label}`}
                                >
                                  <PlusIcon className="h-3 w-3" />
                                </div>
                              </button>
                            </li>
                          );
                        })}
                    </ul>
                  </div>
                )}
              </div>
            );
          }

          // Collapsed + Flyout
          return (
            <div key={node.id} className="mb-2">
              <div
                onMouseEnter={(e) =>
                  hasChildren ? openFlyout(node.id, e) : undefined
                }
                onMouseLeave={() => (hasChildren ? scheduleClose() : undefined)}
                onClick={(e) => {
                  if (hasChildren) {
                    openFlyout(node.id, e as unknown as React.MouseEvent);
                  } else if (node.href) {
                    handleNavigation(node.href);
                  }
                }}
                className={cn(
                  "group relative mx-2 rounded-lg grid place-items-center py-2 border-l-4 cursor-pointer",
                  isActive
                    ? "border-blue-500 bg-blue-50 text-blue-800"
                    : "border-transparent hover:bg-gray-50 hover:ring-1 hover:ring-gray-100"
                )}
              >
                <Icon className="h-6 w-6" />
                <div className="mt-1 text-[11px] text-gray-700 leading-none text-center line-clamp-2">
                  {node.label}
                </div>
                {hasChildren && (
                  <span className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-gray-600">
                    <ChevronRightIcon className="h-3 w-3" />
                  </span>
                )}
              </div>

              {/* Flyout */}
              {hasChildren && flyId === node.id && (
                <div
                  className="fixed z-40 w-72 rounded-xl border bg-white shadow-xl"
                  style={{ top: flyPos.top, left: flyPos.left }}
                  onMouseEnter={() => clearClose()}
                  onMouseLeave={() => scheduleClose()}
                >
                  <div className="px-4 pt-3 pb-2 text-xs font-semibold text-gray-500">
                    {node.label.toUpperCase()}
                  </div>
                  <ul className="px-2 pb-2">
                    {node.children!.map((leaf) => {
                      const LeafIcon = leaf.icon;
                      return (
                        <li key={leaf.id}>
                          <button
                            onClick={() => {
                              setFlyId(null);
                              handleNavigation(leaf.href);
                            }}
                            className="group w-full flex items-center justify-between px-3 py-2 rounded-md border-l-4 hover:bg-gray-50"
                          >
                            <span className="flex items-center text-sm min-w-0 flex-1">
                              <LeafIcon className="h-4 w-4 mr-2 opacity-0 -translate-x-1 transition-all duration-150 group-hover:opacity-100 group-hover:translate-x-0 flex-shrink-0" />
                              <span className="truncate">{leaf.label}</span>
                            </span>
                            <div
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onPlus(leaf.label);
                              }}
                              className="opacity-0 scale-95 transition-all duration-150 group-hover:opacity-100 group-hover:scale-100 inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-white cursor-pointer"
                              aria-label={`Create new ${leaf.label}`}
                            >
                              <PlusIcon className="h-4 w-4" />
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          );
        })}

        {/* Promo (expanded only) */}
        {!collapsed && (
          <div className="mx-2 mt-6 mb-16 rounded-2xl border bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-sky-50 text-sky-600 grid place-items-center text-lg">
                ▶
              </div>
              <div>
                <div className="text-xs font-semibold tracking-wide text-sky-600">
                  ● TAKE A LIVE PRODUCT TOUR
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Join us for a free webinar and get an in-depth overview of
                  books.
                </p>
                <button className="mt-2 text-sm text-blue-600 hover:underline">
                  Register Now →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Logout button */}
      <div className="border-t">
        <button
          onClick={async () => {
            try {
              await logout();
            } catch (error) {
              console.error("Logout failed:", error);
              router.push("/signin");
            }
          }}
          className="w-full py-3 px-4 flex items-center gap-3 text-red-600 hover:bg-red-50 transition-colors"
          aria-label="Logout"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
