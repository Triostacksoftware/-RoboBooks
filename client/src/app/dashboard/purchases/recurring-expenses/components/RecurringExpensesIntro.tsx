'use client';

import {
  PlusCircleIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/solid';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

export default function RecurringExpensesIntro() {
  const router = useRouter();

  const points = [
    'Create a recurring profile to routinely auto-generate expenses.',
    'View when each expense was auto-generated.',
    'Create individual expenses within the recurring profile.',
  ];

  // Button Handlers
  const handleNewExpense = () => {
    router.push('/dashboard/recurring-expenses/new');
  };

  const handleImportExpense = () => {
    router.push('/dashboard/recurring-expenses/import');
  };

  return (
    <section className="w-full px-4 py-8 md:py-10 bg-white flex flex-col items-center text-center rounded-2xl shadow-sm space-y-20">
      {/* Hero Section */}
      <div className="max-w-2xl space-y-4">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight leading-tight">
          Create. Set. Repeat.
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
          Create recurring expenses to handle and pay for stuff you spend on periodically.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <button
            onClick={handleNewExpense}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold px-6 py-2.5 rounded-full shadow transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusCircleIcon className="w-4 h-4" />
            New Recurring Expense
          </button>

          <button
            onClick={handleImportExpense}
            className="inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-blue-600 text-sm font-semibold px-6 py-2.5 rounded-full shadow transition-all"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            Import Recurring Expenses
          </button>
        </div>
      </div>

      {/* Feature List */}
      <div className="w-full max-w-3xl space-y-5">
        <h2 className="text-sm sm:text-base font-semibold text-gray-900">
          In the Recurring Expenses module, you can:
        </h2>
        <ul className="flex flex-col items-start sm:items-center gap-2 text-xs sm:text-sm text-gray-700">
          {points.map((point, index) => (
            <li key={index} className="flex items-start sm:items-center gap-2">
              <CheckCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 sm:mt-0" />
              <span className="text-left">{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
