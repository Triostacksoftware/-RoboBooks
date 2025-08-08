// routes/bankTransactionRoutes.js
import { Router } from "express";
import { authGuard } from "../utils/jwt.js";
import {
  listTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  reconcileTransaction,
  categorizeTransaction,
  deleteTransaction,
  getTransactionCategories,
  getTransactionSummary
} from "../controllers/bankTransactionController.js";

const router = Router();

// Apply authentication to all bank transaction routes
router.use(authGuard);

// Transaction CRUD operations
router.get("/", listTransactions);
router.get("/categories", getTransactionCategories);
router.get("/summary", getTransactionSummary);
router.get("/:id", getTransaction);
router.post("/", createTransaction);
router.put("/:id", updateTransaction);
router.delete("/:id", deleteTransaction);

// Transaction specific operations
router.patch("/:id/reconcile", reconcileTransaction);
router.patch("/:id/categorize", categorizeTransaction);

export default router;
