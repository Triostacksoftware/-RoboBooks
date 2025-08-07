import React from 'react';

export default function DocumentFeatures() {
  const features = [
    {
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      ),
      title: "Easy Upload",
      description: "Drag and drop or click to upload documents in various formats including PDF, DOC, XLS, and images."
    },
    {
      icon: (
        <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      ),
      title: "Smart Organization",
      description: "Automatically categorize documents and create custom folders for better organization."
    },
    {
      icon: (
        <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
        </svg>
      ),
      title: "Quick Search",
      description: "Find any document instantly with powerful search functionality and advanced filters."
    },
    {
      icon: (
        <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
      ),
      title: "Secure Storage",
      description: "Bank-level encryption ensures your documents are protected and accessible only to authorized users."
    },
    {
      icon: (
        <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Version Control",
      description: "Track document versions and maintain a complete history of changes and updates."
    },
    {
      icon: (
        <svg className="w-8 h-8 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
        </svg>
      ),
      title: "Team Collaboration",
      description: "Share documents with team members and control access permissions for better collaboration."
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Powerful Features
        </h2>
        <p className="text-lg text-gray-600">
          Everything you need to manage your documents effectively
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 mx-auto">
              {feature.icon}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">
              {feature.title}
            </h3>
            <p className="text-gray-600 text-center leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
} 