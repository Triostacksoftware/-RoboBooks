/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

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
  SparklesIcon,
} from "@heroicons/react/24/outline";

/* ---------------- FEATURES DATA ---------------- */
const FEATURES = [
  {
    icon: BuildingStorefrontIcon,
    title: "Vendor & Suppliers",
    desc: "Manage suppliers & contacts seamlessly.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: ClipboardDocumentCheckIcon,
    title: "Items",
    desc: "Catalogue products with prices & tax.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: DocumentDuplicateIcon,
    title: "Purchase Orders",
    desc: "PO → bill in one click.",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    icon: WalletIcon,
    title: "Purchase Bill Entry",
    desc: "Log vendor invoices instantly.",
    gradient: "from-orange-500 to-red-500",
  },
  {
    icon: UsersIcon,
    title: "Clients / Customers",
    desc: "Store GSTIN & contact data.",
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    icon: ChartBarSquareIcon,
    title: "Quotation Builder",
    desc: "Quotes that convert themselves.",
    gradient: "from-teal-500 to-blue-500",
  },
  {
    icon: DocumentArrowUpIcon,
    title: "E-Invoice & E-Way",
    desc: "Create compliant e-invoices.",
    gradient: "from-yellow-500 to-orange-500",
  },
  {
    icon: ShieldCheckIcon,
    title: "GST/VAT Invoice",
    desc: "Issue global tax invoices.",
    gradient: "from-red-500 to-pink-500",
  },
  {
    icon: TruckIcon,
    title: "Delivery Challan",
    desc: "Smart, custom challans.",
    gradient: "from-emerald-500 to-green-500",
  },
];

export default function FeaturesSection() {
  return (
    <section className="relative isolate overflow-hidden py-20 lg:py-32 bg-gradient-to-b from-white via-blue-50/30 to-white">
      {/* Background decorative elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="mx-auto max-w-7xl px-6">
        {/* Enhanced heading */}
        <div className="text-center mb-20 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium mb-6 animate-fade-in">
            <SparklesIcon className="w-4 h-4" />
            <span>Comprehensive Features</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
              Everything You Need
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Powerful capabilities to create invoices, manage purchases, track customers and stay GST compliant—fast.
          </p>
        </div>

        {/* Enhanced grid */}
        <ul className="grid max-w-7xl gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, desc, gradient }, index) => (
            <li
              key={title}
              className="group relative animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Card */}
              <div className="relative h-full p-8 bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 hover:border-blue-300/50 hover:shadow-2xl transition-all duration-500 overflow-hidden hover:-translate-y-2">
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                
                {/* Icon container */}
                <div className="relative z-10">
                  <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl`}>
                    <Icon className="h-8 w-8" />
                  </div>

                  <h3 className="mt-6 text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                    {title}
                  </h3>
                  
                  <p className="mt-4 text-gray-600 leading-relaxed">
                    {desc}
                  </p>

                  {/* Hover effect indicator */}
                  <div className="mt-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium text-blue-600">Learn more</span>
                  </div>
                </div>

                {/* Decorative corner element */}
                <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-bl-3xl`} />
              </div>
            </li>
          ))}
        </ul>

        {/* Bottom CTA */}
        <div className="text-center mt-20 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105">
            <span>Explore All Features</span>
            <SparklesIcon className="w-4 h-4" />
          </div>
        </div>
      </div>
    </section>
  );
}
