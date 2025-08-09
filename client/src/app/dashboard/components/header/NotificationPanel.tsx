"use client";

import { BellIcon } from "@heroicons/react/24/outline";

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
}

export default function NotificationPanel({
  open,
  onClose,
}: NotificationPanelProps) {
  if (!open) return null;

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="text-center text-gray-500">
          <BellIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
          <p>No new notifications</p>
        </div>
      </div>
    </div>
  );
}
