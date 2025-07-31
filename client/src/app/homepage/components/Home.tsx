'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

// Animation helper
const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 50 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.8, delay } },
});

/**
 * Hero section – improved mobile spacing so text never hides under the fixed navbar.
 */
const Hero: React.FC = () => (
  <section
    id="hero"
    className="
      relative flex items-center
      min-h-screen md:min-h-[120vh] overflow-hidden
      /* 👇 extra top padding on small screens so text clears fixed navbar */
      pt-24 md:pt-0
      px-6 sm:px-8 md:px-10
      text-white
      bg-gradient-to-br from-[#1b3075] via-[#302c80] to-[#11366c]
      scroll-mt-24
    "
  >
    {/* subtle pattern */}
    <div className="absolute inset-0 -z-10 bg-[url('/pattern.svg')] opacity-10" />

    <div className="mx-auto grid max-w-7xl items-center gap-12 md:gap-16 md:grid-cols-2">
      {/* ---------- LEFT COPY ---------- */}
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="space-y-8 sm:space-y-10 text-center md:text-left"
      >
        <motion.h1
          variants={fadeUp()}
          className="
            text-4xl sm:text-5xl md:text-6xl lg:text-[5rem]
            font-semibold leading-tight
          "
        >
          <span className="block">
            <span className="
              bg-gradient-to-r from-teal-300 via-green-300 to-teal-200
              bg-clip-text text-transparent
            ">
              Smart&nbsp;Billing
            </span>
          </span>
          <span className="block mt-1 sm:mt-2">
            for&nbsp;all&nbsp;businesses
          </span>
        </motion.h1>

        <motion.p
          variants={fadeUp(0.15)}
          className="mx-auto md:mx-0 max-w-xl text-lg sm:text-xl text-gray-200/90"
        >
          Robo&nbsp;Books is a comprehensive platform for billing, tax‑management &amp; invoicing—delivering seamless automation for startups, freelancers and enterprises alike.
        </motion.p>

        <motion.div variants={fadeUp(0.3)}>
          <Link
            href="#get-started"
            className="
              inline-block rounded-full px-8 sm:px-10 py-3 sm:py-4
              text-base sm:text-lg font-semibold
              bg-gradient-to-br from-green-400 via-blue-500 to-purple-600
              hover:from-purple-600 hover:to-green-400
              transition-all duration-300 shadow-lg
            "
          >
            Get Started
          </Link>
        </motion.div>
      </motion.div>

      {/* ---------- RIGHT IMAGE ---------- */}
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9 }}
        viewport={{ once: true }}
        className="flex justify-center md:justify-end pt-6 sm:pt-8 md:pt-12"
      >
        <div
          className="
            relative w-48 sm:w-64 md:w-72 lg:w-96
            aspect-[3/4]
            overflow-hidden rounded-full shadow-2xl
          "
        >
          <Image
            src="/images/homehero.jpg" /* update path as needed */
            alt="Robo Books Robot"
            fill
            className="object-cover hover:scale-105 transition-transform duration-700 ease-out"
            priority
          />
        </div>
      </motion.div>
    </div>
  </section>
);

export default Hero;
