'use client';                     // ← STEP 1: tells Next it's a Client Component

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Truck,
  ShoppingCart,
} from 'lucide-react';

/** menu definition */
type Item = { label: string; path: string; icon?: React.JSX.Element; plus?: boolean };

const items: Item[] = [
  { label: 'Customers',         path: '/dashboard/sales/customers' },
  { label: 'Quotes',            path: '/dashboard/sales/quotes' },
  { label: 'Sales Orders',      path: '/dashboard/sales/orders' },
  { label: 'Delivery Challans', path: '/dashboard/sales/challans', icon: <Truck className="w-4 h-4" />, plus: true },
  { label: 'Invoices',          path: '/dashboard/sales/invoices' },
  { label: 'Payments Received', path: '/dashboard/sales/payments' },
  { label: 'Recurring Invoices',path: '/dashboard/sales/recurring' },
  { label: 'Credit Notes',      path: '/dashboard/sales/credits' },
];

export default function SalesSidebar() {
  const [open, setOpen] = useState(true);
  const pathname = usePathname();

  return (
    <div className="w-full max-w-xs bg-white rounded-md shadow">
      {/* collapsible header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 border-b"
      >
        <span className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          <span className="text-lg font-semibold">Sales</span>
        </span>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {open && (
        <ul className="p-3 space-y-1">
          {items.map(({ label, path, icon, plus }) => {
            const active = pathname === path;
            return (
              <li key={path}>
                <Link
                  href={path}
                  className={`flex items-center justify-between px-3 py-2 rounded text-sm
                    ${active ? 'bg-gray-100 font-medium' : 'hover:bg-gray-100'}
                  `}
                >
                  <span className="flex items-center gap-2">{icon}{label}</span>
                  {plus && (
                    <span className="bg-gray-900 text-white p-1 rounded-full">
                      <Plus className="w-3 h-3" />
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
