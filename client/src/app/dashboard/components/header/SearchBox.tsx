// components/SearchBox.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import SearchableSelect, { Option } from "./search/SearchableSelect";
import AdvancedSearchModal from "./search/AdvancedSearchModal";
import ZiaSearchOverlay from "./search/ZiaSearchOverlay";

type SearchBoxProps = {
  onAdvancedRequest?: () => void;
};

const OPTIONS: Option[] = [
  { label: "Customers" },
  { label: "Items" },
  { label: "Banking" },
  { label: "Quotes" },
  { label: "Sales Orders" },
  { label: "Delivery Challans" },
  { label: "Invoices" },
  { label: "Credit Notes" },
  { label: "Vendors" },
  { label: "Projects" },
  { label: "Timesheet" },
  { label: "Chart of Accounts" },
  { label: "Documents" },
  { label: "Tasks" },
  { label: "Advanced Search", hotkey: "Alt + /" },
  { label: "Search within Robo", hotkey: "Ctrl + /" },
];

export default function SearchBox() {
  const [selected, setSelected] = useState<string>("Customers");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isZiaOpen, setIsZiaOpen] = useState(false);
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
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // handle selecting from the dropdown
  const handleSelect = (label: string) => {
    if (label === "Advanced Search") {
      setIsAdvancedOpen(true);
    } else if (label === "Search within Robo") {
      setIsZiaOpen(true);
    } else {
      setSelected(label);
    }
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="w-3/5 px-4 relative">
      <div
        className={`
          flex items-center bg-[#2D2F3A] rounded-2xl
          h-6 px-2
          md:h-8 md:px-3
          lg:h-8 lg:px-4
        `}
      >
        <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />

        {/* Section dropdown */}
        <button
          onClick={() => setIsOpen((o) => !o)}
          className="flex items-center text-white text-sm md:text-base ml-2 focus:outline-none"
        >
          <span>{selected}</span>
           {isOpen ? (
           <ChevronUpIcon className="w-4 h-4 text-gray-400 ml-1 transition-transform" />
         ) : (
           <ChevronDownIcon className="w-4 h-4 text-gray-400 ml-1 transition-transform" />
         )}
        </button>

        {/* Gray separator line */}
        <div className="w-px h-4 md:h-5 bg-gray-300 mx-2 md:mx-3" />

        {/* Search input */}
        <input
          type="text"
          placeholder={`Search in ${selected} ( / )`}
          className="
           flex-grow bg-transparent placeholder-gray-500 text-white
           text-sm md:text-base lg:text-lg ml-4 rounded-lg
           focus:outline-none focus:ring-0 focus:shadow-none focus:border-gray-400
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
          console.log("Advanced search:", data);
          // TODO: integrate your search API here
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
