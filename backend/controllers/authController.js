// backend/controllers/authController.js
import RefreshToken from "../models/RefreshToken.js";
import {
  generateAccessToken,
  verifyRefreshToken,
  rotateRefreshToken,
} from "../utils/token.js";

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "lax" : "none",
  maxAge: 7 * 24 * 60 * 60 * 1e3, // 7 days
};

/* ─── LOGIN / SIGNUP already issue tokens ───────────────── */

/**
 * POST /api/auth/refresh-token
 * Returns a fresh access token (and rotates the refresh token).
 */
export const handleRefreshToken = async (req, res) => {
  const oldToken = req.cookies.jid;
  if (!oldToken) return res.status(401).json({ message: "No refresh token" });

  const record = await verifyRefreshToken(oldToken);
  if (!record)
    return res
      .status(401)
      .json({ message: "Invalid or expired refresh token" });

  // Rotate (optional but recommended)
  const newRefresh = await rotateRefreshToken(
    oldToken,
    record.user,
    req.headers["user-agent"]
  );
  res.cookie("jid", newRefresh, COOKIE_OPTS);

  // Issue new access JWT
  const accessToken = generateAccessToken(record.user);
  res.json({ accessToken });
};

/**
 * POST /api/auth/logout
 * Deletes refresh token & cookie.
 */
export const logout = async (req, res) => {
  const token = req.cookies.jid;
  if (token) await RefreshToken.deleteOne({ token });
  res.clearCookie("jid", COOKIE_OPTS);
  res.json({ message: "Logged out" });
};
