'use client';

import React from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';

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
  return (
    <ul
      className="
        bg-white rounded-xl shadow-lg
        max-h-64 overflow-y-auto
        divide-y divide-gray-200
      "
    >
      {options.map(({ label, hotkey }) => {
        const isActive = label === selected;
        return (
          <li
            key={label}
            onClick={() => onSelect(label)}
            className={`
              flex justify-between items-center px-4 py-2 cursor-pointer
              ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-blue-50 text-gray-800'
              }
            `}
          >
            <span>{label}</span>
            <div className="flex items-center space-x-2">
              {hotkey && (
                <kbd
                  className={`
                    px-1 py-0.5 border rounded text-xs
                    ${isActive ? 'bg-blue-500 border-blue-500' : 'bg-gray-100'}
                  `}
                >
                  {hotkey}
                </kbd>
              )}
              {isActive && <CheckIcon className="w-4 h-4" />}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
