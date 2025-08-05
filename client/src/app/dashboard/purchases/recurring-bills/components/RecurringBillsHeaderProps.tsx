'use client';
import React, { FC, useState, useRef, useEffect } from 'react';
import {
  ChevronDownIcon,
  StarIcon,
  PlusIcon,
  EllipsisVerticalIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

interface RecurringBillsHeaderProps {
  onNew?: () => void;
  onViewChange?: (view: string) => void;
  onSort?: (field: string) => void;
  onImportRecurring?: () => void;
  onExportRecurring?: () => void;
  onExportCurrentView?: () => void;
  onRefresh?: () => void;
}

const VIEWS = ['All', 'Active', 'Stopped', 'Expired'];
const SORT_FIELDS = [
  'Created Time',
  'Vendor Name',
  'Profile Name',
  'Next Bill Date',
  'Amount',
];

export const RecurringBillsHeader: FC<RecurringBillsHeaderProps> = ({
  onNew,
  onViewChange,
  onSort,
  onImportRecurring,
  onExportRecurring,
  onExportCurrentView,
  onRefresh,
}) => {
  // dropdown state
  const [viewOpen, setViewOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [submenu, setSubmenu] = useState<'sort' | 'export' | null>(null);
  const [active, setActive] = useState(VIEWS[0]);
  const refView = useRef<HTMLDivElement>(null);
  const refMore = useRef<HTMLDivElement>(null);

  // close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        refView.current && !refView.current.contains(e.target as Node) &&
        refMore.current && !refMore.current.contains(e.target as Node)
      ) {
        setViewOpen(false);
        setMoreOpen(false);
        setSubmenu(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // handlers with console.log fallback
  const handleNew = () => (onNew ?? (() => console.log('New Recurring Bill')))();
  const handleView = (v: string) => {
    setActive(v);
    setViewOpen(false);
    (onViewChange ?? ((x) => console.log('View→', x)))(v);
  };
  const handleSort = (f: string) => {
    setMoreOpen(false);
    setSubmenu(null);
    (onSort ?? ((x) => console.log('Sort by', x)))(f);
  };
  const handleImport = () =>
    (onImportRecurring ?? (() => console.log('Import Recurring Bills')))();
  const handleExport = () =>
    (onExportRecurring ?? (() => console.log('Export Recurring Bills')))();
  const handleExportView = () =>
    (onExportCurrentView ?? (() => console.log('Export Current View')))();
  const handleRefresh = () =>
    (onRefresh ?? (() => console.log('Refresh List')))();

  return (
    <header className="
      w-full flex flex-col sm:flex-row items-start sm:items-center
      justify-between bg-white border-b border-gray-200
      px-4 py-3 sm:px-6 sm:py-4
    ">
      {/* View selector */}
      <div className="relative" ref={refView}>
        <button
          onClick={() => setViewOpen(o => !o)}
          className="
            inline-flex items-center gap-1 bg-gray-100 hover:bg-gray-200
            text-gray-900 font-semibold rounded-lg px-3 py-1 sm:px-4
            focus:outline-none focus:ring-2 focus:ring-blue-300
          "
        >
          <span className="text-base sm:text-lg">
            All Recurring Bills
          </span>
          <ChevronDownIcon
            className={`w-5 h-5 transform transition-transform ${
              viewOpen ? 'rotate-180' : 'rotate-0'
            }`}
          />
        </button>

        {viewOpen && (
          <div className="
            absolute left-0 mt-2 w-48 bg-white border border-gray-200
            rounded-lg shadow-lg z-50 flex flex-col
          ">
            {VIEWS.map(v => (
              <button
                key={v}
                onClick={() => handleView(v)}
                className="
                  w-full flex items-center justify-between px-4 py-2
                  hover:bg-blue-100 focus:outline-none
                "
              >
                <span className="text-sm sm:text-base">{v}</span>
                <StarIcon className="w-4 h-4 text-gray-400 hover:text-yellow-400" />
              </button>
            ))}

            <div className="border-t border-gray-200" />

            <button
              onClick={() => handleView('New Custom View')}
              className="
                w-full flex items-center gap-2 px-4 py-2
                text-sm sm:text-base hover:bg-blue-100 focus:outline-none
              "
            >
              <PlusIcon className="w-4 h-4 text-blue-600" />
              <span className="text-blue-600">New Custom View</span>
            </button>
          </div>
        )}
      </div>

      {/* Actions */}
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

        <div className="relative" ref={refMore}>
          <button
            onClick={() => { setMoreOpen(o => !o); setSubmenu(null); }}
            aria-label="More actions"
            className="
              p-2 rounded-lg hover:bg-blue-100
              focus:outline-none focus:ring-2 focus:ring-blue-300
            "
          >
            <EllipsisVerticalIcon className="w-6 h-6 text-gray-600" />
          </button>

          {moreOpen && (
            <div className="
              absolute right-0 mt-2 w-48 bg-white border border-gray-200
              rounded-lg shadow-lg z-50
            ">
              {/* Sort by */}
              <div
                onMouseEnter={() => setSubmenu('sort')}
                onMouseLeave={() => setSubmenu(null)}
                className="relative"
              >
                <button className="
                  flex items-center justify-between w-full px-4 py-2
                  text-left hover:bg-blue-100 focus:outline-none
                ">
                  <span>Sort by</span>
                  <ChevronRightIcon className="w-4 h-4 text-gray-500" />
                </button>
                {submenu === 'sort' && (
                  <div className="
                    absolute top-0 right-full mr-1 mt-2 w-48 bg-white
                    border border-gray-200 rounded-lg shadow-lg z-50
                  ">
                    {SORT_FIELDS.map(f => (
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

              {/* Import Recurring Bills */}
              <button
                onClick={handleImport}
                className="w-full px-4 py-2 text-left hover:bg-blue-100 focus:outline-none"
              >
                Import Recurring Bills
              </button>

              {/* Export */}
              <div
                onMouseEnter={() => setSubmenu('export')}
                onMouseLeave={() => setSubmenu(null)}
                className="relative"
              >
                <button className="
                  flex items-center justify-between w-full px-4 py-2
                  text-left hover:bg-blue-100 focus:outline-none
                ">
                  <span>Export</span>
                  <ChevronRightIcon className="w-4 h-4 text-gray-500" />
                </button>
                {submenu === 'export' && (
                  <div className="
                    absolute top-0 right-full mr-1 mt-2 w-48 bg-white
                    border border-gray-200 rounded-lg shadow-lg z-50
                  ">
                    <button
                      onClick={handleExport}
                      className="w-full px-4 py-2 text-left hover:bg-blue-100 focus:outline-none"
                    >
                      Export Recurring Bills
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

export default RecurringBillsHeader;
