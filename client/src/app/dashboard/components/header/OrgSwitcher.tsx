'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronDownIcon,
  XMarkIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { createPortal } from 'react-dom';

// --- Helper hooks & portal ---
function useKey(key: string, callback: () => void, when = true) {
  useEffect(() => {
    if (!when) return;
    function handler(e: KeyboardEvent) {
      if (e.key === key) callback();
    }
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [key, callback, when]);
}

function Portal({ children }: { children: React.ReactNode }) {
  return createPortal(children, document.body);
}

// --- Data model ---
interface Org {
  id: string;
  name: string;
  tier: string;
  active: boolean;
}

const ORGS: Org[] = [
  { id: '60044771462', name: 'Triostack', tier: 'Premium Trial', active: true },
  { id: '12345678901', name: 'Foo Corp', tier: 'Standard', active: false },
  { id: '98765432109', name: 'Bar LLC', tier: 'Enterprise', active: false },
];

// --- Component ---
export default function OrgSwitcher() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // close on Escape
  useKey('Escape', () => setOpen(false), open);

  // close on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  return (
    <>
      {/* trigger */}
      <div className="relative inline-block">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center text-white text-sm font-medium hover:text-gray-200 transition"
        >
          <span>Triostack</span>
          <ChevronDownIcon
            className={`w-4 h-4 ml-1 transition-transform ${
              open ? 'rotate-180' : 'rotate-0'
            }`}
          />
        </button>
      </div>

      {/* panel */}
      {open &&
        <Portal>
          {/* backdrop */}
          <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setOpen(false)} />

          {/* slide-out */}
          <div
            ref={ref}
            className="fixed right-0 top-14 z-50 w-80 h-[calc(100%-3.5rem)] bg-white rounded-l-2xl shadow-2xl flex flex-col"
          >
            {/* header */}
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">Organizations</h3>
              <button onClick={() => setOpen(false)} className="p-2 rounded hover:bg-gray-100">
                <XMarkIcon className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Manage link */}
            <button
              onClick={() => {/* go to management */}}
              className="flex items-center gap-2 px-5 py-3 text-sm text-sky-700 hover:bg-sky-50"
            >
              <Cog6ToothIcon className="w-4 h-4" />
              Manage
            </button>

            {/* list */}
            <div className="flex-1 overflow-auto px-5 py-4 space-y-3">
              <div className="text-sm font-medium text-gray-600">My Organizations</div>
              <div className="space-y-2">
                {ORGS.map((org) => (
                  <div
                    key={org.id}
                    className={clsx(
                      'flex items-center justify-between p-3 rounded-lg border transition cursor-pointer',
                      org.active
                        ? 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                        : 'border-gray-200 hover:bg-gray-50'
                    )}
                    onClick={() => {
                      /* switch org logic */
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 grid place-items-center bg-gray-100 rounded-lg text-xl text-gray-600">
                        {org.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-800">{org.name}</span>
                        <span className="text-xs text-gray-500">
                          Organization ID: {org.id} · {org.tier}
                        </span>
                      </div>
                    </div>
                    {org.active && <CheckCircleIcon className="w-5 h-5 text-sky-600" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Portal>
      }
    </>
  );
}
