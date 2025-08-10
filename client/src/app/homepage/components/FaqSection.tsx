'use client';

import React, { useState } from 'react';

const faqs = [
  {
    question: "What is RoboBooks?",
    answer: "RoboBooks is a comprehensive accounting software designed specifically for Indian businesses. It helps you manage invoicing, GST compliance, banking, and more."
  },
  {
    question: "Is it GST compliant?",
    answer: "Yes, RoboBooks is fully GST compliant with automatic tax calculations for CGST, SGST, and IGST based on your business location."
  },
  {
    question: "Can I try before buying?",
    answer: "Absolutely! We offer a free trial so you can explore all features before making a decision."
  },
  {
    question: "Is my data secure?",
    answer: "Yes, we use bank-grade security measures to protect your data. All information is encrypted and stored securely."
  }
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative isolate overflow-hidden bg-gray-50 py-20 lg:py-32">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-6">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
              Frequently Asked Questions
            </span>
          </h2>
          <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Everything you need to know about RoboBooks
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
              >
                <span className="text-lg font-semibold text-gray-900">
                  {faq.question}
                </span>
                <span className="text-blue-600 text-xl">
                  {openIndex === index ? '−' : '+'}
                </span>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4">
                  <p className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
