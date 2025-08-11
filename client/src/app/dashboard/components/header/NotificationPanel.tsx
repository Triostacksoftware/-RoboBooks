// components/header/NotificationsPanel.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  BellAlertIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  ComputerDesktopIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';
import { createPortal } from 'react-dom';
import SignalsPreferencesModal from './SignalsPreferencesModal';

interface NotificationsPanelProps {
  open: boolean;
  onClose: () => void;
}

// Sample notifications data
const SAMPLE_NOTIFICATIONS = [
  {
    id: 1,
    type: 'success',
    title: 'Invoice #INV-001 created successfully',
    message: 'Your invoice has been created and sent to the customer.',
    time: '2 minutes ago',
    read: false,
  },
  {
    id: 2,
    type: 'warning',
    title: 'Payment reminder',
    message: 'Invoice #INV-002 is due in 3 days. Consider sending a reminder.',
    time: '1 hour ago',
    read: false,
  },
  {
    id: 3,
    type: 'info',
    title: 'System maintenance scheduled',
    message: 'Scheduled maintenance on Sunday, 2:00 AM - 4:00 AM IST.',
    time: '3 hours ago',
    read: true,
  },
  {
    id: 4,
    type: 'success',
    title: 'New customer added',
    message: 'Customer "ABC Corporation" has been added to your contacts.',
    time: '1 day ago',
    read: true,
  },
];

export default function NotificationsPanel({
  open,
  onClose,
}: NotificationsPanelProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [notifications] = useState(SAMPLE_NOTIFICATIONS);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [activeTab, setActiveTab] = useState<'all' | 'mentions'>('all');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    // Check current notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Debug logging
  useEffect(() => {
    console.log('NotificationsPanel open state:', open);
  }, [open]);

  if (!open) {
    console.log('NotificationsPanel: not rendering, open is false');
    return null;
  }

  console.log('NotificationsPanel: rendering panel');

  const handleEnableNotifications = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support desktop notifications');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        // Show a test notification
        new Notification('Notifications enabled', {
          body: 'You will now receive updates from RoboBooks.',
          icon: '/favicon.ico', // Add your app icon path
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <InformationCircleIcon className="w-5 h-5 text-blue-500" />;
      default:
        return <BellAlertIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  return createPortal(
    <>
      {/* backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-[9999]"
        onClick={onClose}
      />

      {/* panel */}
      <div className="fixed right-0 top-0 z-[10000] w-[400px] h-full bg-white shadow-2xl flex flex-col border-l border-gray-200">
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          <div className="flex items-center space-x-2">
            {/* Signals Preferences */}
            <button
              onClick={() => setShowSettings(true)}
              title="Signals Preferences"
              className="p-1 rounded hover:bg-gray-100 transition-colors"
            >
              <ComputerDesktopIcon className="w-5 h-5 text-gray-600" />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-gray-100 transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* tabs */}
        <div className="px-6 py-3 border-b border-gray-100">
          <div className="flex items-center space-x-6">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center space-x-1 text-sm font-medium transition-colors ${
                activeTab === 'all' 
                  ? 'text-blue-600 border-b-2 border-blue-600 pb-1' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span>All</span>
              <ChevronDownIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('mentions')}
              className={`text-sm font-medium transition-colors ${
                activeTab === 'mentions' 
                  ? 'text-blue-600 border-b-2 border-blue-600 pb-1' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Mentions
            </button>
          </div>

          {/* Filter dropdown for All tab */}
          {activeTab === 'all' && (
            <div className="mt-3">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All</option>
                <option value="unread">Unread</option>
                <option value="workflow">Workflow Rules</option>
                <option value="other">Other Notifications</option>
              </select>
            </div>
          )}
        </div>

        {/* notifications list */}
        <div className="flex-1 overflow-auto p-6">
          <div className="text-center text-gray-500">
            <p className="text-lg font-medium mb-2">Notifications Panel is Working!</p>
            <p className="text-sm">The panel is now fully covered from top to bottom.</p>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <SignalsPreferencesModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </>,
    document.body
  );
}
