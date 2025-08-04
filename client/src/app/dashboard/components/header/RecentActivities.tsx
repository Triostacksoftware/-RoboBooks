'use client';

import { useLayoutEffect, useState } from 'react';
import { createPortal }         from 'react-dom';
import { useKey }               from './hooks';
import { DocumentTextIcon }     from '@heroicons/react/24/outline';


interface RecentActivitiesProps {
  open:      boolean;
  onClose:   () => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
}

export default function RecentActivities({
  open,
  onClose,
  anchorRef,
}: RecentActivitiesProps) {
  useKey('Escape', onClose, open);

  type Pos = { top: number; left: number; arrowOffset: number };
  const [pos, setPos] = useState<Pos>({ top: 0, left: 0, arrowOffset: 0 });

  const VERT_OFFSET   = 8;   // gap above panel
  const HORIZ_OFFSET  = 8;   // shy from button
  const ARROW_W       = 32;  // width of arrow
  const ARROW_H       = 12;  // height of arrow

  useLayoutEffect(() => {
    if (!open || !anchorRef.current) return;
    const btnRect = anchorRef.current.getBoundingClientRect();

    // panel left/top
    const panelLeft = btnRect.left + window.scrollX - HORIZ_OFFSET;
    const panelTop  = btnRect.bottom + window.scrollY + VERT_OFFSET;

    // arrow center under button
    const arrowCenter =
      btnRect.left +
      window.scrollX +
      btnRect.width / 2 -
      panelLeft -
      ARROW_W / 2;

    setPos({
      top: panelTop,
      left: panelLeft,
      arrowOffset: arrowCenter,
    });
  }, [open, anchorRef]);

  if (!open) return null;

  return createPortal(
    <>
      {/* backdrop */}
      <div className="fixed inset-0 z-20" onClick={onClose} />

      {/* panel */}
      <div
        onClick={e => e.stopPropagation()}
        className="
          fixed z-30
          w-[90vw] max-w-[380px]
          rounded-2xl border bg-white p-4 shadow-2xl
        "
        style={{ top: pos.top, left: pos.left }}
      >
        {/* — Curved SVG arrow */}
        <svg
          width={ARROW_W}
          height={ARROW_H}
          viewBox={`0 0 ${ARROW_W} ${ARROW_H}`}
          className="absolute"
          style={{ top: `-${ARROW_H}px`, left: pos.arrowOffset }}
        >
          <defs>
            <filter
              id="arrow-shadow"
              x="-50%" y="-50%"
              width="200%" height="200%"
            >
              <feDropShadow
                dx="0" dy="2" stdDeviation="4"
                floodColor="rgba(0,0,0,0.1)"
              />
            </filter>
          </defs>

          {/* path: a nice gentle curve */}
          <path
            d={`
              M0,${ARROW_H}
              Q${ARROW_W / 2},-${ARROW_H} ${ARROW_W},${ARROW_H}
              Z
            `}
            fill="white"
            filter="url(#arrow-shadow)"
          />
        </svg>

        {/* header */}
        <div className="text-center text-sm font-semibold text-gray-600">
          RECENT ACTIVITIES
        </div>

        {/* content placeholder */}
        <div className="mt-4 grid place-items-center">
          <div className="h-40 w-64 rounded-xl bg-gray-100" />
        </div>
        <p className="mt-4 text-center text-gray-600">
          Your activities will show up here!
        </p>

        {/* actions */}
        <div className="mt-4 border-t pt-4 space-y-2">
          {['Create Invoice', 'Create Bill', 'Create Expense'].map(label => (
            <button
              key={label}
              className="flex w-full items-center gap-2 text-sky-700 hover:underline"
            >
              <DocumentTextIcon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>
    </>,
    document.body
  );
}
