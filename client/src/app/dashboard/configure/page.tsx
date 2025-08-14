"use client";

import React, { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

// Feature configuration data
const FEATURE_CONFIG = [
  {
    id: "quotes",
    name: "Quotes",
    description: "Send new proposals and get them approved from your customer.",
    enabled: true,
  },
  {
    id: "retainer-invoices",
    name: "Retainer Invoices",
    description: "Collect advance payments or retainers from your customers.",
    enabled: false,
  },
  {
    id: "timesheet",
    name: "Timesheet",
    description: "Track time for projects and bill them to your customers.",
    enabled: true,
  },
  {
    id: "price-list",
    name: "Price List",
    description:
      "Customize price lists for your customers, for the items you sell.",
    enabled: false,
  },
  {
    id: "sales-orders",
    name: "Sales Orders",
    description: "Confirm your customer's order and ship goods soon.",
    enabled: true,
  },
  {
    id: "delivery-challans",
    name: "Delivery Challans",
    description: "Manage transfer of goods effectively.",
    enabled: true,
  },
  {
    id: "purchase-orders",
    name: "Purchase Orders",
    description: "Create and send orders to purchase goods.",
    enabled: true,
  },
  {
    id: "inventory",
    name: "I would like to enable Inventory.",
    description: "Manage your stock levels effectively.",
    enabled: false,
  },
];

export default function ConfigurePage() {
  const [featureConfig, setFeatureConfig] = useState(FEATURE_CONFIG);

  const handleFeatureToggle = (featureId: string) => {
    setFeatureConfig((prev) =>
      prev.map((feature) =>
        feature.id === featureId
          ? { ...feature, enabled: !feature.enabled }
          : feature
      )
    );
  };

  const handleSaveFeatures = () => {
    // Here you would typically save to backend/localStorage
    console.log("Saving feature configuration:", featureConfig);
    // Show success message (you can use your toast system here)
    alert("Features saved successfully!");
  };

  const handleCancelFeatures = () => {
    // Reset to original configuration
    setFeatureConfig(FEATURE_CONFIG);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Configure Features
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Enable the modules required for your business.
                </p>
              </div>
              <button
                onClick={() => window.history.back()}
                className="p-2 rounded-full hover:bg-gray-100 transition"
              >
                <XMarkIcon className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Information Box */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-white text-sm font-bold">i</span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-blue-800 mb-1">
                    Default Features
                  </h3>
                  <p className="text-sm text-blue-700">
                    Invoices, Credit Notes, Expenses, Bills, Recurring Invoices
                    and more are available by default in Robo Books.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Features List */}
          <div className="px-6 py-4">
            <div className="space-y-4">
              {featureConfig.map((feature) => (
                <div
                  key={feature.id}
                  className="flex items-start space-x-4 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
                >
                  <input
                    type="checkbox"
                    id={feature.id}
                    checked={feature.enabled}
                    onChange={() => handleFeatureToggle(feature.id)}
                    className="mt-1 w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={feature.id}
                      className="text-base font-medium text-gray-900 cursor-pointer"
                    >
                      {feature.name}
                    </label>
                    <p className="text-sm text-gray-600 mt-1">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <p className="text-sm text-gray-600">
                Note: You can change these details later in Settings, if needed.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelFeatures}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFeatures}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
