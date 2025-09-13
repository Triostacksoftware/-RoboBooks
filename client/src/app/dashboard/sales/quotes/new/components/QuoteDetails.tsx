"use client";

import React from "react";

interface QuoteDetailsProps {
  formData: {
    quoteNumber: string;
    referenceNumber: string;
    quoteDate: string;
    validUntil: string;
    terms: string;
    salesperson: string;
    subject: string;
    project: string;
  };
  onFormDataChange: (data: Partial<{
    quoteNumber: string;
    referenceNumber: string;
    quoteDate: string;
    validUntil: string;
    terms: string;
    salesperson: string;
    subject: string;
    project: string;
  }>) => void;
}

const QuoteDetails: React.FC<QuoteDetailsProps> = ({
  formData,
  onFormDataChange,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
      <h2 className="text-sm font-semibold text-gray-900 mb-3">
        Quote Details
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Quote Number
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.quoteNumber}
              onChange={(e) =>
                onFormDataChange({ quoteNumber: e.target.value })
              }
              className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <button
              type="button"
              onClick={() => {
                // This will be handled by the parent component
                if (window.refreshQuoteNumber) {
                  window.refreshQuoteNumber();
                }
              }}
              className="px-2 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-xs font-medium"
              title="Get next quote number"
            >
              🔄
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Reference Number
          </label>
          <input
            type="text"
            value={formData.referenceNumber}
            onChange={(e) =>
              onFormDataChange({ referenceNumber: e.target.value })
            }
            placeholder="Optional reference number"
            className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Quote Date
          </label>
          <input
            type="date"
            value={formData.quoteDate}
            onChange={(e) =>
              onFormDataChange({ quoteDate: e.target.value })
            }
            className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Valid Until
          </label>
          <input
            type="date"
            value={formData.validUntil}
            onChange={(e) =>
              onFormDataChange({ validUntil: e.target.value })
            }
            className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Subject
          </label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) =>
              onFormDataChange({ subject: e.target.value })
            }
            placeholder="Quote subject or title"
            className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Salesperson
          </label>
          <input
            type="text"
            value={formData.salesperson}
            onChange={(e) =>
              onFormDataChange({ salesperson: e.target.value })
            }
            placeholder="Salesperson name"
            className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Project
          </label>
          <input
            type="text"
            value={formData.project}
            onChange={(e) =>
              onFormDataChange({ project: e.target.value })
            }
            placeholder="Project name (optional)"
            className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Terms
          </label>
          <select
            value={formData.terms}
            onChange={(e) =>
              onFormDataChange({ terms: e.target.value })
            }
            className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="Due on Receipt">Due on Receipt</option>
            <option value="Net 15">Net 15</option>
            <option value="Net 30">Net 30</option>
            <option value="Net 45">Net 45</option>
            <option value="Net 60">Net 60</option>
            <option value="Net 90">Net 90</option>
            <option value="Custom">Custom</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default QuoteDetails;
