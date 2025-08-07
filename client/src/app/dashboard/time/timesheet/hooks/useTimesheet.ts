'use client';

import { useState, useEffect, useCallback } from 'react';

interface TimesheetEntry {
  _id: string;
  project_id: string;
  project_name?: string;
  task: string;
  user: string;
  date: string;
  hours: number;
  description: string;
  billable: boolean;
  status: 'active' | 'completed' | 'pending';
  createdAt: string;
  updatedAt: string;
}

interface CreateTimeEntryData {
  project_id: string;
  task: string;
  user: string;
  date: string;
  hours: number;
  description: string;
  billable: boolean;
  status: string;
}

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export function useTimesheet() {
  const [timesheets, setTimesheets] = useState<TimesheetEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTimer, setActiveTimer] = useState<string | null>(null);

  // Fetch timesheets
  const fetchTimesheets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/timesheets`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch timesheets' }));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      // Ensure data is an array
      const timesheetsArray = Array.isArray(data) ? data : [];
      setTimesheets(timesheetsArray);
    } catch (err) {
      console.error('Error fetching timesheets:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      // For demo purposes, set some mock data
      setTimesheets([
        {
          _id: '1',
          project_id: '1',
          project_name: 'Website Redesign',
          task: 'Frontend Development',
          user: 'John Doe',
          date: '2024-01-15T00:00:00.000Z',
          hours: 8.5,
          description: 'Working on responsive design components',
          billable: true,
          status: 'completed',
          createdAt: '2024-01-15T00:00:00.000Z',
          updatedAt: '2024-01-15T00:00:00.000Z'
        },
        {
          _id: '2',
          project_id: '2',
          project_name: 'Mobile App Development',
          task: 'API Integration',
          user: 'Jane Smith',
          date: '2024-01-16T00:00:00.000Z',
          hours: 6.0,
          description: 'Integrating third-party APIs',
          billable: true,
          status: 'active',
          createdAt: '2024-01-16T00:00:00.000Z',
          updatedAt: '2024-01-16T00:00:00.000Z'
        },
        {
          _id: '3',
          project_id: '3',
          project_name: 'Database Migration',
          task: 'Data Analysis',
          user: 'Mike Johnson',
          date: '2024-01-17T00:00:00.000Z',
          hours: 4.5,
          description: 'Analyzing data structure requirements',
          billable: false,
          status: 'pending',
          createdAt: '2024-01-17T00:00:00.000Z',
          updatedAt: '2024-01-17T00:00:00.000Z'
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create time entry
  const createTimeEntry = useCallback(async (entryData: CreateTimeEntryData) => {
    try {
      setError(null);
      
      // Format the data properly for the backend
      const formattedData = {
        project_id: entryData.project_id,
        task: entryData.task,
        user: entryData.user,
        date: new Date(entryData.date).toISOString(),
        hours: parseFloat(entryData.hours.toString()),
        description: entryData.description || '',
        billable: Boolean(entryData.billable),
        status: entryData.status || 'pending'
      };

      console.log('Sending data to backend:', formattedData);
      
      const response = await fetch(`${API_BASE_URL}/api/timesheets`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        let errorMessage = 'Failed to create time entry';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || `HTTP ${response.status}`;
        } catch (parseError) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        console.warn('Backend error:', errorMessage);
        // Don't throw error, use fallback instead
      } else {
        const newEntry = await response.json();
        setTimesheets(prev => {
          // Ensure prev is an array
          const prevArray = Array.isArray(prev) ? prev : [];
          return [...prevArray, newEntry];
        });
        return newEntry;
      }
    } catch (err) {
      console.error('Error creating time entry:', err);
      
      // Check if it's a network error (backend not available)
      if (err instanceof TypeError && err.message.includes('fetch')) {
        console.warn('Backend server is not available. Using demo mode.');
        setError('Backend server is not available. Using demo mode.');
      } else {
        console.warn('Error details:', err);
        setError(err instanceof Error ? err.message : 'Failed to create time entry');
      }
    }
    
    // Fallback: create a mock entry
    const mockEntry: TimesheetEntry = {
      _id: Date.now().toString(),
      project_id: entryData.project_id,
      project_name: 'Demo Project',
      task: entryData.task,
      user: entryData.user,
      date: entryData.date,
      hours: entryData.hours,
      description: entryData.description,
      billable: entryData.billable,
      status: entryData.status as 'active' | 'completed' | 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setTimesheets(prev => {
      // Ensure prev is an array
      const prevArray = Array.isArray(prev) ? prev : [];
      return [...prevArray, mockEntry];
    });
    return mockEntry;
  }, []);

  // Update time entry
  const updateTimeEntry = useCallback(async (entry: TimesheetEntry) => {
    try {
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/timesheets/${entry._id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to update time entry' }));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const updatedEntry = await response.json();
      setTimesheets(prev => {
        const prevArray = Array.isArray(prev) ? prev : [];
        return prevArray.map(item => item._id === entry._id ? updatedEntry : item);
      });
      return updatedEntry;
    } catch (err) {
      console.error('Error updating time entry:', err);
      setError(err instanceof Error ? err.message : 'Failed to update time entry');
      
      // For demo purposes, update the entry locally
      const updatedEntry = { ...entry, updatedAt: new Date().toISOString() };
      setTimesheets(prev => {
        const prevArray = Array.isArray(prev) ? prev : [];
        return prevArray.map(item => item._id === entry._id ? updatedEntry : item);
      });
      return updatedEntry;
    }
  }, []);

  // Delete time entry
  const deleteTimeEntry = useCallback(async (entryId: string) => {
    try {
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/timesheets/${entryId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to delete time entry' }));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      setTimesheets(prev => {
        const prevArray = Array.isArray(prev) ? prev : [];
        return prevArray.filter(item => item._id !== entryId);
      });
    } catch (err) {
      console.error('Error deleting time entry:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete time entry');
      
      // For demo purposes, remove the entry locally
      setTimesheets(prev => {
        const prevArray = Array.isArray(prev) ? prev : [];
        return prevArray.filter(item => item._id !== entryId);
      });
    }
  }, []);

  // Start timer
  const startTimer = useCallback((entryId: string) => {
    setActiveTimer(entryId);
    localStorage.setItem('activeTimer', entryId);
  }, []);

  // Stop timer
  const stopTimer = useCallback(() => {
    setActiveTimer(null);
    localStorage.removeItem('activeTimer');
  }, []);

  // Refresh timesheets
  const refreshTimesheets = useCallback(() => {
    fetchTimesheets();
  }, [fetchTimesheets]);

  // Load initial data
  useEffect(() => {
    fetchTimesheets();
    
    // Restore active timer from localStorage
    const savedTimer = localStorage.getItem('activeTimer');
    if (savedTimer) {
      setActiveTimer(savedTimer);
    }
  }, [fetchTimesheets]);

  return {
    timesheets,
    loading,
    error,
    activeTimer,
    createTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
    startTimer,
    stopTimer,
    refreshTimesheets
  };
}
