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
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import React, { useState, useEffect } from "react";
import TabularView from "./TabularView";
import GraphicalView from "./GraphicalView";
import { useRouter } from "next/navigation";
import { dashboardService, DashboardStats } from "../../../services/dashboardService";

interface HomeTabsProps {
  companyName?: string;
  onTabChange?: (tab: string) => void;
}

export default function HomeTabs({ companyName, onTabChange }: HomeTabsProps) {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "tabular" | "graphical"
  >("dashboard");
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const handleTabChange = (tab: "dashboard" | "tabular" | "graphical") => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  const handleCardClick = (route: string) => {
    router.push(route);
  };

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      setError(null);
      const stats = await dashboardService.getDashboardStats();
      setDashboardStats(stats);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh specific module data
  const refreshModule = async (module: keyof DashboardStats) => {
    try {
      setRefreshing(true);
      const moduleStats = await dashboardService.refreshModuleStats(module);
      setDashboardStats(prev => prev ? { ...prev, [module]: moduleStats } : null);
    } catch (err) {
      console.error(`Error refreshing ${module}:`, err);
    } finally {
      setRefreshing(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeTab === 'dashboard') {
        fetchDashboardStats();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [activeTab]);

  // Refresh data when user returns to dashboard tab
  useEffect(() => {
    if (activeTab === 'dashboard' && !loading && dashboardStats) {
      // Only refresh if data is older than 2 minutes
      const lastRefresh = localStorage.getItem('dashboardLastRefresh');
      const now = Date.now();
      if (!lastRefresh || (now - parseInt(lastRefresh)) > 2 * 60 * 1000) {
        fetchDashboardStats();
        localStorage.setItem('dashboardLastRefresh', now.toString());
      }
    }
  }, [activeTab]);

  // Dashboard metrics data with real-time values
  const dashboardMetrics = {
    customers: {
      total: (dashboardStats?.customers.total || 0) > 0 ? dashboardStats?.customers.total : "No data",
      icon: UsersIcon,
      color: (dashboardStats?.customers.total || 0) > 0 ? "bg-blue-500" : "bg-gray-400",
      route: "/dashboard/customers",
    },
    items: {
      total: (dashboardStats?.items.total || 0) > 0 ? dashboardStats?.items.total : "No data",
      icon: ShoppingCartIcon,
      color: (dashboardStats?.items.total || 0) > 0 ? "bg-green-500" : "bg-gray-400",
      route: "/dashboard/items",
    },
    banking: {
      total: (dashboardStats?.banking.totalAccounts || 0) > 0 ? dashboardStats?.banking.totalAccounts : "No data",
      icon: CurrencyDollarIcon,
      color: (dashboardStats?.banking.totalAccounts || 0) > 0 ? "bg-purple-500" : "bg-gray-400",
      route: "/dashboard/banking",
    },
    sales: {
      total: (dashboardStats?.sales.totalInvoices || 0) > 0 ? dashboardStats?.sales.totalInvoices : "No data",
      icon: DocumentTextIcon,
      color: (dashboardStats?.sales.totalInvoices || 0) > 0 ? "bg-orange-500" : "bg-gray-400",
      route: "/dashboard/sales",
    },
    purchases: {
      total: (dashboardStats?.purchases.totalBills || 0) > 0 ? dashboardStats?.purchases.totalBills : "No data",
      icon: ShoppingCartIcon,
      color: (dashboardStats?.purchases.totalBills || 0) > 0 ? "bg-pink-500" : "bg-gray-400",
      route: "/dashboard/purchases",
    },
    projects: {
      total: (dashboardStats?.projects.total || 0) > 0 ? dashboardStats?.projects.total : "No data",
      icon: DocumentTextIcon,
      color: (dashboardStats?.projects.total || 0) > 0 ? "bg-indigo-500" : "bg-gray-400",
      route: "/dashboard/time/projects",
    },
    invoices: {
      total: (dashboardStats?.sales.totalInvoices || 0) > 0 ? dashboardStats?.sales.totalInvoices : "No data",
      icon: DocumentTextIcon,
      color: (dashboardStats?.sales.totalInvoices || 0) > 0 ? "bg-yellow-500" : "bg-gray-400",
      route: "/dashboard/sales/invoices",
    },
    reports: {
      total: (dashboardStats?.reports.totalRevenue || 0) > 0 ? `₹${dashboardStats?.reports.totalRevenue}` : "No data",
      icon: CurrencyDollarIcon,
      color: (dashboardStats?.reports.totalRevenue || 0) > 0 ? "bg-emerald-500" : "bg-gray-400",
      route: "/dashboard/reports",
    },
  };

  const orderStatus = {
    pending: {
      count: (dashboardStats?.orders.pending || 0) > 0 ? dashboardStats?.orders.pending : "No data",
      color: (dashboardStats?.orders.pending || 0) > 0 ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-600",
      icon: ClockIcon,
    },
    confirmed: {
      count: (dashboardStats?.orders.confirmed || 0) > 0 ? dashboardStats?.orders.confirmed : "No data",
      color: (dashboardStats?.orders.confirmed || 0) > 0 ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-600",
      icon: CheckCircleIcon,
    },
    completed: {
      count: (dashboardStats?.orders.completed || 0) > 0 ? dashboardStats?.orders.completed : "No data",
      color: (dashboardStats?.orders.completed || 0) > 0 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600",
      icon: CheckCircleIcon,
    },
    cancelled: {
      count: (dashboardStats?.orders.cancelled || 0) > 0 ? dashboardStats?.orders.cancelled : "No data",
      color: (dashboardStats?.orders.cancelled || 0) > 0 ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-600",
      icon: XCircleIcon,
    },
  };

  const leadMetrics = {
    documents: { count: dashboardStats?.reports.totalGenerated || 0, route: "/dashboard/documents" },
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
          <div className="flex items-center gap-3">
            {activeTab === "dashboard" && (
              <div className="flex items-center gap-2">
                {dashboardStats && (
                  <span className="text-xs text-gray-500">
                    Last updated: {new Date().toLocaleTimeString()}
                  </span>
                )}
                <button
                  onClick={fetchDashboardStats}
                  disabled={refreshing}
                  className="inline-flex items-center gap-1 text-blue-600 py-2 hover:text-blue-700 disabled:opacity-50"
                >
                  <ArrowPathIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
            )}
            <button className="inline-flex items-center gap-1 text-blue-600 py-2">
              <PlusIcon className="h-5 w-5" /> New Dashboard
            </button>
          </div>
        </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center space-y-3">
                  <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="text-gray-600">Loading dashboard data...</span>
                  <span className="text-xs text-gray-400">Fetching real-time statistics from all modules</span>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <XCircleIcon className="h-5 w-5 text-red-400 mr-2" />
                  <span className="text-red-800">{error}</span>
                  <button
                    onClick={fetchDashboardStats}
                    className="ml-auto text-red-600 hover:text-red-800 underline"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            {/* Dashboard Content */}
            {!loading && !error && (
              <>
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
              </>
            )}
          </div>
        )}
        {activeTab === "tabular" && <TabularView />}
        {activeTab === "graphical" && <GraphicalView />}
      </div>
    </div>
  );
}
