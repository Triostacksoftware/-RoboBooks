// components/TypesOfContacts.jsx
'use client';
import { UserGroupIcon, UserIcon } from '@heroicons/react/24/outline';

export default function TypesOfContacts() {
  return (
    <div className="min-h-screen bg-[#f7f8fa] mt-[-8vmin] flex flex-col items-center px-2 py-4 md:py-16">
      {/* Title */}
      <h1 className="text-xl md:text-2xl font-semibold text-gray-800 text-center mb-10 tracking-tight">
        Types of contacts
      </h1>
      {/* Connector Lines */}
      <div className="relative flex flex-col items-center w-full max-w-5xl mb-0">
        {/* Lines for desktop */}
        <div className="hidden md:block absolute top-6 left-0 w-full h-16 pointer-events-none z-0">
          <svg width="100%" height="100%" viewBox="0 0 960 80" className="w-full h-16">
            {/* Vertical from top center */}
            <line x1="480" y1="0" x2="480" y2="22" stroke="#b7d5fa" strokeDasharray="4 4" strokeWidth="2"/>
            {/* Horizontal */}
            <line x1="220" y1="22" x2="740" y2="22" stroke="#b7d5fa" strokeDasharray="4 4" strokeWidth="2"/>
            {/* Vertical to left */}
            <line x1="220" y1="22" x2="220" y2="80" stroke="#b7d5fa" strokeDasharray="4 4" strokeWidth="2"/>
            {/* Vertical to right */}
            <line x1="740" y1="22" x2="740" y2="80" stroke="#b7d5fa" strokeDasharray="4 4" strokeWidth="2"/>
          </svg>
        </div>
        {/* Main Boxes */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full z-10">
          {/* Customers */}
          <div className="bg-white border border-blue-200 rounded-2xl px-5 py-7 flex flex-col items-center w-full max-w-[300px] shadow-md">
            <UserGroupIcon className="w-8 h-8 text-teal-400 mb-1" />
            <div className="text-[13px] font-semibold text-gray-700 mb-1 tracking-wide">
              CUSTOMERS
            </div>
            <div className="border-t border-dotted border-blue-200 w-20 mb-1"></div>
            <div className="flex flex-col gap-1 text-xs text-gray-600 font-medium">
              <div>Contact Person 1</div>
              <div>Contact Person 2</div>
              <div>Contact Person 3</div>
            </div>
          </div>
          {/* Vendors */}
          <div className="bg-white border border-purple-200 rounded-2xl px-5 py-7 flex flex-col items-center w-full max-w-[300px] shadow-md">
            <UserGroupIcon className="w-8 h-8 text-purple-500 mb-1" />
            <div className="text-[13px] font-semibold text-gray-700 mb-1 tracking-wide">
              VENDORS
            </div>
            <div className="border-t border-dotted border-purple-200 w-20 mb-1"></div>
            <div className="flex flex-col gap-1 text-xs text-gray-600 font-medium">
              <div>Contact Person 1</div>
              <div>Contact Person 2</div>
              <div>Contact Person 3</div>
            </div>
          </div>
        </div>
      </div>
      {/* Info Box */}
      <div className="mt-10 flex flex-col items-center w-full">
        <div className="flex items-center bg-white border border-yellow-200 rounded-2xl px-4 py-3 shadow-sm max-w-xl w-full gap-2">
          <UserIcon className="w-5 h-5 text-yellow-500" />
          <span className="text-gray-700 font-normal text-sm">
            An individual person or a company can be added as a customer/vendor.
          </span>
        </div>
      </div>
    </div>
  );
}
