'use client';

import { CheckCircleIcon } from '@heroicons/react/24/outline';

export default function VendorCreditLifecycle() {
  return (
    <section className="w-full bg-[#f9fafb] py-12 px-4 sm:px-6 md:px-12 flex flex-col items-center">
     
      {/* Divider */}
      <div className="w-full border-t mt-[-2vmin] border-gray-300 my-6 max-w-4xl" />

      {/* Feature List */}
      <div className="w-full max-w-2xl text-center space-y-6">
        <h3 className="text-xl font-semibold text-gray-800">
          In the Vendor Credits module, you can:
        </h3>
        <ul className="text-sm sm:text-base text-gray-700 space-y-4">
          {[
            'Record credits when you receive a credit note from your vendor.',
            'Apply vendor credits to bill payments in the future.',
            'Record refunds for your vendor credits.',
          ].map((item, index) => (
            <li key={index} className="flex items-center justify-center gap-2">
              <CheckCircleIcon className="w-5 h-5 text-blue-600" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
