import * as ProjectService from '../services/projectservice.js';

// Project CRUD operations
export async function create(req, res) {
  try {
    console.log('📝 Creating project with data:', req.body);
    console.log('📝 User ID:', req.user.uid);
    
    const projectData = { ...req.body, user_id: req.user.uid };
    console.log('📝 Final project data:', projectData);
    
    const project = await ProjectService.createProject(projectData);
    console.log('📝 Project created successfully:', project);
    
    res.status(201).json(project);
  } catch (e) {
    console.error('❌ Error creating project:', e);
    res.status(400).json({ error: e.message });
  }
}

export async function list(req, res) {
  try {
    console.log('📋 ProjectController.list called for user:', req.user.uid);
    const projects = await ProjectService.listProjects(req.user.uid);
    console.log('📋 ProjectController.list returning:', projects.length, 'projects');
    res.json(projects);
  } catch (e) {
    console.error('❌ ProjectController.list error:', e);
    res.status(500).json({ error: e.message });
  }
}

export async function getById(req, res) {
  try {
    const project = await ProjectService.getProjectDetails(req.params.id);
    res.json(project);
  } catch (e) {
    res.status(404).json({ error: e.message });
  }
}

export async function update(req, res) {
  try {
    const project = await ProjectService.updateProject(req.params.id, req.body);
    res.json(project);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

export async function remove(req, res) {
  try {
    await ProjectService.deleteProject(req.params.id);
    res.status(204).send();
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

export async function getStats(req, res) {
  try {
    const stats = await ProjectService.getProjectStats(req.params.id);
    res.json(stats);
  } catch (e) {
    res.status(404).json({ error: e.message });
  }
}

// Get general project statistics
export async function getProjectStats(req, res) {
  try {
    const stats = await ProjectService.getAllProjectStats(req.user.uid);
    res.json(stats);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// Task operations
export async function createTask(req, res) {
  try {
    const taskData = { ...req.body, project_id: req.params.projectId };
    const task = await ProjectService.createTask(taskData);
    res.status(201).json(task);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

export async function getTasks(req, res) {
  try {
    const tasks = await ProjectService.getTasksByProject(req.params.projectId);
    res.json(tasks);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function updateTask(req, res) {
  try {
    const task = await ProjectService.updateTask(req.params.taskId, req.body);
    res.json(task);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

export async function deleteTask(req, res) {
  try {
    await ProjectService.deleteTask(req.params.taskId);
    res.status(204).send();
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

// Time entry operations
export async function createTimeEntry(req, res) {
  try {
    const timeEntryData = { ...req.body, project_id: req.params.projectId };
    const timeEntry = await ProjectService.createTimeEntry(timeEntryData);
    res.status(201).json(timeEntry);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

export async function getTimeEntries(req, res) {
  try {
    const timeEntries = await ProjectService.getTimeEntriesByProject(req.params.projectId);
    res.json(timeEntries);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function updateTimeEntry(req, res) {
  try {
    const timeEntry = await ProjectService.updateTimeEntry(req.params.timeEntryId, req.body);
    res.json(timeEntry);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

export async function deleteTimeEntry(req, res) {
  try {
    await ProjectService.deleteTimeEntry(req.params.timeEntryId);
    res.status(204).send();
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

// Invoice operations
export async function createInvoice(req, res) {
  try {
    const invoiceData = { ...req.body, project_id: req.params.projectId };
    const invoice = await ProjectService.createInvoice(invoiceData);
    res.status(201).json(invoice);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

export async function getInvoices(req, res) {
  try {
    const invoices = await ProjectService.getInvoicesByProject(req.params.projectId);
    res.json(invoices);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function updateInvoice(req, res) {
  try {
    const invoice = await ProjectService.updateInvoice(req.params.invoiceId, req.body);
    res.json(invoice);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

export async function deleteInvoice(req, res) {
  try {
    await ProjectService.deleteInvoice(req.params.invoiceId);
    res.status(204).send();
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

// Expense operations
export async function createExpense(req, res) {
  try {
    const expenseData = { ...req.body, project_id: req.params.projectId };
    const expense = await ProjectService.createExpense(expenseData);
    res.status(201).json(expense);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

export async function getExpenses(req, res) {
  try {
    const expenses = await ProjectService.getExpensesByProject(req.params.projectId);
    res.json(expenses);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function updateExpense(req, res) {
  try {
    const expense = await ProjectService.updateExpense(req.params.expenseId, req.body);
    res.json(expense);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

export async function deleteExpense(req, res) {
  try {
    await ProjectService.deleteExpense(req.params.expenseId);
    res.status(204).send();
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}