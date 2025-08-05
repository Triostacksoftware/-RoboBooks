'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

const bankLogos = [
  { src: '/logos/standard-chartered.svg', alt: 'Standard Chartered' },
  { src: '/logos/hsbc.svg', alt: 'HSBC' },
  { src: '/logos/yes-bank.svg', alt: 'YES BANK' },
  { src: '/logos/sbi.svg', alt: 'SBI' },
];

export default function PaymentsEmptyState() {
  const router = useRouter();

  const goToUnpaid = () => {
    router.push('/dashboard/bills/unpaid');
  };

  const importPayments = () => {
    router.push('/dashboard/payments/import');
  };

  return (
    <section className="w-full bg-white py-12 px-4 flex flex-col items-center space-y-8">
      {/* Empty State Message */}
      <h2 className="text-2xl font-semibold text-gray-900 text-center px-2">
        You haven’t made any payments yet.
      </h2>
      <p className="text-sm sm:text-base text-gray-600 text-center max-w-xl px-2">
        Receipts of your bill payments will show up here.
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <button
          onClick={goToUnpaid}
          className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-full shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 active:scale-95 transition-transform cursor-pointer"
        >
          GO TO UNPAID BILLS
        </button>
        <button
          onClick={importPayments}
          className="w-full sm:w-auto px-6 py-3 text-blue-600 text-sm font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-blue-200 rounded-full cursor-pointer"
        >
          Import Payments
        </button>
      </div>

      {/* Partner Logos */}
      <div className="w-full max-w-4xl flex flex-wrap justify-center items-center gap-8 pt-12">
        {bankLogos.map((bank) => (
          <div key={bank.alt} className="flex-shrink-0">
            <Image
              src={bank.src}
              alt={bank.alt}
              width={120}
              height={40}
              className="object-contain"
            />
          </div>
        ))}
      </div>

      {/* Setup Link */}
      <p className="mt-4 text-center text-sm text-gray-700 px-2">
        We’ve partnered with the above bank(s). You can now initiate payments directly via Zoho Books.{' '}
        <Link
          href="/dashboard/banking/setup"
          className="text-blue-600 font-medium hover:underline focus:outline-none"
        >
          Set Up Now
        </Link>
      </p>
    </section>
  );
}
