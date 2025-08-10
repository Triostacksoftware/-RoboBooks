'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const team = [
  {
    name: 'Rajesh Kumar',
    role: 'CEO & Founder',
    image: '/images/testimonial1.jpg',
    description: 'Former CFO with 15+ years of experience in financial technology.',
    linkedin: '#',
    twitter: '#'
  },
  {
    name: 'Priya Sharma',
    role: 'CTO',
    image: '/images/testimonial2.jpg',
    description: 'Tech leader with expertise in building scalable SaaS platforms.',
    linkedin: '#',
    twitter: '#'
  },
  {
    name: 'Amit Patel',
    role: 'Head of Product',
    image: '/images/testimonial3.jpg',
    description: 'Product strategist focused on user experience and business growth.',
    linkedin: '#',
    twitter: '#'
  },
  {
    name: 'Neha Singh',
    role: 'Head of Customer Success',
    image: '/images/testimonial4.jpg',
    description: 'Customer advocate ensuring exceptional service and satisfaction.',
    linkedin: '#',
    twitter: '#'
  }
];

export default function AboutTeam() {
  const ref = useRef(null);

  return (
    <section
      ref={ref}
      id="team-section"
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
            Meet Our Team
          </p>
          <h2
            className="
              text-3xl sm:text-4xl md:text-5xl font-bold leading-tight
              bg-gradient-to-r from-blue-600 via-cyan-500 to-green-500
              bg-clip-text text-transparent mt-4
            "
          >
            The People Behind<br />
            Robo Books
          </h2>
          <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
            Our leadership team brings together decades of experience in finance, technology, and customer success.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, index) => (
            <div
              key={index}
              className="
                bg-white rounded-xl p-6 shadow-lg
                border border-gray-100 hover:border-blue-200
                transition-all duration-300 text-center hover:scale-105
                animate-fade-in
              "
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative mb-4">
                <div className="
                  w-24 h-24 mx-auto rounded-full overflow-hidden
                  ring-4 ring-blue-100
                ">
                  <Image
                    src={member.image}
                    alt={member.name}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {member.name}
              </h3>
              <p className="text-blue-600 font-semibold mb-3">
                {member.role}
              </p>
              <p className="text-gray-600 text-sm mb-4">
                {member.description}
              </p>
              
              {/* Social Links */}
              <div className="flex justify-center gap-3">
                <a
                  href={member.linkedin}
                  className="
                    w-8 h-8 rounded-full bg-blue-600
                    flex items-center justify-center
                    text-white hover:bg-blue-700
                    transition-colors
                  "
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                  </svg>
                </a>
                <a
                  href={member.twitter}
                  className="
                    w-8 h-8 rounded-full bg-blue-400
                    flex items-center justify-center
                    text-white hover:bg-blue-500
                    transition-colors
                  "
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center animate-fade-in">
          <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-shadow">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
            </svg>
            Join Our Team
          </Link>
        </div>
      </div>
    </section>
  );
}
