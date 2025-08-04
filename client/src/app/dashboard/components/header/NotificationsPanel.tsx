// components/header/NotificationsPanel.tsx
'use client';

import React, { useState } from 'react';
import {
  XMarkIcon,
  BellAlertIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { createPortal } from 'react-dom';
import SignalsPreferencesModal from './SignalsPreferencesModal';

interface NotificationsPanelProps {
  open: boolean;
  onClose: () => void;
}

export default function NotificationsPanel({
  open,
  onClose,
}: NotificationsPanelProps) {
  const [showSettings, setShowSettings] = useState(false);

  if (!open) return null;

  const handleEnableNotifications = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support desktop notifications');
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      new Notification('Notifications enabled', {
        body: 'You will now receive updates.',
      });
    }
  };

  return createPortal(
    <>
      {/* backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />

      {/* panel */}
      <div className="fixed right-0 top-14 z-50 w-[400px] h-[calc(100%-3.5rem)] bg-white shadow-2xl flex flex-col">
        {/* header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="text-lg font-semibold">Notifications</h3>
          <div className="flex items-center space-x-2">
            {/* Enable Notifications */}
            <button
              onClick={handleEnableNotifications}
              title="Enable browser notifications"
              className="p-1 rounded hover:bg-gray-100"
            >
              <BellAlertIcon className="w-5 h-5 text-gray-600" />
            </button>

            {/* Settings / Signals Preferences */}
            <button
              onClick={() => setShowSettings(true)}
              title="Notification settings"
              className="p-1 rounded hover:bg-gray-100"
            >
              <Cog6ToothIcon className="w-5 h-5 text-gray-600" />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-gray-100"
            >
              <XMarkIcon className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* tabs */}
        <div className="px-4 py-2 border-b flex items-center space-x-4">
          <select className="text-sm">
            <option>All</option>
            <option>Mentions</option>
            {/* add your other options if needed */}
          </select>
        </div>

        {/* empty state */}
        <div className="flex-1 overflow-auto flex flex-col items-center justify-center text-gray-500">
          <img
            src="/no-notifications-illustration.svg"
            alt="No notifications"
            className="h-40 mb-4"
          />
          <p>Uhh… There are no notifications at the moment.</p>
        </div>
      </div>

      {/* Signals Preferences modal */}
      {showSettings && (
        <SignalsPreferencesModal onClose={() => setShowSettings(false)} />
      )}
    </>,
    document.body
  );
}
