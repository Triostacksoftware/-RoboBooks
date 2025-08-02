// src/app/dashboard/layout.tsx
import React from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Footer from './components/Footer'

export const metadata = {
  title: 'Dashboard – Robo Books',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-auto p-4">
          {children}
        </main>
      </div>

      <Footer />
    </div>
  )
}
