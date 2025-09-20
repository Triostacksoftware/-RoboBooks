'use client';

import React, { useEffect, useRef } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { createPortal } from 'react-dom';
import { isTextField } from '@/utils/isTextField';

const GROUPS = [
  {
    title: 'GENERAL',
    items: [
      'Add Users',
      'Item',
      'Inventory Adjustments',
      'Journal Entry',
      'Log Time',
      'Weekly Log',
    ],
  },
  {
    title: 'SALES',
    items: [
      'Customer',
      'Quotes',
      'Delivery Challan',
      'Invoices',
      'Recurring Invoice',
      'Retail Invoice',
      'Sales Order',
      'Customer Payment',
      'Credit Notes',
    ],
  },
  {
    title: 'PURCHASES',
    items: [
      'Vendor',
      'Expenses',
      'Recurring Expense',
      'Bills',
      'Recurring Bills',
      'Purchase Orders',
      'Vendor Payment',
      'Vendor Credits',
    ],
  },
  {
    title: 'BANKING',
    items: [
      'Bank Transfer',
      'Card Payment',
      'Owner Drawings',
      'Other Income',
    ],
  },
];

export default function NewMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // escape to close
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !isTextField(e.target)) onClose();
    }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // click outside to close
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    if (open) document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <>
      {/* backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40" />

      {/* panel */}
      <div
        ref={ref}
        className="fixed top-14 left-1/2 transform -translate-x-1/2 z-50 w-[90vw] max-w-4xl h-[70vh]
                   bg-white rounded-xl shadow-2xl overflow-auto p-6"
      >
        {/* close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded hover:bg-gray-100"
        >
          <XMarkIcon className="w-5 h-5 text-gray-600" />
        </button>

        {/* grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {GROUPS.map((group) => (
            <div key={group.title}>
              <h4 className="flex items-center gap-2 font-semibold text-gray-700 mb-3">
                {/* You can swap this with an icon per group if desired */}
                {group.title}
              </h4>
              <ul className="space-y-2">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-gray-700 hover:text-blue-600 cursor-pointer"
                  >
                    <span className="w-4 h-4 flex-shrink-0 text-gray-400">+</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </>,
    document.body
  );
}
