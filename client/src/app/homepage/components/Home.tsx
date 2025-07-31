'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

const Hero = () => {
  /* simple variants */
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    show:   { opacity: 1, y: 0, transition: { duration: .8 } }
  };

  return (
    <section
      id="hero"
      className="relative overflow-hidden isolate bg-[#1E2048] text-white
                 min-h-[120vh] flex items-center"
    >
      {/* background pattern (thin lines) */}
      <div className="absolute inset-0 -z-10 bg-[url('/pattern.svg')] opacity-30" />

      {/* pink/yellow swoosh (top-left) */}
      <div className="absolute -z-10 top-[-15rem] -left-[25rem] h-[40rem] w-[55rem]
                      rounded-full bg-gradient-to-tr from-yellow-400 to-pink-500
                      blur-3xl opacity-20" />

      {/* cyan/magenta arc (bottom-right) */}
      <div className="absolute -z-10 bottom-[-20rem] right-[-35rem] h-[48rem] w-[60rem]
                      rounded-b-full bg-gradient-to-tr from-cyan-400 via-purple-600 to-pink-500
                      rotate-12 blur-2xl opacity-25" />

      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
        {/* --- LEFT COPY --- */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="space-y-8"
        >
          <motion.h1
            variants={fadeUp}
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight"
          >
            Smart{' '}
            <span className="relative inline-block">
              <span className="relative z-10 px-2 py-1 bg-pink-500 rounded-lg">
                Billing
              </span>
              {/* cute little spark */}
              <span className="absolute -top-4 -right-4 h-6 w-6 rotate-45">
                <span className="absolute inset-0 bg-white rounded-full opacity-80" />
              </span>
            </span>{' '}
            <br />
            for All Businesses!
          </motion.h1>

          <motion.p
            variants={fadeUp}
            transition={{ delay: .1 }}
            className="text-lg md:text-xl text-gray-200 max-w-xl"
          >
            Robo Books is a comprehensive platform for billing, tax-management and
            invoicing, offering seamless solutions for businesses and individuals.
          </motion.p>

          <motion.div variants={fadeUp} transition={{ delay: .2 }}>
            <Link
              href="#get-started"
              className="inline-block rounded-full px-10 py-4 text-lg font-semibold
                         bg-gradient-to-r from-green-400 to-blue-500
                         hover:from-blue-500 hover:to-green-400 hover:scale-105
                         transition-transform shadow-lg"
            >
              Get Start Your Journey
            </Link>
          </motion.div>
        </motion.div>

        {/* --- RIGHT IMAGE --- */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: .8 }}
          viewport={{ once: true }}
          className="relative"
        >
          {/* circular mask */}
          <div className="overflow-hidden rounded-[50%_50%_0_50%/50%_50%_50%_0]">
            <Image
              src="/robo-books.png"        /* place your robot image here */
              alt="Robo Books Robot"
              width={800}
              height={800}
              className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500"
              priority
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
