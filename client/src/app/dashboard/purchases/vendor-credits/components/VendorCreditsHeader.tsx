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
  FunnelIcon,
} from '@heroicons/react/24/solid';
import { StarIcon } from '@heroicons/react/24/outline';

const VENDOR_STATUSES = ['All', 'Draft', 'Pending Approval', 'Open', 'Closed', 'Void'];
const SORT_FIELDS = ['Created Time', 'Date', 'Credit Note#', 'Reference Number', 'Vendor Name', 'Amount', 'Balance'];

export default function VendorCreditsHeader() {
  const [isStatusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

  const statusRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleAction = (action: string) => {
    console.log(`🟢 Action triggered: ${action}`);
    setMenuOpen(false);
    setActiveSubmenu(null);
    setStatusDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setStatusDropdownOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setActiveSubmenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full flex flex-col md:flex-row md:items-center justify-between px-4 py-3 bg-white border-b gap-4 relative">
      {/* Status Filter Dropdown */}
      <div className="relative" ref={statusRef}>
        <button
          onClick={() => setStatusDropdownOpen(!isStatusDropdownOpen)}
          className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold text-gray-800 shadow-sm transition-all"
        >
          All Vendor Credits
          <ChevronDownIcon className="w-4 h-4 ml-2 text-gray-600" />
        </button>

        {isStatusDropdownOpen && (
          <div className="absolute z-20 mt-2 w-60 bg-white rounded-xl shadow-xl border border-gray-200">
            <ul className="divide-y divide-gray-100">
              {VENDOR_STATUSES.map((status) => (
                <li
                  key={status}
                  onClick={() => handleAction(status)}
                  className="flex justify-between items-center px-4 py-2 hover:bg-blue-100 hover:text-blue-800 cursor-pointer text-sm text-gray-800 transition"
                >
                  {status}
                  <StarIcon className="w-4 h-4 text-gray-400" />
                </li>
              ))}
            </ul>
            <div
              onClick={() => handleAction('New Custom View')}
              className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-100 hover:text-blue-800 cursor-pointer flex items-center gap-2 transition"
            >
              <PlusIcon className="w-4 h-4" />
              New Custom View
            </div>
          </div>
        )}
      </div>

      {/* Actions + 3-dot Menu */}
      <div className="flex items-center gap-2" ref={menuRef}>
        <button
          onClick={() => handleAction('New')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl shadow transition-all"
        >
          <PlusIcon className="w-4 h-4" />
          New
        </button>

        {/* 3-dots menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!isMenuOpen)}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
          >
            <EllipsisVerticalIcon className="w-5 h-5" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 z-30 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200">
              <ul className="text-sm text-gray-800">

                {/* Sort by */}
                <div
                  onMouseEnter={() => setActiveSubmenu('sort')}
                  onMouseLeave={() => setActiveSubmenu(null)}
                  className="relative"
                >
                  <li className="flex justify-between items-center px-4 py-2 hover:bg-blue-100 hover:text-blue-800 cursor-pointer">
                    <span className="flex items-center gap-2">
                      <FunnelIcon className="w-4 h-4" />
                      Sort by
                    </span>
                    <ChevronDownIcon className="w-4 h-4" />
                  </li>
                  {activeSubmenu === 'sort' && (
                    <ul className="absolute right-full top-0 mr-2 w-56 bg-white border rounded-xl shadow-xl z-40">
                      {SORT_FIELDS.map((field) => (
                        <li
                          key={field}
                          onClick={() => handleAction(`Sort by ${field}`)}
                          className="px-4 py-2 hover:bg-blue-100 hover:text-blue-800 text-sm cursor-pointer transition"
                        >
                          {field}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Import */}
                <div
                  onMouseEnter={() => setActiveSubmenu('import')}
                  onMouseLeave={() => setActiveSubmenu(null)}
                  className="relative"
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
                      {[
                        'Import Applied Vendor Credits',
                        'Import Refunds',
                        'Import Vendor Credits',
                      ].map((item) => (
                        <li
                          key={item}
                          onClick={() => handleAction(item)}
                          className="px-4 py-2 hover:bg-blue-100 hover:text-blue-800 text-sm cursor-pointer transition"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Export */}
                <div
                  onMouseEnter={() => setActiveSubmenu('export')}
                  onMouseLeave={() => setActiveSubmenu(null)}
                  className="relative"
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
                      {[
                        'Export Vendor Credits',
                        'Export Applied Vendor Credits',
                        'Export Current View',
                        'Export Refunds',
                      ].map((item) => (
                        <li
                          key={item}
                          onClick={() => handleAction(item)}
                          className="px-4 py-2 hover:bg-blue-100 hover:text-blue-800 text-sm cursor-pointer transition"
                        >
                          {item}
                        </li>
                      ))}
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

                {/* Refresh */}
                <li
                  onClick={() => handleAction('Refresh List')}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-blue-100 hover:text-blue-800 cursor-pointer"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                  Refresh List
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
