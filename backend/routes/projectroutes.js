import express from "express";
import * as ctrl from "../controllers/projectcontroller.js";
const router = express.Router();
router.post("/", ctrl.create);
router.get("/", ctrl.list);
export default router;
