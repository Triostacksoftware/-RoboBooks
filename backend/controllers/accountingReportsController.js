import { getProfitLossReport } from "../services/profitLossService.js";
import {
  getBalanceSheetReport,
  updateBalanceSheetOnGSTRemitted,
} from "../services/balanceSheetService.js";
import mongoose from "mongoose";

/**
 * GET /api/accounting-reports/profit-loss
 * Get Profit & Loss report for a specific date range
 */
export const getProfitLossReportController = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    console.log("User from token:", req.user);

    const userId = req.user._id;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required",
      });
    }

    const reportData = await getProfitLossReport(startDate, endDate, userId);

    res.json({
      success: true,
      data: reportData,
    });
  } catch (error) {
    console.error("Profit & Loss report error:", error);
    res.status(500).json({
      success: false,
      message: "Error generating Profit & Loss report",
      error: error.message,
    });
  }
};

/**
 * GET /api/accounting-reports/balance-sheet
 * Get Balance Sheet report as of a specific date
 */
export const getBalanceSheetReportController = async (req, res) => {
  try {
    const { asOfDate } = req.query;
    const userId = req.user._id;

    if (!asOfDate) {
      return res.status(400).json({
        success: false,
        message: "As of date is required",
      });
    }

    const reportData = await getBalanceSheetReport(asOfDate, userId);

    res.json({
      success: true,
      data: reportData,
    });
  } catch (error) {
    console.error("Balance Sheet report error:", error);
    res.status(500).json({
      success: false,
      message: "Error generating Balance Sheet report",
      error: error.message,
    });
  }
};

/**
 * POST /api/accounting-reports/gst-remittance
 * Record GST remittance and update Balance Sheet
 */
export const recordGSTRemittanceController = async (req, res) => {
  try {
    const { remittedAmount, paymentMethod, remittanceDate, reference } =
      req.body;
    const userId = req.user._id;

    if (!remittedAmount || remittedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Remittance amount is required and must be greater than 0",
      });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Update Balance Sheet for GST remittance
      await updateBalanceSheetOnGSTRemitted(
        remittedAmount,
        paymentMethod,
        session
      );

      await session.commitTransaction();

      res.json({
        success: true,
        message: "GST remittance recorded successfully",
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error("GST remittance error:", error);
    res.status(500).json({
      success: false,
      message: "Error recording GST remittance",
      error: error.message,
    });
  }
};
