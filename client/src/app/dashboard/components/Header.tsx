"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  Bars3Icon,
  ClockIcon,
  PlusIcon,
  UsersIcon,
  BellIcon,
  Cog6ToothIcon,
  Squares2X2Icon,
  SparklesIcon,
  RocketLaunchIcon,
  ChartBarIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ChatBubbleLeftEllipsisIcon,
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
const NotificationsPanel = dynamic(() => import("./header/NotificationPanel"), {
  ssr: false,
});
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
  const router = useRouter();
  const { logout } = useAuth();

  const openPanel = (panel: Exclude<Panel, null>) => {
    console.log("Opening panel:", panel);
    console.log("Current activePanel:", activePanel);
    setActivePanel((cur) => {
      const newState = cur === panel ? null : panel;
      console.log("Setting activePanel to:", newState);
      return newState;
    });
  };
  const closeAll = () => setActivePanel(null);

  const handleLogout = async () => {
    console.log("🚪 Header logout button clicked!");
    try {
      await logout();
      console.log("✅ Header logout successful");
    } catch (error) {
      console.error("❌ Header logout failed:", error);
      // Fallback redirect
      router.push("/signin");
    }
  };

  return (
    <>
      <header
        data-settings-header
        className="sticky top-0 z-[2000] bg-slate-800 text-white shadow-md"
      >
        <div className="mx-auto flex h-14 items-center gap-3 px-4 sm:px-6">
          {/* Mobile sidebar toggle */}
          <button
            onClick={() => onToggleSidebar?.()}
            className="lg:hidden rounded-md p-2 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 transition-all duration-200"
            aria-label="Toggle sidebar"
          >
            <Bars3Icon className="h-5 w-5" />
          </button>

          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">
              <RocketLaunchIcon className="h-5 w-5" />
            </div>
            <span className="hidden sm:block text-base font-medium text-blue-200">
              RoboBooks
            </span>
          </Link>

          {/* Left icons */}
          <div className="flex items-center gap-2">
            {/* Settings */}
            <button
              onClick={() => setSettingsOpen(true)}
              className="h-8 w-8 rounded-md grid place-items-center hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 transition-all duration-200"
            >
              <Cog6ToothIcon className="w-4 h-4 text-gray-300" />
            </button>

            <SettingsPanel
              open={settingsOpen}
              onClose={() => setSettingsOpen(false)}
            />

            {/* Recent activities */}
            <div className="relative">
              <button
                ref={recentButtonRef}
                onClick={() => openPanel("recent")}
                className="h-8 w-8 rounded-md grid place-items-center hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 transition-all duration-200"
                aria-label="Recent activities"
              >
                <ClockIcon className="h-4 w-4 text-white" />
              </button>
              <RecentActivities
                open={activePanel === "recent"}
                onClose={closeAll}
                anchorRef={recentButtonRef}
              />
            </div>
          </div>

          {/* Search box - centered */}
          <div className="flex-1 max-w-2xl mx-8">
            <SearchBox onAdvancedRequest={() => setShowAdvanced(true)} />
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-2">
            {/* Premium status */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-200 text-xs font-medium border border-amber-400/30">
                <SparklesIcon className="h-3 w-3" />
                <span>Pro Trial</span>
              </div>
              <SubscribeButton />
            </div>

            {/* Notifications */}
            <ActionWrap
              open={activePanel === "noti"}
              onOpen={() => openPanel("noti")}
              onClose={closeAll}
              label="Notifications"
              className="h-8 w-8 rounded-md grid place-items-center hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 transition-all duration-200 relative"
            >
              <BellIcon className="h-4 w-4 text-white" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></div>
              <NotificationsPanel
                open={activePanel === "noti"}
                onClose={closeAll}
              />
            </ActionWrap>

            {/* Message Icon - Opens All Expenses with History */}
            <button
              onClick={() => router.push('/dashboard/purchases/expenses?openHistory=true')}
              className="h-8 w-8 rounded-md grid place-items-center hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 transition-all duration-200"
              aria-label="Go to All Expenses with History"
              title="Go to All Expenses with History"
            >
              <ChatBubbleLeftEllipsisIcon className="h-4 w-4 text-white" />
            </button>

            {/* Org switcher */}
            <div className="hidden sm:block">
              <OrgSwitcher />
            </div>

            {/* Create new */}
            <ActionWrap
              open={activePanel === "new"}
              onOpen={() => openPanel("new")}
              onClose={closeAll}
              label="Create new"
              className="h-8 w-8 rounded-md grid place-items-center hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 transition-all duration-200"
            >
              <PlusIcon className="h-4 w-4 text-white" />
              <NewMenu open={activePanel === "new"} onClose={closeAll} />
            </ActionWrap>
            {/* Refer & earn */}
            <ActionWrap
              open={activePanel === "ref"}
              onOpen={() => openPanel("ref")}
              onClose={closeAll}
              label="Refer and Earn"
              className="h-8 w-8 rounded-md grid place-items-center hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 transition-all duration-200"
            >
              <UsersIcon className="h-4 w-4 text-white" />
              <ReferralPanel open={activePanel === "ref"} onClose={closeAll} />
            </ActionWrap>

            {/* Profile */}
            <ActionWrap
              open={activePanel === "profile"}
              onOpen={() => openPanel("profile")}
              onClose={closeAll}
              label="Profile"
              className="h-8 w-8 rounded-md grid place-items-center hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 transition-all duration-200 bg-blue-600/20"
            >
              <UserCircleIcon className="h-5 w-5 text-white" />
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
              className="h-8 w-8 rounded-md grid place-items-center hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 transition-all duration-200"
            >
              <Squares2X2Icon className="h-4 w-4 text-white" />
              <AllZohoAppsPanel
                open={activePanel === "apps"}
                onClose={closeAll}
              />
            </ActionWrap>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-full hover:scale-110 transition-all duration-200 ease-in-out"
              aria-label="Logout"
            >
              <ArrowRightOnRectangleIcon className="w-6 h-6 text-white" />
            </button>

            {/* Test button */}
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
