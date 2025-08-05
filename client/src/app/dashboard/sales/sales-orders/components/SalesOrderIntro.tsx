'use client';

import { PlayIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';

export default function SalesOrderIntro() {
  const router = useRouter();

  const handlePlayVideo = () => {
    alert('▶️ Playing: Learn how to create a new sales order');
  };

  const handleCreateSalesOrder = () => {
    router.push('/sales-orders/new');
  };

  return (
    <section className="w-full px-4 py-14 bg-white flex flex-col items-center text-center">
      {/* ✅ Clean YouTube-style Card */}
      <div
        onClick={handlePlayVideo}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-md hover:shadow-lg cursor-pointer px-6 py-4 flex items-center gap-4 mb-8 transition duration-300"
      >
        {/* Green Play Button */}
        <div className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-green-500 rounded-full shadow">
          <PlayIcon className="w-4 h-4 text-white" />
        </div>

        {/* Text */}
        <p className="text-sm sm:text-base font-medium text-gray-800">
          Learn how to create a new sales order
        </p>
      </div>

      {/* Heading + Description */}
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">
        Start Managing Your Sales Activities!
      </h2>
      <p className="text-xs sm:text-sm text-gray-600 mb-6">
        Create, customize and send professional Sales Orders.
      </p>

      {/* CTA Button - Smaller */}
      <button
        onClick={handleCreateSalesOrder}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm px-4 py-2 rounded-md shadow transition"
      >
        CREATE SALES ORDER
      </button>
    </section>
  );
}
