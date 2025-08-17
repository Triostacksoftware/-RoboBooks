import express from "express";
import {
  getAllAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount,
  getCategories,
  getAccountHierarchy,
  bulkUpdateAccounts,
  bulkImportAccounts,
} from "../controllers/chartOfAccountsController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Apply authentication middleware to all routes

// GET /api/chart-of-accounts - Get all accounts with filtering and pagination
router.get("/", authenticateToken, getAllAccounts);

// GET /api/chart-of-accounts/categories - Get available categories and subtypes
router.get("/categories", authenticateToken, getCategories);

// GET /api/chart-of-accounts/hierarchy - Get accounts organized in hierarchy
router.get("/hierarchy", authenticateToken, getAccountHierarchy);

// GET /api/chart-of-accounts/:id - Get a specific account by ID
router.get("/:id", authenticateToken, getAccountById);

// POST /api/chart-of-accounts - Create a new account
router.post("/", createAccount);

// PUT /api/chart-of-accounts/:id - Update an existing account
router.put("/:id", authenticateToken, updateAccount);

// DELETE /api/chart-of-accounts/:id - Delete an account (soft delete)
router.delete("/:id", authenticateToken, deleteAccount);

// POST /api/chart-of-accounts/bulk-update - Bulk update multiple accounts
router.post("/bulk-update", bulkUpdateAccounts);

// POST /api/chart-of-accounts/bulk-import - Bulk import multiple accounts
router.post("/bulk-import", bulkImportAccounts);

export default router;
