'use client';
import React, { FC, useState, useRef, useEffect } from 'react';
import {
  ChevronDownIcon,
  MagnifyingGlassIcon,
  StarIcon,
  PlusIcon,
  EllipsisVerticalIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

interface PaymentsHeaderProps {
  onNew?: () => void;
  onViewChange?: (view: string) => void;
  onSort?: (field: string) => void;
  onImportPayments?: () => void;
  onExportPayments?: () => void;
  onExportCurrentView?: () => void;
  onPreferences?: () => void;
  onRefresh?: () => void;
}

const VIEWS = [
  'All Payments',
  'Draft',
  'Paid',
  'Void',
  'Paid via Check',
  'To Be Printed Checks',
  'Uncleared Checks',
  'Cleared Checks',
  'Void Checks',
  'Advance Payments',
  'Bill Payments',
];

const SORT_FIELDS = [
  'Created Time',
  'Date',
  'Payment #',
  'Vendor Name',
  'Mode',
  'Amount',
  'Unused Amount',
];

export const PaymentsHeader: FC<PaymentsHeaderProps> = ({
  onNew,
  onViewChange,
  onSort,
  onImportPayments,
  onExportPayments,
  onExportCurrentView,
  onPreferences,
  onRefresh,
}) => {
  const [viewOpen, setViewOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [submenu, setSubmenu] = useState<'sort' | 'export' | null>(null);
  const [search, setSearch] = useState('');
  const [active, setActive] = useState(VIEWS[0]);

  const viewRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  // close menus on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        viewRef.current && !viewRef.current.contains(e.target as Node) &&
        moreRef.current && !moreRef.current.contains(e.target as Node)
      ) {
        setViewOpen(false);
        setMoreOpen(false);
        setSubmenu(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // fallback handlers
  const handleNew = () => (onNew ?? (() => console.log('New Payment')))();
  const handleView = (v: string) => {
    setActive(v);
    setViewOpen(false);
    (onViewChange ?? ((x) => console.log('View →', x)))(v);
  };
  const handleSort = (f: string) => {
    setMoreOpen(false);
    setSubmenu(null);
    (onSort ?? ((x) => console.log('Sort by', x)))(f);
  };
  const handleImport = () =>
    (onImportPayments ?? (() => console.log('Import Payments')))();
  const handleExport = () =>
    (onExportPayments ?? (() => console.log('Export Payments')))();
  const handleExportView = () =>
    (onExportCurrentView ?? (() => console.log('Export Current View')))();
  const handlePreferences = () =>
    (onPreferences ?? (() => console.log('Preferences')))();
  const handleRefresh = () =>
    (onRefresh ?? (() => console.log('Refresh List')))();

  const filtered = VIEWS.filter((v) =>
    v.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <header className="
      w-full flex flex-col sm:flex-row items-start sm:items-center
      justify-between bg-white border-b border-gray-200
      px-4 py-3 sm:px-6 sm:py-4
    ">
      {/* View dropdown */}
      <div className="relative" ref={viewRef}>
        <button
          onClick={() => setViewOpen((o) => !o)}
          className="
            inline-flex items-center gap-1 bg-gray-100 hover:bg-gray-200
            text-gray-900 font-semibold rounded-lg px-3 py-1 sm:px-4
            focus:outline-none focus:ring-2 focus:ring-blue-300
          "
        >
          <span className="text-base sm:text-lg">{active}</span>
          <ChevronDownIcon
            className={`w-5 h-5 transform transition-transform ${
              viewOpen ? 'rotate-180' : 'rotate-0'
            }`}
          />
        </button>

        {viewOpen && (
          <div className="
            absolute left-0 mt-2 w-64 sm:w-72 bg-white
            border border-gray-200 rounded-lg shadow-lg z-50 flex flex-col
          ">
            {/* Search */}
            <div className="p-2">
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search views"
                  className="
                    w-full pl-10 pr-3 py-2 border rounded-lg text-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-300
                  "
                />
              </div>
            </div>

            {/* List */}
            <div className="max-h-60 overflow-y-auto">
              {filtered.map((view) => (
                <button
                  key={view}
                  onClick={() => handleView(view)}
                  className="
                    w-full flex items-center justify-between
                    px-4 py-2 hover:bg-blue-100 focus:outline-none
                  "
                >
                  <span className="text-sm sm:text-base">{view}</span>
                  <StarIcon className="w-4 h-4 text-gray-400 hover:text-yellow-400" />
                </button>
              ))}
            </div>

            <div className="border-t border-gray-200" />

            {/* New Custom View */}
            <button
              onClick={() => handleView('New Custom View')}
              className="
                w-full flex items-center gap-2 px-4 py-2 text-sm sm:text-base
                hover:bg-blue-100 focus:outline-none
              "
            >
              <PlusIcon className="w-4 h-4 text-blue-600" />
              <span className="text-blue-600">New Custom View</span>
            </button>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="mt-3 sm:mt-0 flex items-center space-x-4">
        <button
          onClick={handleNew}
          className="
            flex items-center gap-1 bg-blue-600 hover:bg-blue-700
            active:bg-blue-800 text-white px-3 py-1.5 sm:px-4 sm:py-2
            rounded-lg shadow font-semibold text-sm sm:text-base
            transition focus:outline-none focus:ring-2 focus:ring-blue-300
          "
        >
          <PlusIcon className="w-5 h-5" />
          <span className="hidden sm:inline">New</span>
        </button>

        {/* More menu */}
        <div className="relative" ref={moreRef}>
          <button
            onClick={() => {
              setMoreOpen((o) => !o);
              setSubmenu(null);
            }}
            aria-label="More actions"
            className="
              p-2 rounded-lg hover:bg-blue-100
              focus:outline-none focus:ring-2 focus:ring-blue-300
            "
          >
            <EllipsisVerticalIcon className="w-6 h-6 text-gray-600" />
          </button>

          {moreOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              {/* Sort by */}
              <div
                onMouseEnter={() => setSubmenu('sort')}
                onMouseLeave={() => setSubmenu(null)}
                className="relative"
              >
                <button className="flex items-center justify-between w-full px-4 py-2 text-left hover:bg-blue-100 focus:outline-none">
                  <span>Sort by</span>
                  <ChevronRightIcon className="w-4 h-4 text-gray-500" />
                </button>
                {submenu === 'sort' && (
                  <div className="absolute top-0 right-full mr-1 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    {SORT_FIELDS.map((f) => (
                      <button
                        key={f}
                        onClick={() => handleSort(f)}
                        className="w-full px-4 py-2 text-left hover:bg-blue-100 focus:outline-none"
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Import Payments */}
              <button
                onClick={handleImport}
                className="w-full px-4 py-2 text-left hover:bg-blue-100 focus:outline-none"
              >
                Import Payments
              </button>

              {/* Export submenu */}
              <div
                onMouseEnter={() => setSubmenu('export')}
                onMouseLeave={() => setSubmenu(null)}
                className="relative"
              >
                <button className="flex items-center justify-between w-full px-4 py-2 text-left hover:bg-blue-100 focus:outline-none">
                  <span>Export</span>
                  <ChevronRightIcon className="w-4 h-4 text-gray-500" />
                </button>
                {submenu === 'export' && (
                  <div className="absolute top-0 right-full mr-1 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <button
                      onClick={handleExport}
                      className="w-full px-4 py-2 text-left hover:bg-blue-100 focus:outline-none"
                    >
                      Export Payments
                    </button>
                    <button
                      onClick={handleExportView}
                      className="w-full px-4 py-2 text-left hover:bg-blue-100 focus:outline-none"
                    >
                      Export Current View
                    </button>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200" />

              {/* Preferences */}
              <button
                onClick={handlePreferences}
                className="w-full px-4 py-2 text-left hover:bg-blue-100 focus:outline-none"
              >
                Preferences
              </button>
              {/* Refresh List */}
              <button
                onClick={handleRefresh}
                className="w-full px-4 py-2 text-left hover:bg-blue-100 focus:outline-none"
              >
                Refresh List
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default PaymentsHeader;
