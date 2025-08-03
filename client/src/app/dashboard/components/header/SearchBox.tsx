'use client';

import React, { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { MagnifyingGlassIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

import { useKey, useOnClickOutside } from './hooks';
import SearchableSelect from './search/SearchableSelect';
import ZiaSearchOverlay from './search/ZiaSearchOverlay';
import AdvancedSearchModal from './search/AdvancedSearchModal';

// your 25 top‐level categories
const CATEGORIES = [
  'Customers','Items','Banking','Quotes','Sales Orders','Delivery Challans',
  'Invoices','Credit Notes','Vendors','Expenses','Recurring Expenses',
  'Purchase Orders','Bills','Payments Made','Recurring Bills','Vendor Credits',
  'Projects','Timesheet','Journals','Chart of Accounts','Documents','Tasks',
];

export default function SearchBox() {
  const [catOpen, setCatOpen]           = useState(false);
  const [category, setCategory]         = useState('Customers');
  const [query, setQuery]               = useState('');
  const [showZia, setShowZia]           = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // close dropdown if you click outside:
  const wrapRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(wrapRef, () => setCatOpen(false));

  // Escape closes everything:
  useKey('Escape', () => {
    setCatOpen(false);
    setShowZia(false);
    setShowAdvanced(false);
  });

  // Alt + / → advanced
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.altKey && e.key === '/') {
        e.preventDefault();
        setCatOpen(false);
        setShowAdvanced(true);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setShowZia(true);
  }

  return (
    <>
      <div ref={wrapRef} className="relative w-[clamp(18rem,42vw,36rem)] group">
        <form
          onSubmit={handleSubmit}
          className={clsx(
            'flex items-center gap-2 rounded-md border border-gray-300',
            'bg-white px-3 py-2 text-gray-800'
          )}
        >
          {/* toggle categories */}
          <button
            type="button"
            onClick={() => setCatOpen(v => !v)}
            className="flex items-center gap-1"
            aria-expanded={catOpen}
            aria-label="Toggle category"
          >
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-600" />
            <ChevronDownIcon
              className={clsx(
                'h-4 w-4 transition-transform',
                catOpen && 'rotate-180'
              )}
            />
          </button>

          {/* search input */}
          <input
            type="text"
            className="flex-1 bg-transparent placeholder-gray-400 outline-none"
            placeholder={`Search in ${category}`}
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </form>

        {/* Category dropdown portal */}
        {catOpen && (
          <div className="absolute left-0 top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
            <SearchableSelect
              options={CATEGORIES}
              value={category}
              onChange={val => {
                setCategory(val);
                setCatOpen(false);
              }}
              placeholder="Search"
              footerActions={[
                {
                  label: 'Advanced Search',
                  kbd: 'Alt + /',
                  onClick: () => {
                    setCatOpen(false);
                    setShowAdvanced(true);
                  },
                },
                {
                  label: 'Search across Zoho',
                  kbd: 'Ctrl + /',
                  onClick: () => {
                    setCatOpen(false);
                    setShowZia(true);
                  },
                },
              ]}
            />
          </div>
        )}
      </div>

      {/* Overlays */}
      <ZiaSearchOverlay open={showZia} onClose={() => setShowZia(false)} />
      <AdvancedSearchModal
        open={showAdvanced}
        onClose={() => setShowAdvanced(false)}
        category={category}
      />
    </>
  );
}
