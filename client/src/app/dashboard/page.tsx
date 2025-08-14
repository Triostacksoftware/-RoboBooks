/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../lib/api";
import HomeTabs from "./home/HomeTabs";

// Add type for API response
interface AuthMeResponse {
  success: boolean;
  user?: {
    companyName?: string;
    // add other user fields as needed
  };
}

export default function DashboardHome() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [companyName, setCompanyName] = useState<string | undefined>(undefined);
  // LIFT activeTab state up
  const [activeTab, setActiveTab] = useState<"tabular" | "graphical">(
    "tabular"
  );

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("🔐 Checking authentication...");
        // Check if user is authenticated by calling the /me endpoint
        const response = await api<AuthMeResponse>("/api/auth/me");
        console.log("✅ Authentication successful:", response);
        if (response.success) {
          setIsAuthenticated(true);
          setAuthError("");
          setCompanyName(response.user?.companyName);
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
      <HomeTabs
        companyName={companyName}
        onTabChange={(tab) => setActiveTab(tab as "tabular" | "graphical")}
      />

      {/* Tab content is now handled by the HomeTabs component */}
      {/* The TabularView and GraphicalView components are rendered within HomeTabs */}
    </div>
  );
}
