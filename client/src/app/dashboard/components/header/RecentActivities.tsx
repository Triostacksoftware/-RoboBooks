'use client'
import { Portal, useKey } from './hooks'
import { DocumentTextIcon } from '@heroicons/react/24/outline'

export default function RecentActivities({ open, onClose }: { open: boolean; onClose: () => void }) {
  useKey('Escape', onClose, open)
  if (!open) return null
  return (
    <Portal>
      <div className="fixed inset-0 z-[70]" onClick={onClose} />
      <div className="absolute left-3 top-14 z-[75] w-[380px] max-w-[95vw] rounded-2xl border bg-white p-4 shadow-2xl">
        <div className="text-center text-sm font-semibold text-gray-600">RECENT ACTIVITIES</div>
        <div className="mt-4 grid place-items-center">
          <div className="h-40 w-64 rounded-xl bg-gray-100" />
        </div>
        <p className="mt-4 text-center text-gray-600">Your activities will show up here!</p>
        <div className="mt-4 border-t pt-4 space-y-2">
          {['Create Invoice','Create Bill','Create Expense'].map((t) => (
            <button key={t} className="flex items-center gap-2 text-sky-700 hover:underline">
              <DocumentTextIcon className="h-4 w-4" /> {t}
            </button>
          ))}
        </div>
      </div>
    </Portal>
  )
}
