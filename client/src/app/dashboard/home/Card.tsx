import React from 'react'

interface Props {
  title?: string
  right?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export default function Card({ title, right, children, className = '' }: Props) {
  return (
    <div className={`bg-white rounded-xl border shadow-sm ${className}`}>
      {(title || right) && (
        <div className="flex items-center justify-between px-5 py-3 border-b bg-gray-50/40 rounded-t-xl">
          <h3 className="text-lg font-semibold">{title}</h3>
          {right}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  )
}
