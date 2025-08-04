// components/SearchBox.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import SearchableSelect, { Option } from './search/SearchableSelect';
import AdvancedSearchModal from './search/AdvancedSearchModal';
import ZiaSearchOverlay from './search/ZiaSearchOverlay';

const OPTIONS: Option[] = [
  { label: 'Customers' },
  { label: 'Items' },
  { label: 'Banking' },
  { label: 'Quotes' },
  { label: 'Sales Orders' },
  { label: 'Delivery Challans' },
  { label: 'Invoices' },
  { label: 'Credit Notes' },
  { label: 'Vendors' },
  { label: 'Projects' },
  { label: 'Timesheet' },
  { label: 'Chart of Accounts' },
  { label: 'Documents' },
  { label: 'Tasks' },
  { label: 'Advanced Search', hotkey: 'Alt + /' },
  { label: 'Search within Robo', hotkey: 'Ctrl + /' },
];

export default function SearchBox() {
  const [selected, setSelected] = useState<string>('Customers');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState<boolean>(false);
  const [isZiaOpen, setIsZiaOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // close dropdown on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  // handle selection from dropdown
  const handleSelect = (label: string) => {
    if (label === 'Advanced Search') {
      setIsAdvancedOpen(true);
    } else if (label === 'Search within Robo') {
      setIsZiaOpen(true);
    } else {
      setSelected(label);
    }
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="w-full max-w-2xl mx-auto px-4 relative">
      <div
        className={`
          flex items-center bg-[#2D2F3A] rounded-xl
          h-10 px-3
          md:h-12 md:px-4
          lg:h-14 lg:px-5
          transition-transform transform hover:scale-110 duration-200
        `}
      >
        <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />

        <button
          onClick={() => setIsOpen((o) => !o)}
          className="flex items-center text-white text-sm md:text-base ml-2 focus:outline-none"
        >
          <span>{selected}</span>
          <ChevronDownIcon className="w-4 h-4 text-gray-400 ml-1" />
        </button>

        <input
          type="text"
          placeholder={`Search in ${selected} ( / )`}
          className="
            flex-grow bg-transparent placeholder-gray-500 text-white
            text-sm md:text-base lg:text-lg
            ml-4 focus:outline-none
          "
        />
      </div>

      {isOpen && (
        <div className="absolute top-full mt-2 w-full z-10">
          <SearchableSelect
            options={OPTIONS}
            selected={selected}
            onSelect={handleSelect}
          />
        </div>
      )}

      {/* Advanced Search Modal */}
      <AdvancedSearchModal
        isOpen={isAdvancedOpen}
        onClose={() => setIsAdvancedOpen(false)}
        onSearch={(data) => {
          console.log('Advanced search data:', data);
          // TODO: fire your advanced search API with `data`
        }}
      />

      {/* Zia Search Overlay */}
      <ZiaSearchOverlay
        isOpen={isZiaOpen}
        onClose={() => setIsZiaOpen(false)}
      />
    </div>
  );
}
