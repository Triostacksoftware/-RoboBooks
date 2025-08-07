import Timesheet from "../models/timesheetmodel.js";
import mongoose from 'mongoose';

// Create a new time entry
export const createTimeEntry = async (data) => {
  const entry = new Timesheet({
    ...data,
    status: data.status || 'pending',
    billable: data.billable !== undefined ? data.billable : true
  });
  return await entry.save();
};

// Get timesheets with filtering and pagination
export const getTimesheets = async (filters = {}, options = {}) => {
  const {
    period,
    customer,
    project,
    user,
    status,
    startDate,
    endDate
  } = filters;

  const {
    page = 1,
    limit = 25,
    sortBy = 'date',
    sortOrder = 'desc'
  } = options;

  // Build query
  const query = {};

  if (user) {
    query.user = { $regex: user, $options: 'i' };
  }

  if (project) {
    query.project_id = project;
  }

  if (status && status !== 'all') {
    query.status = status;
  }

  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  } else if (period) {
    const dateFilter = getDateFilter(period);
    if (dateFilter) {
      query.date = dateFilter;
    }
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Execute query
  const [entries, total] = await Promise.all([
    Timesheet.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('project_id', 'name')
      .lean(),
    Timesheet.countDocuments(query)
  ]);

  return {
    entries,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

// Get a single time entry by ID
export const getTimeEntryById = async (id) => {
  return await Timesheet.findById(id).populate('project_id', 'name');
};

// Update a time entry
export const updateTimeEntry = async (id, data) => {
  return await Timesheet.findByIdAndUpdate(
    id,
    { ...data, updatedAt: Date.now() },
    { new: true }
  ).populate('project_id', 'name');
};

// Delete a time entry
export const deleteTimeEntry = async (id) => {
  return await Timesheet.findByIdAndDelete(id);
};

// Start timer for a time entry
export const startTimer = async (id) => {
  const entry = await Timesheet.findById(id);
  if (!entry) {
    throw new Error('Time entry not found');
  }

  entry.status = 'active';
  entry.timerStartedAt = new Date();
  return await entry.save();
};

// Stop timer for a time entry
export const stopTimer = async (id) => {
  const entry = await Timesheet.findById(id);
  if (!entry) {
    throw new Error('Time entry not found');
  }

  if (entry.timerStartedAt) {
    const elapsedTime = (Date.now() - entry.timerStartedAt.getTime()) / (1000 * 60 * 60); // hours
    entry.hours = (entry.hours || 0) + elapsedTime;
    entry.timerStartedAt = null;
  }

  entry.status = 'completed';
  return await entry.save();
};

// Get timesheet statistics
export const getTimesheetStats = async (filters = {}) => {
  const { period, user, project } = filters;
  
  const query = {};
  
  if (user) {
    query.user = { $regex: user, $options: 'i' };
  }
  
  if (project) {
    query.project_id = project;
  }
  
  if (period) {
    const dateFilter = getDateFilter(period);
    if (dateFilter) {
      query.date = dateFilter;
    }
  }

  const entries = await Timesheet.find(query);

  const stats = {
    totalHours: 0,
    billableHours: 0,
    nonBillableHours: 0,
    totalEntries: entries.length,
    activeEntries: 0,
    completedEntries: 0,
    pendingEntries: 0,
    averageHoursPerEntry: 0,
    topUsers: [],
    topProjects: []
  };

  entries.forEach(entry => {
    const hours = entry.hours || 0;
    stats.totalHours += hours;
    
    if (entry.billable) {
      stats.billableHours += hours;
    } else {
      stats.nonBillableHours += hours;
    }

    if (entry.status === 'active') {
      stats.activeEntries++;
    } else if (entry.status === 'completed') {
      stats.completedEntries++;
    } else if (entry.status === 'pending') {
      stats.pendingEntries++;
    }
  });

  if (stats.totalEntries > 0) {
    stats.averageHoursPerEntry = stats.totalHours / stats.totalEntries;
  }

  // Get top users
  const userStats = await Timesheet.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$user',
        totalHours: { $sum: '$hours' },
        entryCount: { $sum: 1 }
      }
    },
    { $sort: { totalHours: -1 } },
    { $limit: 5 }
  ]);

  stats.topUsers = userStats;

  // Get top projects
  const projectStats = await Timesheet.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$project_id',
        totalHours: { $sum: '$hours' },
        entryCount: { $sum: 1 }
      }
    },
    { $sort: { totalHours: -1 } },
    { $limit: 5 }
  ]);

  stats.topProjects = projectStats;

  return stats;
};

// Bulk update entries
export const bulkUpdate = async (entries) => {
  const operations = entries.map(entry => ({
    updateOne: {
      filter: { _id: entry._id },
      update: { $set: entry }
    }
  }));

  return await Timesheet.bulkWrite(operations);
};

// Bulk delete entries
export const bulkDelete = async (ids) => {
  return await Timesheet.deleteMany({ _id: { $in: ids } });
};

// Export timesheet data
export const exportTimesheets = async (filters = {}, format = 'csv') => {
  const entries = await getTimesheets(filters, { limit: 10000 });
  
  if (format === 'csv') {
    return generateCSV(entries.entries);
  }
  
  return entries.entries;
};

// Helper function to generate date filters
const getDateFilter = (period) => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (period) {
    case 'today':
      return {
        $gte: startOfDay,
        $lt: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)
      };
    case 'yesterday':
      const yesterday = new Date(startOfDay.getTime() - 24 * 60 * 60 * 1000);
      return {
        $gte: yesterday,
        $lt: startOfDay
      };
    case 'this_week':
      const startOfWeek = new Date(startOfDay.getTime() - startOfDay.getDay() * 24 * 60 * 60 * 1000);
      return {
        $gte: startOfWeek,
        $lt: new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000)
      };
    case 'last_week':
      const lastWeekStart = new Date(startOfDay.getTime() - (startOfDay.getDay() + 7) * 24 * 60 * 60 * 1000);
      const lastWeekEnd = new Date(startOfDay.getTime() - startOfDay.getDay() * 24 * 60 * 60 * 1000);
      return {
        $gte: lastWeekStart,
        $lt: lastWeekEnd
      };
    case 'this_month':
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        $gte: startOfMonth,
        $lt: new Date(now.getFullYear(), now.getMonth() + 1, 1)
      };
    case 'last_month':
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        $gte: lastMonthStart,
        $lt: lastMonthEnd
      };
    default:
      return null;
  }
};

// Helper function to generate CSV
const generateCSV = (entries) => {
  const headers = ['Date', 'User', 'Project', 'Task', 'Hours', 'Billable', 'Status', 'Description'];
  const rows = entries.map(entry => [
    new Date(entry.date).toLocaleDateString(),
    entry.user,
    entry.project_id?.name || 'N/A',
    entry.task,
    entry.hours,
    entry.billable ? 'Yes' : 'No',
    entry.status,
    entry.description || ''
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csvContent;
};

// Legacy functions for backward compatibility
export const logTime = createTimeEntry;
export const listTimesheets = () => getTimesheets();
