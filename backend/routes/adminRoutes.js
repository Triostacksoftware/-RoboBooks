import express from "express";
import Admin from "../models/Admin.js";
import {
  adminLogin,
  adminLogout,
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  getAllAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
} from "../controllers/adminController.js";
import {
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
  getUserStats,
} from "../controllers/userController.js";
import {
  adminAuthGuard,
  superAdminGuard,
  adminRoleGuard,
  requirePermission,
} from "../middleware/adminAuth.js";

const router = express.Router();

// Public routes
router.post("/login", adminLogin);
router.post("/logout", adminLogout);

// Simple admin creation route (for testing - remove in production)
router.post("/create-simple", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      role = "admin",
      permissions = ["view_analytics"],
      department,
      phone,
      isActive = true,
    } = req.body;

    // Basic validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,     
        message:
          "All fields are required: firstName, lastName, email, password",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Validate role
    const validRoles = ["super_admin", "admin", "moderator"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Must be one of: ${validRoles.join(", ")}`,
      });
    }

    // Validate permissions
    const validPermissions = [
      "manage_users",
      "manage_admins",
      "view_analytics",
      "manage_content",
      "manage_settings",
      "view_reports",
      "manage_billing",
    ];

    if (permissions && Array.isArray(permissions)) {
      const invalidPermissions = permissions.filter(
        (p) => !validPermissions.includes(p)
      );
      if (invalidPermissions.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid permissions: ${invalidPermissions.join(
            ", "
          )}. Valid permissions: ${validPermissions.join(", ")}`,
        });
      }
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: "Admin with this email already exists",
      });
    }

    // Create new admin
    const admin = new Admin({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      role: role,
      permissions: permissions || [],
      department: department?.trim(),
      phone: phone?.trim(),
      isActive: isActive,
    });

    // Hash password
    await admin.hashPassword(password);
    await admin.save();

    res.status(201).json({
      success: true,
      message: "Admin created successfully",
      admin: {
        id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        department: admin.department,
        phone: admin.phone,
        isActive: admin.isActive,
        createdAt: admin.createdAt,
      },
    });
  } catch (err) {
    console.error("Create simple admin error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to create admin",
      error: err.message,
    });
  }
});

