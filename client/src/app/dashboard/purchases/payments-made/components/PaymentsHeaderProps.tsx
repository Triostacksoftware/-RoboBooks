'use client';
import React, { FC, useState, useRef, useEffect } from 'react';
import {
  ChevronDownIcon,
  PlusIcon,
  EllipsisVerticalIcon,
} from '@heroicons/react/24/outline';

interface PaymentsHeaderProps {
  onNew?: () => void;
  onMore?: () => void;
  onViewChange?: (view: string) => void;
}

const VIEWS = [
  'All Payments',
  'Pending',
  'Completed',
  'Failed',
];

export const PaymentsHeader: FC<PaymentsHeaderProps> = ({
  onNew,
  onMore,
  onViewChange,
}) => {
  const [viewOpen, setViewOpen] = useState(false);
  const [activeView, setActiveView] = useState(VIEWS[0]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setViewOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selectView = (view: string) => {
    setActiveView(view);
    setViewOpen(false);
    onViewChange?.(view);
  };

  return (
    <header className="
      w-full flex flex-col sm:flex-row items-start sm:items-center
      justify-between bg-white border-b border-gray-200
      px-4 py-3 sm:px-6 sm:py-4
    ">
      {/* View selector */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setViewOpen(o => !o)}
          className="
            inline-flex items-center gap-1 bg-gray-100 hover:bg-gray-200
            text-gray-900 font-semibold rounded-lg px-3 py-1 sm:px-4
            focus:outline-none focus:ring-2 focus:ring-blue-300
          "
        >
          <span className="text-base sm:text-lg">{activeView}</span>
          <ChevronDownIcon className={`
            w-5 h-5 transition-transform
            ${viewOpen ? 'rotate-180' : 'rotate-0'}
          `}/>
        </button>

        {viewOpen && (
          <div className="
            absolute left-0 mt-2 w-48 bg-white border border-gray-200
            rounded-lg shadow-lg z-50
          ">
            {VIEWS.map(view => (
              <button
                key={view}
                onClick={() => selectView(view)}
                className="
                  w-full text-left px-4 py-2 hover:bg-gray-100
                  focus:outline-none
                "
              >
                {view}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-3 sm:mt-0 flex items-center space-x-4">
        {/* New Payment */}
        <button
          onClick={onNew}
          className="
            flex items-center gap-1 bg-blue-600 hover:bg-blue-700
            active:bg-blue-800 text-white px-3 py-1.5 sm:px-4 sm:py-2
            rounded-lg shadow font-semibold text-sm sm:text-base
            transition focus:outline-none focus:ring-2 focus:ring-blue-300
          "
        >
          <PlusIcon className="w-5 h-5"/>
          <span className="hidden sm:inline">New</span>
        </button>

        {/* More menu */}
        <button
          onClick={onMore}
          aria-label="More actions"
          className="
            p-2 rounded-lg hover:bg-gray-100 focus:outline-none
            focus:ring-2 focus:ring-blue-300
          "
        >
          <EllipsisVerticalIcon className="w-6 h-6 text-gray-600"/>
        </button>
      </div>
    </header>
  );
};

export default PaymentsHeader;
