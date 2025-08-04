'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  XMarkIcon,
  ClipboardIcon,
  BanknotesIcon,
  CalendarIcon,
  ChevronDownIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const chartData = [
  { date: '2025-07-07', cash: 0 },
  { date: '2025-07-09', cash: 0 },
  { date: '2025-07-11', cash: 0 },
  { date: '2025-07-13', cash: 0 },
  { date: '2025-07-14', cash: 0 },
  { date: '2025-07-15', cash: 0 },
  { date: '2025-07-17', cash: 0 },
  { date: '2025-07-19', cash: 0 },
  { date: '2025-07-21', cash: 0 },
  { date: '2025-07-23', cash: 0 },
  { date: '2025-07-25', cash: 0 },
  { date: '2025-07-27', cash: 0 },
  { date: '2025-07-29', cash: 0 },
  { date: '2025-07-31', cash: 0 },
  { date: '2025-08-01', cash: 0 },
  { date: '2025-08-03', cash: 0 },
];

const accounts = [
  {
    name: 'Petty Cash',
    uncategorized: '₹0.00',
    pending: '₹0.00',
    inBank: '₹0.00',
    inBooks: '₹0.00',
    editHref: '/dashboard/banking/skip/edit-petty-cash',
    viewHref: '/dashboard/banking/skip/transactions-petty-cash',
    detailHref: '/dashboard/banking/skip/cash-in-hand',
  },
  {
    name: 'Undeposited Funds',
    uncategorized: '₹0.00',
    pending: '₹0.00',
    inBank: '₹0.00',
    inBooks: '₹0.00',
    editHref: '/dashboard/banking/skip/edit-undeposited-funds',
    viewHref: '/dashboard/banking/skip/transactions-undeposited-funds',
    detailHref: '/dashboard/banking/skip/undeposited-funds',
  },
];

const STATEMENT_EMAIL = 'triostack.dafneycj_d6jqazbab.secure@inbox.zohoreceipts.in';

function BankStatementsDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (drawerRef.current && e.target === drawerRef.current) onClose();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(STATEMENT_EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end transition-all duration-200 ${open ? '' : 'pointer-events-none'}`}
      style={{ background: open ? 'rgba(0,0,0,0.07)' : 'transparent' }}
      ref={drawerRef}
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-white h-full w-full max-w-lg shadow-xl flex flex-col transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-7 py-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Bank Statements From Inbox</h2>
          <button aria-label="Close" className="text-gray-400 hover:text-gray-700" onClick={onClose}>
            <XMarkIcon className="w-7 h-7" />
          </button>
        </div>
        <div className="px-7 pt-5 pb-0">
          <div className="text-sm text-gray-500 font-medium mb-2">Forward bank statements to</div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-gray-800 truncate">{STATEMENT_EMAIL}</span>
            <button
              className="flex items-center gap-1 px-2 py-0.5 text-blue-600 font-medium hover:bg-blue-50 rounded"
              onClick={handleCopy}
            >
              <ClipboardIcon className="w-4 h-4" />
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
        <div className="border-b mt-3"></div>
        <div className="flex-1 flex flex-col justify-center items-center">
          <span className="mb-3">
            <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
              <circle cx="48" cy="48" r="48" fill="#FCE7F3"/>
              <rect x="28" y="50" width="40" height="24" rx="4" fill="#C4B5FD"/>
              <rect x="28" y="36" width="40" height="20" rx="4" fill="#A78BFA"/>
              <rect x="32" y="40" width="32" height="12" rx="2" fill="#F3E8FF"/>
            </svg>
          </span>
          <div className="text-lg sm:text-xl font-medium text-gray-800 text-center">
            Looks like you've added all your bank statements!
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BankingOverview() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showChart, setShowChart] = useState(true);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const menuRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [range] = useState('Last 30 days');
  const router = useRouter();

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        openIndex !== null &&
        menuRefs.current[openIndex] &&
        !menuRefs.current[openIndex]?.contains(e.target as Node)
      ) {
        setOpenIndex(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openIndex]);

  const handleRangeClick = () => {
    router.push(`/dashboard/banking?range=${encodeURIComponent(range)}`);
  };

  return (
    <>
      {/* HEADER */}
      <header className="w-full px-4 py-3 border-b bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Title */}
        <h1 className="text-2xl font-semibold text-gray-900 whitespace-nowrap">Banking Overview</h1>
        {/* Right: Bank Statements and Add Bank */}
        <div className="flex items-center gap-4">
          <button
            className="flex items-center text-blue-600 hover:underline text-base font-medium gap-1"
            onClick={() => setDrawerOpen(true)}
            type="button"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-blue-600 mr-1" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <rect x="4" y="6" width="16" height="12" rx="2" fill="none" />
              <circle cx="12" cy="12" r="2.5" />
              <path d="M8 12h.01M16 12h.01" strokeLinecap="round" />
            </svg>
            Bank Statements
          </button>
          <button
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-base font-medium transition shadow-sm"
            onClick={() => router.push('/dashboard/banking/skip/add')}
            type="button"
          >
            Add Bank or Credit Card
          </button>
        </div>
      </header>

      {/* Main Page Content */}
      <div className="space-y-6 p-4 sm:p-6 md:p-8 lg:p-10">
        {/* Chart & Balance */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-gray-100">
                <BanknotesIcon className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <div className="text-gray-700 font-medium text-xs sm:text-sm">Cash In Hand</div>
                <div className="text-black text-base font-bold mt-0.5">₹0.00</div>
              </div>
            </div>
            <button
              onClick={handleRangeClick}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 bg-white rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition text-xs sm:text-sm"
              type="button"
            >
              <CalendarIcon className="w-5 h-5 text-gray-400" />
              <span>Last 30 days</span>
              <ChevronDownIcon className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          {/* Chart Toggle */}
          <button
            onClick={() => setShowChart(!showChart)}
            className="flex items-center gap-1 text-blue-600 font-semibold text-xs sm:text-base hover:underline focus:outline-none mb-2"
            style={{ background: 'none', border: 'none', padding: 0 }}
            type="button"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 20 20" className="mr-1">
              <path d="M3 13l4-4 4 4 5-5" stroke="#2563eb" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {showChart ? 'Hide Chart' : 'Show Chart'}
            <span className={`ml-1 text-xs transition-transform ${showChart ? 'rotate-180' : ''}`}>▲</span>
          </button>
          {/* Chart */}
          {showChart && (
            <div className="w-full h-[250px] sm:h-[300px] mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 30, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#F3F4F6" strokeDasharray="2 6" vertical={false} />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(d) =>
                      new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
                    }
                    minTickGap={15}
                    tick={{ fontSize: 11, fill: '#888' }}
                    height={30}
                    padding={{ left: 12, right: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => (v === 0 ? '0' : `${v / 1000} K`)}
                    domain={[0, 'auto']}
                    tickCount={6}
                    width={40}
                    tick={{ fontSize: 11, fill: '#888' }}
                  />
                  <Tooltip
                    wrapperStyle={{ borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 16px 0 rgba(0,0,0,0.10)' }}
                    contentStyle={{
                      borderColor: '#eee', borderRadius: 12, padding: 10,
                      fontSize: 12, fontWeight: 500
                    }}
                    labelStyle={{ fontWeight: 700, fontSize: 11, marginBottom: 8 }}
                    itemStyle={{ display: 'flex', alignItems: 'center', fontSize: 11 }}
                    separator=" "
                    formatter={(v, n) => [`₹${Number(v).toFixed(2)}`, n]}
                    labelFormatter={(l) => {
                      const d = new Date(l);
                      return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    align="left"
                    iconType="circle"
                    wrapperStyle={{ paddingLeft: 10, marginTop: 8, color: '#666', fontSize: 11 }}
                    payload={[{ id: 'cash', type: 'circle', value: 'Cash In Hand', color: '#9CA3AF' }]}
                  />
                  <Line
                    type="monotone"
                    dataKey="cash"
                    name="Cash In Hand"
                    stroke="#9CA3AF"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#9CA3AF" }}
                    activeDot={{ r: 7, fill: "#9CA3AF" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* 3) Account Table Section (Dropdown Actions) */}
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <div className="flex items-center px-4 py-2 border-b">
            <h2 className="text-base font-semibold text-gray-900 flex-1">Active Accounts</h2>
            <button
              className="flex items-center text-gray-700 text-xs font-medium hover:underline"
              onClick={() => router.push('/dashboard/banking/skip/accounts')}
              type="button"
            >
              <span>▼</span>
            </button>
          </div>
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase">
                <th className="px-4 py-2 text-left font-semibold">Account Details</th>
                <th className="px-2 py-2 text-left font-semibold">Uncategorized</th>
                <th className="px-2 py-2 text-left font-semibold">Pending Checks</th>
                <th className="px-2 py-2 text-left font-semibold">Amount In Bank</th>
                <th className="px-2 py-2 text-left font-semibold">Amount in Zoho Books</th>
                <th className="px-2 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account, idx) => (
                <tr
                  key={account.name}
                  className={`border-b ${idx === 0 ? 'bg-gray-50' : ''} hover:bg-blue-50 transition`}
                >
                  <td className="flex items-center gap-2 px-4 py-3 text-xs font-medium text-gray-900">
                    <span className="flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 bg-white mr-2">
                      <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="#222" strokeWidth={1.5}>
                        <rect x={5} y={8} width={14} height={7} rx={2} fill="#fff" stroke="#222" />
                        <path d="M8 12h.01" stroke="#222" strokeWidth={2} />
                        <path d="M12 12h.01" stroke="#222" strokeWidth={2} />
                      </svg>
                    </span>
                    <span
                      className="text-blue-600 hover:underline cursor-pointer"
                      onClick={() => router.push(account.detailHref)}
                    >
                      {account.name}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-xs text-gray-700">{account.uncategorized}</td>
                  <td className="px-2 py-3 text-xs text-gray-700">{account.pending}</td>
                  <td className="px-2 py-3 text-xs text-gray-900">{account.inBank}</td>
                  <td className="px-2 py-3 text-xs text-gray-900">{account.inBooks}</td>
                  <td className="relative px-2 py-3 text-right">
                    <button
                      className="p-2 rounded-full hover:bg-gray-100 transition"
                      onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                      aria-label="Open actions"
                      type="button"
                    >
                      <ChevronDownIcon className="w-5 h-5 text-gray-700" />
                    </button>
                    {/* Dropdown menu */}
                    {openIndex === idx && (
                      <div
                        ref={el => (menuRefs.current[idx] = el)}
                        className="absolute right-2 top-10 z-20 w-44 rounded-xl shadow-lg bg-white border border-gray-100 py-2 text-sm"
                      >
                        <button
                          className="w-full text-left px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 focus:bg-blue-50 rounded-t-xl"
                          onClick={() => {
                            setOpenIndex(null);
                            router.push(account.editHref);
                          }}
                          type="button"
                        >
                          Edit Account
                        </button>
                        <button
                          className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-50 focus:bg-gray-50 rounded-b-xl"
                          onClick={() => {
                            setOpenIndex(null);
                            router.push(account.viewHref);
                          }}
                          type="button"
                        >
                          View Transactions
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Loan Banner */}
        <div className="bg-blue-50 rounded-lg p-4 sm:p-6 flex flex-col md:flex-row items-center gap-4">
          <ArrowTrendingUpIcon className="w-10 h-10 text-blue-600" />
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-800">
              Need cash? Apply for a loan
            </h3>
            <p className="text-gray-600 text-xs sm:text-sm">
              Zoho Books has partnered with a few banks that can provide a loan for you to meet your working capital requirements.
            </p>
          </div>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-xs sm:text-sm"
            onClick={() => router.push('/dashboard/banking/skip/loan')}
            type="button"
          >
            Apply for Loan
          </button>
        </div>
      </div>
      {/* Drawer */}
      <BankStatementsDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
