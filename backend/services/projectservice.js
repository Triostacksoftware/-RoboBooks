import Project from "../models/projectmodel.js";
import Task from "../models/task.model.js";
import TimeEntry from "../models/timesheetmodel.js";
import Invoice from "../models/invoicemodel.js";
import Expense from "../models/Expense.js";

// Project CRUD operations
export const createProject = async (data) => {
  console.log("🔧 ProjectService.createProject called with:", data);
  try {
    const project = await Project.create(data);
    console.log("🔧 Project created successfully:", project);
    return project;
  } catch (error) {
    console.error("🔧 Error in createProject:", error);
    throw error;
  }
};
export const listProjects = async (userId) => {
  console.log("🔍 ProjectService.listProjects called with userId:", userId);
  try {
    const projects = await Project.find({ user_id: userId });
    console.log("🔍 Found projects:", projects.length, "projects");
    console.log("🔍 Projects data:", projects);
    return projects;
  } catch (error) {
    console.error("🔍 Error in listProjects:", error);
    throw error;
  }
};
export const getProjectById = (id) => Project.findById(id);
export const updateProject = (id, data) =>
  Project.findByIdAndUpdate(id, data, { new: true });
export const deleteProject = (id) => Project.findByIdAndDelete(id);

// Get project with all related data
export const getProjectDetails = async (projectId) => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new Error("Project not found");
  }

  const [tasks, timeEntries, invoices, expenses] = await Promise.all([
    Task.find({ project_id: projectId }),
    TimeEntry.find({ project_id: projectId }),
    Invoice.find({ project_id: projectId }),
    Expense.find({ project_id: projectId }),
  ]);

  return {
    ...project.toObject(),
    tasks,
    timeEntries,
    invoices,
    expenses,
  };
};

// Task operations
export const createTask = (data) => Task.create(data);
export const getTasksByProject = (projectId) =>
  Task.find({ project_id: projectId });
export const updateTask = (id, data) =>
  Task.findByIdAndUpdate(id, data, { new: true });
export const deleteTask = (id) => Task.findByIdAndDelete(id);

// Time entry operations
export const createTimeEntry = (data) => TimeEntry.create(data);
export const getTimeEntriesByProject = (projectId) =>
  TimeEntry.find({ project_id: projectId });
export const updateTimeEntry = (id, data) =>
  TimeEntry.findByIdAndUpdate(id, data, { new: true });
export const deleteTimeEntry = (id) => TimeEntry.findByIdAndDelete(id);

// Invoice operations
export const createInvoice = (data) => Invoice.create(data);
export const getInvoicesByProject = (projectId) =>
  Invoice.find({ project_id: projectId });
export const updateInvoice = (id, data) =>
  Invoice.findByIdAndUpdate(id, data, { new: true });
export const deleteInvoice = (id) => Invoice.findByIdAndDelete(id);

// Expense operations
export const createExpense = (data) => Expense.create(data);
export const getExpensesByProject = (projectId) =>
  Expense.find({ project_id: projectId });
export const updateExpense = (id, data) =>
  Expense.findByIdAndUpdate(id, data, { new: true });
export const deleteExpense = (id) => Expense.findByIdAndDelete(id);

// Project statistics
export const getProjectStats = async (projectId) => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new Error("Project not found");
  }

  const [tasks, timeEntries, invoices, expenses] = await Promise.all([
    Task.find({ project_id: projectId }),
    TimeEntry.find({ project_id: projectId }),
    Invoice.find({ project_id: projectId }),
    Expense.find({ project_id: projectId }),
  ]);

  const totalEstimatedHours = tasks.reduce(
    (sum, task) => sum + (task.estimatedHours || 0),
    0
  );
  const totalActualHours = tasks.reduce(
    (sum, task) => sum + (task.actualHours || 0),
    0
  );
  const totalTimeEntries = timeEntries.reduce(
    (sum, entry) => sum + (entry.hours || 0),
    0
  );
  const totalInvoiced = invoices.reduce(
    (sum, invoice) => sum + (invoice.amount || 0),
    0
  );
  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + (expense.amount || 0),
    0
  );
  const paidInvoices = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + (inv.amount || 0), 0);

  return {
    totalEstimatedHours,
    totalActualHours,
    totalTimeEntries,
    totalInvoiced,
    totalExpenses,
    paidInvoices,
    netProfit: project.revenue - totalExpenses,
    profitMargin:
      project.revenue > 0
        ? ((project.revenue - totalExpenses) / project.revenue) * 100
        : 0,
  };
};

// Get all project statistics
export const getAllProjectStats = async (userId) => {
  try {
    const [totalProjects, activeProjects, completedProjects, totalHours] =
      await Promise.all([
        Project.countDocuments({ user_id: userId }),
        Project.countDocuments({ user_id: userId, status: "active" }),
        Project.countDocuments({ user_id: userId, status: "completed" }),
        TimeEntry.aggregate([
          { $match: { user: userId } },
          { $group: { _id: null, total: { $sum: "$hours" } } },
        ]),
      ]);

    return {
      total: totalProjects,
      active: activeProjects,
      completed: completedProjects,
      totalHours: totalHours[0]?.total || 0,
    };
  } catch (error) {
    throw new Error(`Failed to get project statistics: ${error.message}`);
  }
};
