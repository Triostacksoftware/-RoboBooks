import Timesheet from "../models/timesheetmodel.js";
export const logTime = (data) => Timesheet.create(data);
export const listTimesheets = () => Timesheet.find();
