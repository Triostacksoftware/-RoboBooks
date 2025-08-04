import React from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import RightSidebar from './components/RightSidebar'

export const metadata = { title: 'Dashboard – Robo Books' }

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        {/* give the main a right margin equal to your RightSidebar's width (e.g. 80px) */}
        <main className="flex-1 overflow-auto mr-20">
          {children}
        </main>
        <RightSidebar />
      </div>
    </div>
  )
}