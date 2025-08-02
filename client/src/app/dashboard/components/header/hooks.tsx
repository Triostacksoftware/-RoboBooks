'use client';

import { createPortal } from 'react-dom';
import { useEffect, useRef, type RefObject, type ReactNode } from 'react';

/**
 * Fires `handler` when a click/touch happens outside ALL the given elements.
 * - Accepts multiple refs (panel, trigger button, etc.)
 * - Ignores the click that *opened* the panel by enabling the listener
 *   on the next tick.
 */
export function useClickOutside(
  refs: Array<RefObject<HTMLElement | null>>,
  handler: () => void,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;

    let active = false;
    const timer = setTimeout(() => (active = true), 0); // ignore opening click

    const onEvt = (e: MouseEvent | TouchEvent) => {
      if (!active) return;
      const target = e.target as Node;
      const inside = refs.some(r => r.current && r.current.contains(target));
      if (!inside) handler();
    };

    document.addEventListener('mousedown', onEvt, true);
    document.addEventListener('touchstart', onEvt, true);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', onEvt, true);
      document.removeEventListener('touchstart', onEvt, true);
    };
  }, [refs, handler, enabled]);
}

/** Back-compat single-ref wrapper. */
export function useOnClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  handler: () => void,
  enabled: boolean = true
) {
  useClickOutside([ref as RefObject<HTMLElement | null>], handler, enabled);
}

/** Case-insensitive key listener; set `enabled=false` to stop listening. */
export function useKey(key: string, handler: () => void, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === key.toLowerCase()) handler();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [key, handler, enabled]);
}

/** Minimal portal helper. */
export function Portal({ children }: { children: ReactNode }) {
  const elRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const el = document.createElement('div');
    document.body.appendChild(el);
    elRef.current = el;
    return () => {
      document.body.removeChild(el);
      elRef.current = null;
    };
  }, []);

  if (!elRef.current) return null;
  return createPortal(children, elRef.current);
}
