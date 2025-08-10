/* app/(marketing)/components/BusinessBenefits.tsx */
'use client';

import { FC, useEffect, useRef } from 'react';
import {
  BanknotesIcon,
  CalculatorIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';

interface Feature {
  title: string;
  description: string;
  icon: FC<React.SVGProps<SVGSVGElement>>;
}

const features: Feature[] = [
  {
    title: 'Accurate GST Templates',
    description:
      'Use our GST templates for error-free invoices and compliance.',
    icon: BanknotesIcon,
  },
  {
    title: 'GST Rate Calculation',
    description: 'Automatic CGST & SGST/IGST calculations based on user input.',
    icon: CalculatorIcon,
  },
  {
    title: 'Access Your Business Anywhere',
    description: 'Cloud-based software lets you access documents securely.',
    icon: GlobeAltIcon,
  },
];

export default function BusinessBenefits() {
  const ref = useRef(null);

  return (
    <section
      ref={ref}
      className="relative mx-auto max-w-6xl px-4 py-16 sm:px-8 lg:px-10"
    >
      {/* heading */}
      <h2 className="mb-10 bg-gradient-to-r from-blue-600 via-blue-500 to-green-500
                     bg-clip-text text-2xl font-medium leading-tight tracking-tight
                     text-transparent sm:text-3xl xl:text-4xl animate-fade-in">
        How&nbsp;Robo&nbsp;Books&nbsp;Online&nbsp;can&nbsp;improve&nbsp;your&nbsp;business
      </h2>

      {/* content grid */}
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        {/* feature list */}
        <ul className="space-y-10">
          {features.map(({ title, description, icon: Icon }, index) => (
            <li
              key={title}
              className="flex items-start space-x-5 animate-fade-in hover:scale-105 transition-transform duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <span className="flex h-12 w-12 flex-none items-center justify-center
                             rounded-full bg-gradient-to-br from-blue-50 to-green-50
                             ring-1 ring-inset ring-blue-200/30 hover:rotate-12 transition-transform duration-300">
                <Icon className="h-7 w-7 stroke-[1.8] text-blue-600" />
              </span>

              <div>
                <h3 className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text
                               text-lg font-normal text-transparent sm:text-xl">
                  {title}
                </h3>
                <p className="mt-1 max-w-md text-sm text-gray-700">
                  {description}
                </p>
              </div>
            </li>
          ))}
        </ul>

        {/* video preview instead of image */}
        <div className="relative mx-auto w-full max-w-lg animate-fade-in">
          <div className="rounded-xl shadow-lg overflow-hidden hover:scale-105 transition-transform duration-300">
            <video
              src="/images/businessbenefits.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-300 h-70 rounded-xl object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
