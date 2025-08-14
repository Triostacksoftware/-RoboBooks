"use client";

import { PlusIcon } from "@heroicons/react/24/outline";
import React, { useState } from "react";
import TabularView from "./TabularView";
import GraphicalView from "./GraphicalView";

interface HomeTabsProps {
  companyName?: string;
  onTabChange?: (tab: string) => void;
}

export default function HomeTabs({ companyName, onTabChange }: HomeTabsProps) {
  const [activeTab, setActiveTab] = useState<"tabular" | "graphical">(
    "tabular"
  );

  const handleTabChange = (tab: "tabular" | "graphical") => {
    setActiveTab(tab);
    onTabChange?.(tab);
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
          <div className="text-gray-400">
            English, हिंदी, தமிழ், తెలుగు, മലയാളം, ಕನ್ನಡ, मराठी, ગુજરાતી, বাংলা
          </div>
        </div>
      </div>

      {/* Tabs + New Dashboard */}
      <div className="mt-6 flex items-center justify-between border-b">
        <div className="flex gap-8 text-sm">
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
        {activeTab === "tabular" && <TabularView />}
        {activeTab === "graphical" && <GraphicalView />}
      </div>
    </div>
  );
}
