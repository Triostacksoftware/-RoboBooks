import express from "express";
import bankingController from "../controllers/bankingController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

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
router.post("/import/upload", bankingController.uploadStatement);
router.put("/import/:importId/mapping", bankingController.updateFieldMapping);
router.post("/import/:importId/process", bankingController.importTransactions);
router.get("/import/:importId/status", bankingController.getImportStatus);

// Overview routes
router.get("/overview", bankingController.getBankingOverview);

export default router;


