import Admin from "../models/Admin.js";
import { signToken } from "../utils/jwt.js";
import bcrypt from "bcryptjs";
import Account from "../models/Account.js"; // Added import for Account

// Helper function to issue admin cookie
function issueAdminCookie(res, token) {
  const isProd = process.env.NODE_ENV === "production";
  const clientOrigin =
    process.env.CLIENT_ORIGIN || process.env.FRONTEND_URL || "";
  const isLocalhost = clientOrigin.includes("localhost");

  // For localhost development, use 'lax' to avoid secure requirement
  const sameSite = isProd ? "strict" : isLocalhost ? "lax" : "none";
  const secure = isProd || (!isLocalhost && sameSite === "none");

  res.cookie("admin_session", token, {
    httpOnly: true,
    sameSite,
    secure,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  // Optional debug
  console.log("🍪 Admin cookie set:", {
    sameSite,
    secure,
    isProd,
    clientOrigin,
  });
}

// Validation helper
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+?/;
  return emailRegex.test(email);
}

// Admin Login
export const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email?.trim()) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!validateEmail(email)) {
      return res
        .status(400)
        .json({ message: "Please enter a valid email address" });
    }

    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    // Find admin by email
    const admin = await Admin.findOne({ email: email.toLowerCase() });

    if (!admin) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(401).json({ message: "Account is deactivated" });
    }

    // Check if admin has a valid password hash
    if (!admin.passwordHash) {
      console.error(`Admin ${admin.email} has no password hash`);
      return res.status(401).json({
        message: "Account setup incomplete. Please contact administrator.",
      });
    }

    // Verify password using bcrypt
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate token and set cookie
    const token = signToken({
      uid: admin._id,
      role: admin.role,
      type: "admin",
    });
    issueAdminCookie(res, token);

    // Return admin data (without sensitive info)
    res.json({
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
        profileImage: admin.profileImage,
        lastLogin: admin.lastLogin,
      },
    });
  } catch (err) {
    console.error("Admin login error:", err);
    next(err);
  }
};

// Admin Logout
export const adminLogout = (req, res) => {
  res.clearCookie("admin_session");
  res.json({ success: true, message: "Logged out successfully" });
};

// Get Admin Profile
export const getAdminProfile = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.user.uid).select("-passwordHash");

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json({
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
        profileImage: admin.profileImage,
        phone: admin.phone,
        lastLogin: admin.lastLogin,
        createdAt: admin.createdAt,
      },
    });
  } catch (err) {
    console.error("Get admin profile error:", err);
    next(err);
  }
};

// Update Admin Profile
export const updateAdminProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, department } = req.body;

    const admin = await Admin.findById(req.user.uid);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Update fields
    if (firstName) admin.firstName = firstName.trim();
    if (lastName) admin.lastName = lastName.trim();
    if (phone) admin.phone = phone.trim();
    if (department) admin.department = department.trim();

    await admin.save();

    res.json({
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
        profileImage: admin.profileImage,
        phone: admin.phone,
        lastLogin: admin.lastLogin,
      },
    });
  } catch (err) {
    console.error("Update admin profile error:", err);
    next(err);
  }
};

// Change Admin Password
export const changeAdminPassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Current password and new password are required" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "New password must be at least 6 characters" });
    }

    const admin = await Admin.findById(req.user.uid);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Verify current password
    const isCurrentPasswordValid = await admin.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    await admin.hashPassword(newPassword);
    await admin.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.error("Change admin password error:", err);
    next(err);
  }
};

// Get All Admins (Super Admin only)
export const getAllAdmins = async (req, res, next) => {
  try {
    const admins = await Admin.find({})
      .select("-passwordHash")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      admins: admins.map((admin) => ({
        id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        department: admin.department,
        isActive: admin.isActive,
        lastLogin: admin.lastLogin,
        createdAt: admin.createdAt,
      })),
    });
  } catch (err) {
    console.error("Get all admins error:", err);
    next(err);
  }
};

// Create New Admin (Super Admin only)
export const createAdmin = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      role,
      permissions,
      department,
    } = req.body;

    // Validation
    if (
      !firstName?.trim() ||
      !lastName?.trim() ||
      !email?.trim() ||
      !password
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!validateEmail(email)) {
      return res
        .status(400)
        .json({ message: "Please enter a valid email address" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Create new admin
    const admin = new Admin({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      role: role || "admin",
      permissions: permissions || [],
      department: department?.trim(),
    });

    // Hash password
    await admin.hashPassword(password);
    await admin.save();

    res.status(201).json({
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
        createdAt: admin.createdAt,
      },
    });
  } catch (err) {
    console.error("Create admin error:", err);
    if (err.code === 11000) {
      return res.status(409).json({ message: "Email already registered" });
    }
    next(err);
  }
};

// Update Admin (Super Admin only)
export const updateAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, role, permissions, department, isActive } =
      req.body;

    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Update fields
    if (firstName) admin.firstName = firstName.trim();
    if (lastName) admin.lastName = lastName.trim();
    if (role) admin.role = role;
    if (permissions) admin.permissions = permissions;
    if (department !== undefined) admin.department = department?.trim();
    if (typeof isActive === "boolean") admin.isActive = isActive;

    await admin.save();

    res.json({
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
        isActive: admin.isActive,
        lastLogin: admin.lastLogin,
        createdAt: admin.createdAt,
      },
    });
  } catch (err) {
    console.error("Update admin error:", err);
    next(err);
  }
};

// Delete Admin (Super Admin only)
export const deleteAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent deleting self
    if (id === req.user.uid) {
      return res
        .status(400)
        .json({ message: "Cannot delete your own account" });
    }

    const admin = await Admin.findByIdAndDelete(id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json({ success: true, message: "Admin deleted successfully" });
  } catch (err) {
    console.error("Delete admin error:", err);
    next(err);
  }
};

/**
 * GET /api/admin/chart-of-accounts/stats
 * Get chart of accounts statistics for admin dashboard
 */
export const getChartOfAccountsStats = async (req, res) => {
  try {
    // Get total accounts
    const totalAccounts = await Account.countDocuments();

    // Get active accounts
    const activeAccounts = await Account.countDocuments({ is_active: true });

    // Get total balance (sum of all account balances)
    const accounts = await Account.find({ is_active: true });
    const totalBalance = accounts.reduce(
      (sum, account) => sum + (account.balance || 0),
      0
    );

    res.json({
      success: true,
      stats: {
        totalAccounts,
        activeAccounts,
        totalBalance,
      },
    });
  } catch (error) {
    console.error("Error fetching chart of accounts stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch chart of accounts statistics",
    });
  }
};


