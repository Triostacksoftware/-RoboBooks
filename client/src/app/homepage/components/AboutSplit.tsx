'use client';

import { useEffect, useRef } from 'react';

export default function AboutSplit() {
  const ref = useRef(null);

  return (
    <section
      ref={ref}
      className="relative isolate overflow-hidden bg-gray-50 py-20 lg:py-32"
    >
      {/* backdrop blobs */}
      <div className="absolute -z-10 top-[-6rem] right-[-8rem] h-[28rem] w-[28rem] rounded-full bg-gradient-to-br from-[#86f2ff] to-[#008cff] blur-3xl opacity-20" />
      <div className="absolute -z-10 bottom-[-8rem] left-[-10rem] h-[32rem] w-[32rem] rounded-full bg-gradient-to-br from-[#30fcb0] to-[#00a86b] blur-3xl opacity-20" />

      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-8 animate-fade-in">
            <p className="uppercase tracking-[.25em] text-blue-600 font-semibold">
              Why Choose Us
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-green-500 bg-clip-text text-transparent">
                Built for Indian Businesses
              </span>
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              We understand the unique challenges of Indian businesses. Our platform is designed with GST compliance, local tax structures, and Indian business practices in mind.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">GST-compliant invoicing</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Multi-language support</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Local payment gateways</span>
              </div>
            </div>
          </div>

          {/* Video/Image */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md rounded-xl overflow-hidden shadow-2xl hover:scale-105 transition-transform duration-300">
              <video
                src="/images/aboutsplit.mp4"
                className="w-full h-auto object-cover"
                autoPlay
                loop
                muted
                playsInline
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
