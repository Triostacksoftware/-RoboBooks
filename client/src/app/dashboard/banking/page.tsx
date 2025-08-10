"use client";

import React, { useState } from "react";
import {
  BanknotesIcon,
  CreditCardIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import BankingOverview from "./components/BankingOverview";
import TransactionManager from "./components/TransactionManager";
import BankReconciliation from "./components/BankReconciliation";
import BankAccountManager from "./components/BankAccountManager";

// Define the BankAccount interface
interface BankAccount {
  id: number;
  name: string;
  bank: string;
  accountNumber: string;
  balance: number;
  type: "checking" | "savings" | "credit" | "loan";
  status: "connected" | "pending" | "disconnected" | "error";
  lastSync: string;
  currency: string;
  accountType: string;
  routingNumber?: string;
  swiftCode?: string;
}

// Define the Transaction interface
interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
  account: string;
  status: "reconciled" | "pending" | "unreconciled";
  reference?: string;
}

// Define the ReconciliationItem interface
interface ReconciliationItem {
  id: number;
  bankTransaction: {
    id: string;
    description: string;
    amount: number;
    date: string;
    reference?: string;
  };
  bookTransaction?: {
    id: string;
    description: string;
    amount: number;
    date: string;
    type: "invoice" | "expense" | "payment" | "manual";
  };
  status: "matched" | "unmatched" | "reconciled";
  difference?: number;
}

