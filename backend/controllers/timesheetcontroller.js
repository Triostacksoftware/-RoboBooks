import * as TimesheetService from '../services/timesheetservice.js';

export async function log(req, res) {
  try {
    const entry = await TimesheetService.logTime(req.body);
    res.status(201).json(entry);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

export async function list(req, res) {
  try {
    const entries = await TimesheetService.listTimesheets();
    res.json(entries);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}