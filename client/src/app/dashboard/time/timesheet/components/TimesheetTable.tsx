'use client';

import React, { useState } from 'react';
import { 
  Clock, 
  Play, 
  Stop, 
  Edit, 
  Trash2, 
  MoreVertical,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Calendar,
  User,
  Briefcase
} from 'lucide-react';

interface TimesheetTableProps {
  timesheets: any[];
  onEdit: (entry: any) => void;
  onDelete: (entryId: string) => void;
  onStartTimer: (entryId: string) => void;
  onStopTimer: () => void;
  activeTimer: string | null;
  viewMode: string;
}

export default function TimesheetTable({
  timesheets,
  onEdit,
  onDelete,
  onStartTimer,
  onStopTimer,
  activeTimer,
  viewMode
}: TimesheetTableProps) {
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);

  // Ensure timesheets is an array
  const timesheetsArray = Array.isArray(timesheets) ? timesheets : [];

  const handleSelectAll = () => {
    if (selectedEntries.length === timesheetsArray.length) {
      setSelectedEntries([]);
    } else {
      setSelectedEntries(timesheetsArray.map(entry => entry._id));
    }
  };

  const handleSelectEntry = (entryId: string) => {
    setSelectedEntries(prev => 
      prev.includes(entryId) 
        ? prev.filter(id => id !== entryId)
        : [...prev, entryId]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatHours = (hours: number) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}:${minutes.toString().padStart(2, '0')}`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-3.5 w-3.5 text-green-600" />;
      case 'active':
        return <AlertCircle className="h-3.5 w-3.5 text-blue-600" />;
      default:
        return <Clock className="h-3.5 w-3.5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-700 bg-green-50';
      case 'active':
        return 'text-blue-700 bg-blue-50';
      default:
        return 'text-gray-700 bg-gray-50';
    }
  };

  if (viewMode === 'calendar') {
    return <CalendarView timesheets={timesheetsArray} />;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Table Header */}
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={selectedEntries.length === timesheetsArray.length && timesheetsArray.length > 0}
              onChange={handleSelectAll}
              className="h-3.5 w-3.5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <span className="text-xs font-medium text-gray-700">
              {selectedEntries.length} of {timesheetsArray.length} selected
            </span>
          </div>
          
          {selectedEntries.length > 0 && (
            <div className="flex items-center space-x-2">
              <button className="text-xs text-gray-600 hover:text-gray-700 px-2 py-1 rounded-md hover:bg-gray-100">
                Edit Selected
              </button>
              <button className="text-xs text-red-600 hover:text-red-700 px-2 py-1 rounded-md hover:bg-red-50">
                Delete Selected
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">
                <input
                  type="checkbox"
                  checked={selectedEntries.length === timesheetsArray.length && timesheetsArray.length > 0}
                  onChange={handleSelectAll}
                  className="h-3.5 w-3.5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Task</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Project</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">User</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Date</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Hours</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Status</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Billable</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {timesheetsArray.map((entry) => (
              <tr key={entry._id} className="hover:bg-gray-50">
                <td className="px-4 py-2">
                  <input
                    type="checkbox"
                    checked={selectedEntries.includes(entry._id)}
                    onChange={() => handleSelectEntry(entry._id)}
                    className="h-3.5 w-3.5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                </td>
                <td className="px-4 py-2">
                  <div className="max-w-xs">
                    <p className="text-xs font-medium text-gray-900 truncate">{entry.task}</p>
                    {entry.description && (
                      <p className="text-xs text-gray-500 truncate">{entry.description}</p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center space-x-1">
                    <Briefcase className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-xs text-gray-700">{entry.project_name || 'Unknown Project'}</span>
                  </div>
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center space-x-1">
                    <User className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-xs text-gray-700">{entry.user}</span>
                  </div>
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-xs text-gray-700">{formatDate(entry.date)}</span>
                  </div>
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-xs font-medium text-gray-900">{formatHours(entry.hours)}</span>
                  </div>
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(entry.status)}
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(entry.status)}`}>
                      {entry.status}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center space-x-1">
                    <DollarSign className={`h-3.5 w-3.5 ${entry.billable ? 'text-green-600' : 'text-gray-400'}`} />
                    <span className="text-xs text-gray-700">
                      {entry.billable ? 'Yes' : 'No'}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center justify-center space-x-1">
                    {activeTimer === entry._id ? (
                      <button
                        onClick={onStopTimer}
                        className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                        title="Stop Timer"
                      >
                        <Stop className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => onStartTimer(entry._id)}
                        className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
                        title="Start Timer"
                      >
                        <Play className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => onEdit(entry)}
                      className="p-1 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded"
                      title="Edit"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(entry._id)}
                      className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Calendar View Component
function CalendarView({ timesheets }: { timesheets: any[] }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="text-center py-8">
        <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600">Calendar view coming soon</p>
      </div>
    </div>
  );
}
