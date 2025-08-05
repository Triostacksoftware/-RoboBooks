'use client';

import { CheckCircleIcon } from '@heroicons/react/24/outline';

export default function ContactFeaturesList() {
  const features = [
    'Invite your customers to the Customer Portal',
    'Run customer statement report',
    'Set a currency to invoice your customers.',
    'View transaction history for each customer',
    'Request feedback for your service',
  ];

  return (
    <section className="w-full bg-[#f9fafb] py-10 px-4 sm:px-8 md:px-16 flex flex-col items-center">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
        In the Contacts module, you can:
      </h2>

      <ul className="flex flex-col gap-4 w-full max-w-xl">
        {features.map((feature, idx) => (
          <li
            key={idx}
            className="flex items-start gap-2 text-sm sm:text-base text-gray-800"
          >
            <CheckCircleIcon className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
