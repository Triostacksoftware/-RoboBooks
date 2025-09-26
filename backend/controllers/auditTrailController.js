import AuditTrailService from "../services/auditTrailservice.js";

// Get audit trail with filters
export const getAuditTrail = async (req, res) => {
  try {
    const {
      action,
      entityType,
      startDate,
      endDate,
      severity,
      status,
      page = 1,
      limit = 50,
    } = req.query;

    const filters = {
      userId: req.user.id,
      action,
      entityType,
      startDate,
      endDate,
      severity,
      status,
      page: parseInt(page),
      limit: parseInt(limit),
    };

    const result = await AuditTrailService.getAuditTrail(filters);

    res.json({
      success: true,
      data: result.auditTrails,
      pagination: {
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalCount: result.totalCount,
        hasNextPage: result.currentPage < result.totalPages,
        hasPrevPage: result.currentPage > 1,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching audit trail:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch audit trail",
      error: error.message,
    });
  }
};

// Get entity-specific audit trail
export const getEntityAuditTrail = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const userId = req.user.id;

    const auditTrail = await AuditTrailService.getEntityAuditTrail(
      entityType,
      entityId,
      userId
    );

    res.json({
      success: true,
      data: auditTrail,
    });
  } catch (error) {
    console.error("Error fetching entity audit trail:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch entity audit trail",
      error: error.message,
    });
  }
};

// Get user activity
export const getUserActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    const activity = await AuditTrailService.getUserActivity(
      userId,
      startDate,
      endDate
    );

    res.json({
      success: true,
      data: activity,
    });
  } catch (error) {
    console.error("Error fetching user activity:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user activity",
      error: error.message,
    });
  }
};

// Get system statistics
export const getSystemStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const stats = await AuditTrailService.getSystemStats(startDate, endDate);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching system stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch system statistics",
      error: error.message,
    });
  }
};

// Get recent activities
export const getRecentActivities = async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const activities = await AuditTrailService.getRecentActivities(
      parseInt(limit)
    );

    res.json({
      success: true,
      data: activities,
    });
  } catch (error) {
    console.error("Error fetching recent activities:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch recent activities",
      error: error.message,
    });
  }
};

// Get audit trail summary
export const getAuditSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = "30d" } = req.query;

    // Calculate date range based on period
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case "7d":
        startDate.setDate(endDate.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(endDate.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(endDate.getDate() - 90);
        break;
      case "1y":
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // Get various statistics
    const [systemStats, userActivity, recentActivities] = await Promise.all([
      AuditTrailService.getSystemStats(startDate, endDate),
      AuditTrailService.getUserActivity(userId, startDate, endDate),
      AuditTrailService.getRecentActivities(10),
    ]);

    // Calculate user-specific stats
    const userStats = {
      totalActions: userActivity.length,
      actionsByType: {},
      actionsByEntity: {},
      errorCount: userActivity.filter((a) => a.metadata?.status === "failure")
        .length,
      warningCount: userActivity.filter((a) => a.metadata?.status === "warning")
        .length,
    };

    userActivity.forEach((activity) => {
      // Count by action type
      userStats.actionsByType[activity.action] =
        (userStats.actionsByType[activity.action] || 0) + 1;

      // Count by entity type
      userStats.actionsByEntity[activity.entityType] =
        (userStats.actionsByEntity[activity.entityType] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        period,
        dateRange: {
          startDate,
          endDate,
        },
        systemStats,
        userStats,
        recentActivities: recentActivities.slice(0, 10),
      },
    });
  } catch (error) {
    console.error("Error fetching audit summary:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch audit summary",
      error: error.message,
    });
  }
};

// Export audit trail
export const exportAuditTrail = async (req, res) => {
  try {
    const {
      action,
      entityType,
      startDate,
      endDate,
      severity,
      status,
      format = "json",
    } = req.query;

    const filters = {
      userId: req.user.id,
      action,
      entityType,
      startDate,
      endDate,
      severity,
      status,
      page: 1,
      limit: 10000, // Large limit for export
    };

    const result = await AuditTrailService.getAuditTrail(filters);

    if (format === "csv") {
      // Convert to CSV
      const csv = convertToCSV(result.auditTrails);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="audit-trail-${
          new Date().toISOString().split("T")[0]
        }.csv"`
      );
      res.send(csv);
    } else {
      // Return JSON
      res.json({
        success: true,
        data: {
          exportedAt: new Date(),
          totalRecords: result.totalCount,
          filters,
          auditTrail: result.auditTrails,
        },
      });
    }
  } catch (error) {
    console.error("Error exporting audit trail:", error);
    res.status(500).json({
      success: false,
      message: "Failed to export audit trail",
      error: error.message,
    });
  }
};

// Helper function to convert audit trail to CSV
const convertToCSV = (auditTrails) => {
  if (!auditTrails || auditTrails.length === 0) return "";

  const headers = [
    "Timestamp",
    "User",
    "Action",
    "Entity Type",
    "Entity Name",
    "Description",
    "Status",
    "Severity",
    "IP Address",
    "User Agent",
  ];

  const csvRows = auditTrails.map((entry) => [
    entry.createdAt.toISOString(),
    entry.userId?.name || "System",
    entry.action,
    entry.entityType,
    entry.entityName || "",
    entry.description,
    entry.metadata?.status || "success",
    entry.severity,
    entry.metadata?.ipAddress || "",
    entry.metadata?.userAgent || "",
  ]);

  const csvContent = [headers, ...csvRows]
    .map((row) =>
      row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");

  return csvContent;
};
