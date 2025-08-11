"use client";
import React, { useState, useEffect } from "react";
import { useToast } from "../../../contexts/ToastContext";

interface ActivityEntry {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  action: string;
  entity: string;
  entityId: string;
  details: {
    message: string;
    [key: string]: any;
  };
  timestamp: string;
  status: string;
  ipAddress?: string;
}

interface ActivityHistoryProps {
  title?: string;
  showFilters?: boolean;
  maxItems?: number;
}

export default function ActivityHistory({ 
  title = "Recent Activity", 
  showFilters = true,
  maxItems = 10 
}: ActivityHistoryProps) {
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    entity: "",
    action: "",
    startDate: "",
    endDate: "",
  });
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const { showToast } = useToast();

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
      
      const queryParams = new URLSearchParams({
        page: "1",
        limit: maxItems.toString(),
        ...(filters.entity && { entity: filters.entity }),
        ...(filters.action && { action: filters.action }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
      });

      const response = await fetch(
        `${backendUrl}/api/audit-trail?${queryParams}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch activities");
      }

      const result = await response.json();
      setActivities(result.data || []);
    } catch (error) {
      console.error("Error fetching activities:", error);
      showToast("Failed to load activity history", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [filters, maxItems]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      entity: "",
      action: "",
      startDate: "",
      endDate: "",
    });
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "create":
        return "➕";
      case "update":
        return "✏️";
      case "delete":
        return "🗑️";
      case "upload":
        return "📤";
      case "download":
        return "📥";
      case "read":
        return "👁️";
      case "login":
        return "🔑";
      case "logout":
        return "🚪";
      default:
        return "📝";
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "create":
        return "text-green-600";
      case "update":
        return "text-blue-600";
      case "delete":
        return "text-red-600";
      case "upload":
        return "text-purple-600";
      case "download":
        return "text-indigo-600";
      case "login":
        return "text-emerald-600";
      case "logout":
        return "text-orange-600";
      default:
        return "text-gray-600";
    }
  };

  const getEntityIcon = (entity: string) => {
    switch (entity) {
      case "document":
        return "📄";
      case "invoice":
        return "🧾";
      case "user":
        return "👤";
      case "account":
        return "💰";
      case "project":
        return "📋";
      case "timesheet":
        return "⏰";
      default:
        return "📝";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {showFilters && (
          <button
            onClick={() => setShowFiltersPanel(!showFiltersPanel)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            {showFiltersPanel ? "Hide" : "Show"} Filters
          </button>
        )}
      </div>

      {showFilters && showFiltersPanel && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Entity Type
              </label>
              <select
                value={filters.entity}
                onChange={(e) => handleFilterChange("entity", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">All Entities</option>
                <option value="document">Document</option>
                <option value="invoice">Invoice</option>
                <option value="user">User</option>
                <option value="account">Account</option>
                <option value="project">Project</option>
                <option value="timesheet">Timesheet</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Action
              </label>
              <select
                value={filters.action}
                onChange={(e) => handleFilterChange("action", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">All Actions</option>
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
                <option value="upload">Upload</option>
                <option value="download">Download</option>
                <option value="login">Login</option>
                <option value="logout">Logout</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange("startDate", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={clearFilters}
              className="text-sm text-gray-600 hover:text-gray-800 font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : activities.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No activity found matching the current filters.
          </p>
        ) : (
          activities.map((activity) => (
            <div
              key={activity._id}
              className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="flex-shrink-0">
                <span className="text-lg">{getActionIcon(activity.action)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className={`font-medium ${getActionColor(activity.action)}`}>
                    {activity.action.charAt(0).toUpperCase() + activity.action.slice(1)}
                  </span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-600 flex items-center">
                    {getEntityIcon(activity.entity)} {activity.entity}
                  </span>
                  <span className="text-gray-500">•</span>
                  <span className="text-sm text-gray-500">
                    by {activity.user?.name || activity.user?.email || "Unknown User"}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-1">
                  {activity.details.message}
                </p>
                <div className="flex items-center space-x-4 text-xs text-gray-400">
                  <span>{formatTimestamp(activity.timestamp)}</span>
                  {activity.ipAddress && (
                    <>
                      <span>•</span>
                      <span>IP: {activity.ipAddress}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex-shrink-0">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    activity.status === "success"
                      ? "bg-green-100 text-green-800"
                      : activity.status === "failure"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {activity.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {activities.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={fetchActivities}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Refresh Activity
          </button>
        </div>
      )}
    </div>
  );
}
