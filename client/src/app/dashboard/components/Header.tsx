"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Bars3Icon,
  ClockIcon,
  PlusIcon,
  UsersIcon,
  BellIcon,
  Cog6ToothIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";

// Dynamic imports for components that use document references
const SearchBox = dynamic(() => import("./header/SearchBox"), { ssr: false });
const RecentActivities = dynamic(() => import("./header/RecentActivities"), {
  ssr: false,
});
const SubscribeButton = dynamic(() => import("./header/PremiumTooltip"), {
  ssr: false,
});
const OrgSwitcher = dynamic(() => import("./header/OrgSwitcher"), {
  ssr: false,
});
const NotificationsPanel = dynamic(
  () => import("./header/NotificationsPanel"),
  { ssr: false }
);
const AllZohoAppsPanel = dynamic(() => import("./header/AllZohoAppsPanel"), {
  ssr: false,
});
const ProfilePanel = dynamic(() => import("./header/ProfilePanel"), {
  ssr: false,
});
const NewMenu = dynamic(() => import("./header/NewMenu"), { ssr: false });
const AdvancedSearchModal = dynamic(
  () => import("./header/search/AdvancedSearchModal"),
  { ssr: false }
);
const ReferralPanel = dynamic(() => import("./header/ReferralPanel"), {
  ssr: false,
});
const SettingsPanel = dynamic(() => import("./header/SettingsPanel"), {
  ssr: false,
});

type Props = {
  onToggleSidebar?: () => void;
};
type Panel =
  | null
  | "recent"
  | "new"
  | "org"
  | "ref"
  | "noti"
  | "apps"
  | "profile";

export default function Header({ onToggleSidebar }: Props) {
  const [activePanel, setActivePanel] = useState<Panel>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const recentButtonRef = useRef<HTMLButtonElement>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const openPanel = (panel: Exclude<Panel, null>) =>
    setActivePanel((cur) => (cur === panel ? null : panel));
  const closeAll = () => setActivePanel(null);

  return (
    <>
      <header
        data-settings-header
        className="sticky top-0 z-30 bg-[#121a2a] text-white"
      >
        <div className="mx-auto flex h-14 items-center gap-2 px-3 sm:px-4">
          {/* Mobile sidebar toggle */}
          <button
            onClick={() => onToggleSidebar?.()}
            className="lg:hidden rounded-md p-2 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            aria-label="Toggle sidebar"
          >
            <Bars3Icon className="h-5 w-5" />
          </button>

          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sky-600 font-bold text-white">
              B
            </div>
          </Link>

          {/* Recent activities */}
          <div className="relative">
            <button
              ref={recentButtonRef}
              onClick={() => openPanel("recent")}
              className="ml-2 grid h-9 w-9 place-items-center rounded-md hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              aria-label="Recent activities"
            >
              <ClockIcon className="h-5 w-5" />
            </button>
            <RecentActivities
              open={activePanel === "recent"}
              onClose={closeAll}
              anchorRef={recentButtonRef}
            />
          </div>

          {/* Search box */}
          <div className="ml-2 flex-1 min-w-0">
            <SearchBox onAdvancedRequest={() => setShowAdvanced(true)} />
          </div>

          {/* Premium tooltip */}
          <div className="flex items-center space-x-6">
            {/* your existing trial text */}
            <span className="text-sm text-gray-200">
              Your premium trial plan…
            </span>

            {/* ← add this: */}
            <SubscribeButton />

            {/* other icons */}
            {/* ProfileMenu component is missing, replace or define it */}
            {/* Example: <ProfilePanel open={activePanel === "profile"} onClose={closeAll} /> */}
          </div>

          {/* Org switcher */}
          <div className="hidden sm:block">
            <OrgSwitcher />
          </div>

          {/* Right‐hand icons */}
          <div className="ml-1 flex items-center gap-1">
            {/* Create new */}
            <ActionWrap
              open={activePanel === "new"}
              onOpen={() => openPanel("new")}
              onClose={closeAll}
              label="Create new"
            >
              <PlusIcon className="h-5 w-5 text-white" />
              <NewMenu open={activePanel === "new"} onClose={closeAll} />
            </ActionWrap>

            {/* Refer & earn */}
            <ActionWrap
              open={activePanel === "ref"}
              onOpen={() => openPanel("ref")}
              onClose={closeAll}
              label="Refer and Earn"
            >
              <UsersIcon className="h-5 w-5 text-white" />
              <ReferralPanel open={activePanel === "ref"} onClose={closeAll} />
            </ActionWrap>

            {/* Notifications */}
            <ActionWrap
              open={activePanel === "noti"}
              onOpen={() => openPanel("noti")}
              onClose={closeAll}
              label="Notifications"
            >
              <BellIcon className="h-5 w-5 text-white" />
              <NotificationsPanel
                open={activePanel === "noti"}
                onClose={closeAll}
              />
            </ActionWrap>

            {/* Settings link */}
            <button
              onClick={() => setSettingsOpen(true)}
              className="p-2 rounded-full  hover:scale-110 transition-all duration-200 ease-in-out"
            >
              <Cog6ToothIcon className="w-6 h-6 text-white" />
            </button>

            <SettingsPanel
              open={settingsOpen}
              onClose={() => setSettingsOpen(false)}
            />

            {/* Profile */}
            <ActionWrap
              open={activePanel === "profile"}
              onOpen={() => openPanel("profile")}
              onClose={closeAll}
              label="Profile"
              className="grid h-9 w-9 place-items-center rounded-full bg-indigo-500/40 ring-1 ring-white/20 hover:ring-white/40"
            >
              <span className="font-medium text-white">T</span>
              <ProfilePanel
                open={activePanel === "profile"}
                onClose={closeAll}
              />
            </ActionWrap>

            {/* All apps */}
            <ActionWrap
              open={activePanel === "apps"}
              onOpen={() => openPanel("apps")}
              onClose={closeAll}
              label="All apps"
            >
              <Squares2X2Icon className="h-5 w-5 text-white" />
              <AllZohoAppsPanel
                open={activePanel === "apps"}
                onClose={closeAll}
              />
            </ActionWrap>
          </div>
        </div>
      </header>

      {/* Advanced Search Modal */}
      <AdvancedSearchModal
        isOpen={showAdvanced}
        onClose={() => setShowAdvanced(false)}
        onSearch={(data) => {
          // TODO: handle advanced search with 'data'
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
  className = "h-9 w-9 rounded-md grid place-items-center hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
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
        {icon as React.ReactNode}
      </button>
      {open && panel}
    </div>
  );
}
