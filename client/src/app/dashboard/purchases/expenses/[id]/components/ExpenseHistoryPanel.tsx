"use client";

import React, { useState, useEffect } from "react";
import { XMarkIcon, DocumentTextIcon, PencilIcon, ClockIcon, UserIcon, ExclamationTriangleIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { Expense, expenseService, ExpenseHistoryEntry } from "@/services/expenseService";

interface ExpenseHistoryPanelProps {
  expense: Expense;
  onClose: () => void;
}

export default function ExpenseHistoryPanel({ expense, onClose }: ExpenseHistoryPanelProps) {
  const [history, setHistory] = useState<ExpenseHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [liveUpdates, setLiveUpdates] = useState(true);
  const [newEntriesCount, setNewEntriesCount] = useState(0);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Fetching expense history for:', expense._id);
      const response = await expenseService.getExpenseHistory(expense._id, {
        limit: 50,
        sortOrder: 'desc'
      });
      console.log('📊 Expense history response:', response);
      console.log('📋 History data:', response.data);
      
      // Check if there are new entries
      const previousCount = history.length;
      const newCount = response.data.length;
      if (newCount > previousCount && previousCount > 0) {
        setNewEntriesCount(newCount - previousCount);
        // Clear the notification after 3 seconds
        setTimeout(() => setNewEntriesCount(0), 3000);
      }
      
      setHistory(response.data);
      setLastRefresh(new Date());
    } catch (err: any) {
      console.error('❌ Error fetching expense history:', err);
      setError('Failed to load expense history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (expense._id) {
      fetchHistory();
    }
  }, [expense._id]);

  // Auto-refresh every 10 seconds (only if live updates are enabled)
  useEffect(() => {
    if (!expense._id || !liveUpdates) return;

    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing expense history...');
      fetchHistory();
    }, 10000); // 10 seconds for more responsive updates

    return () => clearInterval(interval);
  }, [expense._id, liveUpdates]);

  // Listen for expense update and creation events
  useEffect(() => {
    const handleExpenseUpdate = (event: CustomEvent) => {
      console.log('📢 Received expense update event:', event.detail);
      if (event.detail.expenseId === expense._id) {
        console.log('🔄 Refreshing history due to expense update');
        fetchHistory();
      }
    };

    const handleExpenseCreated = (event: CustomEvent) => {
      console.log('📢 Received expense creation event:', event.detail);
      if (event.detail.expenseId === expense._id) {
        console.log('🔄 Refreshing history due to expense creation');
        fetchHistory();
      }
    };

    window.addEventListener('expenseUpdated', handleExpenseUpdate as EventListener);
    window.addEventListener('expenseCreated', handleExpenseCreated as EventListener);
    
    return () => {
      window.removeEventListener('expenseUpdated', handleExpenseUpdate as EventListener);
      window.removeEventListener('expenseCreated', handleExpenseCreated as EventListener);
    };
  }, [expense._id]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return <DocumentTextIcon className="w-4 h-4 text-yellow-600" />;
      case 'updated':
      case 'status_changed':
      case 'amount_changed':
      case 'vendor_changed':
      case 'category_changed':
      case 'payment_method_changed':
      case 'customer_changed':
      case 'project_changed':
      case 'notes_changed':
      case 'billable_changed':
        return <PencilIcon className="w-4 h-4 text-blue-600" />;
      case 'deleted':
        return <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />;
      case 'cloned':
        return <DocumentTextIcon className="w-4 h-4 text-green-600" />;
      case 'receipt_uploaded':
        return <DocumentTextIcon className="w-4 h-4 text-purple-600" />;
      case 'receipt_removed':
        return <ExclamationTriangleIcon className="w-4 h-4 text-orange-600" />;
      case 'converted_to_invoice':
        return <DocumentTextIcon className="w-4 h-4 text-indigo-600" />;
      default:
        return <ClockIcon className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created':
        return 'bg-yellow-100';
      case 'updated':
      case 'status_changed':
      case 'amount_changed':
      case 'vendor_changed':
      case 'category_changed':
      case 'payment_method_changed':
      case 'customer_changed':
      case 'project_changed':
      case 'notes_changed':
      case 'billable_changed':
        return 'bg-blue-100';
      case 'deleted':
        return 'bg-red-100';
      case 'cloned':
        return 'bg-green-100';
      case 'receipt_uploaded':
        return 'bg-purple-100';
      case 'receipt_removed':
        return 'bg-orange-100';
      case 'converted_to_invoice':
        return 'bg-indigo-100';
      default:
        return 'bg-gray-100';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('en-GB'),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    };
  };

  if (loading) {
    return (
      <div className="w-full h-full bg-white border-l border-gray-200 flex flex-col">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">Expense History</h2>
          <button
            onClick={onClose}
            className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
            title="Close"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-500">Loading history...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full bg-white border-l border-gray-200 flex flex-col">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">Expense History</h2>
          <button
            onClick={onClose}
            className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
            title="Close"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-2" />
            <p className="text-red-600 mb-2">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-900">Expense History</h2>
        <div className="flex items-center space-x-2">
          <div className="text-xs text-gray-500">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
          <button
            onClick={() => setLiveUpdates(!liveUpdates)}
            className={`p-2 rounded-lg transition-colors ${
              liveUpdates 
                ? 'text-green-600 hover:text-green-700 hover:bg-green-50' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
            }`}
            title={liveUpdates ? 'Disable Live Updates' : 'Enable Live Updates'}
          >
            <div className={`w-3 h-3 rounded-full ${liveUpdates ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
          </button>
          <button
            onClick={fetchHistory}
            disabled={loading}
            className="p-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50"
            title="Refresh Now"
          >
            <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onClose}
            className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
            title="Close"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Activity Timeline ({history.length} entries)
              </h3>
              {newEntriesCount > 0 && (
                <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full animate-pulse">
                  +{newEntriesCount} new
                </div>
              )}
            </div>
            
            {history.length === 0 ? (
              <div className="text-center py-8">
                <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No history available for this expense</p>
                <p className="text-xs text-gray-400 mt-2">Expense ID: {expense._id}</p>
                <button
                  onClick={fetchHistory}
                  className="mt-4 text-blue-600 hover:text-blue-800 text-sm underline"
                >
                  Try refreshing
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((entry, index) => {
                  const timestamp = formatTimestamp(entry.timestamp);
                  return (
                    <div key={entry._id} className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className={`w-8 h-8 ${getActionColor(entry.action)} rounded-full flex items-center justify-center`}>
                            {getActionIcon(entry.action)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                            <UserIcon className="w-4 h-4" />
                            <span className="font-medium">{entry.performedByName}</span>
                            <span>•</span>
                            <span>{timestamp.date} {timestamp.time}</span>
                            {entry.relativeTime && (
                              <>
                                <span>•</span>
                                <span className="text-xs">{entry.relativeTime}</span>
                              </>
                            )}
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm text-gray-700 font-medium mb-1">
                              {entry.description}
                            </p>
                            {entry.action === 'updated' && Object.keys(entry.changes).length > 0 && (
                              <div className="mt-2 space-y-1">
                                {Object.entries(entry.changes).map(([field, change]: [string, any]) => (
                                  <div key={field} className="text-xs text-gray-600">
                                    <span className="font-medium">{field}:</span> {change.from} → {change.to}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
