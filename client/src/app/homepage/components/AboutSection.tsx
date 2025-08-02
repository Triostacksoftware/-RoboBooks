'use client';

import { motion, useInView, useAnimation } from 'framer-motion';
import { useEffect, useRef } from 'react';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

export default function AboutCreative() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-20% 0px' });
  const ctrls = useAnimation();
  useEffect(() => {
    if (inView) ctrls.start('show');
  }, [inView, ctrls]);

  return (
    <section
      ref={ref}
      id="about"
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
        {/* -------- Illustration card (Video) -------- */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 320 }}
          className="flex justify-center lg:justify-start"
        >
          <div
            className="
              relative w-full max-w-xs sm:max-w-sm md:max-w-md xl:max-w-md
              rounded-xl ring-4 ring-transparent bg-white/20 overflow-hidden
              aspect-[3/4] lg:aspect-auto lg:h-full
            "
          >
            <video
              src="/images/aboutsection.mp4"
              className="absolute inset-0 w-full h-full object-cover rounded-xl"
              autoPlay
              loop
              muted
              playsInline
            />
          </div>
        </motion.div>

        {/* -------- Text block -------- */}
        <motion.div
          variants={container}
          initial="hidden"
          animate={ctrls}
          className="space-y-8 text-center lg:text-left"
        >
          <motion.p
            variants={fadeUp}
            className="uppercase tracking-[.25em] text-blue-600 font-semibold"
          >
            About Robo Books
          </motion.p>

          <motion.h2
            variants={fadeUp}
            className="
              text-3xl sm:text-4xl md:text-5xl font-bold leading-tight
              bg-gradient-to-r from-blue-600 via-cyan-500 to-green-500
              bg-clip-text text-transparent
            "
          >
            Reliable &amp; Effort-less<br />
            Billing Solutions
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="mx-auto lg:mx-0 max-w-xl text-gray-700 text-lg"
          >
            We turn complex invoicing into a breeze. Delightful UI, AI-powered
            automation and bank-grade security—so you can focus on growth while
            Robo Books handles the numbers.
          </motion.p>

          <motion.ul variants={fadeUp} className="space-y-4">
            {[
              'One-click invoice creation',
              'Real-time payment reminders',
              'Seamless GST & tax reports',
              'Military-grade data security',
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
          </motion.ul>
        </motion.div>
      </div>
    </section>
  );
}
