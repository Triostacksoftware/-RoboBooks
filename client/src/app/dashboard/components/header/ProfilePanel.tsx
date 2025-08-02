'use client';
import { Portal, useKey } from './hooks';
import { XMarkIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

export default function ProfilePanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  useKey('Escape', onClose, open);
  if (!open) return null;
  return (
    <Portal>
      <div className="fixed inset-0 z-[85]" onClick={onClose} />
      <div className="absolute right-16 top-14 z-[90] w-[520px] max-w-[95vw] rounded-xl border bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-indigo-500 text-white">T</div>
            <div>
              <div className="font-medium">Try</div>
              <div className="text-xs text-gray-500">farziemailthisis@gmail.com</div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100"><XMarkIcon className="h-5 w-5" /></button>
        </div>

        <div className="px-4 py-3 text-xs text-gray-600">User ID: 60044771644 · Organization ID: 60044771462</div>
        <div className="px-4 pb-2 text-sm text-sky-700">My Account</div>
        <div className="px-4 pb-2 text-sm text-red-600 flex items-center gap-2">
          <ArrowRightOnRectangleIcon className="h-4 w-4" /> Sign Out
        </div>

        <div className="px-4 py-3 text-sm">Your premium trial plan ends in 14 days.</div>

        <div className="max-h-[55vh] overflow-y-auto px-4 pb-4">
          <div className="grid grid-cols-3 gap-4">
            {['Help Documents','FAQs','Forum','Video Tutorials','Explore Features','Migration Guide'].map(t => (
              <div key={t} className="flex flex-col items-center gap-2 rounded-xl border p-4 hover:bg-gray-50">
                <div className="h-10 w-10 rounded-lg bg-gray-100" />
                <div className="text-center text-sm">{t}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-3">
            {[
              'Register for webinars','Find an accountant','Early Access Features',
              'Talk to us (Mon–Fri 9:00 AM–7:00 PM • Toll Free): 18003093036',
              "What's New? View the latest features and enhancements"
            ].map(s => (
              <div key={s} className="rounded-xl border p-3 hover:bg-gray-50 text-sm">{s}</div>
            ))}
          </div>

          <div className="mt-6">
            <div className="rounded-xl border p-4">
              <div className="font-medium mb-2">Download the mobile app</div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="h-16 w-16 rounded-lg bg-gray-100" /> iOS · Android
              </div>
            </div>
            <div className="mt-3 rounded-xl border p-4">
              Work simpler and faster with our secure standalone Windows app
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
