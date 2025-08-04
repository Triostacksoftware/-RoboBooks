"use client";

import React, { useEffect, useRef } from "react";
import { UserGroupIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { createPortal } from "react-dom";

export default function ReferralPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // close on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  // panel only (trigger lives in Header)
  return open
    ? createPortal(
        <>
          {/* backdrop */}
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={onClose}
          />

          {/* slide-in panel */}
          <div
            ref={ref}
            className="fixed top-0 right-0 z-50 w-80 h-full bg-white shadow-2xl overflow-auto flex flex-col"
          >
            {/* header */}
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">
                Refer &amp; Earn
              </h3>
              <button
                onClick={onClose}
                className="p-2 rounded hover:bg-gray-100"
              >
                <XMarkIcon className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* content */}
            <div className="p-5 space-y-6 text-gray-700 text-sm flex-1">
              <div className="text-center space-y-4">
                <UserGroupIcon className="mx-auto w-12 h-12 text-sky-600" />
                <h4 className="text-lg font-medium">
                  Know someone who would love Zoho Books?
                </h4>
                <p>
                  Refer them today and earn{" "}
                  <span className="text-red-600">$3</span> for every qualified
                  signup — you also get{" "}
                  <span className="text-red-600">20%</span> of their
                  subscription payment as Zoho Wallet credits.
                </p>
                <button
                  onClick={() => {
                    /* copy & share link */
                  }}
                  className="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-900 transition"
                >
                  Refer and Earn
                </button>
              </div>

              <hr />

              <div>
                <h5 className="font-semibold">HOW DOES IT WORK?</h5>
                <ul className="list-disc list-inside mt-2 space-y-2">
                  <li>
                    Share your referral link with friends, colleagues, or
                    clients.
                  </li>
                  <li>
                    You’ll earn <span className="font-semibold">$3</span>{" "}
                    instantly for every qualified signup.
                  </li>
                  <li>
                    When your referral becomes a paying customer, you’ll receive{" "}
                    <span className="font-semibold">20%</span> of their
                    subscription payment as Zoho Wallet credits.
                  </li>
                  <li>
                    Your contact will also receive{" "}
                    <span className="font-semibold">$100</span> in Zoho Wallet
                    credits as a welcome gift for signing up through your
                    referral.
                  </li>
                  <li>
                    You can refer as many people as you like—there’s no limit!
                  </li>
                </ul>
              </div>

              <div className="text-xs text-gray-500">
                *Terms and Conditions apply
              </div>
            </div>
          </div>
        </>,
        document.body
      )
    : null;
}

