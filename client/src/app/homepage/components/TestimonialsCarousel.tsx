'use client';

import React, { useState } from 'react';

const testimonials = [
  {
    name: "Rajesh Kumar",
    role: "CEO, Tech Solutions",
    content: "RoboBooks has transformed our invoicing process. The GST compliance features are excellent and save us hours every month.",
    image: "/images/testimonial1.jpg"
  },
  {
    name: "Priya Sharma",
    role: "Founder, Digital Marketing",
    content: "The user interface is intuitive and the customer support is outstanding. Highly recommended for small businesses.",
    image: "/images/testimonial2.jpg"
  },
  {
    name: "Amit Patel",
    role: "Accountant, Retail Store",
    content: "Finally, an accounting software that understands Indian business needs. The automatic tax calculations are a lifesaver.",
    image: "/images/testimonial3.jpg"
  }
];

export default function TestimonialsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="relative isolate overflow-hidden bg-white py-20 lg:py-32">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-6">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
              What Our Customers Say
            </span>
          </h2>
          <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Don't just take our word for it - hear from our satisfied customers
          </p>
        </div>

        <div className="relative">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 animate-fade-in">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full overflow-hidden">
                <img
                  src={testimonials[currentIndex].image}
                  alt={testimonials[currentIndex].name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <blockquote className="text-lg md:text-xl text-gray-700 mb-6 italic">
                "{testimonials[currentIndex].content}"
              </blockquote>
              
              <div className="mb-8">
                <div className="font-semibold text-gray-900">
                  {testimonials[currentIndex].name}
                </div>
                <div className="text-blue-600">
                  {testimonials[currentIndex].role}
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-center items-center gap-4">
              <button
                onClick={prevTestimonial}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              
              <button
                onClick={nextTestimonial}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
