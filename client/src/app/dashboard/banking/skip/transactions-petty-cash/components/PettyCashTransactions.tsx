'use client';

import { useState, useRef, useEffect } from "react";
import {
  Cog6ToothIcon,
  XMarkIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

const moneyOut = [
  "Expense",
  "Vendor Advance",
  "Vendor Payment",
  "Transfer To Another Account",
  "Card Payment",
  "Owner Drawings",
  "Deposit To Other Accounts",
  "Credit Note Refund",
  "Payment Refund",
];

const moneyIn = [
  "Customer Advance",
  "Customer Payment",
  "Transfer From Another Account",
  "Interest Income",
  "Other Income",
  "Expense Refund",
  "Deposit From Other Accounts",
  "Owner's Contribution",
  "Vendor Credit Refund",
  "Vendor Payment Refund",
];

const settingsOptions = [
  { label: "Edit", path: "/dashboard/banking/skip/edit" },
  { label: "Reconcile Account", path: "/dashboard/banking/skip/reconcile" },
  { label: "Mark as Inactive", path: "/dashboard/banking/skip/mark-inactive" },
  { label: "Delete", path: "/dashboard/banking/skip/delete" },
];

export default function PettyCashTransactions() {
  const [tab, setTab] = useState("transactions");
  const [dropdown, setDropdown] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const addTransRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        addTransRef.current &&
        !addTransRef.current.contains(e.target as Node)
      ) {
        setDropdown(false);
      }
      if (
        settingsRef.current &&
        !settingsRef.current.contains(e.target as Node)
      ) {
        setSettingsOpen(false);
      }
    }
    if (dropdown || settingsOpen) {
      window.addEventListener("mousedown", handleClick);
      return () => window.removeEventListener("mousedown", handleClick);
    }
  }, [dropdown, settingsOpen]);

  // Add Transaction option click (redirect, you can update URLs)
  const handleOptionClick = (type: string) => {
    setDropdown(false);
    router.push(`/dashboard/banking/skip/transactions/${type.toLowerCase().replaceAll(" ", "-")}`);
  };

  // Settings dropdown option click (redirect)
  const handleSettingsOption = (path: string) => {
    setSettingsOpen(false);
    router.push(path);
  };

  // X (close) button navigation
  const handleClose = () => router.push("/");

  return (
    <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow border border-gray-100 mt-4 mb-10">
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

      {/* Table Header */}
      <div className="mt-4 overflow-x-auto">
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
    </div>
  );
}
