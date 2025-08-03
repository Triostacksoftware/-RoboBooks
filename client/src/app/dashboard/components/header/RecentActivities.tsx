'use client';

import { useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useKey } from './hooks';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

interface RecentActivitiesProps {
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLButtonElement>;
}


export default function RecentActivities({
  open,
  onClose,
  anchorRef,
}: RecentActivitiesProps) {
  useKey('Escape', onClose, open);

  // store the final coordinates
  const [pos, setPos] = useState({ top: 0, left: 0 });

  // whenever we open, measure the anchor
  useLayoutEffect(() => {
    if (open && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      });
    }
  }, [open, anchorRef]);

  if (!open) return null;

  return createPortal(
    <>
      {/* backdrop */}
      <div className="fixed inset-0 z-20" onClick={onClose} />

      {/* panel */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="
          fixed z-30
          w-[90vw] max-w-[380px]
          rounded-2xl border bg-white p-4 shadow-2xl
        "
        style={{ top: pos.top, left: pos.left }}
      >
        {/* caret */}
        <div className="absolute -top-2 left-4 h-4 w-4 rotate-45 bg-white shadow-md" />

        <div className="text-center text-sm font-semibold text-gray-600">
          RECENT ACTIVITIES
        </div>

        <div className="mt-4 grid place-items-center">
          <div className="h-40 w-64 rounded-xl bg-gray-100" />
        </div>

        <p className="mt-4 text-center text-gray-600">
          Your activities will show up here!
        </p>

        <div className="mt-4 border-t pt-4 space-y-2">
          {['Create Invoice', 'Create Bill', 'Create Expense'].map((label) => (
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
