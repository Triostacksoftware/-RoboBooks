"use client";

import React, { useState } from "react";
import {
  Clock,
  Plus,
  Calendar,
  List,
  Search,
  Play,
  Square,
  Download,
  Upload,
  Filter,
} from "lucide-react";

interface TimesheetHeaderProps {
  onCreateEntry: () => void;
  onViewModeChange: (mode: string) => void;
  viewMode: string;
  activeTimer: string | null;
  onStartTimer: (entryId: string) => void;
  onStopTimer: () => void;
}

export default function TimesheetHeader({
  onCreateEntry,
  onViewModeChange,
  viewMode,
  activeTimer,
  onStartTimer,
  onStopTimer,
}: TimesheetHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left side - Search and View Mode */}
        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search timesheets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-48"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-md p-0.5">
            <button
              onClick={() => onViewModeChange("list")}
              className={`px-2 py-1 text-xs rounded-sm transition-colors ${
                viewMode === "list"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <List className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onViewModeChange("calendar")}
              className={`px-2 py-1 text-xs rounded-sm transition-colors ${
                viewMode === "calendar"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Timer Controls */}
          {activeTimer && (
            <div className="flex items-center space-x-1">
              <button
                onClick={onStopTimer}
                className="flex items-center space-x-1 px-2 py-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
              >
                <Square className="h-3.5 w-3.5" />
                <span>Stop Timer</span>
              </button>
            </div>
          )}
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-2">
          {/* Import/Export */}
          <div className="flex items-center space-x-1">
            <button className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
              <Upload className="h-3.5 w-3.5" />
              <span>Import</span>
            </button>
            <button className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
              <Download className="h-3.5 w-3.5" />
              <span>Export</span>
            </button>
          </div>

          {/* New Entry Button */}
          <button
            onClick={onCreateEntry}
            className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Log Entry</span>
          </button>
        </div>
      </div>
    </div>
  );
}
