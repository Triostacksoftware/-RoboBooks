import express from "express";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import { signToken, authGuard } from "../utils/jwt.js";

const router = express.Router();

// helper – issue http-only cookie
function issueCookie(res, token) {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("rb_session", token, {
    httpOnly: true,
    sameSite: isProd ? "strict" : "lax",
    secure: isProd,
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  });
}

// ───────────────────────── REGISTER ─────────────────────────
router.post("/register", async (req, res, next) => {
  try {
    const { email, phone, password } = req.body;
    if (!email && !phone) throw new Error("Email or phone is required");

    const passwordHash = password
      ? await bcrypt.hash(password, 12)
      : undefined;

    const user = await User.create({ email, phone, passwordHash });

    const token = signToken({ uid: user._id });
    issueCookie(res, token);

    res.status(201).json({
      user: { id: user._id, email: user.email, phone: user.phone }
    });
  } catch (err) {
    if (err.code === 11000) err.message = "User already exists";
    next(err);
  }
});

// ───────────────────────── LOGIN (email / phone) ────────────
router.post("/login", async (req, res, next) => {
  try {
    const { emailOrPhone, password } = req.body;
    if (!emailOrPhone || !password) throw new Error("Missing credentials");

    const query = emailOrPhone.includes("@")
      ? { email: emailOrPhone.toLowerCase() }
      : { phone: emailOrPhone };

    const user = await User.findOne(query);
    if (!user || !user.passwordHash) throw new Error("Invalid credentials");

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) throw new Error("Invalid credentials");

    const token = signToken({ uid: user._id });
    issueCookie(res, token);

    res.json({ user: { id: user._id, email: user.email, phone: user.phone } });
  } catch (err) {
    next(err);
  }
});

// ───────────────────────── GOOGLE login ─────────────────────
router.post("/login/google", async (req, res, next) => {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ message: "idToken required" });

  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    const { sub: providerId, email, name } = payload;

    let user = await User.findOne({
      "providers.name": "google",
      "providers.providerId": providerId
    });
    if (!user) {
      user = await User.create({
        email,
        providers: [{ name: "google", providerId }]
      });
    }

    const token = signToken({ uid: user._id });
    issueCookie(res, token);

    res.json({ user: { id: user._id, email: user.email, name } });
  } catch (err) {
    next(err);
  }
});

// ───────────────────────── SESSION probe ────────────────────
router.get("/me", authGuard, async (req, res) => {
  const user = await User.findById(req.user.uid).lean();
  res.json({ user: { id: user._id, email: user.email, phone: user.phone } });
});

// ───────────────────────── LOGOUT ───────────────────────────
router.post("/logout", (_req, res) => {
  res.clearCookie("rb_session");
  res.json({ message: "Logged out" });
});

export default router;
