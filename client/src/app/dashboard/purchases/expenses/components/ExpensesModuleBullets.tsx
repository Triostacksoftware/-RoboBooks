'use client';

import { CheckCircleIcon } from '@heroicons/react/24/outline';

const bulletPoints = [
  "Record a single expense or record expenses in bulk.",
  "Set mileage rates and record expenses based on the distance travelled.",
  "Convert an expense into an invoice to get it reimbursed.",
];

export default function ExpensesModuleBullets() {
  return (
    <section className="w-full py-6 bg-[#fafbfc] mt-[-8vmin] flex flex-col items-center">
      <h2 className="text-center text-2xl font-medium text-gray-900 mb-5">
        In the Expenses module, you can:
      </h2>
      <ul className="flex flex-col gap-3 w-full max-w-2xl mx-auto">
        {bulletPoints.map((point, idx) => (
          <li
            key={idx}
            className="flex items-center gap-3 text-1xl text-gray-800"
          >
            <span className="flex-shrink-0 w-5 h-5 rounded-full border border-blue-400 flex items-center justify-center">
              <CheckCircleIcon className="w-4 h-4 text-blue-500" />
            </span>
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
