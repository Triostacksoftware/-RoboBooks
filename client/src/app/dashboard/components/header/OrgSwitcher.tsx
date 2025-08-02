'use client'
import { XMarkIcon, Cog6ToothIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { Portal, useKey } from './hooks'

export default function OrgSwitcher({ open, onClose }: { open: boolean; onClose: () => void }) {
  useKey('Escape', onClose, open)
  if (!open) return null
  return (
    <Portal>
      <div className="fixed inset-0 z-[80]" onClick={onClose} />
      <div className="absolute right-48 top-14 z-[85] w-[480px] rounded-xl border bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="text-lg font-semibold">Organizations</div>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="flex items-center gap-2 px-4 py-3 text-sm text-sky-700">
          <Cog6ToothIcon className="h-4 w-4" />
          Manage
        </div>
        <div className="px-4 pb-4">
          <div className="text-sm font-medium text-gray-600 mb-2">My Organizations</div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-gray-100">🏢</div>
              <div>
                <div className="font-medium">aat jhat company</div>
                <div className="text-xs text-gray-500">Organization ID: 60044771462 · Premium Trial</div>
              </div>
            </div>
            <CheckCircleIcon className="h-5 w-5 text-sky-600" />
          </div>
        </div>
      </div>
    </Portal>
  )
}
