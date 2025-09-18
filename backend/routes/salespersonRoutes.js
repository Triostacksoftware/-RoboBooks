import express from "express";
import {
  createSalespersonController,
  getAllSalespersonsController,
  getActiveSalespersonsController,
  getSalespersonByIdController,
  updateSalespersonController,
  deleteSalespersonController,
  updateSalespersonStatusController,
} from "../controllers/salespersonController.js";

const router = express.Router();

// Create a new salesperson
router.post("/", createSalespersonController);

// Get all salespersons
router.get("/", getAllSalespersonsController);

// Get active salespersons
router.get("/active", getActiveSalespersonsController);

// Get salesperson by ID
router.get("/:id", getSalespersonByIdController);

// Update salesperson
router.put("/:id", updateSalespersonController);

// Delete salesperson
router.delete("/:id", deleteSalespersonController);

// Update salesperson status
router.patch("/:id/status", updateSalespersonStatusController);

export default router;


