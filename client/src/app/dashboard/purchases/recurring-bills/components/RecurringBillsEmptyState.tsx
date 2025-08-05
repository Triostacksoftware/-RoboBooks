'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function RecurringBillsEmptyState() {
  const router = useRouter();

  const handleCreateRecurring = () => {
    router.push('/dashboard/recurring-bills/new');
  };

  const handleImportRecurring = () => {
    router.push('/dashboard/recurring-bills/import');
  };

  return (
    <section className="w-full bg-gray-50 py-12 px-4 flex flex-col items-center space-y-6">
      {/* Title */}
      <h2 className="text-2xl font-semibold text-gray-900 text-center">
        Create. Set. Repeat.
      </h2>

      {/* Subtitle */}
      <p className="max-w-2xl text-center text-gray-600 text-base px-2">
        Do you pay bills every so often? Start paying your vendors on time by creating recurring bills.
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mt-4">
        <button
          onClick={handleCreateRecurring}
          className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs sm:text-sm font-semibold rounded-full shadow-md hover:from-blue-700 hover:to-blue-600 active:scale-95 transition-transform focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer"
        >
          CREATE RECURRING BILL
        </button>
        <button
          onClick={handleImportRecurring}
          className="w-full sm:w-auto px-4 py-1.5 text-blue-600 text-xs sm:text-sm font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-blue-200 rounded-full active:scale-95 transition-transform cursor-pointer"
        >
          Import Recurring Bills
        </button>
      </div>
    </section>
  );
}
