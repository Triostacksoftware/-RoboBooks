"use client";

import React from "react";
import { useRouter } from "next/navigation";
import PayrollOverview from "./components/PayrollOverview";
import AdvantagesSection from "./components/AdvantagesSection";
import FeaturesSection from "./components/FeaturesSection";

export default function PayrollPage() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
            >
              < Back to Dashboard
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Payroll</h1>
              <p className="text-sm text-gray-600">Manage employee payroll and benefits</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-full px-4 sm:px-6 lg:px-8 py-8">
        <PayrollOverview />
        <AdvantagesSection />
        <FeaturesSection />
      </div>
    </div>
  );
}
