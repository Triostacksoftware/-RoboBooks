import express from "express";
import * as ctrl from "../controllers/timesheetcontroller.js";
const router = express.Router();
router.post("/", ctrl.log);
router.get("/", ctrl.list);
export default router;
