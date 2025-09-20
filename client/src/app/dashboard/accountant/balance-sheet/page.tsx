"use client";

import React, { useState, useEffect } from "react";
import ModuleAccessGuard from "@/components/ModuleAccessGuard";
import { useRouter } from "next/navigation";
import {
  Scale,
  Calendar,
  Download,
  RefreshCw,
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
} from "lucide-react";
import { useToast } from "../../../../contexts/ToastContext";
import { formatCurrency } from "@/utils/currency";

interface BalanceSheetData {
  asOfDate: string;
  assets: {
    currentAssets: Array<{
      _id: string;
      name: string;
      balance: number;
    }>;
    fixedAssets: Array<{
      _id: string;
      name: string;
      balance: number;
    }>;
    otherAssets: Array<{
      _id: string;
      name: string;
      balance: number;
    }>;
    totalAssets: number;
  };
  liabilities: {
    currentLiabilities: Array<{
      _id: string;
      name: string;
      balance: number;
    }>;
    longTermLiabilities: Array<{
      _id: string;
      name: string;
      balance: number;
    }>;
    otherLiabilities: Array<{
      _id: string;
      name: string;
      balance: number;
    }>;
    totalLiabilities: number;
  };
  equity: {
    accounts: Array<{
      _id: string;
      name: string;
      balance: number;
    }>;
    netProfit: number;
    totalEquity: number;
  };
  totals: {
    totalAssets: number;
    totalLiabilitiesAndEquity: number;
  };
}

const BalanceSheetPage = () => {
  const router = useRouter();
  const [reportData, setReportData] = useState<BalanceSheetData | null>(null);
  const [loading, setLoading] = useState(false);
  const [asOfDate, setAsOfDate] = useState(() => {
    const now = new Date();
    return now.toISOString().split("T")[0];
  });
  const { showToast } = useToast();

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/accounting-reports/balance-sheet?asOfDate=${asOfDate}`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch report");
      }

      const result = await response.json();
      setReportData(result.data);
    } catch (error) {
      console.error("Error fetching report:", error);
      showToast("Failed to fetch Balance Sheet report", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [asOfDate]);

  const handleGenerateReport = () => {
    fetchReport();
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    showToast("Export functionality coming soon", "info");
  };

  const renderAccountList = (
    accounts: Array<{ _id: string; name: string; balance: number }>,
    title: string
  ) => (
    <div className="space-y-2">
      <h4 className="font-medium text-gray-900">{title}</h4>
      {accounts.length > 0 ? (
        accounts.map((account) => (
          <div
            key={account._id}
            className="flex justify-between items-center text-sm"
          >
            <span className="text-gray-700">{account.name}</span>
            <span className="font-medium">
              {formatCurrency(account.balance)}
            </span>
          </div>
        ))
      ) : (
        <div className="text-sm text-gray-500 italic">No accounts</div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/dashboard/accountant")}
                className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
              >
                &lt; Back to Accountant
              </button>
              <div className="flex items-center">
                <Scale className="h-8 w-8 text-blue-600 mr-3" />
                <h1 className="text-2xl font-bold text-gray-900">
                  Balance Sheet
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleExport}
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center"
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </button>
              <button
                onClick={handleGenerateReport}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Generate Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Date Selector */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-4">
            <Calendar className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              As of Date:
            </span>
            <input
              type="date"
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Generating report...</p>
          </div>
        ) : reportData ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Assets Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                    ASSETS
                  </h2>
                </div>
                <div className="p-6 space-y-6">
                  {renderAccountList(
                    reportData.assets.currentAssets,
                    "Current Assets"
                  )}
                  {renderAccountList(
                    reportData.assets.fixedAssets,
                    "Fixed Assets"
                  )}
                  {renderAccountList(
                    reportData.assets.otherAssets,
                    "Other Assets"
                  )}

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900">
                        Total Assets
                      </span>
                      <span className="font-bold text-green-600 text-lg">
                        {formatCurrency(reportData.assets.totalAssets)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Liabilities & Equity Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <TrendingDown className="h-5 w-5 text-red-600 mr-2" />
                    LIABILITIES & EQUITY
                  </h2>
                </div>
                <div className="p-6 space-y-6">
                  {renderAccountList(
                    reportData.liabilities.currentLiabilities,
                    "Current Liabilities"
                  )}
                  {renderAccountList(
                    reportData.liabilities.longTermLiabilities,
                    "Long Term Liabilities"
                  )}
                  {renderAccountList(
                    reportData.liabilities.otherLiabilities,
                    "Other Liabilities"
                  )}

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900">
                        Total Liabilities
                      </span>
                      <span className="font-bold text-red-600">
                        {formatCurrency(
                          reportData.liabilities.totalLiabilities
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Equity</h4>
                    {reportData.equity.accounts.map((account) => (
                      <div
                        key={account._id}
                        className="flex justify-between items-center text-sm"
                      >
                        <span className="text-gray-700">{account.name}</span>
                        <span className="font-medium">
                          {formatCurrency(account.balance)}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-700">Net Profit</span>
                      <span
                        className={`font-medium ${
                          reportData.equity.netProfit >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {formatCurrency(reportData.equity.netProfit)}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 pt-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-900">
                          Total Equity
                        </span>
                        <span className="font-bold text-blue-600">
                          {formatCurrency(reportData.equity.totalEquity)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900">
                        Total Liabilities & Equity
                      </span>
                      <span className="font-bold text-gray-900 text-lg">
                        {formatCurrency(
                          reportData.totals.totalLiabilitiesAndEquity
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Section */}
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
                  SUMMARY
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(reportData.totals.totalAssets)}
                    </div>
                    <div className="text-sm text-gray-600">Total Assets</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {formatCurrency(reportData.liabilities.totalLiabilities)}
                    </div>
                    <div className="text-sm text-gray-600">
                      Total Liabilities
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(reportData.equity.totalEquity)}
                    </div>
                    <div className="text-sm text-gray-600">Total Equity</div>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-500 text-center">
                  <p>
                    As of: {new Date(reportData.asOfDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <Scale className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Report Data
            </h3>
            <p className="text-gray-600">
              Generate a report to see your Balance Sheet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Wrapped with access guard
const BalanceSheetPageWithGuard = () => (
  <ModuleAccessGuard moduleName="Accountant">
    <BalanceSheetPage />
  </ModuleAccessGuard>
);

export default BalanceSheetPageWithGuard;
