"use client";

import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  ClockIcon,
  CalendarIcon,
  UserIcon,
  PlayIcon,
  StopIcon
} from '@heroicons/react/24/outline';
import { useProjectSync } from '../../../../../services/projectSyncService';

interface TimeEntry {
  _id: string;
  projectId: string;
  description: string;
  hours: number;
  minutes: number;
  date: string;
  billable: boolean;
  hourlyRate?: number;
  createdAt: string;
  updatedAt: string;
}

interface ProjectTimeEntriesProps {
  projectId: string;
  projectName: string;
}

export default function ProjectTimeEntries({ projectId, projectName }: ProjectTimeEntriesProps) {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deletingEntryId, setDeletingEntryId] = useState<string | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerStartTime, setTimerStartTime] = useState<Date | null>(null);
  const [currentTimerDescription, setCurrentTimerDescription] = useState('');
  const { syncTimeEntry } = useProjectSync();

  // Fetch time entries for this project
  const fetchTimeEntries = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${projectId}/time-entries`);
      if (response.ok) {
        const data = await response.json();
        // Ensure we always set an array
        const timeEntriesData = data?.data || data || [];
        setTimeEntries(Array.isArray(timeEntriesData) ? timeEntriesData : []);
      } else {
        console.error('Failed to fetch time entries:', response.status);
        setTimeEntries([]);
      }
    } catch (error) {
      console.error('Error fetching time entries:', error);
      setTimeEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeEntries();
  }, [projectId]);

  // Create time entry
  const handleCreateTimeEntry = async (entryData: Partial<TimeEntry>) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/time-entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...entryData,
          projectId,
        }),
      });

      if (response.ok) {
        const newTimeEntry = await response.json();
        await fetchTimeEntries();
        setShowCreateModal(false);
        // Sync with main application
        syncTimeEntry(newTimeEntry.data || newTimeEntry, projectId);
      }
    } catch (error) {
      console.error('Error creating time entry:', error);
    }
  };

  // Update time entry
  const handleUpdateTimeEntry = async (entryData: Partial<TimeEntry>) => {
    if (!editingEntry) return;

    try {
      const response = await fetch(`/api/projects/${projectId}/time-entries/${editingEntry._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entryData),
      });

      if (response.ok) {
        await fetchTimeEntries();
        setShowEditModal(false);
        setEditingEntry(null);
      }
    } catch (error) {
      console.error('Error updating time entry:', error);
    }
  };

  // Delete time entry
  const handleDeleteTimeEntry = async (entryId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/time-entries/${entryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchTimeEntries();
        setDeletingEntryId(null);
      }
    } catch (error) {
      console.error('Error deleting time entry:', error);
    }
  };

  // Timer functions
  const startTimer = () => {
    if (!currentTimerDescription.trim()) {
      alert('Please enter a description for the timer');
      return;
    }
    setIsTimerRunning(true);
    setTimerStartTime(new Date());
  };

  const stopTimer = async () => {
    if (!timerStartTime) return;

    const endTime = new Date();
    const duration = endTime.getTime() - timerStartTime.getTime();
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0 || minutes > 0) {
      await handleCreateTimeEntry({
        description: currentTimerDescription,
        hours,
        minutes,
        date: new Date().toISOString().split('T')[0],
        billable: true,
      });
    }

    setIsTimerRunning(false);
    setTimerStartTime(null);
    setCurrentTimerDescription('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (hours: number, minutes: number) => {
    if (hours === 0 && minutes === 0) return '0m';
    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  };

  const getTotalTime = () => {
    const totalMinutes = timeEntries.reduce((total, entry) => {
      return total + (entry.hours * 60) + entry.minutes;
    }, 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return { hours, minutes };
  };

  const getBillableTime = () => {
    const billableEntries = timeEntries.filter(entry => entry.billable);
    const totalMinutes = billableEntries.reduce((total, entry) => {
      return total + (entry.hours * 60) + entry.minutes;
    }, 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return { hours, minutes };
  };

  const totalTime = getTotalTime();
  const billableTime = getBillableTime();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Time Entries</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          Add Time Entry
        </button>
      </div>

      {/* Timer Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Timer</h3>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            value={currentTimerDescription}
            onChange={(e) => setCurrentTimerDescription(e.target.value)}
            placeholder="What are you working on?"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isTimerRunning}
          />
          {!isTimerRunning ? (
            <button
              onClick={startTimer}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <PlayIcon className="h-5 w-5" />
              Start Timer
            </button>
          ) : (
            <button
              onClick={stopTimer}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              <StopIcon className="h-5 w-5" />
              Stop Timer
            </button>
          )}
        </div>
        {isTimerRunning && timerStartTime && (
          <div className="mt-4 text-sm text-gray-600">
            Timer running since {timerStartTime.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Time Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Time</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatTime(totalTime.hours, totalTime.minutes)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Billable Time</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatTime(billableTime.hours, billableTime.minutes)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <CalendarIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Entries</p>
              <p className="text-2xl font-semibold text-gray-900">
                {timeEntries.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Time Entries List */}
      {timeEntries.length === 0 ? (
        <div className="text-center py-12">
          <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No time entries yet</h3>
          <p className="text-gray-500 mb-4">Start tracking time for this project</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Time Entry
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Billable
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {timeEntries.map((entry) => (
                  <tr key={entry._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {entry.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTime(entry.hours, entry.minutes)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        entry.billable 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {entry.billable ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(entry.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setEditingEntry(entry);
                            setShowEditModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit Time Entry"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeletingEntryId(entry._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Time Entry"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Time Entry Modal */}
      {showCreateModal && (
        <CreateTimeEntryModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateTimeEntry}
          projectName={projectName}
        />
      )}

      {/* Edit Time Entry Modal */}
      {showEditModal && editingEntry && (
        <CreateTimeEntryModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingEntry(null);
          }}
          onSubmit={handleUpdateTimeEntry}
          projectName={projectName}
          initialData={editingEntry}
          title="Edit Time Entry"
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingEntryId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Time Entry</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this time entry? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeletingEntryId(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteTimeEntry(deletingEntryId)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Create Time Entry Modal Component
interface CreateTimeEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<TimeEntry>) => void;
  projectName: string;
  initialData?: TimeEntry | null;
  title?: string;
}

function CreateTimeEntryModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  projectName, 
  initialData, 
  title = "Add Time Entry" 
}: CreateTimeEntryModalProps) {
  const [formData, setFormData] = useState({
    description: initialData?.description || '',
    hours: initialData?.hours || 0,
    minutes: initialData?.minutes || 0,
    date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    billable: initialData?.billable ?? true,
    hourlyRate: initialData?.hourlyRate || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value 
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="What did you work on?"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hours
              </label>
              <input
                type="number"
                name="hours"
                value={formData.hours}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                max="24"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minutes
              </label>
              <input
                type="number"
                name="minutes"
                value={formData.minutes}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                max="59"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="billable"
                checked={formData.billable}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Billable
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hourly Rate (?)
              </label>
              <input
                type="number"
                name="hourlyRate"
                value={formData.hourlyRate}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {title === "Edit Time Entry" ? "Update Time Entry" : "Add Time Entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
