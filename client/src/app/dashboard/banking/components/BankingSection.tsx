'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function BankingSection() {
  const router = useRouter();

  const handleConnect = () => {
    router.push('/dashboard/banking/connect');
  };

  const handleAddManual = () => {
    router.push('/dashboard/banking/manual');
  };

  const handleSkip = () => {
    router.push('/dashboard'); // Skips to dashboard home
  };

  const handleWatchVideo = () => {
    window.open('https://www.youtube.com/watch?v=Dxkz_tqg7bI', '_blank');
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 bg-white">
      <h2 className="text-2xl md:text-3xl font-semibold mb-4">
        Stay on top of your money
      </h2>

      <p className="max-w-xl text-gray-500 text-sm md:text-base mb-6">
        Connect your bank and credit cards to fetch all your transactions. Create,
        categorize and match these transactions to those you have in Zoho Books.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center mb-4">
        <button
          onClick={handleConnect}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          Connect Bank / Credit Card
        </button>
        <button
          onClick={handleAddManual}
          className="border border-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-100 transition"
        >
          Add Manually
        </button>
      </div>

      {/* Skip Option */}
      <div className="text-xs text-gray-600 mb-6">
        <span className="text-yellow-800 font-medium">
          Don&apos;t use banking for your business?
        </span>
        <button
          onClick={handleSkip}
          className="text-blue-600 hover:underline ml-1"
        >
          Skip
        </button>
      </div>

      {/* Watch Video */}
      <div className="w-full max-w-2xl border-t pt-6">
        <button
          onClick={handleWatchVideo}
          className="flex items-center justify-center gap-2 text-blue-600 font-medium hover:underline text-sm"
        >
          <svg
            className="w-5 h-5 text-blue-600"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
          Watch how to connect your bank account to Zoho Books
        </button>
      </div>
    </div>
  );
}
