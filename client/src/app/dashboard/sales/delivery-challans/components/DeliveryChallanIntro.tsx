'use client';

import { useRouter } from 'next/navigation';

export default function DeliveryChallanIntro() {
  const router = useRouter();

  const handleCreateDeliveryChallan = () => {
    router.push('/delivery-challans/new'); // update the route as per your app
  };

  return (
    <section className="w-full px-4 py-20 bg-white flex flex-col items-center text-center">
      {/* Heading */}
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">
        Deliver Goods effectively!
      </h2>

      {/* Subheading */}
      <p className="text-sm sm:text-base text-gray-500 mb-6">
        Create, customize and print professional Delivery Challans
      </p>

      {/* CTA Button */}
      <button
        onClick={handleCreateDeliveryChallan}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm px-6 py-2.5 rounded-lg shadow transition"
      >
        CREATE DELIVERY CHALLAN
      </button>
    </section>
  );
}
