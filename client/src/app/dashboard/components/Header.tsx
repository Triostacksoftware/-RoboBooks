'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Bars3Icon,
  ChevronDownIcon,
  PlusIcon,
  UsersIcon,
  BellIcon,
  Cog6ToothIcon,
  Squares2X2Icon,
  ClockIcon,              // NEW
} from '@heroicons/react/24/outline'

import SearchBox          from './header/SearchBox'
import NewMenu            from './header/NewMenu'
import RecentActivities   from './header/RecentActivities'
import PremiumTooltip     from './header/PremiumTooltip'
import OrgSwitcher        from './header/OrgSwitcher'
import NotificationsPanel from './header/NotificationsPanel'
import AppsPanel          from './header/AppsPanel'
import ProfilePanel       from './header/ProfilePanel'

type Props = { onToggleSidebar?: () => void }

export default function Header ({ onToggleSidebar }: Props) {
  const [openNew,      setOpenNew]      = useState(false)
  const [openOrg,      setOpenOrg]      = useState(false)
  const [openNoti,     setOpenNoti]     = useState(false)
  const [openApps,     setOpenApps]     = useState(false)
  const [openProfile,  setOpenProfile]  = useState(false)
  const [openRecent,   setOpenRecent]   = useState(false)

  return (
    <header className="sticky top-0 z-30 bg-[#121a2a] text-white">
      <div className="mx-auto px-3 sm:px-4">
        <div className="flex h-14 items-center gap-2">

          {/* ─── Sidebar (mobile) ─────────────────────────────────────────── */}
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-md hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 lg:hidden"
            aria-label="Toggle sidebar"
          >
            <Bars3Icon className="h-5 w-5" />
          </button>

          {/* ─── Brand ───────────────────────────────────────────────────── */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-sky-600 grid place-items-center font-bold">
              B
            </div>
          </Link>

          {/* ─── Premium indicator ───────────────────────────────────────── */}
          <div className="hidden md:block ml-2">
            <PremiumTooltip>
              <span className="text-sm text-white/80 hover:text-white transition">
                Your premium trial pla…
              </span>
            </PremiumTooltip>
          </div>

          {/* ─── Recent (clock) ──────────────────────────────────────────── */}
          <button
            onClick={() => setOpenRecent(true)}
            className="ml-2 h-9 w-9 rounded-md grid place-items-center hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            aria-label="Recent activities"
          >
            <ClockIcon className="h-5 w-5" />
          </button>

          {/* ─── Search bar ─────────────────────────────────────────────── */}
          <div className="ml-2 flex-1 min-w-0">
            <SearchBox />
          </div>

          {/* Recent pop-over */}
          <RecentActivities open={openRecent} onClose={() => setOpenRecent(false)} />

          {/* ─── Org switcher ───────────────────────────────────────────── */}
          <div className="hidden sm:flex items-center">
            <button
              onClick={() => setOpenOrg(true)}
              className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              Triostack
              <ChevronDownIcon className="h-4 w-4 opacity-80" />
            </button>
          </div>
          <OrgSwitcher open={openOrg} onClose={() => setOpenOrg(false)} />

          {/* ─── Right action buttons ───────────────────────────────────── */}
          <div className="ml-1 flex items-center gap-1">

            {/* + New */}
            <ActionWrap
              open={openNew}
              onOpen={() => setOpenNew(true)}
              onClose={() => setOpenNew(false)}
              label="Create new"
            >
              <PlusIcon className="h-5 w-5 text-white" />
              <NewMenu open={openNew} onClose={() => setOpenNew(false)} />
            </ActionWrap>

            {/* Refer & Earn */}
            <TooltipAction label="Refer and Earn">
              <UsersIcon className="h-5 w-5" />
            </TooltipAction>

            {/* Notifications */}
            <ActionWrap
              open={openNoti}
              onOpen={() => setOpenNoti(true)}
              onClose={() => setOpenNoti(false)}
              label="Notifications"
            >
              <BellIcon className="h-5 w-5" />
              <NotificationsPanel open={openNoti} onClose={() => setOpenNoti(false)} />
            </ActionWrap>

            {/* Settings (placeholder) */}
            <button
              className="h-9 w-9 rounded-md grid place-items-center hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              aria-label="Settings"
            >
              <Cog6ToothIcon className="h-5 w-5" />
            </button>

            {/* Profile */}
            <ActionWrap
              open={openProfile}
              onOpen={() => setOpenProfile(true)}
              onClose={() => setOpenProfile(false)}
              label="Profile"
              className="rounded-full bg-indigo-500/40 ring-1 ring-white/20 hover:ring-white/40"
            >
              T
              <ProfilePanel open={openProfile} onClose={() => setOpenProfile(false)} />
            </ActionWrap>

            {/* Apps grid */}
            <ActionWrap
              open={openApps}
              onOpen={() => setOpenApps(true)}
              onClose={() => setOpenApps(false)}
              label="All apps"
            >
              <Squares2X2Icon className="h-5 w-5" />
              <AppsPanel open={openApps} onClose={() => setOpenApps(false)} />
            </ActionWrap>
          </div>
        </div>
      </div>
    </header>
  )
}

/* ———————————————————— helpers ———————————————————— */

function ActionWrap ({
  open,
  onOpen,
  onClose,
  label,
  children,
  className = 'h-9 w-9 rounded-md grid place-items-center hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
}: {
  open: boolean
  onOpen: () => void
  onClose: () => void
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className="relative">
      <button
        onClick={onOpen}
        className={className}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={label}
      >
        {children instanceof Array ? children[0] : children}
      </button>
      {/* children[1] is the panel, if provided */}
      {children instanceof Array ? children[1] : null}
    </div>
  )
}

function TooltipAction ({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="relative group">
      <button
        className="h-9 w-9 rounded-md grid place-items-center hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        aria-label={label}
      >
        {children}
      </button>
      <div className="pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black px-2 py-1 text-xs opacity-0 transition group-hover:opacity-100">
        {label}
      </div>
    </div>
  )
}
