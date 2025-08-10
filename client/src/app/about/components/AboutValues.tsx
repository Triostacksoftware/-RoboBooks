'use client';

import { useEffect, useRef } from 'react';

const values = [
  {
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
      </svg>
    ),
    title: 'Innovation',
    description: 'We constantly push boundaries to create cutting-edge solutions that transform how businesses handle their finances.'
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
      </svg>
    ),
    title: 'Simplicity',
    description: 'We believe in making complex accounting processes simple and accessible to businesses of all sizes.'
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
      </svg>
    ),
    title: 'Security',
    description: 'Your data security is our top priority. We implement bank-grade security measures to protect your information.'
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Reliability',
    description: 'We provide dependable solutions that businesses can count on for their critical financial operations.'
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
      </svg>
    ),
    title: 'Customer Focus',
    description: 'We put our customers first, understanding their needs and delivering solutions that exceed expectations.'
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    title: 'Excellence',
    description: 'We strive for excellence in everything we do, from product development to customer support.'
  }
];

export default function AboutValues() {
  const ref = useRef(null);

  return (
    <section
      ref={ref}
      className="
        relative isolate overflow-hidden bg-gray-50
        py-20 lg:py-32
        scroll-mt-24
      "
    >
      {/* backdrop blobs */}
      <div className="absolute -z-10 top-[-6rem] right-[-8rem] h-[28rem] w-[28rem] rounded-full bg-gradient-to-br from-[#86f2ff] to-[#008cff] blur-3xl opacity-20" />
      <div className="absolute -z-10 bottom-[-8rem] left-[-10rem] h-[32rem] w-[32rem] rounded-full bg-gradient-to-br from-[#30fcb0] to-[#00a86b] blur-3xl opacity-20" />

      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-20">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <p className="uppercase tracking-[.25em] text-blue-600 font-semibold">
            Our Values
          </p>
          <h2
            className="
              text-3xl sm:text-4xl md:text-5xl font-bold leading-tight
              bg-gradient-to-r from-blue-600 via-cyan-500 to-green-500
              bg-clip-text text-transparent mt-4
            "
          >
            What Drives Us
          </h2>
          <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
            These core values guide everything we do and shape how we serve our customers.
          </p>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <div
              key={index}
              className="
                bg-white rounded-xl p-8 shadow-lg
                border border-gray-100 hover:border-blue-200
                transition-all duration-300 hover:scale-105
                animate-fade-in
              "
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="text-blue-600 mb-4">
                {value.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {value.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
