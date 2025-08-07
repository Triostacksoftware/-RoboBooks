import express from "express";
import { authGuard } from "../utils/jwt.js";
import * as ctrl from "../controllers/timesheetcontroller.js";

const router = express.Router();

// Apply authentication to all timesheet routes
router.use(authGuard);

router.post("/", ctrl.log);
router.get("/", ctrl.list);

export default router;
