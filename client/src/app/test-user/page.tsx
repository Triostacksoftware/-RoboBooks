"use client";

import React, { useState, useEffect } from "react";

export default function TestUserPage() {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkUserInfo();
  }, []);

  const checkUserInfo = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check localStorage
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      console.log("🔍 Token:", token);
      console.log("🔍 User Data:", userData);

      let user = null;
      if (userData) {
        try {
          user = JSON.parse(userData);
        } catch (e) {
          console.warn("Could not parse user data");
        }
      }

      // Try to get user info from API
      let apiUser = null;
      try {
        const response = await fetch("http://localhost:5000/api/auth/me", {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          apiUser = data;
        }
      } catch (err) {
        console.warn("API call failed:", err);
      }

      setUserInfo({
        token: token ? "Present" : "Not found",
        localStorageUser: user,
        apiUser: apiUser,
        userId:
          user?._id ||
          user?.id ||
          apiUser?.user?._id ||
          apiUser?.user?.id ||
          "Not found",
      });
    } catch (err) {
      console.error("❌ Error:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const testSaveWithUserId = async () => {
    try {
      const userId = userInfo?.userId;
      if (!userId || userId === "Not found") {
        alert("No user ID found!");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/module-preferences/preferences",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            preferences: [
              {
                name: "home",
                label: "Home",
                description: "Dashboard overview",
                isEnabled: false,
              },
            ],
            userId: userId,
          }),
        }
      );

      const data = await response.json();
      console.log("Save response:", data);
      alert(
        `Save result: ${response.status} - ${data.message || data.success}`
      );
    } catch (error) {
      console.error("Save error:", error);
      alert("Save failed: " + error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading user info...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={checkUserInfo}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            User Authentication Test
          </h1>

          <div className="space-y-4 mb-6">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded">
              <h3 className="font-medium text-blue-800 mb-2">
                User Information
              </h3>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Token:</strong> {userInfo?.token}
                </p>
                <p>
                  <strong>User ID:</strong> {userInfo?.userId}
                </p>
                <p>
                  <strong>LocalStorage User:</strong>
                </p>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                  {JSON.stringify(userInfo?.localStorageUser, null, 2)}
                </pre>
                <p>
                  <strong>API User:</strong>
                </p>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                  {JSON.stringify(userInfo?.apiUser, null, 2)}
                </pre>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={checkUserInfo}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Refresh
            </button>
            <button
              onClick={testSaveWithUserId}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
            >
              Test Save with User ID
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
