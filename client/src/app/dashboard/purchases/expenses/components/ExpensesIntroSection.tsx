// components/ExpensesIntroSection.jsx
'use client';
import Image from 'next/image';

export default function ExpensesIntroSection() {
  return (
    <section className="w-full flex flex-col items-center bg-[#fafbfc] py-8 px-2 min-h-screen">
      {/* Image Card */}
      <div className="w-full flex justify-center mb-6">
        <div className="relative bg-white rounded-xl shadow-lg flex flex-col items-center max-w-xl w-full overflow-hidden min-h-[180px]">
          {/* The image instead of play button */}
          <Image
            src="/images/your-illustration.png" // Change this path to your image
            alt="Zoho Books How to record and manage expenses"
            width={480}
            height={210}
            className="object-cover w-full h-auto"
            priority
          />
          {/* Overlayed content */}
          <div className="absolute left-4 top-4 flex flex-col z-10">
            <div className="flex items-center gap-2">
              <Image
                src="/zohobooks_logo.png"
                alt="Zoho Books"
                width={22}
                height={22}
                className="object-contain"
              />
              <span className="font-bold text-[15px] text-[#1976d2] leading-tight">Books</span>
            </div>
            <div className="text-gray-700 font-medium text-sm mt-1">
              How to record and manage expenses
            </div>
          </div>
        </div>
      </div>
      {/* Section Title */}
      <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-1 text-center">
        Time To Manage Your Expenses!
      </h2>
      {/* Subtitle */}
      <p className="text-[13px] md:text-sm text-gray-500 mb-4 text-center max-w-xl">
        Create and manage expenses that are part of your organization’s operating costs.
      </p>
      {/* Buttons */}
      <div className="flex flex-col items-center gap-2 w-full mt-2">
        <button
          className="w-[180px] max-w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg py-2 shadow transition"
        >
          RECORD EXPENSE
        </button>
        <button
          className="w-[180px] max-w-full bg-transparent text-blue-600 hover:underline font-medium text-sm rounded-lg py-1"
        >
          Import Expenses
        </button>
      </div>
    </section>
  );
}