export default function BankingPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showConnectModal, setShowConnectModal] = useState(false);

  const tabs = [
    { id: "overview", label: "Overview", icon: ChartBarIcon },
    { id: "accounts", label: "Accounts", icon: BanknotesIcon },
    { id: "transactions", label: "Transactions", icon: CreditCardIcon },
    { id: "reconciliation", label: "Reconciliation", icon: Cog6ToothIcon },
  ];

  const accounts: BankAccount[] = [
    {
      id: 1,
      name: "Business Checking Account",
      bank: "Chase Bank",
      accountNumber: "****1234",
      balance: 45230.5,
      type: "checking",
      status: "connected",
      lastSync: "2 hours ago",
      currency: "USD",
      accountType: "Business Account",
    },
    {
      id: 2,
      name: "Business Credit Card",
      bank: "American Express",
      accountNumber: "****5678",
      balance: -1250.75,
      type: "credit",
      status: "connected",
      lastSync: "1 hour ago",
      currency: "USD",
      accountType: "Credit Card",
    },
    {
      id: 3,
      name: "Savings Account",
      bank: "Wells Fargo",
      accountNumber: "****9012",
      balance: 150000.0,
      type: "savings",
      status: "pending",
      lastSync: "Never",
      currency: "USD",
      accountType: "Savings Account",
    },
  ];

  const recentTransactions: Transaction[] = [
    {
      id: 1,
      description: "Office Supplies - Staples",
      amount: -125.5,
      type: "expense",
      category: "Office Supplies",
      date: "2024-01-15",
      account: "Business Checking Account",
      status: "reconciled",
      reference: "STAPLES-001",
    },
    {
      id: 2,
      description: "Client Payment - ABC Corp",
      amount: 2500.0,
      type: "income",
      category: "Client Payments",
      date: "2024-01-14",
      account: "Business Checking Account",
      status: "reconciled",
      reference: "INV-2024-001",
    },
    {
      id: 3,
      description: "Gas Station",
      amount: -45.75,
      type: "expense",
      category: "Transportation",
      date: "2024-01-14",
      account: "Business Credit Card",
      status: "pending",
      reference: "SHELL-123",
    },
    {
      id: 4,
      description: "Software Subscription",
      amount: -99.0,
      type: "expense",
      category: "Software",
      date: "2024-01-13",
      account: "Business Credit Card",
      status: "reconciled",
      reference: "SUBSCRIPTION-001",
    },
    {
      id: 5,
      description: "Marketing Services",
      amount: -500.0,
      type: "expense",
      category: "Marketing",
      date: "2024-01-12",
      account: "Business Checking Account",
      status: "unreconciled",
      reference: "MARKETING-001",
    },
    {
      id: 6,
      description: "Utility Bill - Electricity",
      amount: -150.25,
      type: "expense",
      category: "Utilities",
      date: "2024-01-11",
      account: "Business Checking Account",
      status: "reconciled",
      reference: "UTILITY-001",
    },
  ];

  const reconciliationData: {
    accountName: string;
    bankBalance: number;
    bookBalance: number;
    difference: number;
    items: ReconciliationItem[];
  } = {
    accountName: "Business Checking Account",
    bankBalance: 45230.5,
    bookBalance: 44979.75,
    difference: 250.75,
    items: [
      {
        id: 1,
        bankTransaction: {
          id: "BANK-001",
          description: "Office Supplies - Staples",
          amount: -125.5,
          date: "2024-01-15",
          reference: "STAPLES-001",
        },
        bookTransaction: {
          id: "BOOK-001",
          description: "Office Supplies - Staples",
          amount: -125.5,
          date: "2024-01-15",
          type: "expense",
        },
        status: "matched",
        difference: 0,
      },
      {
        id: 2,
        bankTransaction: {
          id: "BANK-002",
          description: "Client Payment - ABC Corp",
          amount: 2500.0,
          date: "2024-01-14",
          reference: "INV-2024-001",
        },
        bookTransaction: {
          id: "BOOK-002",
          description: "Client Payment - ABC Corp",
          amount: 2500.0,
          date: "2024-01-14",
          type: "payment",
        },
        status: "matched",
        difference: 0,
      },
      {
        id: 3,
        bankTransaction: {
          id: "BANK-003",
          description: "Unknown Transaction",
          amount: -250.75,
          date: "2024-01-10",
          reference: "UNKNOWN-001",
        },
        status: "unmatched",
        difference: -250.75,
      },
      {
        id: 4,
        bankTransaction: {
          id: "BANK-004",
          description: "Marketing Services",
          amount: -500.0,
          date: "2024-01-12",
          reference: "MARKETING-001",
        },
        status: "unmatched",
        difference: -500.0,
      },
    ],
  };

  const ConnectBankModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Stay on top of your money
          </h2>
          <button
            onClick={() => setShowConnectModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          Connect your bank and credit cards to fetch all your transactions.
          Create, categorize and match these transactions to those you have in
          Zoho Books.
        </p>

        <div className="flex gap-3 mb-6">
          <button 
            onClick={() => {
              window.dispatchEvent(new Event('open-add-bank-account'));
              setShowConnectModal(false);
              setActiveTab('accounts');
            }}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors">
            Connect Bank / Credit Card
          </button>
          <button 
            onClick={() => {
              window.dispatchEvent(new Event('open-add-bank-account'));
              setShowConnectModal(false);
              setActiveTab('accounts');
            }}
            className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors">
            Add Manually
          </button>
        </div>

        <div className="text-center">
          <p className="text-gray-500 text-sm">
            Don't use banking for your business?{" "}
            <button onClick={() => setShowConnectModal(false)} className="text-blue-600 hover:underline">Skip</button>
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <button className="flex items-center justify-center w-full text-blue-600 hover:text-blue-700">
            <div className="w-4 h-4 bg-blue-600 rounded-full mr-2 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            Watch how to connect your bank account to Zoho Books
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Banking</h1>
          <p className="text-gray-600">
            Manage your bank accounts and transactions
          </p>
        </div>
        <button
          onClick={() => {
            // Ensure the Accounts tab (with the modal listener) is mounted
            setActiveTab('accounts');
            // Dispatch after mount to reliably open the modal
            setTimeout(() => {
              window.dispatchEvent(new Event('open-add-bank-account'));
            }, 0);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Connect Bank Account
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && <BankingOverview />}

      {activeTab === "accounts" && <BankAccountManager />}

      {activeTab === "transactions" && (
        <TransactionManager transactions={recentTransactions} />
      )}

      {activeTab === "reconciliation" && (
        <BankReconciliation reconciliationData={reconciliationData} />
      )}

      {showConnectModal && <ConnectBankModal />}
    </div>
  );
}
