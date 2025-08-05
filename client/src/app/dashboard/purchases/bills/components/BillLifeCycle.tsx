'use client';

import {
  ShoppingBagIcon,
  DocumentTextIcon,
  BanknotesIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

export default function BillLifeCycle() {
  return (
    <section className="w-full bg-[#f9fafb] py-12 px-4 sm:px-8 md:px-16 flex flex-col items-center">
      {/* Title */}
      <h2 className="text-center text-2xl font-semibold text-gray-900 mb-10">
        Life cycle of a Bill
      </h2>

      {/* Flowchart */}
      <div className="w-full max-w-5xl overflow-x-auto relative">
        <div className="flex items-center justify-center gap-6 relative px-4 py-6">
          {/* PURCHASE ITEMS */}
          <div className="flex flex-col items-center">
            <div className="border border-blue-400 bg-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm">
              <ShoppingBagIcon className="w-5 h-5 text-blue-500" />
              <span className="text-xs sm:text-sm font-semibold text-gray-800">PURCHASE ITEMS</span>
            </div>
          </div>

          {/* Arrow to Record Bill */}
          <div className="w-6 h-0.5 border-t-2 border-dashed border-blue-400"></div>

          {/* RECORD BILL */}
          <div className="flex flex-col items-center">
            <div className="border border-blue-400 bg-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm">
              <DocumentTextIcon className="w-5 h-5 text-blue-500" />
              <span className="text-xs sm:text-sm font-semibold text-gray-800">RECORD BILL</span>
            </div>
            <span className="text-[10px] sm:text-xs mt-1 text-gray-500 font-medium">CONVERT TO OPEN</span>
          </div>

          {/* Arrow to Record Payment */}
          <div className="w-6 h-0.5 border-t-2 border-dashed border-blue-400"></div>

          {/* RECORD PAYMENT */}
          <div className="flex flex-col items-center">
            <div className="border border-green-400 bg-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm">
              <CurrencyDollarIcon className="w-5 h-5 text-green-500" />
              <span className="text-xs sm:text-sm font-semibold text-gray-800">RECORD PAYMENT</span>
            </div>
          </div>

          {/* RECORD PARTIAL PAYMENT - above */}
          <div className="absolute top-[-4rem] right-10 flex flex-col items-center">
            <div className="border border-blue-400 bg-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm">
              <BanknotesIcon className="w-5 h-5 text-blue-500" />
              <span className="text-xs sm:text-sm font-semibold text-gray-800">RECORD PARTIAL PAYMENT</span>
            </div>

            {/* Arrow from Record Payment up to Partial Payment */}
            <div className="w-0.5 h-6 border-l-2 border-dashed border-blue-400" />
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full border-t border-gray-300 my-10 max-w-4xl" />

      {/* Features List */}
      <div className="w-full max-w-2xl text-center space-y-6">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">In the Bills module, you can:</h3>
        <ul className="text-sm sm:text-base text-gray-700 space-y-4">
          {[
            'Create bills and record payments',
            'Apply credits to bills',
            'Make online payments',
            'Allocate landed costs',
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
