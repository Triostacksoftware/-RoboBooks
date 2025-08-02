// src/app/dashboard/components/Card.tsx
import React from 'react'

interface Props {
  title: string
  actionText?: string
  onAction?: () => void
  children: React.ReactNode
}

export default function Card({ title, actionText, onAction, children }: Props) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">{title}</h3>
        {actionText && (
          <button
            onClick={onAction}
            className="text-blue-600 hover:underline text-sm"
          >
            {actionText}
          </button>
        )}
      </div>
      <div>{children}</div>
    </div>
  )
}
