'use client';

import React from 'react';

export default function TeamManagement() {
  return (
    <section className="relative isolate overflow-hidden bg-white py-20 lg:py-32">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
              Team Management
            </span>
          </h2>
          <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Manage your team efficiently with our comprehensive team management tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "Role Management",
              description: "Assign roles and permissions to team members",
              icon: "👥"
            },
            {
              title: "Task Assignment",
              description: "Assign and track tasks across your team",
              icon: "📋"
            },
            {
              title: "Performance Tracking",
              description: "Monitor team performance and productivity",
              icon: "📊"
            }
          ].map((feature, index) => (
            <div
              key={feature.title}
              className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 hover:border-blue-200 transition-all duration-300 hover:scale-105 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
