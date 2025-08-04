'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronDownIcon,
  PlusIcon,
  EllipsisVerticalIcon,
  FunnelIcon,
  StarIcon,
} from '@heroicons/react/24/outline';

interface Item {
  name: string;
  purchaseDescription: string;
  purchaseRate: number;
  description: string;
  rate: number;
  unit: string;
}

const filters = [
  'All',
  'Active',
  'Inactive',
  'Sales',
  'Purchases',
  'Services',
  'Zoho CRM',
];

export default function ItemsSection() {
  const [items, setItems] = useState<Item[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [moreActionsOpen, setMoreActionsOpen] = useState(false);
  const [exportSubmenuOpen, setExportSubmenuOpen] = useState(false);
  const [selectedView, setSelectedView] = useState('All Items');
  const [activeHeader, setActiveHeader] = useState<string | null>(null);
  const router = useRouter();

  const dropdownRef = useRef<HTMLDivElement>(null);
  const moreActionsRef = useRef<HTMLDivElement>(null);

  // Close all dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
      if (
        moreActionsRef.current &&
        !moreActionsRef.current.contains(event.target as Node)
      ) {
        setMoreActionsOpen(false);
        setExportSubmenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleHeaderClick = (key: string) => {
    setActiveHeader((prev) => (prev === key ? null : key));
  };

  const handleNewItem = () => {
    console.log('Navigating to create item...');
    router.push('/dashboard/items/new');
  };

  const handleActionClick = (action: string) => {
    console.log(`Action clicked: ${action}`);
    setMoreActionsOpen(false);
    setExportSubmenuOpen(false);
  };

  return (
    <section className="w-full h-full overflow-auto bg-white text-sm">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b p-4 relative">
        {/* View Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1 text-xl font-medium text-gray-800 hover:bg-gray-100 px-3 py-1 rounded"
          >
            {selectedView}
            <ChevronDownIcon className="h-4 w-4 text-gray-500" />
          </button>

          {dropdownOpen && (
            <div className="absolute z-10 mt-2 w-56 rounded-md border bg-white shadow-xl overflow-hidden">
              <ul className="divide-y divide-gray-100 text-sm text-gray-700">
                {filters.map((view) => (
                  <li
                    key={view}
                    onClick={() => {
                      setSelectedView(view);
                      setDropdownOpen(false);
                      console.log(`View selected: ${view}`);
                    }}
                    className="flex justify-between items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <span>{view}</span>
                    <StarIcon className="w-4 h-4 text-gray-300" />
                  </li>
                ))}
              </ul>
              <div
                onClick={() => {
                  setDropdownOpen(false);
                  console.log('New Custom View clicked');
                }}
                className="flex items-center gap-2 px-4 py-3 text-blue-600 text-sm cursor-pointer hover:bg-gray-50"
              >
                <PlusIcon className="h-4 w-4" />
                New Custom View
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <div className="relative group">
            <button
              onClick={handleNewItem}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-1"
            >
              <PlusIcon className="w-4 h-4" />
              New
            </button>
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 whitespace-nowrap rounded bg-gray-900 text-white text-xs px-3 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
              Create New Item
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rotate-45 bg-gray-900" />
            </div>
          </div>

          {/* More Actions Dropdown */}
          <div className="relative" ref={moreActionsRef}>
            <button
              onClick={() => {
                setMoreActionsOpen((prev) => !prev);
                setExportSubmenuOpen(false);
              }}
              className="p-2 rounded-md hover:bg-gray-100"
              title="More Actions"
            >
              <EllipsisVerticalIcon className="w-5 h-5 text-gray-600" />
            </button>

            {moreActionsOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-md border bg-white shadow-lg z-20 text-sm">
                <ul className="divide-y divide-gray-100 text-gray-700">
                  <li
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleActionClick('Sort by')}
                  >
                    Sort by
                  </li>
                  <li
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleActionClick('Import Items')}
                  >
                    Import Items
                  </li>
                  <li
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer relative"
                    onMouseEnter={() => setExportSubmenuOpen(true)}
                    onMouseLeave={() => setExportSubmenuOpen(false)}
                  >
                    Export
                    {/* Export Submenu */}
                    {exportSubmenuOpen && (
                      <div className="absolute left-full top-0 ml-1 w-40 rounded-md border bg-white shadow-lg z-30">
                        <ul className="text-gray-700 divide-y divide-gray-100">
                          <li
                            className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleActionClick('Export as CSV')}
                          >
                            Export as CSV
                          </li>
                          <li
                            className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleActionClick('Export as PDF')}
                          >
                            Export as PDF
                          </li>
                        </ul>
                      </div>
                    )}
                  </li>
                  <li
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleActionClick('Preferences')}
                  >
                    Preferences
                  </li>
                  <li
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleActionClick('Refresh List')}
                  >
                    Refresh List
                  </li>
                  <li
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleActionClick('Reset Column Width')}
                  >
                    Reset Column Width
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-gray-50 text-xs text-gray-600 uppercase border-b">
            <tr>
              <th className="px-4 py-3 cursor-pointer">
                <button
                  onClick={() => handleHeaderClick('name')}
                  className={`flex items-center gap-2 ${
                    activeHeader === 'name' ? 'text-blue-600 font-semibold' : ''
                  }`}
                >
                  <FunnelIcon className="h-4 w-4" />
                  <input
                    type="checkbox"
                    className="accent-blue-500"
                    aria-label="Select all items"
                    title="Select all items"
                  />
                  <span>NAME</span>
                </button>
              </th>
              {[
                { key: 'purchaseDescription', label: 'PURCHASE DESCRIPTION' },
                { key: 'purchaseRate', label: 'PURCHASE RATE' },
                { key: 'description', label: 'DESCRIPTION' },
                { key: 'rate', label: 'RATE' },
                { key: 'unit', label: 'USAGE UNIT' },
              ].map(({ key, label }) => (
                <th key={key} className="px-4 py-3 cursor-pointer">
                  <button
                    onClick={() => handleHeaderClick(key)}
                    className={`uppercase ${
                      activeHeader === key ? 'text-blue-600 font-semibold' : ''
                    }`}
                  >
                    {label}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {items.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-16 text-gray-500 text-base font-medium"
                >
                  Goods and Services, if they have a price tag, put them here.
                </td>
              </tr>
            ) : (
              items.map((item, index) => (
                <tr key={index} className="border-t">
                  <td className="px-4 py-3">{item.name}</td>
                  <td className="px-4 py-3">{item.purchaseDescription}</td>
                  <td className="px-4 py-3">{item.purchaseRate}</td>
                  <td className="px-4 py-3">{item.description}</td>
                  <td className="px-4 py-3">{item.rate}</td>
                  <td className="px-4 py-3">{item.unit}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Active Header Content */}
      {activeHeader && (
        <div className="p-4 bg-blue-50 border-t text-sm text-blue-700">
          <strong>{activeHeader.replace(/([A-Z])/g, ' $1').toUpperCase()} filter active:</strong>{' '}
          You can show input fields, filter/sort controls here.
        </div>
      )}
    </section>
  );
}
