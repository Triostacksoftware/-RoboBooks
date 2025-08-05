'use client';

import { CheckCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

const features = [
  {
    text: 'Customize your quote',
    link: 'Learn More',
    href: '#',
  },
  {
    text: 'Convert an accepted quote into an invoice',
  },
  {
    text: 'Know when an quote has been viewed, accepted, or declined',
    link: 'Learn More',
    href: '#',
  },
];

export default function QuotesModuleInfo() {
  return (
    <section className="w-full px-4 sm:px-8 py-12 bg-[#f9fafb] flex justify-center">
      <div className="max-w-3xl text-center">
        {/* Title */}
        <h2 className="text-2xl font-semibold text-gray-900 mb-10">
          In the Quotes module, you can:
        </h2>

        {/* Feature List */}
        <ul className="space-y-6 text-left">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-3 sm:gap-4">
              <CheckCircleIcon className="h-6 w-6 text-blue-600 shrink-0 mt-1" />
              <p className="text-sm sm:text-base text-gray-800 leading-relaxed">
                {feature.text}
                {feature.link && (
                  <>
                    {' '}
                    <Link
                      href={feature.href}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {feature.link}
                    </Link>
                  </>
                )}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
