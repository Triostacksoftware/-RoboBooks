import express from "express";
import { authGuard } from "../utils/jwt.js";
import {
  createBudget,
  getBudgets,
  getBudget,
  updateBudget,
  activateBudget,
  deleteBudget,
  getBudgetStats,
  updateBudgetActuals
} from "../controllers/budgetController.js";

const router = express.Router();

// Apply authentication to all routes
router.use(authGuard);

// Budget routes
router.post("/", createBudget);
router.get("/", getBudgets);
router.get("/stats", getBudgetStats);
router.get("/:id", getBudget);
router.put("/:id", updateBudget);
router.post("/:id/activate", activateBudget);
router.delete("/:id", deleteBudget);
router.post("/actuals", updateBudgetActuals);

export default router;


