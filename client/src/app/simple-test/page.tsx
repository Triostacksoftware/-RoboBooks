"use client";

import React, { useState, useEffect } from "react";

interface ModulePreference {
  name: string;
  label: string;
  description: string;
  isEnabled: boolean;
}

export default function SimpleTestPage() {
  const [modules, setModules] = useState<ModulePreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("🌐 Making direct fetch request...");
      
      const response = await fetch("http://localhost:5000/api/module-preferences/test", {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      
      console.log("🌐 Response status:", response.status);
      console.log("🌐 Response headers:", Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("🌐 Response data:", data);
      
      if (data.success && data.data) {
        setModules(data.data);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("❌ Error:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading modules...</p>
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
            onClick={loadModules}
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
            Simple Test - Direct API Call
          </h1>
          
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded">
            <p className="text-green-800">✅ Successfully loaded {modules.length} modules!</p>
          </div>
          
          <div className="space-y-4 mb-6">
            {modules.map((module) => (
              <div
                key={module.name}
                className="flex items-start space-x-4 p-4 rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  id={module.name}
                  checked={module.isEnabled}
                  disabled
                  className="mt-1 w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <div className="flex-1">
                  <label
                    htmlFor={module.name}
                    className="text-base font-medium text-gray-900 cursor-pointer"
                  >
                    {module.label}
                  </label>
                  <p className="text-sm text-gray-600 mt-1">
                    {module.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={loadModules}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Reload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
