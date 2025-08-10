import express from "express";
import { authGuard } from "../utils/jwt.js";
import * as tdsController from "../controllers/tdsController.js";

const router = express.Router();

// Get all TDS taxes
router.get("/", authGuard, tdsController.getAllTDS);

// Get active TDS taxes only
router.get("/active", authGuard, tdsController.getActiveTDS);

// Get TDS by ID
router.get("/:id", authGuard, tdsController.getTDSById);

// Create new TDS
router.post("/", authGuard, tdsController.createTDS);

// Update TDS
router.put("/:id", authGuard, tdsController.updateTDS);

// Delete TDS
router.delete("/:id", authGuard, tdsController.deleteTDS);

// Seed default TDS records
router.post("/seed", authGuard, tdsController.seedDefaultTDS);

export default router;
