"use client";

import { useState, useEffect } from "react";
import { api, clearAuthState } from "@/lib/api";

export default function DebugAuth() {
  const [authStatus, setAuthStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [cookies, setCookies] = useState<string>("");
  const [localStorage, setLocalStorage] = useState<string>("");

  useEffect(() => {
    // Get cookies
    setCookies(document.cookie);

    // Get localStorage
    const lsData: any = {};
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key) {
        lsData[key] = window.localStorage.getItem(key);
      }
    }
    setLocalStorage(JSON.stringify(lsData, null, 2));
  }, []);

  const checkAuth = async () => {
    setLoading(true);
    try {
      const response = await api("/api/auth/me");
      setAuthStatus(response);
    } catch (error: any) {
      setAuthStatus({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const clearAuth = () => {
    clearAuthState();
    setAuthStatus(null);
    setCookies(document.cookie);
    const lsData: any = {};
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key) {
        lsData[key] = window.localStorage.getItem(key);
      }
    }
    setLocalStorage(JSON.stringify(lsData, null, 2));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Authentication Debug</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Auth Status */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Auth Status</h2>
            <button
              onClick={checkAuth}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded mb-4 disabled:opacity-50"
            >
              {loading ? "Checking..." : "Check Auth"}
            </button>
            <button
              onClick={clearAuth}
              className="bg-red-600 text-white px-4 py-2 rounded ml-2"
            >
              Clear Auth
            </button>
            <pre className="bg-gray-100 p-4 rounded mt-4 text-sm overflow-auto">
              {JSON.stringify(authStatus, null, 2)}
            </pre>
          </div>

          {/* Cookies */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Cookies</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {cookies || "No cookies"}
            </pre>
          </div>

          {/* LocalStorage */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">LocalStorage</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {localStorage || "No localStorage data"}
            </pre>
          </div>

          {/* Current URL */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Current URL</h2>
            <p className="bg-gray-100 p-4 rounded text-sm break-all">
              {typeof window !== "undefined"
                ? window.location.href
                : "Loading..."}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Quick Navigation</h2>
          <div className="flex gap-4 flex-wrap">
            <a
              href="/signin"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Go to Sign In
            </a>
            <a
              href="/admin/login"
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Go to Admin Login
            </a>
            <a
              href="/dashboard"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Go to Dashboard
            </a>
            <a
              href="/admin/dashboard"
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Go to Admin Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
