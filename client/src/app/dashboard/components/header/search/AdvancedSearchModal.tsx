'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Portal, useKey, useOnClickOutside } from '../hooks';
import SearchableSelect from './SearchableSelect';

type Props = { open: boolean; category: string; onClose: () => void };

type Field = { label: string; key: string; type?: 'text' | 'email' | 'tel' | 'select' };

/* Field presets */
const CUSTOMER_LEFT: Field[] = [
  { label: 'Display Name', key: 'displayName' },
  { label: 'Company Name', key: 'companyName' },
  { label: 'Last Name', key: 'lastName' },
  { label: 'Status', key: 'status', type: 'select' },
  { label: 'Address', key: 'address' },
  { label: 'Notes', key: 'notes' },
];
const CUSTOMER_RIGHT: Field[] = [
  { label: 'Customer Type', key: 'customerType', type: 'select' },
  { label: 'First Name', key: 'firstName' },
  { label: 'Email', key: 'email', type: 'email' },
  { label: 'Phone', key: 'phone', type: 'tel' },
  { label: 'PAN', key: 'pan' },
];
const DEFAULT_LEFT: Field[] = [
  { label: 'Name', key: 'name' },
  { label: 'Code / ID', key: 'code' },
  { label: 'Notes', key: 'notes' },
];
const DEFAULT_RIGHT: Field[] = [
  { label: 'Created By', key: 'createdBy' },
  { label: 'Email', key: 'email', type: 'email' },
  { label: 'Phone', key: 'phone', type: 'tel' },
];

/* Options (flat) */
const CATEGORY_OPTIONS = [
  'Customers','Items','Banking','Quotes','Sales Orders','Delivery Challans','Invoices',
  'Payments Received','Recurring Invoices','Credit Notes','Vendors','Expenses',
  'Recurring Expenses','Purchase Orders','Bills','Payments Made','Recurring Bills',
  'Vendor Credits','Projects','Timesheet','Journals','Chart of Accounts','Documents','Tasks',
];

const FILTER_OPTIONS = [
  'All Customers','Active Customers','CRM Customers','Duplicate Customers','Inactive Customers',
  'Customer Portal Enabled','Customer Portal Disabled','Overdue Customers','Unpaid Customers',
];

/* Row */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[175px_1fr] items-center gap-4">
      <div className="text-[15px] text-gray-700">{label}</div>
      <div>{children}</div>
    </div>
  );
}

/* Field renderer */
function FieldInput({
  field,
  inputRef,
}: {
  field: Field;
  inputRef?: React.Ref<HTMLInputElement>;
}) {
  const base =
    'h-10 w-full rounded-md border border-gray-300 px-3 text-[15px] outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200';

  if (field.type === 'select') {
    if (field.key === 'status') {
      return (
        <select className={base}>
          <option>All</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>
      );
    }
    if (field.key === 'customerType') {
      return (
        <select className={base}>
          <option>All Customers</option>
          <option>Business</option>
          <option>Individual</option>
        </select>
      );
    }
    return (
      <select className={base}>
        <option>All</option>
      </select>
    );
  }

  return <input ref={inputRef} type={field.type ?? 'text'} className={base} />;
}

/* Modal */
export default function AdvancedSearchModal({ open, category, onClose }: Props) {
  const shellRef = useRef<HTMLDivElement>(null);
  const firstRef = useRef<HTMLInputElement>(null);

  const [localCategory, setLocalCategory] = useState(category);
  useEffect(() => setLocalCategory(category), [category]);

  const [categoryValue, setCategoryValue] = useState<string>('Customers');
  const [filterValue, setFilterValue] = useState<string>('All Customers');

  useEffect(() => setCategoryValue(localCategory || 'Customers'), [localCategory]);

  const { leftFields, rightFields } = useMemo(() => {
    if (categoryValue.toLowerCase() === 'customers') {
      return { leftFields: CUSTOMER_LEFT, rightFields: CUSTOMER_RIGHT };
    }
    return { leftFields: DEFAULT_LEFT, rightFields: DEFAULT_RIGHT };
  }, [categoryValue]);

  useOnClickOutside(shellRef, onClose);
  useKey('Escape', onClose, open);

  useEffect(() => {
    if (open) setTimeout(() => firstRef.current?.focus(), 30);
  }, [open]);

  if (!open) return null;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onClose();
  }

  return (
    <Portal>
      <div className="fixed inset-0 z-[120] overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">
        <div
          ref={shellRef}
          className="mx-auto w-full max-w-[1200px] rounded-xl bg-white shadow-2xl ring-1 ring-black/5"
        >
          {/* Top bar */}
          <div className="flex items-center justify-between border-b px-6 py-3">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-3">
                <span className="text-[15px] text-gray-700">Search</span>
                <SearchableSelect
                  value={categoryValue}
                  onChange={setCategoryValue}
                  options={CATEGORY_OPTIONS}
                  placeholder="Search"
                />
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[15px] text-gray-700">Filter</span>
                <SearchableSelect
                  value={filterValue}
                  onChange={setFilterValue}
                  options={FILTER_OPTIONS}
                  placeholder="Search"
                  align="right"
                />
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded p-2 hover:bg-gray-100"
              aria-label="Close"
            >
              <XMarkIcon className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={submit}>
            <div className="grid gap-8 px-6 py-6 lg:grid-cols-2">
              {/* Left */}
              <div className="space-y-4">
                {leftFields.map((f, i) => (
                  <Row key={f.key} label={f.label}>
                    <FieldInput field={f} inputRef={i === 0 ? firstRef : undefined} />
                  </Row>
                ))}
              </div>

              {/* Right */}
              <div className="space-y-4">
                {rightFields.map((f) => (
                  <Row key={f.key} label={f.label}>
                    <FieldInput field={f} />
                  </Row>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t bg-gray-50 px-6 py-4">
              <button
                type="submit"
                className="h-10 rounded-md bg-sky-600 px-5 text-sm font-medium text-white hover:bg-sky-700"
              >
                Search
              </button>
              <button
                type="button"
                onClick={onClose}
                className="h-10 rounded-md border border-gray-300 bg-white px-5 text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
}
