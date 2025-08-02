'use client';

import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

import { useKey, useOnClickOutside } from './hooks';
import SearchableSelect from './search/SearchableSelect';
import ZiaSearchOverlay from './search/ZiaSearchOverlay';
import AdvancedSearchModal from './search/AdvancedSearchModal';

const CATEGORIES = [
  'Customers','Items','Banking','Quotes','Sales Orders','Delivery Challans','Invoices',
  'Credit Notes','Vendors','Expenses','Recurring Expenses','Purchase Orders','Bills',
  'Payments Made','Recurring Bills','Vendor Credits','Projects','Timesheet',
  'Journals','Chart of Accounts','Documents','Tasks',
];

type Props = { onOpenRecent?: () => void };

export default function SearchBox({ onOpenRecent }: Props) {
  // category dropdown state
  const [catOpen, setCatOpen] = useState(false);
  const [category, setCategory] = useState('Customers');

  // input text
  const [q, setQ] = useState('');

  // overlays
  const [showZia, setShowZia] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const wrapRef = useRef<HTMLDivElement | null>(null);
  useOnClickOutside(wrapRef, () => setCatOpen(false));

  // Escape closes everything
  useKey('Escape', () => {
    setCatOpen(false);
    setShowAdvanced(false);
    setShowZia(false);
  });

  // Alt + / → open Advanced
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
    setShowZia(true); // placeholder action
  };

  return (
    <>
      <div
        ref={wrapRef}
        className={clsx(
          'group relative',
          // base width with smooth ~10% expansion
          'w-[clamp(18rem,42vw,36rem)]',
          'transition-[width] duration-300',
          'hover:w-[clamp(19.8rem,46.2vw,39.6rem)]',
          'focus-within:w-[clamp(19.8rem,46.2vw,39.6rem)]'
        )}
      >
        {/* Input shell */}
        <form
          onSubmit={onSubmit}
          className="flex items-center rounded-lg border border-white/20 bg-white/5 px-2 py-2 text-sm text-white focus-within:border-sky-400/60 focus-within:shadow-[0_0_0_2px_rgba(56,189,248,.35)]"
        >
          {/* LEFT segment – only toggles category menu */}
          <button
            type="button"
            onClick={() => setCatOpen(v => !v)}
            aria-expanded={catOpen}
            aria-controls="search-category-menu"
            className="relative inline-flex items-center gap-1 rounded-md px-2 py-1 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          >
            <MagnifyingGlassIcon className="h-5 w-5 text-white" />
            <ChevronDownIcon
              className={clsx(
                'h-4 w-4 text-sky-300/90 transition-transform',
                catOpen ? 'rotate-180' : 'rotate-0'
              )}
            />
          </button>

          {/* Divider */}
          <div className="mx-2 h-5 w-px bg-white/20" aria-hidden />

          {/* RIGHT segment – pure input form (does not toggle categories) */}
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => setShowZia(false)}
            placeholder={`Search in ${category} ( / )`}
            className="min-w-0 flex-1 bg-transparent placeholder:text-white/50 outline-none"
          />
        </form>

        {/* Category dropdown under the left edge of the box */}
        {catOpen && (
          <div
            id="search-category-menu"
            className="absolute left-0 top-[110%] z-40 overflow-hidden rounded-lg border border-white/15 bg-[#0f1524]"
          >
            <SearchableSelect
              value={category}
              onChange={(v) => {
                setCategory(v);
                setCatOpen(false);
              }}
              options={CATEGORIES}
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

      {/* overlays */}
      <ZiaSearchOverlay open={showZia} onClose={() => setShowZia(false)} />
      <AdvancedSearchModal
        open={showAdvanced}
        onClose={() => setShowAdvanced(false)}
        category={category}
      />
    </>
  );
}
