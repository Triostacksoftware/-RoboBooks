"use client";
import React, { useState, useEffect } from "react";
import { useToast } from "../../../../contexts/ToastContext";

interface AuditEntry {
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

interface AuditTrailPanelProps {
  entityId: string;
  entityType: string;
}

export default function AuditTrailPanel({ entityId, entityType }: AuditTrailPanelProps) {
  const [auditTrail, setAuditTrail] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { showToast } = useToast();

  const fetchAuditTrail = async () => {
    try {
      setLoading(true);
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
      const response = await fetch(
        `${backendUrl}/api/audit-trail/entity/${entityType}/${entityId}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch audit trail");
      }

      const result = await response.json();
      setAuditTrail(result.data || []);
    } catch (error) {
      console.error("Error fetching audit trail:", error);
      showToast("Failed to load audit trail", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (expanded && entityId) {
      fetchAuditTrail();
    }
  }, [expanded, entityId]);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
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
      default:
        return "text-gray-600";
    }
  };

  if (!entityId) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Activity History
        </h3>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          {expanded ? "Hide" : "Show"} History
        </button>
      </div>

      {expanded && (
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : auditTrail.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No activity history found for this document.
            </p>
          ) : (
            <div className="space-y-3">
              {auditTrail.map((entry) => (
                <div
                  key={entry._id}
                  className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-shrink-0">
                    <span className="text-lg">{getActionIcon(entry.action)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className={`font-medium ${getActionColor(entry.action)}`}>
                        {entry.action.charAt(0).toUpperCase() + entry.action.slice(1)}
                      </span>
                      <span className="text-sm text-gray-500">
                        by {entry.user?.name || entry.user?.email || "Unknown User"}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatTimestamp(entry.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">
                      {entry.details.message}
                    </p>
                    {entry.ipAddress && (
                      <p className="text-xs text-gray-500 mt-1">
                        IP: {entry.ipAddress}
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        entry.status === "success"
                          ? "bg-green-100 text-green-800"
                          : entry.status === "failure"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {entry.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
