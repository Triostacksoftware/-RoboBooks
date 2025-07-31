"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/** Local helper for flags (no external import) */
function flagEmoji(iso2: string) {
  const code = iso2.toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return "🏳️";
  return String.fromCodePoint(
    127397 + code.charCodeAt(0),
    127397 + code.charCodeAt(1)
  );
}

type Option = { name: string; iso2: string; dial: string };

type Props = {
  id?: string;
  label?: string;
  options: Option[];
  popularIso2?: string[];
  value: { iso2: string; dial: string };
  onChange: (opt: Option) => void;
  className?: string;
};

function ChevronDownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path d="m6 8 4 4 4-4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="m21 21-4.3-4.3M16 10.5A5.5 5.5 0 1 1 5 10.5a5.5 5.5 0 0 1 11 0Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function norm(s: string) {
  return s.normalize("NFKD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

export default function CountryDialSelector({
  id,
  label = "Country code",
  options,
  popularIso2 = ["IN", "US", "GB", "AU", "AE"],
  value,
  onChange,
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const popRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const sorted = useMemo(
    () => [...options].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" })),
    [options]
  );

  const filtered = useMemo(() => {
    const nq = norm(q);
    if (!nq) return sorted;
    return sorted.filter((o) => norm(`${o.name} ${o.iso2} ${o.dial}`).includes(nq));
  }, [q, sorted]);

  const popular = useMemo(() => sorted.filter((o) => popularIso2.includes(o.iso2)), [sorted, popularIso2]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (popRef.current?.contains(t)) return;
      if (triggerRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (!open) return;

      const items = listRef.current?.querySelectorAll<HTMLButtonElement>('[data-role="opt"]') ?? [];
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = Math.min(activeIndex + 1, items.length - 1);
        setActiveIndex(next);
        items[next]?.scrollIntoView({ block: "nearest" });
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev = Math.max(activeIndex - 1, 0);
        setActiveIndex(prev);
        items[prev]?.scrollIntoView({ block: "nearest" });
      }
      if (e.key === "Enter") {
        e.preventDefault();
        if (activeIndex >= 0 && items[activeIndex]) items[activeIndex].click();
      }
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, activeIndex]);

  const current = useMemo(() => options.find((o) => o.iso2 === value.iso2 && o.dial === value.dial), [options, value]);

  return (
    <div className={["relative", className || ""].join(" ")}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}

      <button
        ref={triggerRef}
        id={id}
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          setTimeout(() => {
            const input = popRef.current?.querySelector<HTMLInputElement>("#country-search");
            input?.focus();
          }, 0);
        }}
        className="flex w-full items-center justify-between rounded-2xl border border-slate-300/80 bg-white/70 px-3 py-2.5 text-left outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/20"
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className="text-lg leading-none">{flagEmoji(value.iso2)}</span>
          <span className="truncate text-slate-900">
            {current ? `${current.name}` : value.iso2} <span className="text-slate-500">{value.dial}</span>
          </span>
        </span>
        <ChevronDownIcon className="h-5 w-5 text-slate-500" />
      </button>

      {open && (
        <div
          ref={popRef}
          role="listbox"
          className="absolute z-50 mt-2 w-[min(28rem,90vw)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl ring-1 ring-black/5"
        >
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                id="country-search"
                placeholder="Search"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setActiveIndex(-1);
                }}
                className="w-full rounded-xl border border-slate-200/80 bg-white py-2 pl-9 pr-3 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div ref={listRef} className="max-h-80 overflow-auto">
            {!q && popular.length > 0 && (
              <div className="px-3 pb-2 pt-2">
                <div className="px-2 pb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">Popular</div>
                {popular.map((o, i) => (
                  <Row
                    key={`popular-${o.iso2}`}
                    option={o}
                    active={activeIndex === i}
                    onClick={() => {
                      onChange(o);
                      setOpen(false);
                      setQ("");
                      setActiveIndex(-1);
                    }}
                  />
                ))}
              </div>
            )}

            <div className="px-3 py-2">
              {!q && <div className="px-2 pb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">All countries (A–Z)</div>}
              {filtered.length === 0 && (
                <div className="px-2 py-6 text-center text-sm text-slate-500">No matches. Try a different search.</div>
              )}
              {filtered.map((o, i) => {
                const offset = !q ? popular.length : 0;
                return (
                  <Row
                    key={`${o.iso2}-${o.dial}`}
                    option={o}
                    active={activeIndex === i + offset}
                    onClick={() => {
                      onChange(o);
                      setOpen(false);
                      setQ("");
                      setActiveIndex(-1);
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({
  option,
  active,
  onClick,
}: {
  option: Option;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      data-role="opt"
      onClick={onClick}
      className={[
        "flex w-full items-center gap-3 rounded-xl px-2 py-2.5",
        active ? "bg-emerald-50 ring-1 ring-emerald-200" : "hover:bg-slate-50",
      ].join(" ")}
    >
      <span className="text-xl leading-none">{flagEmoji(option.iso2)}</span>
      <span className="flex-1 truncate text-left text-slate-900">{option.name}</span>
      <span className="text-slate-600">{option.dial}</span>
    </button>
  );
}
