import express from "express";
import { authGuard } from "../utils/jwt.js";
import {
  getAuditTrail,
  getEntityAuditTrail,
  getUserActivitySummary,
} from "../services/auditTrailservice.js";

const router = express.Router();

// Apply authentication to all audit trail routes
router.use(authGuard);

/**
 * GET /api/audit-trail
 * Get audit trail with optional filters
 */
router.get("/", async (req, res) => {
  try {
    const {
      user,
      entity,
      action,
      startDate,
      endDate,
      page,
      limit,
    } = req.query;

    const filters = {
      user,
      entity,
      action,
      startDate,
      endDate,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 50,
    };

    const result = await getAuditTrail(filters);
    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Get audit trail error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching audit trail",
      error: error.message,
    });
  }
});

/**
 * GET /api/audit-trail/entity/:entity/:entityId
 * Get audit trail for a specific entity
 */
router.get("/entity/:entity/:entityId", async (req, res) => {
  try {
    const { entity, entityId } = req.params;
    const { page, limit } = req.query;

    const result = await getEntityAuditTrail(
      entity,
      entityId,
      parseInt(page) || 1,
      parseInt(limit) || 50
    );

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Get entity audit trail error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching entity audit trail",
      error: error.message,
    });
  }
});

/**
 * GET /api/audit-trail/user/:userId/summary
 * Get user activity summary
 */
router.get("/user/:userId/summary", async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    // Only allow users to view their own summary or admins to view any
    if (req.user.uid !== userId && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this user's activity",
      });
    }

    const summary = await getUserActivitySummary(
      userId,
      startDate ? new Date(startDate) : null,
      endDate ? new Date(endDate) : null
    );

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error("Get user activity summary error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user activity summary",
      error: error.message,
    });
  }
});

/**
 * GET /api/audit-trail/my-activity
 * Get current user's activity summary
 */
router.get("/my-activity", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const summary = await getUserActivitySummary(
      req.user.uid,
      startDate ? new Date(startDate) : null,
      endDate ? new Date(endDate) : null
    );

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error("Get my activity error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching your activity",
      error: error.message,
    });
  }
});

export default router;


