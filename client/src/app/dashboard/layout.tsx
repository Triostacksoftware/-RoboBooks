/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { api } from "../../lib/api";

// Dynamic imports to prevent SSR issues with document references
const Header = dynamic(() => import("./components/Header"), { ssr: false });
const Sidebar = dynamic(() => import("./components/Sidebar"), { ssr: false });

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const authCheckRef = useRef(false);
  const redirectAttemptsRef = useRef(0);

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    // Prevent multiple auth checks
    if (authCheckRef.current) return;
    authCheckRef.current = true;

    const checkAuth = async () => {
      try {
        console.log("🔐 Checking authentication in layout...");

        // Check if we're already on the signin page to prevent loops
        if (
          window.location.pathname === "/signin" ||
          window.location.pathname === "/admin/login"
        ) {
          console.log("🔄 Already on signin page, skipping auth check");
          setIsLoading(false);
          return;
        }

        // Check if user is authenticated by calling the /me endpoint
        const response = await api<{ success: boolean; user?: never }>(
          "/api/auth/me"
        );
        console.log("✅ Layout authentication successful:", response);

        if (response.success) {
          setIsAuthenticated(true);
          setAuthError("");
          redirectAttemptsRef.current = 0; // Reset attempts on success
        } else {
          console.log("❌ Layout authentication failed - no success");
          setAuthError("Authentication failed");
          handleAuthFailure();
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
        handleAuthFailure();
      } finally {
        setIsLoading(false);
      }
    };

    const handleAuthFailure = () => {
      // Clear any invalid tokens
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        console.log("🗑️ Cleared invalid token from localStorage");
      }

      // Only redirect if we haven't tried too many times
      if (redirectAttemptsRef.current < 1) {
        redirectAttemptsRef.current++;
        console.log(
          `🔄 Auth failed, redirect attempt ${redirectAttemptsRef.current}/1`
        );

        // Use window.location.href instead of router.push to force a full page reload
        // This prevents the loop by clearing the React state
        window.location.href = "/signin";
      } else {
        console.log(
          "❌ Max redirect attempts reached, staying on current page"
        );
        // Don't redirect anymore to prevent infinite loops
      }
    };

    checkAuth();
  }, []);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show error if authentication failed and we've exhausted retries
  if (authError && redirectAttemptsRef.current >= 1) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Authentication Error</div>
          <p className="text-gray-600 mb-4">{authError}</p>
          <button
            onClick={() => {
              redirectAttemptsRef.current = 0;
              setAuthError("");
              setIsLoading(true);
              authCheckRef.current = false;
              // Force a fresh auth check
              window.location.reload();
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-2"
          >
            Retry
          </button>
          <button
            onClick={() => (window.location.href = "/signin")}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  // Only render dashboard if authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard – Robo Books</title>
      </Head>
      <div className="flex flex-col h-screen bg-gray-50">
        <Header onToggleSidebar={handleToggleSidebar} />
        <div className="flex flex-1 ">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="flex-1 overflow-hidden">{children}</main>
        </div>
      </div>
    </>
  );
}
