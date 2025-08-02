'use client'
import { useState } from 'react'

export default function PremiumTooltip({ children }: { children: React.ReactNode }) {
  const [show, setShow] = useState(false)
  return (
    <div onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)} className="relative">
      {children}
      {show && (
        <div className="absolute left-1/2 top-7 z-40 -translate-x-1/2 rounded-md bg-black px-3 py-1 text-xs text-white shadow">
          Your premium trial plan ends in 14 days.
          <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-black" />
        </div>
      )}
    </div>
  )
}
