import express from "express";
import { authGuard } from "../utils/jwt.js";
import {
  createManualJournal,
  getManualJournals,
  getManualJournal,
  updateManualJournal,
  postManualJournal,
  deleteManualJournal,
  getJournalStats
} from "../controllers/manualJournalController.js";

const router = express.Router();

// Apply authentication to all routes
router.use(authGuard);

// Manual Journal routes
router.post("/", createManualJournal);
router.get("/", getManualJournals);
router.get("/stats", getJournalStats);
router.get("/:id", getManualJournal);
router.put("/:id", updateManualJournal);
router.post("/:id/post", postManualJournal);
router.delete("/:id", deleteManualJournal);

export default router;
