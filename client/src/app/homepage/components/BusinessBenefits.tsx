/* app/(marketing)/components/BusinessBenefits.tsx */
'use client';

import { FC, useEffect, useRef } from 'react';
import {
  BanknotesIcon,
  CalculatorIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import { motion, useAnimation, useInView } from 'framer-motion';

interface Feature {
  title: string;
  description: string;
  icon: FC<React.SVGProps<SVGSVGElement>>;
}

const features: Feature[] = [
  {
    title: 'Accurate GST Templates',
    description:
      'Use our GST templates for error-free invoices and compliance.',
    icon: BanknotesIcon,
  },
  {
    title: 'GST Rate Calculation',
    description: 'Automatic CGST & SGST/IGST calculations based on user input.',
    icon: CalculatorIcon,
  },
  {
    title: 'Access Your Business Anywhere',
    description: 'Cloud-based software lets you access documents securely.',
    icon: GlobeAltIcon,
  },
];

/* ---------- animation helpers ---------- */
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

export default function BusinessBenefits() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-15% 0px' });
  const ctrls = useAnimation();
  useEffect(() => {
    if (inView) ctrls.start('show');
  }, [inView, ctrls]);

  return (
    <section
      ref={ref}
      className="relative mx-auto max-w-6xl px-4 py-16 sm:px-8 lg:px-10"
    >
      {/* heading */}
      <motion.h2
        variants={fadeUp}
        initial="hidden"
        animate={ctrls}
        className="mb-10 bg-gradient-to-r from-blue-600 via-blue-500 to-green-500
                   bg-clip-text text-2xl font-medium leading-tight tracking-tight
                   text-transparent sm:text-3xl xl:text-4xl"
      >
        How&nbsp;Robo&nbsp;Books&nbsp;Online&nbsp;can&nbsp;improve&nbsp;your&nbsp;business
      </motion.h2>

      {/* content grid */}
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        {/* feature list */}
        <motion.ul
          variants={container}
          initial="hidden"
          animate={ctrls}
          className="space-y-10"
        >
          {features.map(({ title, description, icon: Icon }) => (
            <motion.li
              key={title}
              variants={fadeUp}
              whileHover={{ scale: 1.03 }}
              className="flex items-start space-x-5"
            >
              <motion.span
                whileHover={{ rotate: 8 }}
                className="flex h-12 w-12 flex-none items-center justify-center
                           rounded-full bg-gradient-to-br from-blue-50 to-green-50
                           ring-1 ring-inset ring-blue-200/30"
              >
                <Icon className="h-7 w-7 stroke-[1.8] text-blue-600" />
              </motion.span>

              <div>
                <h3 className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text
                               text-lg font-normal text-transparent sm:text-xl">
                  {title}
                </h3>
                <p className="mt-1 max-w-md text-sm text-gray-700">
                  {description}
                </p>
              </div>
            </motion.li>
          ))}
        </motion.ul>

        {/* video preview instead of image */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative mx-auto w-full max-w-lg"
        >
          <motion.div whileHover={{ scale: 1.04, rotate: -2 }}>
            <div className="rounded-xl shadow-lg overflow-hidden">
              <video
                src="/images/businessbenefits.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-300 h-70 rounded-xl object-cover"
              />
            </div>
          </motion.div>

          {/* Optional mobile overlay (commented out) */}
          {/* 
          <motion.div
            whileHover={{ scale: 1.08, rotate: 3 }}
            className="absolute bottom-6 right-6 hidden sm:block
                       lg:bottom-8 lg:right-8 xl:bottom-10 xl:right-10"
          >
            <Image
              src="/images/businessbenefits.png"
              alt="Mobile analytics"
              width={180}
              height={310}
              className="rounded-xl shadow-xl"
            />
          </motion.div> 
          */}
        </motion.div>
      </div>
    </section>
  );
}
