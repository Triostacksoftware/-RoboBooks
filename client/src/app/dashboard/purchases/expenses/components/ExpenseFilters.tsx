"use client";

import React from "react";
import { CheckIcon } from "@heroicons/react/24/outline";

interface FilterOption {
  value: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

interface ExpenseFiltersProps {
  filters: FilterOption[];
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function ExpenseFilters({
  filters,
  selectedFilter,
  onFilterChange,
  isOpen,
  onClose,
}: ExpenseFiltersProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
      <div className="p-2">
        {filters.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.value}
              onClick={() => {
                onFilterChange(option.value);
                onClose();
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-md hover:bg-gray-50 ${
                selectedFilter === option.value ? "bg-blue-50 text-blue-700" : "text-gray-700"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm">{option.label}</span>
              {selectedFilter === option.value && (
                <CheckIcon className="h-4 w-4 ml-auto" />
              )}
            </button>
          );
        })}
        <div className="border-t border-gray-200 mt-2 pt-2">
          <button className="w-full flex items-center space-x-3 px-3 py-2 text-left rounded-md hover:bg-gray-50 text-blue-600">
            <span className="text-sm">New Custom View</span>
          </button>
        </div>
      </div>
    </div>
  );
}
