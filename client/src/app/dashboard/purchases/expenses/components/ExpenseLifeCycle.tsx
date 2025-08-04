// components/ExpenseLifecycleFlow.jsx
'use client';
import {
  DocumentTextIcon,
  BookmarkIcon,
} from '@heroicons/react/24/outline';

function ArrowRightDashed({ className = "" }) {
  return (
    <svg width="22" height="18" viewBox="0 0 22 18" fill="none" className={className}>
      <path
        d="M2 9h15M15 5l5 4-5 4"
        stroke="#53a6e2"
        strokeWidth="1.5"
        strokeDasharray="3 3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ExpenseLifecycleFlow() {
  return (
    <section className="w-full bg-[#f8f8fa] flex flex-col items-center py-6 px-2 min-h-[220px]">
      <h2 className="text-base md:text-lg font-semibold text-center mb-6">Life cycle of an Expense</h2>
      <div className="w-full flex justify-center items-center overflow-x-auto">
        <div className="relative flex flex-col md:flex-row items-center md:items-start md:gap-1 min-w-[320px] max-w-full">
          {/* Step 1: Expense Incurred */}
          <div className="flex flex-col items-center">
            <div className="flex items-center">
              <div className="flex items-center border border-blue-300 rounded-md bg-white px-2 py-2 min-w-[100px] shadow-sm">
                <BookmarkIcon className="w-4 h-4 text-blue-400 mr-1" />
                <span className="text-xs font-medium text-gray-700 whitespace-nowrap">EXPENSE INCURRED</span>
              </div>
              {/* Arrow */}
              <ArrowRightDashed className="ml-1 hidden md:block" />
            </div>
            {/* Connector for vertical split */}
            <div className="hidden md:block h-5 border-l border-dashed border-blue-300 mx-auto" />
          </div>
          {/* Step 2: Record Expense */}
          <div className="flex flex-col items-center">
            <div className="flex items-center">
              <div className="flex items-center border border-blue-300 rounded-md bg-white px-2 py-2 min-w-[100px] shadow-sm">
                {/* Dollar icon */}
                <svg width="16" height="16" fill="none" viewBox="0 0 16 16" className="mr-1">
                  <circle cx="8" cy="8" r="7" stroke="#53a6e2" strokeWidth="1.3" />
                  <text x="8" y="12" textAnchor="middle" fontSize="10" fill="#53a6e2" fontFamily="Arial">$</text>
                </svg>
                <span className="text-xs font-medium text-gray-700 whitespace-nowrap">RECORD EXPENSE</span>
              </div>
              {/* Arrow */}
              <ArrowRightDashed className="ml-1 hidden md:block" />
            </div>
            {/* Vertical connector */}
            <div className="hidden md:block h-5 border-l border-dashed border-blue-300 mx-auto" />
          </div>
          {/* Split Branches */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-3">
            {/* Billable Branch */}
            <div className="flex flex-col items-center">
              <div className="flex items-center">
                <div className="flex items-center border border-blue-300 rounded-md bg-white px-2 py-2 min-w-[72px] shadow-sm">
                  <BookmarkIcon className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-xs font-medium text-green-600 whitespace-nowrap">BILLABLE</span>
                </div>
                {/* Arrow */}
                <ArrowRightDashed className="ml-1 hidden md:block" />
              </div>
              <div className="flex items-center">
                {/* Convert to Invoice */}
                <div className="flex items-center border border-blue-300 rounded-md bg-white px-2 py-2 min-w-[100px] shadow-sm ml-0 md:ml-1">
                  <DocumentTextIcon className="w-4 h-4 text-blue-400 mr-1" />
                  <span className="text-xs font-medium text-gray-700 whitespace-nowrap">CONVERT TO INVOICE</span>
                </div>
                {/* Arrow */}
                <ArrowRightDashed className="ml-1 hidden md:block" />
                {/* Get Reimbursed */}
                <div className="flex items-center border border-blue-300 rounded-md bg-white px-2 py-2 min-w-[100px] shadow-sm ml-0 md:ml-1">
                  <svg width="16" height="16" fill="none" viewBox="0 0 16 16" className="mr-1">
                    <circle cx="8" cy="8" r="7" stroke="#28c46d" strokeWidth="1.3" />
                    <text x="8" y="12" textAnchor="middle" fontSize="10" fill="#28c46d" fontFamily="Arial">$</text>
                  </svg>
                  <span className="text-xs font-medium text-green-600 whitespace-nowrap">GET REIMBURSED</span>
                </div>
              </div>
            </div>
            {/* Non-Billable Branch */}
            <div className="flex items-center md:ml-[-70px] mt-1 md:mt-8">
              <div className="flex items-center border border-blue-300 rounded-md bg-white px-2 py-2 min-w-[85px] shadow-sm">
                <BookmarkIcon className="w-4 h-4 text-red-400 mr-1" />
                <span className="text-xs font-medium text-red-500 whitespace-nowrap">NON-BILLABLE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
