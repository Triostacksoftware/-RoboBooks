'use client';

import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import clsx from 'clsx';
import {
  ChevronDownIcon,
  MagnifyingGlassIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { useKey, useOnClickOutside } from '../hooks';

type FooterAction = {
  icon?: 'search' | 'globe' | string;
  label: string;
  kbd?: string;
  onClick: () => void;
};

export type SearchableSelectProps = {
  /** current selected value */
  value: string;
  /** notify parent */
  onChange: (val: string) => void;
  /** flat list of options */
  options: string[];

  /** --- UI extras (optional) --- */
  className?: string;
  buttonClassName?: string;
  /** width utility applied to dropdown container, e.g. "w-[360px]" */
  dropdownWidthClass?: string;
  /** placeholder for the search box inside the dropdown */
  placeholder?: string;
  /** align dropdown to left or right of the button */
  align?: 'left' | 'right';
  /** optional footer actions (kept for SearchBox usage) */
  footerActions?: FooterAction[];
};

export default function SearchableSelect({
  value,
  onChange,
  options,
  className,
  buttonClassName,
  dropdownWidthClass = 'w-[320px]',
  placeholder = 'Search',
  align = 'left',
  footerActions,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(popRef, () => setOpen(false));
  useKey('Escape', () => setOpen(false), open);

  useEffect(() => setQ(''), [open]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return query ? options.filter(o => o.toLowerCase().includes(query)) : options;
  }, [q, options]);

  function handleSelect(val: string) {
    onChange(val);
    setOpen(false);
  }

  return (
    <div className={clsx('relative', className)}>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen(s => !s)}
        className={
          buttonClassName ??
          'flex h-10 items-center justify-between gap-2 rounded-md border border-gray-300 px-3 text-[15px] outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200'
        }
      >
        <span className="truncate">{value}</span>
        <ChevronDownIcon className={clsx('h-4 w-4 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div
          ref={popRef}
          className={clsx(
            'absolute z-[140] mt-1',
            align === 'right' ? 'right-0' : 'left-0',
            dropdownWidthClass
          )}
        >
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl ring-1 ring-black/5">
            {/* Search box */}
            <div className="flex items-center gap-2 border-b px-3 py-2">
              <MagnifyingGlassIcon className="h-4 w-4 text-gray-500" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={placeholder}
                className="h-8 w-full border-0 p-0 text-[14px] outline-none placeholder:text-gray-400"
              />
            </div>

            {/* Options */}
            <div className="max-h-64 overflow-auto py-1">
              {filtered.map((label) => {
                const selected = label === value;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => handleSelect(label)}
                    className={clsx(
                      'flex w-full items-center justify-between px-3 py-2 text-left text-[14px] hover:bg-sky-50',
                      selected && 'bg-sky-50'
                    )}
                  >
                    <span className="truncate">{label}</span>
                    {selected && <CheckIcon className="h-4 w-4 text-sky-600" />}
                  </button>
                );
              })}
            </div>

            {/* Footer actions (optional) */}
            {footerActions && footerActions.length > 0 && (
              <div className="border-t px-2 py-1">
                {footerActions.map((a, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={a.onClick}
                    className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-[13px] hover:bg-sky-50"
                  >
                    <span className="flex items-center gap-2">
                      {/* icon placeholder keeps layout consistent */}
                      <span className="inline-block h-4 w-4" aria-hidden />
                      {a.label}
                    </span>
                    {a.kbd && (
                      <kbd className="rounded border border-gray-300 px-2 py-0.5 text-[11px] text-gray-600">
                        {a.kbd}
                      </kbd>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
