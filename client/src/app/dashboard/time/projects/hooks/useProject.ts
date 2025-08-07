import { useState, useEffect, useCallback } from 'react';
import { projectApi, ProjectDetails, Task, TimeEntry, Invoice, Expense } from '@/lib/api';

export const useProject = (projectId: string) => {
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectApi.getById(projectId);
      setProject(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch project');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const updateProject = useCallback(async (data: Partial<ProjectDetails>) => {
    try {
      const updated = await projectApi.update(projectId, data);
      setProject(prev => prev ? { ...prev, ...updated } : null);
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project');
      throw err;
    }
  }, [projectId]);

  // Task operations
  const createTask = useCallback(async (taskData: Partial<Task>) => {
    try {
      const newTask = await projectApi.createTask(projectId, taskData);
      setProject(prev => prev ? {
        ...prev,
        tasks: [...prev.tasks, newTask]
      } : null);
      return newTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
      throw err;
    }
  }, [projectId]);

  const updateTask = useCallback(async (taskId: string, taskData: Partial<Task>) => {
    try {
      const updatedTask = await projectApi.updateTask(projectId, taskId, taskData);
      setProject(prev => prev ? {
        ...prev,
        tasks: prev.tasks.map(task => task._id === taskId ? updatedTask : task)
      } : null);
      return updatedTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
      throw err;
    }
  }, [projectId]);

  const deleteTask = useCallback(async (taskId: string) => {
    try {
      await projectApi.deleteTask(projectId, taskId);
      setProject(prev => prev ? {
        ...prev,
        tasks: prev.tasks.filter(task => task._id !== taskId)
      } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
      throw err;
    }
  }, [projectId]);

  // Time entry operations
  const createTimeEntry = useCallback(async (timeEntryData: Partial<TimeEntry>) => {
    try {
      const newTimeEntry = await projectApi.createTimeEntry(projectId, timeEntryData);
      setProject(prev => prev ? {
        ...prev,
        timeEntries: [...prev.timeEntries, newTimeEntry]
      } : null);
      return newTimeEntry;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create time entry');
      throw err;
    }
  }, [projectId]);

  const updateTimeEntry = useCallback(async (timeEntryId: string, timeEntryData: Partial<TimeEntry>) => {
    try {
      const updatedTimeEntry = await projectApi.updateTimeEntry(projectId, timeEntryId, timeEntryData);
      setProject(prev => prev ? {
        ...prev,
        timeEntries: prev.timeEntries.map(entry => entry._id === timeEntryId ? updatedTimeEntry : entry)
      } : null);
      return updatedTimeEntry;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update time entry');
      throw err;
    }
  }, [projectId]);

  const deleteTimeEntry = useCallback(async (timeEntryId: string) => {
    try {
      await projectApi.deleteTimeEntry(projectId, timeEntryId);
      setProject(prev => prev ? {
        ...prev,
        timeEntries: prev.timeEntries.filter(entry => entry._id !== timeEntryId)
      } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete time entry');
      throw err;
    }
  }, [projectId]);

  // Invoice operations
  const createInvoice = useCallback(async (invoiceData: Partial<Invoice>) => {
    try {
      const newInvoice = await projectApi.createInvoice(projectId, invoiceData);
      setProject(prev => prev ? {
        ...prev,
        invoices: [...prev.invoices, newInvoice]
      } : null);
      return newInvoice;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create invoice');
      throw err;
    }
  }, [projectId]);

  const updateInvoice = useCallback(async (invoiceId: string, invoiceData: Partial<Invoice>) => {
    try {
      const updatedInvoice = await projectApi.updateInvoice(projectId, invoiceId, invoiceData);
      setProject(prev => prev ? {
        ...prev,
        invoices: prev.invoices.map(invoice => invoice._id === invoiceId ? updatedInvoice : invoice)
      } : null);
      return updatedInvoice;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update invoice');
      throw err;
    }
  }, [projectId]);

  const deleteInvoice = useCallback(async (invoiceId: string) => {
    try {
      await projectApi.deleteInvoice(projectId, invoiceId);
      setProject(prev => prev ? {
        ...prev,
        invoices: prev.invoices.filter(invoice => invoice._id !== invoiceId)
      } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete invoice');
      throw err;
    }
  }, [projectId]);

  // Expense operations
  const createExpense = useCallback(async (expenseData: Partial<Expense>) => {
    try {
      const newExpense = await projectApi.createExpense(projectId, expenseData);
      setProject(prev => prev ? {
        ...prev,
        expenses: [...prev.expenses, newExpense]
      } : null);
      return newExpense;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create expense');
      throw err;
    }
  }, [projectId]);

  const updateExpense = useCallback(async (expenseId: string, expenseData: Partial<Expense>) => {
    try {
      const updatedExpense = await projectApi.updateExpense(projectId, expenseId, expenseData);
      setProject(prev => prev ? {
        ...prev,
        expenses: prev.expenses.map(expense => expense._id === expenseId ? updatedExpense : expense)
      } : null);
      return updatedExpense;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update expense');
      throw err;
    }
  }, [projectId]);

  const deleteExpense = useCallback(async (expenseId: string) => {
    try {
      await projectApi.deleteExpense(projectId, expenseId);
      setProject(prev => prev ? {
        ...prev,
        expenses: prev.expenses.filter(expense => expense._id !== expenseId)
      } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete expense');
      throw err;
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId, fetchProject]);

  return {
    project,
    loading,
    error,
    refetch: fetchProject,
    updateProject,
    createTask,
    updateTask,
    deleteTask,
    createTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    createExpense,
    updateExpense,
    deleteExpense,
  };
}; 