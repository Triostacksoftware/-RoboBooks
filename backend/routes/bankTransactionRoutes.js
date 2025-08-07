// routes/bankTransactionRoutes.js
import { Router } from "express";
import { authGuard } from "../utils/jwt.js";
import {
  listTransactions,
  createTransaction,
  reconcileTransaction,
  deleteTransaction,
} from "../controllers/bankTransactionController.js";

const router = Router();

// Apply authentication to all bank transaction routes
router.use(authGuard);

// All routes now require authentication
router.get("/", listTransactions);
router.post("/", createTransaction);
router.patch("/:id/reconcile", reconcileTransaction);
router.delete("/:id", deleteTransaction);

export default router;
