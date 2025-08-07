import express from "express";
import {
  adminLogin,
  adminLogout,
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  getAllAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin
} from "../controllers/adminController.js";
import {
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
  getUserStats
} from "../controllers/userController.js";
import { adminAuthGuard, superAdminGuard, adminRoleGuard, requirePermission } from "../middleware/adminAuth.js";

const router = express.Router();

// Public routes
router.post("/login", adminLogin);
router.post("/logout", adminLogout);

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
router.get("/dashboard/stats", adminAuthGuard, requirePermission('view_analytics'), (req, res) => {
  // Placeholder for dashboard statistics
  res.json({
    success: true,
    stats: {
      totalUsers: 1250,
      activeUsers: 890,
      totalRevenue: 45000,
      monthlyGrowth: 12.5
    }
  });
});

// User management routes
router.get("/users", adminAuthGuard, requirePermission('manage_users'), getAllUsers);
router.get("/users/:id", adminAuthGuard, requirePermission('manage_users'), getUserById);
router.put("/users/:id/status", adminAuthGuard, requirePermission('manage_users'), updateUserStatus);
router.delete("/users/:id", adminAuthGuard, requirePermission('manage_users'), deleteUser);
router.get("/users/stats", adminAuthGuard, requirePermission('view_analytics'), getUserStats);

router.get("/reports", adminAuthGuard, requirePermission('view_reports'), (req, res) => {
  // Placeholder for reports
  res.json({
    success: true,
    reports: []
  });
});

export default router;
