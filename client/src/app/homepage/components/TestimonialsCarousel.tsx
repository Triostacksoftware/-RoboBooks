'use client';

import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */
const TESTIMONIALS = [
  {
    img: '/images/testi1.jpg',
    name: 'Roe Smith',
    role: 'Director, Growth King',
    quote:
      'With this software, I can create professional invoices anytime, anywhere! 🌍📊 No more paperwork, no more stress. Smooth, hassle-free billing at my fingertips! 👌',
    color: 'from-pink-500 via-fuchsia-500 to-purple-500',
  },
  {
    img: '/images/testi2.jpg',
    name: 'Alex M.',
    role: 'Founder, BrandUp',
    quote:
      'Robo Books saves us 7+ hours weekly. Real-time GST calculations and instant e-invoices keep our accountants happy.',
    color: 'from-emerald-400 via-teal-500 to-cyan-500',
  },
  {
    img: '/images/testi3.jpg',
    name: 'Grace Lee',
    role: 'Finance Lead, PixelWave',
    quote:
      'We scaled from 50 to 500 invoices/month without adding head-count. UX is intuitive and reports are 🔥.',
    color: 'from-amber-400 via-orange-500 to-rose-500',
  },
  {
    img: '/images/testi4.jpg',
    name: 'Daniel K.',
    role: 'COO, Craftify',
    quote:
      'Payment reminders reduced our DSO by 35 %. Integration with Stripe took minutes.',
    color: 'from-sky-400 via-indigo-500 to-blue-600',
  },
  {
    img: '/images/testi5.jpg',
    name: 'Nora Garcia',
    role: 'CPA & Consultant',
    quote:
      'Finally, billing software that speaks tax. Clients love the dashboards; I love the compliance automation.',
    color: 'from-lime-400 via-green-500 to-emerald-500',
  },
] as const;

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */
export default function TestimonialsCarousel() {
  const [[index, direction], setIndex] = useState<[number, number]>([0, 0]);
  const timeout = useRef<NodeJS.Timeout | null>(null);
  const total = TESTIMONIALS.length;

  /* ---------- auto-rotate ---------- */
  useEffect(() => {
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => paginate(1), 5000);
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, [index]);

  function paginate(dir: 1 | -1) {
    setIndex([((index + dir + total) % total), dir]);
  }

  /* ---------- framer-motion variants ---------- */
  const slide = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  };

  const item = TESTIMONIALS[index];

  return (
    <section className="relative isolate mx-auto max-w-5xl px-6 py-24">
      {/* container card */}
      <div className="relative overflow-hidden rounded-[3rem] bg-[#222549] text-white lg:flex">
        {/* decorative swooshes */}
        <div
          className={`pointer-events-none absolute -left-40 top-0 h-[60%] w-[120%] rounded-full 
                      opacity-25 blur-3xl bg-gradient-to-tr ${item.color}`}
        />
        <div
          className={`pointer-events-none absolute -right-40 bottom-0 h-[60%] w-[120%] rounded-full 
                      opacity-25 blur-3xl bg-gradient-to-tr ${item.color}`}
        />

        {/* ---------- LEFT hero img ---------- */}
        <div className="relative mx-auto flex w-full max-w-[340px] items-center justify-center p-10">
          <AnimatePresence custom={direction}>
            <motion.div
              key={item.img}
              custom={direction}
              variants={slide}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: .6, ease: 'easeInOut' }}
              className="relative h-[280px] w-[280px] overflow-hidden rounded-[50%_50%_0_50%/50%_50%_50%_0]"
            >
              <Image
                src={item.img}
                alt={item.name}
                fill
                className="object-cover"
                sizes="280px"
                priority
              />
            </motion.div>
          </AnimatePresence>

          {/* index badge */}
          <span className="absolute top-6 right-6 rounded-full bg-teal-400 px-4 py-2 text-xl font-bold text-[#002627]">
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>

        {/* ---------- RIGHT copy ---------- */}
        <div className="relative flex-1 space-y-8 px-10 pb-14 pt-14">
          <p className="uppercase tracking-[.25em] text-cyan-500 font-semibold">Testimonials</p>

          <h3 className="text-3xl sm:text-4xl md:text-5xl font-extrabold">
            We <span className="text-pink-500">❤</span> Feedback
          </h3>

          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.p
              key={item.quote}
              custom={direction}
              variants={slide}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: .55, ease: 'easeInOut' }}
              className="text-lg leading-relaxed text-gray-100/90"
            >
              {item.quote}
            </motion.p>
          </AnimatePresence>

          <motion.p
            key={item.name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: .3 }}
            className="font-medium"
          >
            {item.name},{' '}
            <span className="text-gray-400">{item.role}</span>
          </motion.p>

          {/* nav / counter */}
          <div className="absolute bottom-6 right-8 flex items-center gap-6 text-sm">
            <button
              onClick={() => paginate(-1)}
              aria-label="Previous"
              className="rounded-full p-1 text-white/70 hover:text-white transition-colors"
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </button>
            <span className="w-12 text-center text-white/70">
              {index + 1} / {total}
            </span>
            <button
              onClick={() => paginate(1)}
              aria-label="Next"
              className="rounded-full p-1 text-white/70 hover:text-white transition-colors"
            >
              <ChevronRightIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
