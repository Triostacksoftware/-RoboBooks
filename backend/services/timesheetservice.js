import Timesheet from '../models/timesheet.model.js';
export const logTime = (data) => Timesheet.create(data);
export const listTimesheets = () => Timesheet.find();