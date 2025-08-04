'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, PlusIcon, EllipsisHorizontalIcon, StarIcon } from '@heroicons/react/24/outline';

const expenseViews = [
  "All", "Unbilled", "Invoiced", "Reimbursed", "Billable",
  "Non-Billable", "With Receipts", "Without Receipts"
];

export default function ExpensesHeader() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selected, setSelected] = useState('All Expenses');
  const [favorites, setFavorites] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [dropdownOpen]);

  // Handlers
  const handleDropdownSelect = (view: string) => {
    setSelected(view === "All" ? "All Expenses" : view);
    setDropdownOpen(false);
  };

  const toggleFavorite = (view: string) => {
    setFavorites(prev =>
      prev.includes(view) ? prev.filter(v => v !== view) : [...prev, view]
    );
  };

  return (
    <div className="flex items-center justify-between px-2 sm:px-6 py-4 border-b bg-white relative">
      {/* Left: Receipts Inbox */}
      <div className="text-gray-600 font-medium text-base sm:text-lg mr-2 whitespace-nowrap">
        Receipts Inbox
      </div>
      {/* Center: All Expenses dropdown */}
      <div className="relative mx-2" ref={dropdownRef}>
        <button
          className="flex items-center text-base sm:text-lg font-medium bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg transition hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
          onClick={() => setDropdownOpen(v => !v)}
        >
          {selected}
          <ChevronDownIcon className={`ml-1 w-5 h-5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>
        {/* Dropdown */}
        {dropdownOpen && (
          <div className="absolute left-0 mt-2 w-56 rounded-xl shadow-2xl bg-white z-30 border border-gray-100 py-2 animate-fadein">
            {expenseViews.map(view => (
              <div key={view} className="flex items-center justify-between px-4 py-2 group">
                <button
                  className="text-gray-700 text-base w-full text-left group-hover:text-blue-600"
                  onClick={() => handleDropdownSelect(view)}
                >
                  {view}
                </button>
                <button
                  className="ml-2 p-1 rounded-full hover:bg-blue-50"
                  title={favorites.includes(view) ? "Unfavorite" : "Mark as favorite"}
                  onClick={() => toggleFavorite(view)}
                  tabIndex={-1}
                >
                  <StarIcon className={`w-5 h-5 ${favorites.includes(view) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                </button>
              </div>
            ))}
            <div className="border-t mt-2 pt-2">
              <button
                className="flex items-center gap-1 px-4 py-2 w-full text-blue-600 text-base hover:underline hover:bg-blue-50 rounded-b-xl"
                onClick={() => alert('New Custom View')}
              >
                <PlusIcon className="w-5 h-5" />
                New Custom View
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <button
          className="flex items-center bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-1.5 text-base font-medium shadow transition"
          onClick={() => alert('+ New')}
        >
          <PlusIcon className="w-5 h-5 mr-1" />
          New
        </button>
        <button
          className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition"
          onClick={() => alert('More actions')}
        >
          <EllipsisHorizontalIcon className="w-6 h-6 text-gray-500" />
        </button>
      </div>
    </div>
  );
}
