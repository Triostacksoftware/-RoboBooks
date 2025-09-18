
// backend/middleware/auth.js
import { verifyAccessToken } from '../utils/token.js';

/**
 * Authenticate the request.
 * Expects `Authorization: Bearer <accessToken>` header.
 */
export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Auth token missing' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // verifyAccessToken throws if the JWT is invalid/expired
    const payload = verifyAccessToken(token);
    req.user = payload;          // { id, role, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

/**
 * Role-based authorization middleware.
 * Usage: `authorize('admin', 'accountant')`
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthenticated' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
};


