import express from "express";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import { signToken, authGuard } from "../utils/jwt.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

// helper – issue http-only cookie
function issueCookie(res, token) {
  const isProd = process.env.NODE_ENV === "production";
  const isLocalhost =
    process.env.CLIENT_ORIGIN?.includes("localhost") ||
    process.env.FRONTEND_URL?.includes("localhost");

  // For localhost development, use 'lax' instead of 'none' to avoid secure requirement
  const sameSite = isProd ? "strict" : isLocalhost ? "lax" : "none";
  const secure = isProd || (!isLocalhost && sameSite === "none");

  res.cookie("rb_session", token, {
    httpOnly: true,
    sameSite: sameSite,
    secure: secure,
    maxAge: 1000 * 60 * 60 * 24 * 7,
    path: "/",
  });

  console.log("🍪 Cookie set with options:", {
    sameSite,
    secure,
    isProd,
    isLocalhost,
    clientOrigin: process.env.CLIENT_ORIGIN,
    frontendUrl: process.env.FRONTEND_URL,
  });
}

// Validation helper
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePhone(phone) {
  // Remove all non-digit characters and check length
  const cleanPhone = phone.replace(/\D/g, "");
  return cleanPhone.length >= 10 && cleanPhone.length <= 15;
}

// REGISTER
router.post("/register", async (req, res, next) => {
  try {
    const {
      companyName,
      email,
      phoneNumber,
      phoneDialCode,
      phoneIso2,
      password,
      country,
      state,
    } = req.body;
    console.log(phoneNumber);

    // Validation
    if (!companyName?.trim()) {
      return res.status(400).json({ message: "Company name is required" });
    }

    if (!email?.trim()) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!validateEmail(email)) {
      return res
        .status(400)
        .json({ message: "Please enter a valid email address" });
    }

    if (!phoneNumber?.trim()) {
      return res.status(400).json({ message: "Mobile number is required" });
    }

    if (!validatePhone(phoneNumber)) {
      return res
        .status(400)
        .json({ message: "Please enter a valid mobile number" });
    }

    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    // Clean phone number for consistent comparison
    const cleanPhoneNumber = phoneNumber.replace(/\D/g, "");
    console.log(cleanPhoneNumber);
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { phone: cleanPhoneNumber }],
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return res.status(409).json({ message: "Email already registered" });
      } else {
        return res
          .status(409)
          .json({ message: "Phone number already registered" });
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      companyName: companyName.trim(),
      email: email.toLowerCase().trim(),
      phone: cleanPhoneNumber,
      phoneDialCode: phoneDialCode || "+91",
      phoneIso2: phoneIso2 || "IN",
      passwordHash: passwordHash,
      country: country || "India",
      state: state || "Uttar Pradesh",
    });

    // Generate token and set cookie
    const token = signToken({ uid: user._id });
    console.log("🔐 Generated token for new user:", user.email);

    issueCookie(res, token);
    console.log("🍪 Cookie issued for registration");

    // Return user data (without sensitive info)
    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        companyName: user.companyName,
        email: user.email,
        phone: user.phone,
        country: user.country,
        state: user.state,
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      const message =
        field === "email"
          ? "Email already registered"
          : "Phone number already registered";
      return res.status(409).json({ message });
    }
    next(err);
  }
});

// LOGIN (email or phone)
router.post("/login", async (req, res, next) => {
  try {
    const { emailOrPhone, password } = req.body;

    if (!emailOrPhone || !password) {
      return res
        .status(400)
        .json({ message: "Email/phone and password are required" });
    }

    // Find user by email or phone
    const query = emailOrPhone.includes("@")
      ? { email: emailOrPhone.toLowerCase() }
      : { phone: emailOrPhone };

    const user = await User.findOne(query);

    if (!user || !user.passwordHash) {
      return res
        .status(401)
        .json({ message: "Invalid email/phone or password" });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ message: "Account is deactivated" });
    }

    // Verify password
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res
        .status(401)
        .json({ message: "Invalid email/phone or password" });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token and set cookie
    const token = signToken({ uid: user._id });
    console.log("🔐 Generated token for user:", user.email);

    issueCookie(res, token);
    console.log("🍪 Cookie issued for login");

    // Return user data
    res.json({
      success: true,
      user: {
        id: user._id,
        companyName: user.companyName,
        email: user.email,
        phone: user.phone,
        country: user.country,
        state: user.state,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    next(err);
  }
});

// GOOGLE OAuth Login (legacy - keeping for backward compatibility)
router.post("/login/google", async (req, res, next) => {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ message: "idToken required" });

  const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { sub: providerId, email, name } = ticket.getPayload();

    let user = await User.findOne({
      "providers.name": "google",
      "providers.providerId": providerId,
    });

    if (!user) {
      // Check if email already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        // Link Google account to existing user
        existingUser.providers.push({ name: "google", providerId });
        await existingUser.save();
        user = existingUser;
      } else {
        // Create new user
        user = await User.create({
          email: email.toLowerCase(),
          companyName: name || "Google User",
          providers: [{ name: "google", providerId }],
        });
      }
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = signToken({ uid: user._id });
    issueCookie(res, token);

    res.json({
      success: true,
      user: {
        id: user._id,
        companyName: user.companyName,
        email: user.email,
        phone: user.phone,
        country: user.country,
        state: user.state,
      },
    });
  } catch (err) {
    console.error("Google OAuth error:", err);
    next(err);
  }
});

