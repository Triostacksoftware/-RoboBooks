import { verifyToken } from "../utils/jwt.js";
import Admin from "../models/Admin.js";

// Admin authentication middleware
export const adminAuthGuard = async (req, res, next) => {
  try {
    const token = req.cookies.admin_session;
    
    if (!token) {
      return res.status(401).json({ message: "Admin authentication required" });
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // Check if it's an admin token
    if (decoded.type !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }

    // Find admin
    const admin = await Admin.findById(decoded.uid).select('-passwordHash');
    if (!admin) {
      return res.status(401).json({ message: "Admin not found" });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(401).json({ message: "Account is deactivated" });
    }

    // Attach admin to request
    req.user = {
      uid: admin._id,
      role: admin.role,
      type: 'admin'
    };
    req.admin = admin;

    next();
  } catch (err) {
    console.error("Admin auth error:", err);
    res.status(401).json({ message: "Authentication failed" });
  }
};

// Super admin authorization middleware
export const superAdminGuard = (req, res, next) => {
  if (!req.user || req.user.role !== 'super_admin') {
    return res.status(403).json({ message: "Super admin access required" });
  }
  next();
};

// Admin role authorization middleware
export const adminRoleGuard = (req, res, next) => {
  if (!req.user || !['super_admin', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

// Permission-based authorization middleware
export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.admin || !req.admin.permissions.includes(permission)) {
      return res.status(403).json({ message: `Permission '${permission}' required` });
    }
    next();
  };
};
