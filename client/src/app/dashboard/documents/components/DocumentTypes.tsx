import React from 'react';

export default function DocumentTypes() {
  const documentTypes = [
    {
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
      ),
      title: "Invoices & Receipts",
      description: "Store and organize all your invoices, receipts, and financial documents in one place."
    },
    {
      icon: (
        <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      ),
      title: "Contracts & Agreements",
      description: "Keep all your legal documents, contracts, and agreements organized and easily accessible."
    },
    {
      icon: (
        <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Certificates & Licenses",
      description: "Store business certificates, licenses, and compliance documents securely."
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Document Types
        </h2>
        <p className="text-lg text-gray-600">
          Organize different types of documents efficiently
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {documentTypes.map((type, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 mx-auto">
              {type.icon}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">
              {type.title}
            </h3>
            <p className="text-gray-600 text-center leading-relaxed">
              {type.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
} 