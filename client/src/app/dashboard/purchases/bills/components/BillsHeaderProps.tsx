'use client';
import React, { FC, useState, useRef, useEffect } from 'react';
import {
  ChevronDownIcon,
  CalendarDaysIcon,
  PlusIcon,
  EllipsisVerticalIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

interface BillsHeaderProps {
  onNew?: () => void;
  onViewChange?: (view: string) => void;
  onSort?: (field: string) => void;
  onImportBills?: () => void;
  onImportCreditNotes?: () => void;
  onExportBills?: () => void;
  onExportCurrentView?: () => void;
  onPreferences?: () => void;
  onRefresh?: () => void;
  onCalendar?: () => void;
}

const VIEWS = [
  'All',
  'Draft',
  'Pending Approval',
  'Open',
  'Overdue',
  'Unpaid',
  'Partially Paid',
  'Paid',
  'Void',
];

const SORT_FIELDS = [
  'Created Time',
  'Date',
  'Bill#',
  'Vendor Name',
  'Due Date',
  'Amount',
  'Balance Due',
  'Last Modified Time',
];

export const BillsHeader: FC<BillsHeaderProps> = ({
  onNew,
  onViewChange,
  onSort,
  onImportBills,
  onImportCreditNotes,
  onExportBills,
  onExportCurrentView,
  onPreferences,
  onRefresh,
  onCalendar,
}) => {
  // state
  const [viewOpen, setViewOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [submenu, setSubmenu] = useState<'sort' | 'import' | 'export' | null>(null);
  const [activeView, setActiveView] = useState('All');
  const [search, setSearch] = useState('');

  const viewRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  // outside click → close menus
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        viewRef.current && !viewRef.current.contains(e.target as Node) &&
        moreRef.current && !moreRef.current.contains(e.target as Node)
      ) {
        setViewOpen(false);
        setMoreOpen(false);
        setSubmenu(null);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // handler wrappers with console.log fallback
  const handleViewChange = (view: string) => {
    setActiveView(view);
    setViewOpen(false);
    setSearch('');
    (onViewChange ?? ((v: string) => console.log('View changed to', v)))(view);
  };

  const handleSort = (field: string) => {
    setMoreOpen(false);
    setSubmenu(null);
    (onSort ?? ((f: string) => console.log('Sort by', f)))(field);
  };

  const handleImportBills = () =>
    (onImportBills ?? (() => console.log('Import Bills')))();

  const handleImportCreditNotes = () =>
    (onImportCreditNotes ?? (() => console.log('Import Credit Notes')))();

  const handleExportBills = () =>
    (onExportBills ?? (() => console.log('Export Bills')) )();

  const handleExportCurrentView = () =>
    (onExportCurrentView ?? (() => console.log('Export Current View')))();

  const handlePreferences = () =>
    (onPreferences ?? (() => console.log('Preferences')))();

  const handleRefresh = () =>
    (onRefresh ?? (() => console.log('Refresh List')))();

  const handleCalendar = () =>
    (onCalendar ?? (() => console.log('Calendar')))();

  const handleNew = () =>
    (onNew ?? (() => console.log('New Bill')))();

  // filtered views
  const filtered = VIEWS.filter(v =>
    v.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <header className="
      w-full flex flex-col sm:flex-row items-start sm:items-center
      justify-between bg-white border-b border-gray-200
      px-4 py-3 sm:px-6 sm:py-4
    ">
      {/* Views dropdown */}
      <div className="relative" ref={viewRef}>
        <button
          onClick={() => setViewOpen(o => !o)}
          className="
            inline-flex items-center gap-1 bg-gray-100 hover:bg-gray-200
            text-gray-900 font-semibold rounded-lg px-3 py-1 sm:px-4
            focus:outline-none focus:ring-2 focus:ring-blue-300
          "
        >
          <span className="text-base sm:text-lg">{activeView} Bills</span>
          <ChevronDownIcon className={`
            w-5 h-5 transition-transform
            ${viewOpen ? 'rotate-180' : 'rotate-0'}
          `}/>
        </button>

        {viewOpen && (
          <div className="
            absolute left-0 mt-2 w-56 sm:w-64 bg-white
            border border-gray-200 rounded-lg shadow-lg z-50 flex flex-col
          ">
            {/* Search */}
            <div className="p-2">
              <div className="relative">
                <MagnifyingGlassIcon className="
                  w-5 h-5 text-gray-400 absolute left-3
                  top-1/2 transform -translate-y-1/2
                "/>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search views"
                  className="
                    w-full pl-10 pr-3 py-2 border rounded-lg text-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-300
                  "
                />
              </div>
            </div>
            {/* List */}
            <div className="max-h-48 overflow-y-auto">
              {filtered.map(v => (
                <button
                  key={v}
                  onClick={() => handleViewChange(v)}
                  className="
                    w-full flex items-center justify-between
                    px-4 py-2 text-left hover:bg-gray-100
                    focus:outline-none
                  "
                >
                  <span className="text-sm sm:text-base">{v}</span>
                  <CalendarDaysIcon className="w-4 h-4 text-gray-400"/>
                </button>
              ))}
            </div>
            <div className="border-t border-gray-200"/>
            {/* New Custom View */}
            <button
              onClick={() => handleViewChange('New Custom View')}
              className="
                w-full flex items-center gap-2 px-4 py-2
                text-sm sm:text-base hover:bg-gray-100
                focus:outline-none
              "
            >
              <PlusIcon className="w-4 h-4 text-blue-600"/>
              <span className="text-blue-600">New Custom View</span>
            </button>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="mt-3 sm:mt-0 flex items-center space-x-4">
        <button
          onClick={handleCalendar}
          aria-label="Calendar"
          className="
            p-2 rounded-lg hover:bg-gray-100
            focus:outline-none focus:ring-2 focus:ring-blue-300
          "
        >
          <CalendarDaysIcon className="w-6 h-6 text-gray-600"/>
        </button>

        <button
          onClick={handleNew}
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
        <div className="relative" ref={moreRef}>
          <button
            onClick={() => {
              setMoreOpen(o => !o);
              setSubmenu(null);
            }}
            aria-label="More actions"
            className="
              p-2 rounded-lg hover:bg-gray-100
              focus:outline-none focus:ring-2 focus:ring-blue-300
            "
          >
            <EllipsisVerticalIcon className="w-6 h-6 text-gray-600"/>
          </button>

          {moreOpen && (
            <div className="
              absolute right-0 mt-2 w-48 bg-white
              border border-gray-200 rounded-lg shadow-lg z-50
              flex flex-col
            ">
              {/* Sort by */}
              <button
                onMouseEnter={() => setSubmenu('sort')}
                onMouseLeave={() => setSubmenu(null)}
                className="
                  flex items-center justify-between w-full
                  px-4 py-2 text-left hover:bg-gray-100
                  focus:outline-none
                "
              >
                <span>Sort by</span>
                <ChevronRightIcon className="w-4 h-4 text-gray-500"/>
              </button>
              {/* Import */}
              <button
                onMouseEnter={() => setSubmenu('import')}
                onMouseLeave={() => setSubmenu(null)}
                className="
                  flex items-center justify-between w-full
                  px-4 py-2 text-left hover:bg-gray-100
                  focus:outline-none
                "
              >
                <span>Import</span>
                <ChevronRightIcon className="w-4 h-4 text-gray-500"/>
              </button>
              {/* Export */}
              <button
                onMouseEnter={() => setSubmenu('export')}
                onMouseLeave={() => setSubmenu(null)}
                className="
                  flex items-center justify-between w-full
                  px-4 py-2 text-left hover:bg-gray-100
                  focus:outline-none
                "
              >
                <span>Export</span>
                <ChevronRightIcon className="w-4 h-4 text-gray-500"/>
              </button>

              <div className="border-t border-gray-200"/>

              {/* Preferences */}
              <button
                onClick={handlePreferences}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:outline-none"
              >
                Preferences
              </button>
              {/* Refresh */}
              <button
                onClick={handleRefresh}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:outline-none"
              >
                Refresh List
              </button>

              {/* Submenus */}
              {submenu === 'sort' && (
                <div className="
                  absolute top-0 right-full mr-1 mt-2 w-48
                  bg-white border border-gray-200 rounded-lg
                  shadow-lg z-50 flex flex-col
                ">
                  {SORT_FIELDS.map(f => (
                    <button
                      key={f}
                      onClick={() => handleSort(f)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:outline-none"
                    >
                      {f}
                    </button>
                  ))}
                </div>
              )}
              {submenu === 'import' && (
                <div className="
                  absolute top-0 right-full mr-1 mt-2 w-48
                  bg-white border border-gray-200 rounded-lg
                  shadow-lg z-50 flex flex-col
                ">
                  <button
                    onClick={handleImportBills}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:outline-none"
                  >
                    Import Bills
                  </button>
                  <button
                    onClick={handleImportCreditNotes}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:outline-none"
                  >
                    Import Credit Notes
                  </button>
                </div>
              )}
              {submenu === 'export' && (
                <div className="
                  absolute top-0 right-full mr-1 mt-2 w-48
                  bg-white border border-gray-200 rounded-lg
                  shadow-lg z-50 flex flex-col
                ">
                  <button
                    onClick={handleExportBills}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:outline-none"
                  >
                    Export Bills
                  </button>
                  <button
                    onClick={handleExportCurrentView}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:outline-none"
                  >
                    Export Current View
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default BillsHeader;
