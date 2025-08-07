import * as TimesheetService from '../services/timesheetservice.js';

// Create a new time entry
export async function createTimeEntry(req, res) {
  try {
    const entry = await TimesheetService.createTimeEntry(req.body);
    res.status(201).json(entry);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Get all timesheets with filtering
export async function getTimesheets(req, res) {
  try {
    const { 
      period, 
      customer, 
      project, 
      user, 
      status, 
      startDate, 
      endDate,
      page = 1,
      limit = 25,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    const filters = {
      period,
      customer,
      project,
      user,
      status,
      startDate,
      endDate
    };

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder
    };

    const result = await TimesheetService.getTimesheets(filters, options);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get a single time entry by ID
export async function getTimeEntry(req, res) {
  try {
    const entry = await TimesheetService.getTimeEntryById(req.params.id);
    if (!entry) {
      return res.status(404).json({ error: 'Time entry not found' });
    }
    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Update a time entry
export async function updateTimeEntry(req, res) {
  try {
    const entry = await TimesheetService.updateTimeEntry(req.params.id, req.body);
    if (!entry) {
      return res.status(404).json({ error: 'Time entry not found' });
    }
    res.json(entry);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Delete a time entry
export async function deleteTimeEntry(req, res) {
  try {
    const result = await TimesheetService.deleteTimeEntry(req.params.id);
    if (!result) {
      return res.status(404).json({ error: 'Time entry not found' });
    }
    res.json({ message: 'Time entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Start timer for a time entry
export async function startTimer(req, res) {
  try {
    const result = await TimesheetService.startTimer(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Stop timer for a time entry
export async function stopTimer(req, res) {
  try {
    const result = await TimesheetService.stopTimer(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Get timesheet statistics
export async function getTimesheetStats(req, res) {
  try {
    const { period, user, project } = req.query;
    const stats = await TimesheetService.getTimesheetStats({ period, user, project });
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Bulk operations
export async function bulkUpdate(req, res) {
  try {
    const { entries } = req.body;
    const result = await TimesheetService.bulkUpdate(entries);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function bulkDelete(req, res) {
  try {
    const { ids } = req.body;
    const result = await TimesheetService.bulkDelete(ids);
    res.json({ message: `${result.deletedCount} entries deleted successfully` });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Export timesheet data
export async function exportTimesheets(req, res) {
  try {
    const { format = 'csv', filters } = req.query;
    const data = await TimesheetService.exportTimesheets(filters, format);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=timesheets.csv');
    res.send(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Legacy function for backward compatibility
export async function log(req, res) {
  return createTimeEntry(req, res);
}

export async function list(req, res) {
  return getTimesheets(req, res);
}