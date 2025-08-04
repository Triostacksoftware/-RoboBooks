'use client';

import { useState, useRef, useEffect } from "react";
import {
  Cog6ToothIcon,
  XMarkIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

// --- MOCK DATA for chart: 30 days, closing balance is always 0
const chartData = [
  { date: '2025-07-07', closing: 0 },
  { date: '2025-07-09', closing: 0 },
  { date: '2025-07-11', closing: 0 },
  { date: '2025-07-13', closing: 0 },
  { date: '2025-07-17', closing: 0 },
  { date: '2025-07-19', closing: 0 },
  { date: '2025-07-21', closing: 0 },
  { date: '2025-07-23', closing: 0 },
  { date: '2025-07-25', closing: 0 },
  { date: '2025-07-27', closing: 0 },
  { date: '2025-07-29', closing: 0 },
  { date: '2025-07-31', closing: 0 },
  { date: '2025-08-01', closing: 0 },
  { date: '2025-08-03', closing: 0 },
];

const moneyOut = [
  "Expense", "Vendor Advance", "Vendor Payment", "Transfer To Another Account", "Card Payment",
  "Owner Drawings", "Deposit To Other Accounts", "Credit Note Refund", "Payment Refund",
];
const moneyIn = [
  "Customer Advance", "Customer Payment", "Transfer From Another Account", "Interest Income",
  "Other Income", "Expense Refund", "Deposit From Other Accounts", "Owner's Contribution",
  "Vendor Credit Refund", "Vendor Payment Refund",
];
const settingsOptions = [
  { label: "Edit", path: "/dashboard/banking/skip/edit-petty-cash" },
  { label: "Reconcile Account", path: "/dashboard/banking/skip/reconcile" },
  { label: "Delete", path: "DELETE" }, // Use a flag for Delete, not a route
];

export default function PettyCashTransactions() {
  const [tab, setTab] = useState("dashboard");
  const [dropdown, setDropdown] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const addTransRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        addTransRef.current && !addTransRef.current.contains(e.target as Node)
      ) setDropdown(false);
      if (
        settingsRef.current && !settingsRef.current.contains(e.target as Node)
      ) setSettingsOpen(false);
    }
    if (dropdown || settingsOpen) {
      window.addEventListener("mousedown", handleClick);
      return () => window.removeEventListener("mousedown", handleClick);
    }
  }, [dropdown, settingsOpen]);

  // Add Transaction option click
  const handleOptionClick = (type: string) => {
    setDropdown(false);
    router.push(`/dashboard/banking/skip/transactions/${type.toLowerCase().replaceAll(" ", "-")}`);
  };

  // Settings option click
  const handleSettingsOption = (path: string) => {
    setSettingsOpen(false);
    if (path === "DELETE") {
      setShowDeleteModal(true);
    } else {
      router.push(path);
    }
  };

  // Close btn navigation
  const handleClose = () => router.push("/");

  // Handle Delete confirmation
  const handleDelete = () => {
    // Add delete API call here if needed
    setShowDeleteModal(false);
    alert("Petty Cash deleted!");
    router.push("/dashboard/banking");
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-2xl shadow border border-gray-100 mt-4 mb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 pt-4">
        <div className="flex items-center gap-1">
          <span className="text-lg md:text-xl font-semibold text-gray-900">Petty Cash</span>
          <ChevronDownIcon className="w-4 h-4 text-gray-400 cursor-pointer" />
        </div>
        <div className="flex items-center mt-3 sm:mt-0 gap-2 relative">
          {/* Add Transaction Button & Dropdown */}
          <div className="relative" ref={addTransRef}>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-1.5 rounded-lg flex items-center gap-1.5 transition"
              type="button"
              onClick={() => setDropdown((v) => !v)}
            >
              Add Transaction
              <ChevronDownIcon className={`w-4 h-4 transition-transform ${dropdown ? "rotate-180" : ""}`} />
            </button>
            {dropdown && (
              <div className="absolute right-0 mt-2 w-64 max-h-96 overflow-y-auto bg-white rounded-xl shadow-xl border border-gray-100 z-30 py-2 text-sm animate-fadein">
                <div className="px-4 py-2 text-gray-400 font-bold text-xs uppercase">Money Out</div>
                {moneyOut.map((item) => (
                  <button
                    key={item}
                    className="block w-full text-left px-4 py-2 hover:bg-blue-50 hover:text-blue-600 rounded-md font-medium text-gray-700 transition"
                    onClick={() => handleOptionClick(item)}
                  >
                    {item}
                  </button>
                ))}
                <div className="mt-2 px-4 py-2 text-gray-400 font-bold text-xs uppercase border-t border-gray-100">Money In</div>
                {moneyIn.map((item) => (
                  <button
                    key={item}
                    className="block w-full text-left px-4 py-2 hover:bg-blue-50 hover:text-blue-600 rounded-md font-medium text-gray-700 transition"
                    onClick={() => handleOptionClick(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Settings Button & Dropdown */}
          <div className="relative" ref={settingsRef}>
            <button
              className="bg-white border border-gray-200 rounded-lg p-1.5 hover:bg-gray-100 transition"
              type="button"
              aria-label="Settings"
              onClick={() => setSettingsOpen((v) => !v)}
            >
              <Cog6ToothIcon className="w-5 h-5 text-gray-500" />
            </button>
            {settingsOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-30 py-2 text-sm animate-fadein">
                {settingsOptions.map(option => (
                  <button
                    key={option.label}
                    className={`block w-full text-left px-4 py-2 hover:bg-blue-50 hover:text-blue-600 rounded-md font-medium text-gray-700 transition ${
                      option.label === "Mark as Inactive" ? " text-blue-600" : ""
                    }`}
                    onClick={() => handleSettingsOption(option.path)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Close Button */}
          <button
            className="bg-white border border-gray-200 rounded-lg p-1.5 hover:bg-gray-100 transition"
            type="button"
            aria-label="Close"
            onClick={handleClose}
          >
            <XMarkIcon className="w-5 h-5 text-red-400" />
          </button>
        </div>
      </div>

      {/* Amount Card */}
      <div className="px-4 pt-4 flex items-center gap-3">
        <div className="flex items-center justify-center bg-blue-50 rounded-lg h-12 w-12">
          {/* Simple Wallet SVG */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-blue-400" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="7" width="20" height="10" rx="2" fill="#e0ecfb"/>
            <rect x="5" y="10" width="3" height="3" rx="1" fill="#60a5fa"/>
            <rect x="2" y="7" width="20" height="10" rx="2" stroke="#3b82f6" strokeWidth="1.5"/>
          </svg>
        </div>
        <div>
          <div className="text-xs text-gray-400">Amount in Zoho Books</div>
          <div className="text-lg md:text-xl font-semibold text-gray-800">₹0.00</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-5 flex px-4 gap-2">
        <button
          className={`py-2 px-4 rounded-md text-xs md:text-sm font-medium transition
            ${tab === "dashboard"
              ? "bg-white shadow text-blue-600 border border-blue-200"
              : "hover:bg-gray-50 text-gray-500 border border-transparent"
            }`}
          onClick={() => setTab("dashboard")}
          type="button"
        >
          Dashboard
          <div className="text-[10px] text-gray-400 font-normal">Account Summary</div>
        </button>
        <button
          className={`py-2 px-4 rounded-md text-xs md:text-sm font-medium transition
            ${tab === "transactions"
              ? "bg-white shadow text-blue-600 border border-blue-200"
              : "hover:bg-gray-50 text-gray-500 border border-transparent"
            }`}
          onClick={() => setTab("transactions")}
          type="button"
        >
          Transactions
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {tab === "dashboard" && (
          <div className="space-y-8">
            {/* Activity + Recent Transactions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Activity Summary */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Activity Summary</h2>
                <div className="bg-gray-50 rounded-2xl p-6 flex items-start gap-4 mb-6">
                  <span className="flex items-center justify-center h-10 w-10 bg-gray-200 rounded-xl">
                    <CalendarDaysIcon className="h-6 w-6 text-gray-400" />
                  </span>
                  <div>
                    <div className="font-semibold text-gray-900 text-base">Last Reconciliation</div>
                    <div className="text-gray-500 text-sm mt-1">
                      You can reconcile your transactions to ensure that the transactions in Zoho Books match the transactions in your bank statement. Your last reconciliation details will be displayed here. <a href="#" className="text-blue-600 hover:underline">Learn more.</a>
                    </div>
                    <button className="flex items-center gap-2 mt-3 text-blue-600 font-medium hover:underline text-sm">
                      <CalendarDaysIcon className="h-4 w-4" />
                      Initiate Reconciliation
                    </button>
                  </div>
                </div>
              </div>
              {/* Recent Transactions */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
                <div className="bg-gray-50 rounded-2xl flex flex-col justify-center items-center h-40">
                  <div className="text-lg font-semibold text-gray-900 mb-2 text-center">
                    There are no transactions in Zoho Books yet.
                  </div>
                  <div className="text-gray-400 text-center text-base">
                    The transactions you create in Zoho Books can be matched with your bank transactions.
                  </div>
                </div>
              </div>
            </div>
            {/* Cash Summary Chart */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-semibold">Cash Summary</h2>
                <button className="text-blue-600 hover:underline text-sm flex items-center gap-1">
                  Last 30 days
                  <ChevronDownIcon className="w-4 h-4" />
                </button>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => {
                        const d = new Date(date);
                        return `${d.getDate().toString().padStart(2, "0")} ${d.toLocaleString("en", { month: "short" })}`;
                      }}
                      fontSize={12}
                      axisLine={false}
                      tickLine={false}
                      dy={8}
                    />
                    <YAxis
                      tickFormatter={val => (val >= 1000 ? `${val / 1000} K` : val)}
                      ticks={[0, 1000, 2000, 3000, 4000, 5000]}
                      domain={[0, 5000]}
                      width={32}
                      fontSize={12}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: 12, fontSize: 16, fontWeight: 500 }}
                      labelFormatter={label => {
                        const d = new Date(label);
                        return d.toLocaleDateString("en-GB", { day: '2-digit', month: '2-digit', year: 'numeric' });
                      }}
                      formatter={() => [ "₹0.00", <span key="label" style={{ color: "#6366f1" }}>Closing Balance</span> ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="closing"
                      stroke="#6366f1"
                      strokeWidth={2}
                      dot={{
                        stroke: "#6366f1",
                        strokeWidth: 2,
                        fill: "#fff",
                        r: 4
                      }}
                      activeDot={{
                        fill: "#6366f1",
                        r: 7,
                        strokeWidth: 0,
                        stroke: "#fff"
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div className="mt-2 ml-2 text-xs text-gray-500 flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-indigo-400" /> Closing Balance
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {tab === "transactions" && (
          <>
            {/* Table Header */}
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs md:text-sm text-gray-500">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-2 py-2 w-8">
                      <input type="checkbox" className="accent-blue-500" />
                    </th>
                    <th className="px-2 py-2 font-semibold">DATE</th>
                    <th className="px-2 py-2 font-semibold">REF#</th>
                    <th className="px-2 py-2 font-semibold">TYPE</th>
                    <th className="px-2 py-2 font-semibold">STATUS</th>
                    <th className="px-2 py-2 font-semibold">DEPOSITS</th>
                    <th className="px-2 py-2 font-semibold">WITHDRAWALS</th>
                    <th className="px-2 py-2 font-semibold">BALANCE</th>
                    <th className="px-2 py-2">
                      <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
                    </th>
                  </tr>
                </thead>
              </table>
            </div>
            {/* Empty State */}
            <div className="flex flex-col items-center justify-center h-48 sm:h-56 bg-white border-t border-gray-100">
              <div className="text-base text-gray-400 font-medium text-center px-3">
                No transactions yet. <span className="hidden sm:inline">Begin by adding new transactions or import your latest account statement.</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-2">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm border border-gray-100 animate-fadein">
            <div className="flex justify-between items-center mb-2">
              <h1 className="text-lg font-semibold text-gray-900">Delete Petty Cash</h1>
              <button
                className="rounded-lg p-1 hover:bg-gray-100"
                onClick={() => setShowDeleteModal(false)}
                aria-label="Close"
              >
                <XMarkIcon className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="text-gray-700 mb-4 text-sm">
              Are you sure you want to delete this Petty Cash account? This action cannot be undone.
            </div>
            <div className="flex gap-2">
              <button
                className="flex-1 py-2 px-4 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 py-2 px-4 rounded-md text-sm font-medium bg-red-500 text-white hover:bg-red-600"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
