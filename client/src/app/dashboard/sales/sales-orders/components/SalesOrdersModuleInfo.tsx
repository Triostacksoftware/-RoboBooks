'use client';

import { CheckCircleIcon } from '@heroicons/react/24/outline';

export default function SalesOrdersModuleInfo() {
  const features = [
    'Create sales orders to follow up a quote or customer request.',
    'Convert the sales order into a purchase order if you are low on stock.',
    'Convert the sales order into an invoice if the sale goes through.',
  ];

  return (
    <section className="w-full px-4 sm:px-8 py-12 bg-[#f9fafb] flex justify-center">
      <div className="max-w-3xl text-center">
        {/* Section Heading */}
        <h2 className="text-2xl font-semibold text-gray-900 mb-10">
          In the Sales Orders module, you can:
        </h2>

        {/* Features List */}
        <ul className="space-y-6 text-left">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-3 sm:gap-4">
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
