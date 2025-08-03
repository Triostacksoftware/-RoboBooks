import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import mongoose from 'mongoose';
import app from './app.js';

const app = express();

// ── middleware ──────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
  })
);
app.use(express.json());
app.use(cookieParser());

// ── DB ───────────────────────────────────────────────────────
connectDB();
mongoose.connect('mongodb://localhost:27017/robobooks')
  .then(() => app.listen(5000, () => console.log('✅ Server on http://localhost:5000')))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ── routes ───────────────────────────────────────────────────
app.use("/api/auth", authRoutes);

// ── error handler ────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

// ── start ────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;   // 5000 default
app.listen(PORT, () =>
  console.log(`🔑 Auth API running on http://localhost:${PORT}`)
);
