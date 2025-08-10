import express from "express";
import { authGuard } from "../utils/jwt.js";
import * as tcsController from "../controllers/tcsController.js";

const router = express.Router();

// Get all TCS taxes
router.get("/", authGuard, tcsController.getAllTCS);

// Get active TCS taxes only
router.get("/active", authGuard, tcsController.getActiveTCS);

// Get nature of collection options
router.get(
  "/nature-options",
  authGuard,
  tcsController.getNatureOfCollectionOptions
);

// Get TCS by ID
router.get("/:id", authGuard, tcsController.getTCSById);

// Create new TCS
router.post("/", authGuard, tcsController.createTCS);

// Update TCS
router.put("/:id", authGuard, tcsController.updateTCS);

// Delete TCS
router.delete("/:id", authGuard, tcsController.deleteTCS);

export default router;
