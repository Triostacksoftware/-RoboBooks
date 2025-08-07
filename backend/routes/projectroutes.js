import express from "express";
import { authGuard } from "../utils/jwt.js";
import * as ctrl from "../controllers/projectcontroller.js";

const router = express.Router();

// Apply authentication to all project routes
router.use(authGuard);

// Project CRUD routes
router.post("/", ctrl.create);
router.get("/", ctrl.list);
router.get("/:id", ctrl.getById);
router.put("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);
router.get("/:id/stats", ctrl.getStats);

// Task routes
router.post("/:projectId/tasks", ctrl.createTask);
router.get("/:projectId/tasks", ctrl.getTasks);
router.put("/:projectId/tasks/:taskId", ctrl.updateTask);
router.delete("/:projectId/tasks/:taskId", ctrl.deleteTask);

// Time entry routes
router.post("/:projectId/time-entries", ctrl.createTimeEntry);
router.get("/:projectId/time-entries", ctrl.getTimeEntries);
router.put("/:projectId/time-entries/:timeEntryId", ctrl.updateTimeEntry);
router.delete("/:projectId/time-entries/:timeEntryId", ctrl.deleteTimeEntry);

// Invoice routes
router.post("/:projectId/invoices", ctrl.createInvoice);
router.get("/:projectId/invoices", ctrl.getInvoices);
router.put("/:projectId/invoices/:invoiceId", ctrl.updateInvoice);
router.delete("/:projectId/invoices/:invoiceId", ctrl.deleteInvoice);

// Expense routes
router.post("/:projectId/expenses", ctrl.createExpense);
router.get("/:projectId/expenses", ctrl.getExpenses);
router.put("/:projectId/expenses/:expenseId", ctrl.updateExpense);
router.delete("/:projectId/expenses/:expenseId", ctrl.deleteExpense);

export default router;
