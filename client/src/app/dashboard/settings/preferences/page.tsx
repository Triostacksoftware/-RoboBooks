"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  TruckIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  ChartBarIcon,
  CreditCardIcon,
  WrenchScrewdriverIcon,
  PaintBrushIcon,
} from "@heroicons/react/24/outline";

export default function PreferencesPage() {
  const router = useRouter();

  const preferenceCategories = [
    {
      name: "General",
      description: "General application preferences and settings",
      icon: Cog6ToothIcon,
      href: "/dashboard/settings/preferences/general",
      color: "bg-blue-500",
    },
    {
      name: "Sales",
      description: "Sales module preferences and configurations",
      icon: CurrencyDollarIcon,
      href: "/dashboard/settings/preferences/sales",
      color: "bg-green-500",
    },
    {
      name: "Purchases",
      description: "Purchase module preferences and settings",
      icon: ShoppingCartIcon,
      color: "bg-orange-500",
      children: [
        {
          name: "Bills",
          description: "Bill preferences and display settings",
          icon: DocumentTextIcon,
          href: "/dashboard/settings/preferences/bills",
        },
        {
          name: "Expenses",
          description: "Expense preferences and configurations",
          icon: TruckIcon,
          href: "/dashboard/settings/preferences/expenses",
        },
        {
          name: "Purchase Orders",
          description: "Purchase order settings and preferences",
          icon: DocumentTextIcon,
          href: "/dashboard/settings/preferences/purchase-orders",
        },
        {
          name: "Vendor Credits",
          description: "Vendor credit preferences",
          icon: DocumentTextIcon,
          href: "/dashboard/settings/preferences/vendor-credits",
        },
        {
          name: "Recurring Bills",
          description: "Recurring bill settings",
          icon: DocumentTextIcon,
          href: "/dashboard/settings/preferences/recurring-bills",
        },
        {
          name: "Recurring Expenses",
          description: "Recurring expense settings",
          icon: TruckIcon,
          href: "/dashboard/settings/preferences/recurring-expenses",
        },
        {
          name: "Payments Made",
          description: "Payment preferences and settings",
          icon: CreditCardIcon,
          href: "/dashboard/settings/preferences/payments-made",
        },
        {
          name: "Vendors",
          description: "Vendor management preferences",
          icon: BuildingOfficeIcon,
          href: "/dashboard/settings/preferences/vendors",
        },
      ],
    },
    {
      name: "Organization",
      description: "Organization-wide preferences and settings",
      icon: BuildingOfficeIcon,
      href: "/dashboard/settings/preferences/organization",
      color: "bg-purple-500",
    },
    {
      name: "Users & Roles",
      description: "User management and role preferences",
      icon: UserGroupIcon,
      href: "/dashboard/settings/preferences/users",
      color: "bg-indigo-500",
    },
    {
      name: "Reports",
      description: "Report preferences and default settings",
      icon: ChartBarIcon,
      href: "/dashboard/settings/preferences/reports",
      color: "bg-teal-500",
    },
    {
      name: "Payments",
      description: "Payment gateway and processing preferences",
      icon: CreditCardIcon,
      href: "/dashboard/settings/preferences/payments",
      color: "bg-emerald-500",
    },
    {
      name: "Setup & Config",
      description: "Basic setup and configuration preferences",
      icon: WrenchScrewdriverIcon,
      href: "/dashboard/settings/preferences/setup",
      color: "bg-gray-500",
    },
    {
      name: "Customization",
      description: "UI and workspace customization preferences",
      icon: PaintBrushIcon,
      href: "/dashboard/settings/preferences/customization",
      color: "bg-pink-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Preferences</h1>
                <p className="text-gray-600">Customize your application settings and preferences</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8">
        <div className="max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {preferenceCategories.map((category) => (
              <div key={category.name} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`p-2 rounded-lg ${category.color}`}>
                      <category.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                  
                  {category.children ? (
                    <div className="space-y-2">
                      {category.children.map((child) => (
                        <button
                          key={child.name}
                          onClick={() => router.push(child.href)}
                          className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                        >
                          <div className="flex items-center space-x-3">
                            <child.icon className="h-4 w-4 text-gray-500 group-hover:text-blue-600" />
                            <div>
                              <div className="text-sm font-medium text-gray-900 group-hover:text-blue-900">
                                {child.name}
                              </div>
                              <div className="text-xs text-gray-500 group-hover:text-blue-700">
                                {child.description}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <button
                      onClick={() => router.push(category.href)}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Configure
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
