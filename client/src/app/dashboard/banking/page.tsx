"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/contexts/ToastContext";
import ModuleAccessGuard from "@/components/ModuleAccessGuard";
import {
  BanknotesIcon,
  CreditCardIcon,
  PlusIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  XMarkIcon,
  ArrowLeftIcon,
  DocumentArrowUpIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

// Import Components
import BankingOverview from "./components/BankingOverview";
import TransactionManager from "./components/TransactionManager";
import BankReconciliation from "./components/BankReconciliation";
import BankAccountManager from "./components/BankAccountManager";
import BankStatementImport from "./components/BankStatementImport";
import { BankingProvider, useBanking } from "@/contexts/BankingContext";

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

// Internal component that uses the banking context
function BankingPageContent() {
  const { addToast, removeToastsByType } = useToast();
  const { refreshTransactions } = useBanking();
  const [activeTab, setActiveTab] = useState("overview");
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showImportWizard, setShowImportWizard] = useState(false);
  const [importStep, setImportStep] = useState(1);
  const [importData, setImportData] = useState({
    file: null,
    mappedFields: {},
    previewData: [],
    accountName: "",
    selectedAccount: null,
  });
  const [isHydrated, setIsHydrated] = useState(false);
  const router = useRouter();

  const tabs = [
    { id: "overview", label: "Overview", icon: ChartBarIcon },
    { id: "accounts", label: "Accounts", icon: BanknotesIcon },
    { id: "transactions", label: "Transactions", icon: CreditCardIcon },
    { id: "reconciliation", label: "Reconciliation", icon: Cog6ToothIcon },
  ];

  useEffect(() => {
    setIsHydrated(true);
  }, []);



  // Handle import wizard state
  const handleImportStatement = () => {
    setShowImportWizard(true);
    setImportStep(1);
    setImportData({
      file: null,
      mappedFields: {},
      previewData: [],
      accountName: "",
      selectedAccount: null,
    });
  };

  const handleImportBack = () => {
    if (importStep > 1) {
      setImportStep(importStep - 1);
    } else {
      setShowImportWizard(false);
      setImportStep(1);
    }
  };

  const handleImportNext = () => {
    if (importStep < 3) {
      setImportStep(importStep + 1);
    }
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
          RoboBooks.
        </p>

        <div className="flex gap-3 mb-6">
          <button
            onClick={() => {
              setShowConnectModal(false);
              setActiveTab("accounts");
            }}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Connect Bank / Credit Card
          </button>
          <button
            onClick={() => {
              setShowConnectModal(false);
              setActiveTab("accounts");
            }}
            className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Add Manually
          </button>
        </div>

        <div className="text-center">
          <p className="text-gray-500 text-sm">
            Don&#39;t use banking for your business${" "}
            <button
              onClick={() => setShowConnectModal(false)}
              className="text-blue-600 hover:underline"
            >
              Skip
            </button>
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <button className="flex items-center justify-center w-full text-blue-600 hover:text-blue-700">
            <div className="w-4 h-4 bg-blue-600 rounded-full mr-2 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            Watch how to connect your bank account to RoboBooks
          </button>
        </div>
      </div>
    </div>
  );

  // Render import wizard content
  const renderImportContent = () => {
    if (!showImportWizard) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleImportBack}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Import Statements for {importData.accountName || "Account"}
              </h1>
              <p className="text-gray-600">
                Import your bank statements to automatically categorize
                transactions
              </p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-8">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  step === importStep
                    ? "border-blue-500 bg-blue-500 text-white"
                    : step < importStep
                    ? "border-green-500 bg-green-500 text-white"
                    : "border-gray-300 bg-white text-gray-500"
                }`}
              >
                {step < importStep ? (
                  <CheckCircleIcon className="h-5 w-5" />
                ) : (
                  step
                )}
              </div>
              <span
                className={`ml-2 text-sm font-medium ${
                  step === importStep ? "text-blue-600" : "text-gray-500"
                }`}
              >
                {step === 1
                  ? "Configure"
                  : step === 2
                  ? "Map Fields"
                  : "Preview"}
              </span>
              {step < 3 && (
                <div
                  className={`w-16 h-0.5 ml-2 ${
                    step < importStep ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Import Wizard Content */}
        <BankStatementImport
          step={importStep}
          importData={importData}
          setImportData={setImportData}
          onNext={handleImportNext}
          onBack={handleImportBack}
          onComplete={async () => {
            try {
              // Remove any existing processing toasts
              removeToastsByType('info');
              
              // Show processing toast
              addToast({
                type: 'info',
                title: 'Processing...',
                message: 'Importing bank statement and processing transactions...',
                duration: 0 // Don't auto-dismiss processing toast
              });
              
              setShowImportWizard(false);
              setImportStep(1);
              setActiveTab("transactions");
              
              // Refresh transactions to show the newly imported ones
              await refreshTransactions();
              
              // Remove processing toast
              removeToastsByType('info');
              
              // Show success toast
              addToast({
                title: "Success",
                message: "Bank statement imported successfully! Transactions are now available.",
                type: "success",
                duration: 5000,
              });
            } catch (error: any) {
              // Remove processing toast on error
              removeToastsByType('info');
              addToast({
                type: 'error',
                title: 'Import Failed',
                message: error.message || 'Failed to import bank statement',
                duration: 5000,
              });
            }
          }}
        />
      </div>
    );
  };

  // Render normal tab content
  const renderTabContent = () => {
    if (showImportWizard) return null;

    switch (activeTab) {
      case "overview":
        return <BankingOverview />;
      case "accounts":
        return <BankAccountManager />;
      case "transactions":
        return <TransactionManager />;
      case "reconciliation":
        return <BankReconciliation />;
      default:
        return <BankingOverview />;
    }
  };

  // Prevent hydration mismatch by not rendering until hydrated
  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      {!showImportWizard && (
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            {/* Back Button */}
            <button
              onClick={() => router.push("/dashboard")}
              className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
              aria-label="Go back to Dashboard"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
            </button>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">Banking</h1>
              <p className="text-gray-600">
                Manage your bank accounts and transactions
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleImportStatement}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <DocumentArrowUpIcon className="h-5 w-5" />
              Import Statement
            </button>
            <button
              onClick={() => {
                setActiveTab("accounts");
                setTimeout(() => {
                  window.dispatchEvent(new Event("open-add-bank-account"));
                }, 0);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Connect Bank Account
            </button>
          </div>
        </div>
      )}

      {/* Tabs - Only show when not in import wizard */}
      {!showImportWizard && (
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
      )}

      {/* Content Area */}
      {renderImportContent()}
      {renderTabContent()}

      {/* Modals */}
      {showConnectModal && <ConnectBankModal />}
    </div>
  );
}

// Main export that provides the BankingProvider
export default function BankingPage() {
  return (
    <ModuleAccessGuard moduleName="Banking">
      <BankingProvider>
        <BankingPageContent />
      </BankingProvider>
    </ModuleAccessGuard>
  );
}
