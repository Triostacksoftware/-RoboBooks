'use client';

import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { createPortal } from 'react-dom';

export default function SignalsPreferencesModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;
  return createPortal(
    <>
      <div
        className="fixed inset-0 bg-black/30 z-50"
        onClick={onClose}
      />
      <div className="fixed inset-0 flex items-center justify-center z-60	p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-xl">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h4 className="font-semibold">Signals Notification Preference</h4>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-gray-100"
            >
              <XMarkIcon className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <div className="p-6 text-gray-600">
            {/* Stubbed content; replace with your real form/table */}
            <p className="text-center py-12">No signal configured</p>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
