'use client';

import { useRouter } from 'next/navigation';
import { PlayIcon } from '@heroicons/react/24/solid';

export default function QuoteIntroSection() {
  const router = useRouter();

  const handleCreateQuote = () => {
    router.push('/dashboard/sales/quotes/new'); // ✅ Redirect to create quote page
  };

  const handleImportQuotes = () => {
    alert('📥 Import modal will open here (placeholder)');
    // Or use: openImportModal();
  };

  const handlePlayHowToCreateQuote = () => {
    alert('▶️ Playing: How To Create Quote');
    // Or open a video modal/player
  };

  return (
    <section className="w-full px-4 py-12 md:py-16 flex flex-col items-center justify-center bg-white text-center">
      {/* Green Play Button Row */}
      <div
        onClick={handlePlayHowToCreateQuote}
        className="w-full max-w-md sm:max-w-lg bg-white rounded-2xl shadow-md hover:shadow-lg cursor-pointer px-5 py-4 flex items-center gap-4 mb-10 transition duration-300"
      >
        <div className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-green-500 rounded-full">
          <PlayIcon className="w-4 h-4 text-white" />
        </div>
        <p className="text-base sm:text-lg font-medium text-gray-800">
          How To Create Quote
        </p>
      </div>

      {/* Heading + Description */}
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">
        Seal the deal.
      </h2>
      <p className="text-sm sm:text-base text-gray-600 max-w-xl mb-8">
        With quotes, give your customers an offer they can’t refuse!
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
        <button
          onClick={handleCreateQuote}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg shadow transition"
        >
          CREATE NEW QUOTE
        </button>
        <button
          onClick={handleImportQuotes}
          className="text-blue-600 hover:underline text-sm font-medium transition"
        >
          Import Quotes
        </button>
      </div>
    </section>
  );
}
