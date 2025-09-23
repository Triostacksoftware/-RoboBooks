import express from "express";
import bankingController from "../controllers/bankingController.js";
import auth from "../middleware/auth.js";
import multer from "multer";
import fs from "fs";
import path from "path";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/bank-statements';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.csv', '.xlsx', '.xls', '.pdf', '.ofx', '.qif', '.xml'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV, Excel, PDF, OFX, QIF, and XML files are allowed.'));
    }
  }
});

// Apply authentication middleware to all routes
router.use(auth);

// Bank Account routes
router.get("/accounts", bankingController.getBankAccounts);
router.get("/accounts/:id", bankingController.getBankAccount);
router.post("/accounts", bankingController.createBankAccount);
router.put("/accounts/:id", bankingController.updateBankAccount);
router.delete("/accounts/:id", bankingController.deleteBankAccount);
router.patch("/accounts/:id/sync", bankingController.syncBankAccount);

// Transaction routes
router.get("/transactions", bankingController.getTransactions);
router.get("/transactions/:id", bankingController.getTransaction);
router.post("/transactions", bankingController.createTransaction);
router.put("/transactions/:id", bankingController.updateTransaction);
router.delete("/transactions/:id", bankingController.deleteTransaction);
router.patch("/transactions/:id/reconcile", bankingController.reconcileTransaction);
router.patch("/transactions/:id/categorize", bankingController.categorizeTransaction);
router.get("/transactions/categories", bankingController.getTransactionCategories);
router.get("/transactions/summary", bankingController.getTransactionSummary);

// Bank Statement Import routes
router.post("/import/upload", auth, upload.single('statement'), bankingController.uploadStatement);
router.post("/import-transactions", auth, upload.single('file'), bankingController.importTransactions);
router.put("/import/:importId/mapping", auth, bankingController.updateFieldMapping);
router.post("/import/:importId/process", auth, bankingController.processImportTransactions);
router.get("/import/:importId/status", auth, bankingController.getImportStatus);

// Overview routes
router.get("/overview", bankingController.getBankingOverview);

// Reconciliation routes
router.get("/reconciliations", bankingController.getReconciliations);
router.get("/reconciliations/account/:accountId", bankingController.getAccountReconciliations);
router.post("/reconciliations", bankingController.createReconciliation);
router.post("/reconciliations/:accountId/auto-match", bankingController.autoMatchReconciliation);

export default router;


