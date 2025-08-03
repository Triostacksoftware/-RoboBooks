'use client';

import { useRef } from 'react';
import { Portal, useKey, useOnClickOutside } from './hooks';
import { PlusSmallIcon } from '@heroicons/react/24/outline';

export default function NewMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useOnClickOutside(ref, onClose);
  useKey('Escape', onClose, open);
  if (!open) return null;

  const Section = ({ title, items }: { title: string; items: string[] }) => (
    <div className="min-w-[220px]">
      <div className="px-4 pb-2 text-xs font-semibold tracking-wide text-gray-500">{title}</div>
      <ul className="px-2">
        {items.map((label) => (
          <li key={label}>
            <button className="group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-gray-50">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-gray-900 text-white">
                <PlusSmallIcon className="h-3 w-3" />
              </span>
              <span className="text-sm text-gray-800">{label}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <Portal>
      <div className="fixed inset-0 z-[90]" aria-hidden onClick={onClose} />
      <div
        ref={ref}
        className="absolute right-0 top-12 z-[95] w-[900px] max-w-[95vw] overflow-hidden rounded-xl border bg-white shadow-2xl"
      >
        <div className="flex gap-6 p-4 overflow-x-auto">
          <Section
            title="GENERAL"
            items={['Add Users', 'Item', 'Inventory Adjustments', 'Journal Entry', 'Log Time', 'Weekly Log']}
          />
          <Section
            title="SALES"
            items={[
              'Customer',
              'Quotes',
              'Delivery Challan',
              'Invoices',
              'Recurring Invoice',
              'Retail Invoice',
              'Sales Order',
              'Customer Payment',
              'Credit Notes',
            ]}
          />
          <Section
            title="PURCHASES"
            items={['Vendor', 'Expenses', 'Recurring Expense', 'Bills', 'Recurring Bills', 'Purchase Orders', 'Vendor Payment', 'Vendor Credits']}
          />
          <Section title="BANKING" items={['Bank Transfer', 'Card Payment', 'Owner Drawings', 'Other Income']} />
        </div>
      </div>
    </Portal>
  );
}
