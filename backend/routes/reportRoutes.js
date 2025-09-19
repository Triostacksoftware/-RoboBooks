import express from "express";
import { authGuard } from "../utils/jwt.js";
import {
  getReports,
  getReportById,
  createReport,
  updateReport,
  deleteReport,
  generateReport,
  toggleFavorite,
  getReportsStats,
} from "../controllers/reportController.js";

const router = express.Router();

// Apply authentication to all routes
router.use(authGuard);

// Get all reports
router.get("/", getReports);

// Get reports statistics (must be before /:id route)
router.get("/stats", getReportsStats);

// Get a single report by ID
router.get("/:id", getReportById);

// Create a new report
router.post("/", createReport);

// Update a report
router.put("/:id", updateReport);

// Delete a report
router.delete("/:id", deleteReport);

// Generate report data
router.post("/:id/generate", generateReport);

// Toggle favorite status
router.patch("/:id/favorite", toggleFavorite);

export default router;


