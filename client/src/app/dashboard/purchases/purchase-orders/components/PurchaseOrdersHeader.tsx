'use client';

import { useState, useEffect, useRef } from 'react';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  EllipsisVerticalIcon,
  PlusIcon,
  StarIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ArrowPathIcon,
  Cog6ToothIcon,
  WrenchScrewdriverIcon,
  ChevronRightIcon,
  ChevronDownIcon as SmallChevronDown,
} from '@heroicons/react/24/solid';
import { PlusCircleIcon } from '@heroicons/react/24/outline';

export default function PurchaseOrdersHeader() {
  const [openDropdown, setOpenDropdown] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setOpenDropdown((prev) => !prev);
  const toggleMenu = () => setMenuOpen((prev) => !prev);

  const handleClick = (label: string) => {
    alert(`${label} clicked`);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(false);
      }
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setSortOpen(false);
        setExportOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filterOptions = [
    'All',
    'Draft',
    'Pending Approval',
    'Approved',
    'Issued',
    'Billed',
    'Partially Billed',
    'Closed',
    'Canceled',
  ];

  const sortOptions = [
    'Created Time',
    'Date',
    'Purchase Order#',
    'Vendor Name',
    'Amount',
    'Delivery Date',
    'Last Modified Time',
  ];

  const exportOptions = [
    'Export Purchase Orders',
    'Export Current View',
  ];

  return (
    <header className="w-full border-b bg-white px-3 py-2 flex items-center justify-between shadow-sm relative">
      {/* Left: Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={toggleDropdown}
          className="flex items-center gap-1 text-sm sm:text-base md:text-lg font-semibold text-gray-900 hover:bg-blue-50 px-2 py-1 rounded transition"
        >
          All Purchase Orders
          {openDropdown ? (
            <ChevronUpIcon className="w-4 h-4 text-blue-600" />
          ) : (
            <ChevronDownIcon className="w-4 h-4 text-blue-600" />
          )}
        </button>

        {openDropdown && (
          <div className="absolute mt-2 z-40 w-64 bg-white rounded-xl shadow-xl border border-gray-100">
            <ul className="divide-y divide-gray-100">
              {filterOptions.map((option) => (
                <li
                  key={option}
                  onClick={() => handleClick(option)}
                  className="flex items-center justify-between px-4 py-2 text-sm text-gray-800 hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition"
                >
                  {option}
                  <StarIcon className="w-4 h-4 text-gray-300" />
                </li>
              ))}
            </ul>
            <div className="border-t">
              <button
                onClick={() => handleClick('New Custom View')}
                className="w-full flex items-center gap-2 text-sm text-blue-600 px-4 py-2 hover:bg-blue-50 font-medium transition"
              >
                <PlusCircleIcon className="w-4 h-4" />
                New Custom View
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right: New + Menu */}
      <div className="flex items-center gap-2 relative" ref={menuRef}>
        <button
          onClick={() => handleClick('New')}
          className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-medium px-4 py-1.5 rounded-lg shadow transition focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <PlusIcon className="w-4 h-4" />
          New
        </button>

        <div className="relative">
          <button
            onClick={toggleMenu}
            className="p-2 rounded-md border border-gray-200 hover:bg-gray-100 active:bg-gray-200 transition"
          >
            <EllipsisVerticalIcon className="w-5 h-5 text-gray-600" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-12 z-50 w-64 bg-white rounded-xl shadow-xl border border-gray-100">
              <ul className="text-sm text-gray-700 divide-y divide-gray-100">
                {/* Sort by with submenu */}
                <li
                  className="group relative px-4 py-2 flex items-center justify-between cursor-pointer hover:bg-blue-50 hover:text-blue-700 transition"
                  onMouseEnter={() => {
                    setSortOpen(true);
                    setExportOpen(false);
                  }}
                  onMouseLeave={() => setSortOpen(false)}
                >
                  <span className="flex items-center gap-2">
                    <ArrowUpTrayIcon className="w-4 h-4 text-blue-500" />
                    Sort by
                  </span>
                  <ChevronRightIcon className="w-4 h-4 text-gray-400" />

                  {sortOpen && (
                    <ul className="absolute top-0 right-full mr-1 w-56 bg-white shadow-xl rounded-xl border border-gray-100 z-50 overflow-hidden">
                      {sortOptions.map((option, index) => (
                        <li
                          key={option}
                          onClick={() => handleClick(option)}
                          className={`px-4 py-2 text-sm cursor-pointer hover:bg-blue-50 hover:text-blue-700 transition ${
                            index === 0
                              ? 'bg-blue-500 text-white font-medium flex justify-between items-center'
                              : ''
                          }`}
                        >
                          {option}
                          {index === 0 && (
                            <SmallChevronDown className="w-4 h-4 ml-2" />
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>

                {/* Import Purchase Orders */}
                <li
                  onClick={() => handleClick('Import Purchase Orders')}
                  className="px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-blue-50 hover:text-blue-700 transition"
                >
                  <ArrowDownTrayIcon className="w-4 h-4 text-blue-500" />
                  Import Purchase Orders
                </li>

                {/* Export with submenu */}
                <li
                  className="group relative px-4 py-2 flex items-center justify-between cursor-pointer hover:bg-blue-50 hover:text-blue-700 transition"
                  onMouseEnter={() => {
                    setExportOpen(true);
                    setSortOpen(false);
                  }}
                  onMouseLeave={() => setExportOpen(false)}
                >
                  <span className="flex items-center gap-2">
                    <ArrowUpTrayIcon className="w-4 h-4 text-blue-500" />
                    Export
                  </span>
                  <ChevronRightIcon className="w-4 h-4 text-gray-400" />

                  {exportOpen && (
                    <ul className="absolute top-0 right-full mr-1 w-64 bg-white shadow-xl rounded-xl border border-gray-100 z-50 overflow-hidden">
                      {exportOptions.map((option, index) => (
                        <li
                          key={option}
                          onClick={() => handleClick(option)}
                          className={`px-4 py-2 text-sm cursor-pointer hover:bg-blue-50 hover:text-blue-700 transition ${
                            index === 0
                              ? 'bg-blue-500 text-white font-medium'
                              : ''
                          }`}
                        >
                          {option}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>

                {/* Preferences */}
                <li
                  onClick={() => handleClick('Preferences')}
                  className="px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-blue-50 hover:text-blue-700 transition"
                >
                  <Cog6ToothIcon className="w-4 h-4 text-blue-500" />
                  Preferences
                </li>

                {/* Manage Custom Fields */}
                <li
                  onClick={() => handleClick('Manage Custom Fields')}
                  className="px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-blue-50 hover:text-blue-700 transition"
                >
                  <WrenchScrewdriverIcon className="w-4 h-4 text-blue-500" />
                  Manage Custom Fields
                </li>

                {/* Refresh List */}
                <li
                  onClick={() => handleClick('Refresh List')}
                  className="px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-blue-50 hover:text-blue-700 transition"
                >
                  <ArrowPathIcon className="w-4 h-4 text-blue-500" />
                  Refresh List
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
