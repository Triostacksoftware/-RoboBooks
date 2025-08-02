'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline';

/* ---------------- questions ---------------- */
const FAQ = [
  {
    q: 'What is this Robo Books?',
    a: 'Our billing software helps businesses generate invoices, track payments and manage GST compliance effortlessly.',
  },
  {
    q: 'Does it support GST calculations?',
    a: 'Yes — choose IGST, CGST/SGST automatically based on customer state and item HSN/SAC.',
  },
  {
    q: 'Can I generate professional invoices?',
    a: 'Pick from multiple invoice themes, add your logo & custom fields, then share as PDF or mail directly.',
  },
  {
    q: 'How can I accept online payments?',
    a: 'Integrate Razorpay, Stripe or UPI QR so your clients pay instantly (auto-reconcile receipts).',
  },
  {
    q: 'Is my data secure?',
    a: 'We use 256-bit encryption, daily backups and ISO-certified servers. You own your data.',
  },
  {
    q: 'How long can I use the free plan?',
    a: 'The free tier is lifetime for up to 100 invoices / year. Upgrade anytime for unlimited usage.',
  },
];

/* ---------------- animation variants ---------------- */
const itemVar = {
  open: { height: 'auto', opacity: 1, marginTop: 12 },
  closed: { height: 0, opacity: 0, marginTop: 0 },
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1 },
  }),
};

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="relative isolate overflow-hidden bg-white py-16 lg:py-24"
    >
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="mx-auto grid max-w-7xl gap-4 px-6 sm:px-10 lg:grid-cols-2"
      >
        {/* ---------------- LEFT ---------------- */}
        <motion.div variants={fadeUp} custom={0}>
          <p className="uppercase tracking-[.25em] text-blue-600 font-semibold">
            Questions & Answers
          </p>

          <h2 className="mt-6 text-[2.5rem] sm:text-[3rem] font-bold leading-tight">
            Frequently{' '}
            <span className="inline-block rounded-lg bg-gradient-to-r from-green-400 to-blue-500 px-3 py-1 text-white">
              asked
            </span>{' '}
            <br /> Questions
          </h2>

          <p className="mt-10 text-xl font-semibold">Don’t get answer?</p>
          <p className="mt-2 text-gray-600">
            We will answer you in less than{' '}
            <span className="font-semibold">2 Hours</span>!!
          </p>

          <a
            href="#contact"
            className="mt-6 inline-flex items-center gap-2 text-blue-600 font-medium group"
          >
            Leave us a Message
            <svg
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6 6 6-6 6" />
            </svg>
          </a>

          <ChatBubbleBottomCenterTextIcon className="mt-14 h-16 w-16 text-teal-500" />
        </motion.div>

        {/* ---------------- RIGHT: Accordion ---------------- */}
        <motion.div className="space-y-6">
          {FAQ.map(({ q, a }, i) => {
            const isOpen = open === i;

            return (
              <motion.div
                key={q}
                custom={i + 1}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className={`
                  rounded-3xl border px-6 py-5 transition-all duration-300 ease-in-out shadow-sm
                  ${isOpen
                    ? 'bg-white ring-1 ring-cyan-500/60 shadow-lg'
                    : 'hover:ring-1 hover:ring-gray-200'}
                `}
              >
                {/* header */}
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 text-left transition-colors duration-200 group"
                >
                  <span className="font-medium text-lg text-gray-800 group-hover:text-blue-600">
                    {q}
                  </span>
                  <motion.svg
                    animate={{ rotate: isOpen ? 45 : 0, scale: isOpen ? 1.2 : 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className={`h-5 w-5 text-cyan-500 group-hover:scale-110 transition-transform`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7H5" />
                  </motion.svg>
                </button>

                {/* animated body */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      variants={itemVar}
                      initial="closed"
                      animate="open"
                      exit="closed"
                      transition={{ duration: 0.35, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <p className="pt-4 pb-2 text-gray-600 leading-relaxed">{a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
    </section>
  );
}
