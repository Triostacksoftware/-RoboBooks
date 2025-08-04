// client/src/app/dashboard/components/Header.tsx
'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  Bars3Icon,
  ClockIcon,
  PlusIcon,
  BellIcon,
  Cog6ToothIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';

import SearchBox from './header/SearchBox';
import RecentActivities from './header/RecentActivities';
import PremiumTooltip from './header/PremiumTooltip';
import OrgSwitcher from './header/OrgSwitcher';
import NotificationsPanel from './header/NotificationsPanel';
import AppsPanel from './header/AppsPanel';
import ProfilePanel from './header/ProfilePanel';
import NewMenu from './header/NewMenu';
import AdvancedSearchModal from './header/search/AdvancedSearchModal';
import ReferralPanel from './header/ReferralPanel';
import { UsersIcon /* only this one */ } from '@heroicons/react/24/outline'

type Props = {
  onToggleSidebar?: () => void;
};

type Panel = null | 'recent' | 'new' | 'org' | 'noti' | 'apps' | 'profile' | 'ref';

export default function Header({ onToggleSidebar }: Props) {
  const [activePanel, setActivePanel] = useState<Panel>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const recentButtonRef = useRef<HTMLButtonElement>(null);

  const openPanel = (panel: Exclude<Panel, null>) =>
    setActivePanel(cur => (cur === panel ? null : panel));
  const closeAll = () => setActivePanel(null);

  return (
    <>
      <header className="sticky top-0 z-30 bg-[#121a2a] text-white">
        <div className="mx-auto flex h-14 items-center gap-2 px-3 sm:px-4">
          <button
            onClick={() => onToggleSidebar?.()}
            className="lg:hidden rounded-md p-2 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            aria-label="Toggle sidebar"
          >
            <Bars3Icon className="h-5 w-5" />
          </button>

          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sky-600 font-bold text-white">
              B
            </div>
          </Link>

          <div className="hidden md:block ml-2">
            <PremiumTooltip>
              <span className="text-sm text-white/80 hover:text-white transition">
                Your premium trial plan…
              </span>
            </PremiumTooltip>
          </div>

          <div className="relative">
            <button
              ref={recentButtonRef}
              onClick={() => openPanel('recent')}
              className="ml-2 grid h-9 w-9 place-items-center rounded-md hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              aria-label="Recent activities"
            >
              <ClockIcon className="h-5 w-5" />
            </button>
            <RecentActivities
              open={activePanel === 'recent'}
              onClose={closeAll}
              anchorRef={recentButtonRef}
            />
          </div>

            <div className="ml-2 flex-1 min-w-0">
            <SearchBox onAdvancedRequest={() => setShowAdvanced(true)} />
            </div>

          <div className="hidden sm:flex items-center">
            <button
              onClick={() => openPanel('org')}
              className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              Organization
              <Cog6ToothIcon className="h-4 w-4 opacity-80" />
            </button>
            <OrgSwitcher />
          </div>

          <div className="ml-1 flex items-center gap-1">

            <ActionWrap
              open={activePanel === 'new'}
              onOpen={() => openPanel('new')}
              onClose={closeAll}
              label="Create new"
            >
              <PlusIcon className="h-5 w-5 text-white" />
              <NewMenu open={activePanel === 'new'} onClose={closeAll} />
            </ActionWrap>

            <ActionWrap
              open={activePanel === 'ref'}
              onOpen={() => openPanel('ref')}
              onClose={closeAll}
              label="Refer and Earn"
            >
              <UsersIcon className="h-5 w-5 text-white" />
              <ReferralPanel />
            </ActionWrap>

            <ActionWrap
              open={activePanel === 'noti'}
              onOpen={() => openPanel('noti')}
              onClose={closeAll}
              label="Notifications"
            >
              <BellIcon className="h-5 w-5 text-white" />
              <NotificationsPanel open={activePanel === 'noti'} onClose={closeAll} />
            </ActionWrap>

            <Link
              href="/dashboard/configure"
              className="grid h-9 w-9 place-items-center rounded-md hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              aria-label="Settings"
            >
              <Cog6ToothIcon className="h-5 w-5 text-white" />
            </Link>

            <ActionWrap
              open={activePanel === 'profile'}
              onOpen={() => openPanel('profile')}
              onClose={closeAll}
              label="Profile"
              className="grid h-9 w-9 place-items-center rounded-full bg-indigo-500/40 ring-1 ring-white/20 hover:ring-white/40"
            >
              <span className="font-medium text-white">T</span>
              <ProfilePanel open={activePanel === 'profile'} onClose={closeAll} />
            </ActionWrap>

            <ActionWrap
              open={activePanel === 'apps'}
              onOpen={() => openPanel('apps')}
              onClose={closeAll}
              label="All apps"
            >
              <Squares2X2Icon className="h-5 w-5 text-white" />
              <AppsPanel open={activePanel === 'apps'} onClose={closeAll} />
            </ActionWrap>
          </div>
        </div>
      </header>

      <AdvancedSearchModal
        isOpen={showAdvanced}
        onClose={() => setShowAdvanced(false)}
        onSearch={(data) => {
          // TODO: handle advanced search data
          setShowAdvanced(false);
        }}
      />
    </>
  );
}

function ActionWrap({
  open,
  onOpen,
  onClose,
  label,
  children,
  className = 'h-9 w-9 rounded-md grid place-items-center hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
}: {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [icon, panel] = React.Children.toArray(children);
  return (
    <div className="relative">
      <button
        onClick={onOpen}
        className={className}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={label}
      >
        {icon}
      </button>
      {open && panel}
    </div>
  );
}
