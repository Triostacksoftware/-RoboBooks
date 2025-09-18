import jwt from "jsonwebtoken";

export function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET || 'fallback-secret-key', { expiresIn: "24h" });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
  } catch (err) {
    throw new Error("Invalid or expired token");
  }
}

export function authGuard(req, res, next) {
  // Debug logging
  console.log("🔐 AuthGuard - All cookies:", req.cookies);
  console.log("🔐 AuthGuard - rb_session cookie:", req.cookies?.rb_session);
  console.log("🔐 AuthGuard - Authorization header:", req.headers.authorization);
  console.log("🔐 AuthGuard - JWT_SECRET exists:", !!process.env.JWT_SECRET);

  // try HTTP-only cookie first, then Bearer header
  const token =
    req.cookies?.rb_session ||
    req.headers.authorization?.replace("Bearer ", "");

  console.log("🔐 AuthGuard - Token found:", !!token);
  console.log("🔐 AuthGuard - Token length:", token ? token.length : 0);

  if (!token) {
    console.log("❌ AuthGuard - No token provided");
    console.log("❌ AuthGuard - Available cookies:", Object.keys(req.cookies || {}));
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ AuthGuard - Token verified, user:", decoded);
    
    // Create a consistent user object structure
    req.user = {
      uid: decoded.uid,
      id: decoded.uid, // For backward compatibility with controllers expecting req.user.id
      role: decoded.role || 'user', // Default role if not specified
      email: decoded.email
    };
    
    next();
  } catch (err) {
    console.log("❌ AuthGuard - Token verification failed:", err.message);
    console.log("❌ AuthGuard - Token preview:", token.substring(0, 20) + "...");
    res.status(401).json({ message: "Invalid or expired token" });
  }
}


