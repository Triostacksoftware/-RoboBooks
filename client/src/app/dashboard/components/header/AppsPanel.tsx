// client/src/app/dashboard/components/header/AppsPanel.tsx
'use client';

import React from 'react';
import { Portal, useKey } from './hooks';
import AllZohoAppsPanel from './AllZohoAppsPanel';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface AppsPanelProps {
  open: boolean;
  onClose: () => void;
}

export default function AppsPanel({ open, onClose }: AppsPanelProps) {
  // allow Esc to close
  useKey('Escape', onClose, open);

  if (!open) return null;

  return (
    <Portal>
      {/* backdrop */}
      <div
        className="fixed inset-0 z-[85]"
        onClick={onClose}
      />

      {/* slide-over panel */}
      <div className="absolute right-4 top-14 z-[90] w-[660px] max-w-[95vw] rounded-xl border bg-white shadow-2xl overflow-auto">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="text-lg font-semibold">All Robo Apps</div>
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-gray-100"
            aria-label="Close apps panel"
          >
            <XMarkIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* your custom grid of apps */}
        <AllZohoAppsPanel open={open} onClose={onClose} />
      </div>
    </Portal>
  );
}
