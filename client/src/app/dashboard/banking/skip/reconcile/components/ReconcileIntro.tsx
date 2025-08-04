'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ReconcileIntro() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white flex flex-col px-3 py-3 md:px-8 md:py-6">
      {/* Breadcrumb */}
      <div className="mb-1">
        <Link
          href="/dashboard/banking/skip/transactions-petty-cash"
          className="text-blue-600 hover:underline text-sm flex items-center gap-1"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="inline-block">
            <path d="M15 19l-7-7 7-7" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Petty Cash transactions
        </Link>
      </div>

      {/* Title */}
      <h1 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Petty Cash - Reconciliations</h1>

      {/* Alert */}
      <div className="w-full bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-start gap-2 mb-6">
        <span className="mt-0.5">
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="12" fill="#FDEAD7" />
            <path d="M12 8v4m0 4h.01" stroke="#F59E42" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </span>
        <div className="text-xs md:text-sm text-gray-800">
          Opening balance cannot be edited once transactions are reconciled. Please make sure opening balance is set right before reconciling any transaction.{' '}
          <Link href="#" className="text-blue-600 hover:underline">Check Opening Balance</Link>
        </div>
      </div>

      {/* Main Section */}
      <div className="flex flex-col md:flex-row items-center gap-6 flex-1 w-full justify-center">
        {/* Illustration */}
        <div className="w-full md:w-1/2 flex justify-center md:justify-end pb-4 md:pb-0">
          {/* Replace src with your SVG or custom illustration */}
          <img
            src="/images/your-illustration.png"
            alt="Reconcile Illustration"
            className="max-w-[170px] md:max-w-[210px] w-full"
            style={{ minHeight: 120 }}
            draggable={false}
            onError={e => (e.currentTarget.src = "https://em-content.zobj.net/source/microsoft-teams/363/ledger_1f4d2.png")}
          />
        </div>
        {/* Content */}
        <div className="w-full md:w-1/2">
          <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-1">
            Reconcile your statements with your transactions.
          </h2>
          <p className="text-gray-500 mb-3 text-xs md:text-sm">
            Reconcile your bank statements with your Zoho Books transaction.<br className="hidden md:block"/> You can also add transactions to match any difference.
          </p>
          <ol className="text-gray-800 text-xs md:text-sm mb-5 space-y-0.5 list-decimal list-inside pl-1">
            <li>Set a date range to reconcile</li>
            <li>Add transactions to match differences</li>
            <li>Undo or delete reconciliation</li>
          </ol>
          <button
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs md:text-sm font-semibold transition active:scale-95"
            onClick={() => router.push('/dashboard/banking/reconciliation/start')}
            aria-label="Start reconciliation"
            tabIndex={0}
          >
            Reconcile now
          </button>
        </div>
      </div>
    </div>
  );
}
