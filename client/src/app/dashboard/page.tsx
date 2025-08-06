"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../lib/api";
import HomeTabs from "./home/HomeTabs";
import MetricCard from "./home/MetricCard";
import CashFlow from "./home/CashFlow";
import IncomeExpense from "./home/IncomeExpense";
import TopExpenses from "./home/TopExpenses";
import Projects from "./home/Projects";
import BankAndCards from "./home/BankAndCards";
import Watchlist from "./home/Watchlist";
import Footer from "./home/Footer";

export default function DashboardHome() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("🔐 Checking authentication...");
        // Check if user is authenticated by calling the /me endpoint
        const response = await api<{ success: boolean; user?: any }>(
          "/api/auth/me"
        );
        console.log("✅ Authentication successful:", response);
        if (response.success) {
          setIsAuthenticated(true);
          setAuthError("");
        } else {
          console.log("❌ Authentication failed - no success");
          setAuthError("Authentication failed");
          router.push("/signin");
        }
      } catch (error: any) {
        console.error("❌ Authentication check failed:", error);
        setAuthError(error.message || "Authentication failed");
        // If there's an error (like 401), redirect to signin
        router.push("/signin");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error if authentication failed
  if (authError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Authentication Error</div>
          <p className="text-gray-600 mb-4">{authError}</p>
          <button
            onClick={() => router.push("/signin")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  // Only render dashboard if authenticated
  if (!isAuthenticated) {
    return null; // This will redirect to signin
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 md:px-8 lg:px-12 pb-10">
      {/* Header Tabs */}
      <HomeTabs />

      {/* Row 1: Receivables & Payables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <MetricCard
          title="Total Receivables"
          subtitle="Total Unpaid Invoices ₹0.00"
          current="₹0.00"
          overdue="₹0.00"
        />
        <MetricCard
          title="Total Payables"
          subtitle="Total Unpaid Bills ₹0.00"
          current="₹0.00"
          overdue="₹0.00"
        />
      </div>

      {/* Row 2: Cash Flow, Income/Expense, Top Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="col-span-1">
          <CashFlow />
        </div>
        <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <IncomeExpense />
          <TopExpenses />
        </div>
      </div>

      {/* Row 3: Projects & Bank and Credit Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Projects />
        <BankAndCards />
      </div>

      {/* Row 4: Account Watchlist */}
      <div className="mb-8">
        <Watchlist />
      </div>

      {/* Footer with info, links, QR, etc. */}
      <Footer />
    </div>
  );
}
