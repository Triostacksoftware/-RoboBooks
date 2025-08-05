'use client';

import { CheckCircleIcon } from '@heroicons/react/24/outline';

export default function DeliveryChallanModuleInfo() {
  const features = [
    'Create delivery challans to accompany your goods when they are in transit.',
    'Convert a delivery challan into an invoice to charge your customers.',
    'Mark your delivery challan as returned or record partial returns.',
  ];

  return (
    <section className="w-full px-4 sm:px-8 py-12 bg-[#f9fafb] flex justify-center">
      <div className="max-w-3xl text-center">
        {/* Title */}
        <h2 className="text-2xl font-semibold text-gray-900 mb-10">
          In the Delivery Challan module, you can:
        </h2>

        {/* Features List */}
        <ul className="space-y-6 text-left">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2 sm:gap-3">
              <CheckCircleIcon className="h-6 w-6 text-blue-600 mt-1 shrink-0" />
              <p className="text-sm sm:text-base text-gray-800 leading-relaxed">
                {feature}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
