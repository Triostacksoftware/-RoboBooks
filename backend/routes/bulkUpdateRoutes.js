import express from "express";
import { authGuard } from "../utils/jwt.js";
import {
  createBulkUpdate,
  getBulkUpdates,
  getBulkUpdate,
  updateBulkUpdate,
  executeBulkUpdate,
  deleteBulkUpdate,
  getBulkUpdateStats,
  previewBulkUpdate
} from "../controllers/bulkUpdateController.js";

const router = express.Router();

// Apply authentication to all routes
router.use(authGuard);

// Bulk Update routes
router.post("/", createBulkUpdate);
router.get("/", getBulkUpdates);
router.get("/stats", getBulkUpdateStats);
router.get("/:id", getBulkUpdate);
router.put("/:id", updateBulkUpdate);
router.post("/:id/execute", executeBulkUpdate);
router.delete("/:id", deleteBulkUpdate);
router.post("/preview", previewBulkUpdate);

export default router;
