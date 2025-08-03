'use client';

import { Portal, useKey } from './hooks';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function NotificationsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  useKey('Escape', onClose, open);
  if (!open) return null;
  return (
    <Portal>
      <div className="fixed inset-0 z-[85]" onClick={onClose} />
      <div className="absolute right-28 top-14 z-[90] w-[520px] max-w-[95vw] rounded-xl border bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="text-lg font-semibold">Notifications</div>
          <button className="rounded bg-gray-900 px-2 py-1 text-xs text-white">
            Enable Desktop Notifications
          </button>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="p-8 text-center text-gray-600">
          <div className="mx-auto mb-3 h-32 w-40 rounded-xl bg-gray-100" />
          Uhh… There are no notifications at the moment.
        </div>
      </div>
    </Portal>
  );
}
