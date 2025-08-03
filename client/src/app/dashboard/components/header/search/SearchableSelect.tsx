'use client';

import React, { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { useKey, useOnClickOutside } from '../hooks';
import SearchableSelect from '../search/SearchableSelect';           // ← fixed
import ZiaSearchOverlay from '../search/ZiaSearchOverlay';         // ← fixed
import AdvancedSearchModal from '../search/AdvancedSearchModal';   // ← fixed

/** Your 25 top-level categories */
const CATEGORIES = [
  'Customers','Items','Banking','Quotes','Sales Orders','Delivery Challans',
  'Invoices','Credit Notes','Vendors','Expenses','Recurring Expenses',
  'Purchase Orders','Bills','Payments Made','Recurring Bills','Vendor Credits',
  'Projects','Timesheet','Journals','Chart of Accounts','Documents','Tasks',
];


export default function SearchBox() {
  const [catOpen, setCatOpen]           = useState(false);
  const [category, setCategory]         = useState<string>('Customers');
  const [query, setQuery]               = useState('');
  const [showZia, setShowZia]           = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const wrapRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(wrapRef, () => setCatOpen(false));

  // Escape closes everything
  useKey('Escape', () => {
    setCatOpen(false);
    setShowAdvanced(false);
    setShowZia(false);
  });

  // Alt+/ opens advanced search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey && e.key === '/') {
        e.preventDefault();
        setCatOpen(false);
        setShowAdvanced(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowZia(true);
  };

  return (
    <>
      <div
        ref={wrapRef}
        className={clsx(
          'group relative',
          'w-[clamp(18rem,42vw,36rem)]',
          'transition-[width] duration-300',
          'hover:w-[clamp(19.8rem,46.2vw,39.6rem)]',
          'focus-within:w-[clamp(19.8rem,46.2vw,39.6rem)]'
        )}
      >
        <form
          onSubmit={onSubmit}
          className="
            flex items-center rounded-lg border border-white/20 bg-white/5
            px-2 py-[6px] text-sm text-white
            focus-within:border-sky-400/60 focus-within:shadow-[0_0_0_2px_rgba(56,189,248,.35)]
          "
        >
          {/* LEFT trigger */}
          <button
            type="button"
            onClick={() => setCatOpen(v => !v)}
            aria-expanded={catOpen}
            aria-controls="search-category-menu"
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 hover:bg-white/10 focus:outline-none focus-visible:ring-0"
          >
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M21 21l-4.35-4.35M10 17a7 7 0 100-14 7 7 0 000 14z"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <svg
              className={clsx(
                'h-4 w-4 text-sky-300/90 transition-transform',
                catOpen ? 'rotate-180' : 'rotate-0'
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M19 9l-7 7-7-7" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* divider */}
          <div className="mx-2 h-5 w-px bg-white/20" />

          {/* RIGHT input */}
          <input
            type="text"
            className="min-w-0 flex-1 bg-transparent placeholder:text-white/50 outline-none"
            placeholder={`Search in ${category} ( / )`}
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </form>

        {/* Category dropdown */}
        {catOpen && (
          <div
            id="search-category-menu"
            className="absolute left-0 top-[110%] z-[120] w-[min(38rem,95vw)] overflow-hidden rounded-lg border border-white/15 bg-[#0f1524] shadow-2xl"
          >
            <SearchableSelect
              options={CATEGORIES}                         // now recognized as a prop
              value={category}
              onChange={(val: string) => {                // explicitly typed
                setCategory(val);
                setCatOpen(false);
              }}
              placeholder="Search"
              footerActions={[
                {
                  icon: 'search',
                  label: 'Advanced Search',
                  kbd: 'Alt + /',
                  onClick: () => {
                    setCatOpen(false);
                    setShowAdvanced(true);
                  },
                },
                {
                  icon: 'zoho',
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