// Bulk admin creation endpoint
router.post("/create-bulk", async (req, res) => {
  try {
    const { admins } = req.body;

    if (!Array.isArray(admins) || admins.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Admins array is required and must not be empty",
      });
    }

    const results = [];
    const errors = [];

    for (let i = 0; i < admins.length; i++) {
      const adminData = admins[i];
      try {
        const {
          firstName,
          lastName,
          email,
          password,
          role = "admin",
          permissions = ["view_analytics"],
          department,
          phone,
          isActive = true,
        } = adminData;

        // Basic validation
        if (!firstName || !lastName || !email || !password) {
          errors.push({
            index: i,
            error:
              "All fields are required: firstName, lastName, email, password",
          });
          continue;
        }

        if (password.length < 6) {
          errors.push({
            index: i,
            error: "Password must be at least 6 characters",
          });
          continue;
        }

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({
          email: email.toLowerCase(),
        });
        if (existingAdmin) {
          errors.push({
            index: i,
            error: "Admin with this email already exists",
          });
          continue;
        }

        // Create new admin
        const admin = new Admin({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.toLowerCase().trim(),
          role: role,
          permissions: permissions || [],
          department: department?.trim(),
          phone: phone?.trim(),
          isActive: isActive,
        });

        // Hash password
        await admin.hashPassword(password);
        await admin.save();

        results.push({
          index: i,
          success: true,
          admin: {
            id: admin._id,
            firstName: admin.firstName,
            lastName: admin.lastName,
            fullName: admin.fullName,
            email: admin.email,
            role: admin.role,
            permissions: admin.permissions,
            department: admin.department,
            phone: admin.phone,
            isActive: admin.isActive,
            createdAt: admin.createdAt,
          },
        });
      } catch (err) {
        errors.push({
          index: i,
          error: err.message,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Processed ${admins.length} admins. ${results.length} created successfully, ${errors.length} failed.`,
      results,
      errors,
    });
  } catch (err) {
    console.error("Bulk create admin error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to process bulk admin creation",
      error: err.message,
    });
  }
});

// Protected routes - require admin authentication
router.get("/profile", adminAuthGuard, getAdminProfile);
router.put("/profile", adminAuthGuard, updateAdminProfile);
router.put("/change-password", adminAuthGuard, changeAdminPassword);

// Admin management routes - require super admin
router.get("/admins", adminAuthGuard, superAdminGuard, getAllAdmins);
router.post("/admins", adminAuthGuard, superAdminGuard, createAdmin);
router.put("/admins/:id", adminAuthGuard, superAdminGuard, updateAdmin);
router.delete("/admins/:id", adminAuthGuard, superAdminGuard, deleteAdmin);

// Analytics and dashboard routes
router.get(
  "/dashboard/stats",
  adminAuthGuard,
  requirePermission("view_analytics"),
  async (req, res) => {
    try {
      // Import models for analytics
      const User = (await import("../models/User.js")).default;
      const Invoice = (await import("../models/invoicemodel.js")).default;
      const Project = (await import("../models/projectmodel.js")).default;
      const Timesheet = (await import("../models/timesheetmodel.js")).default;

      // Get basic stats
      const totalUsers = await User.countDocuments();
      const activeUsers = await User.countDocuments({ isActive: true });

      // Get revenue stats (from invoices)
      const totalRevenue = await Invoice.aggregate([
        { $match: { status: "paid" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]);

      // Get monthly growth
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      const currentMonthUsers = await User.countDocuments({
        createdAt: { $gte: thirtyDaysAgo },
      });
      const previousMonthUsers = await User.countDocuments({
        createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
      });

      const monthlyGrowth =
        previousMonthUsers > 0
          ? ((currentMonthUsers - previousMonthUsers) / previousMonthUsers) *
            100
          : 0;

      // Get project stats
      const totalProjects = await Project.countDocuments();
      const activeProjects = await Project.countDocuments({ status: "active" });

      // Get timesheet stats
      const totalHours = await Timesheet.aggregate([
        { $group: { _id: null, total: { $sum: "$hours" } } },
      ]);

      res.json({
        success: true,
        stats: {
          totalUsers,
          activeUsers,
          totalRevenue: totalRevenue[0]?.total || 0,
          monthlyGrowth: Math.round(monthlyGrowth * 100) / 100,
          totalProjects,
          activeProjects,
          totalHours: totalHours[0]?.total || 0,
        },
      });
    } catch (error) {
      console.error("Dashboard stats error:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to fetch dashboard stats" });
    }
  }
);

// User management routes
router.get(
  "/users",
  adminAuthGuard,
  requirePermission("manage_users"),
  getAllUsers
);
router.get(
  "/users/:id",
  adminAuthGuard,
  requirePermission("manage_users"),
  getUserById
);
router.put(
  "/users/:id/status",
  adminAuthGuard,
  requirePermission("manage_users"),
  updateUserStatus
);
router.delete(
  "/users/:id",
  adminAuthGuard,
  requirePermission("manage_users"),
  deleteUser
);
router.get(
  "/users/stats",
  adminAuthGuard,
  requirePermission("view_analytics"),
  getUserStats
);

// Reports routes
router.get(
  "/reports",
  adminAuthGuard,
  requirePermission("view_reports"),
  async (req, res) => {
    try {
      // Mock reports data - in production, this would fetch from a reports collection
      const reports = [
        {
          id: 1,
          name: "User Activity Report",
          type: "Analytics",
          lastGenerated: "2024-01-15",
          status: "completed",
          size: "2.3 MB",
          description: "Detailed user activity and engagement metrics",
        },
        {
          id: 2,
          name: "Revenue Summary",
          type: "Financial",
          lastGenerated: "2024-01-14",
          status: "completed",
          size: "1.8 MB",
          description: "Revenue, expenses, and profit analysis",
        },
        {
          id: 3,
          name: "System Performance",
          type: "Technical",
          lastGenerated: "2024-01-13",
          status: "processing",
          size: "0.5 MB",
          description: "Performance and uptime statistics",
        },
        {
          id: 4,
          name: "Security Audit",
          type: "Security",
          lastGenerated: "2024-01-12",
          status: "completed",
          size: "1.2 MB",
          description: "Security events and access logs",
        },
      ];

      res.json({
        success: true,
        reports,
      });
    } catch (error) {
      console.error("Reports error:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to fetch reports" });
    }
  }
);

// Billing management routes
router.get(
  "/billing",
  adminAuthGuard,
  requirePermission("manage_billing"),
  async (req, res) => {
    try {
      // Mock billing data - in production, this would fetch from billing/subscription collections
      const billingData = {
        subscriptions: [
          {
            id: 1,
            companyName: "TechCorp Inc",
            plan: "Premium",
            amount: 299,
            status: "active",
            nextBilling: "2024-02-15",
            email: "admin@techcorp.com",
          },
          {
            id: 2,
            companyName: "StartupXYZ",
            plan: "Basic",
            amount: 99,
            status: "active",
            nextBilling: "2024-02-20",
            email: "contact@startupxyz.com",
          },
          {
            id: 3,
            companyName: "Enterprise Ltd",
            plan: "Enterprise",
            amount: 599,
            status: "cancelled",
            nextBilling: "2024-02-10",
            email: "info@enterprise.com",
          },
        ],
        invoices: [
          {
            id: "INV-001",
            companyName: "TechCorp Inc",
            amount: 299,
            status: "paid",
            dueDate: "2024-01-15",
            paidDate: "2024-01-14",
          },
          {
            id: "INV-002",
            companyName: "StartupXYZ",
            amount: 99,
            status: "paid",
            dueDate: "2024-01-20",
            paidDate: "2024-01-19",
          },
          {
            id: "INV-003",
            companyName: "Enterprise Ltd",
            amount: 599,
            status: "overdue",
            dueDate: "2024-01-10",
            paidDate: null,
          },
        ],
        payments: [
          {
            id: "PAY-001",
            companyName: "TechCorp Inc",
            amount: 299,
            method: "Credit Card",
            date: "2024-01-14",
          },
          {
            id: "PAY-002",
            companyName: "StartupXYZ",
            amount: 99,
            method: "Bank Transfer",
            date: "2024-01-19",
          },
        ],
      };

      res.json({
        success: true,
        billingData,
      });
    } catch (error) {
      console.error("Billing data error:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to fetch billing data" });
    }
  }
);

// Settings routes
router.get(
  "/settings",
  adminAuthGuard,
  requirePermission("manage_settings"),
  async (req, res) => {
    try {
      // Mock settings data - in production, this would fetch from a settings collection
      const settings = {
        general: {
          siteName: "RoboBooks Admin",
          siteDescription: "Business management platform",
          timezone: "UTC",
          language: "English",
        },
        security: {
          twoFactorAuth: true,
          sessionTimeout: 30,
          passwordPolicy: "strong",
          ipWhitelist: [],
        },
        notifications: {
          emailNotifications: true,
          smsNotifications: false,
          pushNotifications: true,
          reportFrequency: "weekly",
        },
        system: {
          maintenanceMode: false,
          debugMode: false,
          backupFrequency: "daily",
          logRetention: 30,
        },
      };

      res.json({
        success: true,
        settings,
      });
    } catch (error) {
      console.error("Settings error:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to fetch settings" });
    }
  }
);

router.put(
  "/settings",
  adminAuthGuard,
  requirePermission("manage_settings"),
  async (req, res) => {
    try {
      const { settings } = req.body;

      // In production, this would save to a settings collection
      // For now, just return success

      res.json({
        success: true,
        message: "Settings updated successfully",
      });
    } catch (error) {
      console.error("Update settings error:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to update settings" });
    }
  }
);

export default router;
