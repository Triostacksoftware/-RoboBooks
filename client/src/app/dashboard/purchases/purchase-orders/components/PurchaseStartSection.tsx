'use client';

import { useRouter } from 'next/navigation';
import { PlusIcon } from '@heroicons/react/24/solid';

export default function PurchaseStartSection() {
  const router = useRouter();

  const handleCreateOrder = () => {
    router.push('/dashboard/purchase-orders/new');
  };

  return (
    <section className="w-full min-h-[60vh] flex flex-col items-center justify-center text-center px-4 bg-white">
      {/* Heading */}
      <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900 mb-2">
        Start Managing Your Purchase Activities!
      </h1>

      {/* Subheading */}
      <p className="text-sm sm:text-base text-gray-500 max-w-md mb-6">
        Create, customize, and send professional Purchase Orders to your vendors.
      </p>

      {/* Button */}
      <button
        onClick={handleCreateOrder}
        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm sm:text-base font-semibold px-6 py-2.5 rounded-md shadow-md transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
      >
        <PlusIcon className="w-5 h-5" />
        Create New Purchase Order
      </button>
    </section>
  );
}
