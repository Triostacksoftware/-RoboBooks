"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  CogIcon,
  ShieldCheckIcon,
  BellIcon,
  UserIcon,
  KeyIcon,
  GlobeAltIcon,
  DatabaseIcon,
  CloudIcon,
} from "@heroicons/react/24/outline";

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    general: {
      siteName: "RoboBooks Admin",
      siteDescription: "Business management platform",
      timezone: "UTC",
      language: "English"
    },
    security: {
      twoFactorAuth: true,
      sessionTimeout: 30,
      passwordPolicy: "strong",
      ipWhitelist: []
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      reportFrequency: "weekly"
    },
    system: {
      maintenanceMode: false,
      debugMode: false,
      backupFrequency: "daily",
      logRetention: 30
    }
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      // Mock data for now - replace with actual API call
      setSettings(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const tabs = [
    { id: "general", name: "General", icon: CogIcon },
    { id: "security", name: "Security", icon: ShieldCheckIcon },
    { id: "notifications", name: "Notifications", icon: BellIcon },
    { id: "system", name: "System", icon: DatabaseIcon },
  ];

  const SettingSection = ({ title, description, children }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      {children}
    </div>
  );

  const SettingItem = ({ label, description, children }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <div className="ml-4">
        {children}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage system configuration and preferences</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "general" && (
            <div className="space-y-6">
              <SettingSection
                title="Site Information"
                description="Configure basic site settings and appearance"
              >
                <div className="space-y-4">
                  <SettingItem
                    label="Site Name"
                    description="The name displayed in the browser title and admin panel"
                  >
                    <input
                      type="text"
                      value={settings.general.siteName}
                      onChange={(e) => handleSettingChange("general", "siteName", e.target.value)}
                      className="w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </SettingItem>
                  <SettingItem
                    label="Site Description"
                    description="Brief description of your platform"
                  >
                    <input
                      type="text"
                      value={settings.general.siteDescription}
                      onChange={(e) => handleSettingChange("general", "siteDescription", e.target.value)}
                      className="w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </SettingItem>
                  <SettingItem
                    label="Timezone"
                    description="Default timezone for the system"
                  >
                    <select
                      value={settings.general.timezone}
                      onChange={(e) => handleSettingChange("general", "timezone", e.target.value)}
                      className="w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                    </select>
                  </SettingItem>
                  <SettingItem
                    label="Language"
                    description="Default language for the interface"
                  >
                    <select
                      value={settings.general.language}
                      onChange={(e) => handleSettingChange("general", "language", e.target.value)}
                      className="w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                    </select>
                  </SettingItem>
                </div>
              </SettingSection>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <SettingSection
                title="Security Settings"
                description="Configure security and authentication settings"
              >
                <div className="space-y-4">
                  <SettingItem
                    label="Two-Factor Authentication"
                    description="Require 2FA for admin accounts"
                  >
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.security.twoFactorAuth}
                        onChange={(e) => handleSettingChange("security", "twoFactorAuth", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </SettingItem>
                  <SettingItem
                    label="Session Timeout"
                    description="Minutes before automatic logout"
                  >
                    <select
                      value={settings.security.sessionTimeout}
                      onChange={(e) => handleSettingChange("security", "sessionTimeout", parseInt(e.target.value))}
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={120}>2 hours</option>
                    </select>
                  </SettingItem>
                  <SettingItem
                    label="Password Policy"
                    description="Minimum password strength requirements"
                  >
                    <select
                      value={settings.security.passwordPolicy}
                      onChange={(e) => handleSettingChange("security", "passwordPolicy", e.target.value)}
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="basic">Basic</option>
                      <option value="strong">Strong</option>
                      <option value="very-strong">Very Strong</option>
                    </select>
                  </SettingItem>
                </div>
              </SettingSection>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6">
              <SettingSection
                title="Notification Preferences"
                description="Configure how and when you receive notifications"
              >
                <div className="space-y-4">
                  <SettingItem
                    label="Email Notifications"
                    description="Receive notifications via email"
                  >
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.emailNotifications}
                        onChange={(e) => handleSettingChange("notifications", "emailNotifications", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </SettingItem>
                  <SettingItem
                    label="SMS Notifications"
                    description="Receive notifications via SMS"
                  >
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.smsNotifications}
                        onChange={(e) => handleSettingChange("notifications", "smsNotifications", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </SettingItem>
                  <SettingItem
                    label="Push Notifications"
                    description="Receive browser push notifications"
                  >
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.pushNotifications}
                        onChange={(e) => handleSettingChange("notifications", "pushNotifications", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </SettingItem>
                  <SettingItem
                    label="Report Frequency"
                    description="How often to generate automated reports"
                  >
                    <select
                      value={settings.notifications.reportFrequency}
                      onChange={(e) => handleSettingChange("notifications", "reportFrequency", e.target.value)}
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </SettingItem>
                </div>
              </SettingSection>
            </div>
          )}

          {activeTab === "system" && (
            <div className="space-y-6">
              <SettingSection
                title="System Configuration"
                description="Advanced system settings and maintenance options"
              >
                <div className="space-y-4">
                  <SettingItem
                    label="Maintenance Mode"
                    description="Enable maintenance mode to restrict access"
                  >
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.system.maintenanceMode}
                        onChange={(e) => handleSettingChange("system", "maintenanceMode", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </SettingItem>
                  <SettingItem
                    label="Debug Mode"
                    description="Enable debug logging for troubleshooting"
                  >
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.system.debugMode}
                        onChange={(e) => handleSettingChange("system", "debugMode", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </SettingItem>
                  <SettingItem
                    label="Backup Frequency"
                    description="How often to create system backups"
                  >
                    <select
                      value={settings.system.backupFrequency}
                      onChange={(e) => handleSettingChange("system", "backupFrequency", e.target.value)}
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </SettingItem>
                  <SettingItem
                    label="Log Retention"
                    description="Days to keep system logs"
                  >
                    <select
                      value={settings.system.logRetention}
                      onChange={(e) => handleSettingChange("system", "logRetention", parseInt(e.target.value))}
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value={7}>7 days</option>
                      <option value={30}>30 days</option>
                      <option value={90}>90 days</option>
                      <option value={365}>1 year</option>
                    </select>
                  </SettingItem>
                </div>
              </SettingSection>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
          Save Changes
        </button>
      </div>
    </div>
  );
}
