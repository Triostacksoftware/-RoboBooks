'use client';

import React, {
  Fragment,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ChevronDownIcon,
  MagnifyingGlassIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { createPortal } from 'react-dom';
import { useKey, useOnClickOutside } from '../hooks';

/* Types */
type FlatOpt = { label: string; value: string };
type Group = { groupLabel: string; options: FlatOpt[] };
type Item = FlatOpt | Group;
const isGroup = (x: Item): x is Group => (x as Group).options !== undefined;

type FooterAction = {
  icon?: 'search' | 'zoho' | string;
  label: string;
  kbd?: string;
  onClick: () => void;
};

export type SearchableSelectProps = {
  value: string;
  onChange: (val: string) => void;
  options?: string[];
  items?: Item[];
  className?: string;
  buttonClassName?: string;
  placeholder?: string;
  align?: 'left' | 'right';
  footerActions?: FooterAction[];
  autoOpen?: boolean;                // open immediately (for SearchBox)
  onOpenChange?: (open: boolean) => void;
};

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ');

export default function SearchableSelect({
  value,
  onChange,
  options,
  items,
  className,
  buttonClassName,
  placeholder = 'Search',
  align = 'left',
  footerActions = [],
  autoOpen = false,
  onOpenChange,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');

  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // programmatic open + focus on first render
  useEffect(() => { if (autoOpen) setOpen(true); }, [autoOpen]);
  useEffect(() => {
    onOpenChange?.(open);
    if (open) {
      setQ('');
      const t = setTimeout(() => inputRef.current?.focus(), 10);
      return () => clearTimeout(t);
    }
  }, [open, onOpenChange]);

  // normalize data
  const normalized: Item[] = useMemo(() => {
    if (items?.length) return items;
    if (options?.length) return options.map(s => ({ label: s, value: s }));
    return [];
  }, [items, options]);

  const allFlat: FlatOpt[] = useMemo(() => {
    const out: FlatOpt[] = [];
    normalized.forEach(it => (isGroup(it) ? out.push(...it.options) : out.push(it)));
    return out;
  }, [normalized]);

  const selectedLabel = allFlat.find(o => o.value === value)?.label ?? value;

  // filter
  const filtered: Item[] = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return normalized;
    const res: Item[] = [];
    normalized.forEach(it => {
      if (isGroup(it)) {
        const opts = it.options.filter(o => o.label.toLowerCase().includes(needle));
        if (opts.length) res.push({ groupLabel: it.groupLabel, options: opts });
      } else if ((it as FlatOpt).label.toLowerCase().includes(needle)) {
        res.push(it);
      }
    });
    return res;
  }, [q, normalized]);

  useKey('Escape', () => setOpen(false), open);
  useOnClickOutside(popRef, () => setOpen(false), open);

  /* Portal positioning */
  const [style, setStyle] = useState<React.CSSProperties>({});
  useLayoutEffect(() => {
    if (!open) return;
    const update = () => {
      const el = btnRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const w = Math.max(240, r.width);
      const left = align === 'right' ? r.right - w : r.left;
      setStyle({
        position: 'fixed',
        top: Math.round(r.bottom + 8),
        left: Math.round(left),
        width: w,
        zIndex: 10000,
      });
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open, align]);

  return (
    <div className={cx('relative', className)}>
      {/* Trigger */}
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen(s => !s)}
        className={
          buttonClassName ??
          'flex h-10 items-center justify-between gap-2 rounded-md border border-gray-300 bg-white px-3 text-[15px] text-gray-800 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200'
        }
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDownIcon className={cx('h-4 w-4 transition-transform', open && 'rotate-180')} />
      </button>

      {/* Dropdown (portal) */}
      {open && typeof document !== 'undefined' && createPortal(
        <div ref={popRef} style={style}>
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl ring-1 ring-black/5">
            {/* Search box */}
            <div className="flex items-center gap-2 border-b px-3 py-2">
              <MagnifyingGlassIcon className="h-4 w-4 text-gray-500" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={placeholder}
                className="h-8 w-full border-0 p-0 text-[14px] outline-none placeholder:text-gray-400"
              />
            </div>

            {/* Options */}
            <div className="max-h-72 overflow-auto py-1">
              {filtered.length === 0 ? (
                <div className="px-3 py-3 text-sm text-gray-500">No matches</div>
              ) : (
                filtered.map((it, idx) =>
                  isGroup(it) ? (
                    <Fragment key={`${it.groupLabel}-${idx}`}>
                      <div className="px-3 py-1.5 text-[12px] font-medium text-gray-500">{it.groupLabel}</div>
                      {it.options.map(o => (
                        <OptionRow
                          key={o.value}
                          label={o.label}
                          selected={o.value === value}
                          onClick={() => { onChange(o.value); setOpen(false); }}
                        />
                      ))}
                    </Fragment>
                  ) : (
                    <OptionRow
                      key={(it as FlatOpt).value}
                      label={(it as FlatOpt).label}
                      selected={(it as FlatOpt).value === value}
                      onClick={() => { onChange((it as FlatOpt).value); setOpen(false); }}
                    />
                  )
                )
              )}
            </div>

            {/* Footer actions */}
            {footerActions.length > 0 && (
              <div className="border-t bg-gray-50">
                {footerActions.map((a, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => { setOpen(false); a.onClick(); }}
                    className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-[14px] hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      <MagnifyingGlassIcon className="h-4 w-4 text-gray-500" />
                      <span>{a.label}</span>
                    </div>
                    {a.kbd && (
                      <span className="rounded border px-2 py-[2px] text-[12px] text-gray-600">{a.kbd}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

function OptionRow({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'flex w-full items-center justify-between px-3 py-2 text-left text-[14px] hover:bg-sky-50',
        selected && 'bg-sky-50'
      )}
    >
      <span className="truncate">{label}</span>
      {selected && <CheckIcon className="h-4 w-4 text-sky-600" />}
    </button>
  );
}
