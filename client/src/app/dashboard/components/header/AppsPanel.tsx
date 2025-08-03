'use client';

import { Portal, useKey } from './hooks';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function AppsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  useKey('Escape', onClose, open);
  if (!open) return null;
  return (
    <Portal>
      <div className="fixed inset-0 z-[85]" onClick={onClose} />
      <div className="absolute right-4 top-14 z-[90] w-[660px] max-w-[95vw] rounded-xl border bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="text-lg font-semibold">Zoho Apps</div>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4 p-4 sm:grid-cols-4">
          {['Books','CRM','Mail','Projects','People','Inventory','Analytics','Desk','Creator','SalesIQ','Campaigns','Flow'].map((app) => (
            <button
              key={app}
              className="flex flex-col items-center gap-2 rounded-xl border p-4 hover:bg-gray-50"
            >
              <div className="h-10 w-10 rounded-lg bg-gray-100" />
              <span className="text-sm">{app}</span>
            </button>
          ))}
        </div>
      </div>
    </Portal>
  );
}
