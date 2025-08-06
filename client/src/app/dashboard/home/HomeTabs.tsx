'use client'

import { PlusIcon } from '@heroicons/react/24/outline'
import React from 'react'

export default function HomeTabs() {
  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        {/* Greeting */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg border flex items-center justify-center text-xl">🏷️</div>
          <div>
            <h1 className="text-2xl font-semibold">Hello, Try</h1>
            <p className="text-gray-500 text-sm">Triostack</p>
          </div>
        </div>

        {/* Helpline (desktop only) */}
        <div className="hidden md:block text-right text-xs text-gray-600 space-y-1">
          <div>
            Zoho Books India Helpline: <span className="font-semibold">18003093036</span>
          </div>
          <div>Mon–Fri • 9:00 AM–7:00 PM • Toll Free</div>
          <div className="text-gray-400">English, हिंदी, தமிழ், తెలుగు, മലയാളം, ಕನ್ನಡ, मराठी, ગુજરાતી, বাংলা</div>
        </div>
      </div>

      {/* Tabs + New Dashboard */}
      <div className="mt-6 flex items-center justify-between border-b">
        <div className="flex gap-8 text-sm">
          <button className="pb-3 border-b-2 border-blue-600 text-blue-600">Dashboard</button>
          <button className="pb-3 hover:text-gray-800 text-gray-500">Getting Started</button>
          <button className="pb-3 hover:text-gray-800 text-gray-500">Recent Updates</button>
        </div>
        <button className="inline-flex items-center gap-1 text-blue-600 py-2">
          <PlusIcon className="h-5 w-5" /> New Dashboard
        </button>
      </div>
    </div>
  )
}
