import { verifyToken } from "../utils/jwt.js";
import Admin from "../models/Admin.js";

// Admin authentication guard
export const adminAuthGuard = async (req, res, next) => {
  try {
    const token =
      req.cookies.admin_session ||
      req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.type !== "admin") {
      return res.status(401).json({ message: "Invalid admin token" });
    }

    // Check if admin exists and is active
    const admin = await Admin.findById(decoded.uid);
    if (!admin || !admin.isActive) {
      return res
        .status(401)
        .json({ message: "Admin account not found or inactive" });
    }

    // Add admin info to request
    req.user = {
      uid: admin._id,
      role: admin.role,
      permissions: admin.permissions,
      email: admin.email,
    };

    next();
  } catch (error) {
    console.error("Admin auth error:", error);
    res.status(401).json({ message: "Authentication failed" });
  }
};

// Super admin guard - only super admins can access
export const superAdminGuard = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (req.user.role !== "super_admin") {
      return res.status(403).json({ message: "Super admin access required" });
    }

    next();
  } catch (error) {
    console.error("Super admin guard error:", error);
    res.status(403).json({ message: "Access denied" });
  }
};

// Admin role guard - check specific admin roles
export const adminRoleGuard = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      next();
    } catch (error) {
      console.error("Admin role guard error:", error);
      res.status(403).json({ message: "Access denied" });
    }
  };
};

// Permission-based access control
export const requirePermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Super admins have all permissions
      if (req.user.role === "super_admin") {
        return next();
      }

      // Check if admin has the required permission
      if (
        !req.user.permissions ||
        !req.user.permissions.includes(requiredPermission)
      ) {
        return res.status(403).json({
          message: `Permission denied: ${requiredPermission} required`,
        });
      }

      next();
    } catch (error) {
      console.error("Permission check error:", error);
      res.status(403).json({ message: "Access denied" });
    }
  };
};

// Multiple permissions check
export const requireAnyPermission = (permissions = []) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Super admins have all permissions
      if (req.user.role === "super_admin") {
        return next();
      }

      // Check if admin has any of the required permissions
      const hasPermission = permissions.some(
        (permission) =>
          req.user.permissions && req.user.permissions.includes(permission)
      );

      if (!hasPermission) {
        return res.status(403).json({
          message: `Permission denied: One of [${permissions.join(
            ", "
          )}] required`,
        });
      }

      next();
    } catch (error) {
      console.error("Multiple permissions check error:", error);
      res.status(403).json({ message: "Access denied" });
    }
  };
};

// Rate limiting for admin endpoints
export const adminRateLimit = (
  maxRequests = 100,
  windowMs = 15 * 60 * 1000
) => {
  const requests = new Map();

  return (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old entries
    if (requests.has(ip)) {
      requests.set(
        ip,
        requests.get(ip).filter((timestamp) => timestamp > windowStart)
      );
    }

    const userRequests = requests.get(ip) || [];

    if (userRequests.length >= maxRequests) {
      return res.status(429).json({
        message: "Too many requests. Please try again later.",
      });
    }

    userRequests.push(now);
    requests.set(ip, userRequests);

    next();
  };
};

// Audit logging middleware
export const adminAuditLog = (action) => {
  return async (req, res, next) => {
    const originalSend = res.send;

    res.send = function (data) {
      // Log admin actions for audit purposes
      const auditData = {
        adminId: req.user?.uid,
        adminEmail: req.user?.email,
        action: action,
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
        timestamp: new Date(),
        statusCode: res.statusCode,
        success: res.statusCode < 400,
      };

      // In production, save to audit log collection
      console.log("Admin Audit:", auditData);

      originalSend.call(this, data);
    };

    next();
  };
};

// Session validation middleware
export const validateAdminSession = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Session validation failed" });
    }

    // Check if admin session is still valid
    const admin = await Admin.findById(req.user.uid);
    if (!admin || !admin.isActive) {
      return res.status(401).json({ message: "Session expired or invalid" });
    }

    // Update last activity
    admin.lastActivity = new Date();
    await admin.save();

    next();
  } catch (error) {
    console.error("Session validation error:", error);
    res.status(401).json({ message: "Session validation failed" });
  }
};

// Permission mapping for common admin actions
export const ADMIN_PERMISSIONS = {
  MANAGE_USERS: "manage_users",
  MANAGE_ADMINS: "manage_admins",
  VIEW_ANALYTICS: "view_analytics",
  MANAGE_CONTENT: "manage_content",
  MANAGE_SETTINGS: "manage_settings",
  VIEW_REPORTS: "view_reports",
  MANAGE_BILLING: "manage_billing",
  MANAGE_SECURITY: "manage_security",
  MANAGE_SYSTEM: "manage_system",
};

// Admin role definitions
export const ADMIN_ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  MODERATOR: "moderator",
};

// Role hierarchy for permission inheritance
export const ROLE_HIERARCHY = {
  super_admin: ["super_admin", "admin", "moderator"],
  admin: ["admin", "moderator"],
  moderator: ["moderator"],
};
