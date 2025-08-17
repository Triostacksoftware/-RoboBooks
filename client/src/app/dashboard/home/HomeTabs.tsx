"use client";

import {
  PlusIcon,
  ArrowRightIcon,
  UsersIcon,
  ShoppingCartIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import React, { useState } from "react";
import TabularView from "./TabularView";
import GraphicalView from "./GraphicalView";
import { useRouter } from "next/navigation";

interface HomeTabsProps {
  companyName?: string;
  onTabChange?: (tab: string) => void;
}

export default function HomeTabs({ companyName, onTabChange }: HomeTabsProps) {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "tabular" | "graphical"
  >("dashboard");
  const router = useRouter();

  const handleTabChange = (tab: "dashboard" | "tabular" | "graphical") => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  const handleCardClick = (route: string) => {
    router.push(route);
  };

  // Dashboard metrics data - based on actual available routes
  const dashboardMetrics = {
    customers: {
      total: 37,
      icon: UsersIcon,
      color: "bg-blue-500",
      route: "/dashboard/customers",
    },
    items: {
      total: 6,
      icon: ShoppingCartIcon,
      color: "bg-green-500",
      route: "/dashboard/items",
    },
    banking: {
      total: 6,
      icon: CurrencyDollarIcon,
      color: "bg-purple-500",
      route: "/dashboard/banking",
    },
    sales: {
      total: 12,
      icon: DocumentTextIcon,
      color: "bg-orange-500",
      route: "/dashboard/sales",
    },
    purchases: {
      total: 6,
      icon: ShoppingCartIcon,
      color: "bg-pink-500",
      route: "/dashboard/purchases",
    },
    projects: {
      total: 102,
      icon: DocumentTextIcon,
      color: "bg-indigo-500",
      route: "/dashboard/time/projects",
    },
    invoices: {
      total: 1,
      icon: DocumentTextIcon,
      color: "bg-yellow-500",
      route: "/dashboard/sales/invoices",
    },
    reports: {
      total: "₹7,080",
      icon: CurrencyDollarIcon,
      color: "bg-emerald-500",
      route: "/dashboard/reports",
    },
  };

  const orderStatus = {
    pending: {
      count: 0,
      color: "bg-yellow-100 text-yellow-800",
      icon: ClockIcon,
    },
    confirmed: {
      count: 1,
      color: "bg-blue-100 text-blue-800",
      icon: CheckCircleIcon,
    },
    completed: {
      count: 0,
      color: "bg-green-100 text-green-800",
      icon: CheckCircleIcon,
    },
    cancelled: {
      count: 0,
      color: "bg-red-100 text-red-800",
      icon: XCircleIcon,
    },
  };

  const leadMetrics = {
    documents: { count: 0, route: "/dashboard/documents" },
    helpSupport: { count: 0, route: "/dashboard/help-support" },
    configureFeatures: { count: 0, route: "/dashboard/configure" },
    payroll: { count: 0, route: "/dashboard/payroll" },
  };

  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        {/* Greeting */}
        <div className="flex items-center gap-3 mt-4">
          <div className="h-10 w-10 rounded-lg border flex items-center justify-center text-xl">
            🏷️
          </div>
          <div>
            <h1 className="text-xl font-semibold">
              Hi, {companyName || "User"}
            </h1>
          </div>
        </div>

        {/* Helpline (desktop only) */}
        <div className="hidden md:block text-right text-xs text-gray-600 space-y-1 pt-8">
          <div>
            Robo Books India Helpline:{" "}
            <span className="font-semibold">1800-103-0066</span>
          </div>
          <div>Mon–Fri • 9:00 AM–7:00 PM • Toll Free</div>
        </div>
      </div>

      {/* Tabs + New Dashboard */}
      <div className="mt-6 flex items-center justify-between border-b">
        <div className="flex gap-8 text-sm">
          <button
            onClick={() => handleTabChange("dashboard")}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === "dashboard"
                ? "border-blue-600 text-blue-600"
                : "border-transparent hover:text-gray-800 text-gray-500"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => handleTabChange("tabular")}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === "tabular"
                ? "border-blue-600 text-blue-600"
                : "border-transparent hover:text-gray-800 text-gray-500"
            }`}
          >
            Tabular View
          </button>
          <button
            onClick={() => handleTabChange("graphical")}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === "graphical"
                ? "border-blue-600 text-blue-600"
                : "border-transparent hover:text-gray-800 text-gray-500"
            }`}
          >
            Graphical View
          </button>
        </div>
        <button className="inline-flex items-center gap-1 text-blue-600 py-2">
          <PlusIcon className="h-5 w-5" /> New Dashboard
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Main Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(dashboardMetrics).map(([key, metric]) => {
                const IconComponent = metric.icon;
                return (
                  <div
                    key={key}
                    onClick={() => handleCardClick(metric.route)}
                    className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {metric.total}
                        </p>
                      </div>
                      <div
                        className={`p-2 rounded-lg ${metric.color} text-white`}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="mt-2 flex items-center text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>View Details</span>
                      <ArrowRightIcon className="w-3 h-3 ml-1" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Status Section */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Order Status
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(orderStatus).map(([status, data]) => {
                  const IconComponent = data.icon;
                  return (
                    <div
                      key={status}
                      onClick={() => handleCardClick("/dashboard/sales")}
                      className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer group"
                    >
                      <div className={`p-2 rounded-lg ${data.color} mr-3`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 capitalize">
                          {status}
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          {data.count}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Additional Features Section */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Additional Features
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(leadMetrics).map(([leadType, data]) => (
                  <div
                    key={leadType}
                    onClick={() => handleCardClick(data.route)}
                    className="text-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer group"
                  >
                    <p className="text-sm text-gray-600 capitalize">
                      {leadType.replace(/([A-Z])/g, " $1").trim()}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {data.count}
                    </p>
                    <div className="mt-2 flex items-center justify-center text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>View</span>
                      <ArrowRightIcon className="w-3 h-3 ml-1" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => handleCardClick("/dashboard/sales/invoices")}
                  className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  <DocumentTextIcon className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="text-sm font-medium">Invoices</span>
                </button>
                <button
                  onClick={() => handleCardClick("/dashboard/customers")}
                  className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-green-50 hover:border-green-300 transition-colors"
                >
                  <UsersIcon className="w-5 h-5 text-green-600 mr-3" />
                  <span className="text-sm font-medium">Customers</span>
                </button>
                <button
                  onClick={() =>
                    handleCardClick("/dashboard/purchases/vendors")
                  }
                  className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-orange-50 hover:border-orange-300 transition-colors"
                >
                  <ShoppingCartIcon className="w-5 h-5 text-orange-600 mr-3" />
                  <span className="text-sm font-medium">Vendors</span>
                </button>
                <button
                  onClick={() => handleCardClick("/dashboard/configure")}
                  className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-purple-50 hover:border-purple-300 transition-colors"
                >
                  <CurrencyDollarIcon className="w-5 h-5 text-purple-600 mr-3" />
                  <span className="text-sm font-medium">Configure</span>
                </button>
              </div>
            </div>
          </div>
        )}
        {activeTab === "tabular" && <TabularView />}
        {activeTab === "graphical" && <GraphicalView />}
      </div>
    </div>
  );
}
