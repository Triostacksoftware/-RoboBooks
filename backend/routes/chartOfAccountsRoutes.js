import express from "express";
import multer from "multer";
import {
  getAllAccounts,
  getAccountById,
  getSubAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  getCategories,
  getAccountHierarchy,
  bulkUpdateAccounts,
  bulkImportAccounts,
  uploadExcelAccounts,
  exportAccountsToExcel,
} from "../controllers/chartOfAccountsController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.mimetype === "application/vnd.ms-excel" ||
      file.originalname.endsWith(".xlsx") ||
      file.originalname.endsWith(".xls")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only Excel files (.xlsx, .xls) are allowed"));
    }
  },
});

// Test endpoint (no authentication required)
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Chart of Accounts API is working",
    timestamp: new Date().toISOString(),
  });
});

// Apply authentication middleware to all routes except test
router.use(authenticateToken);

// GET /api/chart-of-accounts - Get all accounts with filtering and pagination
router.get("/", getAllAccounts);

// GET /api/chart-of-accounts/categories - Get available categories and subtypes
router.get("/categories", getCategories);

// GET /api/chart-of-accounts/hierarchy - Get accounts organized in hierarchy
router.get("/hierarchy", getAccountHierarchy);

// GET /api/chart-of-accounts/export-excel - Export accounts to Excel file
router.get("/export-excel", exportAccountsToExcel);

// GET /api/chart-of-accounts/:id - Get a specific account by ID
router.get("/:id", getAccountById);

// GET /api/chart-of-accounts/:id/sub-accounts - Get sub-accounts of a specific account
router.get("/:id/sub-accounts", getSubAccounts);

// POST /api/chart-of-accounts - Create a new account
router.post("/", createAccount);

// PUT /api/chart-of-accounts/:id - Update an existing account
router.put("/:id", updateAccount);

// DELETE /api/chart-of-accounts/:id - Delete an account (soft delete)
router.delete("/:id", deleteAccount);

// POST /api/chart-of-accounts/bulk-update - Bulk update multiple accounts
router.post("/bulk-update", bulkUpdateAccounts);

// POST /api/chart-of-accounts/bulk-import - Bulk import multiple accounts
router.post("/bulk-import", bulkImportAccounts);

// POST /api/chart-of-accounts/upload-excel - Upload parsed Excel data and import accounts
router.post("/upload-excel", uploadExcelAccounts);

export default router;
