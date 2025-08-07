import express from "express";
import { authGuard } from "../utils/jwt.js";
import * as ctrl from "../controllers/invoicecontroller.js";

const router = express.Router();

// Apply authentication to all invoice routes
router.use(authGuard);

router.post("/", ctrl.create);
router.put("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);

// Status management
router.patch("/:id/status", ctrl.updateStatus);

export default router;
