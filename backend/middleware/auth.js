import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { verifyAccessToken } from "../utils/token.js";

/**
 * Authenticate the request.
 * Expects `Authorization: Bearer <accessToken>` header.
 */
export const authenticateToken = (req, res, next) => {
  // Check for token in cookie first, then Authorization header
  const cookieToken = req.cookies?.rb_session;
  const headerToken = req.headers.authorization?.replace("Bearer ", "");
  const token = cookieToken || headerToken;

  console.log("🔐 Auth middleware - Cookies:", req.cookies);
  console.log("🔐 Auth middleware - Cookie token found:", !!cookieToken);
  console.log("🔐 Auth middleware - Header token found:", !!headerToken);
  console.log("🔐 Auth middleware - Final token found:", !!token);

  if (!token) {
    console.log("❌ No token found in cookies or Authorization header");
    return res.status(401).json({ message: "Auth token missing" });
  }

  try {
    // Directly decode JWT using JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token verified, user:", decoded);
    
    // Create consistent user object structure (same as authGuard)
    req.user = {
      id: decoded.uid || decoded.id, // Handle both uid and id formats
      uid: decoded.uid || decoded.id, // Keep uid for backward compatibility
      role: decoded.role || 'user',
      email: decoded.email,
      organization: decoded.organization || new mongoose.Types.ObjectId(), // Use ObjectId for organization
      iat: decoded.iat,
      exp: decoded.exp
    };
    
    next();
  } catch (err) {
    console.log("❌ Token verification failed:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

/**
 * Role-based authorization middleware.
 * Usage: `authorize('admin', 'accountant')`
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthenticated" });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
};

// Default export for backward compatibility
export default authenticateToken;


