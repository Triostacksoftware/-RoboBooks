"use client";

import React, { useState, useEffect } from "react";
import ModuleAccessGuard from "@/components/ModuleAccessGuard";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  Calendar,
  Download,
  RefreshCw,
  DollarSign,
  TrendingDown,
  BarChart3,
} from "lucide-react";
import { useToast } from "../../../../contexts/ToastContext";
import { formatCurrency } from "@/utils/currency";

interface ProfitLossData {
  period: {
    startDate: string;
    endDate: string;
  };
  income: {
    sales: number;
    otherIncome: number;
    totalIncome: number;
  };
  expenses: {
    items: Array<{
      accountId: string;
      accountName: string;
      amount: number;
    }>;
    totalExpenses: number;
  };
  netProfit: number;
  cashBasis: boolean;
}

const ProfitLossPage = () => {
  const router = useRouter();
  const [reportData, setReportData] = useState<ProfitLossData | null>(null);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return startOfMonth.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const now = new Date();
    return now.toISOString().split("T")[0];
  });
  const { showToast } = useToast();

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/accounting-reports/profit-loss?startDate=${startDate}&endDate=${endDate}`,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log(response);

      if (!response.ok) {
        throw new Error("Failed to fetch report");
      }

      const result = await response.json();
      setReportData(result.data);
    } catch (error) {
      console.error("Error fetching report:", error);
      showToast("Failed to fetch Profit & Loss report", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [startDate, endDate]);

  const handleGenerateReport = () => {
    fetchReport();
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    showToast("Export functionality coming soon", "info");
  };

  // Process expense data from backend
  const expenseCategories = {
    directExpense: reportData?.expenses?.items?.filter(
      (item) =>
        item.accountName?.toLowerCase().includes("purchase") ||
        item.accountName?.toLowerCase().includes("wages") ||
        item.accountName?.toLowerCase().includes("charges")
    ) || [
      { name: "Additional Charges (purchases)", amount: 0 },
      { name: "Purchase Accounts", amount: 0 },
      { name: "Wages", amount: 0 },
    ],
    indirectExpense: reportData?.expenses?.items?.filter(
      (item) =>
        !item.accountName?.toLowerCase().includes("purchase") &&
        !item.accountName?.toLowerCase().includes("wages") &&
        !item.accountName?.toLowerCase().includes("charges")
    ) || [
      { name: "Personal Care", amount: 0 },
      { name: "Shopping", amount: 0 },
      { name: "Round Off (purchase)", amount: 0 },
      { name: "Travel", amount: 0 },
      { name: "Item Discount", amount: 0 },
    ],
  };

  // Process income data from backend
  const incomeCategories = {
    directIncome: [
      { name: "Sales Accounts", amount: reportData?.income?.sales || 0 },
      { name: "Additional Charges", amount: 0 },
    ],
    indirectIncome: [
      { name: "Round Off", amount: 0 },
      { name: "Cash Discount (received)", amount: 0 },
      { name: "Interest Received", amount: 0 },
      {
        name: "Other Indirect Income",
        amount: reportData?.income?.otherIncome || 0,
      },
      { name: "Item Discount (received)", amount: 0 },
    ],
  };

  // Calculate net profit
  const netProfit = reportData?.netProfit || 0;

  const renderExpenseItem = (
    item: { name?: string; accountName?: string; amount: number },
    index: number
  ) => (
    <div
      key={`expense-${item.accountName || item.name}-${index}`}
      className="flex justify-between items-center py-1"
    >
      <span className="text-sm text-gray-700">
        {item.accountName || item.name}
      </span>
      <span className="text-sm font-medium text-red-600">
        {formatCurrency(item.amount)} DR
      </span>
    </div>
  );

  const renderIncomeItem = (
    item: { name?: string; accountName?: string; amount: number },
    index: number
  ) => (
    <div
      key={`income-${item.accountName || item.name}-${index}`}
      className="flex justify-between items-center py-1"
    >
      <span className="text-sm text-gray-700">
        {item.accountName || item.name}
      </span>
      <span className="text-sm font-medium text-green-600">
        {formatCurrency(item.amount)} CR
      </span>
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
                <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
                <h1 className="text-2xl font-bold text-gray-900">
                  Profit & Loss Report v2
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                <option>My Company</option>
              </select>
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

      {/* Date Range Selector */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-4">
            <Calendar className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              Report Period:
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="text-sm text-gray-500">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Generating report...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* EXPENSE Column */}
              <div className="border-r border-gray-200">
                <div className="bg-red-50 px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-red-800 flex items-center">
                    <TrendingDown className="h-5 w-5 text-red-600 mr-2" />
                    EXPENSE
                  </h2>
                </div>
                <div className="p-6 space-y-6">
                  {/* Direct Expense */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
                      Direct Expense
                    </h3>
                    <div className="space-y-1">
                      {expenseCategories.directExpense.map((item, index) =>
                        renderExpenseItem(item, index)
                      )}
                    </div>
                  </div>

                  {/* Indirect Expense */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
                      Indirect Expense
                    </h3>
                    <div className="space-y-1">
                      {expenseCategories.indirectExpense.map((item, index) =>
                        renderExpenseItem(item, index)
                      )}
                    </div>
                  </div>

                  {/* Opening Stock */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center py-1">
                      <span className="text-sm font-medium text-gray-900">
                        Opening Stock
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(0)}
                      </span>
                    </div>
                  </div>

                  {/* Net Profit */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center py-1">
                      <span className="text-sm font-medium text-gray-900">
                        Net Profit
                      </span>
                      <span
                        className={`text-sm font-medium ${
                          netProfit >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {formatCurrency(Math.abs(netProfit))}{" "}
                        {netProfit >= 0 ? "CR" : "DR"}
                      </span>
                    </div>
                  </div>

                  {/* Total Expense */}
                  <div className="border-t-2 border-gray-300 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900">
                        Total (Expense)
                      </span>
                      <span className="font-bold text-red-600 text-lg">
                        {formatCurrency(0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* INCOME Column */}
              <div>
                <div className="bg-green-50 px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-green-800 flex items-center">
                    <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                    INCOME
                  </h2>
                </div>
                <div className="p-6 space-y-6">
                  {/* Direct Income */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
                      Direct Income
                    </h3>
                    <div className="space-y-1">
                      {incomeCategories.directIncome.map((item, index) =>
                        renderIncomeItem(item, index)
                      )}
                    </div>
                  </div>

                  {/* Indirect Income */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
                      Indirect Income
                    </h3>
                    <div className="space-y-1">
                      {incomeCategories.indirectIncome.map((item, index) =>
                        renderIncomeItem(item, index)
                      )}
                    </div>
                  </div>

                  {/* Total Income */}
                  <div className="border-t-2 border-gray-300 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900">
                        Total (Income)
                      </span>
                      <span className="font-bold text-green-600 text-lg">
                        {formatCurrency(0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Wrapped with access guard
const ProfitLossPageWithGuard = () => (
  <ModuleAccessGuard moduleName="Accountant">
    <ProfitLossPage />
  </ModuleAccessGuard>
);

export default ProfitLossPageWithGuard;
