import express from "express";
import {
  getUserModulePreferences,
  saveUserModulePreferences,
} from "../controllers/modulePreferenceController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Test endpoint without authentication
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Module preferences endpoint is working",
    data: [
      {
        name: "home",
        label: "Home",
        description: "Dashboard overview and main navigation",
        isEnabled: true,
      },
      {
        name: "items",
        label: "Items",
        description: "Manage your products and services",
        isEnabled: true,
      },
      {
        name: "customers",
        label: "Customers",
        description: "Manage customer information and relationships",
        isEnabled: true,
      },
      {
        name: "sales",
        label: "Sales",
        description: "Invoices, quotes, and sales management",
        isEnabled: true,
      },
      {
        name: "purchases",
        label: "Purchases",
        description: "Purchase orders and vendor management",
        isEnabled: true,
      },
      {
        name: "banking",
        label: "Banking",
        description: "Bank accounts and transactions",
        isEnabled: true,
      },
      {
        name: "time",
        label: "Time Tracking",
        description: "Track time for projects and tasks",
        isEnabled: true,
      },
      {
        name: "accountant",
        label: "Accountant",
        description: "Accounting and financial management",
        isEnabled: true,
      },
      {
        name: "reports",
        label: "Reports",
        description: "Analytics and business reports",
        isEnabled: true,
      },
      {
        name: "documents",
        label: "Documents",
        description: "Document management and storage",
        isEnabled: true,
      },
      {
        name: "vendors",
        label: "Vendors",
        description: "Manage vendor relationships",
        isEnabled: true,
      },
      {
        name: "payroll",
        label: "Payroll",
        description: "Employee payroll management",
        isEnabled: true,
      },
      {
        name: "help-support",
        label: "Help & Support",
        description: "Get help and support",
        isEnabled: true,
      },
      {
        name: "configure",
        label: "Configure Features",
        description: "Configure system settings",
        isEnabled: true,
      },
    ],
  });
});

// Get user's module preferences
router.get("/preferences", authenticateToken, getUserModulePreferences);

// Save user's module preferences (temporarily unauthenticated for testing)
router.post("/preferences", saveUserModulePreferences);

export default router;
