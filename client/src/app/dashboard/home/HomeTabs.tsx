'use client'

import { PlusIcon } from '@heroicons/react/24/outline'
import React, { useState } from 'react'
import GettingStarted from './GettingStarted'
import RecentUpdates from './RecentUpdates'

interface HomeTabsProps {
  onTabChange?: (tab: string) => void
}

export default function HomeTabs({ onTabChange }: HomeTabsProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'getting-started' | 'recent-updates'>('dashboard')

  const handleTabChange = (tab: 'dashboard' | 'getting-started' | 'recent-updates') => {
    setActiveTab(tab)
    onTabChange?.(tab)
  }

  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        {/* Greeting */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg border flex items-center justify-center text-xl">🏷️</div>
          <div>
            <h1 className="text-2xl font-semibold">Hello, Arya Guha</h1>
            <p className="text-gray-500 text-sm">RoboBooks Techno...</p>
          </div>
        </div>

        {/* Helpline (desktop only) */}
        <div className="hidden md:block text-right text-xs text-gray-600 space-y-1">
          <div>
            Robo Books India Helpline: <span className="font-semibold">1800-103-0066</span>
          </div>
          <div>Mon–Fri • 9:00 AM–7:00 PM • Toll Free</div>
          <div className="text-gray-400">English, हिंदी, தமிழ், తెలుగు, മലയാളം, ಕನ್ನಡ, मराठी, ગુજરાતી, বাংলা</div>
        </div>
      </div>

      {/* Tabs + New Dashboard */}
      <div className="mt-6 flex items-center justify-between border-b">
        <div className="flex gap-8 text-sm">
          <button 
            onClick={() => handleTabChange('dashboard')}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === 'dashboard' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent hover:text-gray-800 text-gray-500'
            }`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => handleTabChange('getting-started')}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === 'getting-started' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent hover:text-gray-800 text-gray-500'
            }`}
          >
            Getting Started
          </button>
          <button 
            onClick={() => handleTabChange('recent-updates')}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === 'recent-updates' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent hover:text-gray-800 text-gray-500'
            }`}
          >
            Recent Updates
          </button>
        </div>
        <button className="inline-flex items-center gap-1 text-blue-600 py-2">
          <PlusIcon className="h-5 w-5" /> New Dashboard
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'getting-started' && <GettingStarted />}
        {activeTab === 'recent-updates' && <RecentUpdates />}
      </div>
    </div>
  )
}
