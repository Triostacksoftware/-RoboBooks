'use client';

import { useEffect, useRef } from 'react';

const stats = [
  {
    number: '10,000+',
    label: 'Happy Customers',
    description: 'Businesses trust Robo Books for their accounting needs'
  },
  {
    number: '₹500Cr+',
    label: 'Transactions Processed',
    description: 'Total value of transactions handled through our platform'
  },
  {
    number: '99.9%',
    label: 'Uptime',
    description: 'Reliable service that businesses can count on'
  },
  {
    number: '50+',
    label: 'Team Members',
    description: 'Dedicated professionals working to serve you better'
  }
];

export default function AboutStats() {
  const ref = useRef(null);

  return (
    <section
      ref={ref}
      className="
        relative isolate overflow-hidden bg-white
        py-20 lg:py-32
        scroll-mt-24
      "
    >
      {/* backdrop blobs */}
      <div className="absolute -z-10 top-[-6rem] left-[-8rem] h-[28rem] w-[28rem] rounded-full bg-gradient-to-br from-[#86f2ff] to-[#008cff] blur-3xl opacity-20" />
      <div className="absolute -z-10 bottom-[-8rem] right-[-10rem] h-[32rem] w-[32rem] rounded-full bg-gradient-to-br from-[#30fcb0] to-[#00a86b] blur-3xl opacity-20" />

      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-20">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <p className="uppercase tracking-[.25em] text-blue-600 font-semibold">
            Our Impact
          </p>
          <h2
            className="
              text-3xl sm:text-4xl md:text-5xl font-bold leading-tight
              bg-gradient-to-r from-blue-600 via-cyan-500 to-green-500
              bg-clip-text text-transparent mt-4
            "
          >
            Numbers That Matter
          </h2>
          <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
            These numbers represent our commitment to excellence and the trust our customers place in us.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="
                text-center p-8 rounded-xl
                bg-gradient-to-br from-blue-50 to-cyan-50
                border border-blue-100 hover:border-blue-200
                transition-all duration-300 hover:scale-105
                animate-fade-in
              "
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">
                {stat.number}
              </div>
              <div className="text-lg font-semibold text-gray-900 mb-2">
                {stat.label}
              </div>
              <div className="text-sm text-gray-600">
                {stat.description}
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center animate-fade-in">
          <div className="
            inline-flex items-center gap-2 px-6 py-3
            bg-gradient-to-r from-green-400 to-blue-500
            text-white rounded-full font-semibold
            shadow-lg hover:shadow-xl transition-shadow
          ">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Trusted by 10,000+ Businesses
          </div>
        </div>
      </div>
    </section>
  );
}
