'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { SparklesIcon } from '@heroicons/react/24/solid';

/* ----------- helpers ----------- */
const fade = (d = 0) => ({
  hidden: { opacity: 0, y: 40 },
  show:   { opacity: 1, y: 0, transition: { duration: .7, delay: d } },P
});

export default function AboutSplit() {
  return (
    <section className="relative isolate overflow-hidden bg-white py-24 lg:py-32">
      {/* background blob */}
      <div className="absolute -z-10 top-[-6rem] left-[-10rem] h-[28rem] w-[28rem]
                      rounded-full bg-gradient-to-br from-teal-100 to-blue-100
                      blur-3xl opacity-40" />

      <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-2">
        {/* ------------- LEFT IMAGE ------------- */}
        <motion.div
          whileHover={{ scale: 1.05, rotate: -2 }}
          transition={{ type: 'spring', stiffness: 250 }}
          className="relative mx-auto max-w-[280px] sm:max-w-[320px] md:max-w-[360px]"
        >
          {/* arched mask */}
          <div className="overflow-hidden rounded-[50%_50%_0_50%/50%_50%_50%_0]">
            <Image
              src="/images/homehero.jpg"         /* change path accordingly */
              alt="Team collaborating"
              width={600}
              height={600}
              className="w-full h-auto object-cover"
              priority
            />
          </div>

          {/* animated sparkles */}
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
              transition={{ delay: .8 + i * .3, repeat: Infinity, duration: 3 }}
              className="absolute"
              style={{
                top: `${22 + i * 14}%`,
                left: `${60 + (i % 2) * 12}%`,
              }}
            >
              <SparklesIcon className="h-5 w-5 text-cyan-400" />
            </motion.div>
          ))}
        </motion.div>

        {/* ------------- RIGHT COPY ------------- */}
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} className="space-y-8">
          <motion.p variants={fade()} className="uppercase tracking-[.25em] text-blue-600 font-semibold">
            Powerful Alone
          </motion.p>

          <motion.h2 variants={fade(.1)}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight
                       bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
            Powerful alone,<br />
            unbeatable{' '}
            <span
              className="inline-block rounded-xl px-4 py-1 text-white
                         bg-gradient-to-r from-teal-500 to-blue-600">
              marketing
            </span>
          </motion.h2>

          <motion.p variants={fade(.2)} className="max-w-xl text-lg text-gray-700">
            We use filler text for layouts; non-readability is of great importance—those who
            don’t pursue pleasure rationally face painful consequences.
          </motion.p>

          <ul className="space-y-4 pt-4">
            {['Share multiple screens at a time', 'High quality screen'].map((t, i) => (
              <motion.li
                key={t}
                variants={fade(.3 + i*0.1)}
                className="flex gap-3 items-start group"
              >
                <svg className="mt-[2px] h-4 w-4 text-teal-500 group-hover:text-blue-600 transition-colors"
                     fill="currentColor" viewBox="0 0 16 16">
                  <path d="M6.003 10.803 3.2 8l-1.2 1.2 4.002 4L14 5.202 12.8 4l-6.797 6.803Z" />
                </svg>
                <span className="text-gray-700 group-hover:text-blue-600 transition-colors">{t}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
