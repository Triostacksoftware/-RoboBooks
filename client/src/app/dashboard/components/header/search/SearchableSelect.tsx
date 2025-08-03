"use client";

import React, { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

interface FooterAction {
  label: string;
  kbd: string;
  onClick: () => void;
}

interface SearchableSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  footerActions?: FooterAction[];
  align?: "left" | "right";
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Search",
  footerActions = [],
}: SearchableSelectProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(options);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const filtered = options.filter((option) =>
      option.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredOptions(filtered);
  }, [searchQuery, options]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div className="p-4">
      {/* Search input */}
      <div className="relative mb-4">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          className="w-full rounded-md border border-gray-300 bg-white px-10 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Options list */}
      <div className="max-h-60 overflow-y-auto">
        {filteredOptions.map((option) => (
          <button
            key={option}
            className={clsx(
              "w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none",
              option === value && "bg-blue-50 text-blue-600"
            )}
            onClick={() => onChange(option)}
          >
            {option}
          </button>
        ))}
        {filteredOptions.length === 0 && (
          <div className="px-3 py-2 text-sm text-gray-500">
            No options found
          </div>
        )}
      </div>

      {/* Footer actions */}
      {footerActions.length > 0 && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          {footerActions.map((action, index) => (
            <button
              key={index}
              className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
              onClick={action.onClick}
            >
              <span>{action.label}</span>
              <kbd className="rounded bg-gray-100 px-2 py-1 text-xs font-mono">
                {action.kbd}
              </kbd>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
