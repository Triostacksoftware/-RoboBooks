import React from 'react';

export default function PayrollOverview() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Simplify payroll accounting with Robo Books
          </h1>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Unleash the power of synergy by effortlessly syncing your payroll data with Robo Books to supercharge your financial processes. Integrate with Robo Payroll now and embrace streamlined accounting for all your payroll needs.
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200">
            Try Payroll
          </button>
        </div>
        
        <div className="flex justify-center">
          <div className="w-full max-w-md bg-blue-50 border-2 border-blue-200 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Setup and Overview of Robo Payroll
            </h3>
            <p className="text-sm text-gray-600">
              Watch our comprehensive guide to get started
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 