'use client';

import {
  UsersIcon,
  UserIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

export default function ContactTypesSection() {
  return (
    <section className="w-full bg-[#f9fafb] py-12 px-4 sm:px-8 md:px-16 flex flex-col items-center">
      {/* Title */}
      <h2 className="text-center text-2xl font-semibold text-gray-900 mb-8">
        Types of contacts
      </h2>

      {/* Contact types block */}
      <div className="relative flex flex-col md:flex-row gap-8 items-start justify-center w-full max-w-5xl">
        {/* Vertical connection line */}
        <div className="absolute top-0 left-1/2 h-6 w-0.5 bg-blue-300 -translate-x-1/2" />
        <div className="absolute top-6 left-1/2 w-[160px] h-0.5 bg-blue-300 -translate-x-1/2 hidden md:block" />

        {/* Customers Block */}
        <div className="relative bg-white border border-blue-300 rounded-lg p-6 w-full md:w-[300px] flex flex-col items-center shadow-sm">
          <UsersIcon className="w-8 h-8 text-teal-500 mb-2" />
          <h3 className="text-sm font-semibold text-gray-700 mb-4">CUSTOMERS</h3>
          <div className="w-full border-t border-dashed border-blue-300 mb-4" />
          <ul className="text-sm text-gray-800 space-y-2">
            <li>CONTACT PERSON 1</li>
            <li>CONTACT PERSON 2</li>
            <li>CONTACT PERSON 3</li>
          </ul>
        </div>

        {/* Vendors Block */}
        <div className="relative bg-white border border-blue-300 rounded-lg p-6 w-full md:w-[300px] flex flex-col items-center shadow-sm">
          <UsersIcon className="w-8 h-8 text-purple-600 mb-2" />
          <h3 className="text-sm font-semibold text-gray-700 mb-4">VENDORS</h3>
          <div className="w-full border-t border-dashed border-blue-300 mb-4" />
          <ul className="text-sm text-gray-800 space-y-2">
            <li>CONTACT PERSON 1</li>
            <li>CONTACT PERSON 2</li>
            <li>CONTACT PERSON 3</li>
          </ul>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-10 max-w-2xl w-full bg-white border border-blue-300 rounded-lg p-4 flex items-center gap-3 shadow-sm">
        <UserIcon className="w-5 h-5 text-yellow-500" />
        <p className="text-sm text-gray-700">
          An individual person or a company can be added as a customer/vendor.
        </p>
      </div>
    </section>
  );
}