// GOOGLE OAuth Callback (new redirect-based flow)
router.post("/google/callback", async (req, res, next) => {
  const { code, redirectUri, type } = req.body;

  if (!code) {
    return res.status(400).json({ message: "Authorization code required" });
  }

  // Check required environment variables
  if (!process.env.GOOGLE_CLIENT_ID) {
    console.error("❌ Missing GOOGLE_CLIENT_ID environment variable");
    return res.status(500).json({
      success: false,
      message: "Google Client ID not configured on server",
    });
  }

  if (!process.env.GOOGLE_CLIENT_SECRET) {
    console.error("❌ Missing GOOGLE_CLIENT_SECRET environment variable");
    return res.status(500).json({
      success: false,
      message: "Google Client Secret not configured on server",
    });
  }

  console.log("🔍 Debug info:");
  console.log("Code received:", code ? "✅" : "❌");
  console.log("Redirect URI:", redirectUri);
  console.log("Type:", type);
  console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID ? "✅" : "❌");
  console.log(
    "GOOGLE_CLIENT_SECRET:",
    process.env.GOOGLE_CLIENT_SECRET ? "✅" : "❌"
  );

  const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  try {
    console.log("🔄 Exchanging authorization code for tokens...");

    // Exchange authorization code for tokens
    const { tokens } = await client.getToken({
      code,
      redirect_uri: redirectUri,
    });

    console.log("✅ Token exchange successful:", {
      access_token: tokens.access_token ? "✅" : "❌",
      id_token: tokens.id_token ? "✅" : "❌",
    });

    // Verify the ID token
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: providerId, email, name, picture } = payload;

    console.log("✅ Google user info:", { email, name, providerId });

    let user = await User.findOne({
      "providers.name": "google",
      "providers.providerId": providerId,
    });

    if (!user) {
      // Check if email already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        // Link Google account to existing user
        existingUser.providers.push({ name: "google", providerId });
        await existingUser.save();
        user = existingUser;
        console.log("✅ Linked Google account to existing user");
      } else {
        // Create new user
        user = await User.create({
          email: email.toLowerCase(),
          companyName: name || "Google User",
          providers: [{ name: "google", providerId }],
          profilePicture: picture,
        });
        console.log("✅ Created new user with Google account");
      }
    } else {
      console.log("✅ Found existing user with Google account");
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = signToken({ uid: user._id });
    console.log("🔐 Generated token for Google user:", user.email);

    issueCookie(res, token);
    console.log("🍪 Cookie issued for Google login");

    console.log("✅ Authentication successful for user:", user.email);

    res.json({
      success: true,
      user: {
        id: user._id,
        companyName: user.companyName,
        email: user.email,
        phone: user.phone,
        country: user.country,
        state: user.state,
      },
    });
  } catch (err) {
    console.error("❌ Google OAuth callback error:", err);
    console.error("❌ Error details:", {
      message: err.message,
      code: err.code,
      stack: err.stack,
    });
    res.status(500).json({
      success: false,
      message: "Google authentication failed",
    });
  }
});

// SESSION PROBE
router.get("/me", authGuard, async (req, res) => {
  try {
    const user = await User.findById(req.user.uid).lean();
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        companyName: user.companyName,
        email: user.email,
        phone: user.phone,
        country: user.country,
        state: user.state,
      },
    });
  } catch (err) {
    console.error("Session probe error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// LOGOUT
router.post("/logout", (_req, res) => {
  res.clearCookie("rb_session");
  res.json({ success: true, message: "Logged out successfully" });
});

export default router;
