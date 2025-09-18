"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeftIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  CogIcon,
  UserGroupIcon,
  DocumentTextIcon,
  WrenchScrewdriverIcon,
  PaintBrushIcon,
  CreditCardIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  TruckIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";

export default function SettingsPage() {
  const router = useRouter();

  const organizationSettings = [
    {
      name: "Organization",
      description: "Manage your organization details and settings",
      icon: BuildingOfficeIcon,
      href: "/dashboard/settings/organization",
    },
    {
      name: "Users & Roles",
      description: "Manage users and their permissions",
      icon: UserGroupIcon,
      href: "/dashboard/settings/users",
    },
    {
      name: "Taxes & Compliance",
      description: "Configure tax settings and compliance",
      icon: DocumentTextIcon,
      href: "/dashboard/settings/taxes",
    },
    {
      name: "Setup & Configurations",
      description: "Basic setup and configuration options",
      icon: WrenchScrewdriverIcon,
      href: "/dashboard/settings/setup",
    },
    {
      name: "Customisation",
      description: "Customize your workspace and preferences",
      icon: PaintBrushIcon,
      href: "/dashboard/settings/customization",
    },
  ];

  const moduleSettings = [
    {
      name: "General",
      description: "General application settings",
      icon: CogIcon,
      href: "/dashboard/settings/general",
    },
    {
      name: "Online Payments",
      description: "Configure payment gateways and settings",
      icon: CreditCardIcon,
      href: "/dashboard/settings/payments",
    },
    {
      name: "Sales",
      description: "Sales module settings and preferences",
      icon: CurrencyDollarIcon,
      href: "/dashboard/settings/sales",
    },
    {
      name: "Purchases",
      description: "Purchase module settings and preferences",
      icon: ShoppingCartIcon,
      href: "/dashboard/settings/purchases",
      children: [
        {
          name: "Custom Fields",
          description: "Manage custom fields for all purchase modules",
          icon: DocumentTextIcon,
          href: "/dashboard/settings/custom-fields",
        },
        {
          name: "Expenses",
          description: "Expense preferences and settings",
          icon: TruckIcon,
          href: "/dashboard/settings/preferences/expenses",
        },
        {
          name: "Purchase Orders",
          description: "Purchase order settings",
          icon: DocumentTextIcon,
          href: "/dashboard/settings/preferences/purchase-orders",
        },
        {
          name: "Bills",
          description: "Bill settings and preferences",
          icon: DocumentTextIcon,
          href: "/dashboard/settings/preferences/bills",
        },
        {
          name: "Vendor Credits",
          description: "Vendor credit settings",
          icon: DocumentTextIcon,
          href: "/dashboard/settings/preferences/vendor-credits",
        },
      ],
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
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ChevronLeftIcon className="h-5 w-5" />
                <span>Dashboard</span>
              </button>
              <div className="text-sm text-gray-500">Triostack</div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search settings (/)"
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">All Settings</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                  Organization Settings
                </h3>
                <div className="space-y-2">
                  {organizationSettings.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => router.push(item.href)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center justify-between"
                    >
                      <span>{item.name}</span>
                      <ChevronLeftIcon className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                  Module Settings
                </h3>
                <div className="space-y-2">
                  {moduleSettings.map((item) => (
                    <div key={item.name}>
                      <button
                        onClick={() => router.push(item.href)}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center justify-between"
                      >
                        <span>{item.name}</span>
                        <ChevronLeftIcon className="h-4 w-4" />
                      </button>
                      {item.children && (
                        <div className="ml-4 mt-2 space-y-1">
                          {item.children.map((child) => (
                            <button
                              key={child.name}
                              onClick={() => router.push(child.href)}
                              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                            >
                              {child.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-6xl">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
            
            {/* Organization Settings */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Organization Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {organizationSettings.map((setting) => (
                  <div
                    key={setting.name}
                    onClick={() => router.push(setting.href)}
                    className="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md cursor-pointer transition-all"
                  >
                    <div className="flex items-center mb-3">
                      <setting.icon className="h-6 w-6 text-blue-600 mr-3" />
                      <h3 className="text-lg font-medium text-gray-900">{setting.name}</h3>
                    </div>
                    <p className="text-sm text-gray-600">{setting.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Module Settings */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Module Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {moduleSettings.map((setting) => (
                  <div
                    key={setting.name}
                    onClick={() => router.push(setting.href)}
                    className="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md cursor-pointer transition-all"
                  >
                    <div className="flex items-center mb-3">
                      <setting.icon className="h-6 w-6 text-blue-600 mr-3" />
                      <h3 className="text-lg font-medium text-gray-900">{setting.name}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{setting.description}</p>
                    {setting.children && (
                      <div className="space-y-1">
                        {setting.children.map((child) => (
                          <div
                            key={child.name}
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(child.href);
                            }}
                            className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
                          >
                            {child.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
