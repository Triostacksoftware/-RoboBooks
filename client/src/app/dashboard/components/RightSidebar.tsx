// components/RightSidebar.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  QuestionMarkCircleIcon,
  MegaphoneIcon,
  PlayCircleIcon,
  ChatBubbleLeftEllipsisIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

const ICON_BUTTONS = [
  { Icon: QuestionMarkCircleIcon, label: 'Help Pages' },
  { Icon: MegaphoneIcon, label: 'Announcements' },
  { Icon: PlayCircleIcon, label: 'Videos' },
  { Icon: ChatBubbleLeftEllipsisIcon, label: 'Cliq' },
  { Icon: DocumentTextIcon, label: 'Books' },
  { Icon: Cog6ToothIcon, label: 'Settings' },
];

export default function RightSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  // 1) Sync a body–level class so your main content can react in global CSS:
  useEffect(() => {
    document.body.classList.toggle('rs-collapsed', collapsed);
    document.body.classList.toggle('rs-expanded', !collapsed);
    return () => {
      document.body.classList.remove('rs-collapsed', 'rs-expanded');
    };
  }, [collapsed]);

  // 2) Choose the correct arrow
  const ToggleIcon = collapsed ? ChevronLeftIcon : ChevronRightIcon;
  const ariaLabel = collapsed ? 'Expand sidebar' : 'Collapse sidebar';

  if (collapsed) {
    // Collapsed view: single “expand” button at the bottom
    return (
      <aside className="fixed bottom-4 right-0">
        <button
          onClick={() => setCollapsed(false)}
          aria-label={ariaLabel}
          className="p-2 rounded-l-full bg-white shadow hover:bg-gray-100 transition"
        >
          <ToggleIcon className="w-5 h-5 text-gray-600" />
        </button>
      </aside>
    );
  }

  // Expanded view
  return (
    <aside className="fixed top-0 right-0 h-full flex flex-col items-center bg-white shadow-lg px-2 py-4 select-none">
      {/* icon stack, pushed down via pt-6 */}
      <div className="flex-1 w-full overflow-y-auto space-y-3 pt-20">
        {ICON_BUTTONS.map(({ Icon, label }) => (
          <button
            key={label}
            aria-label={label}
            className="w-12 h-12 mx-auto flex items-center justify-center bg-blue-100 rounded-full shadow hover:shadow-lg transition"
          >
            <Icon className="w-6 h-6 text-gray-600" />
          </button>
        ))}
      </div>

      {/* Single collapse toggle at the bottom */}
      <button
        onClick={() => setCollapsed(true)}
        aria-label={ariaLabel}
        className="mt-4 p-2 rounded-full hover:bg-gray-100 transition"
      >
        <ToggleIcon className="w-5 h-5 text-gray-600" />
      </button>
    </aside>
  );
}
