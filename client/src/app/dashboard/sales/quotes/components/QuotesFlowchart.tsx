"use client";
import React from 'react';
import { CheckIcon, XMarkIcon, DocumentDuplicateIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

const Connector = () => (
  <div className="flex items-center">
    <div className="w-8 md:w-10 h-0.5 bg-gray-300"></div>
  </div>
);

const Box: React.FC<{ title: string; icon?: React.ReactNode; className?: string }> = ({ title, icon, className }) => (
  <div className={`flex flex-col items-center ${className || ''}`}>
    <div className="w-20 h-12 md:w-24 md:h-14 bg-white border border-gray-200 rounded-md shadow-sm flex items-center justify-center">
      <div className="flex items-center gap-2 text-gray-700">
        {icon}
        <span className="text-xs md:text-sm font-medium">{title}</span>
      </div>
    </div>
  </div>
);

export default function QuotesFlowchart() {
  return (
    <section className="mt-12">
      <h2 className="text-xl font-semibold text-gray-900 text-center mb-6">
        Life cycle of a Quote
      </h2>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col items-center gap-8">
          {/* Main horizontal flow */}
          <div className="flex flex-wrap justify-center items-center">
            <Box title="QUOTE" icon={<DocumentDuplicateIcon className="h-5 w-5" />} />
            <Connector />
            <Box title="SENT TO CUSTOMER" icon={<EnvelopeIcon className="h-5 w-5 text-blue-600" />} />
            <Connector />
            <Box title="ACCEPT" icon={<CheckIcon className="h-5 w-5 text-green-600" />} />
            <Connector />
            <Box title="INVOICE" />
          </div>

          {/* Reject branch from Sent to Customer */}
          <div className="relative w-full max-w-3xl">
            <div className="absolute left-1/2 -translate-x-1/2 -top-6 md:-top-8 rotate-90 w-10 h-0.5 bg-gray-300"></div>
            <div className="flex justify-center">
              <Box title="REJECT" icon={<XMarkIcon className="h-5 w-5 text-red-600" />} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


