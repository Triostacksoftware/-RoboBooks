import express from "express";
import bankingController from "../controllers/bankingController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(auth);

// Bank Account routes
router.get("/accounts", bankingController.getBankAccounts);
router.post("/accounts", bankingController.createBankAccount);
router.put("/accounts/:id", bankingController.updateBankAccount);
router.delete("/accounts/:id", bankingController.deleteBankAccount);

// Transaction routes
router.get("/transactions", bankingController.getTransactions);
router.get("/transactions/:accountId", bankingController.getTransactions);

// Bank Statement Import routes
router.post("/import/upload", bankingController.uploadStatement);
router.put("/import/:importId/mapping", bankingController.updateFieldMapping);
router.post("/import/:importId/process", bankingController.importTransactions);
router.get("/import/:importId/status", bankingController.getImportStatus);

// Overview routes
router.get("/overview", bankingController.getBankingOverview);

export default router;
