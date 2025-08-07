import React from 'react';
import PayrollOverview from './components/PayrollOverview';
import AdvantagesSection from './components/AdvantagesSection';
import FeaturesSection from './components/FeaturesSection';

export default function PayrollPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PayrollOverview />
        <AdvantagesSection />
        <FeaturesSection />
      </div>
    </div>
  );
} 