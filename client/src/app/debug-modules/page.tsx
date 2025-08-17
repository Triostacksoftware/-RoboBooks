"use client";

import React, { useState, useEffect } from "react";
import { useModulePreferences } from "../../contexts/ModulePreferenceContext";

export default function DebugModulesPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { modulePreferences, isModuleEnabled, refreshPreferences } =
    useModulePreferences();

  useEffect(() => {
    checkDebugInfo();
  }, []);

  const checkDebugInfo = async () => {
    try {
      setLoading(true);

      // Test API calls
      const getResponse = await fetch(
        "http://localhost:5000/api/module-preferences/preferences",
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      const getData = await getResponse.json();

      // Test save with some disabled modules
      const testPreferences = [
        {
          name: "home",
          label: "Home",
          description: "Dashboard overview",
          isEnabled: false,
        },
        {
          name: "items",
          label: "Items",
          description: "Manage products",
          isEnabled: true,
        },
      ];

      const saveResponse = await fetch(
        "http://localhost:5000/api/module-preferences/preferences",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ preferences: testPreferences }),
        }
      );

      const saveData = await saveResponse.json();

      setDebugInfo({
        getResponse: {
          status: getResponse.status,
          data: getData,
        },
        saveResponse: {
          status: saveResponse.status,
          data: saveData,
        },
        contextPreferences: modulePreferences,
        isModuleEnabled: {
          home: isModuleEnabled("home"),
          items: isModuleEnabled("items"),
          sales: isModuleEnabled("sales"),
        },
      });
    } catch (error) {
      console.error("Debug error:", error);
      setDebugInfo({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testRefresh = async () => {
    await refreshPreferences();
    setTimeout(checkDebugInfo, 1000); // Wait for refresh to complete
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading debug info...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Module Preferences Debug
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* GET Response */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded">
              <h3 className="font-medium text-blue-800 mb-2">GET Response</h3>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Status:</strong> {debugInfo?.getResponse?.status}
                </p>
                <p>
                  <strong>Data:</strong>
                </p>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
                  {JSON.stringify(debugInfo?.getResponse?.data, null, 2)}
                </pre>
              </div>
            </div>

            {/* SAVE Response */}
            <div className="p-4 bg-green-50 border border-green-200 rounded">
              <h3 className="font-medium text-green-800 mb-2">SAVE Response</h3>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Status:</strong> {debugInfo?.saveResponse?.status}
                </p>
                <p>
                  <strong>Data:</strong>
                </p>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
                  {JSON.stringify(debugInfo?.saveResponse?.data, null, 2)}
                </pre>
              </div>
            </div>

            {/* Context State */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
              <h3 className="font-medium text-yellow-800 mb-2">
                Context State
              </h3>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Module Preferences:</strong>
                </p>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
                  {JSON.stringify(debugInfo?.contextPreferences, null, 2)}
                </pre>
              </div>
            </div>

            {/* Module Enabled Status */}
            <div className="p-4 bg-purple-50 border border-purple-200 rounded">
              <h3 className="font-medium text-purple-800 mb-2">
                Module Enabled Status
              </h3>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Home:</strong>{" "}
                  {debugInfo?.isModuleEnabled?.home
                    ? "✅ Enabled"
                    : "❌ Disabled"}
                </p>
                <p>
                  <strong>Items:</strong>{" "}
                  {debugInfo?.isModuleEnabled?.items
                    ? "✅ Enabled"
                    : "❌ Disabled"}
                </p>
                <p>
                  <strong>Sales:</strong>{" "}
                  {debugInfo?.isModuleEnabled?.sales
                    ? "✅ Enabled"
                    : "❌ Disabled"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={checkDebugInfo}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Refresh Debug Info
            </button>
            <button
              onClick={testRefresh}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Test Context Refresh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
