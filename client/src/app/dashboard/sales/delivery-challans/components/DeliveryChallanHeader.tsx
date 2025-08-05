'use client';

import { useState, useRef, useEffect } from 'react';
import {
  ChevronDownIcon,
  EllipsisVerticalIcon,
  PlusIcon,
  StarIcon,
  PlusCircleIcon,
  ArrowsUpDownIcon,
  ArrowUpTrayIcon,
  Cog6ToothIcon,
  WrenchScrewdriverIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/solid';

const challanStatuses = [
  'All',
  'Draft',
  'Open',
  'Delivered',
  'Returned',
  'Partially Invoiced',
  'Invoiced',
];

const sortOptions = ['Date', 'Delivery Challan#', 'Customer Name', 'Amount'];

export default function DeliveryChallanHeader() {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [hoverSort, setHoverSort] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setHoverSort(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleFavorite = (status: string) => {
    setFavorites((prev) =>
      prev.includes(status)
        ? prev.filter((item) => item !== status)
        : [...prev, status]
    );
  };

  return (
    <div className="w-full flex justify-between items-center px-4 sm:px-6 lg:px-8 py-3 border-b bg-white shadow-sm relative z-40">
      {/* Left: Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!isDropdownOpen)}
          className="flex items-center text-base sm:text-lg font-semibold text-gray-900 hover:text-blue-600 transition"
        >
          All Delivery Challans
          <ChevronDownIcon className="w-4 h-4 text-blue-600 ml-1" />
        </button>

        {isDropdownOpen && (
          <div className="absolute mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow z-50 overflow-hidden">
            {challanStatuses.map((status, idx) => (
              <div
                key={idx}
                onClick={() => {
                  console.log(`Selected: ${status}`);
                  setDropdownOpen(false);
                }}
                className="flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer"
              >
                <span>{status}</span>
                <StarIcon
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(status);
                  }}
                  className={`w-4 h-4 transition ${
                    favorites.includes(status)
                      ? 'text-yellow-500'
                      : 'text-gray-300'
                  }`}
                />
              </div>
            ))}
            <div
              onClick={() => {
                console.log('Clicked: New Custom View');
                setDropdownOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 text-sm font-medium border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
            >
              <PlusCircleIcon className="w-4 h-4" />
              New Custom View
            </div>
          </div>
        )}
      </div>

      {/* Right: New + Menu */}
      <div className="flex items-center gap-2" ref={menuRef}>
        <button
          onClick={() => console.log('Create new delivery challan')}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base px-4 py-1.5 rounded-lg font-medium flex items-center gap-1 shadow transition"
        >
          <PlusIcon className="w-4 h-4" />
          New
        </button>

        <div className="relative">
          <button
            onClick={() => {
              setMenuOpen((prev) => !prev);
              setHoverSort(false);
            }}
            className="p-2 border rounded-md hover:bg-gray-100 transition"
          >
            <EllipsisVerticalIcon className="w-5 h-5 text-gray-700" />
          </button>

          {isMenuOpen && (
            <div className="absolute top-14 right-0 w-56 bg-white border border-gray-200 rounded-xl shadow z-50 text-sm">
              {/* Sort by with left-opening submenu */}
              <div
                onMouseEnter={() => setHoverSort(true)}
                onMouseLeave={() => setHoverSort(false)}
                className="relative flex justify-between items-center px-4 py-2 hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <ArrowsUpDownIcon className="w-4 h-4" />
                  Sort by
                </div>
                <ChevronDownIcon className="w-4 h-4 rotate-90 text-gray-400" />

                {hoverSort && (
                  <div className="absolute top-0 right-full mr-1 w-52 bg-white border border-gray-200 rounded-xl shadow z-50">
                    {sortOptions.map((opt, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          console.log(`Sort by: ${opt}`);
                          setMenuOpen(false);
                        }}
                        className="px-4 py-2 hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Menu Items */}
              <div
                onClick={() => {
                  setMenuOpen(false);
                  console.log('Export Delivery Challans');
                }}
                className="flex items-center gap-2 px-4 py-2 hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
              >
                <ArrowUpTrayIcon className="w-4 h-4" />
                Export Delivery Challans
              </div>

              <div
                onClick={() => {
                  setMenuOpen(false);
                  console.log('Preferences');
                }}
                className="flex items-center gap-2 px-4 py-2 hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
              >
                <Cog6ToothIcon className="w-4 h-4" />
                Preferences
              </div>

              <div
                onClick={() => {
                  setMenuOpen(false);
                  console.log('Manage Custom Fields');
                }}
                className="flex items-center gap-2 px-4 py-2 hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
              >
                <WrenchScrewdriverIcon className="w-4 h-4" />
                Manage Custom Fields
              </div>

              <div
                onClick={() => {
                  setMenuOpen(false);
                  console.log('Refresh List');
                }}
                className="flex items-center gap-2 px-4 py-2 hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
              >
                <ArrowPathIcon className="w-4 h-4" />
                Refresh List
              </div>

              <div
                onClick={() => {
                  setMenuOpen(false);
                  console.log('Reset Column Width');
                }}
                className="flex items-center gap-2 px-4 py-2 hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
              >
                <ArrowPathIcon className="w-4 h-4" />
                Reset Column Width
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
