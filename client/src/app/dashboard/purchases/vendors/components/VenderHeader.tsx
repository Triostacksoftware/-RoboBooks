'use client';

import React, { useState } from 'react';
import { ChevronDownIcon, PlusIcon, EllipsisVerticalIcon, StarIcon } from '@heroicons/react/24/solid';
import { SparklesIcon } from '@heroicons/react/24/outline';

const VIEWS = [
  "All Vendors",
  "Active Vendors",
  "CRM Vendors",
  "Duplicate Vendors",
  "Inactive Vendors",
  "Vendor Portal Enabled",
  "Vendor Portal Disabled"
];

export default function VendorHeader() {
  const [dropdown, setDropdown] = useState(false);
  const [selected, setSelected] = useState(VIEWS[0]);

  const handleSelect = (view: string) => {
    setSelected(view);
    setDropdown(false);
    // Add filtering logic here if needed
  };

  return (
    <div className="w-full">
      <header className="w-full flex items-start justify-between px-2 sm:px-6 pt-3 bg-transparent relative z-20">
        {/* Left: Dropdown */}
        <div className="relative min-w-[170px] max-w-[90vw]">
          <button
            className="flex items-center justify-between w-full text-sm sm:text-base font-semibold text-gray-800 bg-white/90 rounded-lg px-3 py-1.5 shadow border border-gray-200 transition-all
              focus:outline-none focus:ring-2 focus:ring-blue-300 hover:shadow-md"
            onClick={() => setDropdown(v => !v)}
            aria-haspopup="listbox"
            aria-expanded={dropdown}
          >
            {selected}
            <ChevronDownIcon className={`ml-2 w-5 h-5 transition-transform ${dropdown ? 'rotate-180' : ''}`} />
          </button>
          {/* Dropdown List */}
          {dropdown && (
            <div className="absolute top-full left-0 mt-1 w-full min-w-[180px] max-w-sm bg-white rounded-xl shadow-xl border border-gray-100 py-1 flex flex-col gap-1 z-40 animate-[dropdown-fade_0.18s_ease]">
              {VIEWS.map((view) => (
                <button
                  key={view}
                  className={`group flex items-center justify-between px-3 py-1.5 text-sm font-medium rounded-md transition
                    ${selected === view ? "bg-blue-50 text-blue-700" : "hover:bg-gray-100 text-gray-700"}`}
                  onClick={() => handleSelect(view)}
                >
                  <span className="flex items-center gap-2">
                    <SparklesIcon className="w-4 h-4 text-blue-400 opacity-60 group-hover:scale-110 transition-transform" />
                    {view}
                  </span>
                  <StarIcon className="w-4 h-4 text-gray-300 group-hover:text-yellow-400 transition" />
                </button>
              ))}
              {/* Custom View */}
              <button
                className="flex items-center gap-2 px-3 py-1.5 mt-1 text-sm font-medium rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                onClick={() => alert("Create new custom view")}
              >
                <PlusIcon className="w-4 h-4" /> New Custom View
              </button>
            </div>
          )}
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 mt-0.5">
          <button
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base font-semibold rounded-lg px-3.5 py-1.5 shadow-md transition-all
              focus:outline-none focus:ring-2 focus:ring-blue-300 scale-100 active:scale-95"
            onClick={() => alert("Create New Vendor")}
          >
            <PlusIcon className="w-4 h-4" />
            New
          </button>
          <button
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white/90 text-gray-600 hover:text-blue-700 hover:bg-blue-50 shadow px-2 py-2 transition-all
              focus:outline-none focus:ring-2 focus:ring-blue-200"
            onClick={() => alert("More Options")}
          >
            <EllipsisVerticalIcon className="w-5 h-5" />
          </button>
        </div>
        {/* Dropdown animation keyframes (works with Tailwind v3+) */}
        <style>{`
          @keyframes dropdown-fade {
            from { opacity: 0; transform: translateY(-8px);}
            to { opacity: 1; transform: translateY(0);}
          }
        `}</style>
      </header>
      {/* --------- Underline Divider ---------- */}
      <div className="w-full h-px bg-gradient-to-r from-blue-200/60 via-gray-100 to-blue-100/60 mt-2 mb-4 shadow-sm" />
    </div>
  );
}
