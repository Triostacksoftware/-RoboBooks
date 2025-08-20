import express from "express";
import multer from "multer";
import {
  getAllAccounts,
  getAllAccountsForDropdown,
  getAccountById,
  getSubAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  getCategories,
  getAccountHierarchy,
  getAccountGroups,
  getParentAccounts,
  bulkUpdateAccounts,
  bulkImportAccounts,
  uploadExcelAccounts,
  exportAccountsToExcel,
  createDefaultAccounts,
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
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'), false);
    }
  }
});

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET /api/chart-of-accounts - Get all accounts
router.get("/", getAllAccounts);

// GET /api/chart-of-accounts/all-for-dropdown - Get all accounts for dropdown
router.get("/all-for-dropdown", getAllAccountsForDropdown);

// GET /api/chart-of-accounts/categories - Get account categories
router.get("/categories", getCategories);

// GET /api/chart-of-accounts/hierarchy - Get account hierarchy
router.get("/hierarchy", getAccountHierarchy);

// GET /api/chart-of-accounts/groups/:accountHead - Get account groups for specific head
router.get("/groups/:accountHead", getAccountGroups);

// GET /api/chart-of-accounts/parent-accounts/:accountGroup - Get parent accounts for specific group
router.get("/parent-accounts/:accountGroup", getParentAccounts);

// GET /api/chart-of-accounts/:id - Get account by ID
router.get("/:id", getAccountById);

// GET /api/chart-of-accounts/:id/sub-accounts - Get sub-accounts
router.get("/:id/sub-accounts", getSubAccounts);

// POST /api/chart-of-accounts - Create new account
router.post("/", createAccount);

// POST /api/chart-of-accounts/create-defaults - Create default accounts
router.post("/create-defaults", createDefaultAccounts);

// POST /api/chart-of-accounts/upload-excel - Upload Excel file
router.post("/upload-excel", upload.single('file'), uploadExcelAccounts);

// POST /api/chart-of-accounts/bulk-update - Bulk update multiple accounts
router.post("/bulk-update", bulkUpdateAccounts);

// POST /api/chart-of-accounts/bulk-import - Bulk import accounts
router.post("/bulk-import", bulkImportAccounts);

// PUT /api/chart-of-accounts/:id - Update account (full update)
router.put("/:id", updateAccount);

// PATCH /api/chart-of-accounts/:id - Update account (partial update - only name, code, description, isActive, currency)
router.patch("/:id", updateAccount);

// DELETE /api/chart-of-accounts/:id - Delete an account (soft delete)
router.delete("/:id", deleteAccount);

// GET /api/chart-of-accounts/export/excel - Export accounts to Excel
router.get("/export/excel", exportAccountsToExcel);

export default router;
