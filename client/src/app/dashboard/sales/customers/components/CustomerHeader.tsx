'use client';

import { useState, useRef, useEffect } from 'react';
import {
  ChevronDownIcon,
  PlusIcon,
  EllipsisVerticalIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  Cog6ToothIcon,
  ArrowPathIcon,
  ArrowUturnLeftIcon,
  FunnelIcon,
  StarIcon,
} from '@heroicons/react/24/solid';

const CUSTOMER_VIEWS = [
  'All Customers',
  'Active Customers',
  'CRM Customers',
  'Duplicate Customers',
  'Inactive Customers',
  'Customer Portal Enabled',
  'Customer Portal Disabled',
  'Overdue Customers',
  'Unpaid Customers',
];

const SORT_FIELDS = [
  'Name',
  'Company Name',
  'Email',
  'Receivables (BCY)',
  'Created Time',
  'Last Modified Time',
];

export default function CustomerHeader() {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setActiveSubmenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAction = (label: string) => {
    console.log(`✅ ${label} clicked`);
    setMenuOpen(false);
    setActiveSubmenu(null);
    setDropdownOpen(false);
  };

  return (
    <div className="w-full flex items-center justify-between px-4 py-4 bg-white border-b relative">
      {/* Left Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!isDropdownOpen)}
          className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold text-gray-900 shadow-sm transition-all"
        >
          All Customers
          <ChevronDownIcon className="w-4 h-4 ml-2 text-gray-600" />
        </button>

        {isDropdownOpen && (
          <div className="absolute z-20 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200">
            <ul className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
              {CUSTOMER_VIEWS.map((view) => (
                <li
                  key={view}
                  onClick={() => handleAction(view)}
                  className="flex justify-between items-center px-4 py-2 hover:bg-blue-100 hover:text-blue-800 cursor-pointer text-sm text-gray-800 transition"
                >
                  {view}
                  <StarIcon className="w-4 h-4 text-gray-300" />
                </li>
              ))}
            </ul>
            <div
              onClick={() => handleAction('New Custom View')}
              className="px-4 py-2 text-sm text-blue-600 hover:underline hover:text-blue-800 cursor-pointer flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              New Custom View
            </div>
          </div>
        )}
      </div>

      {/* Right Buttons */}
      <div className="flex items-center gap-2" ref={menuRef}>
        {/* New Button */}
        <button
          onClick={() => handleAction('New')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow transition"
        >
          <PlusIcon className="w-4 h-4" />
          New
        </button>

        {/* 3 Dots Menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!isMenuOpen)}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
            title="Open menu"
            aria-label="Open menu"
          >
            <EllipsisVerticalIcon className="w-5 h-5" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 z-30 mt-2 w-60 bg-white rounded-xl shadow-xl border border-gray-200">
              <ul className="text-sm text-gray-800">
                {/* Sort By */}
                <div
                  className="relative"
                  onMouseEnter={() => setActiveSubmenu('sort')}
                  onMouseLeave={() => setActiveSubmenu(null)}
                >
                  <li className="flex justify-between items-center px-4 py-2 hover:bg-blue-100 hover:text-blue-800 cursor-pointer">
                    <span className="flex items-center gap-2">
                      <FunnelIcon className="w-4 h-4" />
                      Sort by
                    </span>
                    <ChevronDownIcon className="w-4 h-4" />
                  </li>
                  {activeSubmenu === 'sort' && (
                    <ul className="absolute right-full top-0 mr-2 w-64 bg-white border rounded-xl shadow-xl z-40">
                      {SORT_FIELDS.map((field) => (
                        <li
                          key={field}
                          onClick={() => handleAction(`Sort by ${field}`)}
                          className="px-4 py-2 hover:bg-blue-100 hover:text-blue-800 cursor-pointer transition"
                        >
                          {field}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Import */}
                <div
                  className="relative"
                  onMouseEnter={() => setActiveSubmenu('import')}
                  onMouseLeave={() => setActiveSubmenu(null)}
                >
                  <li className="flex justify-between items-center px-4 py-2 hover:bg-blue-100 hover:text-blue-800 cursor-pointer">
                    <span className="flex items-center gap-2">
                      <ArrowDownTrayIcon className="w-4 h-4" />
                      Import
                    </span>
                    <ChevronDownIcon className="w-4 h-4" />
                  </li>
                  {activeSubmenu === 'import' && (
                    <ul className="absolute right-full top-0 mr-2 w-64 bg-white border rounded-xl shadow-xl z-40">
                      <li
                        onClick={() => handleAction('Import Customers')}
                        className="px-4 py-2 hover:bg-blue-100 hover:text-blue-800 cursor-pointer transition"
                      >
                        Import Customers
                      </li>
                    </ul>
                  )}
                </div>

                {/* Export */}
                <div
                  className="relative"
                  onMouseEnter={() => setActiveSubmenu('export')}
                  onMouseLeave={() => setActiveSubmenu(null)}
                >
                  <li className="flex justify-between items-center px-4 py-2 hover:bg-blue-100 hover:text-blue-800 cursor-pointer">
                    <span className="flex items-center gap-2">
                      <ArrowUpTrayIcon className="w-4 h-4" />
                      Export
                    </span>
                    <ChevronDownIcon className="w-4 h-4" />
                  </li>
                  {activeSubmenu === 'export' && (
                    <ul className="absolute right-full top-0 mr-2 w-64 bg-white border rounded-xl shadow-xl z-40">
                      <li
                        onClick={() => handleAction('Export Customers')}
                        className="px-4 py-2 hover:bg-blue-100 hover:text-blue-800 cursor-pointer transition"
                      >
                        Export Customers
                      </li>
                      <li
                        onClick={() => handleAction('Export Current View')}
                        className="px-4 py-2 hover:bg-blue-100 hover:text-blue-800 cursor-pointer transition"
                      >
                        Export Current View
                      </li>
                    </ul>
                  )}
                </div>

                {/* Preferences */}
                <li
                  onClick={() => handleAction('Preferences')}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-blue-100 hover:text-blue-800 cursor-pointer"
                >
                  <Cog6ToothIcon className="w-4 h-4" />
                  Preferences
                </li>

                {/* Refresh List */}
                <li
                  onClick={() => handleAction('Refresh List')}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-blue-100 hover:text-blue-800 cursor-pointer"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                  Refresh List
                </li>

                {/* Reset Column Width */}
                <li
                  onClick={() => handleAction('Reset Column Width')}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-blue-100 hover:text-blue-800 cursor-pointer"
                >
                  <ArrowUturnLeftIcon className="w-4 h-4" />
                  Reset Column Width
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
