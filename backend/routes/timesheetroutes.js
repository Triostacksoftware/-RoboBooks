import express from "express";
import { authGuard } from "../utils/jwt.js";
import * as ctrl from "../controllers/timesheetcontroller.js";

const router = express.Router();

// Apply authentication to all timesheet routes
router.use(authGuard);

// Basic CRUD operations
router.post("/", ctrl.createTimeEntry);
router.get("/", ctrl.getTimesheets);
router.get("/:id", ctrl.getTimeEntry);
router.put("/:id", ctrl.updateTimeEntry);
router.delete("/:id", ctrl.deleteTimeEntry);

// Timer operations
router.post("/:id/start-timer", ctrl.startTimer);
router.post("/:id/stop-timer", ctrl.stopTimer);

// Statistics
router.get("/stats/overview", ctrl.getTimesheetStats);

// Bulk operations
router.post("/bulk/update", ctrl.bulkUpdate);
router.post("/bulk/delete", ctrl.bulkDelete);

// Export functionality
router.get("/export/csv", ctrl.exportTimesheets);

// Legacy routes for backward compatibility
router.post("/log", ctrl.log);
router.get("/list", ctrl.list);

export default router;
