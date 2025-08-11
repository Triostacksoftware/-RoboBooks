import express from "express";
import * as ctrl from "../controllers/deliveryChallanController.js";

const router = express.Router();

// CRUD operations
router.get("/", ctrl.getAll);
router.get("/next-number", ctrl.getNextChallanNumber);
router.get("/:id", ctrl.getById);
router.post("/", ctrl.create);
router.put("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);

// Status management
router.patch("/:id/status", ctrl.updateStatus);
router.patch("/:id/open", ctrl.openChallan);
router.patch("/:id/delivered", ctrl.markDelivered);
router.patch("/:id/returned", ctrl.markReturned);

// Email functionality
router.post("/:id/send-email", ctrl.sendEmail);

// Duplicate functionality
router.post("/:id/duplicate", ctrl.duplicate);

export default router;
