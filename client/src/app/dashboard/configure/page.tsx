"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useToast } from "../../../contexts/ToastContext";
import { useModulePreferences } from "../../../contexts/ModulePreferenceContext";

interface ModulePreference {
  name: string;
  label: string;
  description: string;
  isEnabled: boolean;
}

export default function ConfigurePage() {
  const router = useRouter();
  const [modulePreferences, setModulePreferences] = useState<ModulePreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();
  const { refreshPreferences } = useModulePreferences();

  // Load user's module preferences on component mount
  useEffect(() => {
    loadModulePreferences();
  }, []);

  const loadModulePreferences = async () => {
    try {
      setLoading(true);
      
      // Direct API call to get module preferences
      const response = await fetch("http://localhost:5000/api/module-preferences/preferences", {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setModulePreferences(data.data);
    } catch (error) {
      console.error('Error loading module preferences:', error);
      showToast('Failed to load module preferences', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleModuleToggle = (moduleName: string) => {
    setModulePreferences((prev) =>
      prev.map((module) =>
        module.name === moduleName
          ? { ...module, isEnabled: !module.isEnabled }
          : module
      )
    );
  };

  const handleSavePreferences = async () => {
    try {
      setSaving(true);
      
      // Direct API call to save module preferences
      const response = await fetch("http://localhost:5000/api/module-preferences/preferences", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          preferences: modulePreferences
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      await refreshPreferences(); // Refresh the global context
      showToast('Module preferences saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving module preferences:', error);
      showToast('Failed to save module preferences', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelPreferences = () => {
    // Reset to original preferences
    loadModulePreferences();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Configure Features
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Enable the modules required for your business.
                </p>
              </div>
              <button
                onClick={() => router.push('/dashboard')}
                className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Information Box */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-white text-sm font-bold">i</span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-blue-800 mb-1">
                    Default Features
                  </h3>
                  <p className="text-sm text-blue-700">
                    Invoices, Credit Notes, Expenses, Bills, Recurring Invoices
                    and more are available by default in Robo Books.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Features List */}
          <div className="px-6 py-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {modulePreferences.map((module) => (
                  <div
                    key={module.name}
                    className="flex items-start space-x-4 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
                  >
                    <input
                      type="checkbox"
                      id={module.name}
                      checked={module.isEnabled}
                      onChange={() => handleModuleToggle(module.name)}
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
            )}
          </div>

          {/* Note */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <p className="text-sm text-gray-600">
                Note: You can change these details later in Settings, if needed.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelPreferences}
                disabled={saving}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePreferences}
                disabled={saving || loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 flex items-center space-x-2"
              >
                {saving && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
