'use client';

import {
  CheckCircleIcon,
  BanknotesIcon,
  CreditCardIcon,
  HandRaisedIcon,
} from '@heroicons/react/24/outline';

export default function VendorPaymentLifecycle() {
  return (
    <section className="w-full bg-[#f9fafb] py-12 px-4 sm:px-8 md:px-16 flex flex-col items-center">
      {/* Title */}
      <h2 className="text-center text-2xl font-semibold text-gray-900 mb-10">
        Life cycle of a Vendor Payment
      </h2>

      {/* Flowchart */}
      <div className="w-full max-w-5xl flex flex-col items-center relative">
        {/* Top: BILLS */}
        <div className="relative flex justify-center items-center mb-12">
          <div className="border border-blue-400 bg-white px-6 py-2 rounded-lg shadow-sm z-10">
            <span className="text-xs sm:text-sm font-semibold text-gray-800">BILLS</span>
          </div>

          {/* Vertical line downward */}
          <div className="absolute top-full h-10 w-0.5 border-l-2 border-dashed border-blue-400"></div>
        </div>

        {/* Branching lines */}
        <div className="relative w-full flex justify-center mb-4">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-60 h-0.5 border-t-2 border-dashed border-blue-400"></div>

          {/* Vertical line to each option */}
          <div className="absolute top-0 left-[calc(50%-7.5rem)] w-0.5 h-6 border-l-2 border-dashed border-blue-400"></div>
          <div className="absolute top-0 left-1/2 w-0.5 h-6 border-l-2 border-dashed border-blue-400"></div>
          <div className="absolute top-0 left-[calc(50%+7.5rem)] w-0.5 h-6 border-l-2 border-dashed border-blue-400"></div>
        </div>

        {/* Bottom: 3 payment types */}
        <div className="flex flex-col sm:flex-row justify-center gap-8 sm:gap-16">
          {/* ACH PAYMENT */}
          <div className="flex flex-col items-center">
            <div className="border border-blue-400 bg-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm">
              <BanknotesIcon className="w-5 h-5 text-green-500" />
              <span className="text-xs sm:text-sm font-semibold text-gray-800">ACH PAYMENT</span>
            </div>
          </div>

          {/* CHECK */}
          <div className="flex flex-col items-center">
            <div className="border border-blue-400 bg-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm">
              <CreditCardIcon className="w-5 h-5 text-blue-500" />
              <span className="text-xs sm:text-sm font-semibold text-gray-800">CHECK</span>
            </div>
          </div>

          {/* MANUAL / OFFLINE */}
          <div className="flex flex-col items-center">
            <div className="border border-blue-400 bg-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm">
              <HandRaisedIcon className="w-5 h-5 text-purple-600" />
              <span className="text-xs sm:text-sm font-semibold text-gray-800">MANUAL / OFFLINE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full border-t border-gray-300 my-10 max-w-4xl" />

      {/* Features List */}
      <div className="w-full max-w-2xl text-center space-y-6">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
          In the Payments Made module, you can:
        </h3>
        <ul className="text-sm sm:text-base text-gray-700 space-y-4">
          {[
            'Record payments made to vendors',
            'View receipts of paid bills',
            'Record payments manually',
            'Send payment receipts to your customers',
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
