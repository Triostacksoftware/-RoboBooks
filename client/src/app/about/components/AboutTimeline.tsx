'use client';

import { useEffect, useRef } from 'react';

const timeline = [
  {
    year: '2020',
    title: 'Company Founded',
    description: 'Robo Books was founded with a vision to simplify accounting for Indian businesses.',
    achievement: 'Started with 5 team members'
  },
  {
    year: '2021',
    title: 'First 1000 Customers',
    description: 'Reached our first major milestone with 1000 satisfied customers.',
    achievement: 'Launched GST compliance features'
  },
  {
    year: '2022',
    title: 'Series A Funding',
    description: 'Secured funding to scale our operations and enhance our platform.',
    achievement: 'Expanded team to 25 members'
  },
  {
    year: '2023',
    title: '10,000+ Customers',
    description: 'Achieved significant growth with over 10,000 businesses trusting our platform.',
    achievement: 'Launched mobile app'
  },
  {
    year: '2024',
    title: 'AI Integration',
    description: 'Introduced AI-powered features to automate accounting processes.',
    achievement: 'Processed ₹500Cr+ in transactions'
  },
  {
    year: '2025',
    title: 'Future Vision',
    description: 'Continuing to innovate and expand our services to serve more businesses.',
    achievement: 'Targeting 50,000+ customers'
  }
];

export default function AboutTimeline() {
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
            Our Journey
          </p>
          <h2
            className="
              text-3xl sm:text-4xl md:text-5xl font-bold leading-tight
              bg-gradient-to-r from-blue-600 via-cyan-500 to-green-500
              bg-clip-text text-transparent mt-4
            "
          >
            From Startup to Success
          </h2>
          <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
            Every milestone represents our commitment to innovation and customer success.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-4 md:left-1/2 md:transform md:-translate-x-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-green-500" />

          {/* Timeline Items */}
          <div className="space-y-12">
            {timeline.map((item, index) => (
              <div
                key={index}
                className={`relative flex items-center animate-fade-in ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Timeline Dot */}
                <div className="
                  absolute left-4 md:left-1/2 md:transform md:-translate-x-1/2
                  w-4 h-4 bg-gradient-to-r from-blue-500 to-green-500
                  rounded-full border-4 border-white shadow-lg
                  z-10
                " />

                {/* Content Card */}
                <div className={`
                  ml-12 md:ml-0 md:w-5/12
                  ${index % 2 === 0 ? 'md:mr-auto md:pr-8' : 'md:ml-auto md:pl-8'}
                `}>
                  <div className="
                    bg-white rounded-xl p-6 shadow-lg
                    border border-gray-100 hover:border-blue-200
                    transition-all duration-300 hover:scale-105
                  ">
                    <div className="text-2xl font-bold text-blue-600 mb-2">
                      {item.year}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 mb-3">
                      {item.description}
                    </p>
                    <div className="
                      inline-flex items-center gap-2 px-3 py-1
                      bg-gradient-to-r from-green-100 to-blue-100
                      text-green-700 rounded-full text-sm font-medium
                    ">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {item.achievement}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
