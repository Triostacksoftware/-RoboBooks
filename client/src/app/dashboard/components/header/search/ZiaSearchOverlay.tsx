'use client';

import { FunnelIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Portal, useKey } from '../hooks';

export default function ZiaSearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  useKey('Escape', onClose, open);
  if (!open) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-[95] bg-black/60 p-4 overflow-y-auto">
        <div className="mx-auto max-w-5xl rounded-2xl bg-white shadow-2xl">
          <div className="flex items-center gap-3 border-b px-4 py-4">
            <div className="grid place-items-center h-9 w-9 rounded-lg bg-gray-900 text-white">
              <MagnifyingGlassIcon className="h-5 w-5" />
            </div>
            <input
              autoFocus
              placeholder="Search across Apps"
              className="flex-1 rounded-md border px-3 py-2 text-sm outline-none"
            />
            <button className="rounded-md border px-3 py-2 text-sm flex items-center gap-2">
              <FunnelIcon className="h-4 w-4" /> Filter
            </button>
          </div>

          <div className="flex">
            <aside className="hidden w-48 shrink-0 border-r p-4 md:block">
              <ul className="space-y-4 text-sm">
                <li className="font-medium text-gray-900">All Apps</li>
                <li>Books</li>
                <li>Creator</li>
                <li>Help Pages</li>
              </ul>
            </aside>
            <main className="flex-1 p-6 text-gray-800">
              <h2 className="text-2xl font-semibold mb-2">Zia Search</h2>
              <p className="text-gray-600 mb-6">Search, Refine, Review and Act — All in one place</p>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="rounded-xl border p-4">
                  <h3 className="font-medium mb-2">Search by Application</h3>
                  <p className="text-sm text-gray-600">Limit search to an app. e.g. #mail or #cliq</p>
                </div>
                <div className="rounded-xl border p-4">
                  <h3 className="font-medium mb-2">Search by Contact</h3>
                  <p className="text-sm text-gray-600">Try @john to search related items</p>
                </div>
                <div className="rounded-xl border p-4">
                  <h3 className="font-medium mb-2">Fine-Grained Filters</h3>
                  <p className="text-sm text-gray-600">Use filters to narrow down results.</p>
                </div>
                <div className="rounded-xl border p-4">
                  <h3 className="font-medium mb-2">Quick Actions</h3>
                  <p className="text-sm text-gray-600">Reply, start a conversation, edit a record and more.</p>
                </div>
              </div>

              <div className="mt-8 text-right">
                <button onClick={onClose} className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white">
                  Close
                </button>
              </div>
            </main>
          </div>
        </div>
      </div>
    </Portal>
  );
}
