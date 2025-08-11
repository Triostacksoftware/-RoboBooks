'use client';

import { BanknotesIcon, PlusIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';

interface PaymentsReceivedEmptyProps {
  onNewPayment: () => void;
}

export default function PaymentsReceivedEmpty({ onNewPayment }: PaymentsReceivedEmptyProps) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Main Content */}
      <div className="text-center mb-16">
        {/* Icon */}
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-full flex items-center justify-center mb-6">
          <BanknotesIcon className="w-10 h-10 text-blue-600" />
        </div>
        
        {/* Title and Description */}
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          No payments received yet
        </h2>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Start tracking your customer payments by creating your first payment record or importing existing payments.
        </p>
        
        {/* Action Buttons */}
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={onNewPayment}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Create Payment
          </button>
          <button className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
            <ArrowUpTrayIcon className="w-5 h-5 mr-2" />
            Import Payments
          </button>
        </div>
      </div>

      {/* Life Cycle Diagram */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
          Life cycle of a Customer Payment
        </h3>
        
        <div className="space-y-6">
          {/* First Row - Request Stages */}
          <div className="flex justify-center space-x-8">
            {['INITIAL REQUEST', 'REMINDER 1', 'REMINDER 2', 'REMINDER N'].map((stage, index) => (
              <div key={index} className="text-center">
                <div className="w-32 h-12 bg-blue-50 border-2 border-blue-200 rounded-lg flex items-center justify-center mb-2">
                  <span className="text-sm font-medium text-blue-800 text-center leading-tight px-2">
                    {stage}
                  </span>
                </div>
                <div className="w-0.5 h-8 bg-blue-200 mx-auto"></div>
              </div>
            ))}
          </div>
          
          {/* Payment Methods Row */}
          <div className="flex justify-center space-x-6">
            {[
              { name: 'PAYPAL', icon: '💳', color: 'bg-blue-50 border-blue-200' },
              { name: 'CREDIT CARD', icon: '💳', color: 'bg-green-50 border-green-200' },
              { name: 'BANK', icon: '🏦', color: 'bg-purple-50 border-purple-200' },
              { name: 'MANUAL / OFFLINE', icon: '🪙', color: 'bg-orange-50 border-orange-200' }
            ].map((method, index) => (
              <div key={index} className="text-center">
                <div className={`w-28 h-16 ${method.color} border-2 rounded-xl flex flex-col items-center justify-center mb-2 shadow-sm`}>
                  <span className="text-2xl mb-1">{method.icon}</span>
                  <span className="text-xs font-medium text-gray-700 text-center leading-tight px-1">
                    {method.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          {/* Client Portal Text */}
          <div className="text-center">
            <div className="inline-block px-6 py-2 bg-gray-100 rounded-full">
              <span className="text-sm font-medium text-gray-700">
                PAID THROUGH CLIENT PORTAL
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Features List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          In the Payments Received module, you can:
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              title: "Automatically charge your customer's card for recurring invoices",
              description: "Set up automatic payments for subscription-based services"
            },
            {
              title: "Configure payment gateways to receive online payments",
              description: "Integrate with PayPal, Stripe, and other payment processors",
              link: "Learn More"
            },
            {
              title: "Record payments manually",
              description: "Enter cash, check, or bank transfer payments manually"
            },
            {
              title: "Send payment receipts to your customers",
              description: "Automatically generate and email payment confirmations"
            }
          ].map((feature, index) => (
            <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-gray-900 font-medium mb-1">{feature.title}</p>
                <p className="text-gray-600 text-sm">{feature.description}</p>
                {feature.link && (
                  <a href="#" className="inline-block text-blue-600 hover:text-blue-700 text-sm font-medium mt-2">
                    {feature.link} →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
