/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { api } from "../../lib/api";

// Dynamic imports to prevent SSR issues with document references
const Header = dynamic(() => import("./components/Header"), { ssr: false });
const Sidebar = dynamic(() => import("./components/Sidebar"), { ssr: false });
const RightSidebar = dynamic(() => import("./components/RightSidebar"), {
  ssr: false,
});

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("🔐 Checking authentication in layout...");
        // Check if user is authenticated by calling the /me endpoint
        const response = await api<{ success: boolean; user?: never }>(
          "/api/auth/me"
        );
        console.log("✅ Layout authentication successful:", response);
        if (response.success) {
          setIsAuthenticated(true);
          setAuthError("");
        } else {
          console.log("❌ Layout authentication failed - no success");
          setAuthError("Authentication failed");
          router.push("/signin");
        }
      } catch (error: unknown) {
        console.error("❌ Layout authentication check failed:", error);
        let message = "Authentication failed";
        if (
          typeof error === "object" &&
          error !== null &&
          "message" in error &&
          typeof (error as any).message === "string"
        ) {
          message = (error as any).message;
        }
        setAuthError(message);
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
    <>
      <Head>
        <title>Dashboard – Robo Books</title>
      </Head>
      <div className="flex flex-col h-screen bg-gray-50">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          {/* give the main a right margin equal to your RightSidebar's width (e.g. 80px) */}
          <main className="flex-1 overflow-auto mr-20">{children}</main>
          <RightSidebar />
        </div>
      </div>
    </>
  );
}
