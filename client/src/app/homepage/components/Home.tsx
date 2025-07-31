'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 50 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.8, delay } },
});

const Hero = () => (
  <section
    id="hero"
    className="
      relative flex items-center
      min-h-[120vh] overflow-hidden
      px-6 md:px-10 text-white
      bg-gradient-to-br from-[#1b3075] via-[#302c80] to-[#11366c]
    "
  >
    {/* subtle pattern */}
    <div className="absolute inset-0 -z-10 bg-[url('/pattern.svg')] opacity-10" />

    <div className="mx-auto grid max-w-7xl gap-16 md:grid-cols-2 items-center">
      {/* ---------- LEFT COPY ---------- */}
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="space-y-10 pl-6 md:pl-12"
      >
        <motion.h1
          variants={fadeUp()}
          className="
            py-4 md:py-6
            text-4xl sm:text-5xl md:text-6xl lg:text-[5rem]
            font-bold leading-tight
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
          <span className="block mt-2">
            for&nbsp;all&nbsp;businesses
          </span>
        </motion.h1>

        <motion.p
          variants={fadeUp(0.15)}
          className="max-w-xl text-lg md:text-xl text-gray-200/90"
        >
          Robo Books is a comprehensive platform for billing, tax-management &
          invoicing—delivering seamless automation for startups, freelancers and
          enterprises alike.
        </motion.p>

        <motion.div variants={fadeUp(0.3)}>
          <Link
            href="#get-started"
            className="
              inline-block rounded-full px-10 py-4 text-lg font-semibold
              bg-gradient-to-br from-green-400 via-blue-500 to-purple-600
              hover:from-purple-600 hover:to-green-400
              transition-all duration-300 shadow-lg
            "
          >
            Get Started
          </Link>
        </motion.div>
      </motion.div>

      {/* ---------- RIGHT IMAGE (rounded-full + pushed down) ---------- */}
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9 }}
        viewport={{ once: true }}
        className="flex justify-center md:justify-end pt-8 md:pt-12" 
       
      >
        <div
          className="
            relative w-60 sm:w-72 md:w-80 lg:w-96
            aspect-[3/4]
            overflow-hidden rounded-full shadow-2xl
          "
        >
          <Image
            src="/images/homehero.jpg"        /* path as per your project */
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
