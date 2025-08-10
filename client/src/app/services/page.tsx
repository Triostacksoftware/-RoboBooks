'use client'

import React from 'react'
import Navbar from '../homepage/components/Navbar'
import Footer from '../homepage/components/Footer'
import ServicesSection from '../homepage/components/ServicesSection'
import { 
  SparklesIcon, 
  ArrowRightIcon, 
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  BanknotesIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline'

const ServicesPage = () => {
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
    <>
      <Navbar />

      {/* Clean Hero Section - Focused on Services */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Subtle Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-100/30 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-100/30 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-2000"></div>
        </div>

        {/* Minimal Floating Elements */}
        <div className="absolute inset-0">
          <div
            className="absolute top-20 left-10 w-3 h-3 bg-blue-500/40 rounded-full animate-bounce"
          />
          <div
            className="absolute top-40 right-20 w-2 h-2 bg-purple-500/40 rounded-full animate-pulse"
          />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-6 py-24">
          <div className="text-center">
            {/* Simple Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500 to-blue-600 text-white text-sm font-medium mb-8 animate-fade-in"
            >
              <CheckCircleIcon className="w-4 h-4" />
              <span>Business Solutions</span>
            </div>

            {/* Clean Heading */}
            <h1
              className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6 animate-fade-in"
            >
              <span className="bg-gradient-to-r from-slate-900 via-blue-800 to-green-600 bg-clip-text text-transparent">
                Our Services
              </span>
            </h1>

            {/* Simple Subtitle */}
            <p
              className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed animate-fade-in"
            >
              End-to-end accounting modules built for Indian businesses—fast, compliant and delightful.
            </p>

            {/* Clean CTA */}
            <div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-fade-in"
            >
              <button className="group relative px-8 py-4 bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                <span className="flex items-center gap-2">
                  Start Free Trial
                  <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
              <button className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-full hover:border-green-500 hover:text-green-600 transition-all duration-300">
                Schedule Demo
              </button>
            </div>

            {/* Stats Section */}
            <div
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto animate-fade-in"
            >
              {[
                { number: "7+", label: "Core Services" },
                { number: "500+", label: "Active Users" },
                { number: "99.9%", label: "Uptime" },
                { number: "24/7", label: "Support" }
              ].map((stat, index) => (
                <div
                  key={stat.label}
                  className="text-center animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    {stat.number}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Original Services Section */}
      <ServicesSection />
      <Footer />
    </>
  )
}

export default ServicesPage
