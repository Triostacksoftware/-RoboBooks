/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import {
  BanknotesIcon,
  ClipboardDocumentListIcon,
  ChartPieIcon,
  ShieldCheckIcon,
  TruckIcon,
  UsersIcon,
  BuildingStorefrontIcon,
} from "@heroicons/react/24/outline";

type Service = {
  icon: (props: any) => JSX.Element;
  title: string;
  desc: string;
};

const SERVICES: Service[] = [
  {
    icon: ClipboardDocumentListIcon,
    title: "GST Invoicing",
    desc: "Create GST-compliant invoices with auto tax split (CGST/SGST/IGST).",
  },
  {
    icon: BanknotesIcon,
    title: "Banking & Reconciliation",
    desc: "Import statements and reconcile transactions in minutes.",
  },
  {
    icon: BuildingStorefrontIcon,
    title: "Inventory Management",
    desc: "Track stock, batches and item pricing effortlessly.",
  },
  {
    icon: UsersIcon,
    title: "Customer & Vendor CRM",
    desc: "Centralize contacts, GSTINs and outstanding balances.",
  },
  {
    icon: TruckIcon,
    title: "Delivery Challans",
    desc: "Generate smart, custom challans in one click.",
  },
  {
    icon: ChartPieIcon,
    title: "Reports & Analytics",
    desc: "P&L, tax reports and real‑time insights for faster decisions.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Compliance & Security",
    desc: "Bank‑grade security with audit logs and role-based access.",
  },
];

export default function ServicesSection() {
  const handleAvailNow = (serviceTitle: string) => {
    // Check if user is logged in (you can implement your own auth check)
    const isLoggedIn = false; // Replace with your actual auth check
    
    if (isLoggedIn) {
      // Redirect to service-specific page (you'll add this later)
      console.log(`Redirecting to ${serviceTitle} service`);
      // window.location.href = `/dashboard/${serviceTitle.toLowerCase().replace(/\s+/g, '-')}`;
    } else {
      // Redirect to register page
      window.location.href = '/register';
    }
  };

  return (
    <section className="relative isolate overflow-hidden py-20 lg:py-32 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
              Complete Service Suite
            </span>
          </h2>
          <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            End-to-end accounting modules built for Indian businesses—fast, compliant and delightful.
          </p>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {SERVICES.map(({ icon: Icon, title, desc }, index) => (
            <li
              key={title}
              className="group relative rounded-3xl border border-gray-200/50 p-8 shadow-sm transition-all duration-300 hover:border-blue-300/50 hover:shadow-xl bg-white/80 backdrop-blur-sm hover:bg-white/90 hover:-translate-y-2 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start gap-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white group-hover:scale-110 transition-transform duration-300">
                  <Icon className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-3">
                    {title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {desc}
                  </p>
                  
                  {/* Avail Now Button - Enhanced styling */}
                  <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <button
                      onClick={() => handleAvailNow(title)}
                      className="inline-flex items-center gap-2 text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 active:scale-95"
                    >
                      Avail Now
                      <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Decorative corner element */}
              <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </li>
          ))}
        </ul>

        {/* Enhanced CTA Section */}
        <div className="mt-20 text-center animate-fade-in">
          <div className="rounded-3xl bg-gradient-to-r from-blue-600/10 to-purple-600/10 backdrop-blur-sm p-8 sm:p-12 border border-white/20">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Ready to transform your business?
            </h3>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of businesses that trust RoboBooks for their accounting needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/register"
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                <span>Start free trial</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/contact"
                className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-full hover:border-blue-500 hover:text-blue-600 transition-all duration-300"
              >
                Schedule Demo
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


