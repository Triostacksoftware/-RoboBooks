'use client';

import { motion } from 'framer-motion';
import {
  ClipboardDocumentCheckIcon,
  BuildingStorefrontIcon,
  DocumentDuplicateIcon,
  WalletIcon,
  UsersIcon,
  ChartBarSquareIcon,
  DocumentArrowUpIcon,
  ShieldCheckIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';

/* ---------------- FEATURES DATA ---------------- */
const FEATURES = [
  { icon: BuildingStorefrontIcon,  title: 'Vendor & Suppliers',  desc: 'Manage suppliers & contacts seamlessly.' },
  { icon: ClipboardDocumentCheckIcon, title: 'Items',           desc: 'Catalogue products with prices & tax.' },
  { icon: DocumentDuplicateIcon,   title: 'Purchase Orders',     desc: 'PO → bill in one click.' },
  { icon: WalletIcon,              title: 'Purchase Bill Entry', desc: 'Log vendor invoices instantly.' },
  { icon: UsersIcon,               title: 'Clients / Customers', desc: 'Store GSTIN & contact data.' },
  { icon: ChartBarSquareIcon,      title: 'Quotation Builder',   desc: 'Quotes that convert themselves.' },
  { icon: DocumentArrowUpIcon,     title: 'E-Invoice & E-Way',   desc: 'Create compliant e-invoices.' },
  { icon: ShieldCheckIcon,         title: 'GST/VAT Invoice',     desc: 'Issue global tax invoices.' }, // ← 8th card
  { icon: TruckIcon,               title: 'Delivery Challan',    desc: 'Smart, custom challans.' },
];

/* ---------------- MOTION VARIANTS ---------------- */
const wrapV = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const cardV = {
  hidden: { opacity: 0, y: 40 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: ['easeOut'] } },
};

export default function FeaturesSection() {
  return (
    <section className="relative isolate overflow-hidden py-10 lg:py-14">
      {/* background tint */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-[#f0f8ff] to-white" />

      {/* heading */}
      <h2 className="mb-20 text-center text-4xl sm:text-5xl font-bold">
        <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
          Our&nbsp;Features
        </span>
      </h2>

      {/* grid */}
      <motion.ul
        variants={wrapV}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.25 }}
        className="mx-auto grid max-w-6xl gap-12 px-6
                   grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      >
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <motion.li
            key={title}
            variants={cardV}
            whileHover={{ y: -6 }}
            className="group relative flex flex-col items-center text-center
                       rounded-3xl p-8 transition-transform"
          >
            {/* hover box effect */}
            <div className="absolute inset-0 -z-10 rounded-3xl
                            bg-transparent border border-transparent
                            transition-all duration-300
                            group-hover:bg-white/70 group-hover:backdrop-blur-md
                            group-hover:border-cyan-500/60 group-hover:shadow-xl" />

            {/* icon chip */}
            <div className="flex h-16 w-16 items-center justify-center
                            rounded-2xl bg-blue-50 text-blue-600 shadow-inner
                            transition-transform group-hover:scale-110">
              <Icon className="h-8 w-8" />
            </div>

            <h3 className="mt-6 text-lg font-semibold group-hover:text-blue-600 transition-colors">
              {title}
            </h3>
            <p className="mt-3 text-gray-600 leading-relaxed text-sm md:text-base">
              {desc}
            </p>
          </motion.li>
        ))}
      </motion.ul>
    </section>
  );
}
