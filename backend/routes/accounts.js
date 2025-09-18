import express from "express";
import {
  getAccounts,
  createAccount,
  updateAccount
} from "../controllers/accountController.js";
import { authGuard } from "../utils/jwt.js";

const router = express.Router();

router.get("/", authGuard, getAccounts);
router.post("/", authGuard, createAccount);
router.put("/:id", authGuard, updateAccount);

export default router;


