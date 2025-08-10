'use client';

import { useEffect, useRef } from 'react';

export default function AboutMission() {
  const ref = useRef(null);

  return (
    <section
      id="mission"
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

      <div
        className="
          mx-auto grid max-w-7xl items-stretch gap-12
          px-6 sm:px-10 lg:px-20
          lg:grid-cols-2
        "
      >
        {/* -------- Text block -------- */}
        <div className="space-y-8 text-center lg:text-left animate-fade-in">
          <p className="uppercase tracking-[.25em] text-blue-600 font-semibold">
            Our Mission
          </p>

          <h2
            className="
              text-3xl sm:text-4xl md:text-5xl font-bold leading-tight
              bg-gradient-to-r from-blue-600 via-cyan-500 to-green-500
              bg-clip-text text-transparent
            "
          >
            Simplifying<br />
            Business Accounting<br />
            for Everyone
          </h2>

          <p className="mx-auto lg:mx-0 max-w-xl text-gray-700 text-lg">
            We believe that every business, regardless of size, deserves access to powerful, 
            user-friendly accounting tools. Our mission is to democratize financial management 
            by making complex accounting processes simple and accessible.
          </p>

          <ul className="space-y-4">
            {[
              'Make accounting accessible to all businesses',
              'Provide GST-compliant solutions for India',
              'Automate repetitive financial tasks',
              'Ensure data security and privacy',
            ].map((item) => (
              <li key={item} className="group flex items-start gap-3">
                <svg
                  className="mt-1 h-4 w-4 text-green-500 group-hover:scale-110 transition"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M6.003 10.803 3.2 8l-1.2 1.2 4.002 4L14 5.202 12.8 4l-6.797 6.803Z" />
                </svg>
                <span className="group-hover:text-blue-600 transition-colors">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* -------- Illustration card (Video) -------- */}
        <div className="flex justify-center lg:justify-end">
          <div
            className="
              relative w-full max-w-xs sm:max-w-sm md:max-w-md xl:max-w-md
              rounded-xl ring-4 ring-transparent bg-white/20 overflow-hidden
              aspect-[3/4] lg:aspect-auto lg:h-full
              hover:scale-105 transition-transform duration-300
            "
          >
            <video
              src="/images/aboutsplit.mp4"
              className="absolute inset-0 w-full h-full object-cover rounded-xl"
              autoPlay
              loop
              muted
              playsInline
            />
          </div>
        </div>
      </div>
    </section>
  );
}
