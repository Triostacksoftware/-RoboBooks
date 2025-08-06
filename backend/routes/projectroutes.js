import express from "express";
import { authGuard } from "../utils/jwt.js";
import * as ctrl from "../controllers/projectcontroller.js";

const router = express.Router();

// Apply authentication to all project routes
router.use(authGuard);

router.post("/", ctrl.create);
router.get("/", ctrl.list);

export default router;
