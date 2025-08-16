import express from "express";
import * as ctrl from "../controllers/salesOrderController.js";

const router = express.Router();

// CRUD operations - No authentication required
router.get("/", ctrl.getAll);
router.get("/next-number", ctrl.getNextSalesOrderNumber);
router.get("/:id", ctrl.getById);
router.post("/", ctrl.create);
router.put("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);

// Status management
router.patch("/:id/status", ctrl.updateStatus);

// Email functionality
router.post("/:id/send-email", ctrl.sendSalesOrderEmail);

export default router;
