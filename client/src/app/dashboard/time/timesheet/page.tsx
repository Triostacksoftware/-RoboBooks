"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  Plus,
  Calendar,
  List,
  Filter,
  Search,
  Play,
  Pause,
  Square,
  Edit,
  Trash2,
  Download,
  Upload,
  MoreVertical,
  ChevronDown,
  User,
  Briefcase,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Timer,
} from "lucide-react";
import TimesheetHeader from "./components/TimesheetHeader";
import TimesheetFilters from "./components/TimesheetFilters";
import TimesheetTable from "./components/TimesheetTable";
import NewTimeEntryModal from "./components/NewTimeEntryModal";
import TimerWidget from "./components/TimerWidget";
import TimesheetStats from "./components/TimesheetStats";
import { useTimesheet } from "./hooks/useTimesheet";

export default function TimesheetPage() {
  const [isNewEntryModalOpen, setIsNewEntryModalOpen] = useState(false);
  const [activeTimer, setActiveTimer] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'calendar'
  const [filters, setFilters] = useState({
    period: "all",
    customer: "",
    project: "",
    user: "",
    status: "all",
  });

  const {
    timesheets,
    loading,
    error,
    createTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
    startTimer,
    stopTimer,
    refreshTimesheets,
  } = useTimesheet();

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleStartTimer = (entryId: string) => {
    setActiveTimer(entryId);
    startTimer(entryId);
  };

  const handleStopTimer = () => {
    setActiveTimer(null);
    stopTimer();
  };

  const handleCreateEntry = async (entryData: any) => {
    try {
      await createTimeEntry(entryData);
      setIsNewEntryModalOpen(false);
    } catch (error) {
      console.error("Error creating entry:", error);
      // Error is already handled in the hook
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <TimesheetHeader
        onCreateEntry={() => setIsNewEntryModalOpen(true)}
        onViewModeChange={setViewMode}
        viewMode={viewMode}
        activeTimer={activeTimer}
        onStartTimer={handleStartTimer}
        onStopTimer={handleStopTimer}
      />

      {/* Filters */}
      <TimesheetFilters filters={filters} onFilterChange={handleFilterChange} />

      {/* Timer Widget */}
      {activeTimer && (
        <TimerWidget entryId={activeTimer} onStop={handleStopTimer} />
      )}

      {/* Stats */}
      <TimesheetStats timesheets={timesheets || []} />

      {/* Main Content */}
      <div className="px-4 py-3">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-red-400 mr-2" />
              <span className="text-xs text-red-800">
                Error loading timesheets: {error}
              </span>
            </div>
          </div>
        ) : timesheets.length === 0 ? (
          <div className="text-center py-8">
            <div className="max-w-sm mx-auto">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">
                  Create your first time entry
                </h3>
                <p className="text-xs text-gray-600 mb-4">
                  Log the time spent on project tasks and charge your customers
                  accordingly.
                </p>
                <button
                  onClick={() => setIsNewEntryModalOpen(true)}
                  className="bg-blue-600 text-white px-4 py-1.5 text-xs rounded-md hover:bg-blue-700 transition-colors"
                >
                  LOG TIME
                </button>
              </div>
            </div>
          </div>
        ) : (
          <TimesheetTable
            timesheets={timesheets || []}
            onEdit={updateTimeEntry}
            onDelete={deleteTimeEntry}
            onStartTimer={handleStartTimer}
            onStopTimer={handleStopTimer}
            activeTimer={activeTimer}
            viewMode={viewMode}
          />
        )}
      </div>

      {/* New Entry Modal */}
      <NewTimeEntryModal
        isOpen={isNewEntryModalOpen}
        onClose={() => setIsNewEntryModalOpen(false)}
        onSubmit={handleCreateEntry}
      />
    </div>
  );
}
