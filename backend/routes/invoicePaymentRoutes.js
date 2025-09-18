import express from "express";
import { recordPayment } from "../services/invoiceservice.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(authenticateToken);

// POST /api/invoice-payments/:id/record-payment
router.post("/:id/record-payment", async (req, res) => {
  try {
    const { id } = req.params;
    const paymentData = req.body;

    const result = await recordPayment(id, paymentData);

    res.json({
      success: true,
      data: result,
      message: "Payment recorded successfully",
    });
  } catch (error) {
    console.error("Error recording payment:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to record payment",
    });
  }
});

export default router;


