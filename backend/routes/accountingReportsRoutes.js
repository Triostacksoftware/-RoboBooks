import express from "express";
import {
  getProfitLossReportController,
  getBalanceSheetReportController,
  recordGSTRemittanceController,
} from "../controllers/accountingReportsController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(authenticateToken);

// GET /api/accounting-reports/profit-loss
router.get("/profit-loss", getProfitLossReportController);

// GET /api/accounting-reports/balance-sheet
router.get("/balance-sheet", getBalanceSheetReportController);

// POST /api/accounting-reports/gst-remittance
router.post("/gst-remittance", recordGSTRemittanceController);

export default router;
