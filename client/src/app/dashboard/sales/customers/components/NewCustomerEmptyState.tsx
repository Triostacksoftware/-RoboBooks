'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FcGoogle } from 'react-icons/fc';
import { FaInfinity } from 'react-icons/fa6';
import { SiZoho } from 'react-icons/si';

export default function NewCustomerEmptyState() {
  const router = useRouter();

  const handleCreateCustomer = () => {
    router.push('/dashboard/customers/new');
  };

  const handleImportCustomers = () => {
    router.push('/dashboard/customers/import');
  };

  const handleSSOLogin = () => {
    console.log('SSO login triggered');
  };

  const handleGoogleLogin = () => {
    console.log('Google login triggered');
  };

  return (
    <section className="w-full bg-white py-10 px-4 flex flex-col items-center space-y-5">
      {/* Title */}
      <h2 className="text-2xl  font-semibold text-gray-900 text-center">
        Business is no fun without people.
      </h2>

      {/* Subtitle */}
      <p className="text-center text-sm sm:text-base text-gray-500 max-w-xl">
        Create and manage your contacts, all in one place.
      </p>

      {/* Create Button */}
      <button
        onClick={handleCreateCustomer}
        className="px-6 py-2 bg-blue-600 text-white text-xs sm:text-sm rounded-md hover:bg-blue-700 active:scale-95 shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-300"
      >
        CREATE NEW CUSTOMER
      </button>

      {/* Import Link */}
      <button
        onClick={handleImportCustomers}
        className="text-blue-600 text-xs sm:text-sm hover:underline focus:outline-none focus:ring-1 focus:ring-blue-300"
      >
        Click here to import customers from file
      </button>

      {/* Auth Options */}
      <div className="flex flex-col items-center space-y-2 pt-4">
        <span className="text-xs text-gray-400">or using</span>
        <div className="flex items-center gap-4">
          <button onClick={handleSSOLogin} title="SSO">
            <FaInfinity className="w-5 h-5 text-blue-600 hover:scale-110 transition" />
          </button>
          <button onClick={handleGoogleLogin} title="Google">
            <FcGoogle className="w-5 h-5 hover:scale-110 transition" />
          </button>
        </div>
      </div>
    </section>
  );
}
