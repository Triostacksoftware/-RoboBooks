import express from "express";
import * as ctrl from "../controllers/recurringInvoiceController.js";

const router = express.Router();

// CRUD operations
router.get("/", ctrl.getAll);
router.get("/:id", ctrl.getById);
router.post("/", ctrl.create);
router.put("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);

// Status management
router.patch("/:id/status", ctrl.updateStatus);

// Get generated invoices for a recurring invoice
router.get("/:id/generated-invoices", ctrl.getGeneratedInvoices);

export default router;


