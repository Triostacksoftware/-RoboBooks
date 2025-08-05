'use client';

import { useState } from 'react';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  EllipsisVerticalIcon,
  PlusIcon,
  StarIcon,
  PlusCircleIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ArrowPathIcon,
  Cog6ToothIcon,
  WrenchScrewdriverIcon,
  AdjustmentsHorizontalIcon,
  ArrowsUpDownIcon,
} from '@heroicons/react/24/solid';

const quoteStatuses = [
  'All',
  'Draft',
  'Pending Approval',
  'Approved',
  'Sent',
  'Customer Viewed',
  'Accepted',
  'Invoiced',
  'Declined',
  'Expired',
];

const sortFields = [
  'Created Time',
  'Last Modified Time',
  'Date',
  'Quote Number',
  'Customer Name',
  'Amount',
];

export default function QuotesHeader() {
  const [openDropdown, setOpenDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredSubMenu, setHoveredSubMenu] = useState<'sort' | 'export' | null>(null);

  const filteredStatuses = quoteStatuses.filter((status) =>
    status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleFavorite = (status: string) => {
    setFavorites((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  return (
    <div className="w-full relative z-50">
      <div className="w-full flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 border-b bg-white shadow-sm">
        {/* Dropdown: All Quotes */}
        <div className="relative">
          <button
            onClick={() => setOpenDropdown((prev) => !prev)}
            className="flex items-center gap-1 text-base sm:text-lg font-semibold text-gray-900"
          >
            All Quotes
            {openDropdown ? (
              <ChevronUpIcon className="w-4 h-4 text-blue-600" />
            ) : (
              <ChevronDownIcon className="w-4 h-4 text-blue-600" />
            )}
          </button>

          {openDropdown && (
            <div className="absolute left-0 mt-2 w-72 sm:w-80 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-[400px] flex flex-col">
              <div className="px-3 py-2 border-b sticky top-0 bg-white z-10">
                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="overflow-y-auto">
                {filteredStatuses.map((status, idx) => (
                  <div
                    key={idx}
                    onClick={() => console.log(`Viewing ${status}`)}
                    className="flex justify-between items-center px-4 py-2 text-sm sm:text-base hover:bg-gray-50 cursor-pointer"
                  >
                    <span>{status}</span>
                    <StarIcon
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(status);
                      }}
                      className={`w-4 h-4 transition ${
                        favorites.includes(status) ? 'text-yellow-500' : 'text-gray-300'
                      }`}
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={() => console.log('New Custom View')}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 font-medium text-sm border-t border-gray-100 hover:bg-gray-50 transition"
              >
                <PlusCircleIcon className="w-4 h-4" />
                New Custom View
              </button>
            </div>
          )}
        </div>

        {/* Right side: +New and 3 dots */}
        <div className="flex items-center gap-2 relative">
          <button
            onClick={() => console.log('Create new quote')}
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 sm:py-2 rounded-xl text-sm sm:text-base font-semibold shadow transition"
          >
            <PlusIcon className="w-4 h-4" />
            New
          </button>

          <div className="relative">
            <button
              className="p-2 rounded-md border hover:bg-gray-100 transition"
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              <EllipsisVerticalIcon className="w-5 h-5 text-gray-600" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-xl shadow-lg w-56 z-50 text-sm">
                {/* Sort by */}
                <div
                  onMouseEnter={() => setHoveredSubMenu('sort')}
                  className="flex items-center justify-between px-4 py-2 hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <ArrowsUpDownIcon className="w-4 h-4" />
                    Sort by
                  </div>
                  <ChevronRight />
                </div>

                {/* Import */}
                <div
                  onClick={() => console.log('Import Quotes')}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  Import Quotes
                </div>

                {/* Export */}
                <div
                  onMouseEnter={() => setHoveredSubMenu('export')}
                  className="flex items-center justify-between px-4 py-2 hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <ArrowUpTrayIcon className="w-4 h-4" />
                    Export
                  </div>
                  <ChevronRight />
                </div>

                {/* Preferences */}
                <div
                  onClick={() => console.log('Preferences')}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
                >
                  <Cog6ToothIcon className="w-4 h-4" />
                  Preferences
                </div>

                {/* Custom Fields */}
                <div
                  onClick={() => console.log('Manage Custom Fields')}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
                >
                  <WrenchScrewdriverIcon className="w-4 h-4" />
                  Manage Custom Fields
                </div>

                {/* Refresh */}
                <div
                  onClick={() => console.log('Refresh List')}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                  Refresh List
                </div>

                {/* Reset Column */}
                <div
                  onClick={() => console.log('Reset Column Width')}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
                >
                  <AdjustmentsHorizontalIcon className="w-4 h-4" />
                  Reset Column Width
                </div>

                {/* Sort submenu */}
                {hoveredSubMenu === 'sort' && (
                  <div className="absolute top-0 right-full bg-white border border-gray-200 rounded-xl shadow-lg w-56 z-50">
                    {sortFields.map((field, i) => (
                      <div
                        key={i}
                        onClick={() => console.log(`Sort by: ${field}`)}
                        className="px-4 py-2 hover:bg-blue-50 hover:text-blue-600 cursor-pointer transition"
                      >
                        {field}
                      </div>
                    ))}
                  </div>
                )}

                {/* Export submenu */}
                {hoveredSubMenu === 'export' && (
                  <div className="absolute top-[104px] right-full bg-white border border-gray-200 rounded-xl shadow-lg w-56 z-50">
                    <div
                      onClick={() => console.log('Export Quotes')}
                      className="px-4 py-2 hover:bg-blue-50 hover:text-blue-600 cursor-pointer transition"
                    >
                      Export Quotes
                    </div>
                    <div
                      onClick={() => console.log('Export Current View')}
                      className="px-4 py-2 hover:bg-blue-50 hover:text-blue-600 cursor-pointer transition"
                    >
                      Export Current View
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const ChevronRight = () => (
  <svg
    className="w-4 h-4 text-gray-400"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);
