// app/dashboard/banking/BankingSection.tsx
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
    router.push('/dashboard/banking/skip');
  };

  const handleWatchVideo = () => {
    window.open('https://www.youtube.com/watch?v=Dxkz_tqg7bI', '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-8 md:p-12 bg-white">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-4 text-center">
        Stay on top of your money
      </h2>

      <p className="max-w-2xl text-gray-600 text-sm sm:text-base md:text-lg mb-8 text-center">
        Connect your bank and credit cards to fetch all your transactions. Create,
        categorize and match these transactions to those you have in Zoho Books.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center mb-6">
        <button
          onClick={handleConnect}
          className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Connect Bank / Credit Card
        </button>
        <button
          onClick={handleAddManual}
          className="w-full sm:w-auto border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-100 transition"
        >
          Add Manually
        </button>
      </div>

      {/* Skip Option */}
      <div className="text-xs sm:text-sm text-gray-600 mb-8 text-center">
        <span className="text-yellow-800 font-medium">
          Don’t use banking for your business?
        </span>
        <button
          onClick={handleSkip}
          className="text-blue-600 hover:underline ml-1"
        >
          Skip
        </button>
      </div>

      {/* Watch Video */}
      <div className="w-full max-w-lg border-t pt-6">
        <button
          onClick={handleWatchVideo}
          className="flex items-center justify-center gap-2 text-blue-600 font-medium hover:underline text-sm sm:text-base"
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
