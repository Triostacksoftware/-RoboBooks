"use client";

import Link from "next/link";
import React from "react";

const Hero: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 text-white overflow-hidden pt-16 pb-20 px-4 sm:px-6 lg:px-8">
      {/* Top Badge */}
      <div className="text-center mb-4 mt-14 animate-fade-in-down">
        <span className="inline-flex items-center px-3 py-1 bg-white/10 text-sm rounded-full font-medium text-yellow-200">
          <svg
            className="w-4 h-4 mr-2 text-yellow-300"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z" />
          </svg>
          GST compliant accounting software
        </span>
      </div>

      {/* Headings */}
      <div className="text-center max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight animate-slide-up text-yellow-100">
          <span className="text-white">Comprehensive</span>
          <br />
          accounting platform for
          <br />
          <span className="text-white">growing businesses</span>
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-white max-w-2xl mx-auto animate-fade-in-up">
          Manage end-to-end accounting—from banking & e-invoicing to inventory &
          payroll with the best accounting software in India.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex justify-center flex-wrap gap-4 animate-fade-in-up">
          <Link
            href="/register"
            className="inline-block w-full sm:w-auto bg-yellow-400 text-black px-8 py-3 rounded-full font-semibold transition duration-300 transform hover:bg-yellow-300 hover:scale-105 shadow-lg text-center"
          >
            Start my free trial
          </Link>
          <Link
            href="/contact"
            className="inline-block w-full sm:w-auto border border-yellow-300 text-yellow-200 px-8 py-3 rounded-full font-semibold transition duration-300 hover:bg-yellow-100 hover:text-black hover:scale-105 text-center"
          >
            Request a demo
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
