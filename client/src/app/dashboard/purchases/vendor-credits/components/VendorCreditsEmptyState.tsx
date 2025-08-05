'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PlayCircleIcon } from '@heroicons/react/24/solid';

export default function VendorCreditsEmptyState() {
  const router = useRouter();
  const YOUTUBE_URL = 'https://www.youtube.com/watch?v=YOUR_VIDEO_ID'; // ← replace with actual video URL

  const handleCreateVendorCredit = () => {
    router.push('/dashboard/vendor-credits/new');
  };

  const handleImportVendorCredits = () => {
    router.push('/dashboard/vendor-credits/import');
  };

  return (
    <section className="w-full bg-gray-50 py-8 px-4 flex flex-col items-center space-y-4">
      {/* Video Preview */}
      <a
        href={YOUTUBE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full max-w-2xl bg-white rounded-xl shadow p-4 flex items-center space-x-3 hover:shadow-md transition-shadow cursor-pointer"
        aria-label="Watch 'How to create a vendor credit' on YouTube"
      >
        <PlayCircleIcon className="w-8 h-8 text-green-500 flex-shrink-0" />
        <h3 className="text-xl font-semibold py-4 text-gray-800">
          How to create a vendor credit
        </h3>
      </a>

      {/* Headline */}
      <h2 className="text-2xl font-semibold text-gray-900 mt-10 text-center px-2">
        You deserve some credit too.
      </h2>

      {/* Subheading */}
      <p className="max-w-xl text-center text-gray-600 text-xs sm:text-sm px-2">
        Create vendor credits and apply them to multiple bills when buying stuff from your vendor.
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-2 mt-2">
        <button
          onClick={handleCreateVendorCredit}
          className="w-full sm:w-auto px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs font-medium rounded-full shadow hover:from-blue-700 hover:to-blue-600 active:scale-95 transition-transform focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer"
        >
          CREATE VENDOR CREDITS
        </button>
        <button
          onClick={handleImportVendorCredits}
          className="w-full sm:w-auto px-3 py-1.5 text-blue-600 text-sm font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-blue-200 rounded-full active:scale-95 transition-transform cursor-pointer"
        >
          Import Vendor Credits
        </button>
      </div>
    </section>
  );
}
