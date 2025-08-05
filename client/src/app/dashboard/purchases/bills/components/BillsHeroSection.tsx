'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PlayCircleIcon } from '@heroicons/react/24/solid';

export default function BillsHeroSection() {
  const router = useRouter();
  const YOUTUBE_URL = 'https://www.youtube.com/watch?v=YOUR_VIDEO_ID'; // ← replace with your video URL

  const handleCreateBill = () => {
    router.push('/dashboard/bills/new');
  };

  const handleImportBills = () => {
    router.push('/dashboard/bills/import');
  };

  return (
    <section className="w-full bg-gray-50 py-10 px-4 flex flex-col items-center space-y-6">
      {/* Video Preview (click to open YouTube) */}
      <a
        href={YOUTUBE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-4 flex items-center space-x-3 hover:shadow-xl transition-shadow cursor-pointer"
        aria-label="Watch 'How to record bills' on YouTube"
      >
        <PlayCircleIcon className="w-10 h-10 text-green-500 flex-shrink-0" />
        <h3 className="text-base md:text-lg font-semibold text-gray-800">
          How to record bills
        </h3>
      </a>

      {/* Headline */}
      <h2 className="text-2xl mt-4 font-semibold text-gray-900 text-center px-2">
        Owe money? It’s good to pay bills on time!
      </h2>

      {/* Subheading */}
      <p className="max-w-2xl text-center text-gray-600 text-xs sm:text-sm md:text-base px-2">
        If you’ve purchased something for your business, and you don’t have to
        repay it immediately, then you can record it as a bill.
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-sm">
        <button
          onClick={handleCreateBill}
          className="w-full px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-medium rounded-full shadow-lg hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 active:scale-95 transition-transform cursor-pointer"
        >
          CREATE A BILL
        </button>
        <button
          onClick={handleImportBills}
          className="w-full px-5 py-2 text-blue-600 text-sm font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-blue-200 rounded-full cursor-pointer"
        >
          Import Bills
        </button>
      </div>
    </section>
);
}
