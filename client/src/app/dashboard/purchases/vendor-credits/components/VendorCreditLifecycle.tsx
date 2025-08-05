'use client';

import {
  CheckCircleIcon,
  CubeIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  BookmarkIcon,
} from '@heroicons/react/24/outline';

export default function VendorCreditLifecycle() {
  return (
    <section className="w-full bg-[#f9fafb] py-10 px-4 sm:px-6 md:px-10 flex flex-col items-center">
      {/* Title */}
      <h2 className="text-center text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-8">
        Life cycle of a Vendor Credit
      </h2>

      {/* Flowchart */}
      <div className="w-full max-w-6xl relative">
        <div className="flex items-center justify-center gap-4 sm:gap-5 flex-wrap px-2 py-4 relative">
          {/* Step 1: PRODUCT RETURNED */}
          <div className="flex flex-col items-center">
            <div className="border border-blue-400 bg-white px-3 py-1.5 rounded-md flex items-center gap-1.5 shadow-sm">
              <CubeIcon className="w-4 h-4 text-blue-500" />
              <span className="text-[11px] sm:text-xs font-semibold text-gray-800 text-center">
                PRODUCT RETURNED / CANCELLED
              </span>
            </div>
          </div>

          {/* Arrow */}
          <div className="w-4 sm:w-5 h-0.5 border-t-2 border-dashed border-blue-400"></div>

          {/* Step 2: CREDIT NOTE */}
          <div className="flex flex-col items-center">
            <div className="border border-green-400 bg-white px-3 py-1.5 rounded-md flex items-center gap-1.5 shadow-sm">
              <CurrencyDollarIcon className="w-4 h-4 text-green-500" />
              <span className="text-[11px] sm:text-xs font-semibold text-gray-800 text-center">
                CREDIT NOTE RECEIVED
              </span>
            </div>
          </div>

          {/* Arrow */}
          <div className="w-4 sm:w-5 h-0.5 border-t-2 border-dashed border-blue-400"></div>

          {/* Step 3: RECORD VENDOR CREDITS */}
          <div className="flex flex-col items-center relative">
            <div className="border border-green-400 bg-white px-3 py-1.5 rounded-md flex items-center gap-1.5 shadow-sm">
              <CurrencyDollarIcon className="w-4 h-4 text-green-500" />
              <span className="text-[11px] sm:text-xs font-semibold text-gray-800 text-center">
                RECORD VENDOR CREDITS
              </span>
            </div>
            <p className="text-[10px] text-gray-500 mt-0.5">MARK AS OPEN</p>

            {/* Branch lines */}
            <div className="absolute right-[-65px] top-1/2 translate-y-[-50%] w-14 border-t-2 border-dashed border-blue-400" />
            <div className="absolute right-[-65px] top-1/2 translate-y-[-50%] h-16 border-l-2 border-dashed border-blue-400" />
          </div>

          {/* Outcomes: APPLY & REFUND */}
          <div className="flex flex-col justify-between h-[110px] mt-[-30px] ml-[-0.5rem] gap-4">
            <div className="border border-green-400 bg-white px-3 py-1.5 rounded-md flex items-center gap-1.5 shadow-sm">
              <BookmarkIcon className="w-4 h-4 text-green-500" />
              <span className="text-[11px] sm:text-xs font-semibold text-gray-800">
                APPLY TO FUTURE BILLS
              </span>
            </div>

            <div className="border border-blue-400 bg-white px-3 py-1.5 rounded-md flex items-center gap-1.5 shadow-sm">
              <BanknotesIcon className="w-4 h-4 text-blue-500" />
              <span className="text-[11px] sm:text-xs font-semibold text-gray-800">
                RECORD REFUND
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full border-t border-gray-300 my-8 max-w-4xl" />

      {/* Features List */}
      <div className="w-full max-w-2xl text-center space-y-4">
        <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">
          In the Vendor Credits module, you can:
        </h3>
        <ul className="text-xs sm:text-sm text-gray-700 space-y-3">
          {[
            'Record credits when you receive a credit note from your vendor.',
            'Apply vendor credits to bill payments in the future.',
            'Record refunds for your vendor credits.',
          ].map((item, index) => (
            <li key={index} className="flex items-center justify-center gap-2">
              <CheckCircleIcon className="w-4 h-4 text-blue-600" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
