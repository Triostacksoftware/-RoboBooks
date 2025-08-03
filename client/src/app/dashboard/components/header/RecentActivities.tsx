'use client';

import { useKey } from './hooks';
import { createPortal } from 'react-dom';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

export default function RecentActivities({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useKey('Escape', onClose, open);
  if (!open) return null;

  return createPortal(
    <>
      {/* full-screen backdrop */}
      <div className="fixed inset-0 z-20" onClick={onClose} />

      {/* pop-over panel */}
      <div
        className="
          absolute top-full left-0 mt-2
          z-30 w-[380px] max-w-[95vw]
          rounded-2xl border bg-white p-4 shadow-2xl
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* little caret */}
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
              onClick={() => {
                /* hook up real navigation here if needed */
              }}
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
