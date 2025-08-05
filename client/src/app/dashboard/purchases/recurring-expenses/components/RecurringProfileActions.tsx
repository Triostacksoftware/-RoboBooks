'use client';

import { useState, useRef, useEffect } from 'react';
import {
  ChevronUpIcon,
  ChevronDownIcon,
  EllipsisVerticalIcon,
  PlusIcon,
  StarIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ArrowPathIcon,
  ChevronRightIcon,
  ChevronDownIcon as SmallChevronDown,
} from '@heroicons/react/24/solid';
import { PlusCircleIcon } from '@heroicons/react/24/outline';

export default function RecurringProfilesHeader() {
  const [openDropdown, setOpenDropdown] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setOpenDropdown((prev) => !prev);
  const toggleMenu = () => setMenuOpen((prev) => !prev);

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

  const profileOptions = ['All', 'Active', 'Stopped', 'Expired'];
  const sortOptions = [
    'Created Time',
    'Profile Name',
    'Expense Account',
    'Vendor Name',
    'Last Expense Date',
    'Next Expense Date',
    'Amount',
  ];
  const exportOptions = ['Export Recurring Expenses', 'Export Current View'];

  const handleClick = (label: string) => {
    alert(`${label} clicked`);
  };

  return (
    <header className="w-full border-b bg-white px-3 py-2 flex items-center justify-between shadow-sm relative">
      {/* Left: All Profiles Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={toggleDropdown}
          className="flex items-center gap-1 text-sm sm:text-base md:text-lg font-semibold text-gray-900 hover:bg-blue-50 px-2 py-1 rounded transition"
        >
          All Profiles
          {openDropdown ? (
            <ChevronUpIcon className="w-4 h-4 text-blue-600" />
          ) : (
            <ChevronDownIcon className="w-4 h-4 text-blue-600" />
          )}
        </button>

        {openDropdown && (
          <div className="absolute z-40 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100">
            <ul className="divide-y divide-gray-100">
              {profileOptions.map((option) => (
                <li
                  key={option}
                  onClick={() => handleClick(option)}
                  className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition"
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

      {/* Right: New & 3-dot Menu */}
      <div className="flex items-center gap-2 relative" ref={menuRef}>
        <button
          onClick={() => handleClick('New')}
          className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm sm:text-base font-medium px-4 py-1.5 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
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
                {/* Sort by */}
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

                {/* Import */}
                <li
                  onClick={() => handleClick('Import Recurring Expenses')}
                  className="px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-blue-50 hover:text-blue-700 transition"
                >
                  <ArrowDownTrayIcon className="w-4 h-4 text-blue-500" />
                  Import Recurring Expenses
                </li>

                {/* Export */}
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
                            index === 0 ? 'bg-blue-500 text-white font-medium' : ''
                          }`}
                        >
                          {option}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>

                {/* Refresh */}
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
