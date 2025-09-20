'use client';

import { useState, useEffect, useRef } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { isTextField } from '@/utils/isTextField';

export default function SubscribeButton() {
  const [open, setOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // close on outside click or ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !isTextField(e.target)) setOpen(false);
    }
    function onClick(e: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      window.addEventListener('keydown', onKey);
      document.addEventListener('mousedown', onClick);
    }
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  return (
    <>
      {/* Subscribe trigger */}
      <button
        onClick={() => setOpen(true)}
        className="text-blue-400 hover:text-blue-600 transition font-medium mr-3"
      >
        Subscribe
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 p-4">
          <div
            ref={modalRef}
            className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3 border-b">
              <h3 className="text-lg font-medium text-gray-800">
                Ready to make the switch?
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition"
                aria-label="Close"
              >
                <XMarkIcon className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 text-center">
              {/* Illustration */}
              <img
                src="/images/hourglass.svg"
                alt="Hourglass"
                className="mx-auto h-24"
              />

              <p className="text-xl">
                Your trial expires in{' '}
                <span className="font-semibold text-orange-500">11 days</span>
              </p>
              <p className="text-gray-600">
                We hope you’ve enjoyed Robo Books so far. Here’s what you can do
                once your trial ends:
              </p>

              <div className="bg-gray-50 border rounded-lg p-4 text-left text-sm text-gray-700 space-y-2">
                <p>
                  • <strong>Upgrade now</strong>, to a paid plan that best suits
                  your business needs.{' '}
                  <a href="/pricing" className="text-blue-500 underline">
                    Compare Plans
                  </a>
                </p>
                <p>
                  • Switch to the Free plan of Robo Books. Limited features
                  apply. Visit our{' '}
                  <a href="/pricing" className="text-blue-500 underline">
                    pricing page
                  </a>{' '}
                  to see what you get.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-center gap-4 px-6 py-4 border-t">
              <a href="/pricing" className="bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition text-center">
                Upgrade Plan
              </a>
              <a href="/pricing#free" className="border px-4 py-2 rounded-xl text-black hover:bg-black hover:text-white transition text-center">
                Switch to Free Plan
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

