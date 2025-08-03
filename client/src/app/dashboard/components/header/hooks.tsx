'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

/** Click/Tap outside a given element */
export function useOnClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  handler: () => void
) {
  useEffect(() => {
    function onClick(e: MouseEvent | TouchEvent) {
      const el = ref.current;
      if (!el || el.contains(e.target as Node)) return;
      handler();
    }
    document.addEventListener('mousedown', onClick, true);
    document.addEventListener('touchstart', onClick, true);
    return () => {
      document.removeEventListener('mousedown', onClick, true);
      document.removeEventListener('touchstart', onClick, true);
    };
  }, [ref, handler]);
}

/** Case-insensitive key listener; set `enabled=false` to stop listening. */
export function useKey(key: string, handler: () => void, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    function onKey(e: KeyboardEvent) {
      if (e.key.toLowerCase() === key.toLowerCase()) handler();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [key, handler, enabled]);
}

/** Simple Portal helper */
export function Portal({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const el = document.createElement('div');
    document.body.appendChild(el);
    containerRef.current = el;
    return () => {
      document.body.removeChild(el);
      containerRef.current = null;
    };
  }, []);

  if (!containerRef.current) return null;
  return createPortal(children, containerRef.current);
}
