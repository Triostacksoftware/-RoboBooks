// components/search/SearchableSelect.tsx
"use client";

import React, { useState } from "react";
import { CheckIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export interface Option {
  label: string;
  hotkey?: string;
}

interface SearchableSelectProps {
  options: Option[];
  selected: string;
  onSelect: (label: string) => void;
}

export default function SearchableSelect({
  options,
  selected,
  onSelect,
}: SearchableSelectProps) {
  const main = options.filter((o) => !o.hotkey);
  const actions = options.filter((o) => !!o.hotkey);

  const [q, setQ] = useState("");
  const filtered = main.filter((o) =>
    o.label.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="w-full max-w-xs bg-white border border-gray-200 rounded-lg shadow-lg flex flex-col">
      {/* Top search */}
      <div className="px-4 py-2 border-b">
        <div className="relative text-gray-500">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search"
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none"
          />
        </div>
      </div>

      {/* Scrollable main list */}
      <ul className="overflow-y-auto h-60 divide-y divide-gray-100">
        {filtered.map(({ label }) => (
          <li
            key={label}
            onClick={() => onSelect(label)}
            className="
              flex items-center justify-between
              px-4 py-2 cursor-pointer
              text-gray-800
              hover:bg-blue-600 hover:text-white
              rounded-md
            "
          >
            <span>{label}</span>
          </li>
        ))}
      </ul>

      {/* Fixed footer actions */}
      <div className="border-t border-gray-100 px-4 py-2 space-y-2">
        {actions.map(({ label, hotkey }) => (
          <div
            key={label}
            onClick={() => onSelect(label)}
            className="
              flex items-center justify-between
              px-3 py-2 rounded-md cursor-pointer
              text-gray-800
              hover:bg-blue-600 hover:text-white
            "
          >
            <span className="font-medium">{label}</span>
            {hotkey && (
              <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs text-gray-600">
                {hotkey}
              </kbd>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
