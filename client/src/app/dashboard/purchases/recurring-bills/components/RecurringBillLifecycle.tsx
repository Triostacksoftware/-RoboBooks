'use client';

import {
  ShoppingBagIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { BookmarkIcon } from '@heroicons/react/24/solid';

export default function RecurringBillLifecycle() {
  return (
    <section className="w-full bg-[#f9fafb] py-12 px-4 sm:px-8 md:px-16 flex flex-col items-center">
      {/* Title */}
      <h2 className="text-center text-2xl font-semibold text-gray-900 mb-10">
        Life cycle of a Recurring Bill
      </h2>

      {/* Flowchart */}
      <div className="w-full max-w-6xl overflow-x-auto">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 px-4 py-4">
          {/* ROUTINE PURCHASE */}
          <div className="flex flex-col items-center">
            <div className="border border-blue-400 bg-white px-5 py-2 rounded-lg flex items-center gap-2 shadow-sm">
              <ShoppingBagIcon className="w-5 h-5 text-blue-500" />
              <span className="text-xs sm:text-sm font-semibold text-gray-800">ROUTINE PURCHASE</span>
            </div>
          </div>

          {/* Arrow */}
          <div className="w-6 h-0.5 border-t-2 border-dashed border-blue-400"></div>

          {/* CREATE RECURRING PROFILE */}
          <div className="flex flex-col items-center">
            <div className="border border-blue-400 bg-white px-5 py-2 rounded-lg flex items-center gap-2 shadow-sm">
              <DocumentTextIcon className="w-5 h-5 text-blue-500" />
              <span className="text-xs sm:text-sm font-semibold text-gray-800">CREATE RECURRING PROFILE</span>
            </div>
          </div>

          {/* Arrow */}
          <div className="w-6 h-0.5 border-t-2 border-dashed border-blue-400"></div>

          {/* GENERATED BILL */}
          <div className="flex flex-col items-center">
            <div className="border border-blue-400 bg-white px-5 py-2 rounded-lg flex items-center gap-2 shadow-sm">
              <BookmarkIcon className="w-5 h-5 text-blue-500" />
              <span className="text-xs sm:text-sm font-semibold text-gray-800">GENERATED BILL</span>
            </div>
          </div>

          {/* Arrow */}
          <div className="w-6 h-0.5 border-t-2 border-dashed border-blue-400"></div>

          {/* RECORD PAYMENT */}
          <div className="flex flex-col items-center">
            <div className="border border-green-400 bg-white px-5 py-2 rounded-lg flex items-center gap-2 shadow-sm">
              <CurrencyDollarIcon className="w-5 h-5 text-green-500" />
              <span className="text-xs sm:text-sm font-semibold text-gray-800">RECORD PAYMENT</span>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full border-t border-gray-300 my-10 max-w-4xl" />

      {/* Features List */}
      <div className="w-full max-w-2xl text-center space-y-6">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
          In the Recurring Bills module, you can:
        </h3>
        <ul className="text-sm sm:text-base text-gray-700 space-y-4">
          {[
            'Create a recurring profile to automatically generate bills.',
            'View when each bill was generated under the recurring profile.',
            'Create an individual bill within the recurring profile.',
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
