import express from "express";
import {
  getTransactions,
  reconcileTransactions
} from "../controllers/bankController.js";
import { authGuard } from "../utils/jwt.js";

const router = express.Router();

router.get("/", authGuard, getTransactions);
router.post("/reconcile", authGuard, reconcileTransactions);

export default router;
